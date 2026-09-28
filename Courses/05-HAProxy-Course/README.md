# HAProxy - Load Balancing and High Availability Course

## 📚 Course Overview

This comprehensive HAProxy course provides hands-on experience with load balancing, high availability, and traffic management for Kubernetes applications. Learn how to deploy and configure HAProxy for production-grade traffic distribution.

## 🎯 Learning Objectives

By completing this course, you will be able to:
- ✅ Understand load balancing concepts and algorithms
- ✅ Install and configure HAProxy on Kubernetes
- ✅ Implement Layer 4 and Layer 7 load balancing
- ✅ Configure health checks and failover
- ✅ Use HAProxy for Ingress control
- ✅ Monitor HAProxy with metrics and stats
- ✅ Implement SSL/TLS termination
- ✅ Configure advanced routing and ACLs

## 📋 Course Structure

### Module 1: HAProxy Fundamentals
- **Lab 1.1**: Installing HAProxy on Kubernetes
- **Lab 1.2**: Understanding Load Balancing Algorithms
- **Lab 1.3**: HAProxy Configuration Basics

### Module 2: Load Balancing Strategies
- **Lab 2.1**: Layer 4 (TCP) Load Balancing
- **Lab 2.2**: Layer 7 (HTTP) Load Balancing
- **Lab 2.3**: Health Checks and Backend Management

### Module 3: Advanced Features
- **Lab 3.1**: SSL/TLS Termination
- **Lab 3.2**: ACLs and Content-Based Routing
- **Lab 3.3**: Rate Limiting and DDoS Protection

### Module 4: High Availability
- **Lab 4.1**: HAProxy with Keepalived
- **Lab 4.2**: Session Persistence and Sticky Sessions
- **Lab 4.3**: Zero-Downtime Deployments

### Module 5: Monitoring and Troubleshooting
- **Lab 5.1**: HAProxy Stats and Metrics
- **Lab 5.2**: Prometheus Integration
- **Lab 5.3**: Troubleshooting and Debugging

## 🛠️ Prerequisites

### Required Tools
- Kubernetes cluster (minikube, kind, or cloud)
- kubectl configured
- Helm 3.x installed
- Basic understanding of networking

### Knowledge Prerequisites
- Kubernetes Services and Ingress
- Basic networking concepts (TCP/IP, HTTP)
- Load balancing fundamentals

## 📖 What is HAProxy?

**HAProxy** (High Availability Proxy) is a free, open-source load balancer and proxy server for TCP and HTTP applications.

### Key Features

```
┌─────────────────────────────────────────────────────────┐
│                  HAProxy Architecture                   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Clients                                         │  │
│  └───────────────────┬──────────────────────────────┘  │
│                      │                                  │
│                      ▼                                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  HAProxy (Load Balancer)                        │  │
│  │  • Layer 4 (TCP) and Layer 7 (HTTP)             │  │
│  │  • Health Checks                                 │  │
│  │  • SSL Termination                               │  │
│  │  • ACLs and Routing                              │  │
│  └───────────┬──────────────┬───────────────────────┘  │
│              │              │                           │
│              ▼              ▼                           │
│  ┌──────────────┐  ┌──────────────┐                   │
│  │  Backend 1   │  │  Backend 2   │  ...              │
│  │  (Pod/Svc)   │  │  (Pod/Svc)   │                   │
│  └──────────────┘  └──────────────┘                   │
└─────────────────────────────────────────────────────────┘
```

### HAProxy vs Other Load Balancers

| Feature | HAProxy | Nginx | Envoy |
|---------|---------|-------|-------|
| **Performance** | Excellent | Excellent | Good |
| **Layer 4** | ✅ Native | ✅ Native | ✅ Native |
| **Layer 7** | ✅ Native | ✅ Native | ✅ Native |
| **Configuration** | Text-based | Text-based | YAML/API |
| **Stats UI** | Built-in | Module | Admin API |
| **SSL/TLS** | ✅ Full support | ✅ Full support | ✅ Full support |
| **Use Case** | Load balancing | Web server + LB | Service mesh |

## 🎓 Why Learn HAProxy?

### Benefits
- **High Performance**: Handles millions of connections
- **Reliability**: Battle-tested in production
- **Flexibility**: Layer 4 and Layer 7 load balancing
- **Observability**: Built-in stats and metrics
- **Feature-Rich**: ACLs, health checks, SSL termination
- **Open Source**: Free and widely supported

### Use Cases
- **Kubernetes Ingress**: Alternative to Nginx Ingress
- **API Gateway**: Route and load balance APIs
- **Database Load Balancing**: Distribute database connections
- **High Availability**: Failover and redundancy
- **SSL Offloading**: Centralized SSL/TLS termination

## 🚀 Quick Start

### Install HAProxy Ingress Controller
```bash
# Add HAProxy Ingress Helm repository
helm repo add haproxytech https://haproxytech.github.io/helm-charts
helm repo update

# Install HAProxy Ingress Controller
helm install haproxy-ingress haproxytech/kubernetes-ingress \
  --namespace haproxy-controller \
  --create-namespace
```

### Deploy Sample Application
```bash
# Create deployment
kubectl create deployment web --image=nginx --replicas=3

# Expose as service
kubectl expose deployment web --port=80

# Create Ingress
kubectl create ingress web --class=haproxy \
  --rule="web.example.com/*=web:80"
```

## 📊 Course Difficulty Distribution

```
Beginner (⭐):           3 labs  (20%)
Intermediate (⭐⭐):      6 labs  (40%)
Advanced (⭐⭐⭐):         6 labs  (40%)
```

## 🎯 Learning Paths

### Path 1: Load Balancing Basics
**Goal**: Understand load balancing fundamentals  
**Time**: ~6 hours  
**Labs**: Module 1, 2

### Path 2: Production HAProxy
**Goal**: Deploy production-ready load balancer  
**Time**: ~10 hours  
**Labs**: Module 1, 2, 3, 4

### Path 3: HAProxy Expert
**Goal**: Master all HAProxy features  
**Time**: ~15 hours  
**Labs**: All modules

## 📚 Additional Resources

### Official Documentation
- [HAProxy Documentation](https://www.haproxy.org/documentation.html)
- [HAProxy Ingress Controller](https://haproxy-ingress.github.io/)
- [HAProxy Configuration Manual](https://cbonte.github.io/haproxy-dconv/)

### Community
- [HAProxy Discourse](https://discourse.haproxy.org/)
- [GitHub](https://github.com/haproxy/haproxy)

## 🚀 Let's Begin!

Start with [Lab 1.1: Installing HAProxy on Kubernetes](labs/lab-1.1-haproxy-installation.md)

---

**Course Version**: 1.0  
**Last Updated**: September 28, 2026  
**HAProxy Version**: 2.8+
