# Lab 2.1: Intermediate Grafana Dashboards - Advanced Techniques

## 📚 Related Topics
- Advanced PromQL queries
- Dashboard templating
- Data transformations
- Alert rules
- Dashboard linking
- Custom variables
- Query optimization

## 🎯 Learning Objectives

By the end of this lab, you will be able to:
- Write complex PromQL queries with functions
- Use advanced dashboard variables and templating
- Apply data transformations
- Create linked dashboards
- Configure panel alerts
- Use query variables and chaining
- Optimize dashboard performance
- Create reusable dashboard templates

## ⏱️ Estimated Time
75-90 minutes

## 📋 Prerequisites

- Completed Lab 1.1 (Grafana Installation)
- Completed Lab 1.2 (Beginner Dashboards)
- Understanding of basic PromQL
- Familiarity with Kubernetes metrics

---

## 🏗️ Advanced Dashboard Architecture

```
┌──────────────────────────────────────────────────────────────┐
│           Intermediate Dashboard Structure                   │
└──────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Dashboard with Advanced Features                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Variables (Templating)                              │  │
│  │  Cluster: [$cluster ▼]  Namespace: [$namespace ▼]   │  │
│  │  Node: [$node ▼]  Pod: [$pod ▼]                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Row 1: Dynamic Metrics (uses variables)            │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │  │
│  │  │  CPU Usage  │  │  Memory     │  │  Network    │  │  │
│  │  │  (Alert)    │  │  (Transform)│  │  (Linked)   │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Row 2: Advanced Visualizations                     │  │
│  │  ┌──────────────────────┐  ┌──────────────────────┐  │  │
│  │  │  Heatmap             │  │  State Timeline      │  │  │
│  │  │  (Latency dist.)     │  │  (Pod states)        │  │  │
│  │  └──────────────────────┘  └──────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

Advanced Features:
  • Variable chaining (namespace → pod)
  • Query optimization (recording rules)
  • Data transformations (calculations)
  • Alert rules (threshold-based)
  • Dashboard links (drill-down)
```

---

## 📝 Part 1: Advanced Variables and Templating

### Step 1.1: Create Multi-Level Variables

**Variable 1: Cluster (Query)**
```
Name: cluster
Type: Query
Data source: Prometheus
Query: label_values(kube_node_info, cluster)
Refresh: On dashboard load
Multi-value: Yes
Include All: Yes
```

**Variable 2: Namespace (Query with Regex)**
```
Name: namespace
Type: Query
Data source: Prometheus
Query: label_values(kube_pod_info{cluster="$cluster"}, namespace)
Regex: /^((?!kube-system|kube-public).)*$/
Refresh: On time range change
Multi-value: Yes
Include All: Yes
Sort: Alphabetical (asc)
```

**💡 Regex filters out system namespaces!**

**Variable 3: Node (Chained)**
```
Name: node
Type: Query
Data source: Prometheus
Query: label_values(kube_node_info{cluster="$cluster"}, node)
Refresh: On dashboard load
Multi-value: Yes
Include All: Yes
```

**Variable 4: Pod (Dependent on Namespace)**
```
Name: pod
Type: Query
Data source: Prometheus
Query: label_values(kube_pod_info{cluster="$cluster", namespace="$namespace"}, pod)
Refresh: On time range change
Multi-value: Yes
Include All: No
```

**Variable 5: Custom Interval**
```
Name: interval
Type: Interval
Values: 30s,1m,5m,10m,30m,1h
Auto: Yes
```

**Expected Variable Bar:**
```
┌─────────────────────────────────────────────────────────────┐
│ Cluster: [All ▼] Namespace: [default ▼] Node: [All ▼]      │
│ Pod: [nginx-xxx ▼] Interval: [Auto ▼]                      │
└─────────────────────────────────────────────────────────────┘
```

### Step 1.2: Advanced Variable Techniques

**Ad-hoc Filters:**
```
Name: filters
Type: Ad hoc filters
Data source: Prometheus
```

**Constant Variable (for thresholds):**
```
Name: cpu_threshold
Type: Constant
Value: 80
```

**Custom Variable (dropdown):**
```
Name: environment
Type: Custom
Values: production,staging,development
```

---

## 📝 Part 2: Complex PromQL Queries

### Step 2.1: CPU Usage with Rate and Aggregation

**Panel: Pod CPU Usage**

**Query:**
```promql
sum(rate(container_cpu_usage_seconds_total{
  cluster="$cluster",
  namespace="$namespace",
  pod=~"$pod",
  container!=""
}[$interval])) by (pod)
```

**Query Breakdown:**
- `container_cpu_usage_seconds_total`: CPU usage counter
- `cluster="$cluster"`: Filter by selected cluster
- `namespace="$namespace"`: Filter by selected namespace
- `pod=~"$pod"`: Regex match for pod (supports multi-select)
- `container!=""`: Exclude POD container
- `[$interval]`: Use variable interval
- `rate()`: Calculate per-second rate
- `sum() by (pod)`: Aggregate by pod

**Legend:**
```
{{pod}}
```

### Step 2.2: Memory Usage with Calculations

**Panel: Pod Memory Usage (Percentage)**

**Query:**
```promql
sum(container_memory_working_set_bytes{
  cluster="$cluster",
  namespace="$namespace",
  pod=~"$pod",
  container!=""
}) by (pod)
/
sum(container_spec_memory_limit_bytes{
  cluster="$cluster",
  namespace="$namespace",
  pod=~"$pod",
  container!=""
}) by (pod)
* 100
```

**Query Explanation:**
- Divides working set by limit
- Multiplies by 100 for percentage
- Groups by pod

**Unit:** Percent (0-100)  
**Thresholds:** 70 (yellow), 85 (red)

### Step 2.3: Network I/O with Multiple Metrics

**Panel: Network Traffic**

**Query A - Receive:**
```promql
sum(rate(container_network_receive_bytes_total{
  cluster="$cluster",
  namespace="$namespace",
  pod=~"$pod"
}[$interval])) by (pod)
```

**Query B - Transmit:**
```promql
sum(rate(container_network_transmit_bytes_total{
  cluster="$cluster",
  namespace="$namespace",
  pod=~"$pod"
}[$interval])) by (pod)
```

**Legend:**
```
Query A: {{pod}} - RX
Query B: {{pod}} - TX
```

**Transform:**
```
1. Add transformation: "Merge"
2. Combine queries into single series
```

---

## 📝 Part 3: Data Transformations

### Step 3.1: Calculate Field Transformation

**Panel: Resource Utilization Score**

**Base Query:**
```promql
# CPU percentage
(sum(rate(container_cpu_usage_seconds_total{namespace="$namespace"}[$interval])) 
/ sum(machine_cpu_cores)) * 100
```

**Transformation Steps:**
```
1. Add transformation: "Add field from calculation"
2. Mode: Binary operation
3. Operation: Add
4. Field: CPU percentage
5. Value: Memory percentage (from another query)
6. Result: Utilization Score
```

### Step 3.2: Filter Data by Value

**Panel: High CPU Pods Only**

**Query:**
```promql
sum(rate(container_cpu_usage_seconds_total{
  namespace="$namespace",
  container!=""
}[$interval])) by (pod)
```

**Transformation:**
```
1. Add transformation: "Filter data by values"
2. Match: All conditions
3. Conditions:
   - Field: Value
   - Operator: Greater than
   - Value: 0.5 (500m CPU)
```

### Step 3.3: Group and Aggregate

**Panel: Resource Summary by Namespace**

**Query A - CPU:**
```promql
sum(rate(container_cpu_usage_seconds_total{cluster="$cluster"}[$interval])) by (namespace)
```

**Query B - Memory:**
```promql
sum(container_memory_working_set_bytes{cluster="$cluster"}) by (namespace)
```

**Transformation:**
```
1. Add transformation: "Merge"
2. Add transformation: "Organize fields"
3. Rename:
   - namespace → Namespace
   - Value #A → CPU Usage
   - Value #B → Memory Usage
4. Add transformation: "Sort by"
5. Field: CPU Usage
6. Order: Descending
```

---

## 📝 Part 4: Advanced Visualizations

### Step 4.1: Heatmap - Request Latency Distribution

**Panel: HTTP Request Latency Heatmap**

**Query:**
```promql
sum(rate(http_request_duration_seconds_bucket{
  namespace="$namespace"
}[$interval])) by (le)
```

**Visualization:** Heatmap

**Heatmap Options:**
```
Calculate from data: Yes
Y Axis:
  Unit: seconds
  Decimals: 2
  Scale: Linear
  
Color scheme: Spectral
Color space: RGB
Show legend: Yes
```

**Expected Heatmap:**
```
┌─────────────────────────────────────────────────────────┐
│  HTTP Request Latency Distribution                      │
│                                                         │
│  1.0s ┤ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│  0.5s ┤ ░░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░  │
│  0.1s ┤ ░░░░▓▓▓▓████████████████▓▓▓▓░░░░░░░░░░░░░░░░  │
│  0.05s┤ ░░░░████████████████████████░░░░░░░░░░░░░░░░  │
│       └─────────────────────────────────────────────  │
│        10:00  11:00  12:00  13:00  14:00  15:00       │
│                                                         │
│  ░ Low    ▓ Medium    █ High                           │
└─────────────────────────────────────────────────────────┘
```

### Step 4.2: State Timeline - Pod Lifecycle

**Panel: Pod State Timeline**

**Query:**
```promql
kube_pod_status_phase{namespace="$namespace", pod=~"$pod"}
```

**Visualization:** State timeline

**Value Mappings:**
```
1 → Running (Green)
2 → Pending (Yellow)
3 → Failed (Red)
4 → Succeeded (Blue)
5 → Unknown (Gray)
```

**Expected Timeline:**
```
┌─────────────────────────────────────────────────────────┐
│  Pod Lifecycle States                                   │
│                                                         │
│  pod-1 ┤ ████████████████████████████████████████████  │
│  pod-2 ┤ ██████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│  pod-3 ┤ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│        └─────────────────────────────────────────────  │
│         10:00  11:00  12:00  13:00  14:00  15:00       │
│                                                         │
│  ░ Pending  █ Running  ▓ Failed                        │
└─────────────────────────────────────────────────────────┘
```

### Step 4.3: Bar Gauge - Resource Comparison

**Panel: Top 10 Pods by Memory**

**Query:**
```promql
topk(10, sum(container_memory_working_set_bytes{
  namespace="$namespace",
  container!=""
}) by (pod))
```

**Visualization:** Bar gauge

**Bar Gauge Options:**
```
Orientation: Horizontal
Display mode: Gradient
Show unfilled: Yes
Min: 0
Max: Auto
Unit: bytes (IEC)
Thresholds:
  - 0: Green
  - 1GB: Yellow
  - 2GB: Red
```

---

## 📝 Part 5: Alert Configuration

### Step 5.1: Create Alert Rule in Panel

**Panel: High CPU Alert**

**Query:**
```promql
(sum(rate(container_cpu_usage_seconds_total{
  namespace="$namespace",
  container!=""
}[$interval])) by (pod) / 
sum(container_spec_cpu_quota{
  namespace="$namespace",
  container!=""
} / container_spec_cpu_period{
  namespace="$namespace",
  container!=""
}) by (pod)) * 100
```

**Alert Tab:**
```
Name: High CPU Usage
Evaluate every: 1m
For: 5m

Conditions:
  WHEN: avg()
  OF: query(A, 5m, now)
  IS ABOVE: $cpu_threshold (80)
  
No Data: Alerting
Error: Alerting
```

**Annotations:**
```
Summary: Pod {{pod}} CPU usage is {{value}}%
Description: CPU usage has been above threshold for 5 minutes
```

**Labels:**
```
severity: warning
namespace: $namespace
```

### Step 5.2: Configure Notification Channel

**Create Contact Point:**
```
1. Alerting → Contact points
2. New contact point
3. Name: slack-alerts
4. Type: Slack
5. Webhook URL: <your-slack-webhook>
6. Save
```

**Create Notification Policy:**
```
1. Alerting → Notification policies
2. Add matcher:
   - Label: severity
   - Operator: =
   - Value: warning
3. Contact point: slack-alerts
```

---

## 📝 Part 6: Dashboard Linking

### Step 6.1: Create Drill-Down Link

**Panel: Pod List (with links)**

**Query:**
```promql
kube_pod_info{namespace="$namespace"}
```

**Data Links:**
```
1. Panel → Data links
2. Add link:
   Title: View Pod Details
   URL: /d/pod-details?var-pod=${__field.labels.pod}&var-namespace=${__field.labels.namespace}
   Open in new tab: Yes
```

### Step 6.2: Create Dashboard Link in Header

**Dashboard Settings:**
```
1. Settings → Links
2. Add link:
   Type: Dashboards
   Title: Related Dashboards
   Tags: kubernetes, monitoring
   Include time range: Yes
   Include variables: Yes
```

### Step 6.3: Create External Link

**Add Link to Kubernetes Dashboard:**
```
1. Settings → Links
2. Add link:
   Type: Link
   Title: Kubernetes Dashboard
   URL: https://kubernetes-dashboard.example.com
   Icon: external link
   Open in new tab: Yes
```

---

## 📝 Part 7: Query Optimization

### Step 7.1: Use Recording Rules

**Create Recording Rule (in Prometheus):**
```yaml
# prometheus-rules.yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: custom-recording-rules
  namespace: monitoring
spec:
  groups:
  - name: pod_metrics
    interval: 30s
    rules:
    - record: pod:cpu_usage:rate5m
      expr: |
        sum(rate(container_cpu_usage_seconds_total{
          container!=""
        }[5m])) by (namespace, pod)
    
    - record: pod:memory_usage:bytes
      expr: |
        sum(container_memory_working_set_bytes{
          container!=""
        }) by (namespace, pod)
```

**Apply Recording Rule:**
```bash
kubectl apply -f prometheus-rules.yaml
```

**Use in Dashboard:**
```promql
# Instead of complex query, use recorded metric
pod:cpu_usage:rate5m{namespace="$namespace", pod=~"$pod"}
```

**💡 Recording rules pre-compute expensive queries!**

### Step 7.2: Optimize Query Performance

**Bad Query (slow):**
```promql
# Calculates for all pods, then filters
sum(rate(container_cpu_usage_seconds_total[5m])) by (pod)
```

**Good Query (fast):**
```promql
# Filters first, then calculates
sum(rate(container_cpu_usage_seconds_total{
  namespace="$namespace",
  pod=~"$pod"
}[5m])) by (pod)
```

**Tips:**
- Filter early (use labels)
- Use recording rules for complex queries
- Avoid large time ranges
- Use appropriate intervals
- Limit series with topk/bottomk

---

## 📝 Part 8: Dashboard Templates

### Step 8.1: Create Reusable Template

**Export Dashboard as Template:**
```
1. Settings → JSON Model
2. Replace hardcoded values with variables
3. Add template metadata
```

**Template JSON Structure:**
```json
{
  "__inputs": [
    {
      "name": "DS_PROMETHEUS",
      "label": "Prometheus",
      "description": "Prometheus data source",
      "type": "datasource",
      "pluginId": "prometheus"
    }
  ],
  "__requires": [
    {
      "type": "grafana",
      "id": "grafana",
      "name": "Grafana",
      "version": "9.0.0"
    },
    {
      "type": "datasource",
      "id": "prometheus",
      "name": "Prometheus",
      "version": "1.0.0"
    }
  ],
  "dashboard": {
    // Dashboard configuration
  }
}
```

### Step 8.2: Import Template

```
1. Dashboards → Import
2. Upload JSON file or paste JSON
3. Select data source
4. Import
```

---

## ✅ Validation Steps

```bash
# 1. Test variable chaining
# Select namespace → verify pod dropdown updates

# 2. Test alert
# Trigger high CPU → verify alert fires

# 3. Test dashboard link
# Click pod → verify drill-down works

# 4. Test transformations
# Verify calculated fields show correct values

# 5. Export and re-import
# Settings → JSON Model → Copy
# Import → Paste → Verify dashboard works
```

---

## 🎯 Challenge Tasks

### Challenge 1: Create Composite Dashboard
```
Combine multiple data sources:
- Prometheus (metrics)
- Loki (logs)
- Jaeger (traces)
```

### Challenge 2: Advanced Alerting
```
Create alert with multiple conditions:
- High CPU AND high memory
- Send to different channels based on severity
```

### Challenge 3: Dynamic Thresholds
```
Use query to calculate dynamic threshold:
- 95th percentile of historical data
- Alert when current > threshold
```

---

## 📚 Key Takeaways

✅ **Variables** enable dynamic, reusable dashboards  
✅ **Chained variables** create dependent dropdowns  
✅ **Transformations** manipulate query results  
✅ **Advanced visualizations** (heatmap, state timeline)  
✅ **Alerts** notify on threshold breaches  
✅ **Dashboard links** enable drill-down workflows  
✅ **Recording rules** optimize query performance  
✅ **Templates** make dashboards reusable  

---

## 📖 Next Steps

Continue to [Lab 3.1: Advanced Grafana Dashboards](lab-3.1-advanced-dashboards.md)

**What you'll learn:**
- Custom plugins and panels
- Advanced alerting strategies
- Multi-tenant dashboards
- Performance optimization
- Enterprise features

---

## 📝 Lab Completion Checklist

- [ ] Created multi-level variables
- [ ] Wrote complex PromQL queries
- [ ] Applied data transformations
- [ ] Created heatmap visualization
- [ ] Configured panel alerts
- [ ] Set up notification channels
- [ ] Created dashboard links
- [ ] Optimized queries with recording rules
- [ ] Exported dashboard template
- [ ] Completed challenge tasks

**Congratulations! You've mastered intermediate Grafana dashboards!** 🎉
