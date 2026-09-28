# Lab 1.1: Installing and Using Lens - The Kubernetes IDE

## 📚 Related Topics
- Kubernetes desktop management
- Visual cluster navigation
- Multi-cluster management
- Integrated terminal
- Resource visualization

## 🎯 Learning Objectives

By the end of this lab, you will be able to:
- Install Lens on your operating system
- Add and manage Kubernetes clusters
- Navigate the Lens interface
- View and manage resources visually
- Use the integrated terminal
- Monitor cluster health
- Deploy applications via Lens
- Manage multiple clusters

## ⏱️ Estimated Time
45-60 minutes

## 📋 Prerequisites

- Kubernetes cluster (minikube, kind, or cloud)
- kubectl configured with cluster access
- Desktop environment (Mac, Windows, or Linux)

---

## 🏗️ Lens Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                  Lens Desktop Application                    │
└──────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Lens IDE                                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Cluster Catalog                                     │  │
│  │  • Local clusters (minikube, kind, docker-desktop)   │  │
│  │  • Cloud clusters (GKE, EKS, AKS)                    │  │
│  │  • Multiple contexts                                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Cluster View                                        │  │
│  │  ┌────────────┬────────────────────────────────────┐ │  │
│  │  │ Sidebar    │ Main Panel                         │ │  │
│  │  │ • Workloads│ • Resource list                    │ │  │
│  │  │ • Config   │ • Details view                     │ │  │
│  │  │ • Network  │ • YAML editor                      │ │  │
│  │  │ • Storage  │ • Logs viewer                      │ │  │
│  │  │ • Namespaces│ • Terminal                        │ │  │
│  │  └────────────┴────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Built-in Features                                   │  │
│  │  • Prometheus metrics integration                    │  │
│  │  • Real-time resource monitoring                     │  │
│  │  • Helm chart deployment                             │  │
│  │  • Terminal with kubectl                             │  │
│  │  • Extensions support                                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

Key Features:
  • Visual resource management
  • Multi-cluster support
  • Real-time updates
  • Integrated terminal
  • Metrics visualization
```

---

## 📝 Part 1: Installing Lens

### Step 1.1: Download Lens

**Visit Lens Website:**
- URL: https://k8slens.dev/
- Click "Download" button
- Select your operating system

**Installation Options:**

**macOS:**
```bash
# Download DMG file
# Or use Homebrew
brew install --cask lens
```

**Windows:**
```powershell
# Download .exe installer
# Or use Chocolatey
choco install lens
```

**Linux (Ubuntu/Debian):**
```bash
# Download .AppImage or .deb
# For .deb:
sudo dpkg -i Lens-*.deb
sudo apt-get install -f
```

### Step 1.2: Launch Lens

```
1. Open Lens application
2. Accept terms and conditions
3. Skip telemetry (optional)
```

**Expected First Screen:**
```
┌─────────────────────────────────────────────────────────────┐
│  Welcome to Lens                                            │
│                                                             │
│  The Kubernetes IDE                                         │
│                                                             │
│  [Add Cluster]  [Browse Catalog]                           │
│                                                             │
│  No clusters connected yet                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 Part 2: Adding Your First Cluster

### Step 2.1: Add Cluster from Kubeconfig

**Method 1: Auto-detect from kubeconfig**
```
1. Click "+" or "Add Cluster"
2. Lens auto-detects clusters from ~/.kube/config
3. Select cluster (e.g., minikube, docker-desktop)
4. Click "Add Cluster"
```

**Method 2: Paste kubeconfig**
```
1. Click "Add Cluster"
2. Select "Paste as Text"
3. Copy your kubeconfig:
```

```bash
# Get kubeconfig
cat ~/.kube/config
```

```
4. Paste into Lens
5. Click "Add Cluster"
```

**Expected Result:**
```
✓ Cluster "minikube" added successfully
```

### Step 2.2: Connect to Cluster

```
1. Click on cluster name
2. Lens connects and loads cluster data
3. Wait for initial sync
```

**Expected View:**
```
┌─────────────────────────────────────────────────────────────┐
│  minikube                                    ● Connected    │
├─────────────────────────────────────────────────────────────┤
│  Cluster: minikube                                          │
│  Version: v1.28.0                                           │
│  Nodes: 1                                                   │
│  CPU: 4 cores                                               │
│  Memory: 8 GB                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 Part 3: Navigating the Lens Interface

### Step 3.1: Cluster Overview

**Overview Dashboard shows:**
```
┌─────────────────────────────────────────────────────────────┐
│  Cluster Overview                                           │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Nodes: 1    │  │  Pods: 15    │  │  CPU: 25%    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  CPU Usage (graph)                                   │  │
│  │  ▁▂▃▄▅▆▇█▇▆▅▄▃▂▁                                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Memory Usage (graph)                                │  │
│  │  ▁▁▂▂▃▃▄▄▅▅▆▆▇▇                                       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Step 3.2: Sidebar Navigation

**Workloads Section:**
```
├─ Workloads
│  ├─ Overview
│  ├─ Pods
│  ├─ Deployments
│  ├─ StatefulSets
│  ├─ DaemonSets
│  ├─ Jobs
│  └─ CronJobs
```

**Configuration Section:**
```
├─ Configuration
│  ├─ ConfigMaps
│  ├─ Secrets
│  ├─ Resource Quotas
│  └─ HPA
```

**Network Section:**
```
├─ Network
│  ├─ Services
│  ├─ Endpoints
│  ├─ Ingresses
│  └─ Network Policies
```

**Storage Section:**
```
├─ Storage
│  ├─ Persistent Volumes
│  ├─ Persistent Volume Claims
│  └─ Storage Classes
```

---

## 📝 Part 4: Managing Resources Visually

### Step 4.1: View Pods

```
1. Click "Workloads" → "Pods"
2. See list of all pods
```

**Pod List View:**
```
┌─────────────────────────────────────────────────────────────┐
│  Pods                                    Namespace: All ▼   │
├──────────────┬────────┬─────────┬──────────┬───────────────┤
│ NAME         │ READY  │ STATUS  │ RESTARTS │ AGE           │
├──────────────┼────────┼─────────┼──────────┼───────────────┤
│ coredns-xxx  │ 1/1    │ Running │ 0        │ 5h            │
│ etcd-xxx     │ 1/1    │ Running │ 0        │ 5h            │
│ nginx-xxx    │ 1/1    │ Running │ 0        │ 10m           │
└──────────────┴────────┴─────────┴──────────┴───────────────┘
```

### Step 4.2: View Pod Details

```
1. Click on a pod name
2. Details panel opens
```

**Pod Details:**
```
┌─────────────────────────────────────────────────────────────┐
│  nginx-deployment-7c6f9f8c8d-abc12                         │
├─────────────────────────────────────────────────────────────┤
│  Namespace: default                                         │
│  Node: minikube                                             │
│  Status: Running                                            │
│  IP: 10.244.0.5                                             │
│  Created: 10 minutes ago                                    │
│                                                             │
│  Containers:                                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  nginx                                              │   │
│  │  Image: nginx:latest                                │   │
│  │  State: Running (started 10m ago)                   │   │
│  │  CPU: 5m                                            │   │
│  │  Memory: 10Mi                                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [Logs] [Shell] [Edit] [Delete]                           │
└─────────────────────────────────────────────────────────────┘
```

### Step 4.3: View Pod Logs

```
1. In pod details, click "Logs" button
2. Logs panel opens
```

**Logs View:**
```
┌─────────────────────────────────────────────────────────────┐
│  Logs: nginx-deployment-7c6f9f8c8d-abc12                   │
│  Container: nginx ▼                        [Follow] [Wrap]  │
├─────────────────────────────────────────────────────────────┤
│  2026/09/28 10:00:00 [notice] 1#1: using the "epoll"       │
│  2026/09/28 10:00:00 [notice] 1#1: nginx/1.25.0            │
│  2026/09/28 10:00:00 [notice] 1#1: built by gcc 12.2.0     │
│  2026/09/28 10:00:00 [notice] 1#1: OS: Linux 5.15.0        │
│  2026/09/28 10:00:00 [notice] 1#1: getrlimit(RLIMIT_NOFILE│
│  2026/09/28 10:00:00 [notice] 1#1: start worker processes  │
│                                                             │
│  [Download] [Search] [Clear]                               │
└─────────────────────────────────────────────────────────────┘
```

**💡 Logs auto-update in real-time!**

### Step 4.4: Shell into Container

```
1. In pod details, click "Shell" button
2. Terminal opens in container
```

**Shell View:**
```
┌─────────────────────────────────────────────────────────────┐
│  Shell: nginx-deployment-7c6f9f8c8d-abc12 / nginx          │
├─────────────────────────────────────────────────────────────┤
│  root@nginx-deployment-7c6f9f8c8d-abc12:/# ls              │
│  bin   dev  home  lib64  mnt  proc  run   srv  tmp  var    │
│  boot  etc  lib   media  opt  root  sbin  sys  usr         │
│  root@nginx-deployment-7c6f9f8c8d-abc12:/# pwd             │
│  /                                                          │
│  root@nginx-deployment-7c6f9f8c8d-abc12:/#                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 Part 5: Deploying Applications

### Step 5.1: Create Deployment via UI

```
1. Click "Workloads" → "Deployments"
2. Click "+" button (top right)
3. Fill in form:
```

**Create Deployment Form:**
```
Name: my-nginx
Namespace: default
Replicas: 3
Image: nginx:latest
Port: 80

[Create]
```

**Or use YAML:**
```
1. Click "Create Resource" (+ icon)
2. Select "From YAML"
3. Paste YAML:
```

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-nginx
  namespace: default
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:latest
        ports:
        - containerPort: 80
```

```
4. Click "Create & Close"
```

### Step 5.2: Expose Deployment as Service

```
1. Go to deployment
2. Click "..." menu
3. Select "Create Service"
4. Configure:
```

**Service Configuration:**
```
Name: nginx-service
Type: ClusterIP
Port: 80
Target Port: 80

[Create]
```

---

## 📝 Part 6: Monitoring and Metrics

### Step 6.1: Enable Metrics

**Lens uses Prometheus for metrics:**
```
1. Settings → Metrics
2. Enable "Prometheus"
3. Lens will install metrics-server if needed
```

### Step 6.2: View Pod Metrics

```
1. Go to Pods view
2. Metrics columns appear:
   - CPU usage
   - Memory usage
   - Network I/O
```

**Pods with Metrics:**
```
┌─────────────────────────────────────────────────────────────┐
│  Pods                                                       │
├──────────┬────────┬─────────┬─────────┬──────────┬─────────┤
│ NAME     │ READY  │ STATUS  │ CPU     │ MEMORY   │ AGE     │
├──────────┼────────┼─────────┼─────────┼──────────┼─────────┤
│ nginx-1  │ 1/1    │ Running │ 5m      │ 10Mi     │ 10m     │
│ nginx-2  │ 1/1    │ Running │ 3m      │ 8Mi      │ 10m     │
│ nginx-3  │ 1/1    │ Running │ 4m      │ 9Mi      │ 10m     │
└──────────┴────────┴─────────┴─────────┴──────────┴─────────┘
```

### Step 6.3: View Resource Graphs

```
1. Click on a pod
2. Scroll to "Metrics" section
3. See CPU and Memory graphs
```

**Metrics Graphs:**
```
┌─────────────────────────────────────────────────────────────┐
│  CPU Usage                                                  │
│  10m ┤                                    ╭──────           │
│   8m ┤                          ╭─────────╯                 │
│   6m ┤                ╭─────────╯                           │
│   4m ┤      ╭─────────╯                                     │
│   2m ┤──────╯                                               │
│      └─────────────────────────────────────────────────     │
│       10:00   10:15   10:30   10:45   11:00                │
│                                                             │
│  Memory Usage                                               │
│  15Mi┤                                    ╭──────           │
│  12Mi┤                          ╭─────────╯                 │
│   9Mi┤                ╭─────────╯                           │
│   6Mi┤      ╭─────────╯                                     │
│   3Mi┤──────╯                                               │
│      └─────────────────────────────────────────────────     │
│       10:00   10:15   10:30   10:45   11:00                │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 Part 7: Multi-Cluster Management

### Step 7.1: Add Multiple Clusters

```
1. Click "Catalog" (top left)
2. Click "+" to add another cluster
3. Repeat for each cluster
```

**Cluster Catalog:**
```
┌─────────────────────────────────────────────────────────────┐
│  Clusters                                                   │
├─────────────────────────────────────────────────────────────┤
│  ● minikube              (local)         [Connect]          │
│  ● production-gke        (GKE)           [Connect]          │
│  ● staging-eks           (EKS)           [Connect]          │
│  ○ development-kind      (local)         [Connect]          │
└─────────────────────────────────────────────────────────────┘
```

### Step 7.2: Switch Between Clusters

```
1. Click cluster name in catalog
2. Lens switches context
3. All views update to new cluster
```

**💡 No need to run kubectl config use-context!**

---

## 📝 Part 8: Advanced Features

### Step 8.1: Helm Charts

```
1. Click "Apps" → "Charts"
2. Browse Helm charts
3. Click chart to install
```

**Helm Chart Installation:**
```
1. Select chart (e.g., nginx)
2. Configure values
3. Click "Install"
```

### Step 8.2: Extensions

```
1. File → Extensions (or Cmd/Ctrl+Shift+E)
2. Browse available extensions
3. Install extensions
```

**Popular Extensions:**
- **Resource Map**: Visualize resource relationships
- **Pod Security**: Security scanning
- **Cost Estimation**: Resource cost tracking

### Step 8.3: Terminal

```
1. Click Terminal icon (bottom)
2. Built-in terminal opens
3. kubectl is pre-configured
```

**Terminal View:**
```
┌─────────────────────────────────────────────────────────────┐
│  Terminal                                                   │
├─────────────────────────────────────────────────────────────┤
│  $ kubectl get pods                                         │
│  NAME                     READY   STATUS    RESTARTS   AGE  │
│  nginx-7c6f9f8c8d-abc12   1/1     Running   0          10m  │
│  nginx-7c6f9f8c8d-def34   1/1     Running   0          10m  │
│  nginx-7c6f9f8c8d-ghi56   1/1     Running   0          10m  │
│  $                                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Validation Steps

```
# 1. Verify Lens is installed
# Open Lens application

# 2. Verify cluster is connected
# Check green dot next to cluster name

# 3. View pods
# Workloads → Pods → See pod list

# 4. View logs
# Click pod → Logs → See log output

# 5. Shell into container
# Click pod → Shell → Run commands

# 6. Check metrics
# Verify CPU/Memory columns show data
```

---

## 🧹 Cleanup

```
# To remove cluster from Lens:
1. Right-click cluster in catalog
2. Select "Remove"
3. Confirm

# To uninstall Lens:
# macOS:
brew uninstall --cask lens

# Windows:
# Use "Add or Remove Programs"

# Linux:
sudo apt remove lens
```

---

## 🎯 Challenge Tasks

### Challenge 1: Deploy Multi-Tier App
```
Deploy a complete app stack:
- Frontend (nginx)
- Backend (API)
- Database (PostgreSQL)
- All via Lens UI
```

### Challenge 2: Monitor Resource Usage
```
Track resource usage:
- Enable metrics
- Monitor for 1 hour
- Identify resource-heavy pods
```

### Challenge 3: Multi-Cluster Deployment
```
Deploy same app to multiple clusters:
- Use Lens to switch between clusters
- Deploy to each
- Compare resource usage
```

---

## 📚 Key Takeaways

✅ **Lens** is a powerful Kubernetes IDE  
✅ **Visual interface** simplifies cluster management  
✅ **Multi-cluster** support in one application  
✅ **Integrated terminal** with kubectl  
✅ **Real-time metrics** and monitoring  
✅ **Logs and shell** access built-in  
✅ **Helm charts** can be deployed visually  
✅ **Extensions** add custom functionality  

---

## 📖 Next Steps

**Continue Learning:**
- Explore Lens extensions
- Try Lens Pro features
- Integrate with CI/CD
- Use for production monitoring

---

## 📝 Lab Completion Checklist

- [ ] Installed Lens
- [ ] Added Kubernetes cluster
- [ ] Navigated the interface
- [ ] Viewed pods and logs
- [ ] Shelled into container
- [ ] Deployed application
- [ ] Enabled metrics
- [ ] Added multiple clusters
- [ ] Used integrated terminal
- [ ] Completed challenge tasks

**Congratulations! You've mastered Lens basics!** 🎉
