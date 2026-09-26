# KCNA Hands-On Lab Course

## 📚 Course Overview

This comprehensive lab course provides extensive hands-on experience with Kubernetes cluster creation, maintenance, troubleshooting, and deletion. Each lab is designed to reinforce concepts from the KCNA preparation chapters with practical, real-world scenarios.

## 🎯 Learning Objectives

By completing this course, you will be able to:
- ✅ Create and configure Kubernetes clusters using multiple tools
- ✅ Perform cluster maintenance and upgrades safely
- ✅ Deploy, scale, and manage applications
- ✅ Troubleshoot common cluster and application issues
- ✅ Implement networking and security policies
- ✅ Properly clean up and delete cluster resources

## 📋 Course Structure

### Module 1: Cluster Creation & Setup
- **Lab 1.1**: Local Cluster with Minikube (Chapters 3, 5)
- **Lab 1.2**: Multi-Node Cluster with Kind (Chapters 3, 5)
- **Lab 1.3**: Cloud-Based Cluster Setup (Chapters 1, 5)

### Module 2: Cluster Maintenance & Operations
- **Lab 2.1**: Node Management & Maintenance (Chapters 5, 7)
- **Lab 2.2**: Cluster Upgrades (Chapter 8)
- **Lab 2.3**: Backup & Restore with etcd (Chapters 5, 8)
- **Lab 2.4**: Resource Quotas & Limits (Chapters 6, 8)

### Module 3: Application Deployment & Scaling
- **Lab 3.1**: Deployment Lifecycle Management (Chapter 6)
- **Lab 3.2**: Scaling Strategies (Chapter 6)
- **Lab 3.3**: StatefulSets & Persistent Storage (Chapter 6)

### Module 4: Networking & Service Discovery
- **Lab 4.1**: Service Types & Exposure (Chapters 5, 6)
- **Lab 4.2**: Network Policies (Chapters 6, 8)

### Module 5: Troubleshooting & Debugging
- **Lab 5.1**: Pod Troubleshooting (Chapter 7)
- **Lab 5.2**: Node Troubleshooting (Chapter 7)
- **Lab 5.3**: Cluster Component Debugging (Chapters 5, 7)
- **Lab 5.4**: Application Debugging (Chapter 7)

### Module 6: Cluster Deletion & Cleanup
- **Lab 6.1**: Safe Cluster Teardown (Chapter 8)
- **Lab 6.2**: Resource Cleanup & Optimization (Chapter 8)

### Module 7: Advanced Scenarios
- **Lab 7.1**: Multi-Component Failure Recovery (Chapters 6, 7)
- **Lab 7.2**: Performance Troubleshooting (Chapters 7, 10)

## 🛠️ Prerequisites

### Required Tools
- Docker Desktop or Docker Engine
- kubectl (Kubernetes CLI)
- minikube
- kind (Kubernetes in Docker)
- Git

### Optional Tools
- k9s (Terminal UI for Kubernetes)
- stern (Multi-pod log tailing)
- kubectx/kubens (Context switching)
- helm (Package manager)

### Knowledge Prerequisites
- Basic Linux command line
- Understanding of containers (Chapter 3)
- Basic networking concepts
- YAML syntax

## 📖 How to Use This Course

1. **Sequential Learning**: Complete labs in order for best results
2. **Hands-On Practice**: Type all commands yourself; don't copy-paste blindly
3. **Understand Before Moving On**: Each lab builds on previous knowledge
4. **Experiment**: Try variations of commands to deepen understanding
5. **Document**: Keep notes of issues encountered and solutions found

## 🎓 Assessment

Each lab includes:
- ✅ **Validation Steps**: Verify your work is correct
- ✅ **Challenge Tasks**: Optional advanced exercises
- ✅ **Troubleshooting Scenarios**: Practice debugging skills

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section in each lab
2. Review the relevant chapter content
3. Consult Kubernetes official documentation
4. Practice systematic debugging approaches

## 🚀 Let's Begin!

Start with [Lab 1.1: Local Cluster with Minikube](labs/lab-1.1-minikube-cluster.md)
