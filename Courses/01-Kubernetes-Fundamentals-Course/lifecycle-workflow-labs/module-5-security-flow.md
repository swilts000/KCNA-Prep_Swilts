# Module 5 — Security Flow & Cluster Governance

## 📚 Related Chapters
- **Chapter 6**: Deploying and Scaling Applications with Kubernetes
- **Chapter 8**: Securing and Managing Kubernetes

## 🎯 Module Goal

Follow a request through Kubernetes' security gates, then lock down workloads. You'll see how every API call passes **Authentication → Authorization (RBAC) → Admission**, how **Pod Security Standards** restrict dangerous Pods, and how **NetworkPolicies** firewall Pod-to-Pod traffic.

## ⏱️ Estimated Time
2.5 – 3 hours (all four labs)

## 📋 Prerequisites
- Completed Modules 1–4
- For Lab 5.4: a CNI that **enforces** NetworkPolicy (Calico/Cilium). minikube: `minikube start --cni=calico`

---

## 🧠 The Big Picture: Two Kinds of Security

```
┌──────────────────────────────────────────────────────────────────┐
│                   KUBERNETES SECURITY FLOW                        │
└──────────────────────────────────────────────────────────────────┘

  (A) CONTROL-PLANE SECURITY — "who may call the API, and do what?"
  Every kubectl/API request passes three gates IN ORDER:

   request ─▶ [1] AUTHENTICATION ─▶ [2] AUTHORIZATION ─▶ [3] ADMISSION ─▶ etcd
              "who are you?"         (RBAC) "allowed?"     "mutate/validate"
              certs, tokens,         Roles +               e.g. PodSecurity,
              ServiceAccounts        RoleBindings          ResourceQuota
                   │                      │                     │
              fail→401              fail→403            fail→422/forbidden

  (B) WORKLOAD SECURITY — "what may a running Pod do / talk to?"
   ┌────────────────────────┐     ┌────────────────────────────┐
   │ Pod Security Standards │     │ NetworkPolicy              │
   │ restrict Pod spec      │     │ firewall Pod-to-Pod/egress │
   │ (no privileged, etc.)  │     │ (default-deny + allow)     │
   └────────────────────────┘     └────────────────────────────┘
```

**Two mental buckets:** (A) governs **API access** — Labs 5.1 (AuthN/RBAC) and 5.2 (Admission). (B) governs **running workloads** — Labs 5.3 (Pod Security) and 5.4 (NetworkPolicy). Requests always flow left-to-right through the three control-plane gates before anything is stored.

---
---

# Lab 5.1 — Authentication & RBAC

## 🧩 Explanation (Read First)

Every request to the API server is identified as coming from a **subject** — either a human **user** or a **ServiceAccount** (an identity for Pods/automation). Authentication answers *"who are you?"* via certificates, tokens, or ServiceAccount tokens.

Once authenticated, **RBAC (Role-Based Access Control)** answers *"are you allowed to do this?"* using four object types:

| Object | Scope | Says |
|--------|-------|------|
| **Role** | One namespace | A set of allowed verbs on resources (e.g. `get,list` on `pods`) |
| **ClusterRole** | Whole cluster | Same, but cluster-wide or for cluster-scoped resources |
| **RoleBinding** | One namespace | "Grant this Role to these subjects" |
| **ClusterRoleBinding** | Whole cluster | "Grant this ClusterRole cluster-wide" |

RBAC is **additive and deny-by-default**: with no binding, you can do nothing. A binding only ever *grants*; there are no "deny" rules.

**Why this matters:** RBAC is how you give a CI pipeline permission to deploy without handing it cluster-admin, and how you confine teams to their namespaces. `kubectl auth can-i` lets you test permissions precisely — invaluable for debugging "forbidden" errors.

## 🎯 Objectives
- Create a ServiceAccount (a subject)
- Grant it a narrow Role via a RoleBinding
- Prove, with `auth can-i`, exactly what it can and cannot do

## 📝 Steps

### Step 1 — Create a namespace and a ServiceAccount

```bash
kubectl create namespace rbac-demo
kubectl create serviceaccount pod-reader -n rbac-demo
```

**💡** `pod-reader` is now an identity. By default (deny-by-default) it can do essentially nothing in the cluster.

### Step 2 — Prove it starts with no permissions

```bash
kubectl auth can-i list pods \
  --as=system:serviceaccount:rbac-demo:pod-reader -n rbac-demo
```

**Expected output:**
```
no
```

**💡 Code explanation:** `--as=system:serviceaccount:<ns>:<name>` impersonates the ServiceAccount so you can test *its* permissions. `no` confirms deny-by-default.

### Step 3 — Create a narrow Role

```bash
cat <<EOF | kubectl apply -f -
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: rbac-demo
  name: pod-reader-role
rules:
- apiGroups: [""]              # "" = core API group (pods live here)
  resources: ["pods"]
  verbs: ["get", "list", "watch"]
EOF
```

**💡 Code explanation:** This Role grants **only** read verbs (`get,list,watch`) on **only** `pods`, **only** in `rbac-demo`. No create, no delete, no other resources.

### Step 4 — Bind the Role to the ServiceAccount

```bash
cat <<EOF | kubectl apply -f -
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: pod-reader-binding
  namespace: rbac-demo
subjects:
- kind: ServiceAccount
  name: pod-reader
  namespace: rbac-demo
roleRef:
  kind: Role
  name: pod-reader-role
  apiGroup: rbac.authorization.k8s.io
EOF
```

**💡** The RoleBinding is the connective tissue: `subjects` (who) + `roleRef` (what permissions). Without it, the Role grants nothing.

### Step 5 — Verify the exact boundary of permissions

```bash
echo "Can it LIST pods?   $(kubectl auth can-i list pods   --as=system:serviceaccount:rbac-demo:pod-reader -n rbac-demo)"
echo "Can it GET pods?    $(kubectl auth can-i get pods    --as=system:serviceaccount:rbac-demo:pod-reader -n rbac-demo)"
echo "Can it DELETE pods? $(kubectl auth can-i delete pods --as=system:serviceaccount:rbac-demo:pod-reader -n rbac-demo)"
echo "Can it list SECRETS? $(kubectl auth can-i list secrets --as=system:serviceaccount:rbac-demo:pod-reader -n rbac-demo)"
echo "Can it list pods in DEFAULT ns? $(kubectl auth can-i list pods --as=system:serviceaccount:rbac-demo:pod-reader -n default)"
```

**Expected output:**
```
Can it LIST pods?   yes
Can it GET pods?    yes
Can it DELETE pods? no
Can it list SECRETS? no
Can it list pods in DEFAULT ns? no
```

**💡 Flow insight:** The boundary is razor-sharp — read pods in `rbac-demo` only. `delete` is denied (not in the Role), `secrets` denied (different resource), and `default` namespace denied (Role is namespaced). This is least-privilege in action.

## ✅ Validation
```bash
kubectl auth can-i list pods --as=system:serviceaccount:rbac-demo:pod-reader -n rbac-demo   # yes
kubectl auth can-i create pods --as=system:serviceaccount:rbac-demo:pod-reader -n rbac-demo # no
```
You understand this lab if you can explain why `delete` and cross-namespace access are denied.

## 🧹 Cleanup
Keep the `rbac-demo` namespace for now (Lab 5.3 reuses the namespace concept); or:
```bash
kubectl delete namespace rbac-demo
```

## 📌 Key Takeaways
- Requests are **authenticated** (who) then **authorized** by **RBAC** (allowed?).
- **Role/ClusterRole** define permissions; **RoleBinding/ClusterRoleBinding** grant them to subjects.
- RBAC is additive and **deny-by-default**; test with `kubectl auth can-i --as=...`.

---
---

# Lab 5.2 — Admission Controllers

## 🧩 Explanation (Read First)

After authentication and authorization, a request hits the **admission control** phase — the last gate before the object is written to etcd. Admission controllers can:

- **Mutate** the object (change/add fields) — e.g. inject defaults, add a sidecar, set a default ServiceAccount.
- **Validate** the object (accept or reject) — e.g. enforce "no privileged Pods," "images must come from our registry," quota limits.

Order: **mutating** admission runs first, then **validating** admission. If any validating controller rejects, the whole request fails and nothing is stored.

Many controllers are built in (e.g. `ResourceQuota`, `LimitRanger`, `NamespaceLifecycle`, `PodSecurity`). You can add custom ones via **webhooks**. In this lab we trigger built-in controllers you can observe without extra setup: `ResourceQuota` (validating) and `LimitRanger` (mutating).

**Why this matters:** Admission is where cluster-wide *policy* is enforced — regardless of RBAC. Even a user allowed to create Pods can be stopped by an admission policy. It's the mechanism behind quotas, Pod Security (Lab 5.3), and policy engines like OPA/Kyverno.

## 🎯 Objectives
- See a **mutating** controller (LimitRanger) inject defaults
- See a **validating** controller (ResourceQuota) reject a request
- Understand mutate-then-validate ordering

## 📝 Steps

### Step 1 — Create a namespace with a LimitRange (mutating) and ResourceQuota (validating)

```bash
kubectl create namespace admission-demo

cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: LimitRange
metadata:
  name: default-limits
  namespace: admission-demo
spec:
  limits:
  - default:                 # applied if the Pod omits limits
      cpu: 200m
      memory: 128Mi
    defaultRequest:
      cpu: 100m
      memory: 64Mi
    type: Container
---
apiVersion: v1
kind: ResourceQuota
metadata:
  name: cpu-quota
  namespace: admission-demo
spec:
  hard:
    requests.cpu: "500m"     # total CPU requests across the namespace
EOF
```

**💡 Code explanation:**
- **LimitRange** = a *mutating* admission input: Pods without explicit requests/limits get these defaults injected.
- **ResourceQuota** = a *validating* admission input: the namespace's total `requests.cpu` may not exceed `500m`.

### Step 2 — Observe mutation: create a Pod with no resources set

```bash
kubectl run mutate-me --image=nginx:1.25 -n admission-demo
kubectl get pod mutate-me -n admission-demo \
  -o jsonpath='{.spec.containers[0].resources}{"\n"}'
```

**Expected output:**
```
{"limits":{"cpu":"200m","memory":"128Mi"},"requests":{"cpu":"100m","memory":"64Mi"}}
```

**💡 Flow insight:** You never specified `resources`, yet the stored Pod has them. The **LimitRanger mutating admission controller** injected the LimitRange defaults *before* the object was persisted. This is admission *mutating* a request.

### Step 3 — Observe validation: exceed the quota

The quota allows `500m` total CPU requests. One default Pod uses `100m`. Try to create a Pod requesting `600m`:

```bash
kubectl run too-big --image=nginx:1.25 -n admission-demo \
  --overrides='{"spec":{"containers":[{"name":"too-big","image":"nginx:1.25","resources":{"requests":{"cpu":"600m"}}}]}}'
```

**Expected output:**
```
Error from server (Forbidden): pods "too-big" is forbidden: exceeded quota: cpu-quota,
requested: requests.cpu=600m, used: requests.cpu=100m, limited: requests.cpu=500m
```

**💡 Flow insight:** The **ResourceQuota validating admission controller** rejected the request *before* it reached etcd. Note it even accounts for the `100m` already used by `mutate-me`. This is admission *validating* (and denying) a request. The Pod was never created.

### Step 4 — Confirm the current quota usage

```bash
kubectl describe resourcequota cpu-quota -n admission-demo
```

**Expected output:**
```
Name:         cpu-quota
Namespace:    admission-demo
Resource      Used   Hard
--------      ----   ----
requests.cpu  100m   500m
```

**💡** Admission controllers maintain this running tally and consult it on every create — enforcing policy continuously, not just once.

## ✅ Validation
```bash
kubectl get pod mutate-me -n admission-demo -o jsonpath='{.spec.containers[0].resources.requests.cpu}{"\n"}'  # 100m (injected)
```
You understand this lab if you can say which controller mutated and which rejected, and in what order they run.

## 🧹 Cleanup
```bash
kubectl delete namespace admission-demo
```

## 📌 Key Takeaways
- Admission is the final gate: **mutating** controllers run first, then **validating**.
- LimitRanger (mutating) injected default resources; ResourceQuota (validating) rejected an over-limit Pod.
- Admission enforces cluster policy independent of RBAC.

---
---

# Lab 5.3 — Pod Security Controls

## 🧩 Explanation (Read First)

A Pod can request dangerous powers: run as root, use the host network, mount the host filesystem, run `privileged` (near-root on the node). **Pod Security Standards (PSS)** are three predefined policy levels that restrict what a Pod spec may ask for:

| Level | Allows | Use for |
|-------|--------|---------|
| **privileged** | Everything (no restrictions) | Trusted system workloads |
| **baseline** | Blocks the worst (privileged, hostNetwork, hostPID…) | Most apps |
| **restricted** | Hardened: non-root, drop capabilities, seccomp, no privilege escalation | Security-sensitive / multi-tenant |

PSS is enforced by the built-in **PodSecurity admission controller** (so this is a concrete example of Lab 5.2's mechanism). You opt a **namespace** into a level with a label:

```
pod-security.kubernetes.io/enforce=restricted
```

Modes: `enforce` (reject violating Pods), `warn` (allow but warn), `audit` (log only).

**Why this matters:** PSS replaced the deprecated PodSecurityPolicy and is the standard, zero-dependency way to stop containers from escaping to the node. "My privileged Pod is rejected" in a hardened namespace is PSS doing its job.

## 🎯 Objectives
- Label a namespace to enforce the `restricted` standard
- Watch a privileged/root Pod get rejected
- Deploy a compliant Pod that passes

## 📝 Steps

### Step 1 — Create a namespace enforcing `restricted`

```bash
kubectl create namespace secure-ns
kubectl label namespace secure-ns \
  pod-security.kubernetes.io/enforce=restricted \
  pod-security.kubernetes.io/warn=restricted
```

**💡** The `enforce` label activates the PodSecurity admission controller for this namespace at the `restricted` level. Any Pod violating it will be **rejected at admission**.

### Step 2 — Try to create a privileged Pod (should be rejected)

```bash
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: privileged-pod
  namespace: secure-ns
spec:
  containers:
  - name: app
    image: nginx:1.25
    securityContext:
      privileged: true          # asking for near-root on the node
EOF
```

**Expected output:**
```
Error from server (Forbidden): error when creating "STDIN":
pods "privileged-pod" is forbidden: violates PodSecurity "restricted:latest":
privileged (container "app" must not set securityContext.privileged=true),
allowPrivilegeEscalation != false, unrestricted capabilities, runAsNonRoot != true,
seccompProfile ...
```

**💡 Flow insight:** The PodSecurity admission controller listed **every** way this Pod violates `restricted`. It never reached etcd. This is Lab 5.2's validating-admission concept applied to workload hardening.

### Step 3 — Deploy a compliant Pod (should pass)

```bash
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: compliant-pod
  namespace: secure-ns
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    seccompProfile:
      type: RuntimeDefault
  containers:
  - name: app
    image: nginxinc/nginx-unprivileged:1.25
    securityContext:
      allowPrivilegeEscalation: false
      runAsNonRoot: true
      capabilities:
        drop: ["ALL"]
    ports:
    - containerPort: 8080
EOF
kubectl get pod compliant-pod -n secure-ns
```

**Expected output:**
```
NAME            READY   STATUS    RESTARTS   AGE
compliant-pod   1/1     Running   0          10s
```

**💡 Code explanation — what makes it `restricted`-compliant:**

| Setting | Satisfies |
|---------|-----------|
| `runAsNonRoot: true` + `runAsUser: 1000` | Must not run as root |
| `allowPrivilegeEscalation: false` | No gaining extra privileges |
| `capabilities.drop: ["ALL"]` | Drop all Linux capabilities |
| `seccompProfile.type: RuntimeDefault` | Syscall filtering enabled |
| `nginx-unprivileged` image on 8080 | Non-root nginx variant |

### Step 4 — Confirm it ran as non-root

```bash
kubectl exec compliant-pod -n secure-ns -- id
```

**Expected output:**
```
uid=1000 gid=1000 groups=1000
```

**💡** `uid=1000`, not `0` — the container is genuinely non-root, as `restricted` demands.

## ✅ Validation
```bash
kubectl get pod compliant-pod -n secure-ns -o jsonpath='{.status.phase}{"\n"}'   # Running
# and the privileged pod should NOT exist:
kubectl get pod privileged-pod -n secure-ns 2>&1 | grep -q NotFound && echo "privileged pod correctly blocked"
```
You understand this lab if you can list two things `restricted` forbids.

## 🧹 Cleanup
```bash
kubectl delete namespace secure-ns
```

## 📌 Key Takeaways
- **Pod Security Standards** (privileged/baseline/restricted) restrict dangerous Pod specs.
- Enforced per-namespace via `pod-security.kubernetes.io/enforce=<level>` by the PodSecurity admission controller.
- `restricted` requires non-root, dropped capabilities, no privilege escalation, seccomp.

---
---

# Lab 5.4 — Network Policies

## 🧩 Explanation (Read First)

By default, the Kubernetes network is **wide open**: any Pod can talk to any other Pod (you proved this in Lab 2.1). **NetworkPolicies** let you firewall that traffic — they are the Pod-level equivalent of security groups.

Key facts:
1. A NetworkPolicy selects a group of Pods (via `podSelector`) and defines allowed **ingress** (incoming) and/or **egress** (outgoing) traffic.
2. NetworkPolicies are **additive allow-lists**. The moment *any* policy selects a Pod for a direction, that direction switches to **default-deny** — only explicitly allowed traffic passes.
3. They are enforced by the **CNI plugin**, not Kubernetes core. **Your CNI must support enforcement** (Calico, Cilium). Flannel and minikube's default CNI do *not* enforce — the policies are stored but ignored.

The standard pattern: apply a **default-deny-all** policy to a namespace, then add narrow **allow** policies for the connections you actually need (zero-trust networking).

**Why this matters:** Without NetworkPolicies, a compromised Pod can scan and reach every service in the cluster. They're a core requirement for multi-tenant clusters and compliance. "My policy isn't working" is almost always a non-enforcing CNI.

## 🎯 Objectives
- Confirm open connectivity, then apply default-deny
- Add a targeted allow rule and verify only it passes
- Understand that enforcement depends on the CNI

## 📝 Steps

> ⚠️ **CNI requirement:** This lab needs an enforcing CNI. On minikube start a fresh cluster with Calico:
> ```bash
> minikube start --cni=calico
> ```
> Verify Calico is running: `kubectl get pods -n kube-system | grep -i calico`

### Step 1 — Set up a target and two clients

```bash
kubectl create namespace netpol-demo

# Target: a web server
kubectl run web --image=nginx:1.25 -n netpol-demo --labels="app=web" --port=80
kubectl expose pod web -n netpol-demo --port=80

# Two clients with different labels
kubectl run allowed  --image=nicolaka/netshoot -n netpol-demo --labels="role=frontend" --command -- sleep 3600
kubectl run blocked  --image=nicolaka/netshoot -n netpol-demo --labels="role=other"    --command -- sleep 3600
kubectl wait --for=condition=Ready pod/web pod/allowed pod/blocked -n netpol-demo --timeout=90s
```

### Step 2 — Confirm connectivity is open (no policy yet)

```bash
echo "allowed -> web:"; kubectl exec allowed -n netpol-demo -- curl -s -m 3 -o /dev/null -w "%{http_code}\n" http://web
echo "blocked -> web:"; kubectl exec blocked -n netpol-demo -- curl -s -m 3 -o /dev/null -w "%{http_code}\n" http://web
```

**Expected output:**
```
allowed -> web:
200
blocked -> web:
200
```

**💡** Both reach `web` — this is the default wide-open network from Module 2.

### Step 3 — Apply default-deny ingress for the namespace

```bash
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-ingress
  namespace: netpol-demo
spec:
  podSelector: {}         # {} = ALL pods in the namespace
  policyTypes:
  - Ingress               # with no ingress rules below, all ingress is denied
EOF
```

**💡 Code explanation:** `podSelector: {}` selects every Pod; `policyTypes: [Ingress]` with no `ingress:` rules means **deny all incoming traffic**. Re-test:

```bash
echo "allowed -> web:"; kubectl exec allowed -n netpol-demo -- curl -s -m 3 -o /dev/null -w "%{http_code}\n" http://web || echo "timeout/blocked"
echo "blocked -> web:"; kubectl exec blocked -n netpol-demo -- curl -s -m 3 -o /dev/null -w "%{http_code}\n" http://web || echo "timeout/blocked"
```

**Expected output:**
```
allowed -> web:
timeout/blocked
blocked -> web:
timeout/blocked
```

**💡 Flow insight:** Now *nothing* can reach `web` — the CNI (Calico) is enforcing default-deny. If both still returned `200`, your CNI isn't enforcing NetworkPolicy.

### Step 4 — Add a targeted allow rule

Allow ingress to `web` **only** from Pods labeled `role=frontend`:

```bash
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-frontend-to-web
  namespace: netpol-demo
spec:
  podSelector:
    matchLabels:
      app: web            # this policy protects the web pod
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          role: frontend  # only pods with role=frontend may connect
    ports:
    - protocol: TCP
      port: 80
EOF
```

**💡 Code explanation:** This policy selects `web` (`app=web`) and allows ingress **only** from Pods with `role=frontend` on TCP 80. Everything else remains denied by the default-deny policy.

### Step 5 — Verify the selective allow

```bash
echo "allowed (role=frontend) -> web:"; kubectl exec allowed -n netpol-demo -- curl -s -m 3 -o /dev/null -w "%{http_code}\n" http://web || echo "blocked"
echo "blocked (role=other)   -> web:"; kubectl exec blocked -n netpol-demo -- curl -s -m 3 -o /dev/null -w "%{http_code}\n" http://web || echo "blocked"
```

**Expected output:**
```
allowed (role=frontend) -> web:
200
blocked (role=other)   -> web:
blocked
```

**💡 Flow insight:** `allowed` (role=frontend) gets through; `blocked` (role=other) is still denied. You've built a zero-trust rule: deny-by-default + an explicit allow for exactly one source. This is the standard production pattern.

## ✅ Validation
```bash
kubectl exec allowed -n netpol-demo -- curl -s -m3 -o /dev/null -w "allowed=%{http_code}\n" http://web
kubectl exec blocked -n netpol-demo -- sh -c 'curl -s -m3 -o /dev/null -w "blocked=%{http_code}\n" http://web || echo "blocked=denied"'
```
You understand this lab if you can explain why connectivity broke for *everyone* after Step 3.

## 🧹 Cleanup
```bash
kubectl delete namespace netpol-demo
```

## 📌 Key Takeaways
- The default network is open; **NetworkPolicies** add allow-lists, flipping selected Pods to default-deny.
- Standard pattern: **default-deny** + **targeted allow** rules (zero-trust).
- Enforcement is done by the **CNI** — Calico/Cilium enforce; plain Flannel does not.

---
---

## 🎓 Module 5 Summary

You walked the full security flow and locked down workloads:

```
AuthN ─▶ RBAC (AuthZ) ─▶ Admission (mutate→validate) ─▶ etcd
Workload: Pod Security Standards + NetworkPolicy
```

| Lab | Gate / Control | One-line lesson |
|-----|----------------|-----------------|
| 5.1 | AuthN + RBAC | Deny-by-default; Roles+Bindings grant least privilege |
| 5.2 | Admission | Mutating injects defaults; validating rejects policy violations |
| 5.3 | Pod Security | Namespace labels enforce privileged/baseline/restricted |
| 5.4 | NetworkPolicy | Default-deny + allow-lists; enforced by the CNI |

**Next:** [Module 6 — Capstone: Full Lifecycle Simulation](module-6-capstone.md), where every flow from Modules 1–5 appears in one multi-tier app.
