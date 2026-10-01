# Kubernetes Lifecycle & System Flows — Lab Curriculum

A hands-on curriculum covering Pod lifecycle, networking, storage, scaling, and security flows.

---

## MODULE 1 — Pod Lifecycle & Core Workload Behavior

### Lab 1.1 — Apply Your First Pod Manifest
**Objectives**
- Create a Pod
- Observe API server behavior
- Inspect etcd-backed state

**Commands**
```bash
kubectl apply -f pod.yaml
kubectl get pod -o yaml
```

---

### Lab 1.2 — Scheduling Deep Dive
**Objectives**
- Watch scheduler decisions
- Understand node selection

**Commands**
```bash
kubectl describe pod <name>
kubectl taint nodes <node> key=value:NoSchedule
```

---

### Lab 1.3 — Container Startup & Image Pull Flow
**Objectives**
- kubelet behavior
- Image pull policies
- Container states

**Commands**
```bash
kubectl get pod <name> -o jsonpath='{.status.containerStatuses}'
```

---

### Lab 1.4 — Probes & Health Management
**Objectives**
- Liveness, Readiness, Startup probes

**Commands**
```bash
kubectl apply -f probes-demo.yaml
kubectl describe pod <name>
```

---

### Lab 1.5 — Pod Deletion & Graceful Shutdown
**Objectives**
- SIGTERM → grace period → SIGKILL
- PreStop hooks

**Commands**
```bash
kubectl delete pod <name>
kubectl logs <name> --previous
```

---

## MODULE 2 — Networking Flow & Service Discovery

### Lab 2.1 — Pod Networking & CNI Basics
**Objectives**
- Pod IP allocation
- CNI routing

**Commands**
```bash
kubectl exec -it <pod> -- ip a
kubectl exec -it <pod> -- ip route
```

---

### Lab 2.2 — Services & Virtual IPs
**Objectives**
- ClusterIP, NodePort, LoadBalancer

**Commands**
```bash
kubectl apply -f service.yaml
kubectl get svc
kubectl exec -it <pod> -- curl <service-name>
```

---

### Lab 2.3 — CoreDNS & Service Discovery
**Objectives**
- DNS names
- Service records

**Commands**
```bash
kubectl exec -it <pod> -- nslookup <service>
kubectl exec -it <pod> -- dig <service>.default.svc.cluster.local
```

---

## MODULE 3 — Storage Flow & Persistent Data

### Lab 3.1 — PVC + PV Binding
**Objectives**
- StorageClasses
- Dynamic provisioning

**Commands**
```bash
kubectl apply -f pvc.yaml
kubectl get pvc,pv
```

---

### Lab 3.2 — CSI Driver Behavior
**Objectives**
- Volume provisioning
- Mounting

**Commands**
```bash
kubectl apply -f pod-with-pvc.yaml
kubectl exec -it <pod> -- ls /data
```

---

## MODULE 4 — Scaling Flow & Autoscaling

### Lab 4.1 — Manual Scaling
**Objectives**
- Deployment scaling
- ReplicaSet behavior

**Commands**
```bash
kubectl scale deployment <name> --replicas=5
kubectl get rs
```

---

### Lab 4.2 — Horizontal Pod Autoscaler (HPA)
**Objectives**
- Metrics server
- Autoscaling triggers

**Commands**
```bash
kubectl apply -f hpa.yaml
kubectl get hpa
```

---

## MODULE 5 — Security Flow & Cluster Governance

### Lab 5.1 — Authentication & RBAC
**Objectives**
- Users
- Roles
- RoleBindings

**Commands**
```bash
kubectl create sa demo
kubectl create role demo-role --verb=get --resource=pods
kubectl create rolebinding demo-rb --role=demo-role --serviceaccount=default:demo
```

---

### Lab 5.2 — Admission Controllers
**Objectives**
- Validating & Mutating admission

**Commands**
```bash
kubectl apply -f invalid-pod.yaml
```

---

### Lab 5.3 — Pod Security Controls
**Objectives**
- Pod Security Standards

**Commands**
```bash
kubectl label ns secure-ns pod-security.kubernetes.io/enforce=restricted
kubectl apply -f privileged-pod.yaml
```

---

### Lab 5.4 — Network Policies
**Objectives**
- Deny-all
- Allow-specific

**Commands**
```bash
kubectl apply -f deny-all.yaml
kubectl apply -f allow-app.yaml
```

---

## MODULE 6 — Capstone: Full Kubernetes Lifecycle Simulation

### Lab 6.1 — Deploy a Multi-Tier App & Observe All Flows
**Includes**
- Pod lifecycle
- Networking
- Storage
- Scaling
- Security

**Commands**
```bash
kubectl apply -f full-app/
kubectl get pods,svc,pvc,hpa
```

---

*End of Curriculum*