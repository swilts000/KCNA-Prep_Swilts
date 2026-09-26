# Lab 5.1: Pod Troubleshooting

## 📚 Related Chapters
- **Chapter 7**: Application Placement and Debugging with Kubernetes
- **Chapter 6**: Deploying and Scaling Applications with Kubernetes

## 🎯 Learning Objectives

By the end of this lab, you will be able to:
- Diagnose common pod failure scenarios
- Use kubectl commands effectively for troubleshooting
- Understand pod lifecycle states and transitions
- Read and interpret pod events and logs
- Fix ImagePullBackOff, CrashLoopBackOff, and Pending states
- Debug resource constraint issues

## ⏱️ Estimated Time
60-75 minutes

## 📋 Prerequisites

- Completed Lab 1.1 (Minikube cluster setup)
- Running Kubernetes cluster (minikube or kind)
- Basic understanding of Pods and Deployments (Chapter 6)
- kubectl installed and configured

---

## 🏗️ Pod Lifecycle Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Pod Lifecycle States                     │
└─────────────────────────────────────────────────────────────┘

    ┌─────────┐
    │ Pending │  ← Pod created, waiting to be scheduled
    └────┬────┘
         │
         ▼
    ┌─────────────┐
    │ Scheduling  │  ← Scheduler assigns pod to a node
    └──────┬──────┘
           │
           ▼
    ┌──────────────┐
    │ Pulling Image│  ← Node pulls container image
    └──────┬───────┘
           │
           ▼
    ┌─────────────┐
    │  Creating   │  ← Container runtime creates container
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐
    │   Running   │  ← Container is running successfully
    └──────┬──────┘
           │
           ├─────────────────┐
           │                 │
           ▼                 ▼
    ┌──────────┐      ┌──────────┐
    │ Succeeded│      │  Failed  │
    └──────────┘      └──────────┘
           │                 │
           │                 ▼
           │          ┌─────────────────┐
           │          │ CrashLoopBackOff│  ← Repeated failures
           │          └─────────────────┘
           │
           ▼
    ┌──────────┐
    │Completed │
    └──────────┘


Common Error States:
┌────────────────────┬──────────────────────────────────────┐
│ ImagePullBackOff   │ Cannot pull container image          │
│ CrashLoopBackOff   │ Container keeps crashing             │
│ Pending            │ Cannot be scheduled                  │
│ Error              │ Container exited with error          │
│ OOMKilled          │ Out of memory                        │
│ CreateContainerErr │ Cannot create container              │
└────────────────────┴──────────────────────────────────────┘
```

---

## 📝 Part 1: Essential Troubleshooting Commands

### Step 1.1: The Troubleshooting Toolkit

Before we create problems, let's learn the tools to fix them:

```bash
# 1. Get pod status (first line of defense)
kubectl get pods

# 2. Get detailed pod information
kubectl get pods -o wide

# 3. Describe pod (shows events and configuration)
kubectl describe pod <pod-name>

# 4. View container logs
kubectl logs <pod-name>

# 5. View previous container logs (if crashed)
kubectl logs <pod-name> --previous

# 6. Follow logs in real-time
kubectl logs <pod-name> -f

# 7. Execute commands inside container
kubectl exec <pod-name> -- <command>

# 8. Interactive shell inside container
kubectl exec -it <pod-name> -- /bin/sh

# 9. Get pod YAML definition
kubectl get pod <pod-name> -o yaml

# 10. View events (cluster-wide)
kubectl get events --sort-by='.lastTimestamp'
```

**💡 Troubleshooting Workflow:**
```
1. kubectl get pods          → Identify the problem pod
2. kubectl describe pod      → Read events and configuration
3. kubectl logs              → Check application logs
4. kubectl exec              → Investigate inside container
5. Fix and verify            → Apply solution and test
```

---

## 📝 Part 2: Scenario 1 - ImagePullBackOff

### Step 2.1: Understanding ImagePullBackOff

**What it means:**
- Kubernetes cannot pull the container image from the registry
- Common causes: wrong image name, wrong tag, private registry without credentials, network issues

**Error Flow:**
```
Pod Created → Scheduled to Node → kubelet tries to pull image
                                          ↓
                                    Image not found
                                          ↓
                                    ErrImagePull
                                          ↓
                                  Retry with backoff
                                          ↓
                                  ImagePullBackOff
```

### Step 2.2: Create the Problem

```bash
# Create a pod with a non-existent image
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: broken-image-pod
  labels:
    app: broken-demo
spec:
  containers:
  - name: nginx
    image: nginx:this-tag-does-not-exist
    ports:
    - containerPort: 80
EOF
```

**💡 Code Explanation:**
- **apiVersion: v1**: Pods are in the core API group
- **kind: Pod**: We're creating a Pod resource
- **metadata.name**: Unique identifier for this pod
- **spec.containers**: List of containers in this pod
- **image**: The container image to run (intentionally wrong)
- **ports**: Container exposes port 80

### Step 2.3: Observe the Problem

```bash
# Check pod status
kubectl get pods
```

**Expected Output:**
```
NAME               READY   STATUS             RESTARTS   AGE
broken-image-pod   0/1     ImagePullBackOff   0          30s
```

**💡 Status Breakdown:**
- **READY**: 0/1 means 0 out of 1 containers are ready
- **STATUS**: ImagePullBackOff indicates image pull failure
- **RESTARTS**: 0 because container never started
- **AGE**: Time since pod was created

```bash
# Get more details
kubectl describe pod broken-image-pod
```

**Key sections to examine:**

```yaml
# Container section shows the problem
Containers:
  nginx:
    Image:          nginx:this-tag-does-not-exist
    State:          Waiting
      Reason:       ImagePullBackOff
    Ready:          False

# Events section shows the timeline
Events:
  Type     Reason     Age                From               Message
  ----     ------     ----               ----               -------
  Normal   Scheduled  45s                default-scheduler  Successfully assigned default/broken-image-pod to minikube
  Normal   Pulling    15s (x3 over 45s)  kubelet            Pulling image "nginx:this-tag-does-not-exist"
  Warning  Failed     14s (x3 over 44s)  kubelet            Failed to pull image "nginx:this-tag-does-not-exist": rpc error: code = NotFound desc = failed to pull and unpack image "docker.io/library/nginx:this-tag-does-not-exist": failed to resolve reference "docker.io/library/nginx:this-tag-does-not-exist": docker.io/library/nginx:this-tag-does-not-exist: not found
  Warning  Failed     14s (x3 over 44s)  kubelet            Error: ErrImagePull
  Normal   BackOff    2s (x4 over 44s)   kubelet            Back-off pulling image "nginx:this-tag-does-not-exist"
  Warning  Failed     2s (x4 over 44s)   kubelet            Error: ImagePullBackOff
```

**💡 Reading Events:**
1. **Scheduled**: Pod assigned to minikube node ✅
2. **Pulling**: Attempted to pull image (3 times)
3. **Failed**: Image not found in Docker Hub
4. **ErrImagePull**: Initial error
5. **BackOff**: Kubernetes is waiting before retrying
6. **ImagePullBackOff**: In exponential backoff state

### Step 2.4: Fix the Problem

**Method 1: Edit the Pod directly**
```bash
# Edit the pod (not recommended for production)
kubectl edit pod broken-image-pod

# Change this line:
#   image: nginx:this-tag-does-not-exist
# To:
#   image: nginx:latest

# Save and exit (:wq in vim)
```

**Method 2: Delete and recreate (recommended)**
```bash
# Delete the broken pod
kubectl delete pod broken-image-pod

# Create with correct image
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: fixed-image-pod
  labels:
    app: fixed-demo
spec:
  containers:
  - name: nginx
    image: nginx:latest
    ports:
    - containerPort: 80
EOF
```

### Step 2.5: Verify the Fix

```bash
# Check pod status
kubectl get pods
```

**Expected Output:**
```
NAME              READY   STATUS    RESTARTS   AGE
fixed-image-pod   1/1     Running   0          10s
```

**💡 Success Indicators:**
- **READY**: 1/1 (all containers ready)
- **STATUS**: Running (container is running)

```bash
# Verify the image was pulled successfully
kubectl describe pod fixed-image-pod | grep -A 5 "Events:"
```

**Expected Events:**
```
Events:
  Type    Reason     Age   From               Message
  ----    ------     ----  ----               -------
  Normal  Scheduled  20s   default-scheduler  Successfully assigned default/fixed-image-pod to minikube
  Normal  Pulling    19s   kubelet            Pulling image "nginx:latest"
  Normal  Pulled     15s   kubelet            Successfully pulled image "nginx:latest"
  Normal  Created    15s   kubelet            Created container nginx
  Normal  Started    15s   kubelet            Started container nginx
```

**💡 Successful Flow:**
1. Scheduled ✅
2. Pulling ✅
3. Pulled ✅
4. Created ✅
5. Started ✅

---

## 📝 Part 3: Scenario 2 - CrashLoopBackOff

### Step 3.1: Understanding CrashLoopBackOff

**What it means:**
- Container starts but immediately crashes
- Kubernetes keeps restarting it with exponential backoff
- Common causes: application errors, missing dependencies, wrong command

**Crash Cycle:**
```
Container Starts → Runs briefly → Crashes/Exits
                                       ↓
                                  Restart (0s delay)
                                       ↓
                                  Crash again
                                       ↓
                                  Restart (10s delay)
                                       ↓
                                  Crash again
                                       ↓
                                  Restart (20s delay)
                                       ↓
                                  CrashLoopBackOff
                                  (max 5 min delay)
```

### Step 3.2: Create the Problem

```bash
# Create a pod that crashes immediately
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: crash-pod
  labels:
    app: crash-demo
spec:
  containers:
  - name: crasher
    image: busybox:latest
    command: ["/bin/sh"]
    args: ["-c", "echo 'Starting...'; exit 1"]
EOF
```

**💡 Code Explanation:**
- **image: busybox**: Lightweight Linux container
- **command**: Override the default container command
- **args**: Execute this shell command
- **exit 1**: Exit with error code 1 (simulates crash)

**What this does:**
1. Container starts
2. Prints "Starting..."
3. Exits with error code 1
4. Kubernetes sees non-zero exit = failure
5. Kubernetes restarts the container
6. Repeat → CrashLoopBackOff

### Step 3.3: Observe the Problem

```bash
# Watch the pod status change
kubectl get pods -w
```

**Expected Output (over time):**
```
NAME        READY   STATUS              RESTARTS   AGE
crash-pod   0/1     ContainerCreating   0          1s
crash-pod   0/1     Error               0          2s
crash-pod   0/1     Error               1 (0s ago) 3s
crash-pod   0/1     CrashLoopBackOff    1 (1s ago) 4s
crash-pod   0/1     Error               2 (11s ago) 15s
crash-pod   0/1     CrashLoopBackOff    2 (10s ago) 25s
```

**💡 Status Evolution:**
1. **ContainerCreating**: Setting up the container
2. **Error**: Container exited with error
3. **CrashLoopBackOff**: In backoff state between restarts
4. **RESTARTS**: Counter increases with each restart

Press `Ctrl+C` to stop watching.

```bash
# Describe the pod
kubectl describe pod crash-pod
```

**Key sections:**

```yaml
Containers:
  crasher:
    State:          Waiting
      Reason:       CrashLoopBackOff
    Last State:     Terminated
      Reason:       Error
      Exit Code:    1
    Restart Count:  5

Events:
  Type     Reason     Age                  From               Message
  ----     ------     ----                 ----               -------
  Normal   Scheduled  2m                   default-scheduler  Successfully assigned default/crash-pod to minikube
  Normal   Pulled     2m                   kubelet            Successfully pulled image "busybox:latest"
  Normal   Created    60s (x5 over 2m)     kubelet            Created container crasher
  Normal   Started    60s (x5 over 2m)     kubelet            Started container crasher
  Normal   Pulled     60s (x4 over 2m)     kubelet            Container image "busybox:latest" already present on machine
  Warning  BackOff    30s (x10 over 2m)    kubelet            Back-off restarting failed container crasher in pod crash-pod_default(uuid)
```

**💡 Key Indicators:**
- **Exit Code: 1**: Non-zero exit indicates failure
- **Restart Count: 5**: Container has restarted 5 times
- **BackOff**: Kubernetes is delaying restarts

### Step 3.4: Check Logs

```bash
# View current container logs
kubectl logs crash-pod
```

**Expected Output:**
```
Starting...
```

**💡 The container prints "Starting..." then crashes**

```bash
# View previous container logs
kubectl logs crash-pod --previous
```

**Expected Output:**
```
Starting...
```

**💡 Each restart shows the same log**

### Step 3.5: Fix the Problem

```bash
# Delete the broken pod
kubectl delete pod crash-pod

# Create a pod that runs successfully
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: working-pod
  labels:
    app: working-demo
spec:
  containers:
  - name: worker
    image: busybox:latest
    command: ["/bin/sh"]
    args: ["-c", "echo 'Starting...'; sleep 3600"]
EOF
```

**💡 Code Changes:**
- **sleep 3600**: Keep container running for 1 hour
- **No exit 1**: Container doesn't crash

### Step 3.6: Verify the Fix

```bash
# Check pod status
kubectl get pods
```

**Expected Output:**
```
NAME          READY   STATUS    RESTARTS   AGE
working-pod   1/1     Running   0          10s
```

```bash
# Check logs
kubectl logs working-pod
```

**Expected Output:**
```
Starting...
```

**💡 Container is running and healthy!**

---

## 📝 Part 4: Scenario 3 - Pending (Insufficient Resources)

### Step 4.1: Understanding Pending State

**What it means:**
- Pod cannot be scheduled to any node
- Common causes: insufficient CPU/memory, node selectors don't match, taints/tolerations

**Scheduling Flow:**
```
Pod Created → Scheduler evaluates nodes
                      ↓
            ┌─────────┴─────────┐
            ▼                   ▼
      Nodes found          No nodes found
            ↓                   ↓
      Schedule pod          Pod stays Pending
            ↓
      Pod Running
```

### Step 4.2: Check Available Resources

```bash
# Check node resources
kubectl describe node minikube | grep -A 5 "Allocated resources"
```

**Expected Output:**
```
Allocated resources:
  (Total limits may be over 100 percent, i.e., overcommitted.)
  Resource           Requests    Limits
  --------           --------    ------
  cpu                250m (12%)  100m (5%)
  memory             140Mi (7%)  340Mi (17%)
```

**💡 Resource Breakdown:**
- **Requests**: Guaranteed resources for pods
- **Limits**: Maximum resources pods can use
- **Percentage**: % of node capacity allocated

### Step 4.3: Create the Problem

```bash
# Create a pod requesting more CPU than available
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: resource-hog-pod
  labels:
    app: resource-demo
spec:
  containers:
  - name: nginx
    image: nginx:latest
    resources:
      requests:
        cpu: "10"
        memory: "16Gi"
      limits:
        cpu: "10"
        memory: "16Gi"
EOF
```

**💡 Code Explanation:**
- **resources.requests**: Minimum guaranteed resources
  - **cpu: "10"**: Requesting 10 CPU cores
  - **memory: "16Gi"**: Requesting 16 GB RAM
- **resources.limits**: Maximum allowed resources
- Most local clusters have 2-4 CPUs and 4-8GB RAM

**Why this fails:**
- Minikube typically has 2 CPUs and 4GB RAM
- Pod requests 10 CPUs and 16GB RAM
- No node has enough resources
- Pod stays Pending

### Step 4.4: Observe the Problem

```bash
# Check pod status
kubectl get pods
```

**Expected Output:**
```
NAME               READY   STATUS    RESTARTS   AGE
resource-hog-pod   0/1     Pending   0          15s
```

**💡 Pending Status:**
- Pod created but not scheduled
- No containers running yet
- Waiting for resources

```bash
# Describe the pod
kubectl describe pod resource-hog-pod
```

**Key sections:**

```yaml
Status:       Pending
Conditions:
  Type           Status
  PodScheduled   False

Events:
  Type     Reason            Age   From               Message
  ----     ------            ----  ----               -------
  Warning  FailedScheduling  30s   default-scheduler  0/1 nodes are available: 1 Insufficient cpu, 1 Insufficient memory.
  Warning  FailedScheduling  30s   default-scheduler  0/1 nodes are available: 1 Insufficient cpu, 1 Insufficient memory.
```

**💡 Event Analysis:**
- **FailedScheduling**: Scheduler couldn't find a suitable node
- **0/1 nodes available**: No nodes out of 1 total can run this pod
- **Insufficient cpu**: Not enough CPU
- **Insufficient memory**: Not enough RAM

### Step 4.5: Fix the Problem

```bash
# Delete the resource hog
kubectl delete pod resource-hog-pod

# Create with reasonable resource requests
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: reasonable-pod
  labels:
    app: reasonable-demo
spec:
  containers:
  - name: nginx
    image: nginx:latest
    resources:
      requests:
        cpu: "100m"
        memory: "128Mi"
      limits:
        cpu: "200m"
        memory: "256Mi"
EOF
```

**💡 Resource Units:**
- **CPU**:
  - `1` = 1 CPU core
  - `100m` = 100 millicores = 0.1 CPU
  - `1000m` = 1 CPU
- **Memory**:
  - `Mi` = Mebibytes (1024-based)
  - `Gi` = Gibibytes
  - `128Mi` = 128 Mebibytes ≈ 134 MB

**Reasonable Requests:**
- **cpu: "100m"**: 10% of one CPU core
- **memory: "128Mi"**: 128 MB RAM
- **limits**: 2x requests for burst capacity

### Step 4.6: Verify the Fix

```bash
# Check pod status
kubectl get pods
```

**Expected Output:**
```
NAME             READY   STATUS    RESTARTS   AGE
reasonable-pod   1/1     Running   0          10s
```

```bash
# Verify resource allocation
kubectl describe pod reasonable-pod | grep -A 10 "Requests:"
```

**Expected Output:**
```
    Requests:
      cpu:        100m
      memory:     128Mi
    Limits:
      cpu:        200m
      memory:     256Mi
```

---

## 📝 Part 5: Scenario 4 - OOMKilled (Out of Memory)

### Step 5.1: Understanding OOMKilled

**What it means:**
- Container exceeded its memory limit
- Linux kernel's OOM (Out Of Memory) killer terminated it
- Kubernetes will restart the container

**Memory Limit Flow:**
```
Container Running → Memory usage increases
                            ↓
                    Reaches memory limit
                            ↓
                    OOM Killer activated
                            ↓
                    Container killed
                            ↓
                    Kubernetes restarts it
                            ↓
                    CrashLoopBackOff (if repeated)
```

### Step 5.2: Create the Problem

```bash
# Create a pod that consumes too much memory
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: memory-hog-pod
  labels:
    app: memory-demo
spec:
  containers:
  - name: memory-eater
    image: polinux/stress
    resources:
      requests:
        memory: "50Mi"
      limits:
        memory: "100Mi"
    command: ["stress"]
    args: ["--vm", "1", "--vm-bytes", "150M", "--vm-hang", "1"]
EOF
```

**💡 Code Explanation:**
- **image: polinux/stress**: Tool for stress testing
- **limits.memory: "100Mi"**: Maximum 100MB allowed
- **stress command**:
  - `--vm 1`: Spawn 1 worker
  - `--vm-bytes 150M`: Allocate 150MB (exceeds limit!)
  - `--vm-hang 1`: Keep memory allocated

**Why this fails:**
- Container tries to allocate 150MB
- Limit is only 100MB
- OOM killer terminates the container

### Step 5.3: Observe the Problem

```bash
# Watch pod status
kubectl get pods -w
```

**Expected Output:**
```
NAME              READY   STATUS              RESTARTS   AGE
memory-hog-pod    0/1     ContainerCreating   0          1s
memory-hog-pod    0/1     OOMKilled           0          3s
memory-hog-pod    0/1     OOMKilled           1 (2s ago) 5s
memory-hog-pod    0/1     CrashLoopBackOff    1 (1s ago) 6s
```

Press `Ctrl+C` to stop watching.

```bash
# Describe the pod
kubectl describe pod memory-hog-pod
```

**Key sections:**

```yaml
Containers:
  memory-eater:
    State:          Waiting
      Reason:       CrashLoopBackOff
    Last State:     Terminated
      Reason:       OOMKilled
      Exit Code:    137
    Restart Count:  5

Events:
  Type     Reason     Age                From               Message
  ----     ------     ----               ----               -------
  Normal   Scheduled  2m                 default-scheduler  Successfully assigned default/memory-hog-pod to minikube
  Normal   Pulled     90s (x5 over 2m)   kubelet            Container image "polinux/stress" already present on machine
  Normal   Created    90s (x5 over 2m)   kubelet            Created container memory-eater
  Normal   Started    90s (x5 over 2m)   kubelet            Started container memory-eater
  Warning  BackOff    60s (x8 over 2m)   kubelet            Back-off restarting failed container
```

**💡 OOMKilled Indicators:**
- **Reason: OOMKilled**: Container killed for using too much memory
- **Exit Code: 137**: Standard exit code for OOM kill (128 + 9 SIGKILL)
- **Restart Count**: Increasing as Kubernetes retries

### Step 5.4: Fix the Problem

```bash
# Delete the memory hog
kubectl delete pod memory-hog-pod

# Create with appropriate memory limits
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: memory-safe-pod
  labels:
    app: memory-safe-demo
spec:
  containers:
  - name: memory-safe
    image: polinux/stress
    resources:
      requests:
        memory: "50Mi"
      limits:
        memory: "200Mi"
    command: ["stress"]
    args: ["--vm", "1", "--vm-bytes", "50M", "--vm-hang", "1"]
EOF
```

**💡 Code Changes:**
- **limits.memory: "200Mi"**: Increased to 200MB
- **--vm-bytes 50M**: Only allocate 50MB (within limit)

### Step 5.5: Verify the Fix

```bash
# Check pod status
kubectl get pods
```

**Expected Output:**
```
NAME               READY   STATUS    RESTARTS   AGE
memory-safe-pod    1/1     Running   0          15s
```

```bash
# Monitor memory usage (requires metrics-server)
kubectl top pod memory-safe-pod
```

**Expected Output:**
```
NAME               CPU(cores)   MEMORY(bytes)
memory-safe-pod    100m         52Mi
```

**💡 Memory is within limits!**

---

## 📝 Part 6: Debugging Workflow Practice

### Step 6.1: Create Multiple Broken Pods

```bash
# Create a namespace for practice
kubectl create namespace debug-practice

# Pod 1: Wrong image
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: pod-1
  namespace: debug-practice
spec:
  containers:
  - name: app
    image: nginx:wrong-tag-12345
EOF

# Pod 2: Crashes immediately
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: pod-2
  namespace: debug-practice
spec:
  containers:
  - name: app
    image: busybox
    command: ["sh", "-c", "exit 1"]
EOF

# Pod 3: Insufficient resources
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: pod-3
  namespace: debug-practice
spec:
  containers:
  - name: app
    image: nginx
    resources:
      requests:
        cpu: "50"
EOF
```

### Step 6.2: Systematic Debugging

**Your Task:** Debug each pod using the workflow:

```bash
# 1. Identify problems
kubectl get pods -n debug-practice

# 2. For each broken pod, investigate:
kubectl describe pod <pod-name> -n debug-practice

# 3. Check logs if applicable:
kubectl logs <pod-name> -n debug-practice

# 4. Identify the issue and fix it
```

**Expected Issues:**
- **pod-1**: ImagePullBackOff (wrong image tag)
- **pod-2**: CrashLoopBackOff (exits with error)
- **pod-3**: Pending (insufficient CPU)

---

## ✅ Validation Steps

### Validate Your Understanding

```bash
# 1. Create a test pod
kubectl run test-pod --image=nginx:latest

# 2. Verify it's running
kubectl get pods test-pod
# Expected: STATUS=Running

# 3. Check its logs
kubectl logs test-pod
# Expected: Nginx startup logs

# 4. Execute a command inside
kubectl exec test-pod -- nginx -v
# Expected: nginx version output

# 5. Clean up
kubectl delete pod test-pod
```

---

## 🧹 Cleanup

```bash
# Delete all pods created in this lab
kubectl delete pod fixed-image-pod working-pod reasonable-pod memory-safe-pod --ignore-not-found

# Delete the debug namespace
kubectl delete namespace debug-practice

# Verify cleanup
kubectl get pods
```

---

## 🎯 Challenge Tasks

1. **Create a pod that fails due to a non-existent command**
   - Use `busybox` image
   - Set command to `/bin/nonexistent`
   - Debug and fix it

2. **Simulate a pod that runs out of disk space**
   - Research ephemeral storage limits
   - Create a pod that exceeds them

3. **Debug a multi-container pod**
   - Create a pod with 2 containers
   - Make one fail
   - Practice using `-c` flag with kubectl logs

---

## 🐛 Common Troubleshooting Patterns

### Quick Reference Table

| Status | Likely Cause | First Command to Run |
|--------|--------------|---------------------|
| ImagePullBackOff | Wrong image name/tag | `kubectl describe pod` |
| CrashLoopBackOff | Application crashes | `kubectl logs --previous` |
| Pending | Resource constraints | `kubectl describe pod` (check events) |
| OOMKilled | Memory limit exceeded | `kubectl describe pod` (check exit code 137) |
| Error | Container exited | `kubectl logs` |
| CreateContainerError | Configuration issue | `kubectl describe pod` |

---

## 📚 Key Takeaways

✅ **ImagePullBackOff** = Cannot pull image (check image name/tag)  
✅ **CrashLoopBackOff** = Container keeps crashing (check logs)  
✅ **Pending** = Cannot schedule (check resources/node selectors)  
✅ **OOMKilled** = Out of memory (increase memory limits)  
✅ **kubectl describe** shows events and configuration  
✅ **kubectl logs** shows application output  
✅ **Exit code 137** = OOMKilled  
✅ **Exit code 1** = General error  

---

## 📖 Next Steps

Continue to [Lab 5.2: Node Troubleshooting](lab-5.2-node-troubleshooting.md) to learn how to debug node-level issues.

---

## 📝 Lab Completion Checklist

- [ ] Understood pod lifecycle states
- [ ] Debugged ImagePullBackOff error
- [ ] Debugged CrashLoopBackOff error
- [ ] Debugged Pending (resource) error
- [ ] Debugged OOMKilled error
- [ ] Used kubectl describe effectively
- [ ] Used kubectl logs effectively
- [ ] Practiced systematic debugging workflow
- [ ] Completed challenge tasks
- [ ] Cleaned up all resources

**Congratulations! You've mastered pod troubleshooting!** 🎉
