# Self-hosted Gitea on Kubernetes (PoC)

## Problem
Needed a private Git hosting solution without exposing cluster publicly.

## Architecture
- Kubernetes (homelab)
- PostgreSQL (PVC-backed)
- Gitea (PVC-backed)
- Cloudflare Tunnel (secure HTTPS)

## Flow
User → Cloudflare → Tunnel → Kubernetes Service → Gitea Pod → PostgreSQL + PVC

## Why Cloudflare Tunnel
- No public IP
- No NodePort
- HTTPS by default
- Works behind NAT

---

## Prerequisites

- Kubernetes cluster (homelab / local cluster)
- `kubectl` configured
- StorageClass available for PVCs
- Cloudflare account + domain
- Cloudflare Tunnel already configured or accessible

---

## Namespace

All resources are deployed in namespace:

- `gitea`

---

## Deployment Steps (High Level)

### 1. Create PostgreSQL
- Create Secret for database password
- Create PVC for PostgreSQL
- Create PostgreSQL Deployment
- Create PostgreSQL Service

### 1.1. Create namespace
```bash
kubectl create namespace gitea
```

### 1.2. Deploy PostgreSQL Secret
```bash
kubectl apply -f 01-pg-secret.yaml
```

### 1.3. Deploy PostgreSQL

```bash
kubectl apply -f 02-pg-deploy.yaml
kubectl apply -f 03-pg-service.yaml
```
### Check PostgreSQL
```bash
kubens gitea
kubectl get pods
kubectl get svc
```

### 2. Create Gitea
- Create PVC for `/data`
- Create Gitea Deployment
- Create Gitea Service

### 2.1. Deploy Gitea
```bash
kubectl apply -f 04-gitea-deploy.yaml
kubectl apply -f 05-gitea-service.yaml
```

### 2.2. Check Gitea
```bash
kubectl get pods
kubectl get svc
```
### 3. check on localhost
```bash
kubectl port-forward svc/gitea 3000:3000
```
Access at `http://localhost:3000`

### 4. Expose using Cloudflare Tunnel
- Configure cloudflared ingress
- Map hostname to Kubernetes Service

Example domain:

- `https://gitea.shaheen.homes`

---

## Configuration

### Database connection (Gitea → PostgreSQL)

Gitea is configured using environment variables:

- DB_TYPE: postgres  
- HOST: postgres:5432  
- DB_NAME: gitea  
- DB_USER: gitea  
- DB_PASSWORD: from Kubernetes Secret  

---

## Persistence Validation

Persistence was validated in two ways:

### 1. Git repo persistence
- Repository was created
- Code was pushed into the repo
- Pod was deleted and recreated
- Repository data remained intact

### 2. Configuration persistence
- Gitea initial configuration stored in `/data/gitea/conf/app.ini`
- All settings remained after pod restart

---

## Functional Verification

### UI Verification
- Gitea UI accessible over tunnel:
  - `https://gitea.shaheen.homes`
- Admin user created successfully
- Repositories created successfully

### Git HTTPS Verification
Clone:

```bash
git clone https://gitea.shaheen.homes/Shaheen/Demo.git
```


## Key Kubernetes Concepts Used
- Namespace
- Deployment
- Service
- PVC
- Secret
- ConfigMap (cloudflared)

## Verification
- Repo creation
- Git push/pull
- Pod deletion → data persistence

## Learnings
- Image inspection → YAML design
- Debugging pod lifecycle
- Secure exposure patterns
