#!/usr/bin/env bash
set -euo pipefail

# Quick-Health-Hub API tester
# Usage:
#   EMAIL=... PASSWORD=... ./scripts/qhh_api_test.sh

BASE=${VITE_API_BASE:-${BASE:-http://localhost:8080}}
OUTDIR=/tmp/qhh_api_test
COOKIEJAR=${OUTDIR}/cookies.txt
mkdir -p "$OUTDIR"
: > "$OUTDIR/summary.json"

echo "API test base: $BASE"

curl_opts=( -s -S -w "\n__STATUS:%{http_code}\n" -H "Accept: application/json" )

save_response() {
  local name="$1"; shift
  local out="$OUTDIR/${name}.json"
  cat > "$out"
}

run_get() {
  local path="$1" name="$2"
  echo "GET $path -> $name"
  (curl "${curl_opts[@]}" "$BASE$path" ) 2>&1 | tee "$OUTDIR/${name}.http"
}

run_post() {
  local path="$1" name="$2" data="$3"
  echo "POST $path -> $name"
  (curl "${curl_opts[@]}" -H "Content-Type: application/json" -d "$data" "$BASE$path") 2>&1 | tee "$OUTDIR/${name}.http"
}

# 1) Health
run_get /api/health health

# 2) Doctors (try multiple candidates)
for p in "/api/doctors" "/doctors" "/api/doctor" "/doctor" "/api/v1/doctors" "/v1/doctors" "/api/providers" "/providers"; do
  echo "Trying doctors endpoint: $p"
  (curl "${curl_opts[@]}" "$BASE$p") 2>&1 | tee "$OUTDIR/doctors${p//\//_}.http" || true
done

# If EMAIL/PASSWORD provided, attempt authenticated flows
if [[ -n "${EMAIL:-}" && -n "${PASSWORD:-}" ]]; then
  echo "=== LOGIN ==="
  # Login and save cookies
  curl -c "$COOKIEJAR" -s -S -H "Content-Type: application/json" -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" -X POST "$BASE/api/auth/login" -D "$OUTDIR/login.headers" -o "$OUTDIR/login.body" || true
  # show login result
  echo "Login headers:"; sed -n '1,120p' "$OUTDIR/login.headers" || true
  echo "Login body:"; sed -n '1,120p' "$OUTDIR/login.body" || true

  # extract XSRF token from cookie jar if present
  XSRF=""
  if [[ -f "$COOKIEJAR" ]]; then
    if grep -q "XSRF-TOKEN" "$COOKIEJAR"; then
      XSRF=$(awk '/XSRF-TOKEN/{print $7}' "$COOKIEJAR" | head -n1)
    fi
  fi
  echo "XSRF token: ${XSRF:-<none>}"

  # function to curl with cookie jar and optional XSRF header
  run_auth_get() {
    local path="$1" name="$2"
    echo "GET (auth) $path -> $name"
    if [[ -n "$XSRF" ]]; then
      curl -b "$COOKIEJAR" -s -S -H "X-XSRF-TOKEN: $XSRF" -H "Accept: application/json" -w "\n__STATUS:%{http_code}\n" "$BASE$path" | tee "$OUTDIR/${name}.http"
    else
      curl -b "$COOKIEJAR" -s -S -H "Accept: application/json" -w "\n__STATUS:%{http_code}\n" "$BASE$path" | tee "$OUTDIR/${name}.http"
    fi
  }
  run_auth_post() {
    local path="$1" name="$2" data="$3"
    echo "POST (auth) $path -> $name"
    if [[ -n "$XSRF" ]]; then
      curl -b "$COOKIEJAR" -s -S -H "Content-Type: application/json" -H "X-XSRF-TOKEN: $XSRF" -d "$data" -w "\n__STATUS:%{http_code}\n" "$BASE$path" | tee "$OUTDIR/${name}.http"
    else
      curl -b "$COOKIEJAR" -s -S -H "Content-Type: application/json" -d "$data" -w "\n__STATUS:%{http_code}\n" "$BASE$path" | tee "$OUTDIR/${name}.http"
    fi
  }

  # 3) Profile
  run_auth_get /api/auth/me profile
  run_auth_get /api/user/me profile_user_me || true

  # 4) Appointments list
  run_auth_get /api/appointments appointments

  # 5) Create appointment (sample)
  APPT_PAYLOAD='{"doctor":"Dr. Test","specialty":"General","startTime":"2025-10-20T10:00:00Z","reason":"Checkup"}'
  run_auth_post /api/appointments create_appointment "$APPT_PAYLOAD" || true

  # 6) Prescriptions list
  run_auth_get /api/prescriptions prescriptions

  # 7) Create prescription (use the payload provided by the user if set via PRESC_JSON env var)
  if [[ -n "${PRESC_JSON:-}" ]]; then
    PRES_BODY="$PRESC_JSON"
  else
    PRES_BODY='{"medication":"Drug Name","dosage":"1 tablet daily","instructions":"Take after meals","issuedAt":"2025-10-13T09:00:00Z","expiresAt":"2025-11-13T09:00:00Z"}'
  fi
  run_auth_post /api/prescriptions create_prescription "$PRES_BODY" || true

  # 8) Contact
  CONTACT_BODY='{"name":"Tester","email":"test@example.com","message":"This is a test"}'
  run_auth_post /api/contact submit_contact "$CONTACT_BODY" || true

  # 9) Upload avatar (small generated PNG)
  AVATAR_PATH="$OUTDIR/avatar.png"
  # generate a 1x1 transparent PNG via printf (base64)
  printf 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=' | base64 -d > "$AVATAR_PATH"
  echo "Uploading avatar (multipart)..."
  if [[ -n "$XSRF" ]]; then
    curl -b "$COOKIEJAR" -s -S -H "X-XSRF-TOKEN: $XSRF" -F "file=@${AVATAR_PATH}" -w "\n__STATUS:%{http_code}\n" "$BASE/api/auth/me/avatar" | tee "$OUTDIR/upload_avatar.http" || true
  else
    curl -b "$COOKIEJAR" -s -S -F "file=@${AVATAR_PATH}" -w "\n__STATUS:%{http_code}\n" "$BASE/api/auth/me/avatar" | tee "$OUTDIR/upload_avatar.http" || true
  fi

else
  echo "No EMAIL/PASSWORD provided, skipping authenticated tests. To run them set EMAIL and PASSWORD environment variables."
fi

echo "Tests complete. Responses saved under $OUTDIR"

exit 0
