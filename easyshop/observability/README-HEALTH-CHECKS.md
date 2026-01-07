# Grafana Health Checks Configuration

## Problem
After machine restarts, Grafana would show 502 Bad Gateway errors because:
1. Kubernetes didn't know when Grafana was ready to accept traffic
2. Cloudflare Tunnel would try to connect before Grafana was fully started
3. No automatic recovery if Grafana became unhealthy

## Solution
Added comprehensive health probes to ensure Grafana is always available:

### Health Probes Added

#### 1. **Startup Probe**
- **Purpose**: Gives Grafana time to start up (can take 30-60 seconds)
- **Configuration**:
  - Initial delay: 10 seconds
  - Period: 10 seconds
  - Timeout: 5 seconds
  - Failure threshold: 30 attempts (5 minutes total)
- **Why**: Prevents Kubernetes from killing Grafana during slow startup

#### 2. **Readiness Probe**
- **Purpose**: Tells Kubernetes when Grafana is ready to accept traffic
- **Configuration**:
  - Initial delay: 30 seconds
  - Period: 10 seconds
  - Timeout: 5 seconds
  - Failure threshold: 3 attempts
- **Why**: Service endpoints are only updated when pod is ready

#### 3. **Liveness Probe**
- **Purpose**: Detects if Grafana has crashed and needs restart
- **Configuration**:
  - Initial delay: 60 seconds
  - Period: 30 seconds
  - Timeout: 5 seconds
  - Failure threshold: 3 attempts
- **Why**: Automatically restarts unhealthy pods

### Resource Limits
Added resource requests and limits to ensure stable performance:
- **Requests**: 256Mi memory, 100m CPU
- **Limits**: 512Mi memory, 500m CPU

## How It Works After Restart

1. **Pod Starts**: Grafana container begins starting
2. **Startup Probe**: Waits up to 5 minutes for Grafana to be ready
3. **Readiness Probe**: Once ready, updates service endpoints
4. **Service Available**: Cloudflare Tunnel can now connect
5. **Liveness Probe**: Continuously monitors health, restarts if needed

## Benefits

✅ **Automatic Recovery**: If Grafana crashes, it restarts automatically
✅ **No 502 Errors**: Service only routes traffic when Grafana is ready
✅ **Fast Startup**: Readiness probe ensures quick availability
✅ **Resource Stability**: Limits prevent resource exhaustion

## Testing

To verify health checks are working:
```bash
kubectl describe pod -n observability -l app=my-grafana | grep -A 5 "Liveness\|Readiness\|Startup"
```

You should see all three probes configured and passing.


