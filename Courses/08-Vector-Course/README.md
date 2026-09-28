# Vector - High-Performance Observability Pipeline Course

## 📚 Course Overview

Master Vector, a high-performance observability data pipeline for collecting, transforming, and routing logs, metrics, and traces. Learn to build efficient data pipelines for cloud-native observability.

## 🎯 Learning Objectives

- ✅ Install and configure Vector
- ✅ Understand Vector's data model
- ✅ Collect logs from multiple sources
- ✅ Transform and enrich data
- ✅ Route data to multiple destinations
- ✅ Implement Vector in Kubernetes
- ✅ Optimize performance
- ✅ Monitor Vector itself

## 📋 Course Structure

### Module 1: Vector Fundamentals
- **Lab 1.1**: Installing Vector
- **Lab 1.2**: Vector Configuration Basics
- **Lab 1.3**: Sources, Transforms, and Sinks

### Module 2: Log Collection
- **Lab 2.1**: Collecting Kubernetes Logs
- **Lab 2.2**: File and Syslog Sources
- **Lab 2.3**: Structured Logging

### Module 3: Data Transformation
- **Lab 3.1**: Parsing and Filtering
- **Lab 3.2**: Enrichment and Aggregation
- **Lab 3.3**: VRL (Vector Remap Language)

### Module 4: Routing and Sinks
- **Lab 4.1**: Multiple Destinations
- **Lab 4.2**: Elasticsearch and Loki
- **Lab 4.3**: Cloud Storage Sinks

### Module 5: Production Deployment
- **Lab 5.1**: Vector in Kubernetes
- **Lab 5.2**: High Availability
- **Lab 5.3**: Performance Tuning

## 🛠️ Prerequisites

- Kubernetes cluster
- Basic understanding of logging
- Familiarity with YAML/TOML

## 🚀 Quick Start

```bash
# Install Vector using Helm
helm repo add vector https://helm.vector.dev
helm install vector vector/vector

# Check Vector status
kubectl get pods -l app.kubernetes.io/name=vector
```

## 📚 Resources

- [Vector Documentation](https://vector.dev/docs/)
- [VRL Reference](https://vector.dev/docs/reference/vrl/)

---

**Course Version**: 1.0  
**Vector Version**: 0.34+
