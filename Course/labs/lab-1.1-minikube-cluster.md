# Lab 1.1: Local Cluster Creation with Minikube

## 📚 Related Chapters
- **Chapter 3**: Getting Started with Containers
- **Chapter 5**: Orchestrating Containers with Kubernetes

## 🎯 Learning Objectives

By the end of this lab, you will be able to:
- Install and configure minikube on your local machine
- Create single-node and multi-node Kubernetes clusters
- Understand cluster components and their roles
- Navigate and inspect cluster resources using kubectl
- Label nodes for scheduling purposes

## ⏱️ Estimated Time
45-60 minutes

## 📋 Prerequisites

- Docker Desktop installed and running
- At least 4GB RAM available
- Basic command line knowledge
- Completed reading Chapter 3 and Chapter 5

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Minikube Cluster                     │
│                                                         │
│  ┌───────────────────────────────────────────────┐    │
│  │              Control Plane Node                │    │
│  │  ┌──────────────────────────────────────┐     │    │
│  │  │  Control Plane Components:           │     │    │
│  │  │  • kube-apiserver (API Gateway)      │     │    │
│  │  │  • etcd (Cluster State Database)     │     │    │
│  │  │  • kube-scheduler (Pod Placement)    │     │    │
│  │  │  • kube-controller-manager           │     │    │
│  │  └──────────────────────────────────────┘     │    │
│  │                                                │    │
│  │  ┌──────────────────────────────────────┐     │    │
│  │  │  Worker Components:                  │     │    │
│  │  │  • kubelet (Node Agent)              │     │    │
│  │  │  • kube-proxy (Network Rules)        │     │    │
│  │  │  • Container Runtime (containerd)    │     │    │
│  │  └──────────────────────────────────────┘     │    │
│  └───────────────────────────────────────────────┘    │
│                                                         │
│  ┌───────────────────────────────────────────────┐    │
│  │              Worker Node (Optional)            │    │
│  │  • kubelet                                     │    │
│  │  • kube-proxy                                  │    │
│  │  • Container Runtime                           │    │
│  └───────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
         ▲
         │ kubectl commands
         │
    ┌────┴────┐
    │  Your   │
    │ Machine │
    └─────────┘
```

---

## 📝 Part 1: Installing Minikube

### Step 1.1: Install Minikube

**For macOS:**
```bash
# Using Homebrew (recommended)
brew install minikube

# Verify installation
minikube version
```

**Expected Output:**
```
minikube version: v1.32.0
commit: 8220a6eb95f0a4d75f7f2d7b14cef975f050512d
```

**For Linux:**
```bash
# Download the latest minikube binary
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64

# Install it
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Verify installation
minikube version
```

**For Windows:**
```powershell
# Using Chocolatey
choco install minikube

# Or download installer from:
# https://minikube.sigs.k8s.io/docs/start/
```

### Step 1.2: Install kubectl

**For macOS:**
```bash
# Using Homebrew
brew install kubectl

# Verify installation
kubectl version --client
```

**Expected Output:**
```
Client Version: v1.28.0
Kustomize Version: v5.0.4-0.20230601165947-6ce0bf390ce3
```

**For Linux:**
```bash
# Download the latest kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"

# Make it executable
chmod +x kubectl

# Move to PATH
sudo mv kubectl /usr/local/bin/

# Verify
kubectl version --client
```

**💡 Explanation:**
- **minikube**: Tool that runs a Kubernetes cluster locally inside a VM or container
- **kubectl**: Command-line tool to interact with Kubernetes clusters
- These are separate tools: minikube creates clusters, kubectl manages them

---

## 📝 Part 2: Creating Your First Cluster

### Step 2.1: Start a Single-Node Cluster

```bash
# Start minikube with default settings
minikube start

# This command will:
# 1. Download the Kubernetes components (if first time)
# 2. Create a VM or container
# 3. Install Kubernetes inside it
# 4. Configure kubectl to use this cluster
```

**Expected Output:**
```
😄  minikube v1.32.0 on Darwin 13.5.2
✨  Automatically selected the docker driver
👍  Starting control plane node minikube in cluster minikube
🚜  Pulling base image ...
🔥  Creating docker container (CPUs=2, Memory=4000MB) ...
🐳  Preparing Kubernetes v1.28.3 on Docker 24.0.7 ...
    ▪ Generating certificates and keys ...
    ▪ Booting up control plane ...
    ▪ Configuring RBAC rules ...
🔗  Configuring bridge CNI (Container Networking Interface) ...
🔎  Verifying Kubernetes components...
🌟  Enabled addons: storage-provisioner, default-storageclass
🏄  Done! kubectl is now configured to use "minikube" cluster
```

**💡 What Just Happened?**
1. **Driver Selection**: Minikube chose Docker as the driver (runs K8s in a container)
2. **Resource Allocation**: Assigned 2 CPUs and 4GB RAM to the cluster
3. **Kubernetes Installation**: Installed version 1.28.3
4. **Certificate Generation**: Created security certificates for cluster communication
5. **Control Plane Boot**: Started API server, scheduler, controller manager
6. **Networking Setup**: Configured CNI for pod networking
7. **kubectl Configuration**: Updated ~/.kube/config to point to this cluster

### Step 2.2: Verify Cluster is Running

```bash
# Check cluster status
minikube status
```

**Expected Output:**
```
minikube
type: Control Plane
host: Running
kubelet: Running
apiserver: Running
kubeconfig: Configured
```

**💡 Explanation:**
- **host**: The VM/container running Kubernetes
- **kubelet**: Node agent that manages pods
- **apiserver**: The API server accepting kubectl commands
- **kubeconfig**: kubectl is configured to talk to this cluster

### Step 2.3: Check Node Information

```bash
# List all nodes in the cluster
kubectl get nodes
```

**Expected Output:**
```
NAME       STATUS   ROLES           AGE   VERSION
minikube   Ready    control-plane   2m    v1.28.3
```

**💡 Explanation:**
- **NAME**: Node identifier
- **STATUS**: Ready means the node is healthy and can accept pods
- **ROLES**: control-plane means this node runs cluster management components
- **AGE**: How long the node has been running
- **VERSION**: Kubernetes version running on this node

```bash
# Get detailed node information
kubectl describe node minikube
```

**Key sections to observe:**
```yaml
# Node capacity (total resources)
Capacity:
  cpu:                2
  memory:             4025600Ki
  pods:               110

# Node allocatable (available for pods)
Allocatable:
  cpu:                2
  memory:             3923200Ki
  pods:               110

# System information
System Info:
  Operating System:           linux
  Architecture:               amd64
  Container Runtime Version:  containerd://1.6.24
  Kubelet Version:            v1.28.3
  Kube-Proxy Version:         v1.28.3
```

**💡 Explanation:**
- **Capacity**: Total resources on the node
- **Allocatable**: Resources available for pods (some reserved for system)
- **Container Runtime**: containerd is managing containers (not Docker!)
- **Kubelet/Kube-Proxy**: Core node components and their versions

---

## 📝 Part 3: Exploring Cluster Components

### Step 3.1: View Control Plane Pods

```bash
# List all pods in the kube-system namespace
# This is where Kubernetes system components run
kubectl get pods -n kube-system
```

**Expected Output:**
```
NAME                               READY   STATUS    RESTARTS   AGE
coredns-5dd5756b68-xxxxx          1/1     Running   0          5m
etcd-minikube                     1/1     Running   0          5m
kube-apiserver-minikube           1/1     Running   0          5m
kube-controller-manager-minikube  1/1     Running   0          5m
kube-proxy-xxxxx                  1/1     Running   0          5m
kube-scheduler-minikube           1/1     Running   0          5m
storage-provisioner               1/1     Running   0          5m
```

**💡 Component Breakdown:**

| Component | Purpose | Chapter Reference |
|-----------|---------|-------------------|
| **etcd** | Distributed key-value store; holds all cluster state | Chapter 5, Lesson 1 |
| **kube-apiserver** | Central API gateway; all operations go through it | Chapter 5, Lesson 1 |
| **kube-scheduler** | Assigns pods to nodes based on resources | Chapter 5, Lesson 1 |
| **kube-controller-manager** | Runs controllers that maintain desired state | Chapter 5, Lesson 1 |
| **kube-proxy** | Manages network rules for Services | Chapter 5, Lesson 1 |
| **coredns** | DNS server for service discovery | Chapter 5, Lesson 3 |
| **storage-provisioner** | Minikube-specific; creates PersistentVolumes | Chapter 6, Lesson 3 |

### Step 3.2: Inspect a Control Plane Component

```bash
# Get detailed information about the API server
kubectl describe pod kube-apiserver-minikube -n kube-system
```

**Key sections to observe:**
```yaml
# Container image
Containers:
  kube-apiserver:
    Image: registry.k8s.io/kube-apiserver:v1.28.3
    
# Command and arguments
    Command:
      kube-apiserver
      --advertise-address=192.168.49.2
      --allow-privileged=true
      --authorization-mode=Node,RBAC
      --enable-admission-plugins=NamespaceLifecycle,LimitRanger,...
      --etcd-servers=https://127.0.0.1:2379
      --secure-port=6443
```

**💡 Explanation:**
- **--advertise-address**: IP where API server is accessible
- **--authorization-mode=RBAC**: Role-Based Access Control is enabled
- **--etcd-servers**: API server connects to etcd on localhost
- **--secure-port=6443**: HTTPS port for API requests

### Step 3.3: Check Cluster Information

```bash
# Get cluster endpoint and services
kubectl cluster-info
```

**Expected Output:**
```
Kubernetes control plane is running at https://192.168.49.2:8443
CoreDNS is running at https://192.168.49.2:8443/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy
```

**💡 Explanation:**
- Control plane accessible at 192.168.49.2:8443 (HTTPS)
- CoreDNS provides DNS services for the cluster
- All services are proxied through the API server

---

## 📝 Part 4: Creating a Multi-Node Cluster

### Step 4.1: Delete Existing Cluster

```bash
# Stop and delete the current cluster
minikube delete
```

**Expected Output:**
```
🔥  Deleting "minikube" in docker ...
🔥  Deleting container "minikube" ...
🔥  Removing /Users/username/.minikube/machines/minikube ...
💀  Removed all traces of the "minikube" cluster.
```

### Step 4.2: Create Multi-Node Cluster

```bash
# Start minikube with 3 nodes (1 control plane + 2 workers)
minikube start --nodes 3 --cpus 2 --memory 2048
```

**💡 Parameter Explanation:**
- **--nodes 3**: Create 3 nodes total
- **--cpus 2**: Allocate 2 CPUs per node
- **--memory 2048**: Allocate 2GB RAM per node

**Expected Output:**
```
😄  minikube v1.32.0 on Darwin 13.5.2
✨  Automatically selected the docker driver
📌  Using Docker Desktop driver with root privileges
👍  Starting control plane node minikube in cluster minikube
🚜  Pulling base image ...
🔥  Creating docker container (CPUs=2, Memory=2048MB) ...
🐳  Preparing Kubernetes v1.28.3 on Docker 24.0.7 ...
🔎  Verifying Kubernetes components...
🌟  Enabled addons: storage-provisioner, default-storageclass

👍  Starting worker node minikube-m02 in cluster minikube
🚜  Pulling base image ...
🔥  Creating docker container (CPUs=2, Memory=2048MB) ...
🌐  Found network options:
    ▪ NO_PROXY=192.168.49.2
🐳  Preparing Kubernetes v1.28.3 on Docker 24.0.7 ...
🔎  Verifying Kubernetes components...

👍  Starting worker node minikube-m03 in cluster minikube
🚜  Pulling base image ...
🔥  Creating docker container (CPUs=2, Memory=2048MB) ...
🌐  Found network options:
    ▪ NO_PROXY=192.168.49.2,192.168.49.3
🐳  Preparing Kubernetes v1.28.3 on Docker 24.0.7 ...
🔎  Verifying Kubernetes components...

🏄  Done! kubectl is now configured to use "minikube" cluster
```

### Step 4.3: Verify Multi-Node Cluster

```bash
# List all nodes
kubectl get nodes
```

**Expected Output:**
```
NAME           STATUS   ROLES           AGE   VERSION
minikube       Ready    control-plane   2m    v1.28.3
minikube-m02   Ready    <none>          1m    v1.28.3
minikube-m03   Ready    <none>          1m    v1.28.3
```

**💡 Cluster Architecture:**
```
┌─────────────────────────────────────────────────┐
│            Multi-Node Cluster                   │
│                                                 │
│  ┌──────────────────┐                          │
│  │    minikube      │  ← Control Plane Node    │
│  │  (control-plane) │                          │
│  └──────────────────┘                          │
│           │                                     │
│           │ Manages                             │
│           ▼                                     │
│  ┌──────────────────┐  ┌──────────────────┐   │
│  │  minikube-m02    │  │  minikube-m03    │   │
│  │   (worker)       │  │   (worker)       │   │
│  └──────────────────┘  └──────────────────┘   │
│                                                 │
│  Pods will be scheduled across worker nodes    │
└─────────────────────────────────────────────────┘
```

```bash
# Get more detailed node information
kubectl get nodes -o wide
```

**Expected Output:**
```
NAME           STATUS   ROLES           AGE   VERSION   INTERNAL-IP    EXTERNAL-IP   OS-IMAGE             KERNEL-VERSION     CONTAINER-RUNTIME
minikube       Ready    control-plane   3m    v1.28.3   192.168.49.2   <none>        Ubuntu 22.04.3 LTS   5.15.0-1053-gcp    containerd://1.6.24
minikube-m02   Ready    <none>          2m    v1.28.3   192.168.49.3   <none>        Ubuntu 22.04.3 LTS   5.15.0-1053-gcp    containerd://1.6.24
minikube-m03   Ready    <none>          2m    v1.28.3   192.168.49.4   <none>        Ubuntu 22.04.3 LTS   5.15.0-1053-gcp    containerd://1.6.24
```

**💡 Additional Information:**
- **INTERNAL-IP**: IP address within the cluster network
- **OS-IMAGE**: Operating system running on each node
- **CONTAINER-RUNTIME**: containerd is managing containers

---

## 📝 Part 5: Labeling Nodes

### Step 5.1: Understanding Node Labels

Node labels are key-value pairs attached to nodes. They're used for:
- **Scheduling**: Direct pods to specific nodes
- **Organization**: Categorize nodes by purpose, hardware, location
- **Selection**: Filter nodes with kubectl

**Label Syntax:**
```
key=value
```

**Common label examples:**
- `environment=production`
- `disktype=ssd`
- `gpu=true`
- `purpose=web-server`

### Step 5.2: View Existing Labels

```bash
# Show labels for all nodes
kubectl get nodes --show-labels
```

**Expected Output:**
```
NAME           STATUS   ROLES           AGE   VERSION   LABELS
minikube       Ready    control-plane   5m    v1.28.3   beta.kubernetes.io/arch=amd64,beta.kubernetes.io/os=linux,kubernetes.io/arch=amd64,kubernetes.io/hostname=minikube,kubernetes.io/os=linux,node-role.kubernetes.io/control-plane=,node.kubernetes.io/exclude-from-external-load-balancers=
minikube-m02   Ready    <none>          4m    v1.28.3   beta.kubernetes.io/arch=amd64,beta.kubernetes.io/os=linux,kubernetes.io/arch=amd64,kubernetes.io/hostname=minikube-m02,kubernetes.io/os=linux
minikube-m03   Ready    <none>          4m    v1.28.3   beta.kubernetes.io/arch=amd64,beta.kubernetes.io/os=linux,kubernetes.io/arch=amd64,kubernetes.io/hostname=minikube-m03,kubernetes.io/os=linux
```

**💡 Default Labels:**
- `kubernetes.io/hostname`: Node's hostname
- `kubernetes.io/arch`: CPU architecture (amd64, arm64)
- `kubernetes.io/os`: Operating system (linux, windows)
- `node-role.kubernetes.io/control-plane`: Marks control plane nodes

### Step 5.3: Add Custom Labels

```bash
# Label minikube-m02 as a web server node
kubectl label node minikube-m02 purpose=web-server

# Label minikube-m03 as a database node
kubectl label node minikube-m03 purpose=database

# Label minikube-m02 with disk type
kubectl label node minikube-m02 disktype=ssd
```

**Expected Output:**
```
node/minikube-m02 labeled
node/minikube-m03 labeled
node/minikube-m02 labeled
```

### Step 5.4: Verify Labels

```bash
# View specific labels
kubectl get nodes -L purpose,disktype
```

**Expected Output:**
```
NAME           STATUS   ROLES           AGE   VERSION   PURPOSE      DISKTYPE
minikube       Ready    control-plane   7m    v1.28.3   
minikube-m02   Ready    <none>          6m    v1.28.3   web-server   ssd
minikube-m03   Ready    <none>          6m    v1.28.3   database
```

**💡 Explanation:**
- `-L purpose,disktype`: Show these specific labels as columns
- Empty cells mean the label doesn't exist on that node

### Step 5.5: Filter Nodes by Label

```bash
# Show only nodes with purpose=web-server
kubectl get nodes -l purpose=web-server
```

**Expected Output:**
```
NAME           STATUS   ROLES    AGE   VERSION
minikube-m02   Ready    <none>   7m    v1.28.3
```

```bash
# Show nodes that have the disktype label (any value)
kubectl get nodes -l disktype
```

**Expected Output:**
```
NAME           STATUS   ROLES    AGE   VERSION
minikube-m02   Ready    <none>   8m    v1.28.3
```

**💡 Label Selectors:**
- `-l purpose=web-server`: Exact match
- `-l disktype`: Label exists (any value)
- `-l 'purpose in (web-server,database)'`: Multiple values
- `-l purpose!=web-server`: Not equal

---

## 📝 Part 6: Accessing the Cluster

### Step 6.1: SSH into a Node

```bash
# SSH into the control plane node
minikube ssh
```

**You're now inside the minikube node!**

```bash
# Check Docker containers (Kubernetes pods run as containers)
docker ps | head -5
```

**Expected Output:**
```
CONTAINER ID   IMAGE                                 COMMAND                  CREATED
abc123def456   registry.k8s.io/pause:3.9            "/pause"                 10m
def456ghi789   registry.k8s.io/kube-apiserver:v1.28 "kube-apiserver --ad…"   10m
```

**💡 Explanation:**
- Kubernetes pods are implemented as Docker containers
- Each pod has a "pause" container that holds the network namespace
- Component containers share the pause container's network

```bash
# View kubelet process
ps aux | grep kubelet
```

```bash
# Exit the SSH session
exit
```

### Step 6.2: Access Kubernetes Dashboard (Optional)

```bash
# Enable the dashboard addon
minikube addons enable dashboard

# Open dashboard in browser
minikube dashboard
```

**This will:**
1. Deploy the Kubernetes dashboard
2. Create a proxy to access it
3. Open your browser automatically

**💡 The Dashboard provides:**
- Visual overview of cluster resources
- Pod logs and metrics
- Resource creation via UI
- Troubleshooting tools

---

## ✅ Validation Steps

### Validate Your Cluster

Run these commands to ensure everything is working:

```bash
# 1. Check all nodes are Ready
kubectl get nodes
# Expected: All nodes show STATUS=Ready

# 2. Check all system pods are Running
kubectl get pods -n kube-system
# Expected: All pods show STATUS=Running

# 3. Verify labels are applied
kubectl get nodes -L purpose,disktype
# Expected: Labels visible on minikube-m02 and minikube-m03

# 4. Test cluster connectivity
kubectl cluster-info
# Expected: Control plane and CoreDNS URLs displayed

# 5. Check cluster version
kubectl version --short
# Expected: Client and Server versions displayed
```

---

## 🧹 Cleanup

```bash
# Stop the cluster (preserves it for later)
minikube stop

# Delete the cluster completely
minikube delete

# Delete all minikube clusters
minikube delete --all
```

---

## 🎯 Challenge Tasks

1. **Custom Configuration**: Create a cluster with 4 nodes, 4 CPUs, and 4GB RAM per node
   ```bash
   minikube start --nodes 4 --cpus 4 --memory 4096
   ```

2. **Label Practice**: Add labels for `environment=dev` and `region=us-west` to different nodes

3. **Explore Components**: Use `kubectl logs` to view logs from the kube-scheduler pod

4. **Resource Investigation**: Use `kubectl describe node` to find how much CPU and memory is allocated vs available

---

## 🐛 Troubleshooting

### Issue: Minikube won't start

**Error:** `Exiting due to GUEST_PROVISION: error provisioning host`

**Solution:**
```bash
# Delete and recreate
minikube delete
minikube start

# Or try a different driver
minikube start --driver=virtualbox
```

### Issue: kubectl not connecting

**Error:** `The connection to the server localhost:8080 was refused`

**Solution:**
```bash
# Reconfigure kubectl
minikube update-context

# Or manually set context
kubectl config use-context minikube
```

### Issue: Not enough resources

**Error:** `Requested cpu count 2 is greater than available cpus`

**Solution:**
```bash
# Start with fewer resources
minikube start --cpus 1 --memory 2048
```

---

## 📚 Key Takeaways

✅ **Minikube** is a tool for running Kubernetes locally  
✅ **Control plane** manages the cluster; **worker nodes** run workloads  
✅ **kubectl** is the CLI for interacting with Kubernetes  
✅ **Labels** enable flexible node selection and organization  
✅ **System pods** in kube-system namespace run cluster components  
✅ **Multi-node clusters** better simulate production environments  

---

## 📖 Next Steps

Continue to [Lab 1.2: Multi-Node Cluster with Kind](lab-1.2-kind-cluster.md) to learn an alternative cluster creation method.

---

## 📝 Lab Completion Checklist

- [ ] Installed minikube and kubectl
- [ ] Created a single-node cluster
- [ ] Explored cluster components in kube-system
- [ ] Created a multi-node cluster (3 nodes)
- [ ] Applied labels to nodes
- [ ] Filtered nodes using label selectors
- [ ] SSH'd into a minikube node
- [ ] Validated cluster health
- [ ] Cleaned up resources

**Congratulations! You've completed Lab 1.1** 🎉
