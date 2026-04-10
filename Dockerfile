# Stage 1: Build the frontend
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependency files first for better caching
COPY pucho-dashboard/package*.json ./pucho-dashboard/
RUN cd pucho-dashboard && npm install

# Copy source and build
COPY pucho-dashboard/ ./pucho-dashboard/
RUN cd pucho-dashboard && npm run build

# Stage 2: Production Server
FROM node:20-alpine AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=5001

# Copy package files for the server
COPY --from=builder /app/pucho-dashboard/package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy built assets and server logic
COPY --from=builder /app/pucho-dashboard/dist ./dist
COPY --from=builder /app/pucho-dashboard/server.cjs ./server.cjs

# Expose the application port
EXPOSE 5001

# Start the bridge server
# We use node server.cjs to serve the frontend and handle API webhooks
CMD ["node", "server.cjs"]
