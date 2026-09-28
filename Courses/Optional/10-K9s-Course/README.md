# K9s - Kubernetes Terminal UI Course

## 📚 Course Overview

This comprehensive K9s course provides hands-on experience with the most powerful terminal-based Kubernetes management tool. Learn how to navigate, monitor, and manage Kubernetes clusters efficiently from your terminal.

## 🎯 Learning Objectives

By completing this course, you will be able to:
- ✅ Install and configure K9s
- ✅ Navigate Kubernetes resources efficiently
- ✅ Monitor cluster health in real-time
- ✅ Manage pods, deployments, and services
- ✅ View and search logs interactively
- ✅ Execute commands in containers
- ✅ Customize K9s with skins and plugins
- ✅ Use K9s for troubleshooting

## 📋 Course Structure

### Module 1: K9s Fundamentals
- **Lab 1.1**: Installing and Configuring K9s
- **Lab 1.2**: Navigating the K9s Interface
- **Lab 1.3**: Resource Management Basics

### Module 2: Monitoring and Observability
- **Lab 2.1**: Real-Time Cluster Monitoring
- **Lab 2.2**: Log Viewing and Searching
- **Lab 2.3**: Resource Metrics and Performance

### Module 3: Advanced Operations
- **Lab 3.1**: Pod and Container Management
- **Lab 3.2**: Port Forwarding and Shell Access
- **Lab 3.3**: YAML Editing and Apply

### Module 4: Customization
- **Lab 4.1**: Custom Skins and Themes
- **Lab 4.2**: Hotkeys and Shortcuts
- **Lab 4.3**: Plugins and Extensions

### Module 5: Troubleshooting
- **Lab 5.1**: Debugging with K9s
- **Lab 5.2**: Event Monitoring
- **Lab 5.3**: Performance Analysis

## 🛠️ Prerequisites

### Required Tools
- Kubernetes cluster (minikube, kind, or cloud)
- kubectl configured
- Terminal emulator

### Knowledge Prerequisites
- Basic Kubernetes concepts
- Command-line familiarity
- Understanding of pods, deployments, services

## 📖 What is K9s?

**K9s** is a terminal-based UI to interact with your Kubernetes clusters. It provides a fast, efficient way to navigate, observe, and manage your applications.

### Key Features

```
┌─────────────────────────────────────────────────────────┐
│                  K9s Architecture                       │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  K9s Terminal UI                                 │  │
│  │  ┌────────────────────────────────────────────┐  │  │
│  │  │  Resource Views                            │  │  │
│  │  │  • Pods, Deployments, Services             │  │  │
│  │  │  • ConfigMaps, Secrets                     │  │  │
│  │  │  │  Nodes, Namespaces                      │  │  │
│  │  └────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────┐  │  │
│  │  │  Live Monitoring                           │  │  │
│  │  │  • Real-time updates                       │  │  │
│  │  │  • Resource metrics                        │  │  │
│  │  │  • Event streaming                         │  │  │
│  │  └────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────┐  │  │
│  │  │  Interactive Actions                       │  │  │
│  │  │  • Describe, Edit, Delete                  │  │  │
│  │  │  • Logs, Shell, Port-forward               │  │  │
│  │  │  • Scale, Restart, Kill                    │  │  │
│  │  └────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
│                      │                                  │
│                      ▼                                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Kubernetes API Server                           │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### K9s vs Other Tools

| Feature | K9s | kubectl | Lens | Dashboard |
|---------|-----|---------|------|-----------|
| **Interface** | Terminal | CLI | Desktop GUI | Web UI |
| **Speed** | ⚡ Very Fast | Fast | Medium | Medium |
| **Resource Usage** | Minimal | Minimal | High | Medium |
| **Real-time** | ✅ Yes | ❌ No | ✅ Yes | ✅ Yes |
| **Offline** | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |
| **Customizable** | ✅ Highly | ❌ Limited | ✅ Yes | ❌ Limited |
| **Learning Curve** | Medium | Low | Low | Low |

## 🎓 Why Learn K9s?

### Benefits
- **Speed**: Navigate clusters 10x faster than kubectl
- **Efficiency**: All operations from one interface
- **Real-time**: Live updates without polling
- **Productivity**: Hotkeys for common tasks
- **Lightweight**: Minimal resource usage
- **Portable**: Works over SSH, in containers

### Use Cases
- **Daily Operations**: Cluster management
- **Troubleshooting**: Quick debugging
- **Monitoring**: Real-time cluster health
- **Development**: Fast iteration cycles
- **Production**: Emergency response
- **Learning**: Visual understanding of K8s

## 🚀 Quick Start

### Install K9s
```bash
# macOS (Homebrew)
brew install derailed/k9s/k9s

# Linux (Binary)
curl -sL https://github.com/derailed/k9s/releases/latest/download/k9s_Linux_amd64.tar.gz | tar xz
sudo mv k9s /usr/local/bin/

# Windows (Chocolatey)
choco install k9s
```

### Launch K9s
```bash
# Start K9s
k9s

# Start with specific context
k9s --context minikube

# Start in specific namespace
k9s -n kube-system
```

### Basic Navigation
```
:pods          # View pods
:deployments   # View deployments
:services      # View services
/search-term   # Search/filter
?              # Help
:q             # Quit
```

## 📊 Course Difficulty Distribution

```
Beginner (⭐):           3 labs  (20%)
Intermediate (⭐⭐):      6 labs  (40%)
Advanced (⭐⭐⭐):         6 labs  (40%)
```

## 🎯 Learning Paths

### Path 1: K9s Basics
**Goal**: Get productive with K9s  
**Time**: ~4 hours  
**Labs**: Module 1, 2

### Path 2: K9s Power User
**Goal**: Master all K9s features  
**Time**: ~8 hours  
**Labs**: Module 1, 2, 3, 4

### Path 3: K9s Expert
**Goal**: Advanced troubleshooting and customization  
**Time**: ~12 hours  
**Labs**: All modules

## 📚 Additional Resources

### Official Documentation
- [K9s GitHub](https://github.com/derailed/k9s)
- [K9s Documentation](https://k9scli.io/)
- [K9s Skins](https://github.com/derailed/k9s/tree/master/skins)

### Community
- [K9s Discussions](https://github.com/derailed/k9s/discussions)
- [K9s Issues](https://github.com/derailed/k9s/issues)

## 🎨 K9s Features Highlights

### Real-Time Monitoring
- Live pod status updates
- Resource usage metrics
- Event streaming
- Log tailing

### Interactive Operations
- Describe resources
- Edit YAML in-place
- Delete with confirmation
- Scale deployments
- Restart pods
- Port forwarding
- Shell access

### Productivity Features
- Fuzzy search
- Custom hotkeys
- Bookmarks
- Context switching
- Namespace switching
- Resource filtering

### Customization
- Custom skins/themes
- Hotkey configuration
- Plugin system
- Aliases
- Column customization

## 🚀 Let's Begin!

Start with [Lab 1.1: Installing and Configuring K9s](labs/lab-1.1-k9s-installation.md)

---

**Course Version**: 1.0  
**Last Updated**: September 28, 2026  
**K9s Version**: 0.32+
