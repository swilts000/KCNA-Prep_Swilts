# Portainer - Container & Kubernetes Management Course

## 📚 Course Overview
Portainer provides a powerful web-based UI for managing both containers and Kubernetes clusters. This course covers team-based management, RBAC, and enterprise features.

## 🎯 Key Features
- Web-based interface
- Container and Kubernetes management
- RBAC and team management
- Application templates
- GitOps integration
- Business/Enterprise features

## 📋 Planned Labs (15 total)
- Lab 1.1: Installing Portainer on Kubernetes
- Lab 1.2: User and Team Management
- Lab 2.1: Application Deployment
- Lab 2.2: Template Management
- Lab 3.1: RBAC Configuration
- Lab 3.2: GitOps Integration
- Lab 4.1: Multi-Cluster Management
- Lab 4.2: Monitoring and Alerts
- And more...

## 🚀 Quick Start
```bash
kubectl apply -n portainer -f https://downloads.portainer.io/ce2-19/portainer.yaml
kubectl port-forward -n portainer svc/portainer 9000:9000
# Open http://localhost:9000
```

**Status**: Course structure created, labs to be developed  
**Best For**: Teams, RBAC, template-based deployments
