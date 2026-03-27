# Infrastructure & Deployment

This directory contains deployment configurations and infrastructure-as-code for Ignite Health platform.

## Structure

```
infra/
├── terraform/          # Terraform configurations (optional)
├── github-actions/     # Reusable workflow templates
└── scripts/            # Deployment and utility scripts
```

## Environments

- **dev**: Development environment
- **prod**: Production environment

## Cloud Run Services

- `ignitehealth-api`: Main REST API (FastAPI)
- `ignitehealth-worker`: Background workers (Pub/Sub triggered)

## Deployment Strategy

Deployments are triggered via GitHub Actions on tagged releases (`v*`).

See: `spec/architecture/cloud-infrastructure.md` for full architecture details.
