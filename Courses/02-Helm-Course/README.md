# Helm - The Kubernetes Package Manager Course

## 📚 Course Overview

This comprehensive Helm course provides hands-on experience with Kubernetes package management, from basic chart deployment to creating custom charts and managing complex applications. Master Helm to simplify Kubernetes deployments and manage application lifecycles efficiently.

## 🎯 Learning Objectives

By completing this course, you will be able to:
- ✅ Install and configure Helm on your system
- ✅ Deploy applications using Helm charts
- ✅ Create custom Helm charts from scratch
- ✅ Manage chart repositories and dependencies
- ✅ Use Helm templates and values effectively
- ✅ Perform upgrades, rollbacks, and releases management
- ✅ Implement Helm best practices for production
- ✅ Troubleshoot common Helm issues

## 📋 Course Structure

### Module 1: Helm Fundamentals
- **Lab 1.1**: Installing Helm and First Deployment
- **Lab 1.2**: Understanding Helm Architecture
- **Lab 1.3**: Working with Helm Repositories

### Module 2: Using Helm Charts
- **Lab 2.1**: Deploying Applications with Helm
- **Lab 2.2**: Customizing Charts with Values
- **Lab 2.3**: Managing Releases and Revisions

### Module 3: Creating Helm Charts
- **Lab 3.1**: Creating Your First Chart
- **Lab 3.2**: Helm Templates and Functions
- **Lab 3.3**: Chart Dependencies and Subcharts

### Module 4: Advanced Helm
- **Lab 4.1**: Helm Hooks and Lifecycle Management
- **Lab 4.2**: Chart Testing and Validation
- **Lab 4.3**: Helm Plugins and Extensions

### Module 5: Production Best Practices
- **Lab 5.1**: Securing Helm Deployments
- **Lab 5.2**: CI/CD Integration with Helm
- **Lab 5.3**: Helm Troubleshooting and Debugging

## 🛠️ Prerequisites

### Required Tools
- Kubernetes cluster (minikube, kind, or cloud)
- kubectl configured
- Helm 3.x installed
- Basic understanding of Kubernetes

### Knowledge Prerequisites
- Kubernetes fundamentals (Pods, Deployments, Services)
- YAML syntax
- Basic command line skills
- Understanding of package managers

## 📖 What is Helm?

**Helm** is the package manager for Kubernetes, often called "the apt/yum/homebrew for Kubernetes."

### Key Concepts

```
┌─────────────────────────────────────────────────────────┐
│                    Helm Architecture                    │
│                                                         │
│  ┌──────────┐                                          │
│  │   Helm   │  ← CLI tool (your computer)             │
│  │   CLI    │                                          │
│  └────┬─────┘                                          │
│       │                                                 │
│       │ Commands                                        │
│       ▼                                                 │
│  ┌──────────────────────────────────────┐             │
│  │      Kubernetes Cluster              │             │
│  │                                      │             │
│  │  ┌────────────┐  ┌────────────┐    │             │
│  │  │  Release   │  │  Release   │    │             │
│  │  │  (nginx)   │  │  (mysql)   │    │             │
│  │  └────────────┘  └────────────┘    │             │
│  │                                      │             │
│  │  Releases = Deployed Charts          │             │
│  └──────────────────────────────────────┘             │
│                                                         │
│  ┌──────────────────────────────────────┐             │
│  │      Chart Repository                │             │
│  │  (artifact hub, private repos)       │             │
│  │                                      │             │
│  │  Charts = Kubernetes YAML templates  │             │
│  └──────────────────────────────────────┘             │
└─────────────────────────────────────────────────────────┘
```

### Helm Terminology

| Term | Definition | Example |
|------|------------|---------|
| **Chart** | Package of Kubernetes resources | nginx chart |
| **Release** | Instance of a chart running in cluster | my-nginx-release |
| **Repository** | Collection of charts | Artifact Hub |
| **Values** | Configuration for a chart | replicas: 3 |
| **Template** | Kubernetes YAML with placeholders | deployment.yaml |

## 🎓 Why Learn Helm?

### Without Helm
```yaml
# Must manage multiple YAML files
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f configmap.yaml
kubectl apply -f ingress.yaml
# Hard to version, upgrade, or rollback
```

### With Helm
```bash
# One command to deploy everything
helm install my-app ./my-chart

# Easy upgrades
helm upgrade my-app ./my-chart

# Simple rollbacks
helm rollback my-app 1
```

### Benefits
- 📦 **Package Management**: Bundle related Kubernetes resources
- 🔄 **Version Control**: Track releases and rollback easily
- 🎨 **Templating**: Reuse charts with different configurations
- 📚 **Repository System**: Share and discover charts
- 🚀 **Simplified Deployments**: One command for complex apps
- 🔧 **Configuration Management**: Separate config from templates

## 🚀 Quick Start

### Install Helm
```bash
# macOS
brew install helm

# Linux
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Windows
choco install kubernetes-helm
```

### Your First Helm Command
```bash
# Add a chart repository
helm repo add bitnami https://charts.bitnami.com/bitnami

# Search for charts
helm search repo nginx

# Install a chart
helm install my-nginx bitnami/nginx

# List releases
helm list
```

## 📊 Course Difficulty Distribution

```
Beginner (⭐):           3 labs  (20%)
Intermediate (⭐⭐):      6 labs  (40%)
Advanced (⭐⭐⭐):         6 labs  (40%)
```

## 🎯 Learning Paths

### Path 1: Helm User (Quick Start)
**Goal**: Deploy applications with Helm  
**Time**: ~4 hours  
**Labs**: 1.1, 1.3, 2.1, 2.2, 2.3

### Path 2: Chart Developer
**Goal**: Create custom Helm charts  
**Time**: ~8 hours  
**Labs**: All Module 1, 2, and 3 labs

### Path 3: Helm Expert
**Goal**: Production-ready Helm mastery  
**Time**: ~12 hours  
**Labs**: All labs

## 📚 Additional Resources

### Official Documentation
- [Helm Documentation](https://helm.sh/docs/)
- [Artifact Hub](https://artifacthub.io/)
- [Helm Charts GitHub](https://github.com/helm/charts)

### Community
- [Helm Slack](https://kubernetes.slack.com/messages/helm-users)
- [Helm GitHub](https://github.com/helm/helm)

## 🚀 Let's Begin!

Start with [Lab 1.1: Installing Helm and First Deployment](labs/lab-1.1-helm-installation.md)

---

**Course Version**: 1.0  
**Last Updated**: September 27, 2026  
**Helm Version**: 3.x
