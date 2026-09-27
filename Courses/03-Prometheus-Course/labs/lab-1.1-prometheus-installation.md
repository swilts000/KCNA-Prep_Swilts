# Lab 1.1: Installing Prometheus on Kubernetes

## 📚 Related Topics
- Monitoring fundamentals
- Kubernetes deployments
- Service discovery
- Time-series databases

## 🎯 Learning Objectives

By the end of this lab, you will be able to:
- Install Prometheus using Helm
- Understand Prometheus architecture
- Configure Prometheus for Kubernetes monitoring
- Access the Prometheus web UI
- Understand basic Prometheus concepts (metrics, targets, scraping)

## ⏱️ Estimated Time
45-60 minutes

## 📋 Prerequisites

- Running Kubernetes cluster (minikube or cloud)
- kubectl configured
- Helm 3.x installed
- Basic understanding of Kubernetes resources

---

## 🏗️ Prometheus Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                  Prometheus Architecture                     │
└──────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Kubernetes Cluster                                         │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Prometheus Server                                   │  │
│  │                                                      │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐   │  │
│  │  │  Retrieval │→ │   TSDB     │→ │  HTTP      │   │  │
│  │  │  (Scraper) │  │  (Storage) │  │  Server    │   │  │
│  │  └────────────┘  └────────────┘  └────────────┘   │  │
│  │        ↓                                            │  │
│  │  Service Discovery                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│         ↓                                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Targets (Things to Monitor)                        │  │
│  │                                                      │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐         │  │
│  │  │  Pods    │  │ Services │  │  Nodes   │         │  │
│  │  │ /metrics │  │ /metrics │  │ /metrics │         │  │
│  │  └──────────┘  └──────────┘  └──────────┘         │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Exporters (Expose Metrics)                         │  │
│  │  • node-exporter (host metrics)                     │  │
│  │  • kube-state-metrics (K8s object metrics)          │  │
│  │  • Custom exporters                                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

External Access:
  ┌──────────────┐
  │   Browser    │ → http://prometheus:9090
  └──────────────┘
```

**Key Components:**
- **Prometheus Server**: Scrapes and stores metrics
- **TSDB**: Time-series database for metric storage
- **Service Discovery**: Automatically finds targets
- **Exporters**: Expose metrics from systems
- **HTTP Server**: Web UI and API

---

## 📝 Part 1: Understanding Prometheus Concepts

### Step 1.1: What is Prometheus?

**Prometheus** is an open-source monitoring and alerting system designed for reliability and scalability.

**Key Features:**
```
┌─────────────────────────────────────────────────────────┐
│ Feature              │ Description                      │
├─────────────────────────────────────────────────────────┤
│ Multi-dimensional    │ Metrics with labels (key-value)  │
│ PromQL               │ Powerful query language          │
│ Pull-based           │ Scrapes metrics from targets     │
│ Service Discovery    │ Auto-discovers targets           │
│ Time-series DB       │ Efficient metric storage         │
│ Alerting             │ Built-in alert manager           │
└─────────────────────────────────────────────────────────┘
```

**💡 Prometheus vs Traditional Monitoring:**
- **Pull Model**: Prometheus scrapes targets (vs push)
- **Labels**: Multi-dimensional data (vs hierarchical)
- **PromQL**: Powerful queries (vs simple aggregations)
- **Cloud-Native**: Built for dynamic environments

### Step 1.2: Metric Types

```
┌──────────────────────────────────────────────────────────┐
│ Metric Type  │ Description          │ Example           │
├──────────────────────────────────────────────────────────┤
│ Counter      │ Only increases       │ http_requests     │
│ Gauge        │ Can go up/down       │ memory_usage      │
│ Histogram    │ Observations         │ request_duration  │
│ Summary      │ Similar to histogram │ response_size     │
└──────────────────────────────────────────────────────────┘
```

**Example Metric:**
```
http_requests_total{method="GET", endpoint="/api", status="200"} 1234
│                    │                                         │
│                    └─ Labels (dimensions)                    │
└─ Metric name                                Value ──────────┘
```

---

## 📝 Part 2: Installing Prometheus with Helm

### Step 2.1: Add Prometheus Helm Repository

```bash
# Add the Prometheus community Helm repository
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
```

**Expected Output:**
```
"prometheus-community" has been added to your repositories
```

**💡 What Happened:**
- Added Prometheus chart repository
- Repository contains multiple Prometheus-related charts
- Charts are maintained by the Prometheus community

```bash
# Update repository index
helm repo update
```

**Expected Output:**
```
Hang tight while we grab the latest from your chart repositories...
...Successfully got an update from the "prometheus-community" chart repository
Update Complete. ⎈Happy Helming!⎈
```

### Step 2.2: Search for Prometheus Charts

```bash
# Search for available Prometheus charts
helm search repo prometheus
```

**Expected Output:**
```
NAME                                              CHART VERSION   APP VERSION
prometheus-community/kube-prometheus-stack        51.0.3          v0.68.0
prometheus-community/prometheus                   25.3.1          v2.47.0
prometheus-community/prometheus-adapter           4.7.0           v0.11.1
prometheus-community/prometheus-blackbox-exporter 8.2.0           v0.24.0
prometheus-community/prometheus-node-exporter     4.23.2          v1.6.1
```

**💡 Chart Options:**
- **kube-prometheus-stack**: Complete monitoring stack (Prometheus + Grafana + Alertmanager)
- **prometheus**: Standalone Prometheus
- **prometheus-node-exporter**: Host metrics
- **kube-state-metrics**: Kubernetes object metrics

### Step 2.3: Inspect the Chart

```bash
# Show chart information
helm show chart prometheus-community/kube-prometheus-stack
```

**Expected Output:**
```yaml
apiVersion: v2
appVersion: v0.68.0
dependencies:
- condition: kubeStateMetrics.enabled
  name: kube-state-metrics
  repository: https://prometheus-community.github.io/helm-charts
  version: 5.12.*
- condition: nodeExporter.enabled
  name: prometheus-node-exporter
  repository: https://prometheus-community.github.io/helm-charts
  version: 4.23.*
- condition: grafana.enabled
  name: grafana
  repository: https://grafana.github.io/helm-charts
  version: 6.60.*
description: kube-prometheus-stack collects Kubernetes manifests, Grafana dashboards,
  and Prometheus rules
name: kube-prometheus-stack
version: 51.0.3
```

**💡 Stack Includes:**
- Prometheus Operator
- Prometheus Server
- Alertmanager
- Grafana
- kube-state-metrics
- node-exporter

```bash
# Show default values (first 50 lines)
helm show values prometheus-community/kube-prometheus-stack | head -50
```

**Expected Output:**
```yaml
## Provide a name in place of kube-prometheus-stack for `app:` labels
##
nameOverride: ""

## Override the deployment namespace
##
namespaceOverride: ""

## Provide a k8s version to auto dashboard import script example: kubeTargetVersionOverride: 1.16.6
##
kubeTargetVersionOverride: ""

## Allow kubeVersion to be overridden while creating the ingress
##
kubeVersionOverride: ""

## Provide a name to substitute for the full names of resources
##
fullnameOverride: ""

## Labels to apply to all resources
##
commonLabels: {}

## Create default rules for monitoring the cluster
##
defaultRules:
  create: true
  rules:
    alertmanager: true
    etcd: true
    configReloaders: true
    general: true
    k8s: true
    kubeApiserverAvailability: true
```

---

## 📝 Part 3: Installing Prometheus Stack

### Step 3.1: Create Namespace

```bash
# Create monitoring namespace
kubectl create namespace monitoring
```

**Expected Output:**
```
namespace/monitoring created
```

**💡 Why Separate Namespace:**
- Isolates monitoring resources
- Easier to manage and secure
- Clear separation of concerns

```bash
# Verify namespace
kubectl get namespaces
```

**Expected Output:**
```
NAME              STATUS   AGE
default           Active   5d
kube-system       Active   5d
kube-public       Active   5d
kube-node-lease   Active   5d
monitoring        Active   10s
```

### Step 3.2: Install Prometheus Stack

```bash
# Install kube-prometheus-stack
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false
```

**Expected Output:**
```
NAME: prometheus
LAST DEPLOYED: Sun Sep 27 12:00:00 2026
NAMESPACE: monitoring
STATUS: deployed
REVISION: 1
NOTES:
kube-prometheus-stack has been installed. Check its status by running:
  kubectl --namespace monitoring get pods -l "release=prometheus"

Visit https://github.com/prometheus-operator/kube-prometheus for instructions on how
to create & configure Alertmanager and Prometheus instances using the Operator.
```

**💡 Installation Breakdown:**
- **--namespace monitoring**: Install in monitoring namespace
- **--set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false**: 
  Allows Prometheus to discover all ServiceMonitors (not just ones created by this Helm release)

**What Gets Installed:**
```
Components:
  ✓ Prometheus Operator
  ✓ Prometheus Server
  ✓ Alertmanager
  ✓ Grafana
  ✓ kube-state-metrics
  ✓ node-exporter (DaemonSet)
  ✓ Default dashboards
  ✓ Default alert rules
```

### Step 3.3: Verify Installation

```bash
# Check all pods in monitoring namespace
kubectl get pods -n monitoring
```

**Expected Output:**
```
NAME                                                     READY   STATUS    RESTARTS   AGE
alertmanager-prometheus-kube-prometheus-alertmanager-0   2/2     Running   0          2m
prometheus-grafana-7d4b7b9c4d-xxxxx                     3/3     Running   0          2m
prometheus-kube-prometheus-operator-7d4b7b9c4d-xxxxx    1/1     Running   0          2m
prometheus-kube-state-metrics-7d4b7b9c4d-xxxxx          1/1     Running   0          2m
prometheus-prometheus-kube-prometheus-prometheus-0       2/2     Running   0          2m
prometheus-prometheus-node-exporter-xxxxx                1/1     Running   0          2m
```

**💡 Pod Breakdown:**
- **alertmanager**: Handles alerts
- **grafana**: Visualization dashboard
- **operator**: Manages Prometheus resources
- **kube-state-metrics**: K8s object metrics
- **prometheus**: Main Prometheus server
- **node-exporter**: Host/node metrics (runs on each node)

```bash
# Check services
kubectl get svc -n monitoring
```

**Expected Output:**
```
NAME                                      TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)
alertmanager-operated                     ClusterIP   None            <none>        9093/TCP,9094/TCP,9094/UDP
prometheus-grafana                        ClusterIP   10.96.123.45    <none>        80/TCP
prometheus-kube-prometheus-alertmanager   ClusterIP   10.96.123.46    <none>        9093/TCP
prometheus-kube-prometheus-operator       ClusterIP   10.96.123.47    <none>        443/TCP
prometheus-kube-prometheus-prometheus     ClusterIP   10.96.123.48    <none>        9090/TCP
prometheus-kube-state-metrics             ClusterIP   10.96.123.49    <none>        8080/TCP
prometheus-operated                       ClusterIP   None            <none>        9090/TCP
prometheus-prometheus-node-exporter       ClusterIP   10.96.123.50    <none>        9100/TCP
```

**💡 Service Ports:**
- **9090**: Prometheus web UI
- **9093**: Alertmanager
- **80**: Grafana
- **9100**: Node exporter metrics
- **8080**: kube-state-metrics

```bash
# Check StatefulSets and Deployments
kubectl get statefulsets,deployments -n monitoring
```

**Expected Output:**
```
NAME                                                            READY   AGE
statefulset.apps/alertmanager-prometheus-kube-prometheus-alertmanager   1/1     3m
statefulset.apps/prometheus-prometheus-kube-prometheus-prometheus       1/1     3m

NAME                                                  READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/prometheus-grafana                    1/1     1            1           3m
deployment.apps/prometheus-kube-prometheus-operator   1/1     1            1           3m
deployment.apps/prometheus-kube-state-metrics         1/1     1            1           3m
```

---

## 📝 Part 4: Accessing Prometheus

### Step 4.1: Port Forward to Prometheus

```bash
# Forward local port to Prometheus service
kubectl port-forward -n monitoring svc/prometheus-kube-prometheus-prometheus 9090:9090
```

**Expected Output:**
```
Forwarding from 127.0.0.1:9090 -> 9090
Forwarding from [::1]:9090 -> 9090
```

**💡 Port Forwarding:**
- Makes Prometheus accessible on localhost:9090
- Runs in foreground (Ctrl+C to stop)
- For production, use Ingress or LoadBalancer

**Open in browser:**
```
http://localhost:9090
```

### Step 4.2: Explore Prometheus UI

**Main Sections:**
```
┌─────────────────────────────────────────────────────────┐
│ Prometheus UI                                           │
├─────────────────────────────────────────────────────────┤
│ • Graph: Query and visualize metrics                    │
│ • Alerts: View active alerts                            │
│ • Status:                                               │
│   - Targets: Monitored endpoints                        │
│   - Service Discovery: Auto-discovered targets          │
│   - Configuration: Prometheus config                    │
│   - Rules: Alert and recording rules                    │
│   - TSDB Status: Database statistics                    │
└─────────────────────────────────────────────────────────┘
```

**Navigate to Status → Targets:**

**Expected View:**
```
Targets showing:
  ✓ kubernetes-apiservers (1/1 up)
  ✓ kubernetes-nodes (3/3 up)
  ✓ kubernetes-pods (15/15 up)
  ✓ kubernetes-service-endpoints (8/8 up)
```

**💡 Targets:**
- Each target is a metrics endpoint
- Prometheus scrapes these regularly
- Green = healthy, Red = down

### Step 4.3: Run Your First Query

In the Prometheus UI, go to **Graph** tab.

**Query 1: Check Prometheus is scraping itself**
```promql
up
```

**Expected Result:**
```
up{instance="10.244.0.5:9090", job="prometheus"} 1
up{instance="10.244.0.6:9100", job="node-exporter"} 1
up{instance="10.244.0.7:8080", job="kube-state-metrics"} 1
```

**💡 Explanation:**
- `up` is a special metric (1 = target is up, 0 = down)
- Shows all scraped targets
- Labels show instance and job

**Query 2: Count running pods**
```promql
kube_pod_status_phase{phase="Running"}
```

**Expected Result:**
```
kube_pod_status_phase{namespace="default", phase="Running", pod="nginx-xxx"} 1
kube_pod_status_phase{namespace="monitoring", phase="Running", pod="prometheus-xxx"} 1
```

**Query 3: Node CPU usage**
```promql
node_cpu_seconds_total
```

**Expected Result:**
```
node_cpu_seconds_total{cpu="0", mode="idle"} 123456.78
node_cpu_seconds_total{cpu="0", mode="system"} 1234.56
node_cpu_seconds_total{cpu="0", mode="user"} 2345.67
```

---

## 📝 Part 5: Understanding Prometheus Configuration

### Step 5.1: View Prometheus Configuration

```bash
# Get Prometheus ConfigMap
kubectl get configmap -n monitoring prometheus-prometheus-kube-prometheus-prometheus-rulefiles-0 -o yaml
```

**💡 Configuration Sources:**
- Prometheus Operator manages configuration
- ServiceMonitors define scrape configs
- ConfigMaps store rules and configs

### Step 5.2: Check ServiceMonitors

```bash
# List ServiceMonitors
kubectl get servicemonitors -n monitoring
```

**Expected Output:**
```
NAME                                                 AGE
prometheus-kube-prometheus-alertmanager              10m
prometheus-kube-prometheus-apiserver                 10m
prometheus-kube-prometheus-kube-state-metrics        10m
prometheus-kube-prometheus-kubelet                   10m
prometheus-kube-prometheus-node-exporter             10m
prometheus-kube-prometheus-operator                  10m
prometheus-kube-prometheus-prometheus                10m
```

**💡 ServiceMonitors:**
- CRD (Custom Resource Definition) from Prometheus Operator
- Defines how to scrape a service
- Automatically creates scrape configs

```bash
# Describe a ServiceMonitor
kubectl describe servicemonitor prometheus-kube-prometheus-kube-state-metrics -n monitoring
```

**Expected Output:**
```yaml
Name:         prometheus-kube-prometheus-kube-state-metrics
Namespace:    monitoring
Labels:       app=kube-state-metrics
              app.kubernetes.io/instance=prometheus
Spec:
  Endpoints:
    Port:  http
  Selector:
    Match Labels:
      app.kubernetes.io/instance:  prometheus
      app.kubernetes.io/name:      kube-state-metrics
```

---

## 📝 Part 6: Exploring Metrics

### Step 6.1: Node Metrics

```bash
# Port forward to node-exporter (in new terminal)
kubectl port-forward -n monitoring daemonset/prometheus-prometheus-node-exporter 9100:9100
```

**Access metrics endpoint:**
```bash
curl http://localhost:9100/metrics | head -20
```

**Expected Output:**
```
# HELP node_cpu_seconds_total Seconds the CPUs spent in each mode.
# TYPE node_cpu_seconds_total counter
node_cpu_seconds_total{cpu="0",mode="idle"} 123456.78
node_cpu_seconds_total{cpu="0",mode="iowait"} 123.45
node_cpu_seconds_total{cpu="0",mode="irq"} 0
node_cpu_seconds_total{cpu="0",mode="nice"} 12.34
node_cpu_seconds_total{cpu="0",mode="softirq"} 234.56
node_cpu_seconds_total{cpu="0",mode="steal"} 0
node_cpu_seconds_total{cpu="0",mode="system"} 1234.56
node_cpu_seconds_total{cpu="0",mode="user"} 2345.67
# HELP node_memory_MemAvailable_bytes Memory information field MemAvailable_bytes.
# TYPE node_memory_MemAvailable_bytes gauge
node_memory_MemAvailable_bytes 3.2e+09
# HELP node_memory_MemFree_bytes Memory information field MemFree_bytes.
# TYPE node_memory_MemFree_bytes gauge
node_memory_MemFree_bytes 1.5e+09
```

**💡 Metric Format:**
- `# HELP`: Metric description
- `# TYPE`: Metric type (counter, gauge, etc.)
- Metric line: name{labels} value

### Step 6.2: Kubernetes Metrics

```bash
# Port forward to kube-state-metrics
kubectl port-forward -n monitoring svc/prometheus-kube-state-metrics 8080:8080
```

```bash
# View Kubernetes object metrics
curl http://localhost:8080/metrics | grep kube_pod_info | head -5
```

**Expected Output:**
```
kube_pod_info{namespace="default",pod="nginx-xxx",pod_ip="10.244.0.5"} 1
kube_pod_info{namespace="monitoring",pod="prometheus-xxx",pod_ip="10.244.0.6"} 1
```

---

## ✅ Validation Steps

### Comprehensive Validation

```bash
# 1. Verify all pods are running
kubectl get pods -n monitoring

# 2. Check Prometheus targets
# Open http://localhost:9090/targets (with port-forward active)

# 3. Run test queries in Prometheus UI
# Query: up
# Query: kube_pod_status_phase

# 4. Verify metrics are being collected
# Query: rate(container_cpu_usage_seconds_total[5m])

# 5. Check Prometheus storage
kubectl exec -n monitoring prometheus-prometheus-kube-prometheus-prometheus-0 -c prometheus -- df -h /prometheus
```

**Expected Output:**
```
Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1        50G  2.1G   48G   5% /prometheus
```

---

## 🧹 Cleanup (Optional)

```bash
# Uninstall Prometheus stack
helm uninstall prometheus -n monitoring

# Delete namespace
kubectl delete namespace monitoring
```

---

## 🎯 Challenge Tasks

1. **Custom ServiceMonitor**
   ```bash
   # Create a ServiceMonitor for your own application
   # Deploy a sample app that exposes /metrics
   ```

2. **Query Practice**
   ```promql
   # Find pods using most memory
   topk(5, container_memory_usage_bytes)
   
   # Calculate CPU usage rate
   rate(node_cpu_seconds_total{mode="user"}[5m])
   ```

3. **Explore Grafana**
   ```bash
   # Port forward to Grafana
   kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80
   
   # Access: http://localhost:3000
   # Default credentials: admin / prom-operator
   ```

---

## 🐛 Troubleshooting

### Issue: Pods not starting

**Error:** `ImagePullBackOff` or `CrashLoopBackOff`

**Solution:**
```bash
# Check pod logs
kubectl logs -n monitoring <pod-name>

# Describe pod for events
kubectl describe pod -n monitoring <pod-name>

# Check resource constraints
kubectl top nodes
```

### Issue: Targets showing as down

**Error:** Targets show red in Prometheus UI

**Solution:**
```bash
# Check if target pods are running
kubectl get pods -n <target-namespace>

# Verify service endpoints
kubectl get endpoints -n <target-namespace>

# Check ServiceMonitor configuration
kubectl get servicemonitor -n monitoring
```

### Issue: No metrics appearing

**Solution:**
```bash
# Verify Prometheus is scraping
# In Prometheus UI: Status → Configuration

# Check if ServiceMonitor selector matches
kubectl get servicemonitor -n monitoring -o yaml

# Verify service labels match ServiceMonitor selector
kubectl get svc -n <namespace> --show-labels
```

---

## 📚 Key Takeaways

✅ **Prometheus** is a pull-based monitoring system  
✅ **kube-prometheus-stack** includes Prometheus, Grafana, and exporters  
✅ **ServiceMonitors** define what to scrape  
✅ **Metrics** have names and labels (multi-dimensional)  
✅ **Targets** are endpoints Prometheus scrapes  
✅ **PromQL** is used to query metrics  
✅ **Exporters** expose metrics from systems  
✅ **Time-series database** stores metric history  

---

## 📖 Next Steps

Continue to [Lab 1.2: Understanding Prometheus Metrics and Labels](lab-1.2-prometheus-metrics-labels.md) to dive deeper into the Prometheus data model.

---

## 📝 Lab Completion Checklist

- [ ] Installed Prometheus using Helm
- [ ] Verified all pods are running
- [ ] Accessed Prometheus UI
- [ ] Explored targets and service discovery
- [ ] Ran basic PromQL queries
- [ ] Viewed raw metrics endpoints
- [ ] Understood Prometheus architecture
- [ ] Explored ServiceMonitors
- [ ] Completed challenge tasks

**Congratulations! You've successfully installed and explored Prometheus!** 🎉
