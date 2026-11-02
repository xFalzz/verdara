#!/bin/sh
set -e

# Container healthcheck probe for Verdara Web App
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health || echo "000")

if [ "$STATUS" = "200" ]; then
  exit 0
else
  echo "[HEALTHCHECK FAIL] Expected HTTP 200, received $STATUS"
  exit 1
fi
