# Cilium - eBPF-based Networking and Security Course

## 📚 Course Overview

This comprehensive Cilium course provides hands-on experience with modern Kubernetes networking and security using eBPF technology. Learn how Cilium provides advanced networking, observability, and security features for cloud-native applications.

## 🎯 Learning Objectives

By completing this course, you will be able to:
- ✅ Understand eBPF and its role in Kubernetes networking
- ✅ Install and configure Cilium as a CNI plugin
- ✅ Implement network policies with Cilium
- ✅ Use Cilium for service mesh capabilities
- ✅ Monitor network traffic with Hubble
- ✅ Implement Layer 7 (HTTP/gRPC) policies
- ✅ Troubleshoot network issues with Cilium tools
- ✅ Secure cluster communication with encryption

## 📋 Course Structure

### Module 1: Cilium Fundamentals
- **Lab 1.1**: Understanding eBPF and Cilium Architecture
- **Lab 1.2**: Installing Cilium CNI
- **Lab 1.3**: Cilium CLI and Connectivity Testing

### Module 2: Network Policies
- **Lab 2.1**: Layer 3/4 Network Policies
- **Lab 2.2**: Layer 7 (HTTP/gRPC) Policies
- **Lab 2.3**: DNS-based Policies

### Module 3: Observability with Hubble
- **Lab 3.1**: Installing and Using Hubble
- **Lab 3.2**: Network Flow Visualization
- **Lab 3.3**: Service Dependency Mapping

### Module 4: Service Mesh Features
- **Lab 4.1**: Load Balancing and Service Discovery
- **Lab 4.2**: Transparent Encryption
- **Lab 4.3**: Ingress and Gateway API

### Module 5: Advanced Topics
- **Lab 5.1**: Multi-Cluster Networking
- **Lab 5.2**: Network Performance Optimization
- **Lab 5.3**: Troubleshooting and Debugging

## 🛠️ Prerequisites

### Required Tools
- Kubernetes cluster (1.23+)
- kubectl configured
- Helm 3.x
- At least 2 CPU cores and 4GB RAM

### Knowledge Prerequisites
- Kubernetes networking basics
- Understanding of network policies
- Basic Linux networking concepts
- Familiarity with CNI plugins

## 📖 What is Cilium?

**Cilium** is an open-source networking, observability, and security solution powered by eBPF (extended Berkeley Packet Filter).

### Key Features

```
┌─────────────────────────────────────────────────────────┐
│                  Cilium Architecture                    │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │           Application Pods                       │  │
│  └───────────────────┬──────────────────────────────┘  │
│                      │                                  │
│                      ▼                                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Cilium Agent (DaemonSet)                 │  │
│  │  • Network Policy Enforcement                    │  │
│  │  • Load Balancing                                │  │
│  │  • Service Discovery                             │  │
│  └───────────────────┬──────────────────────────────┘  │
│                      │                                  │
│                      ▼                                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Linux Kernel (eBPF)                      │  │
│  │  • Packet filtering                              │  │
│  │  • Connection tracking                           │  │
│  │  • Network monitoring                            │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Hubble (Observability)                   │  │
│  │  • Network flow monitoring                       │  │
│  │  • Service dependency maps                       │  │
│  │  • Security event logging                        │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Why Cilium?

| Feature | Traditional CNI | Cilium |
|---------|----------------|--------|
| **Performance** | iptables (slow) | eBPF (fast) |
| **Observability** | Limited | Deep insights with Hubble |
| **Security** | L3/L4 only | L3-L7 policies |
| **Service Mesh** | Requires sidecar | Built-in, sidecar-free |
| **Encryption** | IPsec/WireGuard | Transparent encryption |

## 🎓 Why Learn Cilium?

### Traditional Networking Challenges
- iptables rules grow linearly (performance issues)
- Limited visibility into network traffic
- Complex service mesh deployments
- Difficult to implement L7 policies

### Cilium Solutions
- eBPF provides kernel-level performance
- Hubble gives complete network visibility
- Sidecar-free service mesh
- Native L7 policy support

## 🚀 Quick Start

### Install Cilium CLI
```bash
# macOS
brew install cilium-cli

# Linux
CILIUM_CLI_VERSION=$(curl -s https://raw.githubusercontent.com/cilium/cilium-cli/main/stable.txt)
curl -L --fail --remote-name-all https://github.com/cilium/cilium-cli/releases/download/${CILIUM_CLI_VERSION}/cilium-linux-amd64.tar.gz{,.sha256sum}
sudo tar xzvfC cilium-linux-amd64.tar.gz /usr/local/bin
```

### Install Cilium
```bash
# Install Cilium in your cluster
cilium install

# Check status
cilium status

# Run connectivity test
cilium connectivity test
```

## 📊 Course Difficulty Distribution

```
Beginner (⭐):           3 labs  (20%)
Intermediate (⭐⭐):      6 labs  (40%)
Advanced (⭐⭐⭐):         6 labs  (40%)
```

## 🎯 Learning Paths

### Path 1: Network Administrator
**Goal**: Implement Cilium networking  
**Time**: ~6 hours  
**Labs**: Module 1, 2

### Path 2: Security Engineer
**Goal**: Advanced security policies  
**Time**: ~8 hours  
**Labs**: Module 1, 2, 4

### Path 3: Cilium Expert
**Goal**: Complete mastery  
**Time**: ~15 hours  
**Labs**: All modules

## 📚 Additional Resources

### Official Documentation
- [Cilium Documentation](https://docs.cilium.io/)
- [eBPF Documentation](https://ebpf.io/)
- [Hubble Documentation](https://docs.cilium.io/en/stable/gettingstarted/hubble/)

### Community
- [Cilium Slack](https://cilium.io/slack)
- [GitHub](https://github.com/cilium/cilium)

## 🚀 Let's Begin!

Start with [Lab 1.1: Understanding eBPF and Cilium Architecture](labs/lab-1.1-ebpf-cilium-intro.md)

---

**Course Version**: 1.0  
**Last Updated**: September 27, 2026  
**Cilium Version**: 1.14+
