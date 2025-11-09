#!/bin/bash
set -euo pipefail

sudo yum update -y
sudo yum install -y golang tar curl libcap

cd /tmp
curl -L "https://github.com/caddyserver/caddy/releases/download/v2.8.4/caddy_2.8.4_linux_amd64.tar.gz" -o caddy.tar.gz
tar -xvzf caddy.tar.gz
sudo mv caddy /usr/bin/caddy
sudo chmod +x /usr/bin/caddy

sudo setcap 'cap_net_bind_service=+ep' /usr/bin/caddy

if ! getent group caddy >/dev/null; then
  sudo groupadd -r caddy
fi
if ! id -u caddy >/dev/null 2>&1; then
  sudo useradd -r -g caddy -m -d /var/lib/caddy -s /sbin/nologin -c "caddy web server" caddy
fi

sudo mkdir -p /etc/caddy /var/log/caddy
sudo chown -R caddy:caddy /etc/caddy /var/lib/caddy /var/log/caddy
sudo chmod 755 /var/lib/caddy

sudo tee /etc/caddy/Caddyfile >/dev/null <<'CADDYEOF'
hungryai.asmirabdimazhit.com {
  reverse_proxy localhost:8080
}
CADDYEOF
sudo chown caddy:caddy /etc/caddy/Caddyfile
sudo chmod 644 /etc/caddy/Caddyfile

sudo tee /etc/systemd/system/caddy.service >/dev/null <<'UNIT'
[Unit]
Description=Caddy web server
Documentation=https://caddyserver.com/docs/
After=network-online.target
Wants=network-online.target

[Service]
User=caddy
Group=caddy
WorkingDirectory=/var/lib/caddy
ExecStart=/usr/bin/caddy run --environ --config /etc/caddy/Caddyfile
ExecReload=/usr/bin/caddy reload --config /etc/caddy/Caddyfile
Restart=on-failure
TimeoutStopSec=5s
LimitNOFILE=1048576
# No StateDirectory/LogsDirectory/AmbientCapabilities here (not supported on AL2)

[Install]
WantedBy=multi-user.target
UNIT

sudo systemctl daemon-reload
sudo systemctl enable --now caddy

sleep 1
systemctl --no-pager --full status caddy || true
