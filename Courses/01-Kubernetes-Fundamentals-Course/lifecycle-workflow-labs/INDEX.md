# Kubernetes Lifecycle & Workflow Labs — Index

## 📚 About This Lab Series

These labs are a hands-on companion to [`kubernetes_lab_curriculum.md`](../kubernetes_lab_curriculum.md). Where the main `labs/` folder focuses on **cluster operations** (creating, maintaining, and troubleshooting clusters), this series focuses on the **internal flows and lifecycles** that happen *inside* Kubernetes when you run workloads.

The goal is to make the invisible visible: what actually happens when you type `kubectl apply`, how a packet travels from one Pod to another, how a volume gets attached, how autoscaling decides to add replicas, and how a request is authorized.

Every lab opens with a **conceptual explanation** so you understand *why* before you *do*. Then you run commands, observe real behavior, and validate your understanding.

---

## 🗺️ The Six Flows

```
┌──────────────────────────────────────────────────────────────┐
│          The Kubernetes Lifecycle — End to End               │
└──────────────────────────────────────────────────────────────┘

   You ──kubectl apply──▶ API Server ──▶ etcd (desired state stored)
                              │
                              ▼
   ┌──────────────────────────────────────────────────────────┐
   │  Module 1: POD LIFECYCLE                                 │
   │  Scheduler picks a node → kubelet pulls image →         │
   │  container starts → probes gate traffic → graceful stop  │
   └──────────────────────────────────────────────────────────┘
                              │
                              ▼
   ┌──────────────────────────────────────────────────────────┐
   │  Module 2: NETWORKING FLOW                               │
   │  Pod gets IP (CNI) → Service virtual IP → CoreDNS names  │
   └──────────────────────────────────────────────────────────┘
                              │
                              ▼
   ┌──────────────────────────────────────────────────────────┐
   │  Module 3: STORAGE FLOW                                  │
   │  PVC request → StorageClass → CSI provisions → mount     │
   └──────────────────────────────────────────────────────────┘
                              │
                              ▼
   ┌──────────────────────────────────────────────────────────┐
   │  Module 4: SCALING FLOW                                  │
   │  Manual scale → metrics-server → HPA adds/removes pods   │
   └──────────────────────────────────────────────────────────┘
                              │
                              ▼
   ┌──────────────────────────────────────────────────────────┐
   │  Module 5: SECURITY FLOW                                 │
   │  AuthN → AuthZ (RBAC) → Admission → Pod Security → NetPol │
   └──────────────────────────────────────────────────────────┘
                              │
                              ▼
   ┌──────────────────────────────────────────────────────────┐
   │  Module 6: CAPSTONE                                      │
   │  Deploy a multi-tier app and watch ALL flows together    │
   └──────────────────────────────────────────────────────────┘
```

---

## 📖 Lab Catalog

| Module | File | Labs | Focus | Difficulty |
|--------|------|------|-------|------------|
| **1** | [module-1-pod-lifecycle.md](module-1-pod-lifecycle.md) | 1.1 – 1.5 | Pod creation → scheduling → startup → health → shutdown | ⭐⭐ |
| **2** | [module-2-networking-flow.md](module-2-networking-flow.md) | 2.1 – 2.3 | Pod networking, Services, CoreDNS | ⭐⭐ |
| **3** | [module-3-storage-flow.md](module-3-storage-flow.md) | 3.1 – 3.2 | PVC/PV binding, CSI drivers | ⭐⭐⭐ |
| **4** | [module-4-scaling-flow.md](module-4-scaling-flow.md) | 4.1 – 4.2 | Manual scaling, HPA autoscaling | ⭐⭐ |
| **5** | [module-5-security-flow.md](module-5-security-flow.md) | 5.1 – 5.4 | RBAC, admission, Pod Security, NetworkPolicy | ⭐⭐⭐ |
| **6** | [module-6-capstone.md](module-6-capstone.md) | 6.1 | Full multi-tier lifecycle simulation | ⭐⭐⭐⭐ |

**Total: 17 hands-on labs across 6 flows.**

---

## 🎯 Detailed Lab Listing

### Module 1 — Pod Lifecycle & Core Workload Behavior
- **Lab 1.1** — Apply Your First Pod Manifest *(API server → etcd flow)*
- **Lab 1.2** — Scheduling Deep Dive *(how a node is chosen)*
- **Lab 1.3** — Container Startup & Image Pull Flow *(kubelet behavior)*
- **Lab 1.4** — Probes & Health Management *(liveness/readiness/startup)*
- **Lab 1.5** — Pod Deletion & Graceful Shutdown *(SIGTERM → SIGKILL)*

### Module 2 — Networking Flow & Service Discovery
- **Lab 2.1** — Pod Networking & CNI Basics *(IP allocation, routing)*
- **Lab 2.2** — Services & Virtual IPs *(ClusterIP/NodePort/LoadBalancer)*
- **Lab 2.3** — CoreDNS & Service Discovery *(DNS names and records)*

### Module 3 — Storage Flow & Persistent Data
- **Lab 3.1** — PVC + PV Binding *(StorageClasses, dynamic provisioning)*
- **Lab 3.2** — CSI Driver Behavior *(volume provisioning and mounting)*

### Module 4 — Scaling Flow & Autoscaling
- **Lab 4.1** — Manual Scaling *(Deployment/ReplicaSet behavior)*
- **Lab 4.2** — Horizontal Pod Autoscaler *(metrics-driven scaling)*

### Module 5 — Security Flow & Cluster Governance
- **Lab 5.1** — Authentication & RBAC *(ServiceAccounts, Roles, Bindings)*
- **Lab 5.2** — Admission Controllers *(validating & mutating)*
- **Lab 5.3** — Pod Security Controls *(Pod Security Standards)*
- **Lab 5.4** — Network Policies *(deny-all, allow-specific)*

### Module 6 — Capstone
- **Lab 6.1** — Deploy a Multi-Tier App & Observe All Flows

---

## 🛠️ Prerequisites

| Requirement | Why |
|-------------|-----|
| Running cluster (minikube/kind) | All labs run against a live cluster |
| `kubectl` configured | Primary tool for every lab |
| metrics-server | Required for Module 4 (HPA) |
| CNI with NetworkPolicy support (Calico/Cilium) | Required for Lab 5.4 |
| 4+ CPU, 8GB+ RAM | Capstone runs a multi-tier app |

> 💡 **New to clusters?** Complete [`labs/lab-1.1-minikube-cluster.md`](../labs/lab-1.1-minikube-cluster.md) first to get a working cluster.

---

## 🧭 Recommended Order

These labs are designed to be done **in sequence** — each flow builds mental models used by the next. The capstone assumes you've seen all five flows.

```
Module 1 → Module 2 → Module 3 → Module 4 → Module 5 → Module 6 (Capstone)
```

If you're short on time and prepping for KCNA, the highest-value subset is:
**Lab 1.1, 1.4, 2.2, 2.3, 4.1, 5.1**.

---

## ✅ Progress Tracker

**Module 1 — Pod Lifecycle**
- [ ] Lab 1.1 — Apply Your First Pod Manifest
- [ ] Lab 1.2 — Scheduling Deep Dive
- [ ] Lab 1.3 — Container Startup & Image Pull Flow
- [ ] Lab 1.4 — Probes & Health Management
- [ ] Lab 1.5 — Pod Deletion & Graceful Shutdown

**Module 2 — Networking Flow**
- [ ] Lab 2.1 — Pod Networking & CNI Basics
- [ ] Lab 2.2 — Services & Virtual IPs
- [ ] Lab 2.3 — CoreDNS & Service Discovery

**Module 3 — Storage Flow**
- [ ] Lab 3.1 — PVC + PV Binding
- [ ] Lab 3.2 — CSI Driver Behavior

**Module 4 — Scaling Flow**
- [ ] Lab 4.1 — Manual Scaling
- [ ] Lab 4.2 — Horizontal Pod Autoscaler

**Module 5 — Security Flow**
- [ ] Lab 5.1 — Authentication & RBAC
- [ ] Lab 5.2 — Admission Controllers
- [ ] Lab 5.3 — Pod Security Controls
- [ ] Lab 5.4 — Network Policies

**Module 6 — Capstone**
- [ ] Lab 6.1 — Multi-Tier App & All Flows

---

**Start here → [Module 1: Pod Lifecycle & Core Workload Behavior](module-1-pod-lifecycle.md)** 🚀
