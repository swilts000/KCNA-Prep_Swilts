# Lab 3.1: Monitoring Kubernetes with Prometheus

## 📚 Related Topics
- Kubernetes metrics
- ServiceMonitors
- PodMonitors
- kube-state-metrics
- Resource monitoring

## 🎯 Learning Objectives

By the end of this lab, you will be able to:
- Monitor Kubernetes cluster components
- Use ServiceMonitors to scrape custom applications
- Understand kube-state-metrics
- Monitor pod and container metrics
- Track resource usage and limits
- Create Kubernetes-specific dashboards

## ⏱️ Estimated Time
60-75 minutes

## 📋 Prerequisites

- Completed Lab 1.1 (Prometheus Installation)
- Completed Lab 2.1 (PromQL Basics)
- Running Kubernetes cluster with Prometheus
- Basic understanding of Kubernetes resources

---

## 🏗️ Kubernetes Monitoring Architecture

```
┌──────────────────────────────────────────────────────────────┐
│         Kubernetes Cluster Monitoring Stack                  │
└──────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Prometheus Server                                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Service Discovery                                   │  │
│  │  • Kubernetes API integration                        │  │
│  │  • Auto-discovers targets                            │  │
│  └──────────────────────────────────────────────────────┘  │
│         ↓          ↓          ↓          ↓                  │
└─────────────────────────────────────────────────────────────┘
     │          │          │          │
     ▼          ▼          ▼          ▼
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────────┐
│ kubelet │ │  Pods   │ │ Services│ │ kube-state-     │
│ /metrics│ │/metrics │ │/metrics │ │ metrics         │
└─────────┘ └─────────┘ └─────────┘ └─────────────────┘
    │           │           │              │
    ▼           ▼           ▼              ▼
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────────┐
│ Node    │ │Container│ │ App     │ │ K8s Object      │
│ Metrics │ │ Metrics │ │ Metrics │ │ State Metrics   │
└─────────┘ └─────────┘ └─────────┘ └─────────────────┘

Metric Sources:
  • kubelet: Container & node metrics (cAdvisor)
  • kube-state-metrics: K8s object state
  • node-exporter: Host-level metrics
  • Application pods: Custom /metrics endpoints
```

---

## 📝 Part 1: Understanding Kubernetes Metrics Sources

### Step 1.1: Explore kube-state-metrics

**What is kube-state-metrics?**
- Generates metrics about Kubernetes objects
- Watches Kubernetes API
- Exposes object state as Prometheus metrics

```bash
# Check kube-state-metrics pod
kubectl get pods -n monitoring | grep kube-state-metrics
```

**Expected Output:**
```
prometheus-kube-state-metrics-7d4b7b9c4d-xxxxx   1/1     Running   0          1h
```

```bash
# Port forward to kube-state-metrics
kubectl port-forward -n monitoring \
  svc/prometheus-kube-state-metrics 8080:8080
```

```bash
# View available metrics
curl http://localhost:8080/metrics | grep "^kube_" | head -20
```

**Expected Output:**
```
kube_pod_info{namespace="default",pod="nginx-xxx",...} 1
kube_pod_status_phase{namespace="default",pod="nginx-xxx",phase="Running"} 1
kube_deployment_status_replicas{deployment="nginx"} 3
kube_deployment_status_replicas_available{deployment="nginx"} 3
kube_node_info{node="node1",...} 1
kube_node_status_condition{node="node1",condition="Ready",status="true"} 1
```

**💡 Metric Categories:**
```
┌─────────────────────────────────────────────────────────┐
│ Category        │ Examples                             │
├─────────────────────────────────────────────────────────┤
│ Pods            │ kube_pod_status_phase                │
│ Deployments     │ kube_deployment_status_replicas      │
│ Nodes           │ kube_node_status_condition           │
│ Services        │ kube_service_info                    │
│ ConfigMaps      │ kube_configmap_info                  │
│ Secrets         │ kube_secret_info                     │
│ PVCs            │ kube_persistentvolumeclaim_info      │
└─────────────────────────────────────────────────────────┘
```

### Step 1.2: Explore Kubelet Metrics

```bash
# Kubelet exposes metrics via Prometheus
# Already scraped by Prometheus

# In Prometheus UI (localhost:9090), query:
```

**Query: Container CPU usage**
```promql
container_cpu_usage_seconds_total
```

**Query: Container memory usage**
```promql
container_memory_usage_bytes
```

**💡 Kubelet Metrics:**
- Collected from cAdvisor (Container Advisor)
- Per-container resource usage
- Real-time performance data

---

## 📝 Part 2: Monitoring Pods and Containers

### Step 2.1: Pod Status Monitoring

**Query: Pods by phase**
```promql
count by (phase) (kube_pod_status_phase)
```

**Expected Result:**
```
{phase="Running"} 25
{phase="Pending"} 2
{phase="Failed"} 0
```

**Query: Pods not running**
```promql
kube_pod_status_phase{phase!="Running"}
```

**Query: Pod restart count**
```promql
kube_pod_container_status_restarts_total
```

**Expected Result:**
```
{namespace="default",pod="nginx-xxx",container="nginx"} 0
{namespace="app",pod="api-xxx",container="api"} 3
```

**💡 High restart count indicates problems!**

### Step 2.2: Container Resource Usage

**Query: Top 5 pods by CPU**
```promql
topk(5, 
  sum by (namespace, pod) (
    rate(container_cpu_usage_seconds_total{container!=""}[5m])
  )
)
```

**Expected Result:**
```
{namespace="monitoring",pod="prometheus-xxx"} 0.25
{namespace="default",pod="nginx-xxx"} 0.15
{namespace="app",pod="api-xxx"} 0.12
```

**Query: Top 5 pods by memory**
```promql
topk(5,
  sum by (namespace, pod) (
    container_memory_usage_bytes{container!=""}
  )
)
```

**Query: Memory usage vs limits**
```promql
sum by (namespace, pod) (container_memory_usage_bytes{container!=""})
/
sum by (namespace, pod) (container_spec_memory_limit_bytes{container!=""})
* 100
```

**Expected Result:**
```
{namespace="default",pod="nginx-xxx"} 45.5
{namespace="app",pod="api-xxx"} 78.2
```

**💡 Values > 90% indicate memory pressure**

---

## 📝 Part 3: Deployment and ReplicaSet Monitoring

### Step 3.1: Deployment Health

**Query: Deployments with unavailable replicas**
```promql
kube_deployment_status_replicas_unavailable > 0
```

**Expected Result:**
```
{deployment="api",namespace="app"} 1
```

**Query: Deployment replica status**
```promql
kube_deployment_status_replicas_available
/
kube_deployment_spec_replicas
```

**Expected Result:**
```
{deployment="nginx",namespace="default"} 1.0
{deployment="api",namespace="app"} 0.66
```

**💡 1.0 = healthy, < 1.0 = some replicas down**

### Step 3.2: ReplicaSet Monitoring

**Query: Desired vs current replicas**
```promql
kube_replicaset_spec_replicas
!=
kube_replicaset_status_ready_replicas
```

**Query: ReplicaSets with mismatched replicas**
```promql
(kube_replicaset_spec_replicas - kube_replicaset_status_ready_replicas) != 0
```

---

## 📝 Part 4: Node Monitoring

### Step 4.1: Node Status

**Query: Node conditions**
```promql
kube_node_status_condition
```

**Expected Result:**
```
{condition="Ready",node="node1",status="true"} 1
{condition="MemoryPressure",node="node1",status="false"} 1
{condition="DiskPressure",node="node1",status="false"} 1
{condition="PIDPressure",node="node1",status="false"} 1
```

**Query: Nodes not ready**
```promql
kube_node_status_condition{condition="Ready",status="false"}
```

**Query: Nodes with pressure**
```promql
kube_node_status_condition{condition=~".*Pressure",status="true"}
```

### Step 4.2: Node Capacity

**Query: Allocatable CPU**
```promql
kube_node_status_allocatable{resource="cpu"}
```

**Query: CPU allocation percentage**
```promql
sum by (node) (kube_pod_container_resource_requests{resource="cpu"})
/
kube_node_status_allocatable{resource="cpu"}
* 100
```

**Expected Result:**
```
{node="node1"} 65.5
{node="node2"} 42.3
```

**💡 > 80% means node is heavily utilized**

---

## 📝 Part 5: Creating ServiceMonitors

### Step 5.1: Deploy Sample Application

```bash
# Create a simple app that exposes metrics
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sample-app
  namespace: default
  labels:
    app: sample-app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: sample-app
  template:
    metadata:
      labels:
        app: sample-app
    spec:
      containers:
      - name: app
        image: quay.io/brancz/prometheus-example-app:v0.3.0
        ports:
        - containerPort: 8080
          name: metrics
---
apiVersion: v1
kind: Service
metadata:
  name: sample-app
  namespace: default
  labels:
    app: sample-app
spec:
  selector:
    app: sample-app
  ports:
  - port: 8080
    name: metrics
EOF
```

**Expected Output:**
```
deployment.apps/sample-app created
service/sample-app created
```

**💡 This app exposes metrics on port 8080**

### Step 5.2: Create ServiceMonitor

```bash
cat <<EOF | kubectl apply -f -
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: sample-app
  namespace: default
  labels:
    app: sample-app
spec:
  selector:
    matchLabels:
      app: sample-app
  endpoints:
  - port: metrics
    interval: 30s
    path: /metrics
EOF
```

**Expected Output:**
```
servicemonitor.monitoring.coreos.com/sample-app created
```

**💡 ServiceMonitor tells Prometheus to scrape this service**

### Step 5.3: Verify Scraping

**Wait 30 seconds, then in Prometheus UI:**

**Query:**
```promql
up{job="sample-app"}
```

**Expected Result:**
```
up{job="sample-app",instance="10.244.0.5:8080"} 1
up{job="sample-app",instance="10.244.0.6:8080"} 1
```

**Query app metrics:**
```promql
http_requests_total{job="sample-app"}
```

**💡 Your app metrics are now in Prometheus!**

---

## 📝 Part 6: Resource Quota Monitoring

### Step 6.1: Create ResourceQuota

```bash
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ResourceQuota
metadata:
  name: compute-quota
  namespace: default
spec:
  hard:
    requests.cpu: "4"
    requests.memory: 8Gi
    limits.cpu: "8"
    limits.memory: 16Gi
    pods: "10"
EOF
```

### Step 6.2: Monitor Quota Usage

**Query: Quota usage**
```promql
kube_resourcequota
```

**Query: Quota utilization percentage**
```promql
kube_resourcequota{type="used"}
/
kube_resourcequota{type="hard"}
* 100
```

**Expected Result:**
```
{namespace="default",resource="requests.cpu"} 50.0
{namespace="default",resource="requests.memory"} 37.5
```

---

## 📝 Part 7: Creating Kubernetes Dashboard

### Step 7.1: Dashboard Queries

**Create a dashboard with these panels:**

**Panel 1: Cluster Overview**
```promql
# Total nodes
count(kube_node_info)

# Total pods
count(kube_pod_info)

# Total namespaces
count(kube_namespace_created)
```

**Panel 2: Pod Status**
```promql
# Pods by phase
sum by (phase) (kube_pod_status_phase)
```

**Panel 3: CPU Usage**
```promql
# Cluster CPU usage
sum(rate(container_cpu_usage_seconds_total{container!=""}[5m]))

# Per namespace
sum by (namespace) (rate(container_cpu_usage_seconds_total{container!=""}[5m]))
```

**Panel 4: Memory Usage**
```promql
# Cluster memory
sum(container_memory_usage_bytes{container!=""})

# Per namespace
sum by (namespace) (container_memory_usage_bytes{container!=""})
```

**Panel 5: Network I/O**
```promql
# Network receive
sum(rate(container_network_receive_bytes_total[5m]))

# Network transmit
sum(rate(container_network_transmit_bytes_total[5m]))
```

---

## ✅ Validation Steps

```bash
# 1. Verify kube-state-metrics is running
kubectl get pods -n monitoring | grep kube-state-metrics

# 2. Check ServiceMonitors
kubectl get servicemonitors -n monitoring

# 3. Verify targets in Prometheus
# Open http://localhost:9090/targets

# 4. Test queries return data
# Run queries in Prometheus UI

# 5. Check sample app is scraped
kubectl get servicemonitor -n default sample-app
```

---

## 🧹 Cleanup

```bash
# Remove sample app
kubectl delete deployment sample-app -n default
kubectl delete service sample-app -n default
kubectl delete servicemonitor sample-app -n default

# Remove resource quota
kubectl delete resourcequota compute-quota -n default
```

---

## 🎯 Challenge Tasks

1. **Create PodMonitor**
   - Monitor pods directly (not via Service)
   - Use label selectors
   - Scrape custom port

2. **Alert Rules**
   - Create alert for high pod restarts
   - Alert on deployment unavailability
   - Alert on node not ready

3. **Advanced Queries**
   - Calculate pod density per node
   - Find pods without resource limits
   - Track deployment rollout duration

---

## 🐛 Troubleshooting

### Issue: ServiceMonitor not working

**Solution:**
```bash
# Check ServiceMonitor exists
kubectl get servicemonitor -n <namespace>

# Verify selector matches service labels
kubectl get svc <service-name> -n <namespace> --show-labels

# Check Prometheus operator logs
kubectl logs -n monitoring <prometheus-operator-pod>

# Verify Prometheus configuration
# In Prometheus UI: Status → Configuration
```

### Issue: No metrics from application

**Solution:**
```bash
# Test metrics endpoint directly
kubectl port-forward svc/<service-name> 8080:8080
curl http://localhost:8080/metrics

# Check service endpoints
kubectl get endpoints <service-name> -n <namespace>

# Verify pod labels match service selector
kubectl get pods -n <namespace> --show-labels
```

---

## 📚 Key Takeaways

✅ **kube-state-metrics** provides K8s object state  
✅ **kubelet** provides container metrics  
✅ **ServiceMonitors** define scrape configs  
✅ **Pod metrics** track resource usage  
✅ **Node metrics** monitor cluster capacity  
✅ **Deployment metrics** track application health  
✅ **ResourceQuotas** can be monitored  
✅ **Custom apps** can expose /metrics  

---

## 📖 Next Steps

Continue to [Lab 4.1: Creating Alert Rules](lab-4.1-alert-rules.md)

---

## 📝 Lab Completion Checklist

- [ ] Explored kube-state-metrics
- [ ] Monitored pod and container metrics
- [ ] Tracked deployment health
- [ ] Monitored node status and capacity
- [ ] Created ServiceMonitor
- [ ] Verified custom app scraping
- [ ] Created Kubernetes dashboard
- [ ] Monitored resource quotas
- [ ] Completed challenge tasks

**Congratulations! You've mastered Kubernetes monitoring with Prometheus!** 🎉
