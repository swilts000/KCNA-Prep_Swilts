# Lab 1.1: Installing Helm and First Deployment

## 📚 Related Topics
- Helm Architecture
- Package Management Concepts
- Kubernetes Resource Management

## 🎯 Learning Objectives

By the end of this lab, you will be able to:
- Install Helm 3 on your system
- Understand Helm architecture and components
- Add and manage Helm repositories
- Deploy your first application using Helm
- List, inspect, and delete Helm releases
- Understand the difference between Helm 2 and Helm 3

## ⏱️ Estimated Time
45-60 minutes

## 📋 Prerequisites

- Running Kubernetes cluster (minikube, kind, or cloud)
- kubectl installed and configured
- Basic understanding of Kubernetes resources
- Command line access

---

## 🏗️ Helm Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                     Helm 3 Architecture                      │
└──────────────────────────────────────────────────────────────┘

┌─────────────────┐
│   Your Machine  │
│                 │
│  ┌───────────┐  │
│  │ Helm CLI  │  │ ← Client-side only (no Tiller!)
│  └─────┬─────┘  │
│        │        │
└────────┼────────┘
         │
         │ kubectl API calls
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│              Kubernetes Cluster                             │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Kubernetes API Server                               │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                  │
│                          ▼                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Kubernetes Resources                                │  │
│  │                                                      │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐         │  │
│  │  │Deployment│  │ Service  │  │ConfigMap │         │  │
│  │  └──────────┘  └──────────┘  └──────────┘         │  │
│  │                                                      │  │
│  │  Release Metadata stored as Secrets                 │  │
│  │  (Release history, values, manifests)               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

Key Differences from Helm 2:
  ❌ No Tiller (server-side component)
  ✅ Direct kubectl API calls
  ✅ Improved security (no cluster-wide permissions)
  ✅ Release info stored as Secrets (not ConfigMaps)
```

---

## 📝 Part 1: Installing Helm

### Step 1.1: Check Prerequisites

```bash
# Verify kubectl is working
kubectl version --client
```

**Expected Output:**
```
Client Version: v1.28.0
Kustomize Version: v5.0.4
```

```bash
# Verify cluster access
kubectl cluster-info
```

**Expected Output:**
```
Kubernetes control plane is running at https://192.168.49.2:8443
CoreDNS is running at https://192.168.49.2:8443/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy
```

**💡 Explanation:**
- Helm uses kubectl configuration to connect to your cluster
- Helm 3 doesn't require any server-side components
- All operations go through the Kubernetes API

### Step 1.2: Install Helm (macOS)

```bash
# Using Homebrew (recommended)
brew install helm
```

**Expected Output:**
```
==> Downloading https://ghcr.io/v2/homebrew/core/helm/manifests/3.13.0
==> Downloading https://ghcr.io/v2/homebrew/core/helm/blobs/sha256:...
==> Pouring helm--3.13.0.arm64_sonoma.bottle.tar.gz
🍺  /opt/homebrew/Cellar/helm/3.13.0: 3 files, 45.6MB
```

**💡 What Happened:**
- Homebrew downloaded Helm binary
- Installed to `/opt/homebrew/bin/helm`
- Added to your PATH automatically

### Step 1.3: Install Helm (Linux)

```bash
# Download and install script
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

**Expected Output:**
```
Downloading https://get.helm.sh/helm-v3.13.0-linux-amd64.tar.gz
Verifying checksum... Done.
Preparing to install helm into /usr/local/bin
helm installed into /usr/local/bin/helm
```

**Alternative: Manual Installation**
```bash
# Download specific version
wget https://get.helm.sh/helm-v3.13.0-linux-amd64.tar.gz

# Extract
tar -zxvf helm-v3.13.0-linux-amd64.tar.gz

# Move to PATH
sudo mv linux-amd64/helm /usr/local/bin/helm

# Verify
helm version
```

### Step 1.4: Install Helm (Windows)

```powershell
# Using Chocolatey
choco install kubernetes-helm

# Or using Scoop
scoop install helm
```

### Step 1.5: Verify Installation

```bash
# Check Helm version
helm version
```

**Expected Output:**
```
version.BuildInfo{Version:"v3.13.0", GitCommit:"825e86f6a7a38cef1112bfa606e4127a706749b1", GitTreeState:"clean", GoVersion:"go1.20.8"}
```

**💡 Version Breakdown:**
- **Version**: Helm version (3.13.0)
- **GitCommit**: Specific build commit
- **GitTreeState**: clean = official release
- **GoVersion**: Go version used to build Helm

```bash
# Check Helm help
helm --help
```

**Expected Output:**
```
The Kubernetes package manager

Common actions for Helm:

- helm search:    search for charts
- helm pull:      download a chart to your local directory to view
- helm install:   upload the chart to Kubernetes
- helm list:      list releases of charts

Environment variables:

| Name                               | Description                                                                       |
|------------------------------------|-----------------------------------------------------------------------------------|
| $HELM_CACHE_HOME                   | set an alternative location for storing cached files.                            |
| $HELM_CONFIG_HOME                  | set an alternative location for storing Helm configuration.                      |
| $HELM_DATA_HOME                    | set an alternative location for storing Helm data.                               |

Use "helm [command] --help" for more information about a command.
```

---

## 📝 Part 2: Understanding Helm Directories

### Step 2.1: Explore Helm Configuration

```bash
# Show Helm environment
helm env
```

**Expected Output:**
```
HELM_CACHE_HOME="/Users/username/Library/Caches/helm"
HELM_CONFIG_HOME="/Users/username/Library/Preferences/helm"
HELM_DATA_HOME="/Users/username/Library/helm"
HELM_DEBUG="false"
HELM_KUBECONTEXT=""
HELM_MAX_HISTORY="10"
HELM_NAMESPACE="default"
HELM_PLUGINS="/Users/username/Library/helm/plugins"
HELM_REGISTRY_CONFIG="/Users/username/Library/Preferences/helm/registry/config.json"
HELM_REPOSITORY_CACHE="/Users/username/Library/Caches/helm/repository"
HELM_REPOSITORY_CONFIG="/Users/username/Library/Preferences/helm/repositories.yaml"
```

**💡 Directory Structure:**
```
~/.config/helm/          (or Library/Preferences/helm on macOS)
├── repositories.yaml    ← List of chart repositories
└── registry/
    └── config.json      ← OCI registry credentials

~/.cache/helm/           (or Library/Caches/helm on macOS)
└── repository/          ← Downloaded chart index files

~/.local/share/helm/     (or Library/helm on macOS)
└── plugins/             ← Helm plugins
```

### Step 2.2: Check Repository Configuration

```bash
# List configured repositories
helm repo list
```

**Expected Output (initially):**
```
Error: no repositories to show
```

**💡 Explanation:**
- Fresh Helm installation has no repositories configured
- You must manually add repositories
- This is different from package managers like apt/yum

---

## 📝 Part 3: Adding Helm Repositories

### Step 3.1: Understanding Repositories

**What is a Helm Repository?**
- HTTP server hosting chart packages
- Contains an `index.yaml` file listing all charts
- Charts are `.tgz` files (compressed archives)

**Popular Repositories:**
```
┌─────────────────┬──────────────────────────────────────┐
│ Repository      │ Description                          │
├─────────────────┼──────────────────────────────────────┤
│ Artifact Hub    │ Central discovery hub (not a repo)   │
│ Bitnami         │ Production-ready apps                │
│ Stable (deprecated) │ Old official charts (archived)   │
│ Jetstack        │ cert-manager and related charts      │
│ Prometheus      │ Monitoring stack charts              │
└─────────────────┴──────────────────────────────────────┘
```

### Step 3.2: Add Bitnami Repository

```bash
# Add Bitnami repository
helm repo add bitnami https://charts.bitnami.com/bitnami
```

**Expected Output:**
```
"bitnami" has been added to your repositories
```

**💡 What Happened:**
1. Helm contacted `https://charts.bitnami.com/bitnami`
2. Downloaded `index.yaml` (chart catalog)
3. Saved repository URL to `repositories.yaml`
4. Cached index file locally

```bash
# Verify repository was added
helm repo list
```

**Expected Output:**
```
NAME    URL
bitnami https://charts.bitnami.com/bitnami
```

### Step 3.3: Update Repository Index

```bash
# Update all repository indexes
helm repo update
```

**Expected Output:**
```
Hang tight while we grab the latest from your chart repositories...
...Successfully got an update from the "bitnami" chart repository
Update Complete. ⎈Happy Helming!⎈
```

**💡 Explanation:**
- Downloads latest `index.yaml` from each repository
- Similar to `apt update` or `yum update`
- Run this periodically to get new chart versions

### Step 3.4: Search for Charts

```bash
# Search for nginx charts
helm search repo nginx
```

**Expected Output:**
```
NAME                                    CHART VERSION   APP VERSION     DESCRIPTION
bitnami/nginx                          15.4.4          1.25.3          NGINX Open Source is a web server that can be a...
bitnami/nginx-ingress-controller       10.2.3          1.9.4           NGINX Ingress Controller is an Ingress controll...
bitnami/nginx-intel                    2.1.15          0.4.9           DEPRECATED NGINX Open Source for Intel is a lig...
```

**💡 Column Breakdown:**
- **NAME**: Repository/chart name
- **CHART VERSION**: Helm chart version
- **APP VERSION**: Application version inside the chart
- **DESCRIPTION**: Chart description

```bash
# Search with version details
helm search repo nginx --versions | head -10
```

**Expected Output:**
```
NAME                    CHART VERSION   APP VERSION     DESCRIPTION
bitnami/nginx          15.4.4          1.25.3          NGINX Open Source is a web server...
bitnami/nginx          15.4.3          1.25.3          NGINX Open Source is a web server...
bitnami/nginx          15.4.2          1.25.3          NGINX Open Source is a web server...
```

**💡 Use Cases:**
- `--versions`: Show all available versions
- Useful for finding specific chart versions
- Important for production deployments

---

## 📝 Part 4: Your First Helm Deployment

### Step 4.1: Inspect a Chart Before Installing

```bash
# Show chart information
helm show chart bitnami/nginx
```

**Expected Output:**
```yaml
apiVersion: v2
appVersion: 1.25.3
dependencies:
- name: common
  repository: oci://registry-1.docker.io/bitnamicharts
  tags:
  - bitnami-common
  version: 2.x.x
description: NGINX Open Source is a web server that can be also used as a reverse
  proxy, load balancer, and HTTP cache.
home: https://bitnami.com
icon: https://bitnami.com/assets/stacks/nginx/img/nginx-stack-220x234.png
keywords:
- nginx
- http
- web
- www
- reverse proxy
maintainers:
- name: VMware, Inc.
  url: https://github.com/bitnami/charts
name: nginx
sources:
- https://github.com/bitnami/charts/tree/main/bitnami/nginx
version: 15.4.4
```

**💡 Chart Metadata:**
- **apiVersion**: Chart API version (v2 for Helm 3)
- **appVersion**: Version of nginx being deployed
- **version**: Chart version
- **dependencies**: Other charts this chart depends on
- **maintainers**: Who maintains this chart

```bash
# Show default values
helm show values bitnami/nginx | head -50
```

**Expected Output:**
```yaml
## @section Global parameters
## Global Docker image parameters
## Please, note that this will override the image parameters, including dependencies, configured to use the global value
## Current available global Docker image parameters: imageRegistry, imagePullSecrets and storageClass
##

## @param global.imageRegistry Global Docker image registry
## @param global.imagePullSecrets Global Docker registry secret names as an array
##
global:
  imageRegistry: ""
  imagePullSecrets: []

## @section Common parameters
##

## @param kubeVersion Override Kubernetes version
##
kubeVersion: ""

## @param nameOverride String to partially override common.names.fullname
##
nameOverride: ""

## @param fullnameOverride String to fully override common.names.fullname
##
fullnameOverride: ""

## @param replicaCount Number of NGINX replicas to deploy
##
replicaCount: 1
```

**💡 Values File:**
- Default configuration for the chart
- Can be overridden during installation
- YAML format
- Well-documented with comments

### Step 4.2: Install Your First Chart

```bash
# Install nginx with release name "my-nginx"
helm install my-nginx bitnami/nginx
```

**Expected Output:**
```
NAME: my-nginx
LAST DEPLOYED: Sun Sep 27 11:45:00 2026
NAMESPACE: default
STATUS: deployed
REVISION: 1
TEST SUITE: None
NOTES:
CHART NAME: nginx
CHART VERSION: 15.4.4
APP VERSION: 1.25.3

** Please be patient while the chart is being deployed **
NGINX can be accessed through the following DNS name from within your cluster:

    my-nginx.default.svc.cluster.local (port 80)

To access NGINX from outside the cluster, follow the steps below:

1. Get the NGINX URL by running these commands:

  NOTE: It may take a few minutes for the LoadBalancer IP to be available.
        Watch the status with: 'kubectl get svc --namespace default -w my-nginx'

  export SERVICE_IP=$(kubectl get svc --namespace default my-nginx --template "{{ range (index .status.loadBalancer.ingress 0) }}{{ . }}{{ end }}")
  echo "NGINX URL: http://$SERVICE_IP/"
```

**💡 Installation Breakdown:**
- **NAME**: Release name (my-nginx)
- **NAMESPACE**: Where resources are deployed (default)
- **STATUS**: deployed = successful
- **REVISION**: 1 (first installation)
- **NOTES**: Post-installation instructions from chart

**What Helm Did:**
```
1. Downloaded chart from repository
2. Rendered templates with default values
3. Created Kubernetes resources via kubectl
4. Stored release metadata as Secret
5. Displayed post-installation notes
```

### Step 4.3: Verify Installation

```bash
# List Helm releases
helm list
```

**Expected Output:**
```
NAME            NAMESPACE       REVISION        UPDATED                                 STATUS          CHART           APP VERSION
my-nginx        default         1               2026-09-27 11:45:00.123456 -0700 PDT    deployed        nginx-15.4.4    1.25.3
```

**💡 Release Information:**
- **REVISION**: 1 (increments with each upgrade)
- **UPDATED**: Timestamp of last change
- **STATUS**: deployed, failed, pending-install, etc.

```bash
# List all releases (including failed/deleted)
helm list --all
```

```bash
# Check Kubernetes resources created
kubectl get all -l app.kubernetes.io/instance=my-nginx
```

**Expected Output:**
```
NAME                            READY   STATUS    RESTARTS   AGE
pod/my-nginx-7d4b7b9c4d-xxxxx   1/1     Running   0          2m

NAME               TYPE           CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
service/my-nginx   LoadBalancer   10.96.123.45    <pending>     80:30123/TCP   2m

NAME                       READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/my-nginx   1/1     1            1           2m

NAME                                  DESIRED   CURRENT   READY   AGE
replicaset.apps/my-nginx-7d4b7b9c4d   1         1         1       2m
```

**💡 Resources Created:**
- **Pod**: Running nginx container
- **Service**: LoadBalancer exposing nginx
- **Deployment**: Managing pod lifecycle
- **ReplicaSet**: Maintaining desired pod count

### Step 4.4: Inspect Release Details

```bash
# Get release status
helm status my-nginx
```

**Expected Output:**
```
NAME: my-nginx
LAST DEPLOYED: Sun Sep 27 11:45:00 2026
NAMESPACE: default
STATUS: deployed
REVISION: 1
TEST SUITE: None
NOTES:
[... same notes as installation ...]
```

```bash
# Get release values (what was actually used)
helm get values my-nginx
```

**Expected Output:**
```
USER-SUPPLIED VALUES:
null
```

**💡 Explanation:**
- No custom values provided
- All defaults from chart were used
- `null` means no user overrides

```bash
# Get all values (including defaults)
helm get values my-nginx --all | head -30
```

**Expected Output:**
```yaml
COMPUTED VALUES:
affinity: {}
args: []
automountServiceAccountToken: false
autoscaling:
  enabled: false
  maxReplicas: 11
  minReplicas: 1
  targetCPU: ""
  targetMemory: ""
cloneStaticSiteFromGit:
  enabled: false
  extraEnvVars: []
  extraEnvVarsSecret: ""
  extraVolumeMounts: []
  gitBranch: ""
  gitClone:
    args: []
    command: []
  gitSync:
    args: []
    command: []
  image:
    digest: ""
    pullPolicy: IfNotPresent
    pullSecrets: []
    registry: docker.io
    repository: bitnami/git
```

```bash
# Get manifest (actual Kubernetes YAML)
helm get manifest my-nginx | head -50
```

**Expected Output:**
```yaml
---
# Source: nginx/templates/serviceaccount.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: my-nginx
  namespace: default
  labels:
    app.kubernetes.io/instance: my-nginx
    app.kubernetes.io/managed-by: Helm
    app.kubernetes.io/name: nginx
    app.kubernetes.io/version: 1.25.3
    helm.sh/chart: nginx-15.4.4
automountServiceAccountToken: false
---
# Source: nginx/templates/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: my-nginx
  namespace: default
  labels:
    app.kubernetes.io/instance: my-nginx
    app.kubernetes.io/managed-by: Helm
    app.kubernetes.io/name: nginx
    app.kubernetes.io/version: 1.25.3
    helm.sh/chart: nginx-15.4.4
spec:
  type: LoadBalancer
  ports:
    - name: http
      port: 80
      targetPort: http
  selector:
    app.kubernetes.io/instance: my-nginx
    app.kubernetes.io/name: nginx
```

**💡 Manifest Details:**
- Shows actual Kubernetes YAML sent to API
- Includes all rendered templates
- Useful for debugging

---

## 📝 Part 5: Customizing Installations

### Step 5.1: Install with Custom Values (Inline)

```bash
# Install with custom replica count
helm install my-nginx-custom bitnami/nginx --set replicaCount=3
```

**Expected Output:**
```
NAME: my-nginx-custom
LAST DEPLOYED: Sun Sep 27 11:50:00 2026
NAMESPACE: default
STATUS: deployed
REVISION: 1
```

**💡 --set Flag:**
- Override values inline
- Format: `--set key=value`
- Multiple values: `--set key1=value1,key2=value2`
- Nested values: `--set parent.child=value`

```bash
# Verify 3 replicas
kubectl get pods -l app.kubernetes.io/instance=my-nginx-custom
```

**Expected Output:**
```
NAME                                READY   STATUS    RESTARTS   AGE
my-nginx-custom-7d4b7b9c4d-aaaaa    1/1     Running   0          30s
my-nginx-custom-7d4b7b9c4d-bbbbb    1/1     Running   0          30s
my-nginx-custom-7d4b7b9c4d-ccccc    1/1     Running   0          30s
```

### Step 5.2: Install with Values File

```bash
# Create a custom values file
cat <<EOF > custom-values.yaml
replicaCount: 2

service:
  type: NodePort
  nodePorts:
    http: 30080

resources:
  requests:
    memory: "64Mi"
    cpu: "100m"
  limits:
    memory: "128Mi"
    cpu: "200m"
EOF
```

**💡 Values File Structure:**
- YAML format
- Overrides chart defaults
- More maintainable than --set
- Can be version controlled

```bash
# Install using values file
helm install my-nginx-file bitnami/nginx -f custom-values.yaml
```

**Expected Output:**
```
NAME: my-nginx-file
LAST DEPLOYED: Sun Sep 27 11:55:00 2026
NAMESPACE: default
STATUS: deployed
REVISION: 1
```

```bash
# Verify custom values were applied
helm get values my-nginx-file
```

**Expected Output:**
```yaml
USER-SUPPLIED VALUES:
replicaCount: 2
resources:
  limits:
    cpu: 200m
    memory: 128Mi
  requests:
    cpu: 100m
    memory: 64Mi
service:
  nodePorts:
    http: 30080
  type: NodePort
```

```bash
# Check service type
kubectl get svc my-nginx-file
```

**Expected Output:**
```
NAME             TYPE       CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
my-nginx-file    NodePort   10.96.234.56    <none>        80:30080/TCP   1m
```

**💡 NodePort Service:**
- Accessible on port 30080 on any node
- No LoadBalancer needed
- Good for local development

---

## 📝 Part 6: Managing Releases

### Step 6.1: List All Releases

```bash
# List releases in current namespace
helm list
```

**Expected Output:**
```
NAME                    NAMESPACE       REVISION        UPDATED                                 STATUS          CHART           APP VERSION
my-nginx                default         1               2026-09-27 11:45:00.123456 -0700 PDT    deployed        nginx-15.4.4    1.25.3
my-nginx-custom         default         1               2026-09-27 11:50:00.123456 -0700 PDT    deployed        nginx-15.4.4    1.25.3
my-nginx-file           default         1               2026-09-27 11:55:00.123456 -0700 PDT    deployed        nginx-15.4.4    1.25.3
```

```bash
# List releases in all namespaces
helm list --all-namespaces
```

```bash
# Filter releases
helm list --filter 'nginx'
```

### Step 6.2: Uninstall a Release

```bash
# Uninstall my-nginx-custom
helm uninstall my-nginx-custom
```

**Expected Output:**
```
release "my-nginx-custom" uninstalled
```

**💡 What Happened:**
1. Helm deleted all Kubernetes resources
2. Removed release metadata (Secret)
3. Release history is gone (unless --keep-history used)

```bash
# Verify resources are deleted
kubectl get all -l app.kubernetes.io/instance=my-nginx-custom
```

**Expected Output:**
```
No resources found in default namespace.
```

```bash
# Uninstall with history retention
helm uninstall my-nginx-file --keep-history
```

**Expected Output:**
```
release "my-nginx-file" uninstalled
```

```bash
# List including uninstalled
helm list --uninstalled
```

**Expected Output:**
```
NAME                    NAMESPACE       REVISION        UPDATED                                 STATUS          CHART           APP VERSION
my-nginx-file           default         1               2026-09-27 11:55:00.123456 -0700 PDT    uninstalled     nginx-15.4.4    1.25.3
```

**💡 --keep-history:**
- Retains release metadata
- Allows viewing history after uninstall
- Can't rollback uninstalled releases
- Useful for auditing

---

## ✅ Validation Steps

### Comprehensive Validation

```bash
# 1. Verify Helm is installed
helm version

# 2. Check repositories
helm repo list

# 3. List current releases
helm list

# 4. Verify my-nginx is running
kubectl get pods -l app.kubernetes.io/instance=my-nginx

# 5. Check Helm secrets (release metadata)
kubectl get secrets -l owner=helm
```

**Expected Output:**
```
NAME                            TYPE                 DATA   AGE
sh.helm.release.v1.my-nginx.v1  helm.sh/release.v1   1      15m
```

**💡 Release Secrets:**
- Helm stores release info as Secrets
- Format: `sh.helm.release.v1.<release-name>.v<revision>`
- Contains: values, manifest, metadata
- Compressed and base64 encoded

---

## 🧹 Cleanup

```bash
# Uninstall remaining releases
helm uninstall my-nginx

# Verify all releases are gone
helm list

# Clean up values file
rm custom-values.yaml
```

---

## 🎯 Challenge Tasks

1. **Multi-Value Installation**
   ```bash
   # Install nginx with multiple custom values
   helm install challenge-nginx bitnami/nginx \
     --set replicaCount=3 \
     --set service.type=ClusterIP \
     --set resources.requests.memory=128Mi
   ```

2. **Explore Chart Structure**
   ```bash
   # Pull chart to local directory
   helm pull bitnami/nginx --untar
   
   # Explore the chart directory
   cd nginx
   ls -la
   cat Chart.yaml
   cat values.yaml
   ```

3. **Install in Different Namespace**
   ```bash
   # Create namespace
   kubectl create namespace helm-test
   
   # Install in specific namespace
   helm install test-nginx bitnami/nginx -n helm-test
   
   # List releases in that namespace
   helm list -n helm-test
   ```

---

## 🐛 Troubleshooting

### Issue: Helm command not found

**Error:** `helm: command not found`

**Solution:**
```bash
# Check if Helm is in PATH
which helm

# If not found, reinstall or add to PATH
export PATH=$PATH:/usr/local/bin
```

### Issue: Repository not found

**Error:** `Error: repo bitnami not found`

**Solution:**
```bash
# Add the repository again
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
```

### Issue: Release already exists

**Error:** `Error: cannot re-use a name that is still in use`

**Solution:**
```bash
# Use a different release name
helm install my-nginx-2 bitnami/nginx

# Or uninstall existing release
helm uninstall my-nginx
```

### Issue: Kubernetes connection error

**Error:** `Error: Kubernetes cluster unreachable`

**Solution:**
```bash
# Check kubectl connectivity
kubectl cluster-info

# Verify context
kubectl config current-context

# If needed, start your cluster
minikube start
```

---

## 📚 Key Takeaways

✅ **Helm 3** has no server-side component (no Tiller)  
✅ **Repositories** must be added manually  
✅ **helm install** deploys charts as releases  
✅ **Release names** must be unique per namespace  
✅ **Values** can be customized with --set or -f  
✅ **helm list** shows all releases  
✅ **helm uninstall** removes releases and resources  
✅ **Release metadata** stored as Kubernetes Secrets  
✅ **Chart versions** are independent of app versions  
✅ **helm repo update** refreshes chart indexes  

---

## 📖 Next Steps

Continue to [Lab 1.2: Understanding Helm Architecture](lab-1.2-helm-architecture.md) to dive deeper into how Helm works internally.

---

## 📝 Lab Completion Checklist

- [ ] Installed Helm 3
- [ ] Verified Helm version
- [ ] Added Bitnami repository
- [ ] Searched for charts
- [ ] Installed first chart
- [ ] Listed releases
- [ ] Inspected release details
- [ ] Customized installation with --set
- [ ] Used values file
- [ ] Uninstalled releases
- [ ] Completed challenge tasks
- [ ] Cleaned up resources

**Congratulations! You've mastered Helm basics!** 🎉
