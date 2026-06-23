"""
TaskFlow JWT smoke test
Run: python smoke_test.py

Tests in order:
  1. Register a new user
  2. Login with email -> get access + refresh tokens
  3. Login with username -> confirm same user returned
  4. Access /auth/me/ with Bearer token
  5. Refresh the access token (rotation check)
  6. Reject request with no token (expect 401)
  7. Wrong password (expect 400)
  8. Unknown login (expect 400)
"""

import json
import sys
import uuid
import urllib.request
import urllib.error

BASE = "http://127.0.0.1:8000/api/v1"
PASS = "[PASS]"
FAIL = "[FAIL]"


def req(method, path, body=None, token=None, expect=None):
    url     = f"{BASE}{path}"
    data    = json.dumps(body).encode() if body else None
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    request = urllib.request.Request(
        url, data=data, headers=headers, method=method
    )
    try:
        with urllib.request.urlopen(request) as resp:
            status  = resp.status
            payload = json.loads(resp.read())
    except urllib.error.HTTPError as e:
        status  = e.code
        payload = json.loads(e.read())

    ok   = (expect is None) or (status == expect)
    icon = PASS if ok else FAIL
    print(f"  {icon}  [{status}] {method} {path}")
    if not ok:
        print(f"         Expected {expect}, got {status}")
        print(f"         Response: {json.dumps(payload, indent=8)}")
        sys.exit(1)
    return payload, status


# ---------------------------------------------------------------------------
# Test data
# ---------------------------------------------------------------------------

USER = {
    "username":   f"smoketest_user_{uuid.uuid4().hex[:8]}",
    "email":      f"smoketest_{uuid.uuid4().hex[:8]}@taskflow.dev",
    "password":   "Str0ng!Pass#99",
    "first_name": "Smoke",
    "last_name":  "Test",
}

# ---------------------------------------------------------------------------
# 1. Register
# ---------------------------------------------------------------------------
print("\n== 1. Register =================================================")
data, _ = req("POST", "/auth/register/", body=USER, expect=201)
print(f"         user id  : {data['id']}")
print(f"         role     : {data['role']}  (expected: employee)")
assert data["role"] == "employee", "Default role must be 'employee'"

# ---------------------------------------------------------------------------
# 2. Login with email
# ---------------------------------------------------------------------------
print("\n== 2. Login (email) ============================================")
data, _ = req("POST", "/auth/login/", body={
    "login": USER["email"], "password": USER["password"]
}, expect=200)
access  = data["access"]
refresh = data["refresh"]
print(f"         access  : {access[:50]}...")
print(f"         refresh : {refresh[:50]}...")
print(f"         role    : {data['user']['role']}")
assert data["user"]["email"] == USER["email"]

# ---------------------------------------------------------------------------
# 3. Login with username
# ---------------------------------------------------------------------------
print("\n== 3. Login (username) =========================================")
data2, _ = req("POST", "/auth/login/", body={
    "login": USER["username"], "password": USER["password"]
}, expect=200)
print(f"         access  : {data2['access'][:50]}...")
assert data2["user"]["username"] == USER["username"]

# ---------------------------------------------------------------------------
# 4. GET /auth/me/
# ---------------------------------------------------------------------------
print("\n== 4. GET /auth/me/ (Bearer token) =============================")
me, _ = req("GET", "/auth/me/", token=access, expect=200)
print(f"         username : {me['username']}")
print(f"         email    : {me['email']}")
print(f"         role     : {me['role']}")

# ---------------------------------------------------------------------------
# 5. Refresh access token
# ---------------------------------------------------------------------------
print("\n== 5. POST /auth/token/refresh/ ================================")
refreshed, _ = req("POST", "/auth/token/refresh/",
                   body={"refresh": refresh}, expect=200)
new_access = refreshed["access"]
print(f"         new access : {new_access[:50]}...")
assert new_access != access, "Rotated token should differ from original"
print(f"         Token rotated correctly.")

# ---------------------------------------------------------------------------
# 6. No token -> 401
# ---------------------------------------------------------------------------
print("\n== 6. No token -> expect 401 ===================================")
req("GET", "/auth/me/", expect=401)

# ---------------------------------------------------------------------------
# 7. Wrong password -> 400
# ---------------------------------------------------------------------------
print("\n== 7. Wrong password -> expect 400 =============================")
req("POST", "/auth/login/", body={
    "login": USER["email"], "password": "wrongpassword"
}, expect=400)

# ---------------------------------------------------------------------------
# 8. Unknown login -> 400
# ---------------------------------------------------------------------------
print("\n== 8. Unknown email -> expect 400 ==============================")
req("POST", "/auth/login/", body={
    "login": "nobody@nowhere.com", "password": "anything"
}, expect=400)

print("\n" + "=" * 60)
print("  All 8 smoke tests passed.")
print("=" * 60 + "\n")
