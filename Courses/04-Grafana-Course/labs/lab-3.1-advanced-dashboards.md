# Lab 3.1: Advanced Grafana Dashboards - Expert Techniques

## 📚 Related Topics
- Custom plugins and panels
- Advanced alerting with Grafana Alerting
- Multi-tenancy and RBAC
- Performance optimization
- Grafana as Code (provisioning)
- Custom data sources
- Advanced templating patterns

## 🎯 Learning Objectives

By the end of this lab, you will be able to:
- Create custom panel plugins
- Implement advanced alerting strategies
- Configure multi-tenant dashboards with RBAC
- Optimize dashboard performance at scale
- Use Grafana provisioning for GitOps
- Build unified observability dashboards
- Implement SLO/SLI dashboards
- Create executive-level dashboards

## ⏱️ Estimated Time
90-120 minutes

## 📋 Prerequisites

- Completed Lab 1.1 (Grafana Installation)
- Completed Lab 1.2 (Beginner Dashboards)
- Completed Lab 2.1 (Intermediate Dashboards)
- Advanced PromQL knowledge
- Understanding of SRE concepts

---

## 🏗️ Enterprise Dashboard Architecture

```
┌──────────────────────────────────────────────────────────────┐
│           Enterprise Grafana Architecture                    │
└──────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Multi-Tenant Organization                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Folders & Permissions                               │  │
│  │  • Team A (Editor)                                   │  │
│  │  • Team B (Viewer)                                   │  │
│  │  • Admins (Admin)                                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Unified Observability Dashboard                     │  │
│  │  ┌────────────┬────────────┬────────────┐            │  │
│  │  │ Metrics    │ Logs       │ Traces     │            │  │
│  │  │ (Prom)     │ (Loki)     │ (Tempo)    │            │  │
│  │  └────────────┴────────────┴────────────┘            │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │ Correlated Data (linked queries)              │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  SLO/SLI Dashboard                                   │  │
│  │  • Error Budget Tracking                             │  │
│  │  • Burn Rate Alerts                                  │  │
│  │  • Multi-window SLO                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Executive Dashboard                                 │  │
│  │  • Business KPIs                                     │  │
│  │  • Cost Metrics                                      │  │
│  │  • Capacity Planning                                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

Advanced Patterns:
  • GitOps provisioning
  • Custom plugins
  • Advanced alerting (multi-dimensional)
  • Performance optimization
  • Multi-data source correlation
```

---

## 📝 Part 1: SLO/SLI Dashboard (Site Reliability Engineering)

### Step 1.1: Define SLO Metrics

**SLO Definition:**
- **SLI**: Request success rate
- **SLO**: 99.9% of requests succeed
- **Error Budget**: 0.1% (43.2 minutes/month)

**Recording Rules for SLI:**
```yaml
# prometheus-slo-rules.yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: slo-recording-rules
  namespace: monitoring
spec:
  groups:
  - name: slo_metrics
    interval: 30s
    rules:
    # Total requests
    - record: slo:http_requests:total
      expr: |
        sum(rate(http_requests_total[5m]))
    
    # Successful requests (non-5xx)
    - record: slo:http_requests:success
      expr: |
        sum(rate(http_requests_total{code!~"5.."}[5m]))
    
    # Error rate
    - record: slo:http_requests:error_rate
      expr: |
        1 - (slo:http_requests:success / slo:http_requests:total)
    
    # Availability (success rate)
    - record: slo:http_requests:availability
      expr: |
        slo:http_requests:success / slo:http_requests:total
```

```bash
kubectl apply -f prometheus-slo-rules.yaml
```

### Step 1.2: Create SLO Dashboard

**Panel 1: Current SLO Status (Stat)**

**Query:**
```promql
slo:http_requests:availability * 100
```

**Panel Options:**
```
Title: Current Availability
Unit: Percent (0-100)
Decimals: 3
Thresholds:
  - 99.9: Green (SLO met)
  - 99.0: Yellow (Warning)
  - 0: Red (SLO violated)
```

**Panel 2: Error Budget Remaining (Gauge)**

**Query:**
```promql
# Error budget = (1 - SLO) = 0.001 (0.1%)
# Remaining = budget - actual errors
(0.001 - (1 - slo:http_requests:availability)) / 0.001 * 100
```

**Gauge Options:**
```
Title: Error Budget Remaining
Unit: Percent (0-100)
Min: 0
Max: 100
Thresholds:
  - 0: Red (Exhausted)
  - 25: Yellow (Low)
  - 50: Green (Healthy)
```

**Panel 3: Burn Rate (Time Series)**

**Query - 1h Burn Rate:**
```promql
# How fast are we consuming error budget?
# Burn rate > 1 means consuming faster than budget allows
(1 - (slo:http_requests:success / slo:http_requests:total))
/ 0.001
```

**Query - 6h Burn Rate:**
```promql
(1 - (
  sum(rate(http_requests_total{code!~"5.."}[6h]))
  / sum(rate(http_requests_total[6h]))
)) / 0.001
```

**Alert Thresholds:**
```
Burn Rate > 14.4: Page immediately (exhausts budget in 2 days)
Burn Rate > 6: Warning (exhausts budget in 1 week)
```

**Panel 4: Error Budget Burn Down (Time Series)**

**Query:**
```promql
# Cumulative error budget consumption
sum_over_time((1 - slo:http_requests:availability)[30d:5m]) 
/ (30 * 24 * 60 / 5) # Normalize to 30 days
* 100
```

### Step 1.3: Multi-Window SLO Alerts

**Create Alert Rule:**
```yaml
# grafana-slo-alerts.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana-slo-alerts
  namespace: monitoring
data:
  slo-alerts.yaml: |
    groups:
    - name: slo_alerts
      interval: 1m
      rules:
      # Fast burn (2% budget in 1h)
      - alert: ErrorBudgetBurnRateCritical
        expr: |
          (1 - slo:http_requests:availability) / 0.001 > 14.4
        for: 2m
        labels:
          severity: critical
          slo: availability
        annotations:
          summary: "Critical error budget burn rate"
          description: "Burning error budget 14.4x faster than sustainable rate"
      
      # Slow burn (5% budget in 6h)
      - alert: ErrorBudgetBurnRateWarning
        expr: |
          (1 - (
            sum(rate(http_requests_total{code!~"5.."}[6h]))
            / sum(rate(http_requests_total[6h]))
          )) / 0.001 > 6
        for: 15m
        labels:
          severity: warning
          slo: availability
        annotations:
          summary: "Elevated error budget burn rate"
          description: "Burning error budget 6x faster than sustainable rate"
```

---

## 📝 Part 2: Unified Observability Dashboard

### Step 2.1: Metrics + Logs + Traces Integration

**Panel 1: Request Rate with Log Correlation**

**Metrics Query (Prometheus):**
```promql
sum(rate(http_requests_total{namespace="$namespace"}[5m])) by (status_code)
```

**Data Link to Logs:**
```
Title: View Logs
URL: /explore?left={"datasource":"Loki","queries":[{"expr":"{namespace=\"${namespace}\",pod=~\"${__field.labels.pod}\"}","refId":"A"}],"range":{"from":"${__from}","to":"${__to}"}}
```

**Panel 2: Error Rate with Trace Correlation**

**Metrics Query:**
```promql
sum(rate(http_requests_total{code=~"5..", namespace="$namespace"}[5m]))
```

**Data Link to Traces:**
```
Title: View Traces
URL: /explore?left={"datasource":"Tempo","queries":[{"query":"{.namespace=\"${namespace}\" && .http.status_code>=500}","refId":"A"}],"range":{"from":"${__from}","to":"${__to}"}}
```

### Step 2.2: Logs Panel (Loki)

**Add Loki Data Source (if not already):**
```bash
# Loki is included in kube-prometheus-stack
# Verify it's available
kubectl get svc -n monitoring | grep loki
```

**Panel: Application Logs**

**Loki Query:**
```logql
{namespace="$namespace", pod=~"$pod"} 
|= "error" or "ERROR" or "Error"
| json
| line_format "{{.timestamp}} [{{.level}}] {{.message}}"
```

**Panel Options:**
```
Title: Error Logs
Visualization: Logs
Show time: Yes
Wrap lines: Yes
Dedupe: Exact
```

### Step 2.3: Exemplars (Metrics to Traces)

**Enable Exemplars in Prometheus:**
```yaml
# Add to Prometheus config
global:
  external_labels:
    cluster: production
  
# Enable exemplars
storage:
  exemplars:
    max_exemplars: 100000
```

**Query with Exemplars:**
```promql
histogram_quantile(0.95,
  sum(rate(http_request_duration_seconds_bucket{namespace="$namespace"}[5m])) by (le)
)
```

**Panel Options:**
```
Exemplars: Enabled
Exemplar data source: Tempo
```

**💡 Click on exemplar point → jumps to trace!**

---

## 📝 Part 3: Advanced Alerting Strategies

### Step 3.1: Multi-Dimensional Alerts

**Alert: High Error Rate by Endpoint**

**Query:**
```promql
sum(rate(http_requests_total{code=~"5..", namespace="$namespace"}[5m])) by (endpoint)
/ sum(rate(http_requests_total{namespace="$namespace"}[5m])) by (endpoint)
* 100 > 5
```

**Alert Configuration:**
```
Name: High Error Rate by Endpoint
Evaluate: Every 1m, For 5m

Conditions:
  WHEN: last()
  OF: query(A, 5m, now)
  IS ABOVE: 5
  
Group by: endpoint

Annotations:
  summary: "High error rate on {{endpoint}}"
  description: "Error rate is {{value}}% on endpoint {{endpoint}}"
  runbook_url: https://runbooks.example.com/high-error-rate
  dashboard_url: ${__dashboardUid}
  
Labels:
  severity: warning
  endpoint: {{endpoint}}
  namespace: $namespace
```

### Step 3.2: Composite Alerts (AND/OR Logic)

**Alert: Resource Saturation**

**Query A - High CPU:**
```promql
avg(rate(container_cpu_usage_seconds_total{namespace="$namespace"}[5m])) > 0.8
```

**Query B - High Memory:**
```promql
avg(container_memory_working_set_bytes{namespace="$namespace"} 
/ container_spec_memory_limit_bytes{namespace="$namespace"}) > 0.85
```

**Alert Expression:**
```
# Alert if BOTH CPU AND Memory are high
$A AND $B
```

### Step 3.3: Alert Silencing and Maintenance Windows

**Create Silence:**
```
1. Alerting → Silences
2. New silence
3. Matchers:
   - namespace = production
   - severity = warning
4. Duration: 2h
5. Comment: "Planned maintenance"
6. Creator: admin
```

**Silence via API:**
```bash
curl -X POST http://localhost:3000/api/alertmanager/grafana/api/v2/silences \
  -H "Content-Type: application/json" \
  -d '{
    "matchers": [
      {"name": "namespace", "value": "production", "isRegex": false}
    ],
    "startsAt": "2026-09-28T10:00:00Z",
    "endsAt": "2026-09-28T12:00:00Z",
    "comment": "Planned maintenance",
    "createdBy": "automation"
  }'
```

---

## 📝 Part 4: Multi-Tenancy and RBAC

### Step 4.1: Create Teams and Folders

**Create Teams:**
```
1. Configuration → Teams
2. New team: "Platform Team"
3. Add members
4. Repeat for other teams
```

**Create Folders with Permissions:**
```
1. Dashboards → New folder: "Platform Dashboards"
2. Folder permissions:
   - Platform Team: Editor
   - Developers: Viewer
   - Admins: Admin
```

### Step 4.2: Data Source Permissions

**Restrict Data Source Access:**
```
1. Configuration → Data sources
2. Select Prometheus
3. Permissions tab
4. Add permission:
   - Team: Platform Team
   - Permission: Query
```

### Step 4.3: Dashboard-Level Variables for Isolation

**Namespace Filtering by Team:**
```
Variable: namespace
Type: Query
Query: label_values(kube_namespace_labels{team="$__user.team"}, namespace)
```

**💡 Only shows namespaces for user's team!**

---

## 📝 Part 5: Grafana as Code (Provisioning)

### Step 5.1: Dashboard Provisioning

**Create Provisioning ConfigMap:**
```yaml
# grafana-dashboard-provisioning.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana-dashboard-provisioning
  namespace: monitoring
data:
  dashboards.yaml: |
    apiVersion: 1
    providers:
    - name: 'default'
      orgId: 1
      folder: 'Provisioned Dashboards'
      type: file
      disableDeletion: false
      updateIntervalSeconds: 30
      allowUiUpdates: true
      options:
        path: /var/lib/grafana/dashboards
```

**Dashboard JSON ConfigMap:**
```yaml
# slo-dashboard.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: slo-dashboard
  namespace: monitoring
  labels:
    grafana_dashboard: "1"
data:
  slo-dashboard.json: |
    {
      "dashboard": {
        "title": "SLO Dashboard",
        "tags": ["slo", "sre"],
        "timezone": "browser",
        "panels": [
          // Panel configurations
        ]
      }
    }
```

```bash
kubectl apply -f grafana-dashboard-provisioning.yaml
kubectl apply -f slo-dashboard.yaml
```

### Step 5.2: Data Source Provisioning

**Provision Multiple Prometheus Instances:**
```yaml
# grafana-datasources.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana-datasources
  namespace: monitoring
data:
  datasources.yaml: |
    apiVersion: 1
    datasources:
    - name: Prometheus-Production
      type: prometheus
      access: proxy
      url: http://prometheus-production:9090
      isDefault: true
      editable: false
      jsonData:
        timeInterval: 30s
        queryTimeout: 60s
        httpMethod: POST
    
    - name: Prometheus-Staging
      type: prometheus
      access: proxy
      url: http://prometheus-staging:9090
      isDefault: false
      editable: false
    
    - name: Loki
      type: loki
      access: proxy
      url: http://loki:3100
      editable: false
    
    - name: Tempo
      type: tempo
      access: proxy
      url: http://tempo:3100
      editable: false
      jsonData:
        tracesToLogs:
          datasourceUid: loki
          tags: ['job', 'instance', 'pod', 'namespace']
        serviceMap:
          datasourceUid: prometheus
```

---

## 📝 Part 6: Performance Optimization

### Step 6.1: Query Optimization Techniques

**Bad Query (Slow):**
```promql
# Queries all metrics, then filters
sum(rate(container_cpu_usage_seconds_total[5m])) by (pod)
```

**Good Query (Fast):**
```promql
# Filters first with labels
sum(rate(container_cpu_usage_seconds_total{
  namespace="$namespace",
  pod=~"$pod",
  container!=""
}[5m])) by (pod)
```

**Use topk/bottomk:**
```promql
# Instead of all pods, show top 10
topk(10, sum(rate(container_cpu_usage_seconds_total{
  namespace="$namespace",
  container!=""
}[5m])) by (pod))
```

### Step 6.2: Dashboard Performance Settings

**Dashboard JSON Settings:**
```json
{
  "refresh": "30s",
  "time": {
    "from": "now-6h",
    "to": "now"
  },
  "timepicker": {
    "refresh_intervals": ["30s", "1m", "5m", "15m"],
    "time_options": ["5m", "15m", "1h", "6h", "12h", "24h"]
  },
  "panels": [
    {
      "maxDataPoints": 1000,
      "interval": "30s",
      "cacheTimeout": "60"
    }
  ]
}
```

### Step 6.3: Use Query Caching

**Enable Query Caching:**
```yaml
# grafana.ini
[dataproxy]
timeout = 30
keep_alive_seconds = 30

[caching]
enabled = true
ttl = 5m
```

---

## 📝 Part 7: Executive Dashboard

### Step 7.1: Business KPI Dashboard

**Panel 1: Revenue Impact (Calculated)**

**Query A - Request Rate:**
```promql
sum(rate(http_requests_total{endpoint="/checkout"}[5m]))
```

**Query B - Average Order Value (from app metrics):**
```promql
avg(order_value_dollars)
```

**Transform:**
```
1. Add transformation: "Add field from calculation"
2. Mode: Binary operation
3. Operation: Multiply
4. Result: Revenue per minute
```

**Panel 2: Cost Metrics**

**Query - Infrastructure Cost:**
```promql
# Cost per CPU core per hour
sum(machine_cpu_cores) * 0.05
```

**Query - Storage Cost:**
```promql
# Cost per GB per month
sum(node_filesystem_size_bytes) / 1024^3 * 0.10
```

**Panel 3: Capacity Planning**

**Query - CPU Headroom:**
```promql
(sum(machine_cpu_cores) 
- sum(rate(container_cpu_usage_seconds_total[5m])))
/ sum(machine_cpu_cores) * 100
```

**Threshold Alert:**
```
< 20%: Warning (need more capacity)
< 10%: Critical (urgent scaling needed)
```

---

## ✅ Validation Steps

```bash
# 1. Verify SLO dashboard
# Check error budget is calculating correctly

# 2. Test unified observability
# Click metric → verify logs/traces open

# 3. Test multi-tenancy
# Login as different users
# Verify folder permissions work

# 4. Verify provisioning
kubectl get configmaps -n monitoring | grep grafana

# 5. Test alert routing
# Trigger alert → verify notification sent
```

---

## 🎯 Challenge Tasks

### Challenge 1: Custom Plugin
```
Create custom panel plugin:
- Visualize data in unique way
- Package and install
```

### Challenge 2: Advanced SLO
```
Implement multi-SLO dashboard:
- Availability SLO
- Latency SLO (p95, p99)
- Throughput SLO
- Combined error budget
```

### Challenge 3: GitOps Pipeline
```
Create CI/CD for dashboards:
- Store dashboards in Git
- Validate JSON
- Auto-deploy to Grafana
```

---

## 📚 Key Takeaways

✅ **SLO/SLI dashboards** track reliability metrics  
✅ **Unified observability** correlates metrics, logs, traces  
✅ **Advanced alerting** uses multi-dimensional rules  
✅ **Multi-tenancy** isolates teams with RBAC  
✅ **Provisioning** enables GitOps workflows  
✅ **Performance optimization** critical at scale  
✅ **Executive dashboards** show business impact  
✅ **Exemplars** link metrics to traces  

---

## 📖 Next Steps

**Continue Learning:**
- Grafana Enterprise features
- Custom plugin development
- Advanced Loki queries
- Tempo trace analysis
- Grafana Cloud

---

## 📝 Lab Completion Checklist

- [ ] Created SLO/SLI dashboard
- [ ] Configured error budget tracking
- [ ] Built unified observability dashboard
- [ ] Set up multi-dimensional alerts
- [ ] Configured multi-tenancy with RBAC
- [ ] Implemented dashboard provisioning
- [ ] Optimized query performance
- [ ] Created executive dashboard
- [ ] Tested exemplars (metrics to traces)
- [ ] Completed challenge tasks

**Congratulations! You've mastered advanced Grafana dashboards!** 🎉

---

## 🌟 Advanced Dashboard Gallery

You've now created:

1. **SLO Dashboard** - Track reliability and error budgets
2. **Unified Observability** - Metrics + Logs + Traces
3. **Multi-Tenant Dashboard** - Team isolation with RBAC
4. **Executive Dashboard** - Business KPIs and costs
5. **Performance Optimized** - Fast queries at scale

**You're now a Grafana expert!** 🚀
