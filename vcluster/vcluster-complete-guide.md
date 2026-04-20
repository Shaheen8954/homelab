# vcluster - Complete Guide

## What is vcluster?

**vcluster** (virtual cluster) is a tool that creates **isolated Kubernetes clusters inside existing Kubernetes clusters**. Think of it as a "cluster within a cluster."

## Simple Analogy
Imagine your main Kubernetes cluster is like a **big house**. vcluster creates **separate apartments** within that house. Each apartment has its own rooms, furniture, and rules, but they all share the same building structure and utilities.

## How vcluster Works

### Architecture
```
Physical Server
└── Host Kubernetes Cluster (MicroK8s)
    ├── Namespace: default (real cluster resources)
    ├── Namespace: production (real cluster resources)  
    └── Namespace: vcluster-namespace
        └── vcluster Pod (Virtual Cluster)
            ├── Virtual API Server
            ├── Virtual etcd (database)
            ├── Virtual Controller Manager
            ├── Virtual Scheduler
            └── Background Proxy (connects kubectl to virtual cluster)
```

### Key Components

1. **Virtual API Server**: Simulates Kubernetes API for the virtual cluster
2. **Virtual etcd**: Stores virtual cluster data separately from host cluster
3. **Virtual Scheduler**: Makes decisions about where to run pods in the virtual cluster
4. **Background Proxy**: Forwards kubectl commands to the virtual cluster
5. **Syncer**: Syncs virtual resources to real host cluster resources

## How It Actually Works

### The Magic Behind vcluster

When you deploy a pod in vcluster:

1. **You run**: `kubectl run nginx --image=nginx` (in virtual cluster)
2. **Virtual API Server**: Receives the request and processes it
3. **Virtual Scheduler**: Decides where to run the pod
4. **Syncer**: Converts the virtual pod to a real pod in the host cluster
5. **Host Cluster**: Actually runs the pod as a regular Kubernetes pod
6. **Isolation**: The pod appears only in your virtual cluster, not in the host cluster

### Resource Translation

| Virtual Cluster | Host Cluster |
|----------------|--------------|
| Virtual Pod | Real Pod (with special labels) |
| Virtual Service | Real Service (with special labels) |
| Virtual Deployment | Real Deployment (with special labels) |
| Virtual Namespace | Real Namespace (with special labels) |

## Why Use vcluster?

### Benefits

1. **Isolation**: Test without affecting production
2. **Cost-Efficient**: Share resources with host cluster
3. **Fast Deployment**: Create clusters in seconds
4. **Full Kubernetes API**: Complete Kubernetes functionality
5. **Multi-Tenancy**: Multiple teams on one cluster
6. **CI/CD**: Test in isolated environments

### Use Cases

- **Development**: Test applications without affecting production
- **CI/CD Pipelines**: Run tests in isolated clusters
- **Multi-Tenancy**: Give teams their own "clusters" on shared infrastructure
- **Learning**: Learn Kubernetes without needing multiple physical clusters
- **Testing**: Test Kubernetes configurations safely

## vcluster vs Other Solutions

| Feature | vcluster | kind | minikube |
|---------|----------|------|----------|
| Requires host cluster | ✅ Yes | ❌ No | ❌ No |
| Resource isolation | ✅ Yes | ✅ Yes | ✅ Yes |
| Speed | ⚡ Fast | 🐢 Slow | 🐢 Slow |
| Resource usage | 💾 Low | 💾 High | 💾 High |
| Real Kubernetes API | ✅ Yes | ✅ Yes | ✅ Yes |

## Creating and Using vcluster

### Prerequisites
- Existing Kubernetes cluster (MicroK8s, GKE, EKS, etc.)
- kubectl configured
- vcluster installed

### Installation Methods

#### Option 1: Install using the official script (Recommended)
```bash
curl -L -o vcluster "https://github.com/loft-sh/vcluster/releases/latest/download/vcluster-linux-amd64" && \
sudo install -c -m 0755 vcluster /usr/local/bin
```

#### Option 2: Install using Homebrew
```bash
brew install vcluster
```

#### Option 3: Install using krew (kubectl plugin)
```bash
kubectl krew index add vcluster https://github.com/loft-sh/vcluster-krew-index
kubectl krew install vcluster/vcluster
```

#### Option 4: Install using snap
```bash
sudo snap install vcluster --classic
```

### Basic Commands

```bash
# Create a virtual cluster
vcluster create my-cluster

# Connect to existing cluster
vcluster connect my-cluster

# List virtual clusters
vcluster list

# Delete a virtual cluster
vcluster delete my-cluster

# Disconnect from virtual cluster
vcluster disconnect

# Check vcluster version
vcluster --version
```

### Example Workflow

```bash
# 1. Create virtual cluster
vcluster create test-cluster

# 2. Deploy application in virtual cluster
kubectl create deployment nginx --image=nginx --replicas=3

# 3. Check it's running
kubectl get pods

# 4. Expose the deployment
kubectl expose deployment nginx --port=80

# 5. Disconnect when done
vcluster disconnect

# 6. Delete virtual cluster
vcluster delete test-cluster
```

## Production Use Cases for vcluster

### 1. Multi-Tenancy in Production
- Give different teams their own isolated clusters
- Each team gets full cluster admin access to their virtual cluster
- They can't see or affect other teams' resources
- **Used by companies** for shared infrastructure

### 2. CI/CD in Production
- Run tests in isolated clusters before deploying to production
- Each PR gets its own virtual cluster
- **Real production use case** for safe testing

### 3. Development Environments
- Provide developers with personal clusters
- They get full Kubernetes access without needing real clusters
- **Cost-effective** compared to giving each developer a real cluster

### 4. Staging/Pre-Production
- Create staging environments that mirror production
- Test configurations safely
- Easy to create/destroy as needed

## vcluster on Cloud Providers

### Supported Cloud Providers

- **AWS EKS**: ✅ Fully supported
- **Google GKE**: ✅ Fully supported  
- **Azure AKS**: ✅ Fully supported
- **Digital Ocean**: ✅ Fully supported
- **Any Kubernetes cluster**: ✅ Works everywhere

### Example Production Setup on EKS:
```bash
# You have an EKS cluster
eksctl create cluster --name production

# Create virtual clusters for different teams
vcluster create team-a --namespace team-a
vcluster create team-b --namespace team-b
vcluster create staging --namespace staging
```

## Real-World Production Scenarios

### Scenario 1: SaaS Company
- **Main cluster**: EKS with 100 nodes
- **Customers**: 500 customers
- **Solution**: Each customer gets a virtual cluster
- **Benefit**: Isolation without 500 real clusters

### Scenario 2: Enterprise Development
- **Main cluster**: GKE with 50 nodes
- **Teams**: 20 development teams
- **Solution**: Each team gets 2 virtual clusters (dev + staging)
- **Benefit**: Teams can't break each other's work

### Scenario 3: CI/CD Pipeline
- **Main cluster**: AKS
- **Pipeline**: 100 PRs per day
- **Solution**: Each PR gets a virtual cluster for testing
- **Benefit**: Parallel testing without interference

## Production Benefits

### Cost Savings
- Real cluster: $1000/month per cluster
- Virtual cluster: $0/month (shares resources)
- **Example**: 10 teams = $10,000 vs $1,000

### Operational Efficiency
- One cluster to manage instead of many
- Centralized monitoring and logging
- Simplified security and compliance

### Developer Experience
- Full cluster admin access
- No waiting for cluster provisioning
- Safe experimentation

## Production Considerations

### When to use vcluster in production:
- Multi-tenant SaaS applications
- Team isolation on shared infrastructure
- Cost-effective development environments
- CI/CD testing pipelines

### When NOT to use vcluster:
- Extremely high security requirements (air-gapped)
- Performance-critical workloads
- When you need complete resource isolation

## Example Production Architecture

```
AWS EKS Production Cluster (50 nodes)
├── Namespace: production-apps (real production workloads)
├── Namespace: team-a-dev (virtual cluster for Team A)
├── Namespace: team-a-staging (virtual cluster for Team A staging)
├── Namespace: team-b-dev (virtual cluster for Team B)
├── Namespace: ci-cd (virtual clusters for CI/CD)
└── Namespace: customer-1 (virtual cluster for Customer 1)
```

## Limitations

1. **Requires Host Cluster**: Cannot run standalone
2. **Resource Sharing**: Shares host cluster resources
3. **Network Complexity**: Networking can be tricky
4. **Storage**: Uses host cluster storage

## Troubleshooting

### Common Issues

#### Issue: "vcluster command not found"
**Solution**: Install vcluster using one of the installation methods above

#### Issue: "Current working directory contains a file or directory named vcluster"
**Solution**: Remove or rename the conflicting file/directory, or run command from different directory

#### Issue: Cannot connect to virtual cluster
**Solution**: 
- Check if vcluster pod is running: `kubectl get pods -n <namespace>`
- Use `vcluster connect <cluster-name>` to reconnect
- Check background proxy container: `docker ps`

## Advanced Configuration

### Custom vcluster Configuration

Create a `values.yaml` file:

```yaml
# Custom vcluster configuration
vcluster:
  image: ghcr.io/loft-sh/vcluster-pro:0.33.1
  resources:
    limits:
      cpu: "1"
      memory: "1Gi"
    requests:
      cpu: "100m"
      memory: "128Mi"

syncer:
  extraArgs:
    - --sync=services
    - --sync=ingresses
```

Create with custom config:
```bash
vcluster create my-cluster --values values.yaml
```

### Connecting to Specific Context

```bash
# Connect to vcluster in specific namespace
vcluster connect my-cluster --namespace my-namespace

# Connect and print kubeconfig
vcluster connect my-cluster --print

# Connect to existing cluster without switching context
vcluster connect my-cluster --server=https://my-cluster.vcluster.local
```

## Best Practices

1. **Resource Limits**: Always set resource limits for vcluster pods
2. **Namespace Isolation**: Use dedicated namespaces for each vcluster
3. **Monitoring**: Monitor both host and virtual clusters
4. **Backup**: Backup virtual cluster data regularly
5. **Cleanup**: Delete unused virtual clusters to free resources
6. **Documentation**: Document vcluster configurations and access methods

## Summary

**vcluster** = Virtual Kubernetes clusters running inside real Kubernetes clusters

- **What it is**: A tool for creating isolated Kubernetes environments
- **How it works**: Virtualizes Kubernetes components inside existing clusters
- **Why use it**: Safe testing, cost efficiency, fast deployment, multi-tenancy
- **When to use**: Development, testing, CI/CD, multi-tenancy, production
- **Key requirement**: Must have an existing Kubernetes cluster first
- **Production ready**: YES - used by many companies in production
- **Cloud compatible**: Works on EKS, GKE, AKS, and all Kubernetes platforms

It's like having your own private Kubernetes playground inside your shared Kubernetes infrastructure!
