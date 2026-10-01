# Module 4 — Scaling Flow & Autoscaling

## 📚 Related Chapters
- **Chapter 6**: Deploying and Scaling Applications with Kubernetes

## 🎯 Module Goal

Understand how Kubernetes changes the number of running Pods — first **manually**, then **automatically** based on live metrics. You'll see the Deployment → ReplicaSet → Pod control loop in action and watch the Horizontal Pod Autoscaler (HPA) react to real CPU load.

## ⏱️ Estimated Time
1.5 – 2 hours (both labs)

## 📋 Prerequisites
- Completed Modules 1–3
- **metrics-server installed** (required for Lab 4.2). On minikube: `minikube addons enable metrics-server`

---

## 🧠 The Big Picture: Controllers Reconcile a Replica Count

```
┌──────────────────────────────────────────────────────────────────┐
│                   KUBERNETES SCALING FLOW                         │
└──────────────────────────────────────────────────────────────────┘

  MANUAL SCALING
  You set replicas=5 ─▶ Deployment controller updates its ReplicaSet
       ─▶ ReplicaSet controller sees "want 5, have 2"
       ─▶ creates 3 more Pods to reconcile to desired state

   ┌────────────┐  manages  ┌────────────┐  manages  ┌─────┐
   │ Deployment │──────────▶│ ReplicaSet │──────────▶│ Pods│ (N replicas)
   └────────────┘           └────────────┘           └─────┘
         ▲ desired=5              ▲ want 5                │ have 2→5
         │                        └───────reconcile───────┘

  AUTOMATIC SCALING (HPA)
  metrics-server collects CPU/mem from kubelets every ~15s
         │
         ▼
   ┌────────────┐  reads metrics   ┌──────────────┐  sets replicas  ┌────────────┐
   │ HPA        │─────────────────▶│ compares to  │────────────────▶│ Deployment │
   │ controller │                  │ target (50%) │                 │ (replicas) │
   └────────────┘                  └──────────────┘                 └────────────┘

   desiredReplicas = ceil( currentReplicas × currentMetric / targetMetric )
```

**The underlying pattern:** everything is a **control loop**. A controller compares *desired* vs *actual* and takes action to close the gap. Manual scaling just changes the desired number; HPA changes it *for you* based on metrics. Same reconciliation machinery underneath.

---
---

# Lab 4.1 — Manual Scaling

## 🧩 Explanation (Read First)

When you create a **Deployment**, you don't directly manage Pods. The Deployment creates and owns a **ReplicaSet**, and the ReplicaSet owns the **Pods**. This two-level hierarchy exists so that updates (Module: deployment lifecycle) can roll between ReplicaSets while each ReplicaSet's only job is "keep exactly N Pods alive."

When you scale, two controllers cooperate:
1. The **Deployment controller** updates the replica count on its current ReplicaSet.
2. The **ReplicaSet controller** notices actual Pod count ≠ desired, and creates or deletes Pods to match.

This happens continuously — if you delete a Pod from a scaled Deployment, the ReplicaSet immediately recreates it. That self-healing is the same control loop as scaling, just triggered by a different change.

**Why this matters:** Understanding the Deployment → ReplicaSet → Pod ownership chain explains self-healing, rolling updates, and why you should never manage Pods directly when a Deployment owns them.

## 🎯 Objectives
- Scale a Deployment up and down and observe the ReplicaSet reconcile
- Watch self-healing recreate a deleted Pod
- Read the ownership chain (Pod → ReplicaSet → Deployment)

## 📝 Steps

### Step 1 — Create a Deployment

```bash
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: scaler
spec:
  replicas: 2
  selector:
    matchLabels:
      app: scaler
  template:
    metadata:
      labels:
        app: scaler
    spec:
      containers:
      - name: web
        image: nginx:1.25
        resources:
          requests:
            cpu: 50m
EOF
kubectl rollout status deployment/scaler
```

**💡** `resources.requests.cpu: 50m` matters for Lab 4.2 — the HPA computes utilization as a percentage of this request.

### Step 2 — Observe the hierarchy

```bash
kubectl get deployment scaler
kubectl get replicaset -l app=scaler
kubectl get pods -l app=scaler
```

**Expected output:**
```
NAME     READY   UP-TO-DATE   AVAILABLE   AGE
scaler   2/2     2            2           20s

NAME               DESIRED   CURRENT   READY   AGE
scaler-7d9c8b6f5   2         2         2       20s

NAME                     READY   STATUS    RESTARTS   AGE
scaler-7d9c8b6f5-aaaaa   1/1     Running   0          20s
scaler-7d9c8b6f5-bbbbb   1/1     Running   0          20s
```

**💡** One Deployment owns one ReplicaSet (`scaler-7d9c8b6f5`) which owns two Pods. Confirm ownership:

```bash
kubectl get pod -l app=scaler -o jsonpath='{.items[0].metadata.ownerReferences[0].kind}/{.items[0].metadata.ownerReferences[0].name}{"\n"}'
```
```
ReplicaSet/scaler-7d9c8b6f5
```

### Step 3 — Scale up and watch the reconcile

```bash
kubectl scale deployment scaler --replicas=5
kubectl get pods -l app=scaler -w
```

**Expected output:**
```
scaler-7d9c8b6f5-ccccc   0/1   ContainerCreating   0   1s
scaler-7d9c8b6f5-ddddd   0/1   ContainerCreating   0   1s
scaler-7d9c8b6f5-eeeee   0/1   ContainerCreating   0   1s
scaler-7d9c8b6f5-ccccc   1/1   Running             0   4s
...
```

`Ctrl+C` when all 5 are Running.

**💡 Flow insight:** You changed *desired* to 5. The ReplicaSet controller saw "have 2, want 5" and created exactly 3 Pods. Pure reconciliation.

### Step 4 — Watch self-healing

```bash
VICTIM=$(kubectl get pod -l app=scaler -o jsonpath='{.items[0].metadata.name}')
echo "Deleting $VICTIM ..."
kubectl delete pod "$VICTIM"
kubectl get pods -l app=scaler
```

**Expected output:**
```
NAME                     READY   STATUS              RESTARTS   AGE
scaler-7d9c8b6f5-ddddd   1/1     Running             0          2m
...
scaler-7d9c8b6f5-fffff   0/1     ContainerCreating   0          2s   <-- NEW replacement
```

**💡** Still 5 Pods. The ReplicaSet instantly replaced the deleted one — same control loop, triggered by actual count dropping below desired. **This is why you never `kubectl delete pod` to "remove" a Deployment's Pod permanently.**

### Step 5 — Scale down

```bash
kubectl scale deployment scaler --replicas=1
kubectl get pods -l app=scaler
```

**💡** The ReplicaSet terminated 4 Pods to reconcile down to 1.

## ✅ Validation
```bash
kubectl get deployment scaler -o jsonpath='{.spec.replicas} desired / {.status.availableReplicas} available{"\n"}'
```
You understand this lab if you can explain why deleting a Pod didn't reduce the count.

## 🧹 Cleanup
Keep `scaler` scaled to 1 — Lab 4.2 attaches an HPA to it.

## 📌 Key Takeaways
- Deployment → ReplicaSet → Pod is an ownership chain; you manage the top, controllers manage the rest.
- Scaling changes *desired* replicas; the ReplicaSet controller reconciles actual to match.
- Self-healing is the same reconcile loop reacting to Pod deletion.

---
---

# Lab 4.2 — Horizontal Pod Autoscaler (HPA)

## 🧩 Explanation (Read First)

Manual scaling requires a human to react to load. The **Horizontal Pod Autoscaler (HPA)** automates it: it watches a metric (commonly CPU utilization) and adjusts the Deployment's replica count to keep that metric near a target.

The data flow it depends on:
1. The **kubelet** on each node exposes per-container resource usage.
2. **metrics-server** scrapes all kubelets (~every 15s) and serves the aggregated data via the **Metrics API** (`metrics.k8s.io`). *The HPA cannot work without this component.*
3. The **HPA controller** reads current utilization from the Metrics API every ~15s and computes the desired replicas:

```
desiredReplicas = ceil( currentReplicas × currentUtilization / targetUtilization )
```

Example: 2 replicas at 80% CPU, target 40% → `ceil(2 × 80/40)` = **4 replicas**.

HPA respects `minReplicas`/`maxReplicas` bounds and has built-in stabilization to avoid flapping (scaling up fast, scaling down slowly).

**Why this matters:** HPA is how real services absorb traffic spikes without over-provisioning. The #1 reason "HPA shows `<unknown>` targets and does nothing" is a missing or unready metrics-server — a direct consequence of the data flow above.

## 🎯 Objectives
- Confirm metrics-server is serving the Metrics API
- Create an HPA and read its target vs current utilization
- Generate CPU load and watch replicas scale up, then down

## 📝 Steps

### Step 1 — Verify the metrics pipeline

```bash
# minikube: enable it if needed
minikube addons enable metrics-server 2>/dev/null || true

kubectl top nodes
```

**Expected output:**
```
NAME       CPU(cores)   CPU%   MEMORY(bytes)   MEMORY%
minikube   180m         4%     1200Mi          30%
```

**💡** If `kubectl top` returns data, the Metrics API works and the HPA will too. If it errors with "Metrics API not available," wait 30–60s after enabling metrics-server, or install it.

### Step 2 — Attach an HPA to the `scaler` Deployment

```bash
kubectl autoscale deployment scaler --cpu-percent=50 --min=1 --max=6
kubectl get hpa scaler
```

**Expected output (TARGETS may show <unknown> for ~30s, then settle):**
```
NAME     REFERENCE           TARGETS   MINPODS   MAXPODS   REPLICAS   AGE
scaler   Deployment/scaler   0%/50%    1         6         1          30s
```

**💡 Code explanation:**
- `--cpu-percent=50` — keep average CPU at ~50% of each Pod's **request** (we set `50m`, so target ≈ 25m per Pod).
- `--min=1 --max=6` — never fewer than 1, never more than 6.
- `TARGETS: 0%/50%` — current utilization / target. At idle it's ~0%.

### Step 3 — Generate CPU load

Open a **second terminal** to watch, and keep this generating load. We'll hammer the Pods' CPU with a busy loop via a load-generator Pod hitting... actually the simplest reliable method is to run a CPU burner *inside* the scaler Pods' workload. Use a load generator that busy-loops:

```bash
# Terminal 1: watch the HPA and replica count react
kubectl get hpa scaler -w
```

```bash
# Terminal 2: run a CPU-stress generator that curls nothing but burns CPU in the target pods
# Simplest: exec a busy loop into each scaler pod
for p in $(kubectl get pod -l app=scaler -o name); do
  kubectl exec "$p" -- sh -c 'for i in $(seq 1 4); do while true; do :; done & done' &
done
echo "Load generators started. Watch Terminal 1."
```

> 💡 If your nginx image lacks a shell loop that pins CPU, use this alternative load approach instead: deploy a dedicated CPU-stress Deployment and point the HPA at it. See the note in Step 5.

**Expected output in Terminal 1 (over 1–3 minutes):**
```
NAME     REFERENCE           TARGETS    MINPODS   MAXPODS   REPLICAS   AGE
scaler   Deployment/scaler   0%/50%     1         6         1          2m
scaler   Deployment/scaler   240%/50%   1         6         1          3m
scaler   Deployment/scaler   240%/50%   1         6         4          3m   <-- scaling up
scaler   Deployment/scaler   120%/50%   1         6         6          4m   <-- more replicas
scaler   Deployment/scaler   48%/50%    1         6         6          5m   <-- stabilized
```

**💡 Flow insight:** metrics-server reported rising CPU → HPA plugged it into `ceil(replicas × current/target)` → bumped replicas up toward `max=6`. As load spread across more Pods, per-Pod utilization fell back toward the 50% target.

### Step 4 — Stop the load and watch scale-down

```bash
# Kill the busy loops by restarting the pods
kubectl rollout restart deployment/scaler
```

Keep watching Terminal 1. Over the next few minutes utilization drops to ~0% and the HPA scales **back down** toward `min=1`.

**💡** Scale-down is intentionally **slower** than scale-up (default 5-minute stabilization window) to avoid flapping when load is spiky.

### Step 5 — Read the HPA's reasoning

```bash
kubectl describe hpa scaler | sed -n '/Events:/,$p'
```

**Expected output:**
```
  Normal   SuccessfulRescale   ...   horizontal-pod-autoscaler   New size: 4; reason: cpu resource utilization above target
  Normal   SuccessfulRescale   ...   horizontal-pod-autoscaler   New size: 6; reason: cpu resource utilization above target
  Normal   SuccessfulRescale   ...   horizontal-pod-autoscaler   New size: 1; reason: All metrics below target
```

**💡** The HPA controller logs exactly *why* it changed the replica count — the clearest window into the autoscaling decision.

> 💡 **Reliable load alternative (if the busy-loop didn't register):** apply a Deployment running `vish/stress` or `polinux/stress` with a CPU request, autoscale *that*, and run `stress --cpu 2`. The flow and HPA math are identical; only the load source differs.

## ✅ Validation
```bash
kubectl get hpa scaler        # TARGETS should show a real percentage, not <unknown>
```
You understand this lab if you can compute `desiredReplicas` for "3 replicas at 90% CPU, target 30%". (Answer: `ceil(3×90/30)=9`, capped at max.)

## 🧹 Cleanup
```bash
kubectl delete hpa scaler --ignore-not-found
kubectl delete deployment scaler --ignore-not-found
```

## 📌 Key Takeaways
- HPA needs **metrics-server** feeding the Metrics API; no metrics → `<unknown>` → no scaling.
- `desiredReplicas = ceil(currentReplicas × currentMetric / targetMetric)`, bounded by min/max.
- Scale-up is fast; scale-down is deliberately slow (stabilization) to prevent flapping.

---
---

## 🎓 Module 4 Summary

You scaled workloads both ways:

```
Manual: you set replicas ─▶ ReplicaSet reconciles
Auto:   metrics-server ─▶ HPA computes replicas ─▶ Deployment reconciles
```

| Lab | Mode | One-line lesson |
|-----|------|-----------------|
| 4.1 | Manual | Deployment→ReplicaSet→Pod control loop; self-healing |
| 4.2 | Auto (HPA) | Metric-driven replica math, bounded by min/max |

**Next:** [Module 5 — Security Flow & Cluster Governance](module-5-security-flow.md), where we control *who* can do *what* and *which* Pods may talk.
