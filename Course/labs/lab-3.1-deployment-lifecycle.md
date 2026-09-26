# Lab 3.1: Deployment Lifecycle Management

## 📚 Related Chapters
- **Chapter 6**: Deploying and Scaling Applications with Kubernetes
- **Chapter 5**: Orchestrating Containers with Kubernetes

## 🎯 Learning Objectives

By the end of this lab, you will be able to:
- Create and manage Kubernetes Deployments
- Perform rolling updates with zero downtime
- Rollback to previous versions
- Pause and resume rollouts
- Configure update strategies (maxSurge, maxUnavailable)
- Understand the relationship between Deployments, ReplicaSets, and Pods
- Monitor rollout status and history

## ⏱️ Estimated Time
60-75 minutes

## 📋 Prerequisites

- Running Kubernetes cluster (minikube or kind)
- kubectl installed and configured
- Completed Lab 1.1 (Minikube cluster setup)
- Understanding of Pods (Chapter 5)

---

## 🏗️ Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Deployment Hierarchy                     │
└─────────────────────────────────────────────────────────────┘

                    ┌──────────────┐
                    │  Deployment  │  ← Manages ReplicaSets
                    │              │     Handles updates
                    └──────┬───────┘
                           │
                           │ Creates & Manages
                           │
           ┌───────────────┴───────────────┐
           ▼                               ▼
    ┌──────────────┐              ┌──────────────┐
    │ ReplicaSet   │              │ ReplicaSet   │
    │ (version 1)  │              │ (version 2)  │
    └──────┬───────┘              └──────┬───────┘
           │                              │
           │ Maintains                    │ Maintains
           │ desired count                │ desired count
           │                              │
    ┌──────┴──────┐              ┌───────┴──────┐
    ▼      ▼      ▼              ▼       ▼      ▼
  ┌───┐  ┌───┐  ┌───┐          ┌───┐  ┌───┐  ┌───┐
  │Pod│  │Pod│  │Pod│          │Pod│  │Pod│  │Pod│
  └───┘  └───┘  └───┘          └───┘  └───┘  └───┘
  v1.0   v1.0   v1.0           v2.0   v2.0   v2.0

During Rolling Update:
  Old ReplicaSet scales down ↓
  New ReplicaSet scales up ↑
  Zero downtime achieved!
```

---

## 📝 Part 1: Creating Your First Deployment

### Step 1.1: Create a Simple Deployment

```bash
# Create a deployment with 3 replicas
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
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
        image: nginx:1.21
        ports:
        - containerPort: 80
EOF
```

**💡 Code Explanation:**

| Field | Purpose | Chapter Reference |
|-------|---------|-------------------|
| **apiVersion: apps/v1** | Deployments are in the apps API group | Chapter 6, Lesson 1 |
| **kind: Deployment** | Resource type we're creating | Chapter 6, Lesson 1 |
| **metadata.name** | Unique identifier for this Deployment | Chapter 5, Lesson 2 |
| **metadata.labels** | Labels for the Deployment itself | Chapter 5, Lesson 2 |
| **spec.replicas: 3** | Desired number of pod replicas | Chapter 6, Lesson 1 |
| **spec.selector.matchLabels** | How Deployment finds its Pods | Chapter 6, Lesson 1 |
| **spec.template** | Pod template (blueprint for pods) | Chapter 6, Lesson 1 |
| **template.metadata.labels** | Labels applied to created Pods | Chapter 5, Lesson 2 |
| **template.spec.containers** | Container specifications | Chapter 5, Lesson 2 |
| **image: nginx:1.21** | Container image and version | Chapter 3, Lesson 4 |

**Key Concepts:**
- **selector.matchLabels** MUST match **template.metadata.labels**
- This is how the Deployment knows which Pods it owns
- If they don't match, the Deployment won't work

### Step 1.2: Verify Deployment Creation

```bash
# Check deployment status
kubectl get deployments
```

**Expected Output:**
```
NAME               READY   UP-TO-DATE   AVAILABLE   AGE
nginx-deployment   3/3     3            3           30s
```

**💡 Column Breakdown:**
- **READY**: 3/3 means 3 out of 3 desired pods are ready
- **UP-TO-DATE**: 3 pods are running the latest pod template
- **AVAILABLE**: 3 pods are available to serve traffic
- **AGE**: Time since deployment was created

```bash
# Get detailed deployment information
kubectl describe deployment nginx-deployment
```

**Key sections to observe:**

```yaml
Name:                   nginx-deployment
Namespace:              default
CreationTimestamp:      Sat, 26 Sep 2026 10:00:00 -0700
Labels:                 app=nginx
Selector:               app=nginx
Replicas:               3 desired | 3 updated | 3 total | 3 available | 0 unavailable
StrategyType:           RollingUpdate
MinReadySeconds:        0
RollingUpdateStrategy:  25% max unavailable, 25% max surge
Pod Template:
  Labels:  app=nginx
  Containers:
   nginx:
    Image:        nginx:1.21
    Port:         80/TCP
    Host Port:    0/TCP
Conditions:
  Type           Status  Reason
  ----           ------  ------
  Available      True    MinimumReplicasAvailable
  Progressing    True    NewReplicaSetAvailable
Events:
  Type    Reason             Age   From                   Message
  ----    ------             ----  ----                   -------
  Normal  ScalingReplicaSet  45s   deployment-controller  Scaled up replica set nginx-deployment-xxxxxxxxxx to 3
```

**💡 Important Fields:**
- **StrategyType: RollingUpdate**: Update strategy (vs Recreate)
- **RollingUpdateStrategy**: Controls update behavior
  - **25% max unavailable**: At most 25% of pods can be down during update
  - **25% max surge**: At most 25% extra pods can be created during update
- **Conditions**: Health status of the deployment

### Step 1.3: Examine ReplicaSets

```bash
# List ReplicaSets created by the Deployment
kubectl get replicasets
```

**Expected Output:**
```
NAME                          DESIRED   CURRENT   READY   AGE
nginx-deployment-xxxxxxxxxx   3         3         3       1m
```

**💡 ReplicaSet Naming:**
- Format: `<deployment-name>-<pod-template-hash>`
- Hash is generated from the pod template
- Each version of the deployment creates a new ReplicaSet

```bash
# Describe the ReplicaSet
kubectl describe replicaset nginx-deployment-xxxxxxxxxx
```

**Key sections:**

```yaml
Name:           nginx-deployment-xxxxxxxxxx
Namespace:      default
Selector:       app=nginx,pod-template-hash=xxxxxxxxxx
Labels:         app=nginx
                pod-template-hash=xxxxxxxxxx
Controlled By:  Deployment/nginx-deployment
Replicas:       3 current / 3 desired
Pods Status:    3 Running / 0 Waiting / 0 Succeeded / 0 Failed
```

**💡 Key Points:**
- **Controlled By**: Shows this ReplicaSet is owned by the Deployment
- **pod-template-hash**: Automatically added label for version tracking
- **Replicas**: Maintains desired count of 3 pods

### Step 1.4: Examine Pods

```bash
# List pods created by the Deployment
kubectl get pods -l app=nginx
```

**Expected Output:**
```
NAME                                READY   STATUS    RESTARTS   AGE
nginx-deployment-xxxxxxxxxx-aaaaa   1/1     Running   0          2m
nginx-deployment-xxxxxxxxxx-bbbbb   1/1     Running   0          2m
nginx-deployment-xxxxxxxxxx-ccccc   1/1     Running   0          2m
```

**💡 Pod Naming:**
- Format: `<replicaset-name>-<random-suffix>`
- Each pod gets a unique random suffix
- All pods have the same labels

```bash
# Get more details about pods
kubectl get pods -l app=nginx -o wide
```

**Expected Output:**
```
NAME                                READY   STATUS    RESTARTS   AGE   IP           NODE
nginx-deployment-xxxxxxxxxx-aaaaa   1/1     Running   0          3m    10.244.0.5   minikube
nginx-deployment-xxxxxxxxxx-bbbbb   1/1     Running   0          3m    10.244.0.6   minikube
nginx-deployment-xxxxxxxxxx-ccccc   1/1     Running   0          3m    10.244.0.7   minikube
```

**💡 Additional Information:**
- **IP**: Each pod gets its own IP address
- **NODE**: Which node the pod is running on

---

## 📝 Part 2: Self-Healing Demonstration

### Step 2.1: Delete a Pod

```bash
# Delete one pod
kubectl delete pod <pod-name>
# Replace <pod-name> with one from the list above
```

**Expected Output:**
```
pod "nginx-deployment-xxxxxxxxxx-aaaaa" deleted
```

### Step 2.2: Observe Self-Healing

```bash
# Immediately check pods
kubectl get pods -l app=nginx
```

**Expected Output:**
```
NAME                                READY   STATUS              RESTARTS   AGE
nginx-deployment-xxxxxxxxxx-bbbbb   1/1     Running             0          4m
nginx-deployment-xxxxxxxxxx-ccccc   1/1     Running             0          4m
nginx-deployment-xxxxxxxxxx-ddddd   0/1     ContainerCreating   0          2s
```

**💡 What Happened:**
1. You deleted one pod
2. ReplicaSet detected only 2/3 pods exist
3. ReplicaSet immediately created a new pod
4. New pod is starting (ContainerCreating)
5. Soon it will be Running

**Wait a few seconds and check again:**

```bash
kubectl get pods -l app=nginx
```

**Expected Output:**
```
NAME                                READY   STATUS    RESTARTS   AGE
nginx-deployment-xxxxxxxxxx-bbbbb   1/1     Running   0          5m
nginx-deployment-xxxxxxxxxx-ccccc   1/1     Running   0          5m
nginx-deployment-xxxxxxxxxx-ddddd   1/1     Running   0          30s
```

**💡 Self-Healing Complete:**
- New pod is now Running
- Total count back to 3/3
- Deployment maintains desired state automatically

**Self-Healing Flow:**
```
User deletes pod → ReplicaSet detects mismatch
                            ↓
                   Desired: 3, Current: 2
                            ↓
                   Creates new pod
                            ↓
                   Desired state restored
```

---

## 📝 Part 3: Scaling Deployments

### Step 3.1: Scale Up

```bash
# Scale to 5 replicas using kubectl scale
kubectl scale deployment nginx-deployment --replicas=5
```

**Expected Output:**
```
deployment.apps/nginx-deployment scaled
```

**💡 What This Does:**
- Updates the Deployment's `spec.replicas` field to 5
- Deployment updates the ReplicaSet
- ReplicaSet creates 2 new pods

```bash
# Watch the scaling happen
kubectl get pods -l app=nginx -w
```

**Expected Output:**
```
NAME                                READY   STATUS              RESTARTS   AGE
nginx-deployment-xxxxxxxxxx-bbbbb   1/1     Running             0          6m
nginx-deployment-xxxxxxxxxx-ccccc   1/1     Running             0          6m
nginx-deployment-xxxxxxxxxx-ddddd   1/1     Running             0          1m
nginx-deployment-xxxxxxxxxx-eeeee   0/1     ContainerCreating   0          1s
nginx-deployment-xxxxxxxxxx-fffff   0/1     ContainerCreating   0          1s
nginx-deployment-xxxxxxxxxx-eeeee   1/1     Running             0          3s
nginx-deployment-xxxxxxxxxx-fffff   1/1     Running             0          3s
```

Press `Ctrl+C` to stop watching.

**💡 Scaling Process:**
1. Deployment updated to replicas: 5
2. ReplicaSet creates 2 new pods
3. Pods start and become Ready
4. Total: 5/5 pods running

### Step 3.2: Verify Scaling

```bash
# Check deployment
kubectl get deployment nginx-deployment
```

**Expected Output:**
```
NAME               READY   UP-TO-DATE   AVAILABLE   AGE
nginx-deployment   5/5     5            5           8m
```

```bash
# Check ReplicaSet
kubectl get replicaset
```

**Expected Output:**
```
NAME                          DESIRED   CURRENT   READY   AGE
nginx-deployment-xxxxxxxxxx   5         5         5       8m
```

### Step 3.3: Scale Down

```bash
# Scale back to 3 replicas
kubectl scale deployment nginx-deployment --replicas=3
```

**Expected Output:**
```
deployment.apps/nginx-deployment scaled
```

```bash
# Verify scaling down
kubectl get pods -l app=nginx
```

**Expected Output:**
```
NAME                                READY   STATUS        RESTARTS   AGE
nginx-deployment-xxxxxxxxxx-bbbbb   1/1     Running       0          9m
nginx-deployment-xxxxxxxxxx-ccccc   1/1     Running       0          9m
nginx-deployment-xxxxxxxxxx-ddddd   1/1     Running       0          4m
nginx-deployment-xxxxxxxxxx-eeeee   1/1     Terminating   0          2m
nginx-deployment-xxxxxxxxxx-fffff   1/1     Terminating   0          2m
```

**💡 Terminating Pods:**
- Kubernetes gracefully shuts down excess pods
- Sends SIGTERM signal to containers
- Waits for graceful shutdown (default 30s)
- Then sends SIGKILL if still running

---

## 📝 Part 4: Rolling Updates

### Step 4.1: Update the Image Version

```bash
# Update to nginx version 1.22
kubectl set image deployment/nginx-deployment nginx=nginx:1.22
```

**Expected Output:**
```
deployment.apps/nginx-deployment image updated
```

**💡 Command Breakdown:**
- `kubectl set image`: Update container image
- `deployment/nginx-deployment`: Target deployment
- `nginx=nginx:1.22`: Container name = new image

**Alternative method using kubectl edit:**
```bash
# Edit the deployment directly
kubectl edit deployment nginx-deployment

# Change this line:
#   image: nginx:1.21
# To:
#   image: nginx:1.22
# Save and exit
```

### Step 4.2: Watch the Rolling Update

```bash
# Watch rollout status
kubectl rollout status deployment/nginx-deployment
```

**Expected Output:**
```
Waiting for deployment "nginx-deployment" rollout to finish: 1 out of 3 new replicas have been updated...
Waiting for deployment "nginx-deployment" rollout to finish: 1 out of 3 new replicas have been updated...
Waiting for deployment "nginx-deployment" rollout to finish: 2 out of 3 new replicas have been updated...
Waiting for deployment "nginx-deployment" rollout to finish: 2 out of 3 new replicas have been updated...
Waiting for deployment "nginx-deployment" rollout to finish: 2 out of 3 new replicas have been updated...
Waiting for deployment "nginx-deployment" rollout to finish: 1 old replicas are pending termination...
Waiting for deployment "nginx-deployment" rollout to finish: 1 old replicas are pending termination...
deployment "nginx-deployment" successfully rolled out
```

**💡 Rolling Update Process:**
```
Initial State: 3 pods running v1.21
       ↓
Step 1: Create 1 new pod (v1.22)
       ↓ [4 pods total: 3 old, 1 new]
Step 2: Terminate 1 old pod (v1.21)
       ↓ [3 pods total: 2 old, 1 new]
Step 3: Create 1 new pod (v1.22)
       ↓ [4 pods total: 2 old, 2 new]
Step 4: Terminate 1 old pod (v1.21)
       ↓ [3 pods total: 1 old, 2 new]
Step 5: Create 1 new pod (v1.22)
       ↓ [4 pods total: 1 old, 3 new]
Step 6: Terminate last old pod (v1.21)
       ↓
Final State: 3 pods running v1.22
```

### Step 4.3: Examine ReplicaSets After Update

```bash
# List all ReplicaSets
kubectl get replicasets
```

**Expected Output:**
```
NAME                          DESIRED   CURRENT   READY   AGE
nginx-deployment-xxxxxxxxxx   0         0         0       15m
nginx-deployment-yyyyyyyyyy   3         3         3       2m
```

**💡 Two ReplicaSets:**
- **Old ReplicaSet** (xxxxxxxxxx): Scaled to 0, kept for rollback
- **New ReplicaSet** (yyyyyyyyyy): Scaled to 3, running new version

```bash
# Describe the new ReplicaSet
kubectl describe replicaset nginx-deployment-yyyyyyyyyy
```

**Key sections:**

```yaml
Pod Template:
  Labels:  app=nginx
           pod-template-hash=yyyyyyyyyy
  Containers:
   nginx:
    Image:        nginx:1.22  ← Updated version!
```

### Step 4.4: Verify Pods Are Updated

```bash
# Check pod images
kubectl get pods -l app=nginx -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.containers[0].image}{"\n"}{end}'
```

**Expected Output:**
```
nginx-deployment-yyyyyyyyyy-aaaaa    nginx:1.22
nginx-deployment-yyyyyyyyyy-bbbbb    nginx:1.22
nginx-deployment-yyyyyyyyyy-ccccc    nginx:1.22
```

**💡 All pods now running nginx:1.22!**

---

## 📝 Part 5: Rollout History and Rollback

### Step 5.1: View Rollout History

```bash
# Check rollout history
kubectl rollout history deployment/nginx-deployment
```

**Expected Output:**
```
deployment.apps/nginx-deployment
REVISION  CHANGE-CAUSE
1         <none>
2         <none>
```

**💡 Revisions:**
- **REVISION 1**: Original deployment (nginx:1.21)
- **REVISION 2**: Updated deployment (nginx:1.22)
- **CHANGE-CAUSE**: Empty because we didn't annotate changes

### Step 5.2: Add Change Annotations

```bash
# Update with annotation
kubectl set image deployment/nginx-deployment nginx=nginx:1.23 --record
```

**Note:** `--record` flag is deprecated but still works. It records the command in the rollout history.

**Better approach:**
```bash
# Update with annotation
kubectl set image deployment/nginx-deployment nginx=nginx:1.23

# Add annotation manually
kubectl annotate deployment/nginx-deployment kubernetes.io/change-cause="Updated to nginx 1.23"
```

**Expected Output:**
```
deployment.apps/nginx-deployment image updated
deployment.apps/nginx-deployment annotated
```

### Step 5.3: View Updated History

```bash
# Check history again
kubectl rollout history deployment/nginx-deployment
```

**Expected Output:**
```
deployment.apps/nginx-deployment
REVISION  CHANGE-CAUSE
1         <none>
2         <none>
3         Updated to nginx 1.23
```

**💡 Now we can see what changed in revision 3!**

### Step 5.4: View Specific Revision Details

```bash
# View details of revision 2
kubectl rollout history deployment/nginx-deployment --revision=2
```

**Expected Output:**
```
deployment.apps/nginx-deployment with revision #2
Pod Template:
  Labels:	app=nginx
	pod-template-hash=yyyyyyyyyy
  Containers:
   nginx:
    Image:	nginx:1.22
    Port:	80/TCP
    Host Port:	0/TCP
```

### Step 5.5: Rollback to Previous Version

```bash
# Rollback to revision 2 (nginx:1.22)
kubectl rollout undo deployment/nginx-deployment
```

**Expected Output:**
```
deployment.apps/nginx-deployment rolled back
```

**💡 What This Does:**
- Reverts to the previous revision (revision 2)
- Creates a new revision (revision 4) that matches revision 2
- Performs a rolling update back to nginx:1.22

```bash
# Watch the rollback
kubectl rollout status deployment/nginx-deployment
```

**Expected Output:**
```
Waiting for deployment "nginx-deployment" rollout to finish: 1 out of 3 new replicas have been updated...
...
deployment "nginx-deployment" successfully rolled out
```

### Step 5.6: Verify Rollback

```bash
# Check current image version
kubectl get deployment nginx-deployment -o jsonpath='{.spec.template.spec.containers[0].image}'
echo
```

**Expected Output:**
```
nginx:1.22
```

**💡 Successfully rolled back to nginx:1.22!**

```bash
# Check history
kubectl rollout history deployment/nginx-deployment
```

**Expected Output:**
```
deployment.apps/nginx-deployment
REVISION  CHANGE-CAUSE
1         <none>
3         Updated to nginx 1.23
4         <none>
```

**💡 Notice:**
- Revision 2 is gone (became revision 4)
- Latest revision is now 4
- Rollback creates a new revision

### Step 5.7: Rollback to Specific Revision

```bash
# Rollback to revision 1 (nginx:1.21)
kubectl rollout undo deployment/nginx-deployment --to-revision=1
```

**Expected Output:**
```
deployment.apps/nginx-deployment rolled back
```

```bash
# Verify
kubectl get deployment nginx-deployment -o jsonpath='{.spec.template.spec.containers[0].image}'
echo
```

**Expected Output:**
```
nginx:1.21
```

---

## 📝 Part 6: Pause and Resume Rollouts

### Step 6.1: Pause a Rollout

```bash
# Pause the deployment
kubectl rollout pause deployment/nginx-deployment
```

**Expected Output:**
```
deployment.apps/nginx-deployment paused
```

**💡 Why Pause?**
- Make multiple changes without triggering updates
- Test changes before full rollout
- Canary deployments (manual control)

### Step 6.2: Make Changes While Paused

```bash
# Update image (won't trigger rollout)
kubectl set image deployment/nginx-deployment nginx=nginx:1.24

# Update resource limits (won't trigger rollout)
kubectl set resources deployment/nginx-deployment -c=nginx --limits=cpu=200m,memory=256Mi
```

**Expected Output:**
```
deployment.apps/nginx-deployment image updated
deployment.apps/nginx-deployment resource requirements updated
```

```bash
# Check deployment status
kubectl get deployment nginx-deployment
```

**Expected Output:**
```
NAME               READY   UP-TO-DATE   AVAILABLE   AGE
nginx-deployment   3/3     0            3           30m
```

**💡 Notice:**
- **UP-TO-DATE: 0** - No pods updated yet
- **AVAILABLE: 3** - Old pods still running
- Changes are staged but not applied

### Step 6.3: Resume the Rollout

```bash
# Resume the deployment
kubectl rollout resume deployment/nginx-deployment
```

**Expected Output:**
```
deployment.apps/nginx-deployment resumed
```

**💡 Now all staged changes are applied in one rollout!**

```bash
# Watch the rollout
kubectl rollout status deployment/nginx-deployment
```

**Expected Output:**
```
Waiting for deployment "nginx-deployment" rollout to finish: 1 out of 3 new replicas have been updated...
...
deployment "nginx-deployment" successfully rolled out
```

```bash
# Verify changes
kubectl get deployment nginx-deployment -o jsonpath='{.spec.template.spec.containers[0].image}'
echo
```

**Expected Output:**
```
nginx:1.24
```

---

## 📝 Part 7: Update Strategies

### Step 7.1: Understanding RollingUpdate Strategy

The default strategy is **RollingUpdate** with these parameters:

```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxUnavailable: 25%
    maxSurge: 25%
```

**💡 Parameter Explanation:**

| Parameter | Meaning | Example (3 replicas) |
|-----------|---------|---------------------|
| **maxUnavailable** | Max pods that can be down during update | 25% = 0.75 ≈ 1 pod |
| **maxSurge** | Max extra pods created during update | 25% = 0.75 ≈ 1 pod |

**Update Flow with 3 replicas:**
```
Initial: 3 pods running
    ↓
maxSurge allows 1 extra pod → Create 1 new pod
    ↓ [4 pods total]
maxUnavailable allows 1 down → Terminate 1 old pod
    ↓ [3 pods total]
Repeat until all pods updated
```

### Step 7.2: Configure Aggressive Rolling Update

```bash
# Create deployment with aggressive update strategy
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: fast-update-deployment
spec:
  replicas: 6
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 50%
      maxSurge: 50%
  selector:
    matchLabels:
      app: fast-update
  template:
    metadata:
      labels:
        app: fast-update
    spec:
      containers:
      - name: nginx
        image: nginx:1.21
        ports:
        - containerPort: 80
EOF
```

**💡 Aggressive Strategy:**
- **maxUnavailable: 50%** = Up to 3 pods can be down (6 * 0.5)
- **maxSurge: 50%** = Up to 3 extra pods (6 * 0.5)
- **Total during update**: 3 to 9 pods
- **Faster updates** but more resource usage

```bash
# Update the image
kubectl set image deployment/fast-update-deployment nginx=nginx:1.22

# Watch the fast rollout
kubectl rollout status deployment/fast-update-deployment
```

**💡 Notice the update completes faster!**

### Step 7.3: Configure Conservative Rolling Update

```bash
# Create deployment with conservative update strategy
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: slow-update-deployment
spec:
  replicas: 6
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 1
  selector:
    matchLabels:
      app: slow-update
  template:
    metadata:
      labels:
        app: slow-update
    spec:
      containers:
      - name: nginx
        image: nginx:1.21
        ports:
        - containerPort: 80
EOF
```

**💡 Conservative Strategy:**
- **maxUnavailable: 1** = Only 1 pod down at a time
- **maxSurge: 1** = Only 1 extra pod at a time
- **Total during update**: 5 to 7 pods
- **Slower updates** but more stable

```bash
# Update the image
kubectl set image deployment/slow-update-deployment nginx=nginx:1.22

# Watch the slower rollout
kubectl rollout status deployment/slow-update-deployment
```

**💡 Notice the update takes longer but is more controlled!**

### Step 7.4: Recreate Strategy

```bash
# Create deployment with Recreate strategy
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: recreate-deployment
spec:
  replicas: 3
  strategy:
    type: Recreate
  selector:
    matchLabels:
      app: recreate-demo
  template:
    metadata:
      labels:
        app: recreate-demo
    spec:
      containers:
      - name: nginx
        image: nginx:1.21
        ports:
        - containerPort: 80
EOF
```

**💡 Recreate Strategy:**
- Terminates ALL old pods first
- Then creates new pods
- **Downtime occurs** during update
- Use when: incompatible versions, database migrations

```bash
# Update the image
kubectl set image deployment/recreate-deployment nginx=nginx:1.22

# Watch the recreate process
kubectl get pods -l app=recreate-demo -w
```

**Expected Output:**
```
NAME                                   READY   STATUS        RESTARTS   AGE
recreate-deployment-xxxxxxxxxx-aaaaa   1/1     Terminating   0          1m
recreate-deployment-xxxxxxxxxx-bbbbb   1/1     Terminating   0          1m
recreate-deployment-xxxxxxxxxx-ccccc   1/1     Terminating   0          1m
recreate-deployment-yyyyyyyyyy-ddddd   0/1     Pending       0          0s
recreate-deployment-yyyyyyyyyy-eeeee   0/1     Pending       0          0s
recreate-deployment-yyyyyyyyyy-fffff   0/1     Pending       0          0s
recreate-deployment-yyyyyyyyyy-ddddd   0/1     ContainerCreating   0     1s
recreate-deployment-yyyyyyyyyy-eeeee   0/1     ContainerCreating   0     1s
recreate-deployment-yyyyyyyyyy-fffff   0/1     ContainerCreating   0     1s
```

**💡 Notice:**
1. All old pods terminate first
2. Brief period with 0 pods (downtime!)
3. New pods created
4. Service restored

---

## ✅ Validation Steps

### Comprehensive Validation

```bash
# 1. Check all deployments
kubectl get deployments

# 2. Check rollout status
kubectl rollout status deployment/nginx-deployment

# 3. Verify image version
kubectl get deployment nginx-deployment -o jsonpath='{.spec.template.spec.containers[0].image}'
echo

# 4. Check rollout history
kubectl rollout history deployment/nginx-deployment

# 5. Verify all pods are running
kubectl get pods -l app=nginx

# 6. Check ReplicaSets
kubectl get replicasets
```

---

## 🧹 Cleanup

```bash
# Delete all deployments created in this lab
kubectl delete deployment nginx-deployment fast-update-deployment slow-update-deployment recreate-deployment

# Verify cleanup
kubectl get deployments
kubectl get replicasets
kubectl get pods
```

---

## 🎯 Challenge Tasks

1. **Create a deployment with 10 replicas**
   - Use nginx:alpine image
   - Set maxUnavailable=3 and maxSurge=3
   - Update to nginx:latest
   - Observe the rollout

2. **Practice rollback scenarios**
   - Deploy version 1.21
   - Update to 1.22
   - Update to 1.23
   - Update to 1.24
   - Rollback to 1.22
   - View complete history

3. **Experiment with pause/resume**
   - Pause a deployment
   - Make 3 different changes
   - Resume and observe all changes apply together

---

## 📚 Key Takeaways

✅ **Deployments** manage ReplicaSets and Pods  
✅ **ReplicaSets** maintain desired pod count  
✅ **Rolling updates** provide zero-downtime deployments  
✅ **Rollback** reverts to previous versions  
✅ **maxSurge** controls extra pods during update  
✅ **maxUnavailable** controls pods down during update  
✅ **Pause/Resume** allows batching multiple changes  
✅ **Recreate strategy** causes downtime but ensures clean slate  

---

## 📖 Next Steps

Continue to [Lab 3.2: Scaling Strategies](lab-3.2-scaling-strategies.md) to learn about Horizontal Pod Autoscaling.

---

## 📝 Lab Completion Checklist

- [ ] Created a Deployment with 3 replicas
- [ ] Observed self-healing when pod deleted
- [ ] Scaled deployment up and down
- [ ] Performed rolling update
- [ ] Viewed rollout history
- [ ] Rolled back to previous version
- [ ] Paused and resumed rollout
- [ ] Configured different update strategies
- [ ] Tested Recreate strategy
- [ ] Completed challenge tasks
- [ ] Cleaned up all resources

**Congratulations! You've mastered Deployment lifecycle management!** 🎉
