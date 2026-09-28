# Lab 1.1: Installing HAProxy Ingress Controller

## 📚 Related Topics
- Load balancing fundamentals
- Kubernetes Ingress
- High availability
- Traffic management
- Layer 4 and Layer 7 proxying

## 🎯 Learning Objectives

By the end of this lab, you will be able to:
- Understand HAProxy architecture and components
- Install HAProxy Ingress Controller on Kubernetes
- Configure basic load balancing
- Create Ingress resources for HAProxy
- Monitor HAProxy statistics
- Understand load balancing algorithms
- Test failover and high availability

## ⏱️ Estimated Time
60-75 minutes

## 📋 Prerequisites

- Running Kubernetes cluster
- kubectl and Helm configured
- Basic understanding of Kubernetes Services and Ingress
- Familiarity with load balancing concepts

---

## 🏗️ HAProxy Architecture

```
┌──────────────────────────────────────────────────────────────┐
│              HAProxy Ingress Architecture                    │
└──────────────────────────────────────────────────────────────┘

External Traffic
      ↓
┌─────────────────────────────────────────────────────────────┐
│  LoadBalancer Service (Cloud LB or NodePort)                │
│  External IP: 203.0.113.10                                  │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  HAProxy Ingress Controller (Deployment/DaemonSet)          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  HAProxy Process                                     │  │
│  │  • Frontend (Listeners)                              │  │
│  │  • Backend (Server Pools)                            │  │
│  │  • ACLs (Access Control Lists)                       │  │
│  │  • Health Checks                                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Controller (Watches Kubernetes API)                 │  │
│  │  • Ingress resources                                 │  │
│  │  • Services                                          │  │
│  │  • Endpoints                                         │  │
│  │  • ConfigMaps                                        │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────┬──────────────┬──────────────┬─────────────────┘
            │              │              │
            ▼              ▼              ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Service 1   │  │  Service 2   │  │  Service 3   │
│  (Pods)      │  │  (Pods)      │  │  (Pods)      │
└──────────────┘  └──────────────┘  └──────────────┘

Configuration Flow:
  1. User creates Ingress resource
  2. Controller watches Ingress
  3. Controller updates HAProxy config
  4. HAProxy reloads (zero downtime)
  5. Traffic flows to backends
```

**Key Components:**
- **HAProxy Process**: The actual load balancer
- **Controller**: Kubernetes integration layer
- **Frontend**: Listens for incoming connections
- **Backend**: Pool of servers to distribute traffic
- **ACLs**: Rules for routing decisions

---

## 📝 Part 1: Understanding Load Balancing

### Step 1.1: Load Balancing Concepts

**What is Load Balancing?**
- Distributes network traffic across multiple servers
- Improves availability and reliability
- Prevents server overload
- Enables horizontal scaling

**Load Balancing Layers:**
```
┌─────────────────────────────────────────────────────────┐
│ Layer │ Protocol │ Decision Based On                   │
├─────────────────────────────────────────────────────────┤
│ L4    │ TCP/UDP  │ IP address, Port                    │
│       │          │ Fast, simple                        │
│       │          │ No content inspection               │
├─────────────────────────────────────────────────────────┤
│ L7    │ HTTP     │ URL, Headers, Cookies               │
│       │          │ Content-aware routing               │
│       │          │ More CPU intensive                  │
└─────────────────────────────────────────────────────────┘
```

### Step 1.2: Load Balancing Algorithms

```
┌─────────────────────────────────────────────────────────┐
│ Algorithm      │ Description                           │
├─────────────────────────────────────────────────────────┤
│ Round Robin    │ Distributes requests sequentially     │
│                │ Simple, fair distribution             │
│                │ Default in most cases                 │
├─────────────────────────────────────────────────────────┤
│ Least Conn     │ Sends to server with fewest conns     │
│                │ Good for long-lived connections       │
├─────────────────────────────────────────────────────────┤
│ Source IP      │ Same client → same server             │
│                │ Session persistence                   │
├─────────────────────────────────────────────────────────┤
│ Weighted       │ Distributes based on server weight    │
│                │ Useful for different server sizes     │
└─────────────────────────────────────────────────────────┘
```

**💡 Choosing an Algorithm:**
- **Round Robin**: Default, works for most cases
- **Least Connections**: Long-lived connections (WebSockets)
- **Source IP**: Session persistence needed
- **Weighted**: Servers have different capacities

---

## 📝 Part 2: Installing HAProxy Ingress Controller

### Step 2.1: Add HAProxy Helm Repository

```bash
# Add HAProxyTech Helm repository
helm repo add haproxytech https://haproxytech.github.io/helm-charts
```

**Expected Output:**
```
"haproxytech" has been added to your repositories
```

```bash
# Update repository
helm repo update
```

**Expected Output:**
```
Hang tight while we grab the latest from your chart repositories...
...Successfully got an update from the "haproxytech" chart repository
Update Complete. ⎈Happy Helming!⎈
```

### Step 2.2: Install HAProxy Ingress Controller

```bash
# Install HAProxy Ingress Controller
helm install haproxy-ingress haproxytech/kubernetes-ingress \
  --create-namespace \
  --namespace haproxy-controller \
  --set controller.service.type=LoadBalancer
```

**Expected Output:**
```
NAME: haproxy-ingress
LAST DEPLOYED: Mon Sep 28 10:00:00 2026
NAMESPACE: haproxy-controller
STATUS: deployed
REVISION: 1
NOTES:
HAProxy Kubernetes Ingress Controller has been successfully installed.

Controller Service can be accessed via:
  kubectl get svc -n haproxy-controller haproxy-ingress-kubernetes-ingress

To create an Ingress resource, use:
  kubectl create ingress <name> --class=haproxy --rule="host/path=service:port"
```

**💡 Installation Options:**
- `--set controller.service.type=LoadBalancer`: Expose via cloud LB
- `--set controller.service.type=NodePort`: Expose via NodePort
- `--set controller.replicaCount=3`: High availability

### Step 2.3: Verify Installation

```bash
# Check HAProxy Ingress Controller pods
kubectl get pods -n haproxy-controller
```

**Expected Output:**
```
NAME                                                    READY   STATUS    RESTARTS   AGE
haproxy-ingress-kubernetes-ingress-7d4b7b9c4d-xxxxx    1/1     Running   0          1m
```

```bash
# Check HAProxy Ingress Controller service
kubectl get svc -n haproxy-controller
```

**Expected Output:**
```
NAME                                     TYPE           CLUSTER-IP      EXTERNAL-IP     PORT(S)                      AGE
haproxy-ingress-kubernetes-ingress       LoadBalancer   10.96.123.45    203.0.113.10    80:30080/TCP,443:30443/TCP   1m
```

**💡 Service Details:**
- **TYPE**: LoadBalancer (gets external IP)
- **EXTERNAL-IP**: Cloud provider assigns this
- **PORTS**: 80 (HTTP), 443 (HTTPS)

```bash
# Check IngressClass
kubectl get ingressclass
```

**Expected Output:**
```
NAME      CONTROLLER                      PARAMETERS   AGE
haproxy   haproxy.org/ingress-controller  <none>       1m
```

---

## 📝 Part 3: Deploying Sample Applications

### Step 3.1: Deploy Multiple Backend Services

```bash
# Create three different deployments
kubectl create deployment app-v1 --image=hashicorp/http-echo --replicas=2 -- -text="App Version 1"
kubectl create deployment app-v2 --image=hashicorp/http-echo --replicas=2 -- -text="App Version 2"
kubectl create deployment app-v3 --image=hashicorp/http-echo --replicas=2 -- -text="App Version 3"
```

**Expected Output:**
```
deployment.apps/app-v1 created
deployment.apps/app-v2 created
deployment.apps/app-v3 created
```

```bash
# Expose deployments as services
kubectl expose deployment app-v1 --port=5678
kubectl expose deployment app-v2 --port=5678
kubectl expose deployment app-v3 --port=5678
```

**Expected Output:**
```
service/app-v1 exposed
service/app-v2 exposed
service/app-v3 exposed
```

```bash
# Verify services
kubectl get svc
```

**Expected Output:**
```
NAME     TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)    AGE
app-v1   ClusterIP   10.96.123.50    <none>        5678/TCP   30s
app-v2   ClusterIP   10.96.123.51    <none>        5678/TCP   30s
app-v3   ClusterIP   10.96.123.52    <none>        5678/TCP   30s
```

### Step 3.2: Test Services Directly

```bash
# Test app-v1 service
kubectl run test --image=curlimages/curl --rm -it --restart=Never -- curl http://app-v1:5678
```

**Expected Output:**
```
App Version 1
pod "test" deleted
```

**💡 Services are working internally!**

---

## 📝 Part 4: Creating Ingress Resources

### Step 4.1: Create Basic Ingress

```bash
# Create Ingress for app-v1
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  annotations:
    haproxy.org/load-balance: "roundrobin"
spec:
  ingressClassName: haproxy
  rules:
  - host: app.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: app-v1
            port:
              number: 5678
EOF
```

**Expected Output:**
```
ingress.networking.k8s.io/app-ingress created
```

**💡 Ingress Configuration:**
- **ingressClassName: haproxy**: Use HAProxy controller
- **host**: Domain name for routing
- **path**: URL path matching
- **backend**: Target service

### Step 4.2: Verify Ingress

```bash
# Check Ingress status
kubectl get ingress
```

**Expected Output:**
```
NAME          CLASS     HOSTS             ADDRESS         PORTS   AGE
app-ingress   haproxy   app.example.com   203.0.113.10    80      30s
```

```bash
# Describe Ingress
kubectl describe ingress app-ingress
```

**Expected Output:**
```
Name:             app-ingress
Namespace:        default
Address:          203.0.113.10
Ingress Class:    haproxy
Rules:
  Host             Path  Backends
  ----             ----  --------
  app.example.com
                   /   app-v1:5678 (10.244.1.5:5678,10.244.2.6:5678)
Annotations:       haproxy.org/load-balance: roundrobin
Events:
  Type    Reason  Age   From                       Message
  ----    ------  ----  ----                       -------
  Normal  Sync    30s   haproxy-ingress-controller Scheduled for sync
```

### Step 4.3: Test Ingress

```bash
# Get LoadBalancer IP
INGRESS_IP=$(kubectl get svc -n haproxy-controller haproxy-ingress-kubernetes-ingress -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
echo "Ingress IP: $INGRESS_IP"
```

```bash
# Test with curl (using Host header)
curl -H "Host: app.example.com" http://$INGRESS_IP
```

**Expected Output:**
```
App Version 1
```

**💡 Multiple requests show round-robin:**
```bash
for i in {1..5}; do curl -H "Host: app.example.com" http://$INGRESS_IP; done
```

---

## 📝 Part 5: Path-Based Routing

### Step 5.1: Create Multi-Path Ingress

```bash
# Create Ingress with multiple paths
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: multi-path-ingress
  annotations:
    haproxy.org/load-balance: "roundrobin"
spec:
  ingressClassName: haproxy
  rules:
  - host: app.example.com
    http:
      paths:
      - path: /v1
        pathType: Prefix
        backend:
          service:
            name: app-v1
            port:
              number: 5678
      - path: /v2
        pathType: Prefix
        backend:
          service:
            name: app-v2
            port:
              number: 5678
      - path: /v3
        pathType: Prefix
        backend:
          service:
            name: app-v3
            port:
              number: 5678
EOF
```

**Expected Output:**
```
ingress.networking.k8s.io/multi-path-ingress created
```

### Step 5.2: Test Path-Based Routing

```bash
# Test different paths
curl -H "Host: app.example.com" http://$INGRESS_IP/v1
curl -H "Host: app.example.com" http://$INGRESS_IP/v2
curl -H "Host: app.example.com" http://$INGRESS_IP/v3
```

**Expected Output:**
```
App Version 1
App Version 2
App Version 3
```

**💡 Traffic is routed based on URL path!**

---

## 📝 Part 6: Monitoring HAProxy

### Step 6.1: Access HAProxy Stats Page

```bash
# Enable stats page
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ConfigMap
metadata:
  name: haproxy-config
  namespace: haproxy-controller
data:
  stats: |
    stats enable
    stats uri /haproxy?stats
    stats refresh 30s
    stats show-legends
EOF
```

```bash
# Port forward to HAProxy stats
kubectl port-forward -n haproxy-controller \
  svc/haproxy-ingress-kubernetes-ingress 8404:8404
```

**Access stats page:**
```
http://localhost:8404/haproxy?stats
```

**Stats Page Shows:**
- Frontend statistics
- Backend server status
- Connection counts
- Request rates
- Health check status

### Step 6.2: HAProxy Metrics

```bash
# HAProxy exposes Prometheus metrics
curl http://localhost:8404/metrics | grep haproxy_
```

**Expected Output:**
```
# HELP haproxy_backend_current_sessions Current number of sessions
# TYPE haproxy_backend_current_sessions gauge
haproxy_backend_current_sessions{backend="default-app-v1-5678"} 0

# HELP haproxy_backend_http_responses_total Total HTTP responses
# TYPE haproxy_backend_http_responses_total counter
haproxy_backend_http_responses_total{backend="default-app-v1-5678",code="2xx"} 45

# HELP haproxy_server_up Current health status of the server (1 = UP, 0 = DOWN)
# TYPE haproxy_server_up gauge
haproxy_server_up{backend="default-app-v1-5678",server="10.244.1.5:5678"} 1
```

---

## 📝 Part 7: Load Balancing Algorithms

### Step 7.1: Configure Different Algorithms

```bash
# Least connections algorithm
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: leastconn-ingress
  annotations:
    haproxy.org/load-balance: "leastconn"
spec:
  ingressClassName: haproxy
  rules:
  - host: leastconn.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: app-v1
            port:
              number: 5678
EOF
```

**Available Algorithms:**
```yaml
# Round robin (default)
haproxy.org/load-balance: "roundrobin"

# Least connections
haproxy.org/load-balance: "leastconn"

# Source IP hash (session persistence)
haproxy.org/load-balance: "source"

# URI hash
haproxy.org/load-balance: "uri"
```

---

## ✅ Validation Steps

```bash
# 1. Verify HAProxy Ingress Controller is running
kubectl get pods -n haproxy-controller

# 2. Check Ingress resources
kubectl get ingress

# 3. Test HTTP requests
curl -H "Host: app.example.com" http://$INGRESS_IP

# 4. Verify load balancing
for i in {1..10}; do curl -H "Host: app.example.com" http://$INGRESS_IP; done

# 5. Check HAProxy stats
kubectl port-forward -n haproxy-controller svc/haproxy-ingress-kubernetes-ingress 8404:8404 &
curl http://localhost:8404/metrics | grep haproxy_backend_up
```

---

## 🧹 Cleanup

```bash
# Delete Ingress resources
kubectl delete ingress app-ingress multi-path-ingress leastconn-ingress

# Delete services and deployments
kubectl delete svc app-v1 app-v2 app-v3
kubectl delete deployment app-v1 app-v2 app-v3

# Uninstall HAProxy Ingress Controller
helm uninstall haproxy-ingress -n haproxy-controller

# Delete namespace
kubectl delete namespace haproxy-controller
```

---

## 🎯 Challenge Tasks

1. **SSL/TLS Termination**
   ```yaml
   spec:
     tls:
     - hosts:
       - app.example.com
       secretName: app-tls
   ```

2. **Rate Limiting**
   ```yaml
   annotations:
     haproxy.org/rate-limit: "10"
   ```

3. **Custom Timeouts**
   ```yaml
   annotations:
     haproxy.org/timeout-client: "30s"
     haproxy.org/timeout-server: "30s"
   ```

---

## 🐛 Troubleshooting

### Issue: Ingress not getting IP

**Solution:**
```bash
# Check controller logs
kubectl logs -n haproxy-controller -l app.kubernetes.io/name=kubernetes-ingress

# Verify service
kubectl get svc -n haproxy-controller

# Check events
kubectl get events -n haproxy-controller
```

### Issue: 503 Service Unavailable

**Solution:**
```bash
# Check backend pods are running
kubectl get pods

# Verify service endpoints
kubectl get endpoints app-v1

# Check HAProxy stats for backend health
curl http://localhost:8404/haproxy?stats
```

---

## 📚 Key Takeaways

✅ **HAProxy** is a high-performance load balancer  
✅ **Ingress Controller** integrates HAProxy with Kubernetes  
✅ **Layer 4 and Layer 7** load balancing supported  
✅ **Load balancing algorithms** control traffic distribution  
✅ **Path-based routing** enables multiple backends  
✅ **Stats page** provides real-time monitoring  
✅ **Annotations** configure HAProxy behavior  
✅ **High availability** through multiple replicas  

---

## 📖 Next Steps

Continue to [Lab 1.2: Understanding Load Balancing Algorithms](lab-1.2-load-balancing-algorithms.md)

---

## 📝 Lab Completion Checklist

- [ ] Installed HAProxy Ingress Controller
- [ ] Deployed sample applications
- [ ] Created Ingress resources
- [ ] Tested load balancing
- [ ] Configured path-based routing
- [ ] Accessed HAProxy stats
- [ ] Explored different algorithms
- [ ] Monitored HAProxy metrics
- [ ] Completed challenge tasks

**Congratulations! You've mastered HAProxy installation and basic load balancing!** 🎉
