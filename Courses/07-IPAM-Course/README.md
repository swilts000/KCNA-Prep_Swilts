# IPAM - IP Address Management Course

## 📚 Course Overview

This comprehensive IPAM (IP Address Management) course provides hands-on experience with IP address allocation, management, and automation in Kubernetes environments. Learn how to implement efficient IP address management for cloud-native applications.

## 🎯 Learning Objectives

By completing this course, you will be able to:
- ✅ Understand IPAM concepts and importance
- ✅ Install and configure MetalLB for bare-metal load balancing
- ✅ Implement IP address pools and allocation
- ✅ Configure Calico IPAM for pod networking
- ✅ Manage IP address conflicts and exhaustion
- ✅ Implement dual-stack (IPv4/IPv6) networking
- ✅ Monitor and troubleshoot IP allocation
- ✅ Integrate IPAM with service meshes

## 📋 Course Structure

### Module 1: IPAM Fundamentals
- **Lab 1.1**: Understanding IPAM and IP Allocation
- **Lab 1.2**: MetalLB Installation and Configuration
- **Lab 1.3**: IP Address Pool Management

### Module 2: CNI and IPAM
- **Lab 2.1**: Calico IPAM Configuration
- **Lab 2.2**: Custom IP Pools for Namespaces
- **Lab 2.3**: IP Address Block Management

### Module 3: Advanced IPAM
- **Lab 3.1**: Dual-Stack Networking (IPv4/IPv6)
- **Lab 3.2**: IP Address Reservation
- **Lab 3.3**: IPAM for Multi-Cluster Environments

### Module 4: LoadBalancer IP Management
- **Lab 4.1**: MetalLB Layer 2 Mode
- **Lab 4.2**: MetalLB BGP Mode
- **Lab 4.3**: IP Failover and High Availability

### Module 5: Monitoring and Troubleshooting
- **Lab 5.1**: IPAM Monitoring and Metrics
- **Lab 5.2**: IP Conflict Detection
- **Lab 5.3**: Troubleshooting IP Allocation Issues

## 🛠️ Prerequisites

### Required Tools
- Kubernetes cluster (minikube, kind, or bare-metal)
- kubectl configured
- Helm 3.x installed
- Basic networking knowledge

### Knowledge Prerequisites
- Kubernetes networking basics
- IP addressing and subnetting
- CIDR notation
- Service types (ClusterIP, NodePort, LoadBalancer)

## 📖 What is IPAM?

**IPAM** (IP Address Management) is the planning, tracking, and managing of IP address space in a network.

### Key Concepts

```
┌─────────────────────────────────────────────────────────┐
│                  IPAM Architecture                      │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  IP Address Pool                                 │  │
│  │  192.168.1.0/24 (256 addresses)                  │  │
│  └───────────────────┬──────────────────────────────┘  │
│                      │                                  │
│                      ▼                                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  IPAM Controller                                 │  │
│  │  • Allocates IPs                                 │  │
│  │  • Tracks usage                                  │  │
│  │  • Prevents conflicts                            │  │
│  │  • Reclaims unused IPs                           │  │
│  └───────────┬──────────────┬───────────────────────┘  │
│              │              │                           │
│              ▼              ▼                           │
│  ┌──────────────┐  ┌──────────────┐                   │
│  │  Pod IPs     │  │  Service IPs │                   │
│  │  10.244.x.x  │  │  10.96.x.x   │                   │
│  └──────────────┘  └──────────────┘                   │
└─────────────────────────────────────────────────────────┘
```

### IPAM in Kubernetes

| Component | IP Range | IPAM Method |
|-----------|----------|-------------|
| **Pods** | 10.244.0.0/16 | CNI Plugin (Calico, Cilium) |
| **Services** | 10.96.0.0/12 | kube-apiserver |
| **LoadBalancers** | 192.168.1.0/24 | MetalLB, Cloud Provider |
| **Nodes** | 192.168.0.0/24 | Infrastructure |

## 🎓 Why Learn IPAM?

### Benefits
- **Prevent IP Conflicts**: Automated allocation prevents duplicates
- **Efficient Utilization**: Track and optimize IP usage
- **Scalability**: Plan for growth
- **Troubleshooting**: Quickly identify IP-related issues
- **Compliance**: Track IP assignments for auditing
- **Multi-Tenancy**: Isolate IP ranges per tenant

### Use Cases
- **Bare-Metal Kubernetes**: MetalLB for LoadBalancer services
- **Multi-Cluster**: Avoid IP range overlaps
- **Hybrid Cloud**: Coordinate on-prem and cloud IPs
- **Service Mesh**: IP allocation for sidecar proxies
- **IPv6 Migration**: Dual-stack networking

## 🚀 Quick Start

### Install MetalLB (Bare-Metal Load Balancer)
```bash
# Install MetalLB
kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.13.12/config/manifests/metallb-native.yaml

# Create IP address pool
cat <<EOF | kubectl apply -f -
apiVersion: metallb.io/v1beta1
kind: IPAddressPool
metadata:
  name: default-pool
  namespace: metallb-system
spec:
  addresses:
  - 192.168.1.240-192.168.1.250
EOF
```

### Configure L2Advertisement
```bash
cat <<EOF | kubectl apply -f -
apiVersion: metallb.io/v1beta1
kind: L2Advertisement
metadata:
  name: default
  namespace: metallb-system
spec:
  ipAddressPools:
  - default-pool
EOF
```

## 📊 Course Difficulty Distribution

```
Beginner (⭐):           3 labs  (20%)
Intermediate (⭐⭐):      6 labs  (40%)
Advanced (⭐⭐⭐):         6 labs  (40%)
```

## 🎯 Learning Paths

### Path 1: IPAM Basics
**Goal**: Understand IP address management  
**Time**: ~6 hours  
**Labs**: Module 1, 2

### Path 2: Production IPAM
**Goal**: Implement production-ready IPAM  
**Time**: ~10 hours  
**Labs**: Module 1, 2, 3, 4

### Path 3: IPAM Expert
**Goal**: Master all IPAM features  
**Time**: ~15 hours  
**Labs**: All modules

## 📚 Additional Resources

### Official Documentation
- [MetalLB Documentation](https://metallb.universe.tf/)
- [Calico IPAM](https://docs.tigera.io/calico/latest/networking/ipam/)
- [Kubernetes Network Policies](https://kubernetes.io/docs/concepts/services-networking/network-policies/)

### Tools
- **MetalLB**: Bare-metal load balancer
- **Calico**: CNI with advanced IPAM
- **Cilium**: eBPF-based networking with IPAM

## 🚀 Let's Begin!

Start with [Lab 1.1: Understanding IPAM and MetalLB](labs/lab-1.1-ipam-metallb.md)

---

**Course Version**: 1.0  
**Last Updated**: September 28, 2026  
**MetalLB Version**: 0.13+
