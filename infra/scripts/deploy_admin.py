#!/usr/bin/env python3
"""Build + deploy the admin app to Cloud Run. Reads admin/.env.development.local
internally (no secrets printed). ABORTS if the resolved Supabase project isn't
arxcpgonhrhdpzhgwexj. Bakes the production API domain."""
import os, re, subprocess, sys

ROOT = "/Volumes/Data/projects/ignitehealthnow"
P = "ignitehealthnow-2025"
R = "us-central1"
REPO = f"us-central1-docker.pkg.dev/{P}/ignitehealth"
API = "https://api.ignitehealthnow.com"
EXPECTED_SUPA_PROJECT = "arxcpgonhrhdpzhgwexj"


def read_env(path):
    out = {}
    if os.path.exists(path):
        with open(path) as f:
            for line in f:
                m = re.match(r"^([A-Z0-9_]+)=(.*)$", line.strip())
                if m:
                    out[m.group(1)] = m.group(2).strip().strip('"').strip("'")
    return out


env = read_env(f"{ROOT}/admin/.env.development.local")
SUPA_URL = env.get("NEXT_PUBLIC_SUPABASE_URL", "")
SUPA_ANON = env.get("NEXT_PUBLIC_SUPABASE_ANON_KEY", "")
if not SUPA_URL or not SUPA_ANON:
    sys.exit("ABORT: missing NEXT_PUBLIC_SUPABASE_* in admin/.env.development.local")
proj = SUPA_URL.split("//")[-1].split(".")[0]
if proj != EXPECTED_SUPA_PROJECT:
    sys.exit(f"ABORT: Supabase project '{proj}' != expected '{EXPECTED_SUPA_PROJECT}'")

print(f"[admin] API={API} SUPA={proj} (anon {len(SUPA_ANON)} chars)")
subprocess.run(
    ["gcloud", "builds", "submit", "admin", "--project", P,
     "--substitutions", f"_API={API},_SUPA_URL={SUPA_URL},_SUPA_ANON={SUPA_ANON}",
     "--config", "admin/cloudbuild.admin.yaml"],
    check=True, cwd=ROOT,
)
subprocess.run(
    ["gcloud", "run", "deploy", "ignitehealth-admin",
     "--image", f"{REPO}/ignitehealth-admin:latest", "--region", R, "--project", P,
     "--allow-unauthenticated"],
    check=True, cwd=ROOT,
)
url = subprocess.check_output(
    ["gcloud", "run", "services", "describe", "ignitehealth-admin",
     "--region", R, "--project", P, "--format=value(status.url)"], cwd=ROOT,
).decode().strip()
print(f"[admin] DONE url={url}")
