# 📚 Numbered Courses Guide - Learning Order

## Overview

All courses are now numbered in the **recommended learning order**. Follow the sequence for optimal skill building!

---

## 🎯 Course Sequence

### **Course 01: Kubernetes Fundamentals** 🚀 START HERE
**Directory**: `Courses/01-Kubernetes-Fundamentals-Course/`  
**Status**: ✅ 4 labs completed  
**Why First**: Foundation for everything else

```bash
cd Courses/01-Kubernetes-Fundamentals-Course/labs
```

**Topics**:
- Cluster creation and management
- Deployments and scaling
- Node maintenance
- Pod troubleshooting

---

### **Course 02: Helm**
**Directory**: `Courses/02-Helm-Course/`  
**Status**: ✅ 1 lab completed  
**Why Second**: Package management is essential for deploying apps

```bash
cd Courses/02-Helm-Course/labs
```

**Topics**:
- Helm installation
- Chart deployment
- Values customization
- Release management

---

### **Course 03: Prometheus**
**Directory**: `Courses/03-Prometheus-Course/`  
**Status**: 📋 Planned  
**Why Third**: Monitoring before visualization

```bash
cd Courses/03-Prometheus-Course
```

**Topics**:
- Metrics collection
- PromQL queries
- Alerting rules
- Kubernetes monitoring

---

### **Course 04: Grafana**
**Directory**: `Courses/04-Grafana-Course/`  
**Status**: 📋 Planned  
**Why Fourth**: Visualize Prometheus data

```bash
cd Courses/04-Grafana-Course
```

**Topics**:
- Dashboard creation
- Data source integration
- Visualizations
- Alerting

---

### **Course 05: Cilium**
**Directory**: `Courses/05-Cilium-Course/`  
**Status**: 📋 Planned  
**Why Fifth**: Advanced networking after basics

```bash
cd Courses/05-Cilium-Course
```

**Topics**:
- eBPF fundamentals
- Network policies
- Hubble observability
- Service mesh

---

### **Course 06: Vector**
**Directory**: `Courses/06-Vector-Course/`  
**Status**: 📋 Planned  
**Why Sixth**: Log pipeline after monitoring

```bash
cd Courses/06-Vector-Course
```

**Topics**:
- Log collection
- Data transformation
- Pipeline routing
- Performance tuning

---

### **Course 07: TLS Security**
**Directory**: `Courses/07-TLS-Security-Course/`  
**Status**: 📋 Planned  
**Why Last**: Security layer on top of everything

```bash
cd Courses/07-TLS-Security-Course
```

**Topics**:
- Certificate management
- cert-manager
- Automated issuance
- mTLS implementation

---

## 🎓 Learning Paths with Numbers

### Path 1: KCNA Certification (~10 hours)
```
01 → 02
(Kubernetes Fundamentals → Helm)
```

### Path 2: Platform Engineer (~40 hours)
```
01 → 02 → 03 → 04 → 05
(K8s → Helm → Prometheus → Grafana → Cilium)
```

### Path 3: Cloud Native Expert (~80 hours)
```
01 → 02 → 03 → 04 → 05 → 06 → 07
(Complete sequence)
```

### Path 4: Security Specialist (~35 hours)
```
01 → 05 → 07
(K8s → Cilium → TLS Security)
```

### Path 5: Observability Engineer (~30 hours)
```
01 → 03 → 04 → 06
(K8s → Prometheus → Grafana → Vector)
```

---

## 📊 Progress Tracking

| # | Course | Status | Labs | Your Progress |
|---|--------|--------|------|---------------|
| 01 | Kubernetes Fundamentals | ✅ Ready | 4/20 | ☐ Not Started |
| 02 | Helm | ✅ Ready | 1/15 | ☐ Not Started |
| 03 | Prometheus | 📋 Planned | 0/15 | ☐ Not Started |
| 04 | Grafana | 📋 Planned | 0/15 | ☐ Not Started |
| 05 | Cilium | 📋 Planned | 0/15 | ☐ Not Started |
| 06 | Vector | 📋 Planned | 0/15 | ☐ Not Started |
| 07 | TLS Security | 📋 Planned | 0/15 | ☐ Not Started |

---

## 🚀 Quick Navigation

```bash
# List all courses in order
ls -1 Courses/

# Jump to any course
cd Courses/01-Kubernetes-Fundamentals-Course
cd Courses/02-Helm-Course
cd Courses/03-Prometheus-Course
cd Courses/04-Grafana-Course
cd Courses/05-Cilium-Course
cd Courses/06-Vector-Course
cd Courses/07-TLS-Security-Course
```

---

## 💡 Why This Order?

### 01. Kubernetes Fundamentals
- **Must come first**: Everything builds on K8s basics
- **Foundation**: Understand pods, deployments, services

### 02. Helm
- **Depends on**: Course 01
- **Enables**: Easy application deployment
- **Prepares for**: All other courses use Helm

### 03. Prometheus
- **Depends on**: Courses 01, 02
- **Reason**: Need to monitor before visualizing
- **Prepares for**: Grafana integration

### 04. Grafana
- **Depends on**: Course 03
- **Reason**: Visualizes Prometheus data
- **Natural pair**: Prometheus + Grafana

### 05. Cilium
- **Depends on**: Courses 01, 02
- **Reason**: Advanced networking requires K8s knowledge
- **Complex**: Needs solid foundation

### 06. Vector
- **Depends on**: Courses 01, 02, 03
- **Reason**: Log pipeline complements monitoring
- **Integration**: Works with Prometheus

### 07. TLS Security
- **Depends on**: All previous courses
- **Reason**: Security layer across all components
- **Final touch**: Secures everything you've built

---

## 📝 Study Tips

### Sequential Learning
✅ **Do**: Follow the numbered order  
❌ **Don't**: Jump around randomly

### Build on Knowledge
✅ **Do**: Complete labs in each course  
❌ **Don't**: Skip to advanced topics

### Practice Regularly
✅ **Do**: 30-60 minutes daily  
❌ **Don't**: Cram everything at once

### Document Progress
✅ **Do**: Keep notes and track completion  
❌ **Don't**: Forget what you learned

---

## 🎯 Getting Started

### Today
1. ✅ Read this guide
2. ✅ Navigate to Course 01
3. ✅ Start Lab 1.1

```bash
cd Courses/01-Kubernetes-Fundamentals-Course/labs
open lab-1.1-minikube-cluster.md
```

### This Week
- Complete Course 01, Labs 1.1 and 3.1
- Start Course 02, Lab 1.1

### This Month
- Complete Course 01 (all available labs)
- Complete Course 02 (Lab 1.1)
- Start Course 03 (when available)

---

## ✨ Benefits of Numbered Courses

✓ **Clear Path**: No confusion about what's next  
✓ **Logical Order**: Each builds on previous  
✓ **Easy Navigation**: Alphabetical = learning order  
✓ **Progress Tracking**: See how far you've come  
✓ **Team Alignment**: Everyone follows same path  

---

**Start your numbered learning journey today!** 🚀

```bash
cd Courses/01-Kubernetes-Fundamentals-Course
cat QUICK_START.md
```
