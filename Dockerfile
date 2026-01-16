# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./
COPY frontend/vite.config.js ./

# Install dependencies and build
RUN npm ci
COPY frontend/src ./src
COPY frontend/index.html ./
RUN npm run build

# Production stage
FROM caddy:latest

# Copy built files to Caddy's public directory
COPY --from=builder /app/dist /srv

# Copy Caddyfile
COPY Caddyfile /etc/caddy/Caddyfile

EXPOSE 80 443

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
