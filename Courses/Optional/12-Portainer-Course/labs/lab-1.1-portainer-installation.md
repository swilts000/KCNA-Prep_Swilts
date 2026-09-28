# Lab 1.1: Installing and Using Portainer - Container & Kubernetes Management

## 📚 Related Topics
- Web-based Kubernetes management
- Container management
- RBAC and team management
- Application templates
- Multi-environment management

## 🎯 Learning Objectives

By the end of this lab, you will be able to:
- Install Portainer on Kubernetes
- Access the Portainer web interface
- Manage Kubernetes resources via web UI
- Deploy applications using templates
- Configure user access and RBAC
- Monitor cluster health
- Manage multiple environments

## ⏱️ Estimated Time
45-60 minutes

## 📋 Prerequisites

- Running Kubernetes cluster
- kubectl configured
- Basic understanding of Kubernetes concepts

---

## 📝 Part 1: Installing Portainer

### Step 1.1: Install Portainer

```bash
# Create namespace
kubectl create namespace portainer

# Install Portainer
kubectl apply -n portainer -f https://downloads.portainer.io/ce2-19/portainer.yaml
```

**Expected Output:**
```
namespace/portainer created
serviceaccount/portainer-sa-clusteradmin created
clusterrolebinding.rbac.authorization.k8s.io/portainer created
service/portainer created
deployment.apps/portainer created
```

### Step 1.2: Verify Installation

```bash
# Check pods
kubectl get pods -n portainer

# Check service
kubectl get svc -n portainer
```

**Expected Output:**
```
NAME                         READY   STATUS    RESTARTS   AGE
portainer-7d4b7b9c4d-xxxxx   1/1     Running   0          1m

NAME        TYPE       CLUSTER-IP      EXTERNAL-IP   PORT(S)                         AGE
portainer   NodePort   10.96.123.45    <none>        9000:30777/TCP,8000:30776/TCP   1m
```

### Step 1.3: Access Portainer

```bash
# Port forward to access locally
kubectl port-forward -n portainer svc/portainer 9000:9000
```

**Access Portainer:**
- URL: http://localhost:9000
- Create admin account on first access

---

## 📝 Part 2: Initial Setup

### Step 2.1: Create Admin User

**On first access:**
```
Username: admin
Password: <your-secure-password>
Confirm Password: <your-secure-password>

[Create User]
```

### Step 2.2: Connect to Kubernetes

**Portainer auto-detects:**
```
Environment detected: Kubernetes
Cluster: local

[Connect]
```

**Dashboard loads showing:**
- Cluster overview
- Resource counts
- Quick actions

---

## 📝 Part 3: Navigating Portainer

### Step 3.1: Dashboard Overview

**Main sections:**
- **Namespaces**: View and manage namespaces
- **Applications**: Deployments, StatefulSets, DaemonSets
- **Services**: ClusterIP, NodePort, LoadBalancer
- **Ingresses**: Ingress rules
- **ConfigMaps & Secrets**: Configuration management
- **Volumes**: PVs and PVCs
- **Cluster**: Nodes, resource pools

### Step 3.2: View Applications

```
1. Click "Applications"
2. See list of deployments
3. Filter by namespace
```

**Application List:**
- Name, Namespace, Replicas, Status
- Quick actions: Scale, Edit, Delete

---

## 📝 Part 4: Deploying Applications

### Step 4.1: Deploy from Form

```
1. Applications → Add application
2. Fill form:
   Name: nginx-app
   Image: nginx:latest
   Replicas: 3
3. Click "Deploy application"
```

### Step 4.2: Deploy from Manifest

```
1. Applications → Create from manifest
2. Paste YAML
3. Deploy
```

### Step 4.3: Use Application Templates

```
1. App Templates
2. Select template (e.g., WordPress)
3. Configure
4. Deploy
```

---

## 📝 Part 5: RBAC and Teams

### Step 5.1: Create Team

```
1. Settings → Teams
2. Add team: "Developers"
3. Assign users
```

### Step 5.2: Configure Access

```
1. Namespaces → Select namespace
2. Access control
3. Grant team permissions
```

---

## ✅ Validation Steps

```bash
# 1. Verify Portainer is running
kubectl get pods -n portainer

# 2. Access web UI
# Open http://localhost:9000

# 3. Deploy test application
# Use Portainer UI to deploy nginx

# 4. Verify deployment
kubectl get deployments
```

---

## 📚 Key Takeaways

✅ **Portainer** provides web-based Kubernetes management  
✅ **Easy deployment** via forms or YAML  
✅ **RBAC** for team-based access control  
✅ **Templates** simplify common deployments  
✅ **Multi-environment** support  

---

## 📝 Lab Completion Checklist

- [ ] Installed Portainer
- [ ] Accessed web interface
- [ ] Created admin user
- [ ] Deployed application
- [ ] Configured RBAC
- [ ] Used application template

**Congratulations! You've mastered Portainer basics!** 🎉
