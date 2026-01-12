# Keycloak SSO (Kubernetes Homelab) + Gitea Integration (OIDC)

This repository documents how to set up **Keycloak** for Single Sign-On (SSO) in a homelab Kubernetes environment and integrate **Gitea** using **OpenID Connect (OIDC)**.

---

## Overview

### What is Keycloak?
Keycloak is an open-source Identity and Access Management (IAM) platform that provides:

- Single Sign-On (SSO)
- User/Group/Role management
- OAuth2 / OpenID Connect / SAML support
- MFA (OTP), policies, and session management

### Why use Keycloak in a Homelab?
- Centralized authentication for self-hosted apps
- One login for multiple services
- Role-based access across applications
- Improved security and auditability

---

## Architecture (High Level)

1. User opens an application (e.g., Gitea)
2. Application redirects user to Keycloak
3. User authenticates in Keycloak
4. Keycloak redirects back to the application
5. Application logs in/creates the user account

---

## Prerequisites

- Kubernetes cluster
- Domain + HTTPS access to applications
- Keycloak reachable externally (Ingress/Reverse proxy/Cloudflare Tunnel)
- Gitea reachable externally
- Admin access to Keycloak and Gitea

---

## Keycloak Setup

### 1) Access Admin Console
Open:

---
https://<keycloak-domain>/admin



Login using the admin credentials created during deployment.

---

### 2) Create a Dedicated Realm
Do not use `master` realm for apps.

Create a realm:

- Realm name: `homelab` (recommended)

All users, roles, groups, and clients should be created inside this realm.

---

### 3) Create Users
Inside the `homelab` realm:

- Create users (example: `shaheen`)
- Set password
- Disable **Temporary** password (recommended)

---

### 4) Create Roles and Groups (Recommended)

#### Roles (examples)
- `admin`
- `dev`
- `user`

#### Groups (examples)
- `admins`
- `devs`

Assign roles to groups, and users to groups for easier management.

---

## Gitea Integration with Keycloak (OIDC)

---

### 1) Create Keycloak Client for Gitea

In Keycloak (`homelab` realm):

Go to:

**Clients → Create client**

Use:

- Client type: **OpenID Connect**
- Client ID: `gitea`
- Client authentication: **ON**
- Standard flow: **ON**

#### Access settings

**Root URL**

https://gitea.<your-domain>


**Valid redirect URIs**

https://gitea.<your-domain>/*

(also add "https://gitea.<your-domain>/*" to gitea config in env var 'GITEA__server__ROOT_URL')


**Web origins**
https://gitea.<your-domain>


Save the client.

---

### 2) Copy Client Secret

Go to:

**Clients → gitea → Credentials**

Copy:
- `Client Secret`

---

### 3) Configure Gitea Authentication Source

In Gitea Admin UI:

Go to:

**Site Administration → Authentication Sources → Add Authentication Source**

Set:

- Authentication Type: `OAuth2`
- Authentication Name: `Keycloak`
- OAuth2 Provider: `OpenID Connect`
- Client ID (Key): `gitea`
- Client Secret: `<paste client secret>`

**OpenID Connect Auto Discovery URL**

https://<keycloak-domain>/realms/<realm>/.well-known/openid-configuration


openid email profile


Save.

---

### 4) Validate Login

1. Open Gitea login page
2. Click **Sign in with Keycloak**
3. Authenticate using Keycloak credentials (with keycloak username and password)
4. Confirm redirect back to Gitea and successful login

### Troubleshooting

#### Symptoms
- You logged in but not redirecting to gitea

#### Resolve
- 
- Check Valid Redirect URIs in Keycloak client settings

put this:
``` https://gitea.shaheen.homes/* ```

and open gitea gitea<domain name> in new tab or in incognito mode and try to login with keycloak








---

## Security Notes

- Use a dedicated realm (never use `master` for apps)
- Regenerate exposed client secrets after setup
- Enable MFA (OTP) in Keycloak for stronger security
- Use HTTPS for all redirect-based login flows

---

## Reference

- Troubleshooting: [`TROUBLESHOOTING.md`](./TROUBLESHOOTING.md)

# Troubleshooting: Keycloak + Gitea (OIDC)

---

### Sign in to your Keycloak admin console

### Symptoms
- Wrong username and password
Authentication Type
### Resolve
Authentication Type
- Create a user on keycloak homelab realm
- 

## 1) Keycloak Admin UI stuck on “Loading the Admin UI”

### Symptoms
- Admin console loads but UI stays stuck on loading screen.

### Common causes
- Reverse proxy / Cloudflare tunnel misconfiguration
- Keycloak does not trust forwarded headers
- Hostname mismatch or incorrect scheme (HTTP vs HTTPS)

### Fix checklist
- Configure Keycloak for reverse proxy:
  - Proxy mode enabled
  - Hostname set to public domain
  - HTTP enabled internally (if applicable)
- Disable Cloudflare caching/optimization for Keycloak host:
  - Rocket Loader OFF
  - Auto Minify OFF
  - Cache bypass rules

---

## 2) Cloudflare Error 502 (Bad Gateway)

### Symptoms
- Cloudflare shows `502 Bad gateway`
- Cloudflare working, host error

### Cause
Cloudflare tunnel points to incorrect internal service port.

### Fix
- Validate the internal Keycloak service port
- Ensure tunnel points to correct service URL:
  - Example: `http://keycloak.<namespace>.svc.cluster.local:8080`

---

## 3) Keycloak Error: `Invalid parameter: redirect_uri`

### Symptoms
- Keycloak login page shows:
  - `Invalid parameter: redirect_uri`

### Cause
The redirect URI sent by the application does not match client settings.

### Fix
In Keycloak client settings:
- Add correct redirect URIs:



