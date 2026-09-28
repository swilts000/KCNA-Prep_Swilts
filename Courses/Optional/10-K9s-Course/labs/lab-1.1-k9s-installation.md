# Lab 1.1: Installing and Configuring K9s

## 📚 Related Topics
- Kubernetes cluster management
- Terminal user interfaces
- kubectl alternatives
- Cluster monitoring
- Resource management

## 🎯 Learning Objectives

By the end of this lab, you will be able to:
- Install K9s on your operating system
- Configure K9s for your cluster
- Navigate the K9s interface
- View and manage Kubernetes resources
- Use basic K9s commands and hotkeys
- Customize K9s appearance
- Troubleshoot common issues

## ⏱️ Estimated Time
45-60 minutes

## 📋 Prerequisites

- Running Kubernetes cluster
- kubectl configured and working
- Terminal emulator
- Basic Kubernetes knowledge

---

## 🏗️ K9s Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                  K9s Architecture                            │
└──────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Terminal (Your Screen)                                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  K9s UI                                              │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  Header: Context | Namespace | Cluster Info   │  │  │
│  │  ├────────────────────────────────────────────────┤  │  │
│  │  │  Resource List (Pods, Deployments, etc.)       │  │  │
│  │  │  NAME        READY  STATUS   RESTARTS  AGE     │  │  │
│  │  │  nginx-xxx   1/1    Running  0         5m      │  │  │
│  │  │  app-yyy     2/2    Running  1         10m     │  │  │
│  │  ├────────────────────────────────────────────────┤  │  │
│  │  │  Footer: Hotkeys and Commands                  │  │  │
│  │  │  <enter>:view <d>:describe <l>:logs <?>:help   │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  K9s Application                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Configuration (~/.config/k9s/)                      │  │
│  │  • config.yml    - General settings                 │  │
│  │  • skin.yml      - Color scheme                     │  │
│  │  • hotkeys.yml   - Custom shortcuts                 │  │
│  │  • plugins.yml   - Plugin definitions               │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  K9s Core                                            │  │
│  │  • Resource watchers (real-time updates)            │  │
│  │  • Command processor                                │  │
│  │  • UI renderer                                      │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  Kubernetes API Server                                      │
│  (Uses your kubeconfig credentials)                         │
└─────────────────────────────────────────────────────────────┘

Data Flow:
  1. K9s reads kubeconfig
  2. Connects to Kubernetes API
  3. Watches resources for changes
  4. Updates UI in real-time
  5. Executes commands via API
```

**Key Components:**
- **UI Layer**: Terminal-based interface
- **Configuration**: YAML files for customization
- **Core Engine**: Resource watching and command execution
- **API Client**: Communicates with Kubernetes

---

## 📝 Part 1: Installing K9s

### Step 1.1: Install K9s (macOS)

```bash
# Install using Homebrew
brew install derailed/k9s/k9s
```

**Expected Output:**
```
==> Installing k9s from derailed/k9s
==> Downloading https://github.com/derailed/k9s/releases/download/v0.32.0/k9s_Darwin_amd64.tar.gz
==> Downloading from https://objects.githubusercontent.com/...
######################################################################## 100.0%
==> Pouring k9s--0.32.0.arm64_sonoma.bottle.tar.gz
🍺  /opt/homebrew/Cellar/k9s/0.32.0: 6 files, 68.5MB
```

### Step 1.2: Install K9s (Linux)

```bash
# Download latest release
curl -sL https://github.com/derailed/k9s/releases/latest/download/k9s_Linux_amd64.tar.gz | tar xz

# Move to PATH
sudo mv k9s /usr/local/bin/

# Make executable
sudo chmod +x /usr/local/bin/k9s
```

**Expected Output:**
```
# Binary extracted and moved to /usr/local/bin/
```

### Step 1.3: Install K9s (Windows)

```powershell
# Using Chocolatey
choco install k9s

# Or using Scoop
scoop install k9s
```

### Step 1.4: Verify Installation

```bash
# Check K9s version
k9s version
```

**Expected Output:**
```
 ____  __.________
|    |/ _/   __   \______
|      < \____    /  ___/
|    |  \   /    /\___ \
|____|__ \ /____//____  >
        \/            \/

Version:    v0.32.0
Commit:     abc1234
Date:       2026-09-28
```

```bash
# Check K9s info
k9s info
```

**Expected Output:**
```
Configuration:   /Users/username/.config/k9s/config.yml
Logs:            /var/folders/.../k9s-username.log
Screen Dumps:    /var/folders/.../k9s-screens-username
```

---

## 📝 Part 2: First Launch and Navigation

### Step 2.1: Launch K9s

```bash
# Start K9s (uses current kubectl context)
k9s
```

**Expected UI:**
```
┌─────────────────────────────────────────────────────────────┐
│ Context: minikube | Cluster: minikube | User: minikube     │
│ Namespace: default                                          │
├─────────────────────────────────────────────────────────────┤
│ PODS                                                        │
│ NAME                    READY STATUS   RESTARTS AGE        │
│ nginx-deployment-xxx    1/1   Running  0        5m         │
│ nginx-deployment-yyy    1/1   Running  0        5m         │
├─────────────────────────────────────────────────────────────┤
│ <enter>:view <d>:describe <l>:logs <s>:shell <?>:help      │
└─────────────────────────────────────────────────────────────┘
```

**💡 You're now in K9s! The default view shows pods.**

### Step 2.2: Basic Navigation Commands

**Resource Navigation:**
```
:pods          # View pods (default)
:deployments   # View deployments
:services      # View services
:nodes         # View nodes
:namespaces    # View namespaces
:configmaps    # View ConfigMaps
:secrets       # View secrets
:pv            # View PersistentVolumes
:pvc           # View PersistentVolumeClaims
```

**💡 Try it:**
```
1. Type :deployments and press Enter
2. Type :services and press Enter
3. Type :nodes and press Enter
```

### Step 2.3: Essential Hotkeys

```
┌─────────────────────────────────────────────────────────┐
│ Key        │ Action                                     │
├─────────────────────────────────────────────────────────┤
│ ?          │ Show help                                  │
│ :q         │ Quit K9s                                   │
│ Ctrl+a     │ Show all available resources               │
│ Ctrl+c     │ Quit K9s                                   │
├─────────────────────────────────────────────────────────┤
│ /          │ Filter/search                              │
│ Esc        │ Clear filter                               │
│ Space      │ Mark/unmark item                           │
├─────────────────────────────────────────────────────────┤
│ Enter      │ View resource details                      │
│ d          │ Describe resource                          │
│ e          │ Edit resource                              │
│ y          │ View YAML                                  │
│ l          │ View logs                                  │
│ s          │ Shell into container                       │
├─────────────────────────────────────────────────────────┤
│ Ctrl+d     │ Delete resource                            │
│ Ctrl+k     │ Kill pod                                   │
│ Ctrl+r     │ Refresh                                    │
├─────────────────────────────────────────────────────────┤
│ 0-9        │ Change namespace (0=all)                   │
│ n          │ Cycle through namespaces                   │
└─────────────────────────────────────────────────────────┘
```

---

## 📝 Part 3: Viewing and Managing Resources

### Step 3.1: Deploy Sample Application

```bash
# In a separate terminal, create a deployment
kubectl create deployment nginx --image=nginx --replicas=3
kubectl expose deployment nginx --port=80
```

**Expected Output:**
```
deployment.apps/nginx created
service/nginx exposed
```

### Step 3.2: View Pods in K9s

**In K9s:**
```
1. Type :pods and press Enter
2. You should see 3 nginx pods
```

**Expected View:**
```
PODS [default]
NAME                     READY STATUS   RESTARTS AGE
nginx-7c6f9f8c8d-abc12   1/1   Running  0        30s
nginx-7c6f9f8c8d-def34   1/1   Running  0        30s
nginx-7c6f9f8c8d-ghi56   1/1   Running  0        30s
```

### Step 3.3: Describe a Pod

**In K9s:**
```
1. Navigate to a pod using arrow keys
2. Press 'd' to describe
```

**Expected View:**
```
┌─────────────────────────────────────────────────────────────┐
│ Pod: nginx-7c6f9f8c8d-abc12                                 │
├─────────────────────────────────────────────────────────────┤
│ Name:         nginx-7c6f9f8c8d-abc12                        │
│ Namespace:    default                                       │
│ Node:         minikube/192.168.49.2                         │
│ Status:       Running                                       │
│ IP:           10.244.0.5                                    │
│ Containers:                                                 │
│   nginx:                                                    │
│     Image:    nginx                                         │
│     Port:     80/TCP                                        │
│     State:    Running                                       │
│ Events:                                                     │
│   Scheduled   Successfully assigned pod                     │
│   Pulled      Container image pulled                       │
│   Created     Created container                            │
│   Started     Started container                            │
└─────────────────────────────────────────────────────────────┘
```

**💡 Press Esc to go back to the pod list.**

### Step 3.4: View Pod Logs

**In K9s:**
```
1. Navigate to a pod
2. Press 'l' to view logs
```

**Expected View:**
```
┌─────────────────────────────────────────────────────────────┐
│ Logs: nginx-7c6f9f8c8d-abc12                                │
├─────────────────────────────────────────────────────────────┤
│ /docker-entrypoint.sh: /docker-entrypoint.d/ is not empty   │
│ /docker-entrypoint.sh: Looking for shell scripts in /docker │
│ /docker-entrypoint.sh: Launching /docker-entrypoint.d/10-   │
│ 10-listen-on-ipv6-by-default.sh: info: Getting the checksum │
│ 10-listen-on-ipv6-by-default.sh: info: Enabled listen on    │
│ /docker-entrypoint.sh: Launching /docker-entrypoint.d/20-   │
│ /docker-entrypoint.sh: Configuration complete; ready for    │
└─────────────────────────────────────────────────────────────┘
```

**Log Navigation:**
```
f          # Toggle follow mode (tail -f)
w          # Toggle wrap mode
s          # Toggle timestamp
/          # Search in logs
n          # Next search result
N          # Previous search result
```

### Step 3.5: Shell into Container

**In K9s:**
```
1. Navigate to a pod
2. Press 's' to open shell
```

**Expected:**
```
# You're now in a shell inside the container
root@nginx-7c6f9f8c8d-abc12:/# 

# Try some commands
ls -la
cat /etc/nginx/nginx.conf
exit
```

**💡 Type `exit` to return to K9s.**

---

## 📝 Part 4: Filtering and Searching

### Step 4.1: Filter Resources

**In K9s (on pods view):**
```
1. Press '/' to enter filter mode
2. Type 'nginx'
3. Press Enter
```

**Expected:**
```
PODS [default] | Filter: nginx
NAME                     READY STATUS   RESTARTS AGE
nginx-7c6f9f8c8d-abc12   1/1   Running  0        5m
nginx-7c6f9f8c8d-def34   1/1   Running  0        5m
nginx-7c6f9f8c8d-ghi56   1/1   Running  0        5m
```

**💡 Only pods matching "nginx" are shown.**

### Step 4.2: Clear Filter

```
Press Esc to clear the filter
```

### Step 4.3: Label-Based Filtering

**In K9s:**
```
1. Press '/' 
2. Type 'app=nginx'
3. Press Enter
```

**💡 Filters by label selector.**

---

## 📝 Part 5: Managing Deployments

### Step 5.1: View Deployments

**In K9s:**
```
Type :deployments and press Enter
```

**Expected View:**
```
DEPLOYMENTS [default]
NAME    READY UP-TO-DATE AVAILABLE AGE
nginx   3/3   3          3         10m
```

### Step 5.2: Scale Deployment

**In K9s:**
```
1. Navigate to nginx deployment
2. Press 's' to scale
3. Enter new replica count: 5
4. Press Enter
```

**Expected:**
```
Scaling deployment nginx to 5 replicas...
```

**Verify:**
```
1. Type :pods
2. You should now see 5 nginx pods
```

### Step 5.3: View Deployment YAML

**In K9s:**
```
1. Navigate to nginx deployment
2. Press 'y' to view YAML
```

**Expected:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx
  namespace: default
spec:
  replicas: 5
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - image: nginx
        name: nginx
```

---

## 📝 Part 6: Namespace Management

### Step 6.1: Switch Namespaces

**In K9s:**
```
Press '0' to view all namespaces
Press 'n' to cycle through namespaces
```

**Or:**
```
Type :namespaces to see all namespaces
Navigate to a namespace and press Enter to switch
```

### Step 6.2: View System Pods

**In K9s:**
```
1. Type :namespaces
2. Navigate to 'kube-system'
3. Press Enter
4. Type :pods
```

**Expected:**
```
PODS [kube-system]
NAME                               READY STATUS   RESTARTS AGE
coredns-xxx                        1/1   Running  0        1h
etcd-minikube                      1/1   Running  0        1h
kube-apiserver-minikube            1/1   Running  0        1h
kube-controller-manager-minikube   1/1   Running  0        1h
kube-proxy-xxx                     1/1   Running  0        1h
kube-scheduler-minikube            1/1   Running  0        1h
storage-provisioner                1/1   Running  0        1h
```

---

## 📝 Part 7: Customizing K9s

### Step 7.1: View K9s Configuration

```bash
# In a separate terminal, view config
cat ~/.config/k9s/config.yml
```

**Expected Output:**
```yaml
k9s:
  liveViewAutoRefresh: true
  refreshRate: 2
  maxConnRetry: 5
  readOnly: false
  noExitOnCtrlC: false
  ui:
    enableMouse: false
    headless: false
    logoless: false
    crumbsless: false
    noIcons: false
  skipLatestRevCheck: false
  disablePodCounting: false
  shellPod:
    image: busybox:1.35.0
    namespace: default
    limits:
      cpu: 100m
      memory: 100Mi
  imageScans:
    enable: false
  logger:
    tail: 100
    buffer: 5000
    sinceSeconds: -1
    fullScreen: false
    textWrap: false
    showTime: false
  thresholds:
    cpu:
      critical: 90
      warn: 70
    memory:
      critical: 90
      warn: 70
```

### Step 7.2: Change Skin/Theme

```bash
# Create custom skin
mkdir -p ~/.config/k9s/skins
cat <<EOF > ~/.config/k9s/skins/custom.yml
k9s:
  body:
    fgColor: dodgerblue
    bgColor: black
    logoColor: blue
  prompt:
    fgColor: dodgerblue
    bgColor: black
    suggestColor: white
  info:
    fgColor: lightskyblue
    sectionColor: white
  dialog:
    fgColor: white
    bgColor: black
    buttonFgColor: black
    buttonBgColor: dodgerblue
    buttonFocusFgColor: white
    buttonFocusBgColor: fuchsia
    labelFgColor: orange
    fieldFgColor: white
  frame:
    border:
      fgColor: dodgerblue
      focusColor: lightskyblue
    menu:
      fgColor: white
      keyColor: dodgerblue
      numKeyColor: fuchsia
    crumbs:
      fgColor: white
      bgColor: black
      activeColor: orange
    status:
      newColor: lightskyblue
      modifyColor: greenyellow
      addColor: lightskyblue
      errorColor: orangered
      highlightColor: orange
      killColor: slategray
      completedColor: gray
    title:
      fgColor: white
      bgColor: black
      highlightColor: orange
      counterColor: slateblue
      filterColor: slateblue
  views:
    charts:
      bgColor: default
      defaultDialColors:
        - dodgerblue
        - hotpink
      defaultChartColors:
        - dodgerblue
        - hotpink
    table:
      fgColor: white
      bgColor: black
      cursorFgColor: black
      cursorBgColor: dodgerblue
      header:
        fgColor: white
        bgColor: black
        sorterColor: orange
    xray:
      fgColor: white
      bgColor: black
      cursorColor: dodgerblue
      graphicColor: dodgerblue
      showIcons: false
    yaml:
      keyColor: dodgerblue
      colonColor: white
      valueColor: white
    logs:
      fgColor: white
      bgColor: black
      indicator:
        fgColor: white
        bgColor: dodgerblue
EOF
```

**Apply skin:**
```bash
# Edit config to use custom skin
# Add to ~/.config/k9s/config.yml:
# k9s:
#   ui:
#     skin: custom
```

**💡 Restart K9s to see the new theme.**

---

## ✅ Validation Steps

```bash
# 1. Verify K9s is installed
k9s version

# 2. Launch K9s
k9s

# 3. In K9s, test these commands:
:pods          # View pods
:deployments   # View deployments
:services      # View services
:nodes         # View nodes

# 4. Test hotkeys:
?              # Show help
d              # Describe (on a resource)
l              # View logs (on a pod)
y              # View YAML (on a resource)

# 5. Test filtering:
/nginx         # Filter for nginx
Esc            # Clear filter

# 6. Quit K9s
:q
```

---

## 🧹 Cleanup

```bash
# Delete sample deployment
kubectl delete deployment nginx
kubectl delete service nginx
```

---

## 🎯 Challenge Tasks

1. **Custom Hotkey**
   ```yaml
   # Add to ~/.config/k9s/hotkeys.yml
   hotKeys:
     pods:
       - shortCut: Shift-R
         description: Restart Pod
         command: kubectl delete pod
   ```

2. **Create Plugin**
   ```yaml
   # Add to ~/.config/k9s/plugins.yml
   plugins:
     debug:
       shortCut: Shift-D
       description: Debug Pod
       scopes:
         - pods
       command: kubectl
       args:
         - debug
         - -it
         - $NAME
         - --image=nicolaka/netshoot
   ```

3. **Resource Bookmarks**
   ```
   # In K9s, press 'b' to bookmark a resource
   # Press 'Ctrl+b' to view bookmarks
   ```

---

## 🐛 Troubleshooting

### Issue: K9s won't start

**Solution:**
```bash
# Check kubeconfig
kubectl cluster-info

# Check K9s logs
cat ~/.config/k9s/k9s.log

# Reset K9s config
rm -rf ~/.config/k9s/
k9s
```

### Issue: Can't see resources

**Solution:**
```bash
# Check RBAC permissions
kubectl auth can-i list pods

# Try different namespace
# In K9s: press '0' for all namespaces
```

### Issue: Slow performance

**Solution:**
```yaml
# Edit ~/.config/k9s/config.yml
k9s:
  refreshRate: 5  # Increase from 2 to 5 seconds
  disablePodCounting: true
```

---

## 📚 Key Takeaways

✅ **K9s** is a powerful terminal UI for Kubernetes  
✅ **Navigation** is fast with hotkeys and commands  
✅ **Real-time updates** without manual refresh  
✅ **Interactive operations** (logs, shell, describe, edit)  
✅ **Filtering** makes finding resources easy  
✅ **Customizable** with skins, hotkeys, and plugins  
✅ **Lightweight** and fast compared to GUI tools  
✅ **Productive** for daily Kubernetes operations  

---

## 📖 Next Steps

Continue to [Lab 1.2: Navigating the K9s Interface](lab-1.2-k9s-navigation.md)

---

## 📝 Lab Completion Checklist

- [ ] Installed K9s
- [ ] Launched K9s successfully
- [ ] Navigated between resource types
- [ ] Viewed pod logs
- [ ] Described resources
- [ ] Filtered resources
- [ ] Switched namespaces
- [ ] Scaled a deployment
- [ ] Customized K9s skin
- [ ] Completed challenge tasks

**Congratulations! You've mastered K9s basics!** 🎉
