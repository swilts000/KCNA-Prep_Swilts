# Quick Start Guide

## 🚀 Get Started in 5 Minutes

This guide will help you start the KCNA lab course immediately.

---

## ✅ Step 1: Check Prerequisites (2 minutes)

### Required Software
```bash
# Check Docker is installed
docker --version
# Expected: Docker version 20.x or higher

# Check kubectl is installed
kubectl version --client
# Expected: Client Version: v1.28.x or higher
```

### If Not Installed

**macOS:**
```bash
# Install Docker Desktop from https://www.docker.com/products/docker-desktop

# Install kubectl
brew install kubectl

# Install minikube
brew install minikube
```

**Linux:**
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install kubectl /usr/local/bin/

# Install minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
```

**Windows:**
```powershell
# Install using Chocolatey
choco install docker-desktop
choco install kubernetes-cli
choco install minikube
```

---

## ✅ Step 2: Start Your First Cluster (2 minutes)

```bash
# Start minikube
minikube start

# Verify cluster is running
kubectl get nodes

# Expected output:
# NAME       STATUS   ROLES           AGE   VERSION
# minikube   Ready    control-plane   1m    v1.28.3
```

**Success!** You now have a running Kubernetes cluster! 🎉

---

## ✅ Step 3: Start Your First Lab (1 minute)

```bash
# Navigate to the labs directory
cd Course/labs

# Open the first lab
# macOS/Linux:
open lab-1.1-minikube-cluster.md
# Or use your favorite text editor:
code lab-1.1-minikube-cluster.md
```

**You're ready to learn!** Follow the lab instructions step by step.

---

## 📚 Lab Sequence for Beginners

### Week 1: Foundations
**Day 1-2**: [Lab 1.1 - Minikube Cluster](labs/lab-1.1-minikube-cluster.md)
- Learn cluster creation
- Explore components
- Practice kubectl basics

**Day 3-4**: [Lab 3.1 - Deployment Lifecycle](labs/lab-3.1-deployment-lifecycle.md)
- Create deployments
- Perform rolling updates
- Practice rollbacks

**Day 5-6**: [Lab 5.1 - Pod Troubleshooting](labs/lab-5.1-pod-troubleshooting.md)
- Debug common errors
- Read logs effectively
- Systematic troubleshooting

**Day 7**: Review and practice
- Repeat challenging sections
- Complete challenge tasks
- Document learnings

### Week 2: Advanced Topics
**Day 8-9**: [Lab 2.1 - Node Management](labs/lab-2.1-node-management.md)
- Safe maintenance procedures
- Taints and tolerations
- Zero-downtime operations

**Day 10-14**: Continue with remaining labs
- Follow the [Lab Index](labs/INDEX.md)
- Choose labs based on your interests
- Practice regularly

---

## 🎯 Quick Reference: Essential Commands

### Cluster Management
```bash
# Start cluster
minikube start

# Stop cluster
minikube stop

# Delete cluster
minikube delete

# Check cluster status
kubectl cluster-info
```

### Pod Operations
```bash
# List pods
kubectl get pods

# Describe pod
kubectl describe pod <pod-name>

# View logs
kubectl logs <pod-name>

# Execute command in pod
kubectl exec <pod-name> -- <command>

# Interactive shell
kubectl exec -it <pod-name> -- /bin/sh
```

### Deployment Operations
```bash
# Create deployment
kubectl create deployment <name> --image=<image>

# Scale deployment
kubectl scale deployment <name> --replicas=<count>

# Update image
kubectl set image deployment/<name> <container>=<new-image>

# Rollback
kubectl rollout undo deployment/<name>

# Check rollout status
kubectl rollout status deployment/<name>
```

### Troubleshooting
```bash
# Get all resources
kubectl get all

# Describe resource
kubectl describe <resource-type> <name>

# View events
kubectl get events --sort-by='.lastTimestamp'

# Check node status
kubectl get nodes

# View pod logs
kubectl logs <pod-name> --previous
```

---

## 🐛 Common Issues & Quick Fixes

### Issue: Minikube won't start
```bash
# Solution: Delete and recreate
minikube delete
minikube start
```

### Issue: kubectl not connecting
```bash
# Solution: Update context
minikube update-context
kubectl config use-context minikube
```

### Issue: Not enough resources
```bash
# Solution: Start with fewer resources
minikube start --cpus 2 --memory 2048
```

### Issue: Docker not running
```bash
# Solution: Start Docker Desktop
# macOS: Open Docker Desktop application
# Linux: sudo systemctl start docker
# Windows: Start Docker Desktop
```

---

## 📖 Learning Resources

### Official Documentation
- **Kubernetes Docs**: https://kubernetes.io/docs/
- **kubectl Cheat Sheet**: https://kubernetes.io/docs/reference/kubectl/cheatsheet/
- **Minikube Docs**: https://minikube.sigs.k8s.io/docs/

### Interactive Learning
- **Killercoda**: https://killercoda.com/kubernetes
- **Play with K8s**: https://labs.play-with-k8s.com/

### Community
- **Kubernetes Slack**: https://kubernetes.slack.com/
- **Reddit**: r/kubernetes
- **Stack Overflow**: Tag `kubernetes`

---

## 🎓 Study Schedule

### Option 1: Intensive (2 weeks)
- **Daily**: 2-3 hours
- **Total**: 28-42 hours
- **Goal**: Complete all labs quickly

### Option 2: Balanced (1 month)
- **Daily**: 1-1.5 hours
- **Total**: 30-45 hours
- **Goal**: Steady progress with retention

### Option 3: Relaxed (2 months)
- **Daily**: 30-45 minutes
- **Total**: 30-45 hours
- **Goal**: Deep understanding, no rush

**Choose the schedule that fits your lifestyle!**

---

## ✅ Daily Checklist

Before each lab session:
- [ ] Docker is running
- [ ] Cluster is started (`minikube start`)
- [ ] kubectl is working (`kubectl get nodes`)
- [ ] Lab file is open
- [ ] Terminal is ready
- [ ] Notebook for notes is ready

After each lab session:
- [ ] Completed validation steps
- [ ] Cleaned up resources
- [ ] Documented learnings
- [ ] Noted any issues
- [ ] Reviewed key takeaways
- [ ] Stopped cluster if not needed (`minikube stop`)

---

## 🎯 Success Metrics

Track your progress:

### Week 1 Goals
- [ ] Completed Lab 1.1
- [ ] Completed Lab 3.1
- [ ] Completed Lab 5.1
- [ ] Can create and delete clusters
- [ ] Can deploy applications
- [ ] Can troubleshoot basic pod issues

### Week 2 Goals
- [ ] Completed Lab 2.1
- [ ] Completed 2+ additional labs
- [ ] Can perform node maintenance
- [ ] Can configure networking
- [ ] Can debug complex issues

### Month 1 Goals
- [ ] Completed 10+ labs
- [ ] Built a personal project
- [ ] Contributed to community
- [ ] Ready for KCNA exam

---

## 💡 Pro Tips

1. **Type, Don't Copy**: Build muscle memory by typing commands
2. **Break Things**: Learn by making mistakes in a safe environment
3. **Read Errors**: Error messages are learning opportunities
4. **Ask Questions**: No question is too basic
5. **Help Others**: Teaching reinforces your own learning
6. **Stay Curious**: Explore beyond the lab instructions
7. **Document**: Keep a learning journal
8. **Practice Daily**: Consistency beats intensity

---

## 🚀 Ready to Start?

You have everything you need:
- ✅ Prerequisites checked
- ✅ Cluster running
- ✅ First lab identified
- ✅ Resources bookmarked
- ✅ Schedule planned

**Now begin with [Lab 1.1: Local Cluster with Minikube](labs/lab-1.1-minikube-cluster.md)!**

---

## 📞 Need Help?

- **Stuck on a step?** Re-read the explanation section
- **Error message?** Check the troubleshooting section
- **Concept unclear?** Review the related chapter
- **Still stuck?** Ask in Kubernetes Slack or Stack Overflow

**Remember**: Everyone starts as a beginner. You've got this! 💪

---

**Happy Learning!** 🎉
