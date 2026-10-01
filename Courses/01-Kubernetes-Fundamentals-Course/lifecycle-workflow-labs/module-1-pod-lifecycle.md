# Module 1 — Pod Lifecycle & Core Workload Behavior

## 📚 Related Chapters
- **Chapter 5**: Orchestrating Containers with Kubernetes
- **Chapter 6**: Deploying and Scaling Applications with Kubernetes
- **Chapter 7**: Troubleshooting Kubernetes

## 🎯 Module Goal

Understand what *actually happens* from the moment you submit a Pod manifest to the moment the Pod is terminated. By the end of this module you will be able to trace a Pod through all five stages of its life: **admission → scheduling → startup → running/health → termination.**

## ⏱️ Estimated Time
2.5 – 3 hours (all five labs)

## 📋 Prerequisites
- A running cluster (minikube or kind)
- `kubectl` configured
- A terminal where you can open 2 panes (one to run commands, one to `watch`)

---

## 🧠 The Big Picture: A Pod's Journey

Before the first lab, here is the end-to-end flow every Pod goes through. Keep returning to this diagram as you work — each lab zooms into one stage.

```
┌──────────────────────────────────────────────────────────────────┐
│                      THE LIFE OF A POD                            │
└──────────────────────────────────────────────────────────────────┘

  STAGE 0: SUBMISSION
  You ──kubectl apply──▶ kube-apiserver
                            │ (validates, authenticates, authorizes)
                            ▼
                          etcd  ◀── desired state persisted here
                            │
  ─────────────────────────┼──────────────────────────────────────
  STAGE 1: SCHEDULING       ▼
  kube-scheduler watches for Pods with no node assigned
      │  filters nodes (predicates) → scores nodes (priorities)
      │  writes pod.spec.nodeName = chosen-node
      ▼
  ─────────────────────────┼──────────────────────────────────────
  STAGE 2: STARTUP          ▼
  kubelet on chosen-node notices "a Pod is assigned to me"
      │  pulls image (per imagePullPolicy)
      │  asks the container runtime (containerd) to start containers
      │  sets up network (CNI) and volumes (CSI)
      ▼
  ─────────────────────────┼──────────────────────────────────────
  STAGE 3: RUNNING & HEALTH ▼
  kubelet runs probes:
      startupProbe   → "has it finished booting?"
      readinessProbe → "can it receive traffic?"  (gates Service endpoints)
      livenessProbe  → "is it still alive?"       (restarts if failing)
      ▼
  ─────────────────────────┼──────────────────────────────────────
  STAGE 4: TERMINATION      ▼
  kubectl delete pod
      │  Pod marked Terminating, removed from Service endpoints
      │  preStop hook runs (if any)
      │  SIGTERM sent to PID 1
      │  wait up to terminationGracePeriodSeconds (default 30s)
      │  SIGKILL if still alive
      ▼
    Gone. etcd entry removed.
```

**The golden rule of Kubernetes:** you declare *desired state*; controllers continuously work to make *actual state* match it. Every stage above is a controller reacting to a change.

---
---

# Lab 1.1 — Apply Your First Pod Manifest

## 🧩 Explanation (Read First)

When you run `kubectl apply -f pod.yaml`, your YAML does **not** go straight to a node. It takes a very specific path:

1. **kubectl** converts your YAML to a JSON API request and sends it to the **kube-apiserver** — the single front door to the cluster. Nothing in Kubernetes talks to etcd directly except the API server.
2. The API server runs the request through **authentication** (who are you?), **authorization** (are you allowed?), and **admission controllers** (should this be modified or rejected?).
3. If accepted, the object is written to **etcd**, the cluster's key-value database. At this instant your Pod *exists as desired state* — but it is not running anywhere yet. Its status is `Pending`.
4. Controllers and the scheduler, which are **watching** etcd (via the API server), now notice the new Pod and begin acting on it.

This lab makes that flow concrete. You'll create a Pod, then inspect the full object the API server stored — including fields you never wrote, which Kubernetes added for you (defaults, status, timestamps).

**Why this matters:** Understanding that `apply` = "store my desired state" (not "run my container now") is the foundation for everything else. Pending Pods, scheduling failures, and admission rejections all make sense once you internalize this.

## 🎯 Objectives
- Create a Pod and observe the API server → etcd flow
- Inspect the full etcd-backed object, including server-added fields
- Distinguish *desired state* (`spec`) from *actual state* (`status`)

## 📝 Steps

### Step 1 — Create the manifest

```bash
cat <<EOF > pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: lifecycle-demo
  labels:
    app: lifecycle-demo
spec:
  containers:
  - name: web
    image: nginx:1.25
    ports:
    - containerPort: 80
EOF
```

**💡 Code explanation:**

| Field | Meaning |
|-------|---------|
| `apiVersion: v1` | Pods live in the **core** API group (no group prefix) |
| `kind: Pod` | The resource type being declared |
| `metadata.name` | Unique name *within the namespace* |
| `metadata.labels` | Key/value tags used later by Services and selectors |
| `spec.containers` | The **desired** containers — this is what *you* control |
| `image: nginx:1.25` | Image + tag the runtime will pull |
| `containerPort: 80` | Informational: documents the port the container listens on |

### Step 2 — Apply it and watch the status flow

```bash
kubectl apply -f pod.yaml
```

**Expected output:**
```
pod/lifecycle-demo created
```

Immediately check the phase — you may briefly catch `Pending` before it becomes `Running`:

```bash
kubectl get pod lifecycle-demo -w
```

**Expected output (over a few seconds):**
```
NAME             READY   STATUS              RESTARTS   AGE
lifecycle-demo   0/1     Pending             0          0s
lifecycle-demo   0/1     ContainerCreating   0          1s
lifecycle-demo   1/1     Running             0          4s
```

**💡 What you just saw:** `Pending` = stored in etcd, not yet started. `ContainerCreating` = kubelet is pulling the image and setting up. `Running` = container process is alive. Press `Ctrl+C` to stop watching.

### Step 3 — Inspect the full object the API server stored

```bash
kubectl get pod lifecycle-demo -o yaml
```

Scroll through the output. You wrote ~12 lines; the server stored dozens. Notice fields **you never wrote**:

```yaml
metadata:
  creationTimestamp: "2026-10-01T17:00:00Z"   # server-added
  uid: 7c3e...-...-...                          # server-added unique ID
  resourceVersion: "48213"                      # etcd version for this object
spec:
  nodeName: minikube                            # ADDED BY THE SCHEDULER
  serviceAccountName: default                   # admission-added default
  terminationGracePeriodSeconds: 30             # defaulted
  dnsPolicy: ClusterFirst                        # defaulted
status:
  phase: Running                                # ACTUAL state (not written by you)
  podIP: 10.244.0.12
  hostIP: 192.168.49.2
  conditions:
  - type: Ready
    status: "True"
```

**💡 Key insight — `spec` vs `status`:**
- `spec` = **desired state**. You own this.
- `status` = **actual state**. The controllers and kubelet own this; it is continuously reconciled.
- `spec.nodeName` was empty when you applied — the **scheduler** filled it in (Lab 1.2 covers how).

### Step 4 — Prove it came back from etcd

```bash
# resourceVersion is etcd's internal version counter for this object
kubectl get pod lifecycle-demo -o jsonpath='{.metadata.resourceVersion}{"\n"}'
```

Every change to the object (status update, label edit) increments this number. It's direct evidence the object is backed by a versioned datastore.

## ✅ Validation
```bash
kubectl get pod lifecycle-demo        # STATUS should be Running, READY 1/1
kubectl get pod lifecycle-demo -o jsonpath='{.spec.nodeName}{"\n"}'   # should show a node name
```
You understand this lab if you can answer: *"Why was the Pod `Pending` for a moment, and who filled in `nodeName`?"*

## 🧹 Cleanup
Keep `lifecycle-demo` running — Lab 1.4 and 1.5 reuse the concept. If you want a clean slate:
```bash
kubectl delete pod lifecycle-demo
```

## 📌 Key Takeaways
- `kubectl apply` stores **desired state** in etcd via the API server; it does not run containers itself.
- The API server is the only component that touches etcd.
- The server adds defaults, a UID, timestamps, and status; the scheduler adds `nodeName`.
- `spec` = what you want; `status` = what currently is.

---
---

# Lab 1.2 — Scheduling Deep Dive

## 🧩 Explanation (Read First)

A freshly created Pod has an empty `spec.nodeName`. The **kube-scheduler** is a control-plane component whose only job is to watch for such "unassigned" Pods and decide which node each should run on. It does this in two phases:

1. **Filtering (predicates):** eliminate nodes that *cannot* run the Pod. Examples: not enough free CPU/memory, a `nodeSelector` that doesn't match, a **taint** the Pod doesn't **tolerate**, or a port conflict.
2. **Scoring (priorities):** rank the surviving nodes to pick the *best* one. Examples: spread Pods across nodes, prefer nodes that already have the image, balance resource usage.

The winner's name is written to `spec.nodeName`, and the kubelet on that node takes over.

**Taints and tolerations** are the main lever you control here. A **taint** on a node says "repel Pods unless they explicitly tolerate me." This is how control-plane nodes keep normal workloads off, and how you reserve nodes for special workloads (GPUs, etc.).

**Why this matters:** When a Pod is stuck `Pending`, 90% of the time it's a scheduling problem — no node passed the filter stage. Being able to read scheduler decisions in the events is a core troubleshooting skill.

## 🎯 Objectives
- Watch the scheduler assign a node and read its decision from events
- Use a taint to make a Pod unschedulable, then observe `Pending`
- Add a toleration (or remove the taint) and watch it schedule

## 📝 Steps

### Step 1 — See the scheduler's decision in events

```bash
kubectl run sched-demo --image=nginx:1.25
kubectl describe pod sched-demo | sed -n '/Events:/,$p'
```

**Expected output:**
```
Events:
  Type    Reason     Age   From               Message
  ----    ------     ----  ----               -------
  Normal  Scheduled  2s    default-scheduler  Successfully assigned default/sched-demo to minikube
  Normal  Pulling    2s    kubelet            Pulling image "nginx:1.25"
  Normal  Pulled     1s    kubelet            Successfully pulled image
  Normal  Created    1s    kubelet            Created container sched-demo
  Normal  Started    1s    kubelet            Started container sched-demo
```

**💡 Read the actors:** The `Scheduled` event comes **From: default-scheduler** — that's the filtering+scoring result. Every event after it comes **From: kubelet** — the node taking over (Stage 2).

### Step 2 — Taint the node so Pods are repelled

First find your node name, then taint it:

```bash
NODE=$(kubectl get nodes -o jsonpath='{.items[0].metadata.name}')
echo "Tainting node: $NODE"
kubectl taint nodes "$NODE" tier=reserved:NoSchedule
```

**💡 Code explanation:** `tier=reserved:NoSchedule` is a `key=value:effect` triple. The `NoSchedule` effect means: *the scheduler will not place any new Pod here unless the Pod tolerates this exact taint.*

### Step 3 — Create a Pod and watch it get stuck

```bash
kubectl run tainted-demo --image=nginx:1.25
kubectl get pod tainted-demo        # STATUS: Pending
kubectl describe pod tainted-demo | sed -n '/Events:/,$p'
```

**Expected output:**
```
Events:
  Type     Reason            Age   From               Message
  ----     ------            ----  ----               -------
  Warning  FailedScheduling  5s    default-scheduler  0/1 nodes are available: 1 node(s) had untolerated taint {tier: reserved}. ...
```

**💡 This is the single most useful troubleshooting line in Kubernetes.** `FailedScheduling` from the scheduler tells you *exactly* why no node qualified. Here: the only node has a taint the Pod doesn't tolerate.

### Step 4 — Fix it with a toleration

```bash
kubectl delete pod tainted-demo
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: tolerating-demo
spec:
  tolerations:
  - key: tier
    operator: Equal
    value: reserved
    effect: NoSchedule
  containers:
  - name: web
    image: nginx:1.25
EOF
kubectl get pod tolerating-demo        # should become Running
```

**💡 Code explanation:** The `tolerations` block says "I accept the `tier=reserved:NoSchedule` taint." Now the node passes the filter stage for this Pod, and it schedules.

### Step 5 — Remove the taint (cleanup for later labs)

```bash
kubectl taint nodes "$NODE" tier=reserved:NoSchedule-
```
**💡** The trailing `-` means *remove* this taint.

## ✅ Validation
```bash
kubectl get pod tolerating-demo        # Running
kubectl describe node "$NODE" | grep -i taint    # should show <none>
```
You understand this lab if you can explain the `FailedScheduling` message in your own words.

## 🧹 Cleanup
```bash
kubectl delete pod sched-demo tolerating-demo --ignore-not-found
```

## 📌 Key Takeaways
- The scheduler assigns `nodeName` using **filter (predicates) → score (priorities)**.
- Taints repel Pods; tolerations let specific Pods accept the taint.
- `FailedScheduling` events tell you precisely why a Pod is `Pending`.

---
---

# Lab 1.3 — Container Startup & Image Pull Flow

## 🧩 Explanation (Read First)

Once the scheduler sets `nodeName`, the **kubelet** on that node takes over. The kubelet is the node agent that turns a Pod spec into running containers. Its startup sequence:

1. **Pull the image** according to `imagePullPolicy`:
   - `IfNotPresent` (default for tagged images): pull only if the image isn't already cached on the node.
   - `Always` (default when tag is `:latest` or omitted): always contact the registry to check for a newer image.
   - `Never`: only use a locally cached image; fail if absent.
2. **Create and start containers** via the container runtime (containerd/CRI-O) using CRI (Container Runtime Interface) calls.
3. **Report container states** back into `pod.status.containerStatuses`. A container is always in exactly one of three states:
   - `waiting` (e.g. pulling image, or `ImagePullBackOff`)
   - `running` (has a start time)
   - `terminated` (has an exit code and reason)

**Why this matters:** Image pull problems (`ImagePullBackOff`, `ErrImagePull`) are among the most common Pod failures. Knowing *where* in the kubelet flow they occur — and reading the `containerStatuses` — lets you diagnose them instantly.

## 🎯 Objectives
- Observe kubelet image-pull behavior and the three container states
- Compare `imagePullPolicy` values
- Read `status.containerStatuses` to pinpoint startup issues

## 📝 Steps

### Step 1 — Watch a cold image pull

Use an image unlikely to be cached, and watch the states:

```bash
kubectl run pull-demo --image=hashicorp/http-echo:1.0 -- -text="hello"
kubectl get pod pull-demo -w
```

You'll see `ContainerCreating` (kubelet pulling) then `Running`. `Ctrl+C` to stop.

### Step 2 — Inspect the structured container state

```bash
kubectl get pod pull-demo -o jsonpath='{.status.containerStatuses[0].state}{"\n"}'
```

**Expected output (running):**
```
{"running":{"startedAt":"2026-10-01T17:10:03Z"}}
```

**💡** This is the machine-readable truth of the container. `running` with a `startedAt` means the process is alive.

### Step 3 — Trigger a pull failure to see the `waiting` state

```bash
kubectl run badimage-demo --image=nginx:does-not-exist-9999
sleep 20
kubectl get pod badimage-demo
kubectl get pod badimage-demo -o jsonpath='{.status.containerStatuses[0].state}{"\n"}'
```

**Expected output:**
```
NAME            READY   STATUS             RESTARTS   AGE
badimage-demo   0/1     ImagePullBackOff   0          20s

{"waiting":{"message":"Back-off pulling image ...","reason":"ImagePullBackOff"}}
```

**💡 Flow insight:** The container is `waiting` with reason `ImagePullBackOff`. The kubelet tried to pull, failed, and is now backing off (retrying with exponential delay). The `describe` events confirm it:

```bash
kubectl describe pod badimage-demo | sed -n '/Events:/,$p'
```
```
  Warning  Failed     ...   kubelet   Failed to pull image "nginx:does-not-exist-9999": not found
  Warning  Failed     ...   kubelet   Error: ErrImagePull
  Normal   BackOff    ...   kubelet   Back-off pulling image
```

### Step 4 — Compare imagePullPolicy

```bash
kubectl run policy-demo --image=nginx:1.25 \
  --overrides='{"spec":{"containers":[{"name":"policy-demo","image":"nginx:1.25","imagePullPolicy":"IfNotPresent"}]}}'
kubectl get pod policy-demo -o jsonpath='{.spec.containers[0].imagePullPolicy}{"\n"}'
```

**Expected output:**
```
IfNotPresent
```

**💡** Because the image is tagged (`:1.25`), the default is `IfNotPresent`, so the kubelet reuses the node's cached layer from earlier labs — the pull is instant.

## ✅ Validation
```bash
kubectl get pod pull-demo                 # Running
kubectl get pod badimage-demo             # ImagePullBackOff (expected failure)
```
You understand this lab if you can name the three container states and say which one `ImagePullBackOff` is.

## 🧹 Cleanup
```bash
kubectl delete pod pull-demo badimage-demo policy-demo --ignore-not-found
```

## 📌 Key Takeaways
- The kubelet pulls images (per `imagePullPolicy`) then starts containers via the runtime (CRI).
- Containers are always `waiting`, `running`, or `terminated`.
- `ImagePullBackOff` is a `waiting` state; read `status.containerStatuses` and events to confirm the cause.

---
---

# Lab 1.4 — Probes & Health Management

## 🧩 Explanation (Read First)

A container being `running` does **not** mean it's ready to serve traffic or even healthy. The kubelet uses three probes to manage health, each answering a different question:

| Probe | Question it answers | What happens on failure |
|-------|---------------------|-------------------------|
| **startupProbe** | "Has the app finished booting?" | Keeps other probes disabled until it passes; if it never passes, the container is killed |
| **readinessProbe** | "Can it receive traffic *right now*?" | Pod is **removed from Service endpoints** (no traffic) but **not** restarted |
| **livenessProbe** | "Is it still alive, or wedged?" | Container is **killed and restarted** |

The critical distinction: **readiness controls traffic; liveness controls restarts.** A common production outage is putting a slow dependency check in a liveness probe — the container gets killed in a restart loop instead of simply being marked not-ready.

Probes can be `httpGet`, `tcpSocket`, or `exec` (run a command; exit 0 = success).

**Why this matters:** Probes are how Kubernetes achieves self-healing and zero-downtime rollouts. Readiness gating is *why* a rolling update doesn't send traffic to a half-started Pod.

## 🎯 Objectives
- Configure startup, readiness, and liveness probes
- Observe readiness gating traffic (READY column)
- Watch a failing liveness probe restart a container

## 📝 Steps

### Step 1 — Deploy a Pod with all three probes

```bash
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: probes-demo
  labels:
    app: probes-demo
spec:
  containers:
  - name: web
    image: nginx:1.25
    ports:
    - containerPort: 80
    startupProbe:
      httpGet: { path: /, port: 80 }
      failureThreshold: 30
      periodSeconds: 2
    readinessProbe:
      httpGet: { path: /, port: 80 }
      initialDelaySeconds: 2
      periodSeconds: 5
    livenessProbe:
      httpGet: { path: /, port: 80 }
      initialDelaySeconds: 5
      periodSeconds: 5
EOF
```

**💡 Code explanation:**

| Setting | Meaning |
|---------|---------|
| `startupProbe.failureThreshold: 30` × `periodSeconds: 2` | App gets up to 60s to boot before being declared failed |
| `readinessProbe.periodSeconds: 5` | Every 5s, check if it can serve traffic |
| `livenessProbe.initialDelaySeconds: 5` | Wait 5s after start before the first liveness check |
| `httpGet { path: /, port: 80 }` | Probe succeeds if HTTP GET `/` returns 2xx/3xx |

### Step 2 — Confirm readiness gates the READY column

```bash
kubectl get pod probes-demo
```

**Expected output:**
```
NAME          READY   STATUS    RESTARTS   AGE
probes-demo   1/1     Running   0          15s
```

**💡** `READY 1/1` means the **readiness** probe passed. If you had queried in the first 2 seconds you'd have seen `0/1 Running` — running but not ready. This exact mechanism is what keeps traffic off not-yet-ready Pods behind a Service.

### Step 3 — Break liveness and watch a restart

Delete the nginx index file the probe depends on, then make the probe path point to a missing file. Simplest demonstration: swap in a liveness probe that checks a path that returns 404.

```bash
kubectl delete pod probes-demo
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: liveness-fail
spec:
  containers:
  - name: web
    image: nginx:1.25
    livenessProbe:
      httpGet: { path: /nonexistent-health, port: 80 }
      initialDelaySeconds: 3
      periodSeconds: 3
      failureThreshold: 2
EOF
kubectl get pod liveness-fail -w
```

**Expected output (RESTARTS climbs):**
```
NAME            READY   STATUS    RESTARTS   AGE
liveness-fail   1/1     Running   0          4s
liveness-fail   1/1     Running   1          12s
liveness-fail   1/1     Running   2 (3s ago) 22s
```

`Ctrl+C` to stop. Confirm the reason:

```bash
kubectl describe pod liveness-fail | sed -n '/Events:/,$p'
```
```
  Warning  Unhealthy  ...  kubelet  Liveness probe failed: HTTP probe returned statuscode: 404
  Normal   Killing    ...  kubelet  Container web failed liveness probe, will be restarted
```

**💡 Flow insight:** nginx returns 404 for `/nonexistent-health`. After 2 consecutive failures the kubelet **kills and restarts** the container — this is liveness in action. A readiness probe failing here would have set `READY 0/1` instead, with **no restart**.

## ✅ Validation
```bash
kubectl get pod liveness-fail        # RESTARTS should be > 0 and climbing
```
You understand this lab if you can state: *"Readiness failing removes traffic; liveness failing restarts the container."*

## 🧹 Cleanup
```bash
kubectl delete pod probes-demo liveness-fail --ignore-not-found
```

## 📌 Key Takeaways
- **startupProbe** protects slow-booting apps; **readinessProbe** gates traffic; **livenessProbe** triggers restarts.
- `READY x/1` reflects the readiness probe.
- Misusing liveness for dependency checks causes restart loops — a classic production bug.

---
---

# Lab 1.5 — Pod Deletion & Graceful Shutdown

## 🧩 Explanation (Read First)

Deleting a Pod is not instant. Kubernetes gives applications a chance to finish in-flight work and shut down cleanly. The termination flow:

1. The Pod is marked `Terminating` and its `deletionTimestamp` is set. **Immediately** it is removed from all Service endpoints — so new traffic stops arriving (this is why readiness + endpoints matter).
2. If a **`preStop` hook** is defined, it runs now (e.g. "drain connections", "deregister from a load balancer").
3. The container runtime sends **`SIGTERM`** to PID 1 of each container. A well-behaved app catches SIGTERM and starts a clean shutdown.
4. Kubernetes waits up to **`terminationGracePeriodSeconds`** (default **30s**).
5. If the container is still alive when the grace period expires, it receives **`SIGKILL`** (forceful, uncatchable).

**Why this matters:** Graceful shutdown is what makes rolling updates and node drains safe. If your app ignores SIGTERM, users get dropped connections during every deploy. If your grace period is too short, long requests get cut off.

## 🎯 Objectives
- Observe the `Terminating` phase and grace period
- See the SIGTERM → grace → SIGKILL sequence
- Use a `preStop` hook and read its effect

## 📝 Steps

### Step 1 — Create a Pod with a preStop hook and visible grace period

```bash
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: shutdown-demo
spec:
  terminationGracePeriodSeconds: 30
  containers:
  - name: app
    image: nginx:1.25
    lifecycle:
      preStop:
        exec:
          command: ["/bin/sh","-c","echo 'preStop: draining...'; sleep 5"]
EOF
kubectl get pod shutdown-demo -w &
```

Wait until it's `Running`, then continue.

**💡 Code explanation:**
- `terminationGracePeriodSeconds: 30` — the kubelet waits up to 30s between SIGTERM and SIGKILL.
- `lifecycle.preStop.exec` — runs **before** SIGTERM is sent. Here it simulates draining for 5s. The grace-period clock includes preStop time.

### Step 2 — Delete it and time the flow

```bash
time kubectl delete pod shutdown-demo
```

**Expected output:**
```
pod "shutdown-demo" deleted

real    0m6.4s
```

**💡 Flow insight:** The delete returned in ~6s, not instantly and not 30s. Breakdown: ~5s preStop drain + ~1s for nginx to handle SIGTERM and exit cleanly. Because nginx exits *before* the 30s grace period, SIGKILL is never needed.

### Step 3 — Force an impatient delete (skip grace)

```bash
kubectl run stubborn --image=nginx:1.25
kubectl wait --for=condition=Ready pod/stubborn --timeout=60s

# Grace period 0 = immediate SIGKILL, no graceful shutdown
time kubectl delete pod stubborn --grace-period=0 --force
```

**Expected output:**
```
warning: Immediate deletion does not wait for confirmation that the running resource has been terminated...
pod "stubborn" force deleted

real    0m0.4s
```

**💡** `--grace-period=0 --force` skips SIGTERM/preStop entirely and removes the API object immediately. Useful for stuck Pods, but **dangerous** for stateful apps — it's the equivalent of pulling the power cord.

### Step 4 — Watch the Terminating phase live (optional)

In a second terminal, run `kubectl get pods -w`, then in the first delete a running Pod with a longer preStop. You'll see the `Terminating` status persist for the duration of the grace period before the row disappears.

```bash
# stop the background watch from Step 1 if still running
kill %1 2>/dev/null || true
```

## ✅ Validation
```bash
kubectl get pods | grep -E 'shutdown-demo|stubborn' || echo "Both pods gone — termination worked."
```
You understand this lab if you can order these events: *removed from endpoints, preStop, SIGTERM, grace period, SIGKILL.*

## 🧹 Cleanup
```bash
kubectl delete pod shutdown-demo stubborn --ignore-not-found
```

## 📌 Key Takeaways
- Deletion is graceful by default: endpoints removed → preStop → SIGTERM → grace wait → SIGKILL.
- `terminationGracePeriodSeconds` (default 30s) bounds how long Kubernetes waits.
- `--grace-period=0 --force` is an immediate kill — avoid for stateful workloads.

---
---

## 🎓 Module 1 Summary

You traced a Pod through its entire life:

```
apply ─▶ etcd(Pending) ─▶ scheduler(nodeName) ─▶ kubelet(pull+start)
      ─▶ probes(ready/live) ─▶ delete(SIGTERM→grace→SIGKILL)
```

| Lab | Stage | One-line lesson |
|-----|-------|-----------------|
| 1.1 | Submission | `apply` stores desired state; scheduler fills `nodeName` |
| 1.2 | Scheduling | filter → score; taints/tolerations control placement |
| 1.3 | Startup | kubelet pulls image, starts container; 3 container states |
| 1.4 | Health | readiness gates traffic, liveness triggers restarts |
| 1.5 | Termination | graceful SIGTERM → grace period → SIGKILL |

**Next:** [Module 2 — Networking Flow & Service Discovery](module-2-networking-flow.md), where these running Pods get IPs, Services, and DNS names.
