# Lab 1.1: Installing Vector for Log Collection

## 📚 Related Topics
- Log aggregation
- Observability pipelines
- Data transformation
- Kubernetes logging
- VRL (Vector Remap Language)

## 🎯 Learning Objectives

By the end of this lab, you will be able to:
- Understand Vector's architecture and use cases
- Install Vector on Kubernetes
- Configure Vector to collect Kubernetes logs
- Transform and route log data
- Send logs to multiple destinations
- Use Vector's observability features

## ⏱️ Estimated Time
60-75 minutes

## 📋 Prerequisites

- Running Kubernetes cluster
- kubectl and Helm configured
- Basic understanding of logging
- Familiarity with YAML configuration

---

## 🏗️ Vector Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                  Vector Architecture                         │
└──────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Kubernetes Cluster                                         │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Application Pods                                    │  │
│  │  Writing logs to stdout/stderr                       │  │
│  └───────────────────┬──────────────────────────────────┘  │
│                      │                                      │
│                      ▼                                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Container Runtime (containerd/docker)               │  │
│  │  Writes logs to:                                     │  │
│  │  /var/log/pods/<namespace>_<pod>_<uid>/<container>/ │  │
│  └───────────────────┬──────────────────────────────────┘  │
│                      │                                      │
│                      ▼                                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Vector Agent (DaemonSet)                           │  │
│  │  ┌────────────────────────────────────────────────┐ │  │
│  │  │  Pipeline:                                     │ │  │
│  │  │                                                │ │  │
│  │  │  Sources → Transforms → Sinks                  │ │  │
│  │  │     ↓          ↓           ↓                   │ │  │
│  │  │  [Files]   [Parse]    [Elasticsearch]          │ │  │
│  │  │  [Kubernetes] [Filter]  [Loki]                 │ │  │
│  │  │  [Syslog]  [Enrich]   [S3]                     │ │  │
│  │  │            [Aggregate] [HTTP]                   │ │  │
│  │  └────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

Data Flow:
  1. Sources: Collect data (logs, metrics, traces)
  2. Transforms: Parse, filter, enrich, aggregate
  3. Sinks: Send to destinations (Elasticsearch, Loki, S3, etc.)
```

**Key Concepts:**
- **Sources**: Where data comes from
- **Transforms**: How data is processed
- **Sinks**: Where data goes
- **VRL**: Vector Remap Language for transformations

---

## 📝 Part 1: Understanding Vector

### Step 1.1: What is Vector?

**Vector** is a high-performance observability data pipeline for collecting, transforming, and routing logs, metrics, and traces.

**Vector vs Traditional Log Collectors:**
```
┌─────────────────────────────────────────────────────────┐
│ Feature         │ Fluentd/Fluent Bit │ Vector         │
├─────────────────────────────────────────────────────────┤
│ Language        │ Ruby/C             │ Rust           │
│ Performance     │ Good               │ Excellent      │
│ Memory Usage    │ Higher             │ Lower          │
│ Configuration   │ Ruby DSL           │ TOML/YAML      │
│ Transform Lang  │ Ruby               │ VRL            │
│ Built-in Sinks  │ Many               │ Many           │
│ Reliability     │ Good               │ Excellent      │
└─────────────────────────────────────────────────────────┘
```

**💡 Vector Advantages:**
- **Performance**: Written in Rust
- **Reliability**: Built-in buffering and retries
- **Flexibility**: Powerful transformation language (VRL)
- **Observability**: Built-in metrics and health checks

### Step 1.2: Vector Pipeline Components

```
┌─────────────────────────────────────────────────────────┐
│ Component Type │ Examples                              │
├─────────────────────────────────────────────────────────┤
│ Sources        │ • kubernetes_logs                     │
│                │ • file                                │
│                │ • syslog                              │
│                │ • http                                │
│                │ • prometheus_scrape                   │
├─────────────────────────────────────────────────────────┤
│ Transforms     │ • remap (VRL)                         │
│                │ • filter                              │
│                │ • aggregate                           │
│                │ • dedupe                              │
│                │ • sample                              │
├─────────────────────────────────────────────────────────┤
│ Sinks          │ • elasticsearch                       │
│                │ • loki                                │
│                │ • s3                                  │
│                │ • http                                │
│                │ • console (stdout)                    │
└─────────────────────────────────────────────────────────┘
```

---

## 📝 Part 2: Installing Vector

### Step 2.1: Add Vector Helm Repository

```bash
# Add Vector Helm repository
helm repo add vector https://helm.vector.dev
```

**Expected Output:**
```
"vector" has been added to your repositories
```

```bash
# Update repository
helm repo update
```

**Expected Output:**
```
Hang tight while we grab the latest from your chart repositories...
...Successfully got an update from the "vector" chart repository
Update Complete. ⎈Happy Helming!⎈
```

### Step 2.2: Create Vector Configuration

```bash
# Create values file for Vector
cat <<EOF > vector-values.yaml
# Vector role: Agent (runs on each node)
role: Agent

# Custom configuration
customConfig:
  data_dir: /vector-data-dir
  
  # Source: Collect Kubernetes logs
  sources:
    kubernetes_logs:
      type: kubernetes_logs
      
  # Transform: Parse and enrich logs
  transforms:
    parse_logs:
      type: remap
      inputs:
        - kubernetes_logs
      source: |
        # Parse JSON logs if possible
        if is_string(.message) {
          parsed, err = parse_json(.message)
          if err == null {
            . = merge(., parsed)
          }
        }
        
        # Add custom fields
        .cluster = "my-cluster"
        .environment = "development"
        
    filter_system:
      type: filter
      inputs:
        - parse_logs
      condition: |
        .kubernetes.namespace_name != "kube-system"
  
  # Sink: Output to console (stdout)
  sinks:
    console_output:
      type: console
      inputs:
        - filter_system
      encoding:
        codec: json

# Resource limits
resources:
  requests:
    memory: "256Mi"
    cpu: "100m"
  limits:
    memory: "512Mi"
    cpu: "500m"

# Tolerations to run on all nodes
tolerations:
  - effect: NoSchedule
    operator: Exists
EOF
```

**💡 Configuration Breakdown:**
- **role: Agent**: DaemonSet mode (one pod per node)
- **kubernetes_logs source**: Collects pod logs
- **remap transform**: Parses JSON and adds fields
- **filter transform**: Excludes kube-system logs
- **console sink**: Outputs to stdout (for testing)

### Step 2.3: Install Vector

```bash
# Install Vector
helm install vector vector/vector \
  --namespace vector \
  --create-namespace \
  -f vector-values.yaml
```

**Expected Output:**
```
NAME: vector
LAST DEPLOYED: Sun Sep 27 13:00:00 2026
NAMESPACE: vector
STATUS: deployed
REVISION: 1
NOTES:
Vector is now installed!

To verify the installation, run:
  kubectl get pods -n vector

To view Vector logs:
  kubectl logs -n vector -l app.kubernetes.io/name=vector
```

### Step 2.4: Verify Installation

```bash
# Check Vector pods
kubectl get pods -n vector
```

**Expected Output:**
```
NAME           READY   STATUS    RESTARTS   AGE
vector-xxxxx   1/1     Running   0          1m
vector-yyyyy   1/1     Running   0          1m
vector-zzzzz   1/1     Running   0          1m
```

**💡 One Vector pod per node (DaemonSet)**

```bash
# Check Vector DaemonSet
kubectl get daemonset -n vector
```

**Expected Output:**
```
NAME     DESIRED   CURRENT   READY   UP-TO-DATE   AVAILABLE   NODE SELECTOR   AGE
vector   3         3         3       3            3           <none>          1m
```

---

## 📝 Part 3: Viewing Collected Logs

### Step 3.1: Check Vector Logs

```bash
# View Vector logs (showing collected application logs)
kubectl logs -n vector -l app.kubernetes.io/name=vector --tail=20
```

**Expected Output:**
```json
{"cluster":"my-cluster","environment":"development","kubernetes":{"namespace_name":"default","pod_name":"nginx-xxx","container_name":"nginx"},"message":"10.244.0.1 - - [27/Sep/2026:13:00:00 +0000] \"GET / HTTP/1.1\" 200 612"}
{"cluster":"my-cluster","environment":"development","kubernetes":{"namespace_name":"default","pod_name":"api-xxx","container_name":"api"},"level":"info","message":"Request processed","duration_ms":45}
```

**💡 Logs are:**
- Collected from all pods
- Enriched with Kubernetes metadata
- Filtered (no kube-system logs)
- Output as JSON

### Step 3.2: Deploy Test Application

```bash
# Create test app that generates logs
kubectl create deployment log-generator --image=busybox -- sh -c 'while true; do echo "{\"level\":\"info\",\"message\":\"Test log\",\"timestamp\":\"$(date -Iseconds)\"}"; sleep 5; done'
```

```bash
# Wait a moment, then check Vector logs
kubectl logs -n vector -l app.kubernetes.io/name=vector --tail=5 | grep log-generator
```

**Expected Output:**
```json
{"cluster":"my-cluster","environment":"development","kubernetes":{"namespace_name":"default","pod_name":"log-generator-xxx","container_name":"busybox"},"level":"info","message":"Test log","timestamp":"2026-09-27T13:05:00+00:00"}
```

---

## 📝 Part 4: Configuring Multiple Sinks

### Step 4.1: Update Configuration with Multiple Sinks

```bash
# Update values to add file sink
cat <<EOF > vector-values-multi-sink.yaml
role: Agent

customConfig:
  data_dir: /vector-data-dir
  
  sources:
    kubernetes_logs:
      type: kubernetes_logs
      
  transforms:
    parse_logs:
      type: remap
      inputs:
        - kubernetes_logs
      source: |
        if is_string(.message) {
          parsed, err = parse_json(.message)
          if err == null {
            . = merge(., parsed)
          }
        }
        .cluster = "my-cluster"
        .environment = "development"
        
    # Split logs by level
    error_logs:
      type: filter
      inputs:
        - parse_logs
      condition: '.level == "error" || .level == "ERROR"'
        
    info_logs:
      type: filter
      inputs:
        - parse_logs
      condition: '.level == "info" || .level == "INFO"'
  
  sinks:
    # All logs to console
    console_all:
      type: console
      inputs:
        - parse_logs
      encoding:
        codec: json
        
    # Error logs to file
    file_errors:
      type: file
      inputs:
        - error_logs
      path: /tmp/vector-errors-%Y-%m-%d.log
      encoding:
        codec: json
        
    # Info logs to file
    file_info:
      type: file
      inputs:
        - info_logs
      path: /tmp/vector-info-%Y-%m-%d.log
      encoding:
        codec: json

resources:
  requests:
    memory: "256Mi"
    cpu: "100m"
  limits:
    memory: "512Mi"
    cpu: "500m"

tolerations:
  - effect: NoSchedule
    operator: Exists
EOF
```

**💡 Multiple Sinks:**
- **console_all**: All logs to stdout
- **file_errors**: Error logs to file
- **file_info**: Info logs to file

### Step 4.2: Upgrade Vector

```bash
# Upgrade Vector with new configuration
helm upgrade vector vector/vector \
  --namespace vector \
  -f vector-values-multi-sink.yaml
```

**Expected Output:**
```
Release "vector" has been upgraded. Happy Helming!
```

```bash
# Wait for pods to restart
kubectl rollout status daemonset/vector -n vector
```

---

## 📝 Part 5: Using VRL (Vector Remap Language)

### Step 5.1: Advanced VRL Transformations

```yaml
# Example VRL transformations
transforms:
  advanced_parsing:
    type: remap
    inputs:
      - kubernetes_logs
    source: |
      # Parse timestamp
      .timestamp = parse_timestamp!(.timestamp, format: "%+")
      
      # Extract fields from message
      if contains(string!(.message), "duration") {
        .duration_ms = parse_regex!(.message, r'duration=(?P<duration>\d+)ms')
        .duration_ms = to_int!(.duration_ms.duration)
      }
      
      # Normalize log level
      .level = upcase(string!(.level) ?? "INFO")
      
      # Add severity
      .severity = if .level == "ERROR" {
        "high"
      } else if .level == "WARN" {
        "medium"
      } else {
        "low"
      }
      
      # Remove sensitive data
      if exists(.password) {
        .password = "REDACTED"
      }
      
      # Add hostname
      .hostname = get_hostname!()
```

**💡 VRL Functions:**
- `parse_timestamp!()`: Parse timestamps
- `parse_regex!()`: Extract with regex
- `to_int!()`: Type conversion
- `upcase()`: String manipulation
- `exists()`: Check field existence
- `get_hostname!()`: System info

### Step 5.2: Test VRL in Vector

```bash
# Create test configuration
cat <<EOF > test-vrl.yaml
role: Agent

customConfig:
  data_dir: /vector-data-dir
  
  sources:
    kubernetes_logs:
      type: kubernetes_logs
      
  transforms:
    test_vrl:
      type: remap
      inputs:
        - kubernetes_logs
      source: |
        # Parse JSON message
        if is_string(.message) {
          parsed, err = parse_json(.message)
          if err == null {
            . = merge(., parsed)
          }
        }
        
        # Extract namespace and pod
        .k8s_namespace = .kubernetes.namespace_name
        .k8s_pod = .kubernetes.pod_name
        
        # Create log ID
        .log_id = sha2(join!([.k8s_namespace, .k8s_pod, to_string(.timestamp)]))
        
        # Add tags
        .tags = []
        if .k8s_namespace == "production" {
          .tags = push(.tags, "prod")
        }
        if exists(.error) {
          .tags = push(.tags, "error")
        }
  
  sinks:
    console:
      type: console
      inputs:
        - test_vrl
      encoding:
        codec: json

resources:
  requests:
    memory: "256Mi"
    cpu: "100m"
  limits:
    memory: "512Mi"
    cpu: "500m"
EOF
```

---

## 📝 Part 6: Vector Observability

### Step 6.1: Enable Vector Metrics

```bash
# Vector exposes Prometheus metrics by default
# Port forward to Vector metrics endpoint
kubectl port-forward -n vector daemonset/vector 9090:9090
```

```bash
# View Vector metrics
curl http://localhost:9090/metrics | grep vector_
```

**Expected Output:**
```
# HELP vector_buffer_events Total number of events in buffer
# TYPE vector_buffer_events gauge
vector_buffer_events{component_id="console_output"} 0

# HELP vector_component_received_events_total Total events received
# TYPE vector_component_received_events_total counter
vector_component_received_events_total{component_id="kubernetes_logs"} 1234

# HELP vector_component_sent_events_total Total events sent
# TYPE vector_component_sent_events_total counter
vector_component_sent_events_total{component_id="console_output"} 1234
```

**💡 Key Metrics:**
- `vector_component_received_events_total`: Events received by component
- `vector_component_sent_events_total`: Events sent by component
- `vector_buffer_events`: Events in buffer
- `vector_component_errors_total`: Errors encountered

### Step 6.2: Check Vector Health

```bash
# Vector health endpoint
curl http://localhost:9090/health
```

**Expected Output:**
```json
{"status":"ok"}
```

---

## ✅ Validation Steps

```bash
# 1. Verify Vector pods are running
kubectl get pods -n vector

# 2. Check Vector is collecting logs
kubectl logs -n vector -l app.kubernetes.io/name=vector --tail=10

# 3. Verify test app logs are collected
kubectl logs -n vector -l app.kubernetes.io/name=vector | grep log-generator

# 4. Check Vector metrics
kubectl port-forward -n vector daemonset/vector 9090:9090 &
curl http://localhost:9090/metrics | grep vector_component_received_events_total

# 5. Verify configuration
kubectl get configmap -n vector vector -o yaml
```

---

## 🧹 Cleanup

```bash
# Delete test deployment
kubectl delete deployment log-generator

# Uninstall Vector
helm uninstall vector -n vector

# Delete namespace
kubectl delete namespace vector

# Remove values files
rm vector-values.yaml vector-values-multi-sink.yaml test-vrl.yaml
```

---

## 🎯 Challenge Tasks

1. **Send Logs to Elasticsearch**
   ```yaml
   sinks:
     elasticsearch:
       type: elasticsearch
       inputs:
         - parse_logs
       endpoint: "http://elasticsearch:9200"
       index: "logs-%Y.%m.%d"
   ```

2. **Aggregate Logs**
   ```yaml
   transforms:
     aggregate_errors:
       type: aggregate
       inputs:
         - error_logs
       interval_ms: 60000
       group_by:
         - kubernetes.namespace_name
         - level
   ```

3. **Sample High-Volume Logs**
   ```yaml
   transforms:
     sample_logs:
       type: sample
       inputs:
         - parse_logs
       rate: 10  # Keep 1 in 10 logs
   ```

---

## 🐛 Troubleshooting

### Issue: Vector pods not starting

**Solution:**
```bash
# Check pod events
kubectl describe pod -n vector vector-xxxxx

# Check logs
kubectl logs -n vector vector-xxxxx

# Verify configuration
kubectl get configmap -n vector vector -o yaml
```

### Issue: No logs collected

**Solution:**
```bash
# Verify Vector has access to log files
kubectl exec -n vector vector-xxxxx -- ls /var/log/pods

# Check Vector source configuration
kubectl logs -n vector vector-xxxxx | grep "kubernetes_logs"

# Verify permissions
kubectl get sa -n vector
kubectl describe sa -n vector vector
```

### Issue: VRL syntax errors

**Solution:**
```bash
# Check Vector logs for VRL errors
kubectl logs -n vector vector-xxxxx | grep -i "vrl"

# Test VRL locally with Vector CLI
# Install Vector locally and use: vector vrl
```

---

## 📚 Key Takeaways

✅ **Vector** is a high-performance observability pipeline  
✅ **Sources** collect data from various inputs  
✅ **Transforms** process and enrich data  
✅ **Sinks** send data to destinations  
✅ **VRL** provides powerful data transformation  
✅ **DaemonSet** deployment collects logs from all nodes  
✅ **Multiple sinks** enable routing to different destinations  
✅ **Built-in metrics** provide observability  

---

## 📖 Next Steps

Continue to [Lab 2.1: Advanced Log Processing with VRL](lab-2.1-vrl-advanced.md)

---

## 📝 Lab Completion Checklist

- [ ] Installed Vector using Helm
- [ ] Verified Vector pods are running
- [ ] Viewed collected logs
- [ ] Configured multiple sinks
- [ ] Used VRL transformations
- [ ] Enabled Vector metrics
- [ ] Tested log filtering
- [ ] Deployed test application
- [ ] Completed challenge tasks

**Congratulations! You've mastered Vector installation and log collection!** 🎉
