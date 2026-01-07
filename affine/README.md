# AFFiNE Self-Hosted Deployment

This directory contains Kubernetes manifests to deploy AFFiNE using the `ghcr.io/toeverything/affine:stable` image.

## Resources Created

| File | Description |
|------|-------------|
| `01-namespace.yaml` | Creates the `affine-selfhosted` namespace. |
| `02-config.yaml` | `Secret` containing database and redis credentials. **CHANGE THESE BEFORE PRODUCTION USE.** |
| `03-pvc.yaml` | PersistentVolumeClaims for Postgres (10Gi), Redis (1Gi), and AFFiNE data (10Gi). |
| `04-postgres.yaml` | PostgreSQL 16 Deployment and Service. |
| `05-redis.yaml` | Redis (Alpine) Deployment and Service. |
| `06-affine.yaml` | Main AFFiNE application Deployment and Service (NodePort). |

## Prerequisites

- A Kubernetes cluster.
- A Default StorageClass configured (or you must manually patch the PVCs/create PVs).

## Deployment

1. **Review Configuration**: Check `02-config.yaml` to set your own passwords.
2. **Apply Manifests**:
   ```bash
   kubectl apply -f .
   ```
3. **Verify**:
   ```bash
   kubectl get pods -n affine-selfhosted
   ```
4. **Access**:
   Access the service on the NodePort assigned to the `affine` service:
   ```bash
   kubectl get svc -n affine-selfhosted affine
   ```

## Default Credentials (from 02-config.yaml)

- **DB User**: `affine`
- **DB Password**: `affine_password`
- **Redis Password**: `redis_password`
