# Ship Vue Fresh

A full-stack application with Vue.js frontend and Express.js API, featuring automated database migrations and Kubernetes deployment.

## 🚀 Features

- **Frontend**: Vue.js 3 with TypeScript
- **Backend**: Express.js API with TypeScript
- **Database**: MySQL with Drizzle ORM
- **Authentication**: JWT-based auth system
- **Deployment**: Kubernetes on AWS EKS
- **CI/CD**: GitHub Actions with automated migrations
- **Infrastructure**: AWS RDS, ECR, ALB with SSL

## 📁 Project Structure

```
ship-vue-fresh/
├── apps/
│   ├── api/                    # Express.js API
│   │   ├── src/               # API source code
│   │   ├── drizzle/           # Database migrations
│   │   ├── Dockerfile         # API container with migrations
│   │   └── Dockerfile.migrator # Dedicated migration container
│   └── web/                   # Vue.js frontend
│       ├── src/               # Vue app source
│       └── Dockerfile         # Web container
├── packages/                  # Shared packages
├── k8s/                       # Kubernetes manifests
│   └── deployments/           # Deployment templates
├── scripts/                   # Deployment scripts
├── .github/workflows/         # CI/CD pipelines
└── deploy/                    # Deployment documentation
```

## 🛠️ Development Setup

### Prerequisites
- Node.js 20+
- pnpm 8+
- Docker
- kubectl
- AWS CLI

### Local Development
```bash
# Install dependencies
pnpm install

# Start local infrastructure (MySQL + Redis)
pnpm infra

# Run database migrations
pnpm --filter api db:migrate

# Start development servers
pnpm dev
```

### Environment Variables
Copy `.env.example` files and configure:
- `apps/api/.env` - API configuration
- `apps/web/.env` - Web configuration

## 🗄️ Database Migrations

### Local Development
```bash
# Generate migrations after schema changes
pnpm --filter api db:generate

# Run migrations
pnpm --filter api db:migrate

# Push schema directly (dev only)
pnpm --filter api db:push
```

### Production Deployment
```bash
# Deploy with automatic migrations
RUN_MIGRATIONS=true ./scripts/deploy-with-migrations.sh

# Run migrations only
./scripts/deploy-with-migrations.sh migrate
```

### Docker Migrations
```bash
# Build migrator image
docker build -f apps/api/Dockerfile.migrator -t ship-vue-migrator .

# Run migrations
docker run --rm \
  -e DATABASE_URL="mysql://user:pass@host:3306/db" \
  ship-vue-migrator
```

## 🚢 Deployment

### Kubernetes Templates
The project uses environment variable templates for flexible deployments:

```bash
# Set environment variables
export ECR_REGISTRY="your-registry"
export SSL_CERTIFICATE_ARN="your-cert-arn"
export IMAGE_TAG="latest"

# Deploy to production
./scripts/deploy-with-migrations.sh
```

### CI/CD Pipeline
GitHub Actions automatically:
1. **Tests** code and runs linting
2. **Builds** Docker images and pushes to ECR
3. **Runs** database migrations
4. **Deploys** to Kubernetes
5. **Scans** images for security vulnerabilities

### Manual Deployment
```bash
# Build and push images
docker build -t $ECR_REGISTRY/ship-vue-api:$TAG apps/api
docker push $ECR_REGISTRY/ship-vue-api:$TAG

# Deploy with migrations
RUN_MIGRATIONS=true \
ECR_REGISTRY=$ECR_REGISTRY \
IMAGE_TAG=$TAG \
./scripts/deploy-with-migrations.sh
```

## 🔧 Configuration

### Kubernetes Secrets
Required secrets in `production` namespace:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: api-secrets
data:
  DATABASE_URL: <base64-encoded-mysql-url>
  REDIS_URL: <base64-encoded-redis-url>
  JWT_SECRET: <base64-encoded-jwt-secret>
  AWS_ACCESS_KEY_ID: <base64-encoded-aws-key>
  AWS_SECRET_ACCESS_KEY: <base64-encoded-aws-secret>
```

### Environment Variables
- `ECR_REGISTRY` - AWS ECR registry URL
- `SSL_CERTIFICATE_ARN` - AWS ACM certificate ARN
- `IMAGE_TAG` - Docker image tag (default: latest)
- `RUN_MIGRATIONS` - Run migrations on deployment (default: false)

## 🏗️ Architecture

### Infrastructure
- **EKS Cluster**: Kubernetes cluster on AWS
- **RDS MySQL**: Managed database service
- **ECR**: Container registry
- **ALB**: Application Load Balancer with SSL
- **Route53**: DNS management

### Application
- **API**: Express.js with Drizzle ORM
- **Web**: Vue.js SPA application
- **Auth**: JWT-based authentication
- **Database**: MySQL with automated migrations

## 📚 Documentation

- [API Documentation](apps/api/README.md)
- [Web Documentation](apps/web/README.md)
- [Migration Guide](apps/api/migrations/README.md)
- [Kubernetes Setup](k8s/README.md)
- [CI/CD Workflows](.github/workflows/README.md)
- [Deployment Guide](deploy/)

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run API tests
pnpm --filter api test

# Run web tests
pnpm --filter web test

# Test API endpoints
./scripts/deploy-with-migrations.sh test
```

## 🔒 Security

- **HTTPS**: SSL/TLS encryption via AWS Certificate Manager
- **Authentication**: JWT tokens with secure password hashing
- **Network**: Private VPC with security groups
- **Secrets**: Kubernetes secrets for sensitive data
- **Scanning**: Automated vulnerability scanning in CI/CD

## 📊 Monitoring

- **Health Checks**: Kubernetes liveness and readiness probes
- **Logs**: Centralized logging via kubectl
- **Metrics**: Application and infrastructure monitoring
- **Alerts**: Failed deployment notifications

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run linting and tests
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/your-org/ship-vue-fresh/issues)
- **Documentation**: Check the `/docs` directory
- **Deployment Help**: See [deployment guides](deploy/)

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/your-org/ship-vue-fresh.git
cd ship-vue-fresh

# Install dependencies
pnpm install

# Start development environment
pnpm dev

# Deploy to production
RUN_MIGRATIONS=true ./scripts/deploy-with-migrations.sh
```

---

Built with ❤️ using Vue.js, Express.js, and Kubernetes