# Lab 1.1: Understanding IPAM and MetalLB Installation

## 📚 Related Topics
- IP address management
- Load balancing on bare-metal
- Kubernetes networking
- Service types
- ARP and Layer 2 networking

## 🎯 Learning Objectives

By the end of this lab, you will be able to:
- Understand IPAM concepts and importance
- Install MetalLB on Kubernetes
- Configure IP address pools
- Allocate IPs to LoadBalancer services
- Understand Layer 2 and BGP modes
- Monitor IP allocation
- Troubleshoot IP conflicts

## ⏱️ Estimated Time
60-75 minutes

## 📋 Prerequisites

- Running Kubernetes cluster (minikube, kind, or bare-metal)
- kubectl configured
- Basic understanding of IP addressing and CIDR notation
- Familiarity with Kubernetes Services

---

## 🏗️ IPAM and MetalLB Architecture

```
┌──────────────────────────────────────────────────────────────┐
│              MetalLB IPAM Architecture                       │
└──────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  IP Address Pool Configuration                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  IPAddressPool: default-pool                         │  │
│  │  Range: 192.168.1.240 - 192.168.1.250                │  │
│  │  Available: 11 addresses                             │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  MetalLB Controller (Deployment)                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  • Watches LoadBalancer Services                     │  │
│  │  • Allocates IPs from pool                           │  │
│  │  • Assigns IPs to services                           │  │
│  │  • Tracks IP usage                                   │  │
│  │  • Prevents conflicts                                │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  MetalLB Speaker (DaemonSet - runs on all nodes)            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Layer 2 Mode:                                       │  │
│  │  • Responds to ARP requests                          │  │
│  │  • Announces IP ownership                            │  │
│  │  • One node owns IP at a time                        │  │
│  │                                                       │  │
│  │  BGP Mode:                                           │  │
│  │  • Peers with routers                                │  │
│  │  • Announces routes                                  │  │
│  │  • Load balances across nodes                        │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  LoadBalancer Services                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Service A   │  │  Service B   │  │  Service C   │     │
│  │  192.168.1   │  │  192.168.1   │  │  192.168.1   │     │
│  │  .240        │  │  .241        │  │  .242        │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘

Traffic Flow (Layer 2 Mode):
  1. Client sends packet to 192.168.1.240
  2. ARP request: "Who has 192.168.1.240?"
  3. MetalLB speaker responds with node MAC
  4. Traffic goes to that node
  5. kube-proxy forwards to service pods
```

**Key Components:**
- **Controller**: Allocates IPs from pools
- **Speaker**: Announces IPs to network
- **IPAddressPool**: Defines available IP ranges
- **L2Advertisement/BGPAdvertisement**: Configures announcement method

---

## 📝 Part 1: Understanding IPAM Concepts

### Step 1.1: IP Address Management Basics

**What is IPAM?**
- Planning, tracking, and managing IP address space
- Prevents IP conflicts and exhaustion
- Enables efficient IP utilization
- Critical for network scalability

**IPAM in Kubernetes:**
```
┌─────────────────────────────────────────────────────────┐
│ IP Type        │ Range Example   │ Managed By         │
├─────────────────────────────────────────────────────────┤
│ Pod IPs        │ 10.244.0.0/16   │ CNI Plugin         │
│ Service IPs    │ 10.96.0.0/12    │ kube-apiserver     │
│ LoadBalancer   │ 192.168.1.0/24  │ MetalLB/Cloud      │
│ Node IPs       │ 192.168.0.0/24  │ Infrastructure     │
└─────────────────────────────────────────────────────────┘
```

### Step 1.2: Why MetalLB?

**Problem**: Cloud providers automatically assign IPs to LoadBalancer services, but bare-metal clusters don't have this capability.

**Solution**: MetalLB provides LoadBalancer implementation for bare-metal Kubernetes.

**MetalLB Modes:**
```
┌─────────────────────────────────────────────────────────┐
│ Mode    │ How It Works          │ Use Case            │
├─────────────────────────────────────────────────────────┤
│ Layer 2 │ ARP/NDP responses     │ Simple, no router   │
│         │ One node owns IP      │ config needed       │
│         │ Failover on failure   │ Small deployments   │
├─────────────────────────────────────────────────────────┤
│ BGP     │ Peers with routers    │ Production scale    │
│         │ Equal-cost multipath  │ True load balancing │
│         │ All nodes announce    │ Requires BGP router │
└─────────────────────────────────────────────────────────┘
```

**💡 Layer 2 Mode:**
- Simpler to set up
- No router configuration needed
- Single node handles traffic (failover on failure)
- Good for development and small deployments

**💡 BGP Mode:**
- More complex setup
- Requires BGP-capable router
- True load balancing across nodes
- Production-grade scalability

---

## 📝 Part 2: Installing MetalLB

### Step 2.1: Prepare Cluster

```bash
# Check if kube-proxy is in IPVS mode (MetalLB works with both)
kubectl get configmap -n kube-system kube-proxy -o yaml | grep mode
```

**Expected Output:**
```yaml
mode: ""  # or "ipvs" or "iptables"
```

**💡 MetalLB works with both iptables and IPVS modes.**

### Step 2.2: Install MetalLB

```bash
# Install MetalLB using manifest
kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.13.12/config/manifests/metallb-native.yaml
```

**Expected Output:**
```
namespace/metallb-system created
customresourcedefinition.apiextensions.k8s.io/addresspools.metallb.io created
customresourcedefinition.apiextensions.k8s.io/bfdprofiles.metallb.io created
customresourcedefinition.apiextensions.k8s.io/bgpadvertisements.metallb.io created
customresourcedefinition.apiextensions.k8s.io/bgppeers.metallb.io created
customresourcedefinition.apiextensions.k8s.io/communities.metallb.io created
customresourcedefinition.apiextensions.k8s.io/ipaddresspools.metallb.io created
customresourcedefinition.apiextensions.k8s.io/l2advertisements.metallb.io created
serviceaccount/controller created
serviceaccount/speaker created
role.rbac.authorization.k8s.io/controller created
role.rbac.authorization.k8s.io/pod-lister created
clusterrole.rbac.authorization.k8s.io/metallb-system:controller created
clusterrole.rbac.authorization.k8s.io/metallb-system:speaker created
rolebinding.rbac.authorization.k8s.io/controller created
rolebinding.rbac.authorization.k8s.io/pod-lister created
clusterrolebinding.rbac.authorization.k8s.io/metallb-system:controller created
clusterrolebinding.rbac.authorization.k8s.io/metallb-system:speaker created
deployment.apps/controller created
daemonset.apps/speaker created
```

**💡 What was installed:**
- **Namespace**: metallb-system
- **CRDs**: Custom resources for configuration
- **Controller**: Deployment for IP allocation
- **Speaker**: DaemonSet for IP announcement

### Step 2.3: Verify Installation

```bash
# Check MetalLB namespace
kubectl get namespace metallb-system
```

**Expected Output:**
```
NAME             STATUS   AGE
metallb-system   Active   30s
```

```bash
# Check MetalLB pods
kubectl get pods -n metallb-system
```

**Expected Output:**
```
NAME                          READY   STATUS    RESTARTS   AGE
controller-7d4b7b9c4d-xxxxx   1/1     Running   0          1m
speaker-xxxxx                 1/1     Running   0          1m
speaker-yyyyy                 1/1     Running   0          1m
speaker-zzzzz                 1/1     Running   0          1m
```

**💡 Speaker runs on all nodes (DaemonSet), Controller runs as single replica.**

```bash
# Check MetalLB CRDs
kubectl get crds | grep metallb
```

**Expected Output:**
```
addresspools.metallb.io                      2026-09-28T10:00:00Z
bfdprofiles.metallb.io                       2026-09-28T10:00:00Z
bgpadvertisements.metallb.io                 2026-09-28T10:00:00Z
bgppeers.metallb.io                          2026-09-28T10:00:00Z
communities.metallb.io                       2026-09-28T10:00:00Z
ipaddresspools.metallb.io                    2026-09-28T10:00:00Z
l2advertisements.metallb.io                  2026-09-28T10:00:00Z
```

---

## 📝 Part 3: Configuring IP Address Pools

### Step 3.1: Determine Available IP Range

**Important**: Choose IPs that are:
- On the same subnet as your nodes
- Not used by DHCP
- Not assigned to other devices

```bash
# Check your node IPs
kubectl get nodes -o wide
```

**Expected Output:**
```
NAME           STATUS   ROLES           AGE   VERSION   INTERNAL-IP     EXTERNAL-IP
minikube       Ready    control-plane   10m   v1.28.0   192.168.49.2    <none>
minikube-m02   Ready    <none>          10m   v1.28.0   192.168.49.3    <none>
minikube-m03   Ready    <none>          10m   v1.28.0   192.168.49.4    <none>
```

**💡 Example**: If nodes are on 192.168.49.0/24, you could use 192.168.49.240-192.168.49.250 for MetalLB.

### Step 3.2: Create IP Address Pool

```bash
# Create IP address pool
cat <<EOF | kubectl apply -f -
apiVersion: metallb.io/v1beta1
kind: IPAddressPool
metadata:
  name: default-pool
  namespace: metallb-system
spec:
  addresses:
  - 192.168.49.240-192.168.49.250
EOF
```

**Expected Output:**
```
ipaddresspool.metallb.io/default-pool created
```

**💡 Configuration Options:**
```yaml
# Single range
addresses:
- 192.168.1.240-192.168.1.250

# Multiple ranges
addresses:
- 192.168.1.240-192.168.1.250
- 192.168.2.100-192.168.2.110

# CIDR notation
addresses:
- 192.168.1.240/28  # 16 addresses
```

### Step 3.3: Create Layer 2 Advertisement

```bash
# Create L2 advertisement
cat <<EOF | kubectl apply -f -
apiVersion: metallb.io/v1beta1
kind: L2Advertisement
metadata:
  name: default
  namespace: metallb-system
spec:
  ipAddressPools:
  - default-pool
EOF
```

**Expected Output:**
```
l2advertisement.metallb.io/default created
```

**💡 L2Advertisement tells MetalLB to announce IPs using Layer 2 (ARP).**

### Step 3.4: Verify Configuration

```bash
# Check IP address pools
kubectl get ipaddresspools -n metallb-system
```

**Expected Output:**
```
NAME           AUTO ASSIGN   AVOID BUGGY IPS   ADDRESSES
default-pool   true          false             ["192.168.49.240-192.168.49.250"]
```

```bash
# Check L2 advertisements
kubectl get l2advertisements -n metallb-system
```

**Expected Output:**
```
NAME      IPADDRESSPOOLS      IPADDRESSPOOL SELECTORS   INTERFACES
default   ["default-pool"]
```

---

## 📝 Part 4: Testing IP Allocation

### Step 4.1: Create LoadBalancer Service

```bash
# Create a deployment
kubectl create deployment nginx --image=nginx --replicas=3
```

**Expected Output:**
```
deployment.apps/nginx created
```

```bash
# Expose as LoadBalancer service
kubectl expose deployment nginx --type=LoadBalancer --port=80
```

**Expected Output:**
```
service/nginx exposed
```

### Step 4.2: Verify IP Allocation

```bash
# Check service (wait for EXTERNAL-IP)
kubectl get svc nginx
```

**Expected Output:**
```
NAME    TYPE           CLUSTER-IP      EXTERNAL-IP       PORT(S)        AGE
nginx   LoadBalancer   10.96.123.45    192.168.49.240    80:30080/TCP   30s
```

**💡 MetalLB allocated 192.168.49.240 from the pool!**

```bash
# Describe service to see events
kubectl describe svc nginx
```

**Expected Output:**
```
Name:                     nginx
Namespace:                default
Labels:                   app=nginx
Annotations:              <none>
Selector:                 app=nginx
Type:                     LoadBalancer
IP Family Policy:         SingleStack
IP Families:              IPv4
IP:                       10.96.123.45
IPs:                      10.96.123.45
LoadBalancer Ingress:     192.168.49.240
Port:                     <unset>  80/TCP
TargetPort:               80/TCP
NodePort:                 <unset>  30080/TCP
Endpoints:                10.244.1.5:80,10.244.2.6:80,10.244.3.7:80
Session Affinity:         None
External Traffic Policy:  Cluster
Events:
  Type    Reason        Age   From                Message
  ----    ------        ----  ----                -------
  Normal  IPAllocated   30s   metallb-controller  Assigned IP ["192.168.49.240"]
```

### Step 4.3: Test Connectivity

```bash
# Test from within cluster
kubectl run test --image=curlimages/curl --rm -it --restart=Never -- curl http://192.168.49.240
```

**Expected Output:**
```
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
...
pod "test" deleted
```

**💡 If you're on the same network as the cluster:**
```bash
# Test from your machine
curl http://192.168.49.240
```

---

## 📝 Part 5: Multiple Services and IP Management

### Step 5.1: Create Multiple LoadBalancer Services

```bash
# Create second deployment
kubectl create deployment apache --image=httpd --replicas=2
kubectl expose deployment apache --type=LoadBalancer --port=80

# Create third deployment
kubectl create deployment caddy --image=caddy --replicas=2
kubectl expose deployment caddy --type=LoadBalancer --port=80
```

### Step 5.2: Verify IP Allocation

```bash
# Check all LoadBalancer services
kubectl get svc -o wide
```

**Expected Output:**
```
NAME     TYPE           CLUSTER-IP      EXTERNAL-IP       PORT(S)        AGE
nginx    LoadBalancer   10.96.123.45    192.168.49.240    80:30080/TCP   5m
apache   LoadBalancer   10.96.123.46    192.168.49.241    80:30081/TCP   1m
caddy    LoadBalancer   10.96.123.47    192.168.49.242    80:30082/TCP   1m
```

**💡 MetalLB allocated sequential IPs from the pool!**

### Step 5.3: Check IP Pool Usage

```bash
# Check MetalLB controller logs
kubectl logs -n metallb-system -l app.kubernetes.io/component=controller
```

**Expected Output:**
```
{"caller":"service.go:114","event":"ipAllocated","ip":"192.168.49.240","msg":"IP address assigned","service":"default/nginx","ts":"2026-09-28T10:05:00Z"}
{"caller":"service.go:114","event":"ipAllocated","ip":"192.168.49.241","msg":"IP address assigned","service":"default/apache","ts":"2026-09-28T10:06:00Z"}
{"caller":"service.go:114","event":"ipAllocated","ip":"192.168.49.242","msg":"IP address assigned","service":"default/caddy","ts":"2026-09-28T10:07:00Z"}
```

---

## 📝 Part 6: Advanced IP Pool Configuration

### Step 6.1: Create Namespace-Specific IP Pool

```bash
# Create production namespace
kubectl create namespace production

# Create production IP pool
cat <<EOF | kubectl apply -f -
apiVersion: metallb.io/v1beta1
kind: IPAddressPool
metadata:
  name: production-pool
  namespace: metallb-system
spec:
  addresses:
  - 192.168.49.100-192.168.49.110
  serviceAllocation:
    priority: 100
    namespaces:
    - production
EOF
```

**Expected Output:**
```
ipaddresspool.metallb.io/production-pool created
```

```bash
# Create L2 advertisement for production pool
cat <<EOF | kubectl apply -f -
apiVersion: metallb.io/v1beta1
kind: L2Advertisement
metadata:
  name: production
  namespace: metallb-system
spec:
  ipAddressPools:
  - production-pool
EOF
```

### Step 6.2: Test Namespace-Specific Allocation

```bash
# Create service in production namespace
kubectl create deployment prod-app --image=nginx --replicas=2 -n production
kubectl expose deployment prod-app --type=LoadBalancer --port=80 -n production
```

```bash
# Check IP allocation
kubectl get svc -n production
```

**Expected Output:**
```
NAME       TYPE           CLUSTER-IP      EXTERNAL-IP       PORT(S)        AGE
prod-app   LoadBalancer   10.96.123.50    192.168.49.100    80:30090/TCP   30s
```

**💡 IP came from production-pool (192.168.49.100-110)!**

---

## 📝 Part 7: IP Reservation and Static Assignment

### Step 7.1: Request Specific IP

```bash
# Create service with specific IP annotation
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Service
metadata:
  name: static-ip-service
  annotations:
    metallb.universe.tf/loadBalancerIPs: 192.168.49.245
spec:
  type: LoadBalancer
  selector:
    app: nginx
  ports:
  - port: 80
    targetPort: 80
EOF
```

**Expected Output:**
```
service/static-ip-service created
```

```bash
# Verify specific IP assignment
kubectl get svc static-ip-service
```

**Expected Output:**
```
NAME                TYPE           CLUSTER-IP      EXTERNAL-IP       PORT(S)        AGE
static-ip-service   LoadBalancer   10.96.123.55    192.168.49.245    80:30095/TCP   30s
```

**💡 Service got the requested IP!**

---

## ✅ Validation Steps

```bash
# 1. Verify MetalLB is running
kubectl get pods -n metallb-system

# 2. Check IP address pools
kubectl get ipaddresspools -n metallb-system

# 3. Check L2 advertisements
kubectl get l2advertisements -n metallb-system

# 4. Verify LoadBalancer services have external IPs
kubectl get svc --all-namespaces -o wide | grep LoadBalancer

# 5. Test connectivity
curl http://192.168.49.240

# 6. Check MetalLB logs
kubectl logs -n metallb-system -l app.kubernetes.io/component=controller
```

---

## 🧹 Cleanup

```bash
# Delete services
kubectl delete svc nginx apache caddy static-ip-service
kubectl delete svc prod-app -n production

# Delete deployments
kubectl delete deployment nginx apache caddy
kubectl delete deployment prod-app -n production

# Delete namespace
kubectl delete namespace production

# Optional: Uninstall MetalLB
kubectl delete -f https://raw.githubusercontent.com/metallb/metallb/v0.13.12/config/manifests/metallb-native.yaml
```

---

## 🎯 Challenge Tasks

1. **Create BGP Configuration**
   ```yaml
   apiVersion: metallb.io/v1beta2
   kind: BGPPeer
   metadata:
     name: router
     namespace: metallb-system
   spec:
     myASN: 64500
     peerASN: 64501
     peerAddress: 192.168.1.1
   ```

2. **Implement IP Sharing**
   ```yaml
   annotations:
     metallb.universe.tf/allow-shared-ip: "shared-key"
   ```

3. **Configure Auto-Assignment**
   ```yaml
   spec:
     autoAssign: false  # Disable auto-assignment
   ```

---

## 🐛 Troubleshooting

### Issue: Service stuck in pending

**Solution:**
```bash
# Check MetalLB controller logs
kubectl logs -n metallb-system -l app.kubernetes.io/component=controller

# Verify IP pool exists
kubectl get ipaddresspools -n metallb-system

# Check service events
kubectl describe svc <service-name>
```

### Issue: IP not reachable

**Solution:**
```bash
# Check speaker logs
kubectl logs -n metallb-system -l app.kubernetes.io/component=speaker

# Verify L2 advertisement
kubectl get l2advertisements -n metallb-system

# Check ARP table
arp -a | grep 192.168.49.240
```

---

## 📚 Key Takeaways

✅ **IPAM** manages IP address allocation and tracking  
✅ **MetalLB** provides LoadBalancer for bare-metal Kubernetes  
✅ **IPAddressPool** defines available IP ranges  
✅ **L2Advertisement** announces IPs using ARP  
✅ **Layer 2 mode** is simple but single-node traffic  
✅ **BGP mode** provides true load balancing  
✅ **Namespace-specific pools** enable multi-tenancy  
✅ **Static IP assignment** via annotations  

---

## 📖 Next Steps

Continue to [Lab 1.2: MetalLB BGP Mode Configuration](lab-1.2-metallb-bgp.md)

---

## 📝 Lab Completion Checklist

- [ ] Installed MetalLB
- [ ] Created IP address pools
- [ ] Configured L2 advertisement
- [ ] Created LoadBalancer services
- [ ] Verified IP allocation
- [ ] Tested connectivity
- [ ] Created namespace-specific pools
- [ ] Assigned static IPs
- [ ] Completed challenge tasks

**Congratulations! You've mastered IPAM and MetalLB basics!** 🎉
