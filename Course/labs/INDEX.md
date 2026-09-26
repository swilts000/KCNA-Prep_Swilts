# KCNA Lab Course Index

## 📚 Complete Lab Listing

This index provides a comprehensive overview of all available labs, organized by module. Each lab includes chapter references, difficulty level, and estimated completion time.

---

## 🎯 Quick Reference

| Module | Labs | Total Time | Difficulty |
|--------|------|------------|------------|
| Module 1: Cluster Creation | 3 labs | ~3 hours | Beginner |
| Module 2: Maintenance | 4 labs | ~4 hours | Intermediate |
| Module 3: Deployments | 3 labs | ~3.5 hours | Intermediate |
| Module 4: Networking | 2 labs | ~2.5 hours | Intermediate |
| Module 5: Troubleshooting | 4 labs | ~4 hours | Advanced |
| Module 6: Cleanup | 2 labs | ~2 hours | Beginner |
| Module 7: Advanced | 2 labs | ~3 hours | Advanced |
| **Total** | **20 labs** | **~22 hours** | Mixed |

---

## 📖 Module 1: Cluster Creation & Setup

### Lab 1.1: Local Cluster with Minikube ✅ COMPLETED
- **File**: [lab-1.1-minikube-cluster.md](lab-1.1-minikube-cluster.md)
- **Chapters**: 3, 5
- **Difficulty**: ⭐ Beginner
- **Time**: 45-60 minutes
- **Topics**:
  - Installing minikube and kubectl
  - Creating single-node clusters
  - Creating multi-node clusters
  - Exploring cluster components
  - Labeling nodes
  - SSH access to nodes
- **Prerequisites**: Docker installed
- **Key Skills**: Cluster creation, node management, kubectl basics

### Lab 1.2: Multi-Node Cluster with Kind
- **File**: lab-1.2-kind-cluster.md
- **Chapters**: 3, 5
- **Difficulty**: ⭐ Beginner
- **Time**: 45-60 minutes
- **Topics**:
  - Installing Kind
  - Creating clusters from config files
  - Multi-node cluster architecture
  - Comparing Kind vs Minikube
  - Load balancer configuration
- **Prerequisites**: Docker installed
- **Key Skills**: Alternative cluster tools, configuration files

### Lab 1.3: Cloud-Based Cluster Setup
- **File**: lab-1.3-cloud-cluster.md
- **Chapters**: 1, 5
- **Difficulty**: ⭐⭐ Intermediate
- **Time**: 60-90 minutes
- **Topics**:
  - Creating GKE/EKS/AKS clusters
  - Cloud provider integration
  - Managed vs self-managed control planes
  - Cloud-specific features
  - Cost management
- **Prerequisites**: Cloud provider account
- **Key Skills**: Cloud deployments, production clusters

---

## 📖 Module 2: Cluster Maintenance & Operations

### Lab 2.1: Node Management & Maintenance ✅ COMPLETED
- **File**: [lab-2.1-node-management.md](lab-2.1-node-management.md)
- **Chapters**: 5, 7, 8
- **Difficulty**: ⭐⭐ Intermediate
- **Time**: 60-75 minutes
- **Topics**:
  - Cordoning nodes
  - Draining nodes
  - Uncordoning nodes
  - Taints and tolerations
  - PodDisruptionBudgets
  - Zero-downtime maintenance
- **Prerequisites**: Multi-node cluster
- **Key Skills**: Safe maintenance, workload isolation

### Lab 2.2: Cluster Upgrades
- **File**: lab-2.2-cluster-upgrades.md
- **Chapters**: 5, 8
- **Difficulty**: ⭐⭐⭐ Advanced
- **Time**: 60-90 minutes
- **Topics**:
  - Checking cluster version
  - Upgrading control plane
  - Upgrading worker nodes
  - API compatibility
  - Rollback procedures
- **Prerequisites**: Lab 2.1 completed
- **Key Skills**: Version management, upgrade strategies

### Lab 2.3: Backup & Restore with etcd
- **File**: lab-2.3-etcd-backup.md
- **Chapters**: 5, 8
- **Difficulty**: ⭐⭐⭐ Advanced
- **Time**: 60-75 minutes
- **Topics**:
  - Understanding etcd
  - Creating snapshots
  - Restoring from snapshots
  - Disaster recovery
  - Automated backups
- **Prerequisites**: Understanding of cluster architecture
- **Key Skills**: Disaster recovery, data protection

### Lab 2.4: Resource Quotas & Limits
- **File**: lab-2.4-resource-management.md
- **Chapters**: 6, 8
- **Difficulty**: ⭐⭐ Intermediate
- **Time**: 45-60 minutes
- **Topics**:
  - Creating ResourceQuotas
  - Setting LimitRanges
  - Monitoring resource usage
  - Implementing HPA
  - Resource governance
- **Prerequisites**: Understanding of pods and deployments
- **Key Skills**: Resource management, cost control

---

## 📖 Module 3: Application Deployment & Scaling

### Lab 3.1: Deployment Lifecycle Management ✅ COMPLETED
- **File**: [lab-3.1-deployment-lifecycle.md](lab-3.1-deployment-lifecycle.md)
- **Chapters**: 5, 6
- **Difficulty**: ⭐⭐ Intermediate
- **Time**: 60-75 minutes
- **Topics**:
  - Creating Deployments
  - Rolling updates
  - Rollback procedures
  - Pause and resume
  - Update strategies
  - Deployment history
- **Prerequisites**: Understanding of Pods
- **Key Skills**: Zero-downtime deployments, version management

### Lab 3.2: Scaling Strategies
- **File**: lab-3.2-scaling-strategies.md
- **Chapters**: 6
- **Difficulty**: ⭐⭐ Intermediate
- **Time**: 60-75 minutes
- **Topics**:
  - Manual scaling
  - Horizontal Pod Autoscaler (HPA)
  - Vertical Pod Autoscaler (VPA)
  - Cluster Autoscaler
  - Metrics server
  - Load testing
- **Prerequisites**: Lab 3.1 completed
- **Key Skills**: Autoscaling, performance optimization

### Lab 3.3: StatefulSets & Persistent Storage
- **File**: lab-3.3-statefulsets.md
- **Chapters**: 6
- **Difficulty**: ⭐⭐⭐ Advanced
- **Time**: 75-90 minutes
- **Topics**:
  - Creating StatefulSets
  - PersistentVolumes
  - PersistentVolumeClaims
  - Storage classes
  - Headless services
  - Ordered deployment
- **Prerequisites**: Understanding of Deployments
- **Key Skills**: Stateful applications, storage management

---

## 📖 Module 4: Networking & Service Discovery

### Lab 4.1: Service Types & Exposure
- **File**: lab-4.1-services.md
- **Chapters**: 5, 6
- **Difficulty**: ⭐⭐ Intermediate
- **Time**: 60-75 minutes
- **Topics**:
  - ClusterIP services
  - NodePort services
  - LoadBalancer services
  - Ingress controllers
  - DNS resolution
  - TLS termination
- **Prerequisites**: Understanding of Pods and Deployments
- **Key Skills**: Service exposure, networking

### Lab 4.2: Network Policies
- **File**: lab-4.2-network-policies.md
- **Chapters**: 6, 8
- **Difficulty**: ⭐⭐⭐ Advanced
- **Time**: 60-75 minutes
- **Topics**:
  - Installing CNI plugins
  - Default deny policies
  - Ingress policies
  - Egress policies
  - Namespace isolation
  - Testing connectivity
- **Prerequisites**: Understanding of networking basics
- **Key Skills**: Network security, zero-trust networking

---

## 📖 Module 5: Troubleshooting & Debugging

### Lab 5.1: Pod Troubleshooting ✅ COMPLETED
- **File**: [lab-5.1-pod-troubleshooting.md](lab-5.1-pod-troubleshooting.md)
- **Chapters**: 6, 7
- **Difficulty**: ⭐⭐⭐ Advanced
- **Time**: 60-75 minutes
- **Topics**:
  - ImagePullBackOff
  - CrashLoopBackOff
  - Pending pods
  - OOMKilled errors
  - Reading logs
  - Debugging workflow
- **Prerequisites**: Understanding of pod lifecycle
- **Key Skills**: Systematic debugging, log analysis

### Lab 5.2: Node Troubleshooting
- **File**: lab-5.2-node-troubleshooting.md
- **Chapters**: 5, 7
- **Difficulty**: ⭐⭐⭐ Advanced
- **Time**: 60-75 minutes
- **Topics**:
  - NotReady nodes
  - Disk pressure
  - Memory pressure
  - kubelet issues
  - Network connectivity
  - System logs
- **Prerequisites**: Lab 5.1 completed
- **Key Skills**: Node diagnostics, system troubleshooting

### Lab 5.3: Cluster Component Debugging
- **File**: lab-5.3-cluster-debugging.md
- **Chapters**: 5, 7
- **Difficulty**: ⭐⭐⭐ Advanced
- **Time**: 60-75 minutes
- **Topics**:
  - API server health
  - etcd diagnostics
  - Scheduler issues
  - Controller manager
  - kube-proxy debugging
  - DNS troubleshooting
- **Prerequisites**: Understanding of cluster architecture
- **Key Skills**: Control plane diagnostics

### Lab 5.4: Application Debugging
- **File**: lab-5.4-app-debugging.md
- **Chapters**: 7
- **Difficulty**: ⭐⭐ Intermediate
- **Time**: 45-60 minutes
- **Topics**:
  - kubectl exec
  - Port forwarding
  - Copying files
  - Ephemeral containers
  - Log streaming
  - Debug pods
- **Prerequisites**: Basic kubectl knowledge
- **Key Skills**: Interactive debugging, troubleshooting tools

---

## 📖 Module 6: Cluster Deletion & Cleanup

### Lab 6.1: Safe Cluster Teardown
- **File**: lab-6.1-cluster-deletion.md
- **Chapters**: 8
- **Difficulty**: ⭐ Beginner
- **Time**: 30-45 minutes
- **Topics**:
  - Deleting workloads
  - Removing PVCs
  - Deleting namespaces
  - Cloud resource cleanup
  - Cluster deletion
  - Context cleanup
- **Prerequisites**: Any running cluster
- **Key Skills**: Safe cleanup, resource management

### Lab 6.2: Resource Cleanup & Optimization
- **File**: lab-6.2-resource-optimization.md
- **Chapters**: 8
- **Difficulty**: ⭐⭐ Intermediate
- **Time**: 45-60 minutes
- **Topics**:
  - Finding unused resources
  - Removing old ReplicaSets
  - Cleaning failed pods
  - Removing completed Jobs
  - ConfigMap/Secret audit
  - Cost optimization
- **Prerequisites**: Understanding of Kubernetes resources
- **Key Skills**: Resource optimization, cost management

---

## 📖 Module 7: Advanced Scenarios

### Lab 7.1: Multi-Component Failure Recovery
- **File**: lab-7.1-failure-recovery.md
- **Chapters**: 6, 7
- **Difficulty**: ⭐⭐⭐⭐ Expert
- **Time**: 90-120 minutes
- **Topics**:
  - Simulated production outage
  - Multiple failure scenarios
  - Systematic diagnosis
  - Root cause analysis
  - Incident response
  - Documentation
- **Prerequisites**: All Module 5 labs completed
- **Key Skills**: Real-world troubleshooting, incident response

### Lab 7.2: Performance Troubleshooting
- **File**: lab-7.2-performance.md
- **Chapters**: 7, 10
- **Difficulty**: ⭐⭐⭐⭐ Expert
- **Time**: 90-120 minutes
- **Topics**:
  - Installing Prometheus/Grafana
  - Load testing
  - Identifying bottlenecks
  - Resource optimization
  - Caching strategies
  - HPA tuning
- **Prerequisites**: Understanding of metrics and monitoring
- **Key Skills**: Performance optimization, metrics analysis

---

## 🎓 Learning Paths

### Path 1: Beginner (KCNA Exam Prep)
**Recommended Order:**
1. Lab 1.1: Minikube Cluster
2. Lab 3.1: Deployment Lifecycle
3. Lab 4.1: Services
4. Lab 5.1: Pod Troubleshooting
5. Lab 6.1: Cluster Deletion

**Total Time**: ~5 hours  
**Goal**: Pass KCNA exam

### Path 2: Intermediate (Cluster Administrator)
**Recommended Order:**
1. All Module 1 labs
2. All Module 2 labs
3. All Module 3 labs
4. All Module 4 labs
5. Lab 6.2: Resource Optimization

**Total Time**: ~15 hours  
**Goal**: Manage production clusters

### Path 3: Advanced (Site Reliability Engineer)
**Recommended Order:**
1. Complete Path 2 first
2. All Module 5 labs
3. All Module 7 labs
4. Repeat troubleshooting labs

**Total Time**: ~22 hours  
**Goal**: Expert-level troubleshooting and optimization

---

## 📊 Lab Difficulty Distribution

```
Beginner (⭐):           3 labs  (15%)
Intermediate (⭐⭐):      8 labs  (40%)
Advanced (⭐⭐⭐):         7 labs  (35%)
Expert (⭐⭐⭐⭐):          2 labs  (10%)
```

---

## 🛠️ Required Tools by Module

| Module | Tools Required |
|--------|---------------|
| Module 1 | Docker, kubectl, minikube, kind |
| Module 2 | kubectl, etcdctl, metrics-server |
| Module 3 | kubectl, metrics-server |
| Module 4 | kubectl, CNI plugin (Calico/Cilium) |
| Module 5 | kubectl, k9s, stern (optional) |
| Module 6 | kubectl |
| Module 7 | kubectl, Prometheus, Grafana, load testing tools |

---

## 📝 Lab Status Legend

- ✅ **COMPLETED**: Lab file created and ready
- 🚧 **IN PROGRESS**: Lab being developed
- 📋 **PLANNED**: Lab outlined but not started
- 🔄 **UPDATED**: Lab recently revised

---

## 🎯 Completion Tracking

Track your progress through the labs:

### Module 1: Cluster Creation
- [ ] Lab 1.1: Minikube Cluster
- [ ] Lab 1.2: Kind Cluster
- [ ] Lab 1.3: Cloud Cluster

### Module 2: Maintenance
- [ ] Lab 2.1: Node Management
- [ ] Lab 2.2: Cluster Upgrades
- [ ] Lab 2.3: etcd Backup
- [ ] Lab 2.4: Resource Quotas

### Module 3: Deployments
- [ ] Lab 3.1: Deployment Lifecycle
- [ ] Lab 3.2: Scaling Strategies
- [ ] Lab 3.3: StatefulSets

### Module 4: Networking
- [ ] Lab 4.1: Services
- [ ] Lab 4.2: Network Policies

### Module 5: Troubleshooting
- [ ] Lab 5.1: Pod Troubleshooting
- [ ] Lab 5.2: Node Troubleshooting
- [ ] Lab 5.3: Cluster Debugging
- [ ] Lab 5.4: App Debugging

### Module 6: Cleanup
- [ ] Lab 6.1: Cluster Deletion
- [ ] Lab 6.2: Resource Optimization

### Module 7: Advanced
- [ ] Lab 7.1: Failure Recovery
- [ ] Lab 7.2: Performance

---

## 📚 Additional Resources

### Official Documentation
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [CNCF KCNA Exam](https://www.cncf.io/certification/kcna/)
- [Minikube Documentation](https://minikube.sigs.k8s.io/docs/)
- [Kind Documentation](https://kind.sigs.k8s.io/)

### Practice Environments
- [Killercoda](https://killercoda.com/kubernetes)
- [Play with Kubernetes](https://labs.play-with-k8s.com/)
- [Katacoda](https://www.katacoda.com/courses/kubernetes)

### Community
- [Kubernetes Slack](https://kubernetes.slack.com/)
- [CNCF Community](https://www.cncf.io/community/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/kubernetes)

---

## 🎓 Certification Mapping

### KCNA Exam Domains Coverage

| Domain | Coverage | Relevant Labs |
|--------|----------|---------------|
| **Kubernetes Fundamentals (46%)** | ✅ Complete | 1.1, 3.1, 4.1, 5.1 |
| **Container Orchestration (22%)** | ✅ Complete | 1.1, 2.1, 3.1, 3.2 |
| **Cloud Native Architecture (16%)** | ✅ Complete | 1.3, 4.1, 4.2 |
| **Cloud Native Observability (8%)** | ⚠️ Partial | 5.1, 7.2 |
| **Cloud Native Application Delivery (8%)** | ✅ Complete | 3.1, 3.2, 3.3 |

---

## 💡 Tips for Success

1. **Complete labs in order** - Each lab builds on previous knowledge
2. **Type commands yourself** - Don't copy-paste; build muscle memory
3. **Read error messages** - They contain valuable debugging information
4. **Experiment** - Try variations of commands to deepen understanding
5. **Take notes** - Document issues and solutions for future reference
6. **Practice regularly** - Consistency is key to retention
7. **Join community** - Ask questions and help others

---

## 🔄 Lab Updates

This lab course is actively maintained. Check back for:
- New labs added
- Existing labs updated
- Bug fixes and improvements
- Community contributions

**Last Updated**: September 26, 2026

---

## 📧 Feedback

Found an issue or have a suggestion? Please:
1. Document the issue clearly
2. Include steps to reproduce
3. Suggest improvements
4. Share your experience

---

**Ready to start? Begin with [Lab 1.1: Local Cluster with Minikube](lab-1.1-minikube-cluster.md)!** 🚀
