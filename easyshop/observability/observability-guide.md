# Observability Stack Deployment Guide

This guide provides step-by-step instructions for manually deploying the observability stack (Grafana, Prometheus, Node Exporter, and Kube State Metrics) on MicroK8s.

## Prerequisites

- MicroK8s cluster running and ready.
- `kubectl` configured (or `microk8s kubectl` alias).
- Command line access to the `kubernetes/observability` directory.

## Deployment Steps

Navigate to the observability directory:
```bash
cd kubernetes/observability
```

### 1. Create Namespace

Create the `observability` namespace where all resources will reside.

```bash
kubectl apply -f 00-grafana-namespace.yaml
```

### 2. Configuration & Secrets

Apply the ConfigMaps for Grafana, Prometheus, and Dashboards.

```bash
# Grafana Configuration
kubectl apply -f 01-grafana-configmap.yaml

# Prometheus Configuration
kubectl apply -f 06-prometheus-configmap.yaml

# Grafana Datasource Configuration (Connects Grafana to Prometheus)
kubectl apply -f 23-grafana-datasource-configmap.yaml

# Kube State Metrics Configuration
kubectl apply -f 11-kube-state-metrics.yaml
```

### 3. Storage

Create the Persistent Volumes (PV) and Persistent Volume Claims (PVC) for data persistence.

```bash
kubectl apply -f 02-grafana-pv.yaml
kubectl apply -f 03-grafana-pvc.yaml
```

### 4. Workloads (Deployments & DaemonSets)

Deploy the core applications.

```bash
# Deploy Grafana
kubectl apply -f 04-grafana-deployment.yaml

# Deploy Prometheus
kubectl apply -f 07-prometheus-deployment.yaml

# Deploy Node Exporter (DaemonSet - runs on every node)
kubectl apply -f 09-node-exporter-daemonset.yaml
```

### 5. Services

Expose the applications within the cluster.

```bash
# Grafana Service
kubectl apply -f 05-grafana-service.yaml

# Prometheus Service
kubectl apply -f 08-prometheus-service.yaml

# Node Exporter Service
kubectl apply -f 10-node-exporter-service.yaml
```

## Verification

Check if all pods are running in the `observability` namespace:

```bash
kubectl get pods -n observability
```

You should see pods for `my-grafana`, `prometheus-deployment`, `node-exporter`, and `kube-state-metrics` with status `Running`.

#### Add grafana service to cloudflare tunnel
1. Click on your tunnel and click on "Hostname route" 
2. Configure your route to grafana.shaheen.homes and click on "Save" 
3. Click on "Published application routes" and click on "Add a Published application routes" 
4. Configure your subdomain, domain, keep empty "path" and select service type as "http" and configure url as "my-grafana.observability.svc.cluster.local:3000", and click on "Save".

#### Health Checks & Troubleshooting:
If pods are restarting or not ready, refer to [README-HEALTH-CHECKS.md](README-HEALTH-CHECKS.md) for details on the configured liveness, readiness, and startup probes.

#### Accessing Grafana

If you have configured the Cloudflare Tunnel you can access Grafana at your configured domain (e.g., `grafana.shaheen.homes`).

To access it locally without the tunnel for testing:

```bash
kubectl port-forward -n observability svc/my-grafana 3000:3000
```
Then open `http://localhost:3000` in your browser.
Default credentials should be `admin` / `admin` (or as configured in your secrets).
