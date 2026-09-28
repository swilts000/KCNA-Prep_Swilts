# Lab 1.2: Beginner Grafana Dashboards - Your First Visualizations

## 📚 Related Topics
- Grafana basics
- Prometheus data sources
- Panel creation
- Basic queries
- Dashboard layout
- Time series visualization

## 🎯 Learning Objectives

By the end of this lab, you will be able to:
- Create your first Grafana dashboard from scratch
- Add and configure basic panels
- Write simple PromQL queries
- Understand panel types and when to use them
- Customize panel appearance
- Organize dashboard layout
- Save and share dashboards
- Use dashboard variables (basics)

## ⏱️ Estimated Time
60-75 minutes

## 📋 Prerequisites

- Grafana installed (from Lab 1.1)
- Prometheus data source configured
- Running Kubernetes cluster with metrics
- Basic understanding of metrics

---

## 🏗️ Dashboard Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                  Grafana Dashboard Structure                 │
└──────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Dashboard                                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Header                                              │  │
│  │  • Title                                             │  │
│  │  • Time Range Picker                                 │  │
│  │  • Refresh Interval                                  │  │
│  │  • Variables (optional)                              │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Row 1: Overview Panels                             │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │  │
│  │  │  Panel 1    │  │  Panel 2    │  │  Panel 3    │  │  │
│  │  │  (Stat)     │  │  (Gauge)    │  │  (Graph)    │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Row 2: Detailed Metrics                            │  │
│  │  ┌──────────────────────┐  ┌──────────────────────┐  │  │
│  │  │  Panel 4             │  │  Panel 5             │  │  │
│  │  │  (Time Series)       │  │  (Bar Chart)         │  │  │
│  │  └──────────────────────┘  └──────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

Panel Components:
  • Query: What data to display
  • Visualization: How to display it
  • Options: Customization settings
  • Overrides: Per-series customization
```

**Key Concepts:**
- **Dashboard**: Container for multiple panels
- **Panel**: Individual visualization
- **Query**: Fetches data from data source
- **Visualization**: Display type (graph, stat, gauge, etc.)

---

## 📝 Part 1: Creating Your First Dashboard

### Step 1.1: Access Grafana

```bash
# Port forward to Grafana (if not already done)
kubectl port-forward -n monitoring svc/kube-prometheus-stack-grafana 3000:80
```

**Access Grafana:**
- URL: http://localhost:3000
- Username: admin
- Password: prom-operator (or your custom password)

### Step 1.2: Create New Dashboard

**In Grafana UI:**
```
1. Click "+" icon in left sidebar
2. Select "Create Dashboard"
3. Click "Add visualization"
4. Select "Prometheus" as data source
```

**Expected View:**
```
┌─────────────────────────────────────────────────────────────┐
│  New Dashboard                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Select data source                                  │  │
│  │  • Prometheus (default)                              │  │
│  │  • TestData DB                                       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**💡 You're now in the panel editor!**

---

## 📝 Part 2: Creating Your First Panel - CPU Usage Stat

### Step 2.1: Configure Query

**In the Query tab:**
```promql
# Query: Total CPU cores in cluster
sum(machine_cpu_cores)
```

**Query Explanation:**
- `machine_cpu_cores`: Metric showing CPU cores per node
- `sum()`: Aggregates across all nodes
- Result: Total number of CPU cores

**Expected Query Result:**
```
Value: 8
```

### Step 2.2: Choose Visualization Type

**In the panel editor:**
```
1. Click "Stat" visualization type (top right)
2. This shows a single large number
```

**Visualization Types:**
```
┌─────────────────────────────────────────────────────────┐
│ Visualization Type │ Best For                          │
├─────────────────────────────────────────────────────────┤
│ Stat               │ Single value (count, total)       │
│ Gauge              │ Percentage or range value         │
│ Time Series        │ Values over time                  │
│ Bar Chart          │ Comparing categories              │
│ Table              │ Multiple metrics in rows          │
│ Pie Chart          │ Proportions/percentages           │
└─────────────────────────────────────────────────────────┘
```

### Step 2.3: Customize Panel

**Panel Options (right sidebar):**
```
Title: Total CPU Cores
Description: Total CPU cores available in cluster
```

**Standard Options:**
```
Unit: short
Decimals: 0
Color scheme: Single color (blue)
```

**Stat Styles:**
```
Graph mode: None
Text mode: Value
Color mode: Background
```

**Expected Panel:**
```
┌─────────────────────────────────┐
│  Total CPU Cores                │
│                                 │
│          8                      │
│                                 │
└─────────────────────────────────┘
```

### Step 2.4: Save Panel

```
1. Click "Apply" (top right)
2. Panel is added to dashboard
```

---

## 📝 Part 3: Creating a Gauge Panel - Memory Usage

### Step 3.1: Add New Panel

```
1. Click "Add" → "Visualization" (top right)
2. Select "Prometheus" data source
```

### Step 3.2: Configure Memory Query

**Query:**
```promql
# Memory usage percentage
(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100
```

**Query Explanation:**
- `node_memory_MemTotal_bytes`: Total memory
- `node_memory_MemAvailable_bytes`: Available memory
- `1 - (available / total)`: Used percentage
- `* 100`: Convert to percentage

**Expected Result:**
```
Value: 65.4 (65.4% memory used)
```

### Step 3.3: Choose Gauge Visualization

```
1. Select "Gauge" visualization
2. Perfect for showing percentage values
```

### Step 3.4: Customize Gauge

**Panel Options:**
```
Title: Memory Usage
Description: Cluster memory utilization
```

**Standard Options:**
```
Unit: Percent (0-100)
Min: 0
Max: 100
Decimals: 1
```

**Gauge Options:**
```
Show threshold labels: Yes
Show threshold markers: Yes
```

**Thresholds:**
```
Base: Green (0%)
Warning: Yellow (70%)
Critical: Red (85%)
```

**Expected Gauge:**
```
┌─────────────────────────────────┐
│  Memory Usage                   │
│                                 │
│      ╭─────────╮                │
│      │  65.4%  │                │
│      ╰─────────╯                │
│  0%  ──●──────  100%            │
│      Green Zone                 │
└─────────────────────────────────┘
```

### Step 3.5: Apply Panel

```
Click "Apply" to add to dashboard
```

---

## 📝 Part 4: Creating a Time Series Panel - Pod Count

### Step 4.1: Add Time Series Panel

```
1. Add new visualization
2. Select "Prometheus"
```

### Step 4.2: Configure Pod Count Query

**Query:**
```promql
# Total running pods over time
sum(kube_pod_status_phase{phase="Running"})
```

**Query Explanation:**
- `kube_pod_status_phase`: Pod status metric
- `phase="Running"`: Filter for running pods only
- `sum()`: Total across all namespaces

### Step 4.3: Choose Time Series Visualization

```
1. Select "Time series" (default)
2. Shows values over time as a line graph
```

### Step 4.4: Customize Time Series

**Panel Options:**
```
Title: Running Pods
Description: Total number of running pods over time
```

**Graph Styles:**
```
Style: Lines
Line width: 2
Fill opacity: 10
Point size: 5
Show points: Auto
```

**Legend:**
```
Mode: List
Placement: Bottom
Values: Last, Max, Min
```

**Axis:**
```
Y-axis:
  Unit: short
  Decimals: 0
  Min: 0
  
X-axis:
  Time range: From dashboard
```

**Expected Graph:**
```
┌─────────────────────────────────────────────────────────┐
│  Running Pods                                           │
│  50 ┤                                    ╭──────        │
│  40 ┤                          ╭─────────╯              │
│  30 ┤                ╭─────────╯                        │
│  20 ┤      ╭─────────╯                                  │
│  10 ┤──────╯                                            │
│   0 └─────────────────────────────────────────────────  │
│     12:00   14:00   16:00   18:00   20:00              │
│                                                         │
│  Last: 45  Max: 48  Min: 12                            │
└─────────────────────────────────────────────────────────┘
```

### Step 4.5: Apply Panel

```
Click "Apply"
```

---

## 📝 Part 5: Creating a Table Panel - Node Information

### Step 5.1: Add Table Panel

```
1. Add new visualization
2. Select "Prometheus"
```

### Step 5.2: Configure Multiple Queries

**Query A - Node Names:**
```promql
kube_node_info
```

**Query B - CPU Cores:**
```promql
machine_cpu_cores
```

**Query C - Memory Total:**
```promql
node_memory_MemTotal_bytes
```

### Step 5.3: Choose Table Visualization

```
Select "Table" visualization
```

### Step 5.4: Customize Table

**Panel Options:**
```
Title: Cluster Nodes
Description: Node resource information
```

**Table Options:**
```
Show header: Yes
Cell display mode: Auto
```

**Transform Data:**
```
1. Click "Transform" tab
2. Add transformation: "Organize fields"
3. Rename fields:
   - node → Node Name
   - Value (Query B) → CPU Cores
   - Value (Query C) → Total Memory
4. Hide unnecessary fields
```

**Column Overrides:**
```
Total Memory:
  Unit: bytes (IEC)
  Decimals: 1
```

**Expected Table:**
```
┌─────────────────────────────────────────────────────────┐
│  Cluster Nodes                                          │
├──────────────┬────────────┬─────────────────────────────┤
│ Node Name    │ CPU Cores  │ Total Memory                │
├──────────────┼────────────┼─────────────────────────────┤
│ node-1       │ 4          │ 8.0 GiB                     │
│ node-2       │ 4          │ 8.0 GiB                     │
│ node-3       │ 4          │ 8.0 GiB                     │
└──────────────┴────────────┴─────────────────────────────┘
```

### Step 5.5: Apply Panel

```
Click "Apply"
```

---

## 📝 Part 6: Organizing Dashboard Layout

### Step 6.1: Arrange Panels

**Drag and drop panels to organize:**
```
┌─────────────────────────────────────────────────────────┐
│  My First Kubernetes Dashboard                          │
├─────────────────────────────────────────────────────────┤
│  Row 1: Overview                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Total CPU    │  │ Memory Usage │  │ Running Pods │  │
│  │ Cores        │  │ (Gauge)      │  │ (Time Series)│  │
│  │ (Stat)       │  │              │  │              │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                         │
│  Row 2: Details                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Cluster Nodes (Table)                           │   │
│  │                                                 │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**To resize panels:**
```
1. Hover over panel edge
2. Drag to resize
3. Panels snap to grid
```

### Step 6.2: Add Rows for Organization

```
1. Click "Add" → "Row"
2. Name row: "Overview Metrics"
3. Drag panels into row
4. Rows can be collapsed
```

---

## 📝 Part 7: Dashboard Settings and Variables

### Step 7.1: Configure Dashboard Settings

```
1. Click gear icon (⚙️) top right
2. Dashboard settings panel opens
```

**General Settings:**
```
Name: My First Kubernetes Dashboard
Description: Beginner dashboard showing cluster metrics
Tags: kubernetes, beginner, cluster
Timezone: Browser time
```

**Time Options:**
```
Auto refresh: 30s
Refresh intervals: 5s, 10s, 30s, 1m, 5m, 15m, 30m, 1h
Time range: Last 6 hours
```

### Step 7.2: Add Simple Variable

**Create Namespace Variable:**
```
1. Settings → Variables
2. Click "Add variable"
3. Configure:
   Name: namespace
   Type: Query
   Data source: Prometheus
   Query: label_values(kube_pod_info, namespace)
   Refresh: On dashboard load
   Multi-value: No
   Include All: Yes
```

**Use Variable in Query:**
```promql
# Update Running Pods query
sum(kube_pod_status_phase{phase="Running", namespace="$namespace"})
```

**Expected Variable Dropdown:**
```
┌─────────────────────────────────────────────────────────┐
│  Namespace: [All ▼]                                     │
│  • All                                                  │
│  • default                                              │
│  • kube-system                                          │
│  • monitoring                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 📝 Part 8: Saving and Sharing Dashboard

### Step 8.1: Save Dashboard

```
1. Click "Save dashboard" icon (💾) top right
2. Add save message: "Initial version"
3. Click "Save"
```

**Expected Confirmation:**
```
✓ Dashboard saved
```

### Step 8.2: Export Dashboard

```
1. Settings → JSON Model
2. Copy JSON
3. Save to file: my-first-dashboard.json
```

**Or use Share:**
```
1. Click "Share" icon (🔗)
2. Options:
   - Link: Copy dashboard URL
   - Snapshot: Create snapshot
   - Export: Download JSON
```

### Step 8.3: Create Dashboard Folder

```
1. Dashboards → Browse
2. Click "New Folder"
3. Name: "Beginner Dashboards"
4. Move dashboard to folder
```

---

## 📝 Part 9: Adding More Beginner Panels

### Step 9.1: Disk Usage Gauge

**Query:**
```promql
(1 - (node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"})) * 100
```

**Visualization:** Gauge  
**Unit:** Percent (0-100)  
**Thresholds:** Green (0%), Yellow (75%), Red (90%)

### Step 9.2: Network Traffic Graph

**Query A - Received:**
```promql
rate(node_network_receive_bytes_total{device!="lo"}[5m])
```

**Query B - Transmitted:**
```promql
rate(node_network_transmit_bytes_total{device!="lo"}[5m])
```

**Visualization:** Time series  
**Unit:** bytes/sec  
**Legend:** Show with labels

### Step 9.3: Pod Status Pie Chart

**Query:**
```promql
sum by (phase) (kube_pod_status_phase)
```

**Visualization:** Pie chart  
**Legend:** Show values and percentages

**Expected Pie Chart:**
```
┌─────────────────────────────────┐
│  Pod Status Distribution        │
│                                 │
│      ╭─────────╮                │
│     ╱  Running  ╲               │
│    │   (75%)    │               │
│    │            │               │
│     ╲  Pending  ╱               │
│      ╰─────────╯                │
│                                 │
│  ● Running: 45                  │
│  ● Pending: 3                   │
│  ● Failed: 2                    │
└─────────────────────────────────┘
```

---

## ✅ Validation Steps

```bash
# 1. Verify dashboard is saved
# In Grafana: Dashboards → Browse
# Should see "My First Kubernetes Dashboard"

# 2. Test time range picker
# Change time range to "Last 1 hour"
# Verify all panels update

# 3. Test auto-refresh
# Set refresh to 30s
# Watch panels update automatically

# 4. Test variable
# Change namespace variable
# Verify Running Pods panel updates

# 5. Export dashboard
# Settings → JSON Model
# Verify JSON is valid
```

---

## 🧹 Cleanup

```
# Dashboards are saved in Grafana database
# To delete:
1. Dashboards → Browse
2. Find dashboard
3. Click "..." → Delete
4. Confirm deletion
```

---

## 🎯 Challenge Tasks

### Challenge 1: Add Container Restart Panel
```promql
sum(rate(kube_pod_container_status_restarts_total[5m]))
```
- Visualization: Stat
- Show trend (sparkline)
- Alert if > 5 restarts/min

### Challenge 2: Create Multi-Query Panel
```promql
# Query A: CPU Request
sum(kube_pod_container_resource_requests{resource="cpu"})

# Query B: CPU Limit
sum(kube_pod_container_resource_limits{resource="cpu"})
```
- Visualization: Time series
- Show both on same graph
- Different colors

### Challenge 3: Add Annotations
```
1. Settings → Annotations
2. Add annotation query
3. Show deployment events on graphs
```

---

## 🐛 Troubleshooting

### Issue: No data in panels

**Solution:**
```bash
# Check Prometheus is scraping
kubectl get servicemonitors -n monitoring

# Verify data source
# Grafana → Configuration → Data Sources
# Test connection

# Check query in Explore
# Grafana → Explore → Run query
```

### Issue: Panel shows "N/A"

**Solution:**
```
# Check query syntax
# Use Explore to test query
# Verify metric exists in Prometheus

# Check time range
# Metric might not have data in selected range
```

### Issue: Dashboard not saving

**Solution:**
```
# Check permissions
# Need Editor or Admin role

# Check browser console
# Look for errors

# Try incognito mode
# Rule out browser cache issues
```

---

## 📚 Key Takeaways

✅ **Dashboards** organize multiple panels  
✅ **Panels** display individual visualizations  
✅ **Queries** fetch data from Prometheus  
✅ **Stat panels** show single values  
✅ **Gauge panels** show percentages/ranges  
✅ **Time series** show data over time  
✅ **Tables** show multiple metrics  
✅ **Variables** make dashboards dynamic  
✅ **Thresholds** add color-coded alerts  
✅ **Layout** matters for readability  

---

## 📖 Next Steps

Continue to [Lab 2.1: Intermediate Grafana Dashboards](lab-2.1-intermediate-dashboards.md)

**What you'll learn:**
- Advanced queries and transformations
- Templating and variables
- Alerts and notifications
- Dashboard linking
- Custom time ranges

---

## 📝 Lab Completion Checklist

- [ ] Created new dashboard
- [ ] Added Stat panel (CPU cores)
- [ ] Added Gauge panel (Memory usage)
- [ ] Added Time series panel (Pod count)
- [ ] Added Table panel (Node info)
- [ ] Organized panel layout
- [ ] Configured dashboard settings
- [ ] Added namespace variable
- [ ] Saved dashboard
- [ ] Exported dashboard JSON
- [ ] Completed challenge tasks

**Congratulations! You've created your first Grafana dashboard!** 🎉

---

## 📊 Your Dashboard Summary

**Panels Created:**
1. Total CPU Cores (Stat)
2. Memory Usage (Gauge)
3. Running Pods (Time Series)
4. Cluster Nodes (Table)
5. Disk Usage (Gauge) - Challenge
6. Network Traffic (Time Series) - Challenge
7. Pod Status (Pie Chart) - Challenge

**Skills Learned:**
- Dashboard creation
- Panel configuration
- Query writing
- Visualization selection
- Layout organization
- Variable usage
- Dashboard saving/sharing

**Next Level:** Intermediate dashboards with advanced features!
