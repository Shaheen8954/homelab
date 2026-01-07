# EasyShop-Hack  
In this project i have used microk8s single node kubernetes cluster and deployed easyshop application using manifest files, i have used mongodb as database, beckend, frontend and cloudflare zero trust tunnel for secure access and routing traffic to easyshop application.

## Install microk8s on ubuntu -

Update the system:

``` sudo apt update && sudo apt upgrade -y ```

All nodes must have synchronized time 

``` sudo apt install chrony ```

#### To get the latest stable version of microk8s use the following command

``` sudo snap install microk8s --classic ```

#### Add your user to the group: 

``` sudo usermod -aG microk8s $USER && newgrp microk8s ```

#### Check the status:

``` microk8s status --wait-ready ```

#### To see your node as "Ready":

``` microk8s kubectl get nodes ```

#### To get information about cluster:

``` Microk8s kubect cluster-info ```

#### To get information about all pods:

``` Microk8s kubect get pod ```

``` Microk8s kubect get pod –all-namespaces ```

#### Enable useful add-ons like for service descovery (CoreDNS) and web UI (Kubernetes Dashboard):

``` microk8s enable dns ```

#### Check status:
``` microk8s status ```

#### Install cloudflalred cli: 
``` sudo snap install cloudflared ```

#### Authenticate:
``` cloudflared tunnel login```

#### Create tunnel:
``` cloudflared create tunnel home-lab-tunnel ```


#### Create token to cloudflare tunnel in the terminal ( also creating sercret in emprative way):

``` kubectl -n cloudflare create secret generic cloudflared-token \  --from-literal=TUNNEL_TOKEN="<YOUR_TUNNEL_TOKEN>" ```

### create tunnel on cloudflare dashboard

1. Go to the Cloudflare dashboard and navigate to the Zero Trust section.
2. Click on "Network" in the left-hand menu.
3. Click on "connection" and select "cloudflare tunnel" and click on "create tunnel".
4. Select "cloudflared" and give a name to your tunnel.
5. Click on "Save tunnel".
Now your tunnel is created and you can see it in the list of tunnels. 

#### cloudflare-namespace.yaml

``` 
apiVersion: v1
kind: Namespace
metadata:
  name: cloudflare
```

#### cloudflare-config.yaml

``` 
# Template file - Replace TUNNEL_ID_PLACEHOLDER with your actual tunnel ID
# You can use: sed 's/TUNNEL_ID_PLACEHOLDER/your-tunnel-id/g' cloudflared-config-template.yaml > cloudflared-config.yaml

apiVersion: v1
kind: ConfigMap
metadata:
  name: cloudflared-config
  namespace: cloudflare
data:
  config.yaml: |
    tunnel: 04d18c17-c8b6-414e-ad1b-3c226b5f6373
    credentials-file: /etc/cloudflared/creds.json
    
    ingress:
      # Route traffic from Cloudflare to the easyshop service
      - hostname: easyshop-hack.shaheen.homes
        service: http://easyshop-service.easyshop-hack.svc.cluster.local:80
      
      # Route traffic from Cloudflare to Grafana
      - hostname: grafana.shaheen.homes
        service: http://my-grafana.observability.svc.cluster.local:3000
      
      # Route traffic from Cloudflare to Prometheus
      - hostname: prometheus.shaheen.homes
        service: http://prometheus.observability.svc.cluster.local:9090
      
      # Catch-all rule (must be last)
      - service: http_status:404
    
```

#### Cloudflared-deploy.yaml

``` 
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cloudflared
  namespace: cloudflare
spec:
  replicas: 1
  selector:
    matchLabels:
      app: cloudflared
  template:
    metadata:
      labels:
        app: cloudflared
    spec:
      containers:
      - name: cloudflared
        image: cloudflare/cloudflared:latest
        args:
          - tunnel
          - --no-autoupdate
          - run
        env:
          - name: TUNNEL_TOKEN
            valueFrom:
              secretKeyRef:
                name: cloudflared-token
                key: TUNNEL_TOKEN
```

``` microk8s kubectl apply -f cloudflare-namespace.yaml ```

``` microk8s kubectl apply -f cloudflare-config.yaml ```

``` microk8s kubectl apply -f cloudflared-deploy.yaml```

``` microk8s kubectl get pods -n cloudflare ```

### Install kubectl

``` sudo snap install kubectl --classic ```

### 1. Create Namespace

``` kubectl apply -f namespace.yaml ```

### 2. Storage
Create the Persistent Volumes (PV) and Persistent Volume Claims (PVC) for data persistence.

``` kubectl apply -f mongodb-pv.yaml ```
``` kubectl apply -f mongodb-pvc.yaml ```

``` kubectl apply -f easyshop-pv.yaml ```
``` kubectl apply -f easyshop-pvc.yaml ```

#### (ConfigMaps & Secrets)
``` kubectl apply -f configmap.yaml ```
``` kubectl apply -f secret.yaml ```

#### (Deployments & statefulset)
``` kubectl apply -f mongodb-statefulset.yaml ```
``` kubectl apply -f easyshop-deployment.yaml ```

#### (Services)
``` kubectl apply -f mongodb-service.yaml ```
``` kubectl apply -f easyshop-service.yaml ```

#### (Horizontal Pod Autoscaler)
``` kubectl apply -f hpa.yaml ```

#### (Migration Job)
``` kubectl apply -f migration-job.yaml ```

(When you use cloudflare tunnel your apps-service.yaml should have service type as ClusterIP and port as 80.)

#### Check the pods:
``` kubectl get pods -n easyshop-hack ```

#### Check the services:
``` kubectl get services -n easyshop-hack ```

#### Check the statefulset:
``` kubectl get statefulset -n easyshop-hack ```

#### Check the deployment:
``` kubectl get deployment -n easyshop-hack ```

#### Check the configmap:
``` kubectl get configmap -n easyshop-hack ```

#### Check the secret:
``` kubectl get secret -n easyshop-hack ```

#### Check the horizontal pod autoscaler:
``` kubectl get hpa -n easyshop-hack ```

#### Check the migration job:
``` kubectl get job -n easyshop-hack ```



#### Now go to the cloudflare dashboard and add the tunnel to the cloudflare dashboard

1. Click on your home-lab-tunnel and click on "Hostname route" 
2. Configure your route to easyshop-hack.shaheen.homes and click on "Save" 
3.Click on "Published application routes" and click on "Add a Published application routes" 
4. Configure your subdomain, domain, keep empty "path" and select service type as "http" and configure url as "easyshop-service.easyshop-hack.svc.cluster.local:80", and click on "Save".

### Now you can access your application to the browser at:
```
easyshop-hack.shaheen.homes
```



