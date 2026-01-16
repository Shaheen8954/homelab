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

1. Click on your homelab-tunnel and click on "Hostname route" 
2. Configure your route to easyshop-hack.shaheen.homes and click on "Save" 
3.Click on "Published application routes" and click on "Add a Published application routes" 
4. Configure your subdomain, domain, keep empty "path" and select service type as "http" and configure url as "easyshop-service.easyshop-hack.svc.cluster.local:80", and click on "Save".

### Now you can access your application to the browser at:
```
easyshop-hack.shaheen.homes
```





## Integrate easyshop with keycloak

Step 1: Create a Client in Keycloak 

Go to the keycloak admin console → Clients → Create client

- Client settings

  - Client type: OpenID Connect

  - Client ID: easyshop

  - Client authentication:

    - ON (confidential) if backend app

    - Standard flow = ON
    - Direct access grants = OFF (recommended)

    This is the most common.

##### Click Save 

### Set these:

Root URL:

``` https://easyshop.yourdomain.com ```

### ValidRedirect URIs (important)

Example:

``` https://easyshop.yourdomain.com/* ```

### Valid post logout redirect URIs

Example:

``` https://easyshop.yourdomain.com/* ```

### Web Origins

``` https://easyshop.yourdomain.com ```

### Save.

### Get Client Secret

Now go to:

easyshop → Credentials

Copy:

#### Client Secret

You will use this inside Kubernetes secret.

### Step 2: Create Easyshop Realm Roles (optional but recommended)

Keycloak:
Realm Roles → Create Role

- admin

- user

Then assign to users.

## Step 3: Configure Easyshop with Keycloak OIDC values

You will need these from:
Keycloak → Realm Settings → OpenID Endpoint Configuration

### Important values:

- Issuer URL:
  ```https://keycloak.domain.com/realms/<realm>```

- Auth endpoint

- Token endpoint

- JWKS endpoint

- Userinfo endpoint

### Also need:

- Client ID: easyshop

- Client Secret (if confidential)

## Step 4: Easyshop app configuration (example)

#### Update manifest files

#### 1) Update your existing ConfigMap:
Add these 3 values inside it:

```
data:
  KEYCLOAK_CLIENT_ID: "easyshop"
  KEYCLOAK_ISSUER_URL: "https://keycloak.shaheen.homes/realms/homelab"
  KEYCLOAK_CALLBACK_URL: "https://easyshop-hack.shaheen.homes/callback"
```
### 2) Update your existing Secret:
Add this value inside it:

```
stringData:
  KEYCLOAK_CLIENT_SECRET: "<CLIENT_SECRET>"

```
### 3) No changes needed in Deployment (almost)

Because your deployment already has configmap and secret mounted as environment variables.
- So Easyshop container will automatically get these values.
- We just need to restart the deployment to apply these changes.

``` kubectl apply -f configmap.yaml ```
``` kubectl apply -f secrets.yaml ```
``` kubectl rollout restart deployment/easyshop-deployment ```



### Adding 0auth2-proxy to redirect URL to keycloak

If Easyshop is Spring Boot (common)
application.yml example:
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: https://keycloak.domain.com/realms/<realm>

  security:
    oauth2:
      client:
        registration:
          keycloak:
            client-id: easyshop
            client-secret: <CLIENT_SECRET>
            scope: openid, profile, email
        provider:
          keycloak:
            issuer-uri: https://keycloak.domain.com/realms/<realm>

Now Easyshop will trust Keycloak tokens.

#### Method 2 (Most Practical for Self-hosted Apps): Put Keycloak in front using oauth2-proxy
This is the BEST solution when:


Easyshop doesn’t support Keycloak directly


Easyshop login is weak / no authentication


You want to protect it fully with Keycloak


### Architecture:
User → cloudflare-tunnel → oauth2-proxy → Easyshop App
                     ↳ Keycloak Login

#### Confirm Pre-requisites:
- Kubernetes cluster (MicroK8s / K3s / EKS etc.)
- Easyshop deployed in namespace: easyshop-hack
- Keycloak self-hosted and accessible publicly:
``` https://keycloak.shaheen.homes ```
- Cloudflare Zero Trust Tunnel installed and running in namespace: cloudflare

### Step 1: Create Keycloak Client for oauth2-proxy
In keycloak admin console:
Create client:
Clients → Create 
Client ID: easyshop-proxy
Client Type: OpenID Connect
Enable: Standard Flow
Access Type: Confidential
Valid Redirect URI:
https://easyshop.yourdomain.com/oauth2/callback
(or you can use wildcard)
``` https://easyshop-hack.shaheen.homes/* ```

Web Origins
``` https://easyshop-hack.shaheen.homes ```
(or * for lab/testing)

Then copy: Client Secret
Keycloak → Clients → easyshop-proxy → Credentials
Copy the Client Secret

Step 2: Create oauth2-proxy Secret
```
apiVersion: v1
kind: Secret
metadata:
  name: oauth2-proxy-secret
  namespace: easyshop-hack
type: Opaque
stringData:
  # From Keycloak client: easyshop-proxy -> Credentials -> Secret
  OAUTH2_PROXY_CLIENT_SECRET: "PASTE_KEYCLOAK_CLIENT_SECRET"

  # Generate cookie secret (must be 16/24/32 bytes)
  # Use command:
  # python3 - <<'PY'
  # import os, base64
  # print(base64.urlsafe_b64encode(os.urandom(32)).decode().rstrip('='))
  # PY
  OAUTH2_PROXY_COOKIE_SECRET: "PASTE_COOKIE_SECRET"
```
Apply:
``` kubectl apply -f oauth2-proxy-secret.yaml ```

Step 3: Deploy oauth2-proxy for Easyshop in easyshop-hack namespace
oauth2-proxy requires:


issuer URL (realm)


client id/secret


cookie secret


Example config:
OAUTH2_PROXY_PROVIDER=keycloak-oidc
OAUTH2_PROXY_OIDC_ISSUER_URL=https://keycloak.domain.com/realms/<realm>
OAUTH2_PROXY_CLIENT_ID=easyshop-proxy
OAUTH2_PROXY_CLIENT_SECRET=<CLIENT_SECRET>
OAUTH2_PROXY_COOKIE_SECRET=<32-byte-base64-secret>
OAUTH2_PROXY_EMAIL_DOMAINS=*
OAUTH2_PROXY_UPSTREAMS=http://easyshop:8080
OAUTH2_PROXY_HTTP_ADDRESS=0.0.0.0:4180
OAUTH2_PROXY_REDIRECT_URL=https://easyshop.yourdomain.com/oauth2/callback
OAUTH2_PROXY_COOKIE_SECURE=true
OAUTH2_PROXY_COOKIE_SAMESITE=lax
OAUTH2_PROXY_SCOPE="openid profile email"

Create service:

apply oauth2-proxy.yaml & service.yaml


### Step 4: Update Cloudflare Tunnel Route (MOST IMPORTANT)

This is the key step.
Your Easyshop domain must go to oauth2-proxy service, not easyshop service.

Edit Cloudflare configmap:
Update the easyshop route:
``` - hostname: easyshop-hack.shaheen.homes
      service: http://oauth2-proxy-service.easyshop-hack.svc.cluster.local:80
``` 
Return tunnel pod:
``` kubectl rollout restart deploy/cloudflared -n cloudflare ```

#### Step 6: Verify Integration

Check pods
``` kubectl get pods -n easyshop-hack ```

Check oauth2-proxy logs
``` kubectl logs -f deploy/oauth2-proxy -n easyshop-hack ```

Step 7: Test in browser
https://easyshop-hack.shaheen.homes




#### Common Errors & Fixes

Cookie secret invalid length

Error:

cookie_secret must be 16, 24, or 32 bytes


Fix:
Generate cookie secret using python:

python3 - <<'PY'
import os, base64
print(base64.urlsafe_b64encode(os.urandom(32)).decode().rstrip('='))
PY

Email not verified error

Error:

email in id_token isn't verified


Fix:
Add this env var:

- name: OAUTH2_PROXY_INSECURE_OIDC_ALLOW_UNVERIFIED_EMAIL
  value: "true"


Also use:

- name: OAUTH2_PROXY_USER_ID_CLAIM
  value: "preferred_username"

Audience mismatch error

Error:

audience from claim aud with value [account] does not match...


Fix:
Add:

- name: OAUTH2_PROXY_OIDC_EXTRA_AUDIENCES
  value: "account"

