# Kubernetes Deployment

This directory contains Kubernetes manifests for deploying Ship Nuxt to AWS EKS.

## Structure

```
k8s/
├── deployments/
│   ├── namespace.yaml                 # Namespaces for production and staging
│   ├── api-deployment.template.yaml   # API deployment template
│   ├── web-deployment.template.yaml   # Web deployment template
│   ├── ingress.template.yaml          # Ingress template
│   ├── api-deployment.yaml           # Current API deployment (generated)
│   ├── web-deployment.yaml           # Current Web deployment (generated)
│   └── ingress.yaml                  # Current Ingress (generated)
└── README.md
```

## Environment Variables

The template files use environment variables that should be set before deployment:

### Required Variables:
- `ECR_REGISTRY` - ECR registry URL (e.g., `123456789.dkr.ecr.us-east-1.amazonaws.com`)
- `SSL_CERTIFICATE_ARN` - AWS ACM certificate ARN
- `IMAGE_TAG` - Docker image tag (default: `latest`)

### Optional Variables:
- `NAMESPACE` - Kubernetes namespace (default: `production`)
- `API_REPLICAS` - Number of API replicas (default: `1`)
- `WEB_REPLICAS` - Number of Web replicas (default: `1`)
- `API_URL` - API URL for web app (default: `https://api.ship-nuxt.dedyn.io`)
- `WS_URL` - WebSocket URL (default: `https://api.ship-nuxt.dedyn.io`)
- `WEB_URL` - Web app URL (default: `https://ship-nuxt.dedyn.io`)
- `WEB_DOMAIN` - Web domain (default: `ship-nuxt.dedyn.io`)
- `API_DOMAIN` - API domain (default: `api.ship-nuxt.dedyn.io`)

## Deployment Commands

### 1. Create Namespaces
```bash
kubectl apply -f k8s/deployments/namespace.yaml
```

### 2. Create Secrets
```bash
# Create API secrets
kubectl create secret generic api-secrets \
  --from-literal=DATABASE_URL="mysql://user:pass@host:3306/db" \
  --from-literal=REDIS_URL="redis://host:6379" \
  --from-literal=JWT_SECRET="your-jwt-secret" \
  --from-literal=AWS_ACCESS_KEY_ID="your-access-key" \
  --from-literal=AWS_SECRET_ACCESS_KEY="your-secret-key" \
  --from-literal=AWS_REGION="us-east-1" \
  --from-literal=AWS_S3_BUCKET="your-bucket" \
  -n production
```

### 3. Deploy Applications
```bash
# Set environment variables
export ECR_REGISTRY="306011031365.dkr.ecr.us-east-1.amazonaws.com"
export SSL_CERTIFICATE_ARN="arn:aws:acm:us-east-1:306011031365:certificate/your-cert-id"
export IMAGE_TAG="latest"

# Generate and apply manifests
envsubst < k8s/deployments/api-deployment.template.yaml | kubectl apply -f -
envsubst < k8s/deployments/web-deployment.template.yaml | kubectl apply -f -
envsubst < k8s/deployments/ingress.template.yaml | kubectl apply -f -
```

### 4. Verify Deployment
```bash
# Check pods
kubectl get pods -n production

# Check services
kubectl get services -n production

# Check ingress
kubectl get ingress -n production

# Check logs
kubectl logs -f deployment/api -n production
kubectl logs -f deployment/web -n production
```

## CI/CD Integration

The template files are designed to work with CI/CD pipelines. Environment variables can be set in your CI/CD system and the templates will be processed automatically.

### GitHub Actions Example:
```yaml
- name: Deploy to Kubernetes
  env:
    ECR_REGISTRY: ${{ secrets.ECR_REGISTRY }}
    SSL_CERTIFICATE_ARN: ${{ secrets.SSL_CERTIFICATE_ARN }}
    IMAGE_TAG: ${{ github.sha }}
  run: |
    envsubst < k8s/deployments/api-deployment.template.yaml | kubectl apply -f -
    envsubst < k8s/deployments/web-deployment.template.yaml | kubectl apply -f -
    envsubst < k8s/deployments/ingress.template.yaml | kubectl apply -f -
```

## Health Checks

Both API and Web deployments include:
- **Liveness Probes**: Restart containers if they become unresponsive
- **Readiness Probes**: Only route traffic to healthy containers

## Resource Limits

Default resource limits are set for free tier compatibility:
- **Requests**: 128Mi memory, 100m CPU
- **Limits**: 256Mi memory, 200m CPU

Adjust these based on your cluster capacity and requirements.

## Scaling

To scale the application:
```bash
# Scale API
kubectl scale deployment api --replicas=3 -n production

# Scale Web
kubectl scale deployment web --replicas=3 -n production
```

## Troubleshooting

### Common Issues:

1. **ImagePullBackOff**: Check ECR permissions and image exists
2. **CrashLoopBackOff**: Check application logs and environment variables
3. **Ingress not working**: Verify AWS Load Balancer Controller is installed
4. **SSL issues**: Check certificate ARN and DNS validation

### Debug Commands:
```bash
# Describe resources
kubectl describe pod <pod-name> -n production
kubectl describe service <service-name> -n production
kubectl describe ingress ship-nuxt-ingress -n production

# Check events
kubectl get events -n production --sort-by='.lastTimestamp'

# Port forward for local testing
kubectl port-forward service/api-service 3001:80 -n production
kubectl port-forward service/web-service 3000:80 -n production
```