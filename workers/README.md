# Ignite Health Workers

Python background workers for asynchronous job processing via Pub/Sub.

## Setup

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment:
```bash
cp .env.example .env.local
# Edit .env.local with your Supabase and GCP credentials
```

## Testing

```bash
pytest
```

## Local Development

Workers are triggered by Pub/Sub messages. For local testing, you can:
1. Use Pub/Sub emulator
2. Trigger handlers directly via HTTP endpoints (for testing)
