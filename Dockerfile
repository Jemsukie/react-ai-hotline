# Multi-stage Dockerfile for AI Hotline Application
# Stage 1: Build React frontend
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and Yarn config
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/ ./.yarn/

# Install dependencies
RUN yarn install --immutable

# Copy source code
COPY . .

# Build React app
RUN yarn build

# Stage 2: Production runtime
FROM node:20-alpine

WORKDIR /app

# Copy package files and Yarn config
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/ ./.yarn/

# Install dependencies for runtime
RUN yarn install --immutable

# Copy backend server (Docker version that serves React app)
COPY backend-server-docker.js ./

# Copy built React app from builder stage
COPY --from=builder /app/build ./build

# Create logs directory
RUN mkdir -p logs

# Expose port 4000 (backend API + serves React app)
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start backend server (serves both API and React app)
CMD ["node", "backend-server-docker.js"]
