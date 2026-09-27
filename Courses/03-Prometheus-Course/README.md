# Prometheus - Monitoring and Alerting Course

## 📚 Course Overview

Master Prometheus, the leading open-source monitoring and alerting system for cloud-native applications. Learn to collect metrics, create dashboards, set up alerts, and monitor Kubernetes clusters effectively.

## 🎯 Learning Objectives

- ✅ Install and configure Prometheus
- ✅ Understand the Prometheus data model
- ✅ Write PromQL queries
- ✅ Create recording and alerting rules
- ✅ Monitor Kubernetes with Prometheus
- ✅ Integrate with Alertmanager
- ✅ Export metrics from applications
- ✅ Implement best practices

## 📋 Course Structure

### Module 1: Prometheus Fundamentals
- **Lab 1.1**: Installing Prometheus
- **Lab 1.2**: Understanding Metrics and Labels
- **Lab 1.3**: Prometheus Configuration

### Module 2: PromQL Mastery
- **Lab 2.1**: Basic PromQL Queries
- **Lab 2.2**: Advanced PromQL Functions
- **Lab 2.3**: Query Optimization

### Module 3: Kubernetes Monitoring
- **Lab 3.1**: Prometheus Operator
- **Lab 3.2**: ServiceMonitors and PodMonitors
- **Lab 3.3**: kube-state-metrics

### Module 4: Alerting
- **Lab 4.1**: Creating Alert Rules
- **Lab 4.2**: Alertmanager Configuration
- **Lab 4.3**: Alert Routing and Silencing

### Module 5: Advanced Topics
- **Lab 5.1**: Custom Exporters
- **Lab 5.2**: High Availability Setup
- **Lab 5.3**: Long-term Storage

## 🛠️ Prerequisites

- Kubernetes cluster
- kubectl and Helm
- Basic understanding of metrics
- Familiarity with YAML

## 🚀 Quick Start

```bash
# Install Prometheus using Helm
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/kube-prometheus-stack

# Access Prometheus UI
kubectl port-forward svc/prometheus-kube-prometheus-prometheus 9090:9090
```

## 📚 Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [PromQL Basics](https://prometheus.io/docs/prometheus/latest/querying/basics/)

---

**Course Version**: 1.0  
**Prometheus Version**: 2.45+
