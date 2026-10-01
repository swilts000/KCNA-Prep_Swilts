# Module 3 — Storage Flow & Persistent Data

## 📚 Related Chapters
- **Chapter 6**: Deploying and Scaling Applications with Kubernetes

## 🎯 Module Goal

Understand how a Pod gets storage that **survives restarts and rescheduling**. You'll follow the request flow from a `PersistentVolumeClaim` through a `StorageClass`, into a dynamically provisioned `PersistentVolume`, and finally mounted into a container by a **CSI driver**.

## ⏱️ Estimated Time
1.5 – 2 hours (both labs)

## 📋 Prerequisites
- Completed Modules 1–2
- A cluster with a default StorageClass (minikube/kind provide one)

---

## 🧠 The Big Picture: Decoupling "I need storage" from "here is storage"

```
┌──────────────────────────────────────────────────────────────────┐
│                   KUBERNETES STORAGE FLOW                         │
└──────────────────────────────────────────────────────────────────┘

  A Pod's own filesystem is EPHEMERAL — deleted when the Pod dies.
  Persistent storage is requested and provisioned like this:

   developer writes          cluster/admin defines         storage backend
   ┌───────────────┐         ┌───────────────┐             ┌───────────────┐
   │ PVC           │         │ StorageClass  │             │ CSI Driver    │
   │ "I need 1Gi   │────────▶│ "how to make  │────────────▶│ actually      │
   │  RWO storage" │ triggers│  that storage"│  calls      │ creates a disk│
   └───────────────┘         └───────────────┘             └───────────────┘
          │                                                        │
          │                   dynamic provisioning creates ◀───────┘
          ▼                           a matching
   ┌───────────────┐              ┌───────────────┐
   │ PVC: Bound     │◀────bind────│ PV (actual     │
   │                │             │  volume, 1Gi)  │
   └───────────────┘             └───────────────┘
          │
          ▼ Pod references the PVC by name
   ┌───────────────────────────────────────────────┐
   │ Pod: volumeMounts /data ──▶ the PV's disk      │
   │  Data written to /data SURVIVES Pod deletion.  │
   └───────────────────────────────────────────────┘
```

**The key abstraction:** developers say *what* they need (a PVC) without knowing *how* it's provided. Admins define the *how* (StorageClasses). The CSI driver does the physical work. This separation lets the same app YAML run on a laptop (hostpath) or AWS (EBS) unchanged.

**Three objects to keep straight:**
| Object | Who creates it | Represents |
|--------|----------------|------------|
| **PVC** (PersistentVolumeClaim) | Developer | A *request* for storage |
| **PV** (PersistentVolume) | Usually auto (dynamic) | The *actual* piece of storage |
| **StorageClass** | Admin | A *recipe/profile* for provisioning PVs |

---
---

# Lab 3.1 — PVC + PV Binding

## 🧩 Explanation (Read First)

Historically, an admin had to pre-create a `PersistentVolume` for every workload — tedious and error-prone. **Dynamic provisioning** fixed this: you create only a **PVC** (a request), and a `StorageClass` automatically provisions a matching **PV** on demand.

The binding flow:
1. You create a **PVC** specifying size (`1Gi`), access mode (`ReadWriteOnce`), and optionally a `storageClassName`.
2. If no `storageClassName` is given, the cluster's **default StorageClass** is used.
3. The StorageClass's **provisioner** creates a real PV of the requested size.
4. The PVC and PV **bind** — a one-to-one, exclusive relationship. The PVC's status becomes `Bound`.

**Access modes** matter:
- `ReadWriteOnce` (RWO): mounted read-write by a single node (most block storage).
- `ReadOnlyMany` (ROX): read-only by many nodes.
- `ReadWriteMany` (RWX): read-write by many nodes (needs a shared filesystem like NFS).

**Why this matters:** A PVC stuck in `Pending` is a top storage issue. The cause is almost always: no default StorageClass, an unsatisfiable size, or an access mode the backend can't provide. Reading the PVC events tells you which.

## 🎯 Objectives
- Inspect the cluster's StorageClass(es)
- Create a PVC and watch dynamic provisioning bind it to a PV
- Understand access modes and the Bound relationship

## 📝 Steps

### Step 1 — Look at the available StorageClasses

```bash
kubectl get storageclass
```

**Expected output (minikube):**
```
NAME                 PROVISIONER                RECLAIMPOLICY   VOLUMEBINDINGMODE   ...
standard (default)   k8s.io/minikube-hostpath   Delete          Immediate           ...
```

**💡 Read the columns:**
- `(default)` — PVCs with no `storageClassName` use this one.
- `PROVISIONER` — the component that creates PVs (here, minikube's hostpath provisioner; on AWS it'd be `ebs.csi.aws.com`).
- `RECLAIMPOLICY: Delete` — when the PVC is deleted, the PV (and its data) is deleted too.
- `VOLUMEBINDINGMODE: Immediate` — provision the PV as soon as the PVC is created (vs. `WaitForFirstConsumer`, which waits until a Pod uses it).

### Step 2 — Create a PVC

```bash
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: data-pvc
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
EOF
```

**💡 Code explanation:**
- `accessModes: [ReadWriteOnce]` — one node mounts it read-write.
- `resources.requests.storage: 1Gi` — the size being requested.
- No `storageClassName` → the **default** StorageClass handles it.

### Step 3 — Watch the dynamic provisioning + binding

```bash
kubectl get pvc data-pvc
```

**Expected output:**
```
NAME       STATUS   VOLUME         CAPACITY   ACCESS MODES   STORAGECLASS   AGE
data-pvc   Bound    pvc-8f2a...    1Gi        RWO            standard       3s
```

**💡 Flow insight:** You never created a PV, yet `VOLUME` shows `pvc-8f2a...` and `STATUS` is `Bound`. The StorageClass's provisioner **dynamically created** that PV and bound it to your claim. Look at the auto-created PV:

```bash
kubectl get pv
```

**Expected output:**
```
NAME          CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM              STORAGECLASS   ...
pvc-8f2a...   1Gi        RWO            Delete           Bound    default/data-pvc   standard       ...
```

**💡** The `CLAIM` column (`default/data-pvc`) shows the exclusive 1:1 binding back to your PVC.

### Step 4 — (Optional) See a PVC that can't bind

```bash
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: impossible-pvc
spec:
  storageClassName: does-not-exist
  accessModes: [ReadWriteOnce]
  resources:
    requests:
      storage: 1Gi
EOF
sleep 5
kubectl get pvc impossible-pvc        # STATUS: Pending
kubectl describe pvc impossible-pvc | sed -n '/Events:/,$p'
```

**Expected output:**
```
  Warning  ProvisioningFailed   ...  storageclass.storage.k8s.io "does-not-exist" not found
```

**💡** This is the canonical "PVC stuck Pending" diagnosis — the named StorageClass doesn't exist, so nothing provisions a PV.

```bash
kubectl delete pvc impossible-pvc
```

## ✅ Validation
```bash
kubectl get pvc data-pvc -o jsonpath='{.status.phase}{"\n"}'    # Bound
```
You understand this lab if you can explain what dynamically created the PV.

## 🧹 Cleanup
Keep `data-pvc` — Lab 3.2 mounts it into a Pod.

## 📌 Key Takeaways
- You request storage with a **PVC**; a **StorageClass** dynamically provisions a matching **PV**.
- PVC↔PV binding is exclusive and 1:1; a bound PVC shows `Bound` + a volume name.
- `Pending` PVCs usually mean missing StorageClass, bad size, or unsupported access mode.

---
---

# Lab 3.2 — CSI Driver Behavior (Mounting & Persistence)

## 🧩 Explanation (Read First)

Having a bound PV isn't enough — a container must **mount** it. This is where the **CSI (Container Storage Interface)** driver does its final jobs, coordinated by the kubelet when the Pod starts on a node:

1. **Attach** (for network/block storage): make the volume available to the chosen node.
2. **Mount**: mount the volume into a directory the kubelet manages, then **bind-mount** it into the container at the path you specify in `volumeMounts`.

Once mounted, anything the container writes to that path goes to the PV — **not** the container's ephemeral layer. So the data **survives** container restarts, Pod deletion, and rescheduling (as long as the PVC/PV exist).

CSI is a **standard interface**: the same Pod/PVC YAML works whether the backend is AWS EBS, GCP PD, Ceph, or minikube hostpath — only the driver differs. This is why Kubernetes storage is portable.

**Why this matters:** This lab proves the entire point of persistent storage — surviving a Pod's death. It also shows the difference between an *ephemeral* container filesystem and a *persistent* volume mount, a distinction that trips up many beginners.

## 🎯 Objectives
- Mount the bound PVC into a Pod via the CSI driver
- Write data, delete the Pod, and prove the data persists
- Contrast persistent mount vs ephemeral container filesystem

## 📝 Steps

### Step 1 — Run a Pod that mounts the PVC

```bash
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: writer
spec:
  containers:
  - name: app
    image: busybox:1.36
    command: ["/bin/sh","-c","sleep 3600"]
    volumeMounts:
    - name: data
      mountPath: /data            # PERSISTENT: backed by the PV
  volumes:
  - name: data
    persistentVolumeClaim:
      claimName: data-pvc
EOF
kubectl wait --for=condition=Ready pod/writer --timeout=60s
```

**💡 Code explanation:**
- `volumes[].persistentVolumeClaim.claimName: data-pvc` — connects this Pod to the PVC from Lab 3.1.
- `volumeMounts[].mountPath: /data` — the CSI-mounted volume appears at `/data` inside the container.

### Step 2 — Confirm the mount is really the PV

```bash
kubectl exec writer -- df -h /data
```

**Expected output:**
```
Filesystem      Size  Used Avail Use% Mounted on
/dev/...        ...   ...   ...  ...  /data
```

**💡** `/data` is a separate mounted filesystem — that's the CSI bind-mount of the PV, not part of the container image layer.

### Step 3 — Write persistent data

```bash
kubectl exec writer -- sh -c 'echo "survives pod death - $(date)" > /data/important.txt'
kubectl exec writer -- cat /data/important.txt
```

**Expected output:**
```
survives pod death - Thu Oct  1 17:30:00 UTC 2026
```

Also write a file to the **ephemeral** root filesystem for contrast:

```bash
kubectl exec writer -- sh -c 'echo "I will be lost" > /tmp/ephemeral.txt'
```

### Step 4 — Delete the Pod and recreate it (the proof)

```bash
kubectl delete pod writer
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: reader
spec:
  containers:
  - name: app
    image: busybox:1.36
    command: ["/bin/sh","-c","sleep 3600"]
    volumeMounts:
    - name: data
      mountPath: /data
  volumes:
  - name: data
    persistentVolumeClaim:
      claimName: data-pvc
EOF
kubectl wait --for=condition=Ready pod/reader --timeout=60s
```

Now read the persistent file from a **brand-new Pod**:

```bash
kubectl exec reader -- cat /data/important.txt
```

**Expected output:**
```
survives pod death - Thu Oct  1 17:30:00 UTC 2026
```

**💡 Flow insight — this is the whole point:** A completely different Pod (`reader`) mounted the same PVC and found the data written by the deleted `writer` Pod. The PV persisted independently of the Pod lifecycle. Meanwhile `/tmp/ephemeral.txt` is gone forever — it lived only in the first Pod's ephemeral layer.

### Step 5 — Confirm the ephemeral file did NOT survive

```bash
kubectl exec reader -- cat /tmp/ephemeral.txt 2>&1 || echo ">>> As expected: ephemeral data was lost."
```

**Expected output:**
```
cat: can't open '/tmp/ephemeral.txt': No such file or directory
>>> As expected: ephemeral data was lost.
```

## ✅ Validation
```bash
kubectl exec reader -- test -f /data/important.txt && echo "Persistence confirmed across Pod lifecycle"
```
You understand this lab if you can explain why `/data` survived but `/tmp` did not.

## 🧹 Cleanup
```bash
kubectl delete pod reader --ignore-not-found
kubectl delete pvc data-pvc --ignore-not-found
# With reclaimPolicy=Delete, the PV is removed automatically:
kubectl get pv
```

## 📌 Key Takeaways
- The **CSI driver** attaches and mounts the PV into the container at `volumeMounts.mountPath`.
- Data on a mounted PV **persists** across Pod deletion/rescheduling; the container's own filesystem does not.
- CSI is a standard interface, making the same YAML portable across storage backends.

---
---

## 🎓 Module 3 Summary

You followed storage from request to persistence:

```
PVC (request) ─▶ StorageClass (recipe) ─▶ PV (actual disk) ─▶ CSI mount ─▶ data survives
```

| Lab | Stage | One-line lesson |
|-----|-------|-----------------|
| 3.1 | Provision & bind | A PVC triggers dynamic PV creation via a StorageClass |
| 3.2 | Mount & persist | CSI mounts the PV; data outlives any single Pod |

**Next:** [Module 4 — Scaling Flow & Autoscaling](module-4-scaling-flow.md), where we grow and shrink workloads by hand and automatically.
