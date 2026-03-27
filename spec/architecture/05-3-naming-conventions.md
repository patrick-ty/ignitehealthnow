# 3. Naming Conventions

Resources follow the pattern:

ignitehealth-{resource}-{env}

Where:
- env is `dev` or `prod`
- Production resources omit the env suffix

Examples:
- Cloud Run API: ignitehealth-api-dev / ignitehealth-api
- GCS PHI Bucket: ignitehealth-phi-uploads-dev / ignitehealth-phi-uploads
- Pub/Sub Topic: journal.entry.created.dev / journal.entry.created
