# Lab 1.1: Installing cert-manager and Automating TLS Certificates

## 📚 Related Topics
- TLS/SSL certificates
- Public Key Infrastructure (PKI)
- Certificate Authorities (CA)
- Kubernetes Ingress
- Let's Encrypt
- Certificate lifecycle management

## 🎯 Learning Objectives

By the end of this lab, you will be able to:
- Understand TLS/SSL certificate fundamentals
- Install cert-manager on Kubernetes
- Create Certificate Issuers
- Automate certificate issuance
- Secure Ingress with TLS
- Manage certificate lifecycle
- Troubleshoot certificate issues

## ⏱️ Estimated Time
60-75 minutes

## 📋 Prerequisites

- Running Kubernetes cluster
- kubectl and Helm configured
- Basic understanding of TLS/SSL
- Ingress controller installed (nginx recommended)
- Domain name (optional, for Let's Encrypt)

---

## 🏗️ cert-manager Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                  cert-manager Architecture                   │
└──────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Kubernetes Cluster                                         │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  User Creates Certificate Resource                   │  │
│  │  ┌────────────────────────────────────────────────┐ │  │
│  │  │ apiVersion: cert-manager.io/v1               │ │  │
│  │  │ kind: Certificate                              │ │  │
│  │  │ spec:                                          │ │  │
│  │  │   secretName: my-tls-cert                      │ │  │
│  │  │   issuerRef:                                   │ │  │
│  │  │     name: letsencrypt-prod                     │ │  │
│  │  └────────────────────────────────────────────────┘ │  │
│  └───────────────────┬──────────────────────────────────┘  │
│                      │                                      │
│                      ▼                                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  cert-manager Controller                            │  │
│  │  • Watches Certificate resources                     │  │
│  │  • Creates CertificateRequest                        │  │
│  │  • Manages ACME challenges                           │  │
│  └───────────────────┬──────────────────────────────────┘  │
│                      │                                      │
│                      ▼                                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Issuer / ClusterIssuer                             │  │
│  │  • Defines how to issue certificates                 │  │
│  │  • Connects to CA (Let's Encrypt, etc.)             │  │
│  └───────────────────┬──────────────────────────────────┘  │
│                      │                                      │
│                      ▼                                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Certificate Authority (CA)                         │  │
│  │  • Let's Encrypt                                     │  │
│  │  • Private CA                                        │  │
│  │  • Vault                                             │  │
│  └───────────────────┬──────────────────────────────────┘  │
│                      │                                      │
│                      ▼                                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Kubernetes Secret (TLS)                            │  │
│  │  • tls.crt (certificate)                             │  │
│  │  • tls.key (private key)                             │  │
│  │  • ca.crt (CA certificate)                           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Key Components:**
- **cert-manager**: Kubernetes add-on for certificate management
- **Issuer/ClusterIssuer**: Defines how to obtain certificates
- **Certificate**: Kubernetes resource requesting a certificate
- **CertificateRequest**: Internal resource for certificate issuance
- **Secret**: Stores the issued certificate and private key

---

## 📝 Part 1: Understanding TLS/SSL

### Step 1.1: TLS Certificate Components

```
┌─────────────────────────────────────────────────────────┐
│ TLS Certificate Structure                               │
├─────────────────────────────────────────────────────────┤
│ • Subject: Who the certificate is for                   │
│   - Common Name (CN): example.com                       │
│   - Organization (O): My Company                        │
│   - Country (C): US                                     │
│                                                         │
│ • Issuer: Who signed the certificate                    │
│   - CA name and details                                 │
│                                                         │
│ • Validity Period:                                      │
│   - Not Before: 2026-01-01                             │
│   - Not After: 2027-01-01                              │
│                                                         │
│ • Public Key: Used for encryption                       │
│                                                         │
│ • Signature: Proves authenticity                        │
│   - Signed by CA's private key                          │
│   - Verified with CA's public key                       │
│                                                         │
│ • Extensions:                                           │
│   - Subject Alternative Names (SANs)                    │
│   - Key Usage                                           │
│   - Extended Key Usage                                  │
└─────────────────────────────────────────────────────────┘
```

### Step 1.2: Certificate Trust Chain

```
┌─────────────────────────────────────────────────────────┐
│ Certificate Trust Chain                                 │
└─────────────────────────────────────────────────────────┘

Root CA Certificate (Self-signed)
  ↓ signs
Intermediate CA Certificate
  ↓ signs
End-Entity Certificate (Your website)

Example:
  Root: DigiCert Global Root CA
    ↓
  Intermediate: DigiCert TLS RSA SHA256 2020 CA1
    ↓
  End-Entity: example.com

Browsers trust Root CAs
  → Trust chain validates your certificate
```

---

## 📝 Part 2: Installing cert-manager

### Step 2.1: Install cert-manager CRDs

```bash
# Install cert-manager CRDs (Custom Resource Definitions)
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.2/cert-manager.crds.yaml
```

**Expected Output:**
```
customresourcedefinition.apiextensions.k8s.io/certificaterequests.cert-manager.io created
customresourcedefinition.apiextensions.k8s.io/certificates.cert-manager.io created
customresourcedefinition.apiextensions.k8s.io/challenges.acme.cert-manager.io created
customresourcedefinition.apiextensions.k8s.io/clusterissuers.cert-manager.io created
customresourcedefinition.apiextensions.k8s.io/issuers.cert-manager.io created
customresourcedefinition.apiextensions.k8s.io/orders.acme.cert-manager.io created
```

**💡 CRDs Created:**
- **Certificate**: Request a certificate
- **Issuer**: Namespace-scoped certificate issuer
- **ClusterIssuer**: Cluster-wide certificate issuer
- **CertificateRequest**: Internal resource
- **Challenge**: ACME challenge for domain validation
- **Order**: ACME order for certificate issuance

### Step 2.2: Install cert-manager using Helm

```bash
# Add Jetstack Helm repository
helm repo add jetstack https://charts.jetstack.io
```

**Expected Output:**
```
"jetstack" has been added to your repositories
```

```bash
# Update repository
helm repo update
```

```bash
# Install cert-manager
helm install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --version v1.13.2
```

**Expected Output:**
```
NAME: cert-manager
LAST DEPLOYED: Sun Sep 27 14:00:00 2026
NAMESPACE: cert-manager
STATUS: deployed
REVISION: 1
NOTES:
cert-manager v1.13.2 has been deployed successfully!

In order to begin issuing certificates, you will need to set up a ClusterIssuer
or Issuer resource (for example, by creating a 'letsencrypt-staging' issuer).

More information on the different types of issuers and how to configure them
can be found in our documentation:

https://cert-manager.io/docs/configuration/

For information on how to configure cert-manager to automatically provision
Certificates for Ingress resources, take a look at the `ingress-shim`
documentation:

https://cert-manager.io/docs/usage/ingress/
```

### Step 2.3: Verify Installation

```bash
# Check cert-manager pods
kubectl get pods -n cert-manager
```

**Expected Output:**
```
NAME                                       READY   STATUS    RESTARTS   AGE
cert-manager-7d4b7b9c4d-xxxxx             1/1     Running   0          1m
cert-manager-cainjector-7d4b7b9c4d-yyyyy  1/1     Running   0          1m
cert-manager-webhook-7d4b7b9c4d-zzzzz     1/1     Running   0          1m
```

**💡 Components:**
- **cert-manager**: Main controller
- **cainjector**: Injects CA bundles into webhooks
- **webhook**: Validates cert-manager resources

```bash
# Check CRDs
kubectl get crd | grep cert-manager
```

**Expected Output:**
```
certificaterequests.cert-manager.io          2026-09-27T14:00:00Z
certificates.cert-manager.io                 2026-09-27T14:00:00Z
challenges.acme.cert-manager.io              2026-09-27T14:00:00Z
clusterissuers.cert-manager.io               2026-09-27T14:00:00Z
issuers.cert-manager.io                      2026-09-27T14:00:00Z
orders.acme.cert-manager.io                  2026-09-27T14:00:00Z
```

---

## 📝 Part 3: Creating a Self-Signed Issuer

### Step 3.1: Create Self-Signed ClusterIssuer

```bash
# Create self-signed ClusterIssuer
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: selfsigned-issuer
spec:
  selfSigned: {}
EOF
```

**Expected Output:**
```
clusterissuer.cert-manager.io/selfsigned-issuer created
```

**💡 Self-Signed Issuer:**
- Good for testing and development
- Not trusted by browsers
- No external CA required

### Step 3.2: Create a Certificate

```bash
# Request a self-signed certificate
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: example-com
  namespace: default
spec:
  secretName: example-com-tls
  issuerRef:
    name: selfsigned-issuer
    kind: ClusterIssuer
  commonName: example.com
  dnsNames:
    - example.com
    - www.example.com
EOF
```

**Expected Output:**
```
certificate.cert-manager.io/example-com created
```

**💡 Certificate Spec:**
- **secretName**: Where to store the certificate
- **issuerRef**: Which issuer to use
- **commonName**: Primary domain
- **dnsNames**: Subject Alternative Names (SANs)

### Step 3.3: Verify Certificate

```bash
# Check certificate status
kubectl get certificate -n default
```

**Expected Output:**
```
NAME          READY   SECRET            AGE
example-com   True    example-com-tls   30s
```

```bash
# Describe certificate
kubectl describe certificate example-com -n default
```

**Expected Output:**
```
Name:         example-com
Namespace:    default
API Version:  cert-manager.io/v1
Kind:         Certificate
Status:
  Conditions:
    Last Transition Time:  2026-09-27T14:05:00Z
    Message:               Certificate is up to date and has not expired
    Reason:                Ready
    Status:                True
    Type:                  Ready
  Not After:               2027-09-27T14:05:00Z
  Not Before:              2026-09-27T14:05:00Z
  Renewal Time:            2027-06-27T14:05:00Z
Events:
  Type    Reason     Age   From          Message
  ----    ------     ----  ----          -------
  Normal  Issuing    30s   cert-manager  Issuing certificate as Secret does not exist
  Normal  Generated  30s   cert-manager  Stored new private key in temporary Secret
  Normal  Requested  30s   cert-manager  Created new CertificateRequest resource
  Normal  Issued     30s   cert-manager  Certificate issued successfully
```

### Step 3.4: Inspect the Secret

```bash
# View the TLS secret
kubectl get secret example-com-tls -n default -o yaml
```

**Expected Output:**
```yaml
apiVersion: v1
kind: Secret
type: kubernetes.io/tls
metadata:
  name: example-com-tls
  namespace: default
data:
  tls.crt: LS0tLS1CRUdJTi... (base64 encoded certificate)
  tls.key: LS0tLS1CRUdJTi... (base64 encoded private key)
  ca.crt: LS0tLS1CRUdJTi...  (base64 encoded CA cert)
```

**💡 Secret Contents:**
- **tls.crt**: The certificate
- **tls.key**: The private key
- **ca.crt**: The CA certificate

```bash
# Decode and view certificate
kubectl get secret example-com-tls -n default -o jsonpath='{.data.tls\.crt}' | base64 -d | openssl x509 -text -noout
```

**Expected Output:**
```
Certificate:
    Data:
        Version: 3 (0x2)
        Serial Number: ...
    Signature Algorithm: sha256WithRSAEncryption
        Issuer: CN=example.com
        Validity
            Not Before: Sep 27 14:05:00 2026 GMT
            Not After : Sep 27 14:05:00 2027 GMT
        Subject: CN=example.com
        Subject Public Key Info:
            Public Key Algorithm: rsaEncryption
                RSA Public-Key: (2048 bit)
        X509v3 extensions:
            X509v3 Subject Alternative Name:
                DNS:example.com, DNS:www.example.com
```

---

## 📝 Part 4: Creating a Let's Encrypt Issuer

### Step 4.1: Create Let's Encrypt Staging Issuer

```bash
# Create Let's Encrypt staging issuer
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-staging
spec:
  acme:
    # Staging server (for testing)
    server: https://acme-staging-v02.api.letsencrypt.org/directory
    # Email for expiration notifications
    email: your-email@example.com
    # Secret to store ACME account private key
    privateKeySecretRef:
      name: letsencrypt-staging
    # HTTP-01 challenge
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
```

**Expected Output:**
```
clusterissuer.cert-manager.io/letsencrypt-staging created
```

**💡 ACME Configuration:**
- **server**: Let's Encrypt API endpoint
- **email**: For certificate expiration notices
- **privateKeySecretRef**: Stores ACME account key
- **solvers**: How to prove domain ownership

**Challenge Types:**
```
┌─────────────────────────────────────────────────────────┐
│ Challenge Type │ Description                           │
├─────────────────────────────────────────────────────────┤
│ HTTP-01        │ Serves file at http://<domain>/.well- │
│                │ known/acme-challenge/<token>          │
│                │ Requires port 80 accessible           │
│                │ Good for: Single domains              │
├─────────────────────────────────────────────────────────┤
│ DNS-01         │ Creates DNS TXT record                │
│                │ _acme-challenge.<domain>              │
│                │ Requires DNS API access               │
│                │ Good for: Wildcards, internal domains │
└─────────────────────────────────────────────────────────┘
```

### Step 4.2: Create Production Issuer

```bash
# Create Let's Encrypt production issuer
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    # Production server
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
```

**Expected Output:**
```
clusterissuer.cert-manager.io/letsencrypt-prod created
```

**💡 Staging vs Production:**
- **Staging**: Higher rate limits, test certificates
- **Production**: Lower rate limits, trusted certificates
- **Best Practice**: Test with staging first!

### Step 4.3: Verify Issuers

```bash
# List ClusterIssuers
kubectl get clusterissuer
```

**Expected Output:**
```
NAME                  READY   AGE
selfsigned-issuer     True    5m
letsencrypt-staging   True    2m
letsencrypt-prod      True    1m
```

```bash
# Check issuer status
kubectl describe clusterissuer letsencrypt-staging
```

**Expected Output:**
```
Name:         letsencrypt-staging
Status:
  Acme:
    Last Registered Email:  your-email@example.com
    Uri:                    https://acme-staging-v02.api.letsencrypt.org/acme/acct/...
  Conditions:
    Last Transition Time:  2026-09-27T14:10:00Z
    Message:               The ACME account was registered with the ACME server
    Reason:                ACMEAccountRegistered
    Status:                True
    Type:                  Ready
```

---

## 📝 Part 5: Securing Ingress with TLS

### Step 5.1: Deploy Sample Application

```bash
# Create deployment
kubectl create deployment hello-world --image=gcr.io/google-samples/hello-app:1.0

# Expose as service
kubectl expose deployment hello-world --port=8080
```

### Step 5.2: Create Ingress with TLS

```bash
# Create Ingress with cert-manager annotation
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: hello-world-ingress
  namespace: default
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-staging"
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - hello.example.com
    secretName: hello-world-tls
  rules:
  - host: hello.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: hello-world
            port:
              number: 8080
EOF
```

**Expected Output:**
```
ingress.networking.k8s.io/hello-world-ingress created
```

**💡 Key Annotations:**
- `cert-manager.io/cluster-issuer`: Which issuer to use
- `cert-manager.io/issuer`: For namespace-scoped Issuer

**What Happens:**
1. cert-manager sees the annotation
2. Creates a Certificate resource automatically
3. Requests certificate from Let's Encrypt
4. Completes ACME challenge
5. Stores certificate in specified Secret

### Step 5.3: Monitor Certificate Creation

```bash
# Watch certificate creation
kubectl get certificate -n default -w
```

**Expected Output:**
```
NAME              READY   SECRET            AGE
hello-world-tls   False   hello-world-tls   5s
hello-world-tls   False   hello-world-tls   10s
hello-world-tls   True    hello-world-tls   45s
```

```bash
# Check certificate details
kubectl describe certificate hello-world-tls -n default
```

**Expected Output:**
```
Events:
  Type    Reason     Age   From          Message
  ----    ------     ----  ----          -------
  Normal  Issuing    1m    cert-manager  Issuing certificate as Secret does not exist
  Normal  Generated  1m    cert-manager  Stored new private key in temporary Secret
  Normal  Requested  1m    cert-manager  Created new CertificateRequest
  Normal  Issuing    1m    cert-manager  The certificate has been successfully issued
```

---

## ✅ Validation Steps

```bash
# 1. Verify cert-manager is running
kubectl get pods -n cert-manager

# 2. Check ClusterIssuers
kubectl get clusterissuer

# 3. Verify certificates
kubectl get certificate -A

# 4. Check TLS secrets
kubectl get secret -A | grep tls

# 5. Test HTTPS (if domain is configured)
curl -k https://hello.example.com
```

---

## 🧹 Cleanup

```bash
# Delete test resources
kubectl delete ingress hello-world-ingress
kubectl delete service hello-world
kubectl delete deployment hello-world
kubectl delete certificate example-com

# Delete issuers
kubectl delete clusterissuer selfsigned-issuer letsencrypt-staging letsencrypt-prod

# Uninstall cert-manager
helm uninstall cert-manager -n cert-manager
kubectl delete namespace cert-manager

# Delete CRDs
kubectl delete -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.2/cert-manager.crds.yaml
```

---

## 🎯 Challenge Tasks

1. **Create Private CA**
   ```yaml
   # Create CA certificate
   apiVersion: cert-manager.io/v1
   kind: Certificate
   metadata:
     name: my-ca
   spec:
     isCA: true
     commonName: my-ca
     secretName: my-ca-secret
     issuerRef:
       name: selfsigned-issuer
       kind: ClusterIssuer
   ---
   # Create CA Issuer
   apiVersion: cert-manager.io/v1
   kind: ClusterIssuer
   metadata:
     name: my-ca-issuer
   spec:
     ca:
       secretName: my-ca-secret
   ```

2. **Wildcard Certificate with DNS-01**
   ```yaml
   # Requires DNS provider credentials
   apiVersion: cert-manager.io/v1
   kind: ClusterIssuer
   metadata:
     name: letsencrypt-dns
   spec:
     acme:
       server: https://acme-v02.api.letsencrypt.org/directory
       email: your-email@example.com
       privateKeySecretRef:
         name: letsencrypt-dns
       solvers:
       - dns01:
           cloudflare:
             email: your-email@example.com
             apiTokenSecretRef:
               name: cloudflare-api-token
               key: api-token
   ```

3. **Certificate Renewal Monitoring**
   ```bash
   # Check certificate expiration
   kubectl get certificate -A -o custom-columns=NAME:.metadata.name,NAMESPACE:.metadata.namespace,READY:.status.conditions[0].status,EXPIRY:.status.notAfter
   ```

---

## 🐛 Troubleshooting

### Issue: Certificate stays in False state

**Solution:**
```bash
# Check certificate events
kubectl describe certificate <name> -n <namespace>

# Check CertificateRequest
kubectl get certificaterequest -n <namespace>
kubectl describe certificaterequest <name> -n <namespace>

# Check Challenge (for ACME)
kubectl get challenge -n <namespace>
kubectl describe challenge <name> -n <namespace>

# Check cert-manager logs
kubectl logs -n cert-manager deployment/cert-manager
```

### Issue: ACME challenge fails

**Solution:**
```bash
# Verify Ingress is accessible
curl http://<domain>/.well-known/acme-challenge/test

# Check Ingress controller logs
kubectl logs -n ingress-nginx deployment/ingress-nginx-controller

# Verify DNS resolves correctly
nslookup <domain>

# Check firewall allows port 80
```

### Issue: Certificate not renewing

**Solution:**
```bash
# Check renewal time
kubectl get certificate <name> -o jsonpath='{.status.renewalTime}'

# Force renewal
kubectl delete certificaterequest <name>

# Check cert-manager controller logs
kubectl logs -n cert-manager deployment/cert-manager | grep renewal
```

---

## 📚 Key Takeaways

✅ **cert-manager** automates certificate management  
✅ **ClusterIssuer** defines certificate authorities  
✅ **Certificate** resource requests certificates  
✅ **Let's Encrypt** provides free, automated certificates  
✅ **ACME challenges** prove domain ownership  
✅ **Ingress annotations** trigger automatic certificate creation  
✅ **TLS secrets** store certificates and private keys  
✅ **Certificate renewal** is automatic  

---

## 📖 Next Steps

Continue to [Lab 2.1: Advanced Certificate Management and mTLS](lab-2.1-mtls-advanced.md)

---

## 📝 Lab Completion Checklist

- [ ] Installed cert-manager
- [ ] Created self-signed issuer
- [ ] Requested self-signed certificate
- [ ] Created Let's Encrypt issuers
- [ ] Secured Ingress with TLS
- [ ] Monitored certificate creation
- [ ] Verified certificate details
- [ ] Understood ACME challenges
- [ ] Completed challenge tasks

**Congratulations! You've mastered cert-manager and TLS automation!** 🎉
