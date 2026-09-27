# Grafana - Visualization and Dashboarding Course

## 📚 Course Overview

Learn to create stunning dashboards and visualizations with Grafana. Master data source integration, dashboard creation, alerting, and advanced visualization techniques for monitoring cloud-native applications.

## 🎯 Learning Objectives

- ✅ Install and configure Grafana
- ✅ Connect multiple data sources
- ✅ Create interactive dashboards
- ✅ Build custom panels and visualizations
- ✅ Implement dashboard variables
- ✅ Set up Grafana alerts
- ✅ Share and export dashboards
- ✅ Manage users and permissions

## 📋 Course Structure

### Module 1: Grafana Basics
- **Lab 1.1**: Installing Grafana
- **Lab 1.2**: Data Source Configuration
- **Lab 1.3**: First Dashboard

### Module 2: Dashboard Creation
- **Lab 2.1**: Panel Types and Visualizations
- **Lab 2.2**: Dashboard Variables
- **Lab 2.3**: Template Dashboards

### Module 3: Advanced Visualizations
- **Lab 3.1**: Custom Queries and Transformations
- **Lab 3.2**: Annotations and Events
- **Lab 3.3**: Dashboard Linking

### Module 4: Alerting
- **Lab 4.1**: Grafana Alerts
- **Lab 4.2**: Notification Channels
- **Lab 4.3**: Alert Rules Management

### Module 5: Production Setup
- **Lab 5.1**: High Availability
- **Lab 5.2**: Authentication and Authorization
- **Lab 5.3**: Dashboard as Code

## 🛠️ Prerequisites

- Prometheus or other data source
- Kubernetes cluster
- Basic understanding of metrics

## 🚀 Quick Start

```bash
# Install Grafana using Helm
helm repo add grafana https://grafana.github.io/helm-charts
helm install grafana grafana/grafana

# Get admin password
kubectl get secret grafana -o jsonpath="{.data.admin-password}" | base64 --decode

# Access Grafana
kubectl port-forward svc/grafana 3000:80
```

## 📚 Resources

- [Grafana Documentation](https://grafana.com/docs/)
- [Dashboard Examples](https://grafana.com/grafana/dashboards/)

---

**Course Version**: 1.0  
**Grafana Version**: 10.0+
