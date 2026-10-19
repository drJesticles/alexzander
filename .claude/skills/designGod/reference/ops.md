# Ops on alex

```bash
cd ~/workspace/projects/webforge
cp .env.example .env            # WEBFORGE_PORT (claim: ssh alex port-claim alex-server 24310 tcp webforge), WEBFORGE_BIND
./install-on-alex.sh            # docker compose up -d --build   (or --bare for node + systemd user unit)
docker compose logs -f webforge
docker compose up -d --build    # after git pull
```
- Data to back up: `data/` (projects, published sites, imported kits). It rides workspace-backup.sh if the project lives under ~/workspace.
- Library edits on the host are live (volume mounted read-only into the container); no rebuild needed for library changes. App code changes need a rebuild.
- Secrets: `~/.drJesticles/webforge.env` mounted at `/secrets/webforge.env`. Settings page writes there (needs the dir writable for the container user if you want UI writes; otherwise edit the file by hand).
- Forgejo first, GitHub mirror second (Forgejo plan 2026-10-18). Cloud sessions push to GitHub `drJesticles/alexzander`; alex pulls, then pushes to Forgejo.
- Troubleshooting: 404 on a published site asset → the site URL must end with `/` (the app redirects). Kit not showing → `kit.json` invalid; run `npm run validate`. Editor blank → check browser console, `/api/library/components?full=1` must return 200. Fonts not loading → kit `fonts` list, needs outbound internet to fonts.googleapis.com.
```
