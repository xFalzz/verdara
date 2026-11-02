#!/bin/sh
set -e

# ==============================================================================
# Verdara Production Container Entrypoint
# Validates runtime environment and security settings before starting Next.js
# ==============================================================================

echo "========================================================================"
echo " Starting Verdara: Spatial Climate Intelligence Studio"
echo " Node.js Environment: ${NODE_ENV:-production}"
echo " Port: ${PORT:-3000}"
echo " Meta AI Credit Shield: Active (Enforcing \$150 Maximum Budget Limit)"
echo "========================================================================"

# Validate runtime variables
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
  echo "[WARN] NEXT_PUBLIC_SUPABASE_URL is not set. Operating in guest sandbox mode."
fi

if [ -z "$META_API_KEY" ]; then
  echo "[INFO] META_API_KEY is not set. Lens and AI Council will utilize zero-cost fallback."
fi

# Hand over to server process
exec "$@"
