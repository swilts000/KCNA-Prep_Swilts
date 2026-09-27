# Lab 2.1: PromQL Basics - Querying Metrics

## 📚 Related Topics
- Prometheus Query Language (PromQL)
- Time-series data analysis
- Metric aggregation
- Rate calculations

## 🎯 Learning Objectives

By the end of this lab, you will be able to:
- Write basic PromQL queries
- Use selectors and matchers
- Apply aggregation operators
- Calculate rates and increases
- Use range vectors and instant vectors
- Understand PromQL functions

## ⏱️ Estimated Time
60-75 minutes

## 📋 Prerequisites

- Completed Lab 1.1 (Prometheus Installation)
- Prometheus running and accessible
- Basic understanding of metrics

---

## 🏗️ PromQL Query Structure

```
┌──────────────────────────────────────────────────────────────┐
│                  PromQL Query Anatomy                        │
└──────────────────────────────────────────────────────────────┘

metric_name{label="value"}[time_range]
│           │              │
│           │              └─ Range Vector (optional)
│           └─ Label Matchers (optional)
└─ Metric Name

Examples:
  http_requests_total                    ← Instant vector
  http_requests_total{method="GET"}      ← With label filter
  http_requests_total[5m]                ← Range vector
  rate(http_requests_total[5m])          ← Function with range
```

**Vector Types:**
```
┌─────────────────────────────────────────────────────────┐
│ Type           │ Description          │ Example         │
├─────────────────────────────────────────────────────────┤
│ Instant Vector │ Single value/time    │ up              │
│ Range Vector   │ Values over time     │ up[5m]          │
│ Scalar         │ Simple number        │ 100             │
│ String         │ Text value           │ "hello"         │
└─────────────────────────────────────────────────────────┘
```

---

## 📝 Part 1: Basic Queries

### Step 1.1: Simple Metric Selection

**Access Prometheus UI:**
```bash
kubectl port-forward -n monitoring svc/prometheus-kube-prometheus-prometheus 9090:9090
```

Open: `http://localhost:9090`

**Query 1: All instances of a metric**
```promql
up
```

**Expected Result:**
```
up{instance="10.244.0.5:9090", job="prometheus"} 1
up{instance="10.244.0.6:9100", job="node-exporter"} 1
up{instance="10.244.0.7:8080", job="kube-state-metrics"} 1
up{instance="10.244.0.8:9093", job="alertmanager"} 1
```

**💡 Explanation:**
- `up` returns all time series for this metric
- Each line is a unique combination of labels
- Value `1` = target is up, `0` = down

**Query 2: Specific metric with labels**
```promql
node_cpu_seconds_total
```

**Expected Result:**
```
node_cpu_seconds_total{cpu="0", instance="...", mode="idle"} 123456.78
node_cpu_seconds_total{cpu="0", instance="...", mode="system"} 1234.56
node_cpu_seconds_total{cpu="0", instance="...", mode="user"} 2345.67
node_cpu_seconds_total{cpu="1", instance="...", mode="idle"} 123789.12
...
```

**💡 Explanation:**
- Counter metric (always increasing)
- Multiple CPUs and modes create many time series
- Values are cumulative seconds

---

## 📝 Part 2: Label Matchers

### Step 2.1: Equality Matchers

**Query: Exact match**
```promql
up{job="prometheus"}
```

**Expected Result:**
```
up{instance="10.244.0.5:9090", job="prometheus"} 1
```

**💡 Explanation:**
- `{job="prometheus"}` filters to exact match
- Only returns time series where job label equals "prometheus"

**Query: Multiple labels**
```promql
node_cpu_seconds_total{cpu="0", mode="idle"}
```

**Expected Result:**
```
node_cpu_seconds_total{cpu="0", instance="...", mode="idle"} 123456.78
```

**💡 Explanation:**
- Multiple label filters are AND-ed together
- Must match ALL specified labels

### Step 2.2: Inequality Matchers

**Matcher Types:**
```
┌─────────────────────────────────────────────────────────┐
│ Operator │ Description              │ Example          │
├─────────────────────────────────────────────────────────┤
│ =        │ Equals                   │ job="prometheus" │
│ !=       │ Not equals               │ job!="kube-dns"  │
│ =~       │ Regex match              │ job=~"prom.*"    │
│ !~       │ Regex not match          │ job!~"kube-.*"   │
└─────────────────────────────────────────────────────────┘
```

**Query: Not equals**
```promql
up{job!="prometheus"}
```

**Expected Result:**
```
up{instance="...", job="node-exporter"} 1
up{instance="...", job="kube-state-metrics"} 1
up{instance="...", job="alertmanager"} 1
```

**Query: Regex match**
```promql
up{job=~"prometheus|alertmanager"}
```

**Expected Result:**
```
up{instance="...", job="prometheus"} 1
up{instance="...", job="alertmanager"} 1
```

**💡 Explanation:**
- `=~` uses regex matching
- `|` means OR in regex
- Matches "prometheus" OR "alertmanager"

**Query: Regex pattern**
```promql
node_cpu_seconds_total{mode=~"user|system"}
```

**Expected Result:**
```
node_cpu_seconds_total{cpu="0", mode="system"} 1234.56
node_cpu_seconds_total{cpu="0", mode="user"} 2345.67
node_cpu_seconds_total{cpu="1", mode="system"} 1235.67
node_cpu_seconds_total{cpu="1", mode="user"} 2346.78
```

---

## 📝 Part 3: Range Vectors

### Step 3.1: Understanding Range Vectors

**Instant Vector vs Range Vector:**
```
Instant Vector: Single value at query time
  up  →  1

Range Vector: Multiple values over time period
  up[5m]  →  1@t-5m, 1@t-4m, 1@t-3m, ..., 1@t
```

**Query: Range vector (will error if used alone)**
```promql
up[5m]
```

**Expected Error:**
```
Error executing query: invalid expression type "range vector" for range query, must be Scalar or instant Vector
```

**💡 Explanation:**
- Range vectors can't be graphed directly
- Must be used with functions like `rate()`, `increase()`, etc.
- Represents all values in the time window

### Step 3.2: Using Range Vectors with Functions

**Query: Rate of change**
```promql
rate(node_cpu_seconds_total{mode="user"}[5m])
```

**Expected Result:**
```
{cpu="0", instance="...", mode="user"} 0.15
{cpu="1", instance="...", mode="user"} 0.12
```

**💡 Explanation:**
- `rate()` calculates per-second rate
- `[5m]` looks back 5 minutes
- Result: CPU seconds per second = CPU utilization
- 0.15 = 15% CPU usage

**Query: Total increase**
```promql
increase(node_cpu_seconds_total{mode="user"}[1h])
```

**Expected Result:**
```
{cpu="0", instance="...", mode="user"} 540
{cpu="1", instance="...", mode="user"} 432
```

**💡 Explanation:**
- `increase()` shows total increase over time period
- 540 seconds of CPU time in 1 hour
- Similar to `rate()` but not per-second

---

## 📝 Part 4: Aggregation Operators

### Step 4.1: Sum Aggregation

**Query: Total CPU usage across all CPUs**
```promql
sum(rate(node_cpu_seconds_total{mode="user"}[5m]))
```

**Expected Result:**
```
{} 0.45
```

**💡 Explanation:**
- `sum()` adds all time series together
- Result is single value (all labels removed)
- 0.45 = total CPU usage across all cores

**Query: Sum by label**
```promql
sum by (mode) (rate(node_cpu_seconds_total[5m]))
```

**Expected Result:**
```
{mode="idle"} 3.85
{mode="system"} 0.15
{mode="user"} 0.45
```

**💡 Explanation:**
- `sum by (mode)` groups by mode label
- Sums across all CPUs for each mode
- Preserves the grouping label

### Step 4.2: Other Aggregation Operators

**Aggregation Operators:**
```
┌─────────────────────────────────────────────────────────┐
│ Operator │ Description              │ Example          │
├─────────────────────────────────────────────────────────┤
│ sum      │ Sum values               │ sum(metric)      │
│ avg      │ Average values           │ avg(metric)      │
│ min      │ Minimum value            │ min(metric)      │
│ max      │ Maximum value            │ max(metric)      │
│ count    │ Count time series        │ count(metric)    │
│ stddev   │ Standard deviation       │ stddev(metric)   │
│ topk     │ Top K values             │ topk(5, metric)  │
│ bottomk  │ Bottom K values          │ bottomk(3, metric)│
└─────────────────────────────────────────────────────────┘
```

**Query: Average memory usage**
```promql
avg(node_memory_MemAvailable_bytes)
```

**Query: Top 5 pods by CPU**
```promql
topk(5, rate(container_cpu_usage_seconds_total[5m]))
```

**Query: Count running pods**
```promql
count(kube_pod_status_phase{phase="Running"})
```

**Expected Result:**
```
{} 15
```

**💡 Explanation:**
- Counts number of time series
- Result: 15 pods in Running state

---

## 📝 Part 5: Arithmetic Operations

### Step 5.1: Basic Math

**Query: Convert bytes to gigabytes**
```promql
node_memory_MemAvailable_bytes / 1024 / 1024 / 1024
```

**Expected Result:**
```
{instance="..."} 3.2
```

**💡 Explanation:**
- Divides bytes by 1024³ to get GB
- Arithmetic operations work on all values

**Query: Memory usage percentage**
```promql
(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100
```

**Expected Result:**
```
{instance="..."} 45.5
```

**💡 Explanation:**
- Calculates used memory percentage
- `1 - (available / total)` = used ratio
- Multiply by 100 for percentage

### Step 5.2: Binary Operators

**Operators:**
```
┌─────────────────────────────────────────────────────────┐
│ Arithmetic │ Comparison  │ Logical                      │
├─────────────────────────────────────────────────────────┤
│ +          │ ==          │ and                          │
│ -          │ !=          │ or                           │
│ *          │ >           │ unless                       │
│ /          │ <           │                              │
│ %          │ >=          │                              │
│ ^          │ <=          │                              │
└─────────────────────────────────────────────────────────┘
```

**Query: Comparison**
```promql
node_memory_MemAvailable_bytes > 2e9
```

**Expected Result:**
```
{instance="..."} 3.2e9
```

**💡 Explanation:**
- Returns only values > 2GB
- Filters out smaller values

---

## 📝 Part 6: Useful Functions

### Step 6.1: Rate and Increase

**Query: HTTP request rate**
```promql
rate(prometheus_http_requests_total[5m])
```

**💡 Use Cases:**
- `rate()`: Per-second rate (for counters)
- `increase()`: Total increase (for counters)
- `irate()`: Instant rate (last 2 points)

### Step 6.2: Time Functions

**Query: Predict future value**
```promql
predict_linear(node_filesystem_free_bytes[1h], 3600)
```

**💡 Explanation:**
- Predicts value 1 hour (3600s) in future
- Based on linear regression of last hour
- Useful for capacity planning

**Query: Time since last change**
```promql
time() - timestamp(up)
```

### Step 6.3: Histogram Functions

**Query: 95th percentile latency**
```promql
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

**💡 Explanation:**
- Works with histogram metrics
- 0.95 = 95th percentile
- Shows latency where 95% of requests are faster

---

## 📝 Part 7: Practical Examples

### Step 7.1: Kubernetes-Specific Queries

**Query 1: Pods by namespace**
```promql
count by (namespace) (kube_pod_info)
```

**Expected Result:**
```
{namespace="default"} 5
{namespace="kube-system"} 10
{namespace="monitoring"} 8
```

**Query 2: Pod restart count**
```promql
kube_pod_container_status_restarts_total
```

**Query 3: Pods not in Running state**
```promql
kube_pod_status_phase{phase!="Running"}
```

**Query 4: Available replicas vs desired**
```promql
kube_deployment_status_replicas_available / kube_deployment_spec_replicas
```

**Expected Result:**
```
{deployment="nginx"} 1.0
{deployment="api"} 0.66
```

**💡 Explanation:**
- 1.0 = all replicas available
- 0.66 = only 2 of 3 replicas available

### Step 7.2: Node Metrics

**Query 1: CPU usage by node**
```promql
100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)
```

**Expected Result:**
```
{instance="node1"} 25.5
{instance="node2"} 18.3
```

**💡 Explanation:**
- Calculates non-idle CPU percentage
- Groups by node (instance)

**Query 2: Memory pressure**
```promql
(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100
```

**Query 3: Disk usage**
```promql
100 - ((node_filesystem_avail_bytes / node_filesystem_size_bytes) * 100)
```

### Step 7.3: Alert-Style Queries

**Query 1: High CPU alert**
```promql
100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
```

**💡 Explanation:**
- Returns only nodes with >80% CPU
- Suitable for alerting

**Query 2: Pod crash looping**
```promql
rate(kube_pod_container_status_restarts_total[15m]) > 0
```

**Query 3: Low disk space**
```promql
(node_filesystem_avail_bytes / node_filesystem_size_bytes) * 100 < 10
```

---

## ✅ Validation Steps

### Practice Queries

```promql
# 1. Find all metrics starting with "kube_"
{__name__=~"kube_.*"}

# 2. Count total time series
count({__name__=~".+"})

# 3. Memory usage in GB
node_memory_MemTotal_bytes / 1024 / 1024 / 1024

# 4. Request rate per endpoint
sum by (endpoint) (rate(http_requests_total[5m]))

# 5. Top 3 namespaces by pod count
topk(3, count by (namespace) (kube_pod_info))
```

---

## 🎯 Challenge Tasks

1. **CPU Utilization Dashboard**
   ```promql
   # Create queries for:
   # - Total cluster CPU usage
   # - Per-node CPU usage
   # - Top 5 pods by CPU
   ```

2. **Memory Analysis**
   ```promql
   # Calculate:
   # - Available memory percentage
   # - Memory usage trend (1h)
   # - Pods using most memory
   ```

3. **Network Metrics**
   ```promql
   # Find:
   # - Network bytes received rate
   # - Network bytes transmitted rate
   # - Total network I/O
   ```

---

## 🐛 Troubleshooting

### Issue: Query returns no data

**Solution:**
```promql
# Check if metric exists
{__name__=~"your_metric.*"}

# Verify time range
# Adjust time picker in UI

# Check label filters
# Remove filters one by one
```

### Issue: Query too slow

**Solution:**
```promql
# Reduce time range
rate(metric[5m])  # instead of [1h]

# Add more label filters
metric{job="specific-job"}

# Use recording rules for complex queries
```

---

## 📚 Key Takeaways

✅ **Instant vectors** return single values  
✅ **Range vectors** return values over time  
✅ **Label matchers** filter time series  
✅ **Aggregation** combines multiple series  
✅ **rate()** calculates per-second rate  
✅ **sum by ()** groups results by labels  
✅ **Arithmetic** works on metric values  
✅ **Functions** transform and analyze data  

---

## 📖 Next Steps

Continue to [Lab 2.2: Advanced PromQL and Recording Rules](lab-2.2-promql-advanced.md)

---

## 📝 Lab Completion Checklist

- [ ] Wrote basic metric queries
- [ ] Used label matchers (=, !=, =~, !~)
- [ ] Created range vector queries
- [ ] Applied aggregation operators
- [ ] Calculated rates and increases
- [ ] Performed arithmetic operations
- [ ] Used PromQL functions
- [ ] Created Kubernetes-specific queries
- [ ] Completed challenge tasks

**Congratulations! You've mastered PromQL basics!** 🎉
