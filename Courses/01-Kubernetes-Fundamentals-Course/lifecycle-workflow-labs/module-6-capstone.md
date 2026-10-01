# Module 6 — Capstone: Full Kubernetes Lifecycle Simulation

## 📚 Related Chapters
- **Chapters 5–8** (everything so far)

## 🎯 Module Goal

Bring all five flows together. You'll deploy a realistic **three-tier application** (frontend → backend API → database with persistent storage), secured with RBAC, Pod Security, and NetworkPolicies, and made elastic with an HPA. Then you'll observe **every flow from Modules 1–5 operating simultaneously** in one system — exactly how real production workloads behave.

## ⏱️ Estimated Time
90 – 120 minutes

## 📋 Prerequisites
- Completed Modules 1–5
- A cluster with: **metrics-server** (Module 4) and an **enforcing CNI like Calico** (Module 5)
  - `minikube start --cni=calico` then `minikube addons enable metrics-server`
- 4+ CPU and 8GB+ RAM recommended

---

## 🧠 The Big Picture: Where Each Flow Shows Up

```
┌──────────────────────────────────────────────────────────────────┐
│              THREE-TIER APP — ALL FLOWS AT ONCE                   │
└──────────────────────────────────────────────────────────────────┘

   Internet / you
        │  (Module 2: Service NodePort/LoadBalancer)
        ▼
   ┌──────────────┐   DNS: backend.shop.svc   ┌──────────────┐
   │  FRONTEND    │──────(Module 2: DNS)──────▶│  BACKEND API │
   │ Deployment   │   (Module 5.4: NetPol      │ Deployment   │
   │  + Service   │    allows FE→BE only)      │  + Service   │
   │ (Mod 1 pods) │                            │  + HPA       │◀─ Module 4: autoscale
   └──────────────┘                            └──────┬───────┘
                                                      │ DNS: db.shop.svc
                                                      ▼ (Mod 5.4: BE→DB only)
                                               ┌──────────────┐
                                               │  DATABASE    │
                                               │ + Service    │
                                               │ + PVC/PV     │◀─ Module 3: persistent storage
                                               └──────────────┘

   Cross-cutting:
   • Module 1 — every tier's Pods go through schedule→start→probe→terminate
   • Module 3 — the DB keeps data on a PV across restarts
   • Module 4 — the backend scales out under load
   • Module 5.1 — a deploy ServiceAccount with least-privilege RBAC
   • Module 5.3 — namespace enforces baseline Pod Security
   • Module 5.4 — default-deny + tier-to-tier allow rules
```

This is the whole course in one diagram. Each piece you build below maps to a module you've already mastered.

---
---

# Lab 6.1 — Deploy a Multi-Tier App & Observe All Flows

## 🧩 Explanation (Read First)

Real applications are not single Pods — they are **multiple cooperating tiers**, each a Deployment fronted by a Service, talking to each other by DNS name, with the data tier backed by persistent storage, protected by network rules, and scaled by demand.

In this capstone you will assemble such a system **one flow at a time**, and after each step you'll *observe the flow you just added* using the exact techniques from earlier modules. The final section runs a load test so you can watch autoscaling, DNS, Services, and probes all react together.

Work in a dedicated namespace called `shop` so cleanup is trivial and Pod Security / NetworkPolicy apply cleanly.

## 🎯 Objectives
- Deploy frontend, backend, and database tiers (Module 1)
- Wire them with Services + DNS (Module 2)
- Give the database persistent storage (Module 3)
- Autoscale the backend (Module 4)
- Secure everything with RBAC, Pod Security, NetworkPolicy (Module 5)
- Observe all flows operating together

## 📝 Steps

### Step 1 — Namespace with Pod Security (Module 5.3)

```bash
kubectl create namespace shop
kubectl label namespace shop \
  pod-security.kubernetes.io/enforce=baseline \
  pod-security.kubernetes.io/warn=baseline
```

**💡** We enforce **baseline** (blocks the worst — privileged, hostNetwork — while staying compatible with common images). This is the Module 5.3 flow applied up front, so every Pod we create is governed by it.

### Step 2 — Database tier with persistent storage (Modules 1 + 3)

```bash
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: db-data
  namespace: shop
spec:
  accessModes: [ReadWriteOnce]
  resources:
    requests:
      storage: 1Gi
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: db
  namespace: shop
spec:
  replicas: 1
  selector:
    matchLabels: { app: db, tier: data }
  template:
    metadata:
      labels: { app: db, tier: data }
    spec:
      containers:
      - name: postgres
        image: postgres:16-alpine
        env:
        - name: POSTGRES_PASSWORD
          value: "capstone"
        - name: PGDATA
          value: /var/lib/postgresql/data/pgdata
        ports:
        - containerPort: 5432
        readinessProbe:                       # Module 1.4
          exec: { command: ["pg_isready","-U","postgres"] }
          initialDelaySeconds: 10
          periodSeconds: 5
        volumeMounts:
        - name: data
          mountPath: /var/lib/postgresql/data # Module 3 persistent mount
      volumes:
      - name: data
        persistentVolumeClaim:
          claimName: db-data
---
apiVersion: v1
kind: Service
metadata:
  name: db
  namespace: shop
spec:
  selector: { app: db }
  ports:
  - port: 5432
    targetPort: 5432
EOF
kubectl rollout status deployment/db -n shop
```

**💡 Flows present already:** scheduling+startup+readiness (Module 1), PVC→PV→CSI mount (Module 3), and the `db` Service (Module 2). Confirm storage bound:

```bash
kubectl get pvc db-data -n shop        # STATUS Bound
```

### Step 3 — Backend API tier with an HPA (Modules 1 + 2 + 4)

```bash
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: shop
spec:
  replicas: 2
  selector:
    matchLabels: { app: backend, tier: api }
  template:
    metadata:
      labels: { app: backend, tier: api }
    spec:
      containers:
      - name: api
        image: hashicorp/http-echo:1.0
        args: ["-text=backend OK from \$(POD_NAME)"]
        env:
        - name: POD_NAME
          valueFrom: { fieldRef: { fieldPath: metadata.name } }
        ports:
        - containerPort: 5678
        resources:
          requests: { cpu: 50m }              # Module 4: HPA basis
        readinessProbe:
          httpGet: { path: /, port: 5678 }
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: backend
  namespace: shop
spec:
  selector: { app: backend }
  ports:
  - port: 80
    targetPort: 5678
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
  namespace: shop
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend
  minReplicas: 2
  maxReplicas: 8
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 50
EOF
kubectl rollout status deployment/backend -n shop
kubectl get hpa backend-hpa -n shop
```

**💡 Flows present:** backend Pods (Module 1), the `backend` Service with endpoints (Module 2), and an HPA watching CPU (Module 4).

### Step 4 — Frontend tier (Modules 1 + 2)

```bash
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: shop
spec:
  replicas: 2
  selector:
    matchLabels: { app: frontend, tier: web }
  template:
    metadata:
      labels: { app: frontend, tier: web }
    spec:
      containers:
      - name: web
        image: nicolaka/netshoot
        command: ["/bin/sh","-c","sleep 3600"]   # acts as a client we can exec into
---
apiVersion: v1
kind: Service
metadata:
  name: frontend
  namespace: shop
spec:
  type: NodePort
  selector: { app: frontend }
  ports:
  - port: 80
    targetPort: 80
EOF
kubectl rollout status deployment/frontend -n shop
```

**💡** The frontend here is a netshoot client so we can run `curl`/`nslookup` from inside the web tier to *observe* DNS and Service flows against the backend.

### Step 5 — Least-privilege deploy identity (Module 5.1 RBAC)

```bash
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ServiceAccount
metadata: { name: deployer, namespace: shop }
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata: { name: deployer-role, namespace: shop }
rules:
- apiGroups: ["apps",""]
  resources: ["deployments","pods","services"]
  verbs: ["get","list","watch","update","patch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata: { name: deployer-binding, namespace: shop }
subjects:
- kind: ServiceAccount
  name: deployer
  namespace: shop
roleRef:
  kind: Role
  name: deployer-role
  apiGroup: rbac.authorization.k8s.io
EOF

# Verify the boundary (Module 5.1)
echo "deployer can patch deployments: $(kubectl auth can-i patch deployments --as=system:serviceaccount:shop:deployer -n shop)"
echo "deployer can delete secrets:    $(kubectl auth can-i delete secrets --as=system:serviceaccount:shop:deployer -n shop)"
```

**Expected output:**
```
deployer can patch deployments: yes
deployer can delete secrets:    no
```

**💡** A CI/CD identity that can roll deployments but can't touch secrets — least privilege, exactly as in Module 5.1.

### Step 6 — Zero-trust network between tiers (Module 5.4)

```bash
cat <<EOF | kubectl apply -f -
# 1) default-deny all ingress in the namespace
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: { name: default-deny-ingress, namespace: shop }
spec:
  podSelector: {}
  policyTypes: [Ingress]
---
# 2) frontend may reach backend:5678
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: { name: allow-fe-to-be, namespace: shop }
spec:
  podSelector: { matchLabels: { app: backend } }
  policyTypes: [Ingress]
  ingress:
  - from:
    - podSelector: { matchLabels: { tier: web } }
    ports:
    - { protocol: TCP, port: 5678 }
---
# 3) backend may reach db:5432
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: { name: allow-be-to-db, namespace: shop }
spec:
  podSelector: { matchLabels: { app: db } }
  policyTypes: [Ingress]
  ingress:
  - from:
    - podSelector: { matchLabels: { tier: api } }
    ports:
    - { protocol: TCP, port: 5432 }
EOF
```

**💡** This encodes the only two legal paths: **frontend→backend** and **backend→db**. Everything else is denied. Precisely the Module 5.4 pattern.

### Step 7 — OBSERVE ALL FLOWS TOGETHER 🔍

**(a) Full inventory (the curriculum's capstone command):**
```bash
kubectl get pods,svc,pvc,hpa -n shop
```

**Expected output:**
```
NAME                            READY   STATUS    RESTARTS   AGE
pod/backend-xxxx                1/1     Running   0          3m
pod/backend-yyyy                1/1     Running   0          3m
pod/db-zzzz                     1/1     Running   0          5m
pod/frontend-aaaa               1/1     Running   0          2m
pod/frontend-bbbb               1/1     Running   0          2m

NAME               TYPE        CLUSTER-IP     ...  PORT(S)
service/backend    ClusterIP   10.96.x.x      ...  80/TCP
service/db         ClusterIP   10.96.x.x      ...  5432/TCP
service/frontend   NodePort    10.96.x.x      ...  80:31xxx/TCP

NAME                             STATUS   VOLUME        CAPACITY
persistentvolumeclaim/db-data    Bound    pvc-...       1Gi

NAME                                              REFERENCE            TARGETS   MINPODS MAXPODS REPLICAS
horizontalpodautoscaler/backend-hpa               Deployment/backend   0%/50%    2       8       2
```

**(b) DNS + Service flow (Module 2) — from the frontend tier:**
```bash
FE=$(kubectl get pod -l app=frontend -n shop -o jsonpath='{.items[0].metadata.name}')
kubectl exec "$FE" -n shop -- nslookup backend | tail -4
for i in 1 2 3 4; do kubectl exec "$FE" -n shop -- curl -s http://backend; echo; done
```

**Expected output:**
```
Name:   backend.shop.svc.cluster.local
Address: 10.96.x.x

backend OK from backend-xxxx
backend OK from backend-yyyy
backend OK from backend-xxxx
backend OK from backend-yyyy
```

**💡** DNS resolved `backend` → ClusterIP, and traffic load-balanced across both backend Pods. Modules 2 running live.

**(c) NetworkPolicy flow (Module 5.4) — prove isolation:**
```bash
# Allowed path: frontend -> backend  (should work)
kubectl exec "$FE" -n shop -- curl -s -m3 -o /dev/null -w "FE->BE: %{http_code}\n" http://backend

# Illegal path: frontend -> db  (should be blocked by default-deny)
kubectl exec "$FE" -n shop -- sh -c 'curl -s -m3 -o /dev/null -w "FE->DB: %{http_code}\n" telnet://db:5432 || echo "FE->DB: BLOCKED"'
```

**Expected output:**
```
FE->BE: 200
FE->DB: BLOCKED
```

**💡** The frontend can reach the backend (allowed rule) but **not** the database (no rule → default-deny). Zero-trust enforced.

**(d) Storage persistence flow (Module 3) — survive a DB restart:**
```bash
DB=$(kubectl get pod -l app=db -n shop -o jsonpath='{.items[0].metadata.name}')
kubectl exec "$DB" -n shop -- psql -U postgres -c "CREATE TABLE IF NOT EXISTS orders(id int); INSERT INTO orders VALUES (42);"
kubectl delete pod "$DB" -n shop                      # Module 1 termination + self-heal
kubectl rollout status deployment/db -n shop
DB=$(kubectl get pod -l app=db -n shop -o jsonpath='{.items[0].metadata.name}')
kubectl exec "$DB" -n shop -- psql -U postgres -c "SELECT * FROM orders;"
```

**Expected output:**
```
 id
----
 42
(1 row)
```

**💡** The row survived the Pod being deleted and recreated — the PV persisted the data (Module 3) while Module 1's self-healing brought a new DB Pod up.

**(e) Autoscaling flow (Module 4) — load the backend:**
```bash
# Terminal 1: watch the HPA + replicas
kubectl get hpa backend-hpa -n shop -w
```
```bash
# Terminal 2: hammer the backend from the frontend tier
FE=$(kubectl get pod -l app=frontend -n shop -o jsonpath='{.items[0].metadata.name}')
kubectl exec "$FE" -n shop -- sh -c 'while true; do wget -q -O /dev/null http://backend; done' &
# generate CPU on the backend pods directly too (http-echo is light), to ensure a visible spike:
for p in $(kubectl get pod -l app=backend -n shop -o name); do
  kubectl exec "$p" -n shop -- sh -c 'for i in 1 2; do while true; do :; done & done' 2>/dev/null &
done
```

**Expected output in Terminal 1 (over a few minutes):**
```
NAME          REFERENCE            TARGETS    MINPODS MAXPODS REPLICAS
backend-hpa   Deployment/backend   0%/50%     2       8       2
backend-hpa   Deployment/backend   180%/50%   2       8       2
backend-hpa   Deployment/backend   180%/50%   2       8       6   <-- scaling up
backend-hpa   Deployment/backend   70%/50%    2       8       8
```

Stop the load and watch it scale back down:
```bash
kubectl rollout restart deployment/backend -n shop
```

**💡** Every flow is now visible at once: new backend Pods schedule and start (Module 1), join the Service endpoints automatically (Module 2), serve load-balanced traffic allowed by NetworkPolicy (Module 5.4), driven by the HPA reading metrics (Module 4) — all while the DB holds state on its PV (Module 3). **That is the entire course, alive in one app.**

## ✅ Validation Checklist
```bash
kubectl get pods,svc,pvc,hpa -n shop               # all tiers Running, PVC Bound, HPA active
```
- [ ] All three tiers `Running` (Module 1)
- [ ] `backend` resolves by DNS and load-balances (Module 2)
- [ ] `db-data` PVC is `Bound` and data survived a restart (Module 3)
- [ ] `backend-hpa` scaled replicas under load (Module 4)
- [ ] `deployer` SA is least-privilege; privileged Pods blocked by baseline (Module 5.1/5.3)
- [ ] frontend→backend allowed, frontend→db blocked (Module 5.4)

## 🧹 Cleanup
```bash
kubectl delete namespace shop
# PVC had reclaimPolicy Delete, so the PV is removed with it:
kubectl get pv | grep shop || echo "All capstone storage reclaimed."
```

## 📌 Key Takeaways
- Real apps are **multiple tiers**: Deployments + Services + DNS + storage + autoscaling + security, together.
- Each tier exercises the **same flows** you learned individually — now interacting.
- `kubectl get pods,svc,pvc,hpa` is your single-command dashboard for the whole system.
- Secure-by-design means Pod Security + least-privilege RBAC + default-deny networking from day one.

---
---

## 🏁 Course Completion

Congratulations — you've traced Kubernetes end to end:

```
Module 1  Pod Lifecycle      apply→schedule→start→health→terminate
Module 2  Networking         Pod IP → Service → DNS
Module 3  Storage            PVC → StorageClass → PV → CSI mount
Module 4  Scaling            manual reconcile + HPA metric math
Module 5  Security           AuthN → RBAC → Admission; PSS + NetworkPolicy
Module 6  Capstone           all flows in one multi-tier app
```

**You can now explain, from memory, what happens between `kubectl apply` and a secured, scalable, persistent application serving traffic.** That is the core competency of a Kubernetes practitioner.

### Where to go next
- Revisit the cluster-operations labs in [`../labs/INDEX.md`](../labs/INDEX.md) (upgrades, etcd backup, troubleshooting).
- Layer on the other courses: Helm (packaging), Prometheus/Grafana (observing these flows), Cilium (deep networking), TLS (securing traffic).

**Back to the series index → [INDEX.md](INDEX.md)**
