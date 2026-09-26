# Chapter to Lab Mapping Guide

## 📚 How Labs Align with KCNA Chapters

This guide shows the direct relationship between your KCNA preparation chapters and the hands-on labs. Use this to coordinate your reading and practice.

---

## 🗺️ Complete Mapping

```
┌─────────────────────────────────────────────────────────────────┐
│                    KCNA Learning Path                           │
│                                                                 │
│  Read Chapter → Complete Lab → Reinforce Learning              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Chapter 1: From Cloud to Cloud Native and Kubernetes

### 📖 Chapter Topics
- Before the Cloud & Virtualization
- Cloud Computing & Service Models
- Cloud-Native & Containers
- Monolithic vs Microservices
- Container Orchestration & Kubernetes

### 🔬 Related Labs
- **Lab 1.3**: Cloud-Based Cluster Setup *(Planned)*
  - Apply cloud concepts in practice
  - Experience IaaS, PaaS differences
  - Deploy to real cloud providers

### 🎯 Learning Flow
1. **Read**: Chapter 1, Lessons 1-5
2. **Practice**: Lab 1.3 (when available)
3. **Reinforce**: Understand evolution from physical → virtual → cloud → cloud-native

---

## Chapter 2: Overview of CNCF and Kubernetes Certifications

### 📖 Chapter Topics
- OSS and Open Standards
- Linux Foundation & CNCF
- CNCF Project Maturity & Governance
- Cloud Roles & Personas
- Kubernetes Certification Path

### 🔬 Related Labs
- **No direct lab** - This is foundational knowledge
- **Indirect**: All labs demonstrate CNCF projects in action

### 🎯 Learning Flow
1. **Read**: Chapter 2, Lessons 1-5
2. **Understand**: CNCF ecosystem and certification path
3. **Apply**: Knowledge applies to all subsequent labs

---

## Chapter 3: Getting Started with Containers

### 📖 Chapter Topics
- Introducing Docker
- Container Technology (cgroups, namespaces)
- Running Containers
- Building Container Images
- Development Workflow

### 🔬 Related Labs
- **Lab 1.1**: Local Cluster with Minikube ✅ **COMPLETED**
  - Install Docker and container tools
  - Understand container runtime (containerd)
  - Explore container-based cluster architecture
  
- **Lab 1.2**: Multi-Node Cluster with Kind *(Planned)*
  - Kubernetes in Docker containers
  - Container-based cluster nodes

### 🎯 Learning Flow
1. **Read**: Chapter 3, Lessons 1-5
2. **Practice**: Lab 1.1 (Minikube setup)
3. **Reinforce**: Container concepts through cluster exploration

### 📊 Concept Mapping

| Chapter 3 Concept | Lab 1.1 Application |
|-------------------|---------------------|
| Container Images | Explore pod images in cluster |
| Container Runtime | See containerd in action |
| Docker CLI | Use kubectl (similar patterns) |
| Image Layers | Observe pod image pulls |
| Namespaces | Kubernetes namespaces |

---

## Chapter 4: Container Runtimes, Interfaces & Service Meshes

### 📖 Chapter Topics
- Container Runtime Interface (CRI)
- Container runtimes (containerd, CRI-O)
- Container Network Interface (CNI)
- Container Storage Interface (CSI)
- Service Meshes

### 🔬 Related Labs
- **Lab 1.1**: Local Cluster with Minikube ✅ **COMPLETED**
  - Observe containerd as runtime
  - See CNI in action (pod networking)
  
- **Lab 4.2**: Network Policies *(Planned)*
  - CNI plugin installation
  - Network interface configuration

### 🎯 Learning Flow
1. **Read**: Chapter 4, Lessons 1-5
2. **Practice**: Lab 1.1 (observe runtime)
3. **Reinforce**: See CRI, CNI, CSI in cluster components

---

## Chapter 5: Orchestrating Containers with Kubernetes

### 📖 Chapter Topics
- Kubernetes Architecture
- Pods and Container Grouping
- Kubernetes API Model
- Namespaces
- Services and Networking

### 🔬 Related Labs
- **Lab 1.1**: Local Cluster with Minikube ✅ **COMPLETED**
  - **Lesson 1**: Explore control plane and worker components
  - **Lesson 2**: Examine pods in kube-system
  - **Lesson 3**: Use kubectl (API client)
  - **Lesson 4**: Work with default namespace
  
- **Lab 2.1**: Node Management & Maintenance ✅ **COMPLETED**
  - **Lesson 1**: Understand node architecture
  - **Lesson 2**: Manage pods across nodes
  
- **Lab 3.1**: Deployment Lifecycle ✅ **COMPLETED**
  - **Lesson 2**: Create and manage pods via Deployments
  - **Lesson 3**: Use declarative API (YAML)
  
- **Lab 4.1**: Service Types & Exposure *(Planned)*
  - **Lesson 5**: Create and use Services

### 🎯 Learning Flow
1. **Read**: Chapter 5, Lesson 1 (Architecture)
2. **Practice**: Lab 1.1, Part 3 (Explore components)
3. **Read**: Chapter 5, Lesson 2 (Pods)
4. **Practice**: Lab 3.1, Part 1 (Create pods via Deployment)
5. **Read**: Chapter 5, Lesson 3 (API Model)
6. **Practice**: Lab 3.1, Part 4 (Declarative updates)
7. **Read**: Chapter 5, Lesson 5 (Services)
8. **Practice**: Lab 4.1 (when available)

### 📊 Detailed Concept Mapping

| Chapter 5 Lesson | Concept | Lab | Section |
|------------------|---------|-----|---------|
| Lesson 1 | Control Plane Components | Lab 1.1 | Part 3.1 |
| Lesson 1 | Worker Node Components | Lab 1.1 | Part 3.1 |
| Lesson 1 | etcd | Lab 1.1 | Part 3.2 |
| Lesson 2 | Pods | Lab 3.1 | Part 1 |
| Lesson 2 | Multi-container Pods | Lab 3.1 | Part 1 |
| Lesson 3 | Declarative API | Lab 3.1 | All parts |
| Lesson 3 | kubectl | Lab 1.1 | All parts |
| Lesson 4 | Namespaces | Lab 5.1 | Part 6 |
| Lesson 5 | Services | Lab 4.1 | (Planned) |

---

## Chapter 6: Deploying and Scaling Applications with Kubernetes

### 📖 Chapter Topics
- Deployments & ReplicaSets
- Rolling Updates & Rollbacks
- DaemonSets & StatefulSets
- Storage (PV, PVC)
- ConfigMaps & Secrets
- Health Checks

### 🔬 Related Labs
- **Lab 3.1**: Deployment Lifecycle Management ✅ **COMPLETED**
  - **Lesson 1**: Create Deployments and ReplicaSets
  - **Lesson 1**: Understand Deployment → ReplicaSet → Pod hierarchy
  - **Lesson 2**: Perform rolling updates
  - **Lesson 2**: Rollback deployments
  - **Lesson 2**: Configure update strategies
  
- **Lab 3.2**: Scaling Strategies *(Planned)*
  - **Lesson 1**: Manual and automatic scaling
  - **Lesson 1**: Horizontal Pod Autoscaler
  
- **Lab 3.3**: StatefulSets & Persistent Storage *(Planned)*
  - **Lesson 3**: Create StatefulSets
  - **Lesson 4**: Use PersistentVolumes and PersistentVolumeClaims
  
- **Lab 5.1**: Pod Troubleshooting ✅ **COMPLETED**
  - **Lesson 5**: Debug health check failures
  - **Lesson 4**: Resource limits and requests

### 🎯 Learning Flow
1. **Read**: Chapter 6, Lesson 1 (Deployments)
2. **Practice**: Lab 3.1, Parts 1-3 (Create and manage Deployments)
3. **Read**: Chapter 6, Lesson 2 (Updates & Rollbacks)
4. **Practice**: Lab 3.1, Parts 4-6 (Rolling updates, rollbacks)
5. **Read**: Chapter 6, Lesson 3 (StatefulSets)
6. **Practice**: Lab 3.3 (when available)
7. **Read**: Chapter 6, Lesson 4 (Storage)
8. **Practice**: Lab 3.3 (when available)

### 📊 Detailed Concept Mapping

| Chapter 6 Lesson | Concept | Lab | Section |
|------------------|---------|-----|---------|
| Lesson 1 | Deployments | Lab 3.1 | Part 1 |
| Lesson 1 | ReplicaSets | Lab 3.1 | Part 1.3 |
| Lesson 1 | Self-Healing | Lab 3.1 | Part 2 |
| Lesson 1 | Scaling | Lab 3.1 | Part 3 |
| Lesson 2 | Rolling Updates | Lab 3.1 | Part 4 |
| Lesson 2 | Rollback | Lab 3.1 | Part 5 |
| Lesson 2 | Update Strategies | Lab 3.1 | Part 7 |
| Lesson 3 | StatefulSets | Lab 3.3 | (Planned) |
| Lesson 4 | PV/PVC | Lab 3.3 | (Planned) |
| Lesson 5 | Health Checks | Lab 5.1 | Part 5 |

---

## Chapter 7: Application Placement and Debugging with Kubernetes

### 📖 Chapter Topics
- Scheduling in Kubernetes
- Node Selectors & Affinity
- Taints & Tolerations
- Resource Management
- Debugging Pods
- Debugging Nodes

### 🔬 Related Labs
- **Lab 1.1**: Local Cluster with Minikube ✅ **COMPLETED**
  - **Lesson 2**: Label nodes for scheduling
  - **Lesson 2**: Use node selectors
  
- **Lab 2.1**: Node Management & Maintenance ✅ **COMPLETED**
  - **Lesson 2**: Apply taints and tolerations
  - **Lesson 1**: Understand scheduling behavior
  
- **Lab 5.1**: Pod Troubleshooting ✅ **COMPLETED**
  - **Lesson 5**: Debug pod issues systematically
  - **Lesson 5**: Read logs and events
  - **Lesson 5**: Fix common errors
  
- **Lab 5.2**: Node Troubleshooting *(Planned)*
  - **Lesson 6**: Debug node issues
  - **Lesson 6**: Fix NotReady nodes
  
- **Lab 5.3**: Cluster Component Debugging *(Planned)*
  - Debug control plane components
  
- **Lab 5.4**: Application Debugging *(Planned)*
  - Use kubectl exec, port-forward, logs

### 🎯 Learning Flow
1. **Read**: Chapter 7, Lesson 1 (Scheduling)
2. **Practice**: Lab 1.1, Part 5 (Node labels)
3. **Read**: Chapter 7, Lesson 2 (Affinity)
4. **Practice**: Lab 2.1, Part 7 (Taints & Tolerations)
5. **Read**: Chapter 7, Lesson 5 (Debugging Pods)
6. **Practice**: Lab 5.1, All parts (Pod troubleshooting)
7. **Read**: Chapter 7, Lesson 6 (Debugging Nodes)
8. **Practice**: Lab 5.2 (when available)

### 📊 Detailed Concept Mapping

| Chapter 7 Lesson | Concept | Lab | Section |
|------------------|---------|-----|---------|
| Lesson 1 | Scheduling | Lab 2.1 | Part 4 |
| Lesson 1 | Node Selection | Lab 1.1 | Part 5 |
| Lesson 2 | Node Affinity | Lab 2.1 | Part 7 |
| Lesson 2 | Taints | Lab 2.1 | Part 7.2-7.5 |
| Lesson 2 | Tolerations | Lab 2.1 | Part 7.4 |
| Lesson 4 | Resource Requests | Lab 5.1 | Part 4 |
| Lesson 4 | Resource Limits | Lab 5.1 | Part 5 |
| Lesson 5 | ImagePullBackOff | Lab 5.1 | Part 2 |
| Lesson 5 | CrashLoopBackOff | Lab 5.1 | Part 3 |
| Lesson 5 | Pending Pods | Lab 5.1 | Part 4 |
| Lesson 5 | kubectl logs | Lab 5.1 | Part 1.1 |
| Lesson 5 | kubectl describe | Lab 5.1 | Part 1.1 |
| Lesson 6 | Node Debugging | Lab 5.2 | (Planned) |

---

## Chapter 8: Following Kubernetes Best Practices

### 📖 Chapter Topics
- Security Best Practices
- Resource Management
- High Availability
- Backup & Recovery
- Monitoring & Logging
- Upgrade Strategies

### 🔬 Related Labs
- **Lab 2.1**: Node Management & Maintenance ✅ **COMPLETED**
  - **Best Practice**: Zero-downtime maintenance
  - **Best Practice**: PodDisruptionBudgets
  - **Best Practice**: Safe node operations
  
- **Lab 2.2**: Cluster Upgrades *(Planned)*
  - **Best Practice**: Safe upgrade procedures
  - **Best Practice**: Version compatibility
  
- **Lab 2.3**: Backup & Restore with etcd *(Planned)*
  - **Best Practice**: Regular backups
  - **Best Practice**: Disaster recovery
  
- **Lab 2.4**: Resource Quotas & Limits *(Planned)*
  - **Best Practice**: Resource governance
  - **Best Practice**: Prevent resource exhaustion
  
- **Lab 4.2**: Network Policies *(Planned)*
  - **Best Practice**: Network security
  - **Best Practice**: Zero-trust networking

### 🎯 Learning Flow
1. **Read**: Chapter 8, All lessons
2. **Practice**: Lab 2.1 (Safe maintenance)
3. **Practice**: Lab 2.2 (when available - Upgrades)
4. **Practice**: Lab 2.3 (when available - Backups)
5. **Practice**: Lab 2.4 (when available - Resources)
6. **Practice**: Lab 4.2 (when available - Security)

### 📊 Best Practices Mapping

| Chapter 8 Topic | Best Practice | Lab | Implementation |
|-----------------|---------------|-----|----------------|
| Maintenance | Zero-downtime | Lab 2.1 | Cordon → Drain → Maintain → Uncordon |
| Availability | PodDisruptionBudget | Lab 2.1 | Part 8 |
| Resource Mgmt | Requests & Limits | Lab 5.1 | Part 4, Part 5 |
| Updates | Rolling Updates | Lab 3.1 | Part 4, Part 7 |
| Recovery | Rollback | Lab 3.1 | Part 5 |
| Isolation | Taints & Tolerations | Lab 2.1 | Part 7 |
| Security | Network Policies | Lab 4.2 | (Planned) |
| Backup | etcd Snapshots | Lab 2.3 | (Planned) |

---

## Chapter 9: Understanding Cloud Native Architectures

### 📖 Chapter Topics
- Microservices Architecture
- Serverless & FaaS
- API Gateways
- Service Mesh
- Event-Driven Architecture

### 🔬 Related Labs
- **Indirect application** in all labs
- Focus on architectural patterns
- No specific hands-on lab (architectural concepts)

---

## Chapter 10: Implementing Telemetry and Observability in the Cloud

### 📖 Chapter Topics
- Metrics & Monitoring
- Logging
- Tracing
- Prometheus & Grafana
- Observability Best Practices

### 🔬 Related Labs
- **Lab 7.2**: Performance Troubleshooting *(Planned)*
  - Install Prometheus & Grafana
  - Collect and analyze metrics
  - Monitor cluster performance
  
- **Lab 5.1**: Pod Troubleshooting ✅ **COMPLETED**
  - **Logging**: kubectl logs commands
  - **Events**: kubectl describe and get events

### 🎯 Learning Flow
1. **Read**: Chapter 10, All lessons
2. **Practice**: Lab 5.1 (Logging basics)
3. **Practice**: Lab 7.2 (when available - Full observability stack)

---

## Chapter 11: Automating Cloud Native Application Delivery

### 📖 Chapter Topics
- CI/CD Pipelines
- GitOps
- Helm
- Kustomize
- ArgoCD & Flux

### 🔬 Related Labs
- **No direct lab** - Advanced topic beyond KCNA scope
- **Indirect**: All labs use declarative YAML (GitOps foundation)

---

## Chapter 12: Practicing for the KCNA Exam with Mock Papers

### 📖 Chapter Topics
- Exam format and structure
- Practice questions
- Time management
- Exam tips

### 🔬 Related Labs
- **All labs** serve as practical exam preparation
- **Recommended sequence**:
  1. Lab 1.1 (Fundamentals)
  2. Lab 3.1 (Deployments)
  3. Lab 5.1 (Troubleshooting)
  4. Lab 2.1 (Operations)

---

## 🎯 Recommended Study Sequence

### Week 1: Foundations
```
Day 1: Read Chapter 1 → Read Chapter 3
Day 2: Complete Lab 1.1 (Minikube Cluster)
Day 3: Read Chapter 5, Lessons 1-3
Day 4: Complete Lab 1.1 validation and challenges
Day 5: Read Chapter 6, Lessons 1-2
Day 6: Complete Lab 3.1 (Deployment Lifecycle)
Day 7: Review and practice
```

### Week 2: Operations & Troubleshooting
```
Day 8: Read Chapter 7, Lessons 1-2
Day 9: Complete Lab 2.1 (Node Management)
Day 10: Read Chapter 7, Lessons 5-6
Day 11: Complete Lab 5.1 (Pod Troubleshooting)
Day 12: Read Chapter 8
Day 13: Practice all labs again
Day 14: Review and mock exam
```

---

## 📊 Coverage Matrix

| Chapter | Completed Labs | Planned Labs | Coverage |
|---------|----------------|--------------|----------|
| Chapter 1 | 0 | 1 | 🔄 Partial |
| Chapter 2 | 0 | 0 | ✅ Conceptual |
| Chapter 3 | 1 | 1 | ✅ Complete |
| Chapter 4 | 1 | 1 | ✅ Complete |
| Chapter 5 | 3 | 1 | ✅ Complete |
| Chapter 6 | 2 | 2 | ✅ Complete |
| Chapter 7 | 2 | 3 | ✅ Complete |
| Chapter 8 | 1 | 4 | 🔄 Partial |
| Chapter 9 | 0 | 0 | ✅ Conceptual |
| Chapter 10 | 1 | 1 | 🔄 Partial |
| Chapter 11 | 0 | 0 | ✅ Conceptual |
| Chapter 12 | 4 | 6 | ✅ Practice |

**Overall**: 75% practical coverage with completed labs, 100% when all labs completed

---

## 💡 How to Use This Mapping

### For Sequential Learning
1. Read the chapter section
2. Complete the related lab
3. Review the concept mapping table
4. Ensure you understand the connection

### For Targeted Practice
1. Identify weak areas from chapter reading
2. Find the corresponding lab section
3. Practice that specific skill
4. Return to chapter for theory review

### For Exam Preparation
1. Review all chapter-lab mappings
2. Ensure you've completed all related labs
3. Focus on high-coverage chapters (5, 6, 7)
4. Practice troubleshooting labs repeatedly

---

**This mapping ensures your practical skills directly support your theoretical knowledge!** 🎯
