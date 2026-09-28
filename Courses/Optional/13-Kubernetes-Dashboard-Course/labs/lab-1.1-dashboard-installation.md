# Lab 1.1: Installing and Using Kubernetes Dashboard - Official Web UI

## 📚 Related Topics
- Official Kubernetes web interface
- Resource visualization
- YAML editing
- Metrics integration
- Secure access

## 🎯 Learning Objectives

By the end of this lab, you will be able to:
- Install Kubernetes Dashboard
- Configure secure access
- Navigate the dashboard interface
- View and manage resources
- Edit YAML in the browser
- Monitor cluster metrics
- Troubleshoot common issues

## ⏱️ Estimated Time
45-60 minutes

## 📋 Prerequisites

- Running Kubernetes cluster
- kubectl configured
- Basic understanding of Kubernetes

---

## 📝 Part 1: Installing Kubernetes Dashboard

### Step 1.1: Install Dashboard

```bash
# Install Kubernetes Dashboard
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.7.0/aio/deploy/recommended.yaml
```

**Expected Output:**
```
namespace/kubernetes-dashboard created
serviceaccount/kubernetes-dashboard created
service/kubernetes-dashboard created
secret/kubernetes-dashboard-certs created
secret/kubernetes-dashboard-csrf created
secret/kubernetes-dashboard-key-holder created
configmap/kubernetes-dashboard-settings created
role.rbac.authorization.k8s.io/kubernetes-dashboard created
clusterrole.rbac.authorization.k8s.io/kubernetes-dashboard created
rolebinding.rbac.authorization.k8s.io/kubernetes-dashboard created
clusterrolebinding.rbac.authorization.k8s.io/kubernetes-dashboard created
deployment.apps/kubernetes-dashboard created
service/dashboard-metrics-scraper created
deployment.apps/dashboard-metrics-scraper created
```

### Step 1.2: Verify Installation

```bash
# Check pods
kubectl get pods -n kubernetes-dashboard

# Check services
kubectl get svc -n kubernetes-dashboard
```

**Expected Output:**
```
NAME                                         READY   STATUS    RESTARTS   AGE
dashboard-metrics-scraper-7d4b7b9c4d-xxxxx   1/1     Running   0          1m
kubernetes-dashboard-7d4b7b9c4d-xxxxx        1/1     Running   0          1m
```

---

## 📝 Part 2: Accessing the Dashboard

### Step 2.1: Create Service Account

```bash
# Create service account
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ServiceAccount
metadata:
  name: admin-user
  namespace: kubernetes-dashboard
