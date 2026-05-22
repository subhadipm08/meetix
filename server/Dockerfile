# ---- Stage 1: Install dependencies ----
FROM node:20-alpine AS deps

WORKDIR /app

# Copy only package files first for better layer caching
COPY package.json package-lock.json ./

# Install production dependencies only (no devDependencies)
RUN npm ci --omit=dev --ignore-scripts && \
    npm cache clean --force

# ---- Stage 2: Production runtime ----
FROM node:20-alpine AS runtime

# Security: add a non-root user
RUN addgroup -g 1001 -S meetix && \
    adduser -S meetix -u 1001 -G meetix

WORKDIR /app

# Copy production node_modules from deps stage
COPY --from=deps --chown=meetix:meetix /app/node_modules ./node_modules

# Copy application source code
COPY --chown=meetix:meetix src ./src
COPY --chown=meetix:meetix public ./public
COPY --chown=meetix:meetix package.json ./

# Don't run as root
USER meetix

EXPOSE 8000

# Health check: lightweight curl-free check using Node
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "fetch('http://localhost:8000/api/v1/stats').then(r => { if (!r.ok) process.exit(1) }).catch(() => process.exit(1))"

CMD ["node", "src/server.js"]
