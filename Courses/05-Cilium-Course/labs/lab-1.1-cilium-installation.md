# Lab 1.1: Installing Cilium and eBPF Basics

## 📚 Related Topics
- Container Network Interface (CNI)
- eBPF (extended Berkeley Packet Filter)
- Kubernetes networking
- Network policies
- Service mesh

## 🎯 Learning Objectives

By the end of this lab, you will be able to:
- Understand eBPF and its role in networking
- Install Cilium as a CNI plugin
- Verify Cilium installation and connectivity
- Understand Cilium architecture
- Use Cilium CLI for troubleshooting
- Monitor network traffic with Hubble

## ⏱️ Estimated Time
60-75 minutes

## 📋 Prerequisites

- Kubernetes cluster (minikube or kind recommended)
- kubectl configured
- Helm 3.x installed
- Basic understanding of Kubernetes networking
- At least 2 CPU cores and 4GB RAM

---

## 🏗️ Cilium Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                  Cilium Architecture                         │
└──────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Kubernetes Node                                            │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Application Pods                                    │  │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐             │  │
│  │  │  Pod 1  │  │  Pod 2  │  │  Pod 3  │             │  │
│  │  └────┬────┘  └────┬────┘  └────┬────┘             │  │
│  └───────┼────────────┼────────────┼──────────────────┘  │
│          │            │            │                      │
│          ▼            ▼            ▼                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Cilium Agent (DaemonSet)                           │  │
│  │  • Network Policy Enforcement                        │  │
│  │  • Load Balancing                                    │  │
│  │  • Service Discovery                                 │  │
│  │  • Network Monitoring (Hubble)                       │  │
│  └───────────────────┬──────────────────────────────────┘  │
│                      │                                      │
│                      ▼                                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Linux Kernel with eBPF                              │  │
│  │  ┌────────────────────────────────────────────────┐ │  │
│  │  │  eBPF Programs                                 │ │  │
│  │  │  • Packet filtering                            │ │  │
│  │  │  • Connection tracking                         │ │  │
│  │  │  • Load balancing                              │ │  │
│  │  │  • Network monitoring                          │ │  │
│  │  └────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
│                      │                                      │
│                      ▼                                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Network Interface (eth0, etc.)                      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

External Components:
  ┌──────────────────┐
  │ Cilium Operator  │ ← Manages Cilium resources
  └──────────────────┘
  
  ┌──────────────────┐
  │ Hubble Relay     │ ← Aggregates network flows
  └──────────────────┘
  
  ┌──────────────────┐
  │ Hubble UI        │ ← Visualizes network traffic
  └──────────────────┘
```

**Key Components:**
- **Cilium Agent**: Runs on each node (DaemonSet)
- **eBPF Programs**: Kernel-level packet processing
- **Cilium Operator**: Manages cluster-wide resources
- **Hubble**: Network observability platform

---

## 📝 Part 1: Understanding eBPF

### Step 1.1: What is eBPF?

**eBPF (extended Berkeley Packet Filter)** allows running sandboxed programs in the Linux kernel without changing kernel source code.

**Traditional vs eBPF Networking:**
```
┌─────────────────────────────────────────────────────────┐
│ Traditional (iptables)                                  │
├─────────────────────────────────────────────────────────┤
│ Packet → Kernel → iptables rules → Decision            │
│ • Linear rule processing                               │
│ • Performance degrades with more rules                 │
│ • Limited visibility                                   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ eBPF-based (Cilium)                                     │
├─────────────────────────────────────────────────────────┤
│ Packet → eBPF Program → Decision (in kernel)           │
│ • Hash-based lookups (O(1))                            │
│ • Constant performance                                 │
│ • Deep visibility and monitoring                       │
└─────────────────────────────────────────────────────────┘
```

**💡 eBPF Benefits:**
- **Performance**: Kernel-level processing
- **Scalability**: Efficient data structures
- **Visibility**: Deep network insights
- **Security**: Sandboxed execution

### Step 1.2: Cilium vs Traditional CNI

```
┌─────────────────────────────────────────────────────────┐
│ Feature         │ Traditional CNI  │ Cilium (eBPF)    │
├─────────────────────────────────────────────────────────┤
│ Data Plane      │ iptables         │ eBPF             │
│ Performance     │ Degrades         │ Constant         │
│ L7 Policies     │ No               │ Yes              │
│ Observability   │ Limited          │ Hubble           │
│ Service Mesh    │ Requires sidecar │ Built-in         │
│ Encryption      │ External         │ Transparent      │
└─────────────────────────────────────────────────────────┘
```

---

## 📝 Part 2: Installing Cilium

### Step 2.1: Create Cluster Without CNI

**Using minikube:**
```bash
# Create cluster without default CNI
minikube start --network-plugin=cni --cni=false
```

**Expected Output:**
```
😄  minikube v1.32.0 on Darwin 14.0
✨  Using the docker driver
👍  Starting control plane node minikube in cluster minikube
🚜  Pulling base image ...
🔥  Creating docker container (CPUs=2, Memory=4096MB) ...
🐳  Preparing Kubernetes v1.28.3 on Docker 24.0.7 ...
🔗  Configuring CNI (Container Network Interface) ...
🔎  Verifying Kubernetes components...
🌟  Enabled addons: storage-provisioner, default-storageclass
🏄  Done! kubectl is now configured to use "minikube" cluster
```

**Using kind:**
```bash
# Create kind config without CNI
cat <<EOF > kind-config.yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
networking:
  disableDefaultCNI: true
  podSubnet: "10.244.0.0/16"
nodes:
- role: control-plane
- role: worker
- role: worker
EOF

# Create cluster
kind create cluster --config kind-config.yaml --name cilium-cluster
```

**Expected Output:**
```
Creating cluster "cilium-cluster" ...
 ✓ Ensuring node image (kindest/node:v1.28.0) 🖼
 ✓ Preparing nodes 📦 📦 📦
 ✓ Writing configuration 📜
 ✓ Starting control-plane 🕹️
 ✓ Installing StorageClass 💾
 ✓ Joining worker nodes 🚜
Set kubectl context to "kind-cilium-cluster"
```

### Step 2.2: Verify Nodes are NotReady

```bash
# Check node status
kubectl get nodes
```

**Expected Output:**
```
NAME                           STATUS     ROLES           AGE   VERSION
cilium-cluster-control-plane   NotReady   control-plane   1m    v1.28.0
cilium-cluster-worker          NotReady   <none>          1m    v1.28.0
cilium-cluster-worker2         NotReady   <none>          1m    v1.28.0
```

**💡 Nodes are NotReady because there's no CNI plugin yet!**

```bash
# Check pods - CoreDNS will be pending
kubectl get pods -n kube-system
```

**Expected Output:**
```
NAME                                                   READY   STATUS    RESTARTS   AGE
coredns-5dd5756b68-xxxxx                              0/1     Pending   0          2m
coredns-5dd5756b68-yyyyy                              0/1     Pending   0          2m
```

### Step 2.3: Install Cilium CLI

**macOS:**
```bash
# Install Cilium CLI
brew install cilium-cli
```

**Linux:**
```bash
# Download and install Cilium CLI
CILIUM_CLI_VERSION=$(curl -s https://raw.githubusercontent.com/cilium/cilium-cli/main/stable.txt)
CLI_ARCH=amd64
curl -L --fail --remote-name-all https://github.com/cilium/cilium-cli/releases/download/${CILIUM_CLI_VERSION}/cilium-linux-${CLI_ARCH}.tar.gz{,.sha256sum}
sha256sum --check cilium-linux-${CLI_ARCH}.tar.gz.sha256sum
sudo tar xzvfC cilium-linux-${CLI_ARCH}.tar.gz /usr/local/bin
rm cilium-linux-${CLI_ARCH}.tar.gz{,.sha256sum}
```

**Verify installation:**
```bash
cilium version --client
```

**Expected Output:**
```
cilium-cli: v0.15.10
```

### Step 2.4: Install Cilium

```bash
# Install Cilium using CLI
cilium install --version 1.14.4
```

**Expected Output:**
```
🔮 Auto-detected Kubernetes kind: kind
✨ Running "kind" validation checks
✅ Detected kind version "0.20.0"
ℹ️  Using Cilium version 1.14.4
🔮 Auto-detected cluster name: kind-cilium-cluster
🔮 Auto-detected datapath mode: tunnel
🔮 Auto-detected kube-proxy has been installed
ℹ️  Cilium will fully replace all functionalities of kube-proxy
♻️  Restarting unmanaged pods...
♻️  Restarted unmanaged pod kube-system/coredns-5dd5756b68-xxxxx
♻️  Restarted unmanaged pod kube-system/coredns-5dd5756b68-yyyyy
⌛ Waiting for Cilium to be installed and ready...
✅ Cilium was successfully installed! Run 'cilium status' to view installation health
```

**💡 What Happened:**
- Installed Cilium as DaemonSet
- Installed Cilium Operator
- Configured eBPF programs
- Restarted CoreDNS pods to get IPs

**Alternative: Install with Helm**
```bash
# Add Cilium Helm repository
helm repo add cilium https://helm.cilium.io/
helm repo update

# Install Cilium
helm install cilium cilium/cilium \
  --version 1.14.4 \
  --namespace kube-system \
  --set operator.replicas=1
```

---

## 📝 Part 3: Verifying Cilium Installation

### Step 3.1: Check Cilium Status

```bash
# Check Cilium status
cilium status --wait
```

**Expected Output:**
```
    /¯¯\
 /¯¯\__/¯¯\    Cilium:             OK
 \__/¯¯\__/    Operator:           OK
 /¯¯\__/¯¯\    Envoy DaemonSet:    disabled (using embedded mode)
 \__/¯¯\__/    Hubble Relay:       disabled
    \__/       ClusterMesh:        disabled

Deployment        cilium-operator    Desired: 1, Ready: 1/1, Available: 1/1
DaemonSet         cilium             Desired: 3, Ready: 3/3, Available: 3/3
Containers:       cilium             Running: 3
                  cilium-operator    Running: 1
Cluster Pods:     3/3 managed by Cilium
Image versions    cilium             quay.io/cilium/cilium:v1.14.4@sha256:...: 3
                  cilium-operator    quay.io/cilium/operator-generic:v1.14.4@sha256:...: 1
```

**💡 Status Breakdown:**
- **Cilium**: Main agent (DaemonSet)
- **Operator**: Manages Cilium resources
- **Hubble**: Observability (we'll enable later)
- **ClusterMesh**: Multi-cluster (advanced)

### Step 3.2: Verify Nodes are Ready

```bash
# Check nodes
kubectl get nodes
```

**Expected Output:**
```
NAME                           STATUS   ROLES           AGE   VERSION
cilium-cluster-control-plane   Ready    control-plane   5m    v1.28.0
cilium-cluster-worker          Ready    <none>          5m    v1.28.0
cilium-cluster-worker2         Ready    <none>          5m    v1.28.0
```

**💡 Nodes are now Ready with Cilium CNI!**

### Step 3.3: Check Cilium Pods

```bash
# List Cilium pods
kubectl get pods -n kube-system -l k8s-app=cilium
```

**Expected Output:**
```
NAME           READY   STATUS    RESTARTS   AGE
cilium-xxxxx   1/1     Running   0          3m
cilium-yyyyy   1/1     Running   0          3m
cilium-zzzzz   1/1     Running   0          3m
```

```bash
# Check Cilium operator
kubectl get pods -n kube-system -l name=cilium-operator
```

**Expected Output:**
```
NAME                               READY   STATUS    RESTARTS   AGE
cilium-operator-7d4b7b9c4d-xxxxx   1/1     Running   0          3m
```

### Step 3.4: Inspect Cilium Configuration

```bash
# Get Cilium ConfigMap
kubectl get configmap -n kube-system cilium-config -o yaml
```

**Expected Output (partial):**
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: cilium-config
  namespace: kube-system
data:
  enable-ipv4: "true"
  enable-ipv6: "false"
  tunnel: vxlan
  enable-bpf-masquerade: "true"
  enable-endpoint-health-checking: "true"
  enable-health-checking: "true"
  kube-proxy-replacement: strict
```

**💡 Key Settings:**
- **tunnel: vxlan**: Overlay network mode
- **kube-proxy-replacement: strict**: Cilium replaces kube-proxy
- **enable-bpf-masquerade**: eBPF-based NAT

---

## 📝 Part 4: Testing Connectivity

### Step 4.1: Run Connectivity Test

```bash
# Run Cilium connectivity test
cilium connectivity test
```

**Expected Output:**
```
ℹ️  Monitor aggregation detected, will skip some flow validation steps
✨ [kind-cilium-cluster] Creating namespace cilium-test for connectivity check...
✨ [kind-cilium-cluster] Deploying echo-same-node service...
✨ [kind-cilium-cluster] Deploying echo-other-node service...
✨ [kind-cilium-cluster] Deploying client deployment...
✨ [kind-cilium-cluster] Deploying client2 deployment...

🔭 Enabling Hubble telescope...
⚠️  Unable to contact Hubble Relay, disabling Hubble telescope and flow validation...
ℹ️  Expose Relay locally with:
   cilium hubble enable
   cilium hubble port-forward&

🏃 Running tests...

[=] Test [no-policies] [1/48]
  [..] Scenario [no-policies/pod-to-pod]
    [..] Action [no-policies/pod-to-pod/curl-echo-service]
    [✅] Success: curl-echo-service
  [✅] Scenario [no-policies/pod-to-pod]: SUCCESS

[=] Test [no-policies] [2/48]
  [..] Scenario [no-policies/pod-to-service]
    [..] Action [no-policies/pod-to-service/curl-echo-service]
    [✅] Success: curl-echo-service
  [✅] Scenario [no-policies/pod-to-service]: SUCCESS

...

✅ All 48 tests (300 actions) successful, 0 tests skipped, 0 scenarios skipped.
```

**💡 Connectivity Test:**
- Creates test pods
- Tests pod-to-pod communication
- Tests pod-to-service communication
- Tests DNS resolution
- Tests network policies (later)

### Step 4.2: Manual Connectivity Test

```bash
# Create test pods
kubectl create deployment nginx --image=nginx --replicas=2
kubectl expose deployment nginx --port=80
```

```bash
# Create client pod
kubectl run client --image=busybox --rm -it --restart=Never -- sh
```

**In the client pod:**
```sh
# Test connectivity to nginx service
wget -O- http://nginx

# Test DNS resolution
nslookup nginx

# Exit
exit
```

**Expected Output:**
```
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
...
```

---

## 📝 Part 5: Enabling Hubble

### Step 5.1: Enable Hubble

```bash
# Enable Hubble observability
cilium hubble enable --ui
```

**Expected Output:**
```
🔮 Auto-detected Kubernetes kind: kind
✨ Patching ConfigMap cilium-config to enable Hubble...
♻️  Restarted Cilium pods
⌛ Waiting for Hubble to be installed...
✅ Hubble was successfully enabled!
✅ Hubble UI was successfully enabled!
```

**💡 Hubble Components:**
- **Hubble**: Network flow monitoring
- **Hubble Relay**: Aggregates flows from all nodes
- **Hubble UI**: Web-based visualization

### Step 5.2: Access Hubble UI

```bash
# Port forward to Hubble UI
cilium hubble ui
```

**Expected Output:**
```
ℹ️  Opening "http://localhost:12000" in your browser...
```

**Hubble UI shows:**
- Network topology
- Service dependencies
- Traffic flows
- Network policies

### Step 5.3: Use Hubble CLI

```bash
# Port forward to Hubble Relay
cilium hubble port-forward &
```

```bash
# Observe network flows
cilium hubble observe
```

**Expected Output:**
```
Dec 27 12:00:00.000: default/nginx-xxx:80 <- default/client:xxxxx to-endpoint FORWARDED (TCP Flags: SYN)
Dec 27 12:00:00.001: default/nginx-xxx:80 -> default/client:xxxxx to-stack FORWARDED (TCP Flags: SYN, ACK)
Dec 27 12:00:00.002: default/nginx-xxx:80 <- default/client:xxxxx to-endpoint FORWARDED (TCP Flags: ACK)
```

**💡 Flow Information:**
- Source and destination pods
- Ports and protocols
- Verdict (FORWARDED, DROPPED, etc.)
- TCP flags

```bash
# Filter flows by pod
cilium hubble observe --pod nginx

# Filter by verdict
cilium hubble observe --verdict DROPPED

# Follow flows in real-time
cilium hubble observe --follow
```

---

## 📝 Part 6: Understanding Cilium Endpoints

### Step 6.1: List Cilium Endpoints

```bash
# Get Cilium endpoints
kubectl get cep -A
```

**Expected Output:**
```
NAMESPACE     NAME                   ENDPOINT ID   IDENTITY ID   INGRESS ENFORCEMENT   EGRESS ENFORCEMENT   VISIBILITY POLICY   ENDPOINT STATE   IPV4           IPV6
default       nginx-xxx              1234          12345         false                 false                <status disabled>   ready            10.244.1.5
default       nginx-yyy              1235          12345         false                 false                <status disabled>   ready            10.244.2.6
kube-system   coredns-xxx            1236          12346         false                 false                <status disabled>   ready            10.244.0.7
```

**💡 Cilium Endpoint (CEP):**
- Represents a pod's network endpoint
- Managed by Cilium
- Contains identity and policy info

### Step 6.2: Inspect Endpoint Details

```bash
# Describe an endpoint
kubectl describe cep -n default nginx-xxx
```

**Expected Output:**
```yaml
Name:         nginx-xxx
Namespace:    default
Labels:       app=nginx
              pod-template-hash=7d4b7b9c4d
Status:
  External Identifiers:
    Container ID:  docker://abc123...
    Pod Name:      default/nginx-xxx
  Identity:
    ID:     12345
    Labels:
      k8s:app=nginx
      k8s:io.kubernetes.pod.namespace=default
  Networking:
    Addressing:
      - IPV4: 10.244.1.5
    Node:     cilium-cluster-worker
  Policy:
    Ingress:
      Enforcing:  false
    Egress:
      Enforcing:  false
  State:          ready
```

---

## ✅ Validation Steps

```bash
# 1. Verify Cilium is running
cilium status

# 2. Check all nodes are Ready
kubectl get nodes

# 3. Verify connectivity
cilium connectivity test

# 4. Check Hubble is enabled
kubectl get pods -n kube-system | grep hubble

# 5. Test pod-to-pod communication
kubectl run test --image=busybox --rm -it --restart=Never -- wget -O- http://nginx
```

---

## 🧹 Cleanup

```bash
# Delete test resources
kubectl delete deployment nginx
kubectl delete service nginx

# Delete connectivity test namespace
kubectl delete namespace cilium-test

# Stop Hubble port-forward
pkill -f "cilium hubble port-forward"
```

---

## 🎯 Challenge Tasks

1. **Explore eBPF Maps**
   ```bash
   # Exec into Cilium pod
   kubectl exec -n kube-system cilium-xxxxx -- cilium bpf endpoint list
   ```

2. **Monitor Specific Traffic**
   ```bash
   # Observe HTTP traffic
   cilium hubble observe --protocol http
   
   # Observe DNS queries
   cilium hubble observe --protocol dns
   ```

3. **Check Cilium Metrics**
   ```bash
   # Port forward to Cilium metrics
   kubectl port-forward -n kube-system cilium-xxxxx 9090:9090
   
   # Access metrics
   curl http://localhost:9090/metrics
   ```

---

## 🐛 Troubleshooting

### Issue: Nodes stay NotReady

**Solution:**
```bash
# Check Cilium pods
kubectl get pods -n kube-system -l k8s-app=cilium

# Check Cilium logs
kubectl logs -n kube-system cilium-xxxxx

# Restart Cilium
kubectl rollout restart daemonset/cilium -n kube-system
```

### Issue: Connectivity test fails

**Solution:**
```bash
# Check Cilium status
cilium status

# Verify eBPF programs are loaded
kubectl exec -n kube-system cilium-xxxxx -- cilium bpf endpoint list

# Check for policy denials
cilium hubble observe --verdict DROPPED
```

### Issue: Hubble not working

**Solution:**
```bash
# Verify Hubble is enabled
kubectl get pods -n kube-system | grep hubble

# Check Hubble Relay logs
kubectl logs -n kube-system hubble-relay-xxxxx

# Re-enable Hubble
cilium hubble disable
cilium hubble enable --ui
```

---

## 📚 Key Takeaways

✅ **eBPF** provides kernel-level networking performance  
✅ **Cilium** is an eBPF-based CNI plugin  
✅ **Hubble** provides deep network observability  
✅ **Cilium replaces kube-proxy** for better performance  
✅ **Endpoints** represent pod network identities  
✅ **Connectivity tests** verify network functionality  
✅ **Cilium CLI** simplifies installation and management  
✅ **Network flows** can be observed in real-time  

---

## 📖 Next Steps

Continue to [Lab 2.1: Network Policies with Cilium](lab-2.1-network-policies.md)

---

## 📝 Lab Completion Checklist

- [ ] Installed Cilium CLI
- [ ] Created cluster without CNI
- [ ] Installed Cilium
- [ ] Verified nodes are Ready
- [ ] Ran connectivity tests
- [ ] Enabled Hubble
- [ ] Accessed Hubble UI
- [ ] Observed network flows
- [ ] Explored Cilium endpoints
- [ ] Completed challenge tasks

**Congratulations! You've mastered Cilium installation and eBPF basics!** 🎉
