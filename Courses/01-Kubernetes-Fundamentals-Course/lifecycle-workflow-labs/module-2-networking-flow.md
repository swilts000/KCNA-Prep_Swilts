# Module 2 — Networking Flow & Service Discovery

## 📚 Related Chapters
- **Chapter 5**: Orchestrating Containers with Kubernetes
- **Chapter 6**: Deploying and Scaling Applications with Kubernetes

## 🎯 Module Goal

Follow a network packet through Kubernetes: how a Pod gets an IP, how a **Service** gives a stable virtual IP in front of ephemeral Pods, and how **CoreDNS** turns names into those IPs. By the end you can explain exactly what happens when one Pod runs `curl http://my-service`.

## ⏱️ Estimated Time
2 – 2.5 hours (all three labs)

## 📋 Prerequisites
- Completed Module 1 (you understand Pod lifecycle)
- A running cluster with a CNI plugin (minikube/kind include one by default)

---

## 🧠 The Big Picture: Three Layers of Connectivity

```
┌──────────────────────────────────────────────────────────────────┐
│                  KUBERNETES NETWORKING FLOW                       │
└──────────────────────────────────────────────────────────────────┘

  LAYER 1 — POD NETWORK (every Pod gets a real, routable IP)
  ┌───────────────┐        ┌───────────────┐
  │ Pod A         │        │ Pod B         │
  │ 10.244.0.5    │◀──────▶│ 10.244.1.9    │   flat network:
  └───────────────┘  CNI   └───────────────┘   every Pod can reach
         assigns IP + routes (bridge/overlay)   every other Pod directly

  LAYER 2 — SERVICE (stable virtual IP in front of changing Pods)
         Pods are mortal; their IPs change. A Service gives one
         durable ClusterIP + DNS name that load-balances to the
         current healthy Pods (its "endpoints").

   client ──▶ Service ClusterIP (10.96.0.50) ──kube-proxy──▶ Pod A / Pod B
                       │
                       └─ EndpointSlice tracks which Pod IPs are Ready

  LAYER 3 — DNS (names instead of IPs)
         CoreDNS resolves  my-service.my-ns.svc.cluster.local  →  10.96.0.50
         so apps never hardcode IPs.
```

**The core problem networking solves:** Pods are **ephemeral** — they die and are replaced with new IPs constantly. You can't point clients at a Pod IP. Services + DNS provide a **stable address** that always routes to the current live Pods.

---
---

# Lab 2.1 — Pod Networking & CNI Basics

## 🧩 Explanation (Read First)

When the kubelet starts a Pod, it calls the **CNI (Container Network Interface)** plugin installed on the node (Calico, Flannel, Cilium, etc.). The CNI plugin:

1. **Allocates an IP** for the Pod from the node's slice of the cluster "Pod CIDR" (e.g. `10.244.0.0/16`).
2. **Creates a virtual network interface** (`eth0`) inside the Pod's network namespace and wires it to the node's network (via a bridge or overlay tunnel).
3. **Programs routes** so the Pod can reach other Pods on any node.

The result is the **Kubernetes network model**: every Pod gets its own IP, and **every Pod can reach every other Pod directly, without NAT**. There are no "port mappings" between Pods like in plain Docker — it's a flat network.

**Why this matters:** Understanding that each Pod has a first-class IP (not a shared host IP) explains why Services are needed (to track those changing IPs) and how NetworkPolicies work (they filter traffic between those IPs — Module 5).

## 🎯 Objectives
- Inspect a Pod's allocated IP and network interface
- Confirm direct Pod-to-Pod reachability (no NAT)
- See the node's Pod CIDR allocation

## 📝 Steps

### Step 1 — Create two Pods and read their IPs

```bash
kubectl run net-a --image=nicolaka/netshoot --command -- sleep 3600
kubectl run net-b --image=nicolaka/netshoot --command -- sleep 3600
kubectl wait --for=condition=Ready pod/net-a pod/net-b --timeout=90s
kubectl get pods -o wide
```

**Expected output:**
```
NAME    READY   STATUS    RESTARTS   AGE   IP            NODE       ...
net-a   1/1     Running   0          20s   10.244.0.20   minikube   ...
net-b   1/1     Running   0          20s   10.244.0.21   minikube   ...
```

**💡** `nicolaka/netshoot` is a troubleshooting image packed with network tools (`ip`, `curl`, `dig`, `nslookup`, `tcpdump`). Each Pod got a distinct IP from the Pod CIDR.

### Step 2 — Inspect the Pod's interface and routes (the CNI's work)

```bash
kubectl exec -it net-a -- ip addr show eth0
```

**Expected output:**
```
3: eth0@if12: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1450 ...
    inet 10.244.0.20/24 brd 10.244.0.255 scope global eth0
```

```bash
kubectl exec -it net-a -- ip route
```

**Expected output:**
```
default via 10.244.0.1 dev eth0
10.244.0.0/24 dev eth0 proto kernel scope link src 10.244.0.20
```

**💡 What you're seeing:** The CNI plugin created `eth0` inside this Pod, gave it `10.244.0.20`, and added a default route via the node's bridge gateway `10.244.0.1`. *You* didn't configure any of this — the CNI did it during Pod startup (Module 1, Stage 2).

### Step 3 — Prove direct Pod-to-Pod connectivity (no NAT)

```bash
B_IP=$(kubectl get pod net-b -o jsonpath='{.status.podIP}')
echo "Pinging net-b at $B_IP from net-a"
kubectl exec -it net-a -- ping -c 3 "$B_IP"
```

**Expected output:**
```
PING 10.244.0.21 ... 
64 bytes from 10.244.0.21: icmp_seq=1 ttl=64 time=0.08 ms
...
3 packets transmitted, 3 received, 0% packet loss
```

**💡 Flow insight:** `net-a` reached `net-b` using its **real Pod IP** directly. No port-forwarding, no NAT. This flat connectivity is the foundation the Service layer is built on.

### Step 4 — See the node's slice of the Pod CIDR

```bash
kubectl get node -o jsonpath='{.items[0].spec.podCIDR}{"\n"}'
```

**Expected output:**
```
10.244.0.0/24
```

**💡** The cluster has a big Pod CIDR (e.g. `/16`); each node gets a smaller slice (e.g. `/24`). The CNI hands out IPs from the local node's slice.

## ✅ Validation
```bash
kubectl exec net-a -- ping -c1 "$(kubectl get pod net-b -o jsonpath='{.status.podIP}')" >/dev/null && echo "Pod-to-Pod OK"
```

## 🧹 Cleanup
Keep `net-a` running — Labs 2.2 and 2.3 use it as a client.
```bash
kubectl delete pod net-b --ignore-not-found
```

## 📌 Key Takeaways
- The **CNI plugin** allocates each Pod's IP and wires its network during startup.
- Kubernetes uses a **flat network**: every Pod reaches every Pod directly, no NAT.
- Each node owns a slice of the cluster Pod CIDR.

---
---

# Lab 2.2 — Services & Virtual IPs

## 🧩 Explanation (Read First)

Pod IPs change constantly as Pods restart and reschedule. A **Service** solves this by providing a **stable virtual IP (ClusterIP)** and name that always routes to the *current* set of healthy Pods matching its label selector.

How it works under the hood:
1. You create a Service with a `selector` (e.g. `app: web`).
2. The **EndpointSlice controller** continuously watches for Pods matching that selector that are **Ready** (remember readiness probes from Lab 1.4!) and records their IPs in an **EndpointSlice**.
3. **kube-proxy** on every node programs the data path (iptables or IPVS rules) so that traffic to the ClusterIP is load-balanced across those endpoint IPs.

Service types, each building on the last:

| Type | Reachable from | Use case |
|------|----------------|----------|
| **ClusterIP** (default) | Inside the cluster only | Internal service-to-service |
| **NodePort** | `<any-node-IP>:<30000-32767>` | Simple external access / dev |
| **LoadBalancer** | External cloud LB IP | Production external access |

**Why this matters:** The Service → EndpointSlice → kube-proxy chain is the single most important networking concept in Kubernetes. "My Service returns no response" almost always means its endpoints are empty — because no Pod is Ready or the selector doesn't match.

## 🎯 Objectives
- Create a Deployment + ClusterIP Service and observe endpoints
- Load-balance across Pods through the virtual IP
- Expose via NodePort and understand the port chain

## 📝 Steps

### Step 1 — Create a backend Deployment

```bash
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: web
        image: hashicorp/http-echo:1.0
        args: ["-text=hello from \$(POD_NAME)"]
        env:
        - name: POD_NAME
          valueFrom:
            fieldRef:
              fieldPath: metadata.name
        ports:
        - containerPort: 5678
EOF
kubectl rollout status deployment/web
```

**💡 Code explanation:** Each replica echoes its own Pod name (injected via the **downward API** `fieldRef`), so when we curl the Service we can *see* load-balancing across different Pods.

### Step 2 — Create a ClusterIP Service

```bash
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Service
metadata:
  name: web-svc
spec:
  type: ClusterIP
  selector:
    app: web
  ports:
  - port: 80          # the Service's port
    targetPort: 5678  # the container's port
EOF
kubectl get svc web-svc
```

**Expected output:**
```
NAME      TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)   AGE
web-svc   ClusterIP   10.96.0.50      <none>        80/TCP    5s
```

**💡 Code explanation:**
- `selector: app=web` — the Service claims all Pods with this label.
- `port: 80` — the virtual IP listens on 80.
- `targetPort: 5678` — traffic is forwarded to container port 5678.

### Step 3 — Inspect the endpoints (the magic link)

```bash
kubectl get endpointslices -l kubernetes.io/service-name=web-svc
kubectl describe endpointslices -l kubernetes.io/service-name=web-svc | grep -A10 Endpoints
```

**Expected output:**
```
Endpoints:
  - Addresses:  10.244.0.30
    Conditions: Ready=true
  - Addresses:  10.244.0.31
    Conditions: Ready=true
  - Addresses:  10.244.0.32
    Conditions: Ready=true
```

**💡 Flow insight:** These are the **current Pod IPs** behind the stable ClusterIP. The EndpointSlice controller populated them because the Pods match `app=web` **and** are `Ready`. If you scaled to 0 or the Pods failed readiness, this list would be empty and the Service would return connection refused.

### Step 4 — Load-balance through the virtual IP

```bash
# Use net-a from Lab 2.1 as the client
for i in 1 2 3 4 5 6; do kubectl exec net-a -- curl -s http://web-svc; echo; done
```

**Expected output (names vary across Pods):**
```
hello from web-6c9d8-abcde
hello from web-6c9d8-fghij
hello from web-6c9d8-klmno
hello from web-6c9d8-abcde
hello from web-6c9d8-fghij
hello from web-6c9d8-klmno
```

**💡** One stable name (`web-svc`), traffic spread across three Pods — that's kube-proxy load-balancing to the EndpointSlice members.

### Step 5 — Expose externally with NodePort

```bash
kubectl patch svc web-svc -p '{"spec":{"type":"NodePort"}}'
kubectl get svc web-svc
```

**Expected output:**
```
NAME      TYPE       CLUSTER-IP    EXTERNAL-IP   PORT(S)        AGE
web-svc   NodePort   10.96.0.50    <none>        80:31852/TCP   2m
```

**💡 The port chain:** `NodePort(31852)` on any node → `Service port(80)` → `targetPort(5678)` on a Pod. On minikube you can reach it:

```bash
minikube service web-svc --url   # prints an externally reachable URL
```

## ✅ Validation
```bash
kubectl get endpointslices -l kubernetes.io/service-name=web-svc -o jsonpath='{.items[0].endpoints[*].addresses[0]}{"\n"}'
# Should list 3 Pod IPs
```
You understand this lab if you can explain why an empty EndpointSlice means a broken Service.

## 🧹 Cleanup
Keep `web` and `web-svc` — Lab 2.3 resolves this Service by DNS.

## 📌 Key Takeaways
- A **Service** is a stable virtual IP/name in front of changing Pod IPs.
- **EndpointSlices** track the *Ready* Pods matching the selector; **kube-proxy** programs the load-balancing.
- ClusterIP (internal) → NodePort (node IP:port) → LoadBalancer (external) build on each other.

---
---

# Lab 2.3 — CoreDNS & Service Discovery

## 🧩 Explanation (Read First)

Apps shouldn't hardcode a ClusterIP like `10.96.0.50` — those can change if a Service is recreated. Instead, Kubernetes runs an in-cluster DNS server, **CoreDNS**, that maps Service names to their ClusterIPs.

Every Service automatically gets a DNS record following this pattern:

```
<service>.<namespace>.svc.cluster.local
```

- From a Pod **in the same namespace**, you can use the short name: `web-svc`.
- From **another namespace**, use `web-svc.default`.
- The fully-qualified name is `web-svc.default.svc.cluster.local`.

How a Pod uses it: the kubelet writes `/etc/resolv.conf` inside every Pod to point at the CoreDNS ClusterIP and to add `search` domains so short names auto-expand. So when your app does `curl http://web-svc`, the resolver asks CoreDNS, gets `10.96.0.50`, and *then* the Service/kube-proxy flow from Lab 2.2 takes over.

**Why this matters:** DNS is the glue of service discovery. "Service works by IP but not by name" points at DNS/CoreDNS; "name resolves but connection fails" points at endpoints/kube-proxy. Knowing which layer failed saves hours.

## 🎯 Objectives
- Resolve a Service by short and fully-qualified name
- Read the Pod's `/etc/resolv.conf` and understand `search` domains
- See how DNS + Service layers combine into one request

## 📝 Steps

### Step 1 — Resolve the Service name

```bash
kubectl exec -it net-a -- nslookup web-svc
```

**Expected output:**
```
Server:    10.96.0.10
Address:   10.96.0.10#53

Name:      web-svc.default.svc.cluster.local
Address:   10.96.0.50
```

**💡 Flow insight:** The resolver (`Server: 10.96.0.10`) is **CoreDNS**. It expanded the short name `web-svc` to the FQDN and returned the Service's **ClusterIP** `10.96.0.50` — exactly the IP you saw in Lab 2.2.

### Step 2 — Inspect how the Pod was configured for DNS

```bash
kubectl exec -it net-a -- cat /etc/resolv.conf
```

**Expected output:**
```
nameserver 10.96.0.10
search default.svc.cluster.local svc.cluster.local cluster.local
options ndots:5
```

**💡 Why short names work:** The `search` list means when you type `web-svc`, the resolver automatically tries `web-svc.default.svc.cluster.local` first. The kubelet wrote this file during Pod startup — another piece of Stage 2.

### Step 3 — Resolve the fully-qualified name explicitly

```bash
kubectl exec -it net-a -- dig +short web-svc.default.svc.cluster.local
```

**Expected output:**
```
10.96.0.50
```

### Step 4 — Watch DNS + Service work together in one call

```bash
kubectl exec -it net-a -- curl -s http://web-svc.default.svc.cluster.local
```

**Expected output:**
```
hello from web-6c9d8-abcde
```

**💡 The complete flow of this single command:**
```
curl web-svc...  ─▶ resolv.conf points to CoreDNS (10.96.0.10)
                 ─▶ CoreDNS returns ClusterIP 10.96.0.50
                 ─▶ kube-proxy rules map 10.96.0.50:80 ─▶ a Ready Pod:5678
                 ─▶ Pod replies "hello from <pod>"
```
That is the entire Kubernetes service-discovery and load-balancing stack in one `curl`.

### Step 5 — Confirm CoreDNS is the one doing this

```bash
kubectl get pods -n kube-system -l k8s-app=kube-dns -o wide
```

**Expected output:**
```
NAME                       READY   STATUS    ...   IP           ...
coredns-5d78c9869d-abcde   1/1     Running   ...   10.244.0.2   ...
```

**💡** CoreDNS itself runs as ordinary Pods in `kube-system`, fronted by the `kube-dns` Service at `10.96.0.10`. It's Kubernetes all the way down.

## ✅ Validation
```bash
kubectl exec net-a -- getent hosts web-svc && echo "DNS resolution OK"
```
You understand this lab if you can trace `curl web-svc` through DNS → Service → Pod.

## 🧹 Cleanup
```bash
kubectl delete pod net-a --ignore-not-found
kubectl delete deployment web --ignore-not-found
kubectl delete svc web-svc --ignore-not-found
```

## 📌 Key Takeaways
- **CoreDNS** maps `<svc>.<ns>.svc.cluster.local` to the Service ClusterIP.
- Each Pod's `/etc/resolv.conf` (written by the kubelet) points at CoreDNS with `search` domains enabling short names.
- A single `curl <service>` exercises DNS **and** the Service/kube-proxy load-balancing path.

---
---

## 🎓 Module 2 Summary

You followed a packet through all three networking layers:

```
Pod IP (CNI) ─▶ Service virtual IP (EndpointSlice + kube-proxy) ─▶ DNS name (CoreDNS)
```

| Lab | Layer | One-line lesson |
|-----|-------|-----------------|
| 2.1 | Pod network | CNI gives each Pod a routable IP; flat network, no NAT |
| 2.2 | Service | Stable virtual IP load-balances to *Ready* endpoints |
| 2.3 | DNS | CoreDNS resolves Service names to ClusterIPs |

**Next:** [Module 3 — Storage Flow & Persistent Data](module-3-storage-flow.md), where Pods get data that survives restarts.
