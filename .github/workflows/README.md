# CI/CD Workflows

This directory contains GitHub Actions workflows for automated building, testing, and deployment of Ship Vue to AWS EKS.

## Structure

```
.github/workflows/
├── linter.template.yml     # Reusable linter template
├── build-api.yml          # Build API Docker image (PR)
├── build-web.yml          # Build Web Docker image (PR)
├── run-api-linter.yml     # Lint API code (PR)
├── run-web-linter.yml     # Lint Web code (PR)
├── manual-deploy.yml      # Manual deployment workflow
└── README.md             # This file
```

## Workflows

### 1. Linter Template (`linter.template.yml`)

Reusable workflow for linting code with ESLint, TypeScript, and Prettier.

**Inputs:**
- `component`: Component name (`api` or `web`)
- `dir`: Directory to lint (`apps/api` or `apps/web`)

**Features:**
- ESLint for code quality
- TypeScript compilation check
- Prettier formatting check
- Inline PR comments for issues

### 2. Build Workflows

#### Build API (`build-api.yml`)
**Triggers:**
- Pull requests to `main` branch
- Changes to `apps/api/**` or `packages/**`
- Manual trigger

**Purpose:** Validates API Docker image builds successfully

#### Build Web (`build-web.yml`)
**Triggers:**
- Pull requests to `main` branch
- Changes to `apps/web/**` or `packages/**`
- Manual trigger

**Purpose:** Validates Web Docker image builds successfully

### 3. Linting Workflows

#### Lint API (`run-api-linter.yml`)
**Triggers:**
- Pull requests to `main` branch
- Changes to `apps/api/**` or `packages/**`
- Manual trigger

**Purpose:** Runs linting checks on API code

#### Lint Web (`run-web-linter.yml`)
**Triggers:**
- Pull requests to `main` branch
- Changes to `apps/web/**` or `packages/**`
- Manual trigger

**Purpose:** Runs linting checks on Web code

### 4. Manual Deployment (`manual-deploy.yml`)

**Triggers:**
- Manual trigger via GitHub Actions UI

**Options:**
- **Service**: Choose `api`, `web`, or `both`
- **Image Tag**: Specify custom image tag (default: `latest`)
- **Force Rebuild**: Rebuild images before deployment

## Required Secrets

Configure these in GitHub repository settings:

### Repository Secrets
- `AWS_SECRET_ACCESS_KEY`: AWS secret access key for ECR and EKS access

### Repository Variables
- `AWS_ACCESS_KEY_ID`: AWS access key ID
- `SSL_CERTIFICATE_ARN`: AWS ACM certificate ARN for HTTPS

## Environment Configuration

### Production Environment
- **Web URL**: `https://ship-nuxt.dedyn.io`
- **API URL**: `https://api.ship-nuxt.dedyn.io`
- **AWS Region**: `us-east-1`
- **EKS Cluster**: `ship-nuxt-cluster`

## Workflow Philosophy

### Pull Request Workflows
- **Focused**: Each workflow targets specific components
- **Fast**: Only runs when relevant code changes
- **Informative**: Provides inline feedback on PRs
- **Efficient**: Uses Docker layer caching for faster builds

### Manual Deployment
- **Flexible**: Deploy individual services or both
- **Safe**: Requires manual trigger for production changes
- **Traceable**: Clear deployment summaries and logs

## Image Tagging Strategy

- **Production builds**: `production-{commit-sha}` + `latest`
- **Manual builds**: `{custom-tag}` + `latest`

## Security Features

- **Vulnerability Scanning**: Trivy scans all Docker images
- **SARIF Upload**: Security results uploaded to GitHub Security tab
- **Environment Protection**: Production deployments require environment approval
- **Least Privilege**: IAM roles with minimal required permissions

## Monitoring Deployment

### Via GitHub Actions
- Check workflow status in Actions tab
- View deployment summaries in job outputs
- Monitor security scan results

### Via kubectl
```bash
# Check pods
kubectl get pods -n production

# Check services
kubectl get services -n production

# Check ingress
kubectl get ingress -n production

# View logs
kubectl logs -f deployment/api -n production
kubectl logs -f deployment/web -n production
```

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Docker build logs
   - Verify Dockerfile syntax
   - Ensure dependencies are available

2. **Deployment Failures**
   - Check EKS cluster status
   - Verify IAM permissions
   - Check Kubernetes resource limits

3. **Image Pull Errors**
   - Verify ECR repository exists
   - Check IAM permissions for ECR
   - Ensure image was pushed successfully

### Debug Commands
```bash
# Describe failed pods
kubectl describe pod <pod-name> -n production

# Check events
kubectl get events -n production --sort-by='.lastTimestamp'

# Check deployment status
kubectl rollout status deployment/api -n production
kubectl rollout status deployment/web -n production
```

## Extending the Pipeline

### Adding New Services
1. Create new Dockerfile in `apps/{service}/`
2. Add build job to `production.yml`
3. Add deploy job to `production.yml`
4. Create Kubernetes manifests in `k8s/deployments/`

### Adding Environments
1. Create new environment-specific workflow
2. Update templates with environment variables
3. Configure environment-specific secrets
4. Update Kubernetes manifests

### Adding Tests
Add test jobs before build jobs:
```yaml
test-api:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - name: Run API tests
      run: pnpm --filter api test
```

## Best Practices

1. **Always test locally** before pushing to main
2. **Use feature branches** for development
3. **Monitor deployment logs** for issues
4. **Keep secrets secure** and rotate regularly
5. **Review security scan results** before deployment
6. **Use manual deployment** for hotfixes or rollbacks