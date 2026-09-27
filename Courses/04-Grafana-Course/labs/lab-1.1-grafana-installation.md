# Lab 1.1: Installing Grafana and First Dashboard

## 📚 Related Topics
- Data visualization
- Dashboard creation
- Prometheus integration
- Monitoring best practices

## 🎯 Learning Objectives

By the end of this lab, you will be able to:
- Install Grafana on Kubernetes
- Access the Grafana web interface
- Connect Prometheus as a data source
- Create your first dashboard
- Understand Grafana panels and visualizations
- Import pre-built dashboards

## ⏱️ Estimated Time
45-60 minutes

## 📋 Prerequisites

- Running Kubernetes cluster
- Prometheus installed (Lab 03-1.1)
- kubectl and Helm configured
- Basic understanding of metrics

---

## 🏗️ Grafana Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                  Grafana Architecture                        │
└──────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  User Browser                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Grafana UI (http://grafana:3000)                    │  │
│  │  • Dashboards                                        │  │
│  │  • Panels (graphs, tables, gauges)                   │  │
│  │  • Alerts                                            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  Grafana Server (Kubernetes Pod)                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Grafana Backend                                     │  │
│  │  • Query Engine                                      │  │
│  │  │  Dashboard Storage (SQLite/PostgreSQL)             │  │
│  │  • Alerting Engine                                   │  │
│  │  • Plugin System                                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  Data Sources                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │Prometheus│  │  Loki    │  │ Elastic  │  │  MySQL   │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Key Components:**
- **Grafana Server**: Web application
- **Data Sources**: Where metrics come from
- **Dashboards**: Collections of panels
- **Panels**: Individual visualizations
- **Queries**: Fetch data from sources

---

## 📝 Part 1: Installing Grafana

### Step 1.1: Check if Grafana is Already Installed

If you installed `kube-prometheus-stack` in Lab 03-1.1, Grafana is already included!

```bash
# Check for Grafana pod
kubectl get pods -n monitoring | grep grafana
```

**Expected Output:**
```
prometheus-grafana-7d4b7b9c4d-xxxxx   3/3     Running   0          1h
```

**If Grafana exists**, skip to Part 2. **If not**, continue with standalone installation.

### Step 1.2: Standalone Grafana Installation

```bash
# Add Grafana Helm repository
helm repo add grafana https://grafana.github.io/helm-charts
```

**Expected Output:**
```
"grafana" has been added to your repositories
```

```bash
# Update repository
helm repo update
```

```bash
# Install Grafana
helm install grafana grafana/grafana \
  --namespace monitoring \
  --create-namespace \
  --set persistence.enabled=true \
  --set persistence.size=10Gi \
  --set adminPassword=admin123
```

**Expected Output:**
```
NAME: grafana
LAST DEPLOYED: Sun Sep 27 12:30:00 2026
NAMESPACE: monitoring
STATUS: deployed
REVISION: 1
NOTES:
1. Get your 'admin' user password by running:

   kubectl get secret --namespace monitoring grafana -o jsonpath="{.data.admin-password}" | base64 --decode ; echo

2. The Grafana server can be accessed via port 80 on the following DNS name from within your cluster:

   grafana.monitoring.svc.cluster.local
```

**💡 Installation Options:**
- `--set persistence.enabled=true`: Save dashboards permanently
- `--set persistence.size=10Gi`: 10GB storage for dashboards
- `--set adminPassword=admin123`: Set admin password

### Step 1.3: Verify Installation

```bash
# Check Grafana pod
kubectl get pods -n monitoring -l app.kubernetes.io/name=grafana
```

**Expected Output:**
```
NAME                       READY   STATUS    RESTARTS   AGE
grafana-7d4b7b9c4d-xxxxx   1/1     Running   0          2m
```

```bash
# Check Grafana service
kubectl get svc -n monitoring -l app.kubernetes.io/name=grafana
```

**Expected Output:**
```
NAME      TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)   AGE
grafana   ClusterIP   10.96.123.45    <none>        80/TCP    2m
```

---

## 📝 Part 2: Accessing Grafana

### Step 2.1: Get Admin Password

**If using kube-prometheus-stack:**
```bash
kubectl get secret -n monitoring prometheus-grafana \
  -o jsonpath="{.data.admin-password}" | base64 --decode ; echo
```

**If using standalone Grafana:**
```bash
kubectl get secret -n monitoring grafana \
  -o jsonpath="{.data.admin-password}" | base64 --decode ; echo
```

**Expected Output:**
```
prom-operator
```
or
```
admin123
```

**💡 Save this password!**

### Step 2.2: Port Forward to Grafana

**For kube-prometheus-stack:**
```bash
kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80
```

**For standalone Grafana:**
```bash
kubectl port-forward -n monitoring svc/grafana 3000:80
```

**Expected Output:**
```
Forwarding from 127.0.0.1:3000 -> 3000
Forwarding from [::1]:3000 -> 3000
```

### Step 2.3: Login to Grafana

**Open browser:**
```
http://localhost:3000
```

**Login credentials:**
- **Username**: `admin`
- **Password**: (from Step 2.1)

**First Login:**
```
┌─────────────────────────────────────────────┐
│          Welcome to Grafana                 │
│                                             │
│  Username: admin                            │
│  Password: ********                         │
│                                             │
│  [ Log in ]                                 │
└─────────────────────────────────────────────┘
```

**💡 After login, you may be prompted to change password**

---

## 📝 Part 3: Adding Prometheus Data Source

### Step 3.1: Navigate to Data Sources

**If using kube-prometheus-stack**, Prometheus is already configured!

**To verify:**
1. Click **⚙️ Configuration** (gear icon) → **Data sources**
2. You should see **Prometheus** listed

**For standalone Grafana:**

1. Click **⚙️ Configuration** → **Data sources**
2. Click **Add data source**
3. Select **Prometheus**

### Step 3.2: Configure Prometheus Data Source

**Settings:**
```
Name: Prometheus
Default: ✓ (checked)

HTTP:
  URL: http://prometheus-kube-prometheus-prometheus.monitoring.svc:9090
  Access: Server (default)

Auth:
  (leave all unchecked)
```

**💡 URL Breakdown:**
```
http://prometheus-kube-prometheus-prometheus.monitoring.svc:9090
       │                                        │           │
       └─ Service name                          │           └─ Port
                                                └─ Namespace
```

**Alternative URLs:**
- Standalone Prometheus: `http://prometheus-server.monitoring.svc:80`
- External Prometheus: `http://prometheus.example.com:9090`

### Step 3.3: Test Connection

1. Scroll down to **Save & test** button
2. Click **Save & test**

**Expected Result:**
```
✓ Data source is working
```

**If error:**
```
✗ HTTP Error Bad Gateway
```

**Troubleshooting:**
```bash
# Check Prometheus service
kubectl get svc -n monitoring | grep prometheus

# Verify Prometheus is running
kubectl get pods -n monitoring | grep prometheus

# Test connection from within cluster
kubectl run -it --rm debug --image=curlimages/curl --restart=Never -- \
  curl http://prometheus-kube-prometheus-prometheus.monitoring.svc:9090/api/v1/query?query=up
```

---

## 📝 Part 4: Creating Your First Dashboard

### Step 4.1: Create New Dashboard

1. Click **+** (plus icon) → **Dashboard**
2. Click **Add new panel**

**You'll see:**
```
┌─────────────────────────────────────────────────────────┐
│  Panel Title                                            │
│  ┌───────────────────────────────────────────────────┐ │
│  │                                                   │ │
│  │         (Empty Graph)                             │ │
│  │                                                   │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  Query:                                                 │
│  [                                              ]       │
└─────────────────────────────────────────────────────────┘
```

### Step 4.2: Add CPU Usage Query

**In the Query section:**

1. **Data source**: Prometheus (should be selected)
2. **Metric**: Enter this query:

```promql
100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)
```

3. **Legend**: `{{instance}}`

**💡 Query Explanation:**
- Calculates CPU usage percentage
- Groups by instance (node)
- Shows non-idle CPU time

### Step 4.3: Configure Panel

**Panel options (right sidebar):**

```
Title: CPU Usage by Node
Description: Percentage of CPU in use per node

Visualization: Time series (default)

Legend:
  ✓ Show legend
  Values: Last
  Placement: Bottom
```

**Axes:**
```
Left Y:
  Unit: Percent (0-100)
  Min: 0
  Max: 100
```

**Click Apply** (top right)

### Step 4.4: Add More Panels

**Click "Add panel" to create another visualization**

**Panel 2: Memory Usage**

**Query:**
```promql
(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100
```

**Settings:**
```
Title: Memory Usage
Unit: Percent (0-100)
Legend: {{instance}}
```

**Panel 3: Pod Count**

**Query:**
```promql
count(kube_pod_info)
```

**Settings:**
```
Title: Total Running Pods
Visualization: Stat
Unit: Short
Color mode: Value
```

**💡 Stat Visualization:**
- Shows single number
- Good for counts and totals
- Can show sparkline (mini graph)

### Step 4.5: Arrange Dashboard

1. **Drag panels** to rearrange
2. **Resize panels** by dragging corners
3. **Click Save** (disk icon, top right)

**Save Dashboard:**
```
Dashboard name: Cluster Overview
Folder: General
```

**Click Save**

---

## 📝 Part 5: Importing Pre-built Dashboards

### Step 5.1: Browse Dashboard Library

1. Click **+** → **Import**
2. Enter dashboard ID: **1860** (Node Exporter Full)
3. Click **Load**

**💡 Popular Dashboard IDs:**
```
┌─────────────────────────────────────────────────────────┐
│ ID    │ Name                        │ Purpose          │
├─────────────────────────────────────────────────────────┤
│ 1860  │ Node Exporter Full          │ Host metrics     │
│ 315   │ Kubernetes cluster          │ K8s overview     │
│ 6417  │ Kubernetes Pods             │ Pod monitoring   │
│ 7249  │ Kubernetes Deployment       │ Deployments      │
│ 12114 │ Kubernetes Nginx Ingress    │ Ingress metrics  │
└─────────────────────────────────────────────────────────┘
```

### Step 5.2: Configure Import

**Import settings:**
```
Name: Node Exporter Full
Folder: General
Prometheus: Prometheus (select your data source)
```

**Click Import**

**You'll see a comprehensive dashboard with:**
- CPU usage
- Memory usage
- Disk I/O
- Network traffic
- System load
- And much more!

### Step 5.3: Explore the Dashboard

**Dashboard features:**
```
┌─────────────────────────────────────────────────────────┐
│ Top Bar:                                                │
│  • Time range picker (Last 6 hours, Last 24 hours, etc)│
│  • Refresh interval (Off, 5s, 10s, 30s, 1m, etc)       │
│  • Variables (if any)                                   │
│                                                         │
│ Panels:                                                 │
│  • Hover for details                                    │
│  • Click title → Edit to modify                         │
│  • Click title → View to fullscreen                     │
└─────────────────────────────────────────────────────────┘
```

---

## 📝 Part 6: Dashboard Variables

### Step 6.1: Add Variable

1. Open your "Cluster Overview" dashboard
2. Click **⚙️ Dashboard settings** (gear icon, top right)
3. Go to **Variables** tab
4. Click **Add variable**

**Variable settings:**
```
Name: namespace
Type: Query
Label: Namespace

Query options:
  Data source: Prometheus
  Query: label_values(kube_pod_info, namespace)
  
Refresh: On Dashboard Load
Multi-value: ✓
Include All option: ✓
```

**Click Apply** then **Save**

### Step 6.2: Use Variable in Query

**Edit a panel and update query:**

**Before:**
```promql
count(kube_pod_info)
```

**After:**
```promql
count(kube_pod_info{namespace=~"$namespace"})
```

**💡 Now you can filter by namespace!**

**Top of dashboard will show:**
```
Namespace: [ All ▼ ]
```

---

## ✅ Validation Steps

### Comprehensive Validation

```bash
# 1. Verify Grafana is running
kubectl get pods -n monitoring | grep grafana

# 2. Check data source connection
# In Grafana: Configuration → Data sources → Prometheus → Test

# 3. Verify dashboards are saved
# In Grafana: Dashboards → Browse

# 4. Test queries return data
# Edit any panel and run query

# 5. Check dashboard variables work
# Select different values in variable dropdown
```

---

## 🧹 Cleanup (Optional)

```bash
# Uninstall standalone Grafana
helm uninstall grafana -n monitoring

# Note: If using kube-prometheus-stack, 
# Grafana is part of the stack
```

---

## 🎯 Challenge Tasks

1. **Create Multi-Panel Dashboard**
   - CPU, Memory, Disk, Network
   - Use different visualization types
   - Add meaningful titles and descriptions

2. **Import Multiple Dashboards**
   - Node Exporter (1860)
   - Kubernetes Cluster (315)
   - Kubernetes Pods (6417)

3. **Create Alert**
   - Alert when CPU > 80%
   - Configure notification channel
   - Test alert triggers

---

## 🐛 Troubleshooting

### Issue: Can't access Grafana UI

**Solution:**
```bash
# Check pod status
kubectl get pods -n monitoring | grep grafana

# Check logs
kubectl logs -n monitoring <grafana-pod-name>

# Verify port-forward
lsof -i :3000
```

### Issue: No data in panels

**Solution:**
```bash
# Test Prometheus connection
curl http://prometheus-kube-prometheus-prometheus.monitoring.svc:9090/api/v1/query?query=up

# Check data source configuration
# Grafana → Configuration → Data sources → Prometheus

# Verify query syntax
# Use Prometheus UI to test query first
```

### Issue: Dashboard import fails

**Solution:**
```
# Check dashboard ID is correct
# Try downloading JSON and importing manually
# Verify Prometheus data source is configured
```

---

## 📚 Key Takeaways

✅ **Grafana** visualizes metrics from data sources  
✅ **Data sources** connect to Prometheus, Loki, etc.  
✅ **Dashboards** contain multiple panels  
✅ **Panels** display individual visualizations  
✅ **Variables** make dashboards dynamic  
✅ **Import** pre-built dashboards for quick start  
✅ **Queries** use PromQL (for Prometheus)  
✅ **Persistence** saves dashboards permanently  

---

## 📖 Next Steps

Continue to [Lab 1.2: Creating Custom Dashboards and Panels](lab-1.2-custom-dashboards.md)

---

## 📝 Lab Completion Checklist

- [ ] Installed Grafana
- [ ] Accessed Grafana UI
- [ ] Configured Prometheus data source
- [ ] Created first dashboard
- [ ] Added multiple panels
- [ ] Imported pre-built dashboard
- [ ] Created dashboard variables
- [ ] Explored visualization options
- [ ] Completed challenge tasks

**Congratulations! You've mastered Grafana basics!** 🎉
