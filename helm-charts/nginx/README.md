# Nginx Helm Chart

A Helm chart for deploying the Nginx Hello World application in Kubernetes.

## Introduction

This chart deploys a simple Nginx Hello World application with configurable parameters, health checks, and security best practices.

## Prerequisites

- Kubernetes 1.19+
- Helm 3.0+

## Installing the Chart

To install the chart with the release name `my-nginx`:

```bash
helm install my-nginx ./helm-charts/nginx
```

## Uninstalling the Chart

To uninstall/delete the `my-nginx` deployment:

```bash
helm uninstall my-nginx
```

## Configuration

The following table lists the configurable parameters of the nginx chart and their default values.

| Parameter | Description | Default |
|-----------|-------------|---------|
| `replicaCount` | Number of nginx replicas | `1` |
| `image.repository` | Nginx image repository | `nginxdemos/hello` |
| `image.tag` | Nginx image tag | `latest` |
| `image.pullPolicy` | Image pull policy | `IfNotPresent` |
| `service.type` | Kubernetes service type | `ClusterIP` |
| `service.port` | Service port | `80` |
| `service.targetPort` | Service target port | `80` |
| `resources.limits.cpu` | CPU limit | `100m` |
| `resources.limits.memory` | Memory limit | `128Mi` |
| `resources.requests.cpu` | CPU request | `50m` |
| `resources.requests.memory` | Memory request | `64Mi` |
| `autoscaling.enabled` | Enable horizontal pod autoscaling | `false` |
| `autoscaling.minReplicas` | Minimum replicas for HPA | `1` |
| `autoscaling.maxReplicas` | Maximum replicas for HPA | `100` |
| `autoscaling.targetCPUUtilizationPercentage` | Target CPU utilization for HPA | `80` |
| `ingress.enabled` | Enable ingress | `false` |
| `nodeSelector` | Node selector for pod assignment | `{}` |
| `tolerations` | Tolerations for pod assignment | `[]` |
| `affinity` | Affinity for pod assignment | `{}` |

### Example Custom Values

Create a `values-custom.yaml` file:

```yaml
replicaCount: 3
image:
  tag: "1.21"
resources:
  limits:
    cpu: 200m
    memory: 256Mi
  requests:
    cpu: 100m
    memory: 128Mi
ingress:
  enabled: true
  hosts:
    - host: nginx.example.com
      paths:
        - path: /
          pathType: Prefix
```

Then install with custom values:

```bash
helm install my-nginx ./helm-charts/nginx -f values-custom.yaml
```

## Upgrading the Chart

To upgrade the `my-nginx` deployment:

```bash
helm upgrade my-nginx ./helm-charts/nginx
```

## Rolling Back

To rollback to a previous revision:

```bash
helm rollback my-nginx [REVISION]
```

## Testing

To test the chart without installing:

```bash
helm install my-nginx ./helm-charts/nginx --dry-run --debug
```

To lint the chart:

```bash
helm lint ./helm-charts/nginx
```

## Key Features

- **Configurable**: All aspects of the deployment can be customized
- **Health Checks**: Built-in liveness and readiness probes
- **Security**: Security context with non-root user and read-only filesystem
- **Resource Management**: Configurable CPU and memory limits/requests
- **Autoscaling**: Optional horizontal pod autoscaling
- **Ingress Support**: Optional Kubernetes ingress configuration
- **Helm Best Practices**: Follows Helm chart best practices with proper labels and helpers

## Migration from YAML

This Helm chart replaces the original nginx YAML files:
- `deployment.yaml` → `templates/deployment.yaml`
- `service.yaml` → `templates/service.yaml`

The Helm chart provides additional features like:
- Parameterized configuration
- Health checks
- Security contexts
- Resource management
- Version control and rollback capabilities
