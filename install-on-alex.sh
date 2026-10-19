#!/usr/bin/env bash
# One-shot install/update of WebForge on alex. Run from the repo root as the rexS user.
# Usage: ./install-on-alex.sh            (docker, default)
#        ./install-on-alex.sh --bare     (node + systemd user service, no docker)
set -euo pipefail
cd "$(dirname "$0")"
MODE="${1:-docker}"
[ -f .env ] || { cp .env.example .env; echo "Created .env from .env.example. Edit WEBFORGE_PORT/WEBFORGE_BIND, claim the port, then re-run."; exit 1; }
set -a; . ./.env; set +a
PORT="${WEBFORGE_PORT:-24310}"; BIND="${WEBFORGE_BIND:-127.0.0.1}"
echo "Port $PORT on $BIND. Reminder: the port must be claimed in jDrive/reference/PORTS.md (ssh alex port-claim alex-server $PORT tcp webforge)."
mkdir -p data "${HOME}/.drJesticles"; touch "${HOME}/.drJesticles/webforge.env"; chmod 600 "${HOME}/.drJesticles/webforge.env"
if [ "$MODE" = "--bare" ]; then
  command -v node >/dev/null || { echo "node 22+ required"; exit 1; }
  npm ci --no-audit --no-fund && npm run build
  mkdir -p "${HOME}/.config/systemd/user"
  cat > "${HOME}/.config/systemd/user/webforge.service" <<UNIT
[Unit]
Description=WebForge site builder
After=network.target
[Service]
WorkingDirectory=$(pwd)
Environment=NODE_ENV=production PORT=$PORT HOSTNAME=$BIND WEBFORGE_DATA_DIR=$(pwd)/data WEBFORGE_SECRETS_FILE=${HOME}/.drJesticles/webforge.env
ExecStart=$(command -v node) .next/standalone/server.js
Restart=on-failure
[Install]
WantedBy=default.target
UNIT
  cp -r .next/static .next/standalone/.next/ 2>/dev/null || true; cp -r public .next/standalone/ 2>/dev/null || true
  systemctl --user daemon-reload && systemctl --user enable --now webforge.service
  echo "Running: http://$BIND:$PORT  (systemctl --user status webforge)"
else
  command -v docker >/dev/null || { echo "docker required (or use --bare)"; exit 1; }
  docker compose up -d --build
  echo "Running: http://$BIND:$PORT  (docker compose logs -f webforge)"
fi
