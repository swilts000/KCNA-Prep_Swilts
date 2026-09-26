# Lab 2.1: Node Management & Maintenance

## 📚 Related Chapters
- **Chapter 5**: Orchestrating Containers with Kubernetes
- **Chapter 7**: Application Placement and Debugging with Kubernetes
- **Chapter 8**: Following Kubernetes Best Practices

## 🎯 Learning Objectives

By the end of this lab, you will be able to:
- Safely cordon nodes to prevent new pod scheduling
- Drain nodes for maintenance without disrupting services
- Uncordon nodes to resume normal operations
- Add and remove nodes from a cluster
- Apply taints and tolerations for workload isolation
- Perform zero-downtime node maintenance
- Understand pod disruption budgets

## ⏱️ Estimated Time
60-75 minutes

## 📋 Prerequisites

- Running multi-node Kubernetes cluster (minikube with 3+ nodes or kind)
- kubectl installed and configured
- Completed Lab 1.1 (Minikube cluster setup)
- Understanding of Deployments (Chapter 6)

---

## 🏗️ Node Maintenance Workflow

```
┌─────────────────────────────────────────────────────────────┐
│              Safe Node Maintenance Process                  │
└─────────────────────────────────────────────────────────────┘

Step 1: CORDON
┌──────────────┐
│     Node     │  ← Mark as unschedulable
│ (Cordoned)   │     New pods won't be placed here
└──────────────┘     Existing pods keep running
      ▲
      │ kubectl cordon <node>
      │

Step 2: DRAIN
┌──────────────┐
│     Node     │  ← Evict all pods gracefully
│  (Drained)   │     Pods recreated on other nodes
└──────────────┘     Node is empty and safe for maintenance
      ▲
      │ kubectl drain <node>
      │

Step 3: MAINTENANCE
┌──────────────┐
│     Node     │  ← Perform maintenance
│ (Offline)    │     Upgrade, reboot, hardware fixes
└──────────────┘
      ▲
      │ System maintenance
      │

Step 4: UNCORDON
┌──────────────┐
│     Node     │  ← Mark as schedulable again
│   (Ready)    │     New pods can be placed here
└──────────────┘
      ▲
      │ kubectl uncordon <node>
      │

Complete! Node back in service
```

---

## 📝 Part 1: Setting Up a Multi-Node Cluster

### Step 1.1: Create Multi-Node Cluster

```bash
# If you don't have a multi-node cluster, create one
minikube delete  # Delete existing cluster
minikube start --nodes 3 --cpus 2 --memory 2048
```

**Expected Output:**
```
😄  minikube v1.32.0 on Darwin 13.5.2
✨  Automatically selected the docker driver
👍  Starting control plane node minikube in cluster minikube
🚜  Pulling base image ...
🔥  Creating docker container (CPUs=2, Memory=2048MB) ...
🐳  Preparing Kubernetes v1.28.3 on Docker 24.0.7 ...
🔎  Verifying Kubernetes components...
🌟  Enabled addons: storage-provisioner, default-storageclass

👍  Starting worker node minikube-m02 in cluster minikube
🚜  Pulling base image ...
🔥  Creating docker container (CPUs=2, Memory=2048MB) ...
🐳  Preparing Kubernetes v1.28.3 on Docker 24.0.7 ...
🔎  Verifying Kubernetes components...

👍  Starting worker node minikube-m03 in cluster minikube
🚜  Pulling base image ...
🔥  Creating docker container (CPUs=2, Memory=2048MB) ...
🐳  Preparing Kubernetes v1.28.3 on Docker 24.0.7 ...
🔎  Verifying Kubernetes components...

🏄  Done! kubectl is now configured to use "minikube" cluster
```

### Step 1.2: Verify Cluster Nodes

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

**💡 Node Breakdown:**
- **minikube**: Control plane node (manages cluster)
- **minikube-m02**: Worker node (runs workloads)
- **minikube-m03**: Worker node (runs workloads)

```bash
# Get detailed node information
kubectl get nodes -o wide
```

**Expected Output:**
```
NAME           STATUS   ROLES           AGE   VERSION   INTERNAL-IP    EXTERNAL-IP   OS-IMAGE             KERNEL-VERSION     CONTAINER-RUNTIME
minikube       Ready    control-plane   3m    v1.28.3   192.168.49.2   <none>        Ubuntu 22.04.3 LTS   5.15.0-1053-gcp    containerd://1.6.24
minikube-m02   Ready    <none>          2m    v1.28.3   192.168.49.3   <none>        Ubuntu 22.04.3 LTS   5.15.0-1053-gcp    containerd://1.6.24
minikube-m03   Ready    <none>          2m    v1.28.3   192.168.49.4   <none>        Ubuntu 22.04.3 LTS   5.15.0-1053-gcp    containerd://1.6.24
```

---

## 📝 Part 2: Deploy Test Application

### Step 2.1: Create a Deployment

```bash
# Deploy nginx with 6 replicas across nodes
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
spec:
  replicas: 6
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
        image: nginx:1.21
        ports:
        - containerPort: 80
EOF
```

**💡 Why 6 replicas?**
- With 3 nodes, pods will be distributed
- Typically 2 pods per node
- Demonstrates pod redistribution during maintenance

### Step 2.2: Verify Pod Distribution

```bash
# Check which node each pod is on
kubectl get pods -o wide
```

**Expected Output:**
```
NAME                                READY   STATUS    RESTARTS   AGE   IP           NODE
nginx-deployment-xxxxxxxxxx-aaaaa   1/1     Running   0          30s   10.244.1.2   minikube-m02
nginx-deployment-xxxxxxxxxx-bbbbb   1/1     Running   0          30s   10.244.2.2   minikube-m03
nginx-deployment-xxxxxxxxxx-ccccc   1/1     Running   0          30s   10.244.1.3   minikube-m02
nginx-deployment-xxxxxxxxxx-ddddd   1/1     Running   0          30s   10.244.2.3   minikube-m03
nginx-deployment-xxxxxxxxxx-eeeee   1/1     Running   0          30s   10.244.1.4   minikube-m02
nginx-deployment-xxxxxxxxxx-fffff   1/1     Running   0          30s   10.244.2.4   minikube-m03
```

**💡 Pod Distribution:**
- Pods are spread across worker nodes (minikube-m02 and minikube-m03)
- Control plane node (minikube) typically doesn't run user workloads
- This is due to taints on the control plane node

```bash
# Count pods per node
kubectl get pods -o wide | awk '{print $7}' | sort | uniq -c
```

**Expected Output:**
```
      1 NODE
      3 minikube-m02
      3 minikube-m03
```

**💡 Balanced Distribution:**
- 3 pods on minikube-m02
- 3 pods on minikube-m03
- 0 pods on minikube (control plane)

---

## 📝 Part 3: Cordoning a Node

### Step 3.1: Understanding Cordon

**What is Cordoning?**
- Marks a node as **unschedulable**
- **Existing pods** continue running
- **New pods** won't be scheduled on this node
- Used to prepare for maintenance

**Cordon vs Drain:**
```
┌──────────────┬─────────────────┬─────────────────┐
│   Action     │  Existing Pods  │   New Pods      │
├──────────────┼─────────────────┼─────────────────┤
│ Cordon       │ Keep running    │ Not scheduled   │
│ Drain        │ Evicted         │ Not scheduled   │
└──────────────┴─────────────────┴─────────────────┘
```

### Step 3.2: Cordon a Node

```bash
# Cordon minikube-m02
kubectl cordon minikube-m02
```

**Expected Output:**
```
node/minikube-m02 cordoned
```

### Step 3.3: Verify Node Status

```bash
# Check node status
kubectl get nodes
```

**Expected Output:**
```
NAME           STATUS                     ROLES           AGE   VERSION
minikube       Ready                      control-plane   10m   v1.28.3
minikube-m02   Ready,SchedulingDisabled   <none>          9m    v1.28.3
minikube-m03   Ready                      <none>          9m    v1.28.3
```

**💡 SchedulingDisabled:**
- Node is healthy (Ready)
- But new pods won't be scheduled here
- Existing pods still running

```bash
# Describe the cordoned node
kubectl describe node minikube-m02 | grep -A 5 "Taints:"
```

**Expected Output:**
```
Taints:             node.kubernetes.io/unschedulable:NoSchedule
Unschedulable:      true
```

**💡 Taint Explanation:**
- **Taint**: `node.kubernetes.io/unschedulable:NoSchedule`
- **Effect**: Prevents new pods from being scheduled
- **Unschedulable**: true

### Step 3.4: Test Scheduling Behavior

```bash
# Scale up the deployment
kubectl scale deployment nginx-deployment --replicas=9
```

**Expected Output:**
```
deployment.apps/nginx-deployment scaled
```

```bash
# Check pod distribution
kubectl get pods -o wide
```

**Expected Output:**
```
NAME                                READY   STATUS    RESTARTS   AGE   IP           NODE
nginx-deployment-xxxxxxxxxx-aaaaa   1/1     Running   0          5m    10.244.1.2   minikube-m02
nginx-deployment-xxxxxxxxxx-bbbbb   1/1     Running   0          5m    10.244.2.2   minikube-m03
nginx-deployment-xxxxxxxxxx-ccccc   1/1     Running   0          5m    10.244.1.3   minikube-m02
nginx-deployment-xxxxxxxxxx-ddddd   1/1     Running   0          5m    10.244.2.3   minikube-m03
nginx-deployment-xxxxxxxxxx-eeeee   1/1     Running   0          5m    10.244.1.4   minikube-m02
nginx-deployment-xxxxxxxxxx-fffff   1/1     Running   0          5m    10.244.2.4   minikube-m03
nginx-deployment-xxxxxxxxxx-ggggg   1/1     Running   0          10s   10.244.2.5   minikube-m03
nginx-deployment-xxxxxxxxxx-hhhhh   1/1     Running   0          10s   10.244.2.6   minikube-m03
nginx-deployment-xxxxxxxxxx-iiiii   1/1     Running   0          10s   10.244.2.7   minikube-m03
```

**💡 Scheduling Behavior:**
- **Old pods** on minikube-m02: Still running (3 pods)
- **New pods**: Only scheduled on minikube-m03 (3 new pods)
- **Total on m03**: 6 pods (old + new)
- **Total on m02**: 3 pods (unchanged)

```bash
# Count pods per node
kubectl get pods -o wide | awk '{print $7}' | sort | uniq -c
```

**Expected Output:**
```
      1 NODE
      3 minikube-m02
      6 minikube-m03
```

---

## 📝 Part 4: Draining a Node

### Step 4.1: Understanding Drain

**What is Draining?**
- **Cordons** the node (marks unschedulable)
- **Evicts** all pods gracefully
- Pods are recreated on other nodes
- Node becomes empty and safe for maintenance

**Drain Process:**
```
1. Mark node unschedulable (cordon)
        ↓
2. Evict pods one by one
        ↓
3. Pods receive SIGTERM (graceful shutdown)
        ↓
4. Wait for graceful termination (default 30s)
        ↓
5. If still running, send SIGKILL
        ↓
6. ReplicaSet creates replacement pods on other nodes
        ↓
7. Node is empty
```

### Step 4.2: Drain the Node

```bash
# Drain minikube-m02
kubectl drain minikube-m02 --ignore-daemonsets
```

**💡 Command Explanation:**
- `kubectl drain`: Evict all pods from node
- `minikube-m02`: Target node
- `--ignore-daemonsets`: Don't evict DaemonSet pods (they run on every node)

**Expected Output:**
```
node/minikube-m02 already cordoned
WARNING: ignoring DaemonSet-managed Pods: kube-system/kube-proxy-xxxxx
evicting pod default/nginx-deployment-xxxxxxxxxx-aaaaa
evicting pod default/nginx-deployment-xxxxxxxxxx-ccccc
evicting pod default/nginx-deployment-xxxxxxxxxx-eeeee
pod/nginx-deployment-xxxxxxxxxx-aaaaa evicted
pod/nginx-deployment-xxxxxxxxxx-ccccc evicted
pod/nginx-deployment-xxxxxxxxxx-eeeee evicted
node/minikube-m02 drained
```

**💡 Drain Output:**
- **already cordoned**: Node was cordoned in previous step
- **ignoring DaemonSet-managed Pods**: kube-proxy stays (system component)
- **evicting pod**: Each pod is gracefully terminated
- **evicted**: Pod successfully removed
- **drained**: Node is now empty

### Step 4.3: Verify Pod Redistribution

```bash
# Check pod distribution
kubectl get pods -o wide
```

**Expected Output:**
```
NAME                                READY   STATUS    RESTARTS   AGE   IP           NODE
nginx-deployment-xxxxxxxxxx-bbbbb   1/1     Running   0          10m   10.244.2.2   minikube-m03
nginx-deployment-xxxxxxxxxx-ddddd   1/1     Running   0          10m   10.244.2.3   minikube-m03
nginx-deployment-xxxxxxxxxx-fffff   1/1     Running   0          10m   10.244.2.4   minikube-m03
nginx-deployment-xxxxxxxxxx-ggggg   1/1     Running   0          5m    10.244.2.5   minikube-m03
nginx-deployment-xxxxxxxxxx-hhhhh   1/1     Running   0          5m    10.244.2.6   minikube-m03
nginx-deployment-xxxxxxxxxx-iiiii   1/1     Running   0          5m    10.244.2.7   minikube-m03
nginx-deployment-yyyyyyyyyy-jjjjj   1/1     Running   0          30s   10.244.2.8   minikube-m03
nginx-deployment-yyyyyyyyyy-kkkkk   1/1     Running   0          30s   10.244.2.9   minikube-m03
nginx-deployment-yyyyyyyyyy-lllll   1/1     Running   0          30s   10.244.2.10  minikube-m03
```

**💡 Pod Redistribution:**
- **All 9 pods** now on minikube-m03
- **0 pods** on minikube-m02
- **New pods** created to replace evicted ones
- **No downtime** - pods recreated before old ones terminated

```bash
# Count pods per node
kubectl get pods -o wide | awk '{print $7}' | sort | uniq -c
```

**Expected Output:**
```
      1 NODE
      9 minikube-m03
```

### Step 4.4: Check Node Status

```bash
# Verify node is drained
kubectl describe node minikube-m02 | grep -A 10 "Non-terminated Pods:"
```

**Expected Output:**
```
Non-terminated Pods:          (1 in total)
  Namespace                   Name                CPU Requests  CPU Limits  Memory Requests  Memory Limits  Age
  ---------                   ----                ------------  ----------  ---------------  -------------  ---
  kube-system                 kube-proxy-xxxxx    0 (0%)        0 (0%)      0 (0%)           0 (0%)         15m
```

**💡 Only System Pods:**
- Only kube-proxy running (DaemonSet)
- No user workload pods
- Node is safe for maintenance

---

## 📝 Part 5: Performing Maintenance

### Step 5.1: Simulate Maintenance

In a real scenario, you would:
- SSH into the node
- Perform OS updates: `sudo apt update && sudo apt upgrade`
- Reboot the node: `sudo reboot`
- Replace hardware
- Upgrade Kubernetes components

**For this lab, we'll simulate maintenance:**

```bash
# Simulate maintenance (wait 30 seconds)
echo "Performing maintenance on minikube-m02..."
sleep 30
echo "Maintenance complete!"
```

**Expected Output:**
```
Performing maintenance on minikube-m02...
Maintenance complete!
```

**💡 During Real Maintenance:**
- Node status may change to NotReady
- Pods won't be affected (already moved)
- Cluster continues operating normally

---

## 📝 Part 6: Uncordoning the Node

### Step 6.1: Uncordon the Node

```bash
# Uncordon minikube-m02
kubectl uncordon minikube-m02
```

**Expected Output:**
```
node/minikube-m02 uncordoned
```

**💡 What This Does:**
- Removes the `unschedulable` taint
- Node can now accept new pods
- Existing pods don't automatically move back

### Step 6.2: Verify Node Status

```bash
# Check node status
kubectl get nodes
```

**Expected Output:**
```
NAME           STATUS   ROLES           AGE   VERSION
minikube       Ready    control-plane   20m   v1.28.3
minikube-m02   Ready    <none>          19m   v1.28.3
minikube-m03   Ready    <none>          19m   v1.28.3
```

**💡 Node is Ready:**
- No more "SchedulingDisabled"
- Node is healthy and schedulable
- Ready to accept new workloads

```bash
# Verify taint is removed
kubectl describe node minikube-m02 | grep "Taints:"
```

**Expected Output:**
```
Taints:             <none>
```

### Step 6.3: Test Scheduling on Uncordoned Node

```bash
# Scale up to trigger new pod creation
kubectl scale deployment nginx-deployment --replicas=12
```

**Expected Output:**
```
deployment.apps/nginx-deployment scaled
```

```bash
# Check pod distribution
kubectl get pods -o wide | grep minikube-m02
```

**Expected Output:**
```
nginx-deployment-zzzzzzzzzz-mmmmm   1/1     Running   0          10s   10.244.1.5   minikube-m02
nginx-deployment-zzzzzzzzzz-nnnnn   1/1     Running   0          10s   10.244.1.6   minikube-m02
nginx-deployment-zzzzzzzzzz-ooooo   1/1     Running   0          10s   10.244.1.7   minikube-m02
```

**💡 New Pods on m02:**
- New pods are being scheduled on minikube-m02
- Node is back in service
- Load is rebalancing across nodes

```bash
# Count pods per node
kubectl get pods -o wide | awk '{print $7}' | sort | uniq -c
```

**Expected Output:**
```
      1 NODE
      3 minikube-m02
      9 minikube-m03
```

**💡 Distribution:**
- New pods placed on minikube-m02
- Existing pods stay on minikube-m03
- Over time, distribution will rebalance

---

## 📝 Part 7: Taints and Tolerations

### Step 7.1: Understanding Taints and Tolerations

**Taints:**
- Applied to **nodes**
- Repel pods that don't tolerate the taint
- Three effects: NoSchedule, PreferNoSchedule, NoExecute

**Tolerations:**
- Applied to **pods**
- Allow pods to be scheduled on tainted nodes
- Must match the taint key, value, and effect

**Taint Effects:**
```
┌─────────────────┬────────────────────────────────────┐
│ NoSchedule      │ Pods won't be scheduled            │
│ PreferNoSchedule│ Avoid scheduling (soft)            │
│ NoExecute       │ Evict existing pods                │
└─────────────────┴────────────────────────────────────┘
```

### Step 7.2: Apply a Taint

```bash
# Taint minikube-m03 for dedicated workloads
kubectl taint nodes minikube-m03 workload=database:NoSchedule
```

**Expected Output:**
```
node/minikube-m03 tainted
```

**💡 Taint Breakdown:**
- **Key**: workload
- **Value**: database
- **Effect**: NoSchedule
- **Meaning**: Only pods with matching toleration can be scheduled

### Step 7.3: Test Taint Effect

```bash
# Scale up deployment (pods without toleration)
kubectl scale deployment nginx-deployment --replicas=15
```

**Expected Output:**
```
deployment.apps/nginx-deployment scaled
```

```bash
# Check pod distribution
kubectl get pods -o wide | awk '{print $7}' | sort | uniq -c
```

**Expected Output:**
```
      1 NODE
      6 minikube-m02
      9 minikube-m03
```

**💡 Taint Effect:**
- New pods only scheduled on minikube-m02
- minikube-m03 is tainted (NoSchedule)
- Existing pods on m03 stay (NoSchedule doesn't evict)

### Step 7.4: Create Pod with Toleration

```bash
# Create a pod that tolerates the taint
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: database-pod
  labels:
    app: database
spec:
  containers:
  - name: postgres
    image: postgres:14
    env:
    - name: POSTGRES_PASSWORD
      value: mysecretpassword
  tolerations:
  - key: "workload"
    operator: "Equal"
    value: "database"
    effect: "NoSchedule"
EOF
```

**💡 Toleration Explanation:**
- **key**: Must match taint key (workload)
- **operator**: Equal (exact match)
- **value**: Must match taint value (database)
- **effect**: Must match taint effect (NoSchedule)

```bash
# Check where the pod is scheduled
kubectl get pod database-pod -o wide
```

**Expected Output:**
```
NAME           READY   STATUS    RESTARTS   AGE   IP           NODE
database-pod   1/1     Running   0          10s   10.244.2.11  minikube-m03
```

**💡 Scheduled on Tainted Node:**
- Pod has matching toleration
- Can be scheduled on minikube-m03
- Demonstrates workload isolation

### Step 7.5: Remove Taint

```bash
# Remove the taint (note the minus sign at the end)
kubectl taint nodes minikube-m03 workload=database:NoSchedule-
```

**Expected Output:**
```
node/minikube-m03 untainted
```

**💡 Taint Removal:**
- Append `-` to the taint specification
- Node returns to normal scheduling
- Existing pods stay running

---

## 📝 Part 8: Pod Disruption Budgets

### Step 8.1: Understanding PodDisruptionBudget

**What is a PDB?**
- Limits the number of pods that can be down simultaneously
- Protects against voluntary disruptions (drain, eviction)
- Ensures minimum availability during maintenance

**PDB Example:**
```yaml
minAvailable: 2  # At least 2 pods must be running
# OR
maxUnavailable: 1  # At most 1 pod can be down
```

### Step 8.2: Create a PodDisruptionBudget

```bash
# Create PDB for nginx deployment
cat <<EOF | kubectl apply -f -
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: nginx-pdb
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: nginx
EOF
```

**Expected Output:**
```
poddisruptionbudget.policy/nginx-pdb created
```

**💡 PDB Explanation:**
- **minAvailable: 2**: At least 2 nginx pods must be running
- **selector**: Applies to pods with label app=nginx
- **Protection**: Drain will fail if it would violate this

### Step 8.3: View PDB Status

```bash
# Check PDB
kubectl get pdb
```

**Expected Output:**
```
NAME        MIN AVAILABLE   MAX UNAVAILABLE   ALLOWED DISRUPTIONS   AGE
nginx-pdb   2               N/A               13                    30s
```

**💡 PDB Status:**
- **MIN AVAILABLE**: 2 pods must always be running
- **ALLOWED DISRUPTIONS**: 13 pods can be disrupted (15 total - 2 min)
- **AGE**: Time since PDB was created

```bash
# Describe PDB
kubectl describe pdb nginx-pdb
```

**Expected Output:**
```
Name:           nginx-pdb
Namespace:      default
Min available:  2
Selector:       app=nginx
Status:
    Allowed disruptions:  13
    Current:              15
    Desired:              2
    Total:                15
Events:  <none>
```

### Step 8.4: Test PDB Protection

```bash
# Scale down to 3 replicas
kubectl scale deployment nginx-deployment --replicas=3
```

**Expected Output:**
```
deployment.apps/nginx-deployment scaled
```

```bash
# Check PDB status
kubectl get pdb
```

**Expected Output:**
```
NAME        MIN AVAILABLE   MAX UNAVAILABLE   ALLOWED DISRUPTIONS   AGE
nginx-pdb   2               N/A               1                     2m
```

**💡 Updated PDB:**
- **ALLOWED DISRUPTIONS**: 1 (3 total - 2 min)
- Only 1 pod can be disrupted at a time
- Protects against complete outage

**Now try to drain a node:**

```bash
# Attempt to drain minikube-m02
kubectl drain minikube-m02 --ignore-daemonsets
```

**💡 PDB Protection:**
- Drain will respect the PDB
- Won't evict more pods than allowed
- May take longer to complete
- Ensures minimum availability

---

## ✅ Validation Steps

### Comprehensive Validation

```bash
# 1. Check all nodes are Ready
kubectl get nodes

# 2. Verify no nodes are cordoned
kubectl get nodes | grep SchedulingDisabled
# Expected: No output

# 3. Check pod distribution
kubectl get pods -o wide | awk '{print $7}' | sort | uniq -c

# 4. Verify PDB exists
kubectl get pdb

# 5. Check deployment status
kubectl get deployment nginx-deployment

# 6. Verify no taints on nodes
kubectl describe nodes | grep "Taints:"
```

---

## 🧹 Cleanup

```bash
# Delete the deployment
kubectl delete deployment nginx-deployment

# Delete the PDB
kubectl delete pdb nginx-pdb

# Delete the database pod
kubectl delete pod database-pod

# Verify cleanup
kubectl get all
kubectl get pdb
```

---

## 🎯 Challenge Tasks

1. **Practice the full maintenance workflow**
   - Create a deployment with 10 replicas
   - Cordon a node
   - Drain the node
   - Simulate maintenance (wait 1 minute)
   - Uncordon the node
   - Verify pods rebalance

2. **Experiment with taints**
   - Taint a node with `environment=production:NoExecute`
   - Observe existing pods being evicted
   - Create a pod with matching toleration
   - Remove the taint

3. **Test PDB limits**
   - Create a deployment with 5 replicas
   - Create a PDB with minAvailable: 4
   - Try to drain a node with 3 pods
   - Observe how PDB limits eviction

---

## 📚 Key Takeaways

✅ **Cordon** marks node unschedulable (existing pods stay)  
✅ **Drain** evicts all pods gracefully (for maintenance)  
✅ **Uncordon** makes node schedulable again  
✅ **Taints** repel pods without tolerations  
✅ **Tolerations** allow pods on tainted nodes  
✅ **PodDisruptionBudget** ensures minimum availability  
✅ **--ignore-daemonsets** required when draining  
✅ **Zero-downtime maintenance** is achievable with proper workflow  

---

## 📖 Next Steps

Continue to [Lab 2.2: Cluster Upgrades](lab-2.2-cluster-upgrades.md) to learn how to safely upgrade Kubernetes versions.

---

## 📝 Lab Completion Checklist

- [ ] Created multi-node cluster
- [ ] Deployed test application
- [ ] Cordoned a node
- [ ] Drained a node
- [ ] Performed simulated maintenance
- [ ] Uncordoned the node
- [ ] Applied taints to nodes
- [ ] Created pods with tolerations
- [ ] Implemented PodDisruptionBudget
- [ ] Tested PDB protection
- [ ] Completed challenge tasks
- [ ] Cleaned up all resources

**Congratulations! You've mastered node management and maintenance!** 🎉
