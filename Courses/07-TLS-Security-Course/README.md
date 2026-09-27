# TLS and Certificate Management in Kubernetes Course

## 📚 Course Overview

Master TLS certificate management in Kubernetes. Learn to secure applications with HTTPS, automate certificate lifecycle with cert-manager, implement mutual TLS, and follow security best practices.

## 🎯 Learning Objectives

- ✅ Understand TLS/SSL fundamentals
- ✅ Generate and manage certificates
- ✅ Install and configure cert-manager
- ✅ Automate certificate issuance
- ✅ Implement HTTPS for applications
- ✅ Configure mutual TLS (mTLS)
- ✅ Integrate with Let's Encrypt
- ✅ Troubleshoot certificate issues

## 📋 Course Structure

### Module 1: TLS Fundamentals
- **Lab 1.1**: Understanding TLS/SSL
- **Lab 1.2**: Certificate Authorities and Trust
- **Lab 1.3**: Manual Certificate Creation

### Module 2: cert-manager
- **Lab 2.1**: Installing cert-manager
- **Lab 2.2**: Issuers and ClusterIssuers
- **Lab 2.3**: Certificate Resources

### Module 3: Automated Certificates
- **Lab 3.1**: Let's Encrypt Integration
- **Lab 3.2**: DNS-01 and HTTP-01 Challenges
- **Lab 3.3**: Wildcard Certificates

### Module 4: Application Security
- **Lab 4.1**: Securing Ingress with TLS
- **Lab 4.2**: Service-to-Service Encryption
- **Lab 4.3**: Mutual TLS (mTLS)

### Module 5: Advanced Topics
- **Lab 5.1**: Private CA Setup
- **Lab 5.2**: Certificate Rotation
- **Lab 5.3**: Security Scanning and Compliance

## 🛠️ Prerequisites

- Kubernetes cluster
- kubectl and Helm
- Basic networking knowledge
- Understanding of PKI concepts

## 🚀 Quick Start

```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Verify installation
kubectl get pods -n cert-manager

# Create a ClusterIssuer
kubectl apply -f - <<EOF
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-staging
spec:
  acme:
    server: https://acme-staging-v02.api.letsencrypt.org/directory
    email: your-email@example.com
    privateKeySecretRef:
      name: letsencrypt-staging
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
```

## 📚 Resources

- [cert-manager Documentation](https://cert-manager.io/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
- [TLS Best Practices](https://wiki.mozilla.org/Security/Server_Side_TLS)

---

**Course Version**: 1.0  
**cert-manager Version**: 1.13+
