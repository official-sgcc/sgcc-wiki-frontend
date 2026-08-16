# Nginx deployment configuration

`frontend.conf` is copied into the frontend Nginx image as
`/etc/nginx/conf.d/default.conf`. It serves the Vite build, falls back to
`index.html` for React Router, and forwards `/api/*` to the Compose service
named `backend` on port `8000`.

Build the frontend with the same-origin API path:

```bash
VITE_SERVER_URL=/api npm run build
```

Then package that already-built `dist` directory. The Docker build does not
run Node.js or rebuild the application:

```bash
docker build -f deploy/nginx/Dockerfile -t sgcc-wiki-frontend .
```

The frontend container should publish only to the loopback interface:

```yaml
ports:
  - "127.0.0.1:8080:80"
```

For a new server, copy `host-bootstrap.conf.example` into the server's Nginx
configuration directory and replace `wiki.example.com` with the production
domain. After the DNS record points to the server, obtain the first
certificate:

```bash
sudo mkdir -p /var/www/certbot
sudo nginx -t
sudo systemctl reload nginx
sudo certbot certonly --webroot -w /var/www/certbot -d wiki.example.com
```

Replace the bootstrap configuration with `host.conf.example`, update every
domain placeholder, and then validate and reload Nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

The backend must run with `FRONTEND_URL=https://<production-domain>`. Its
Uvicorn process must also trust forwarded headers only from the deployment's
known proxy network so logging and IP-based rate limiting use the client IP.
