import json
import subprocess
import urllib.parse

API_URL = "http://localhost:8000"

COOKIE_VAL = r"%7B%22access_token%22%3A%22eyJhbGciOiJIUzI1NiIsImtpZCI6InhUbG9wOVlHNTUrY1VIT08iLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2lqZmxlcXB0a2VlZXB5bWxld2hhLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI1YmNmMTM5Mi00ZjczLTRiNDItOWU5Yy00MjU5NzUwMDdlOGQiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzY4NTk2MDExLCJpYXQiOjE3Njg1OTI0MTEsImVtYWlsIjoicGF0cmljay50eUBjb21jYXN0Lm5ldCIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnsiZW1haWwiOiJwYXRyaWNrLnR5QGNvbWNhc3QubmV0IiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwic3ViIjoiNWJjZjEzOTItNGY3My00YjQyLTllOWMtNDI1OTc1MDA3ZThkIn0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3Njg1OTI0MTF9XSwic2Vzc2lvbl9pZCI6IjQ5NjMwZWNmLTg4MGUtNDhmMy05N2I4LTViODVjMTUxNGNhYiIsImlzX2Fub255bW91cyI6ZmFsc2V9.8gUokIXAUJ1WCfx1wOYgKcHIbL-pgipUf9lBb88wBrs%22%2C%22token_type%22%3A%22bearer%22%2C%22expires_in%22%3A3600%2C%22expires_at%22%3A1768596011%2C%22refresh_token%22%3A%226w25lz2ggwox%22%2C%22user%22%3A%7B%22id%22%3A%225bcf1392-4f73-4b42-9e9c-425975007e8d%22%7D%7D"


def get_access_token() -> str:
    data = json.loads(urllib.parse.unquote(COOKIE_VAL))
    return data["access_token"]


def curl(path: str, token: str | None):
    url = f"{API_URL}{path}"
    cmd = ["curl", "-i", url]
    if token:
        cmd.extend(["-H", f"Authorization: Bearer {token}"])
    subprocess.run(cmd, check=False)


def main():
    token = get_access_token()
    print("ACCESS_TOKEN (single line):")
    print(token)
    print("\n---- /health ----")
    curl("/health", token=None)
    print("\n---- /me ----")
    curl("/me", token=token)
    print("\n---- /profile ----")
    curl("/profile", token=token)


if __name__ == "__main__":
    main()
