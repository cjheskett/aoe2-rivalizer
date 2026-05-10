# Stage 1: build React client
FROM node:20-alpine AS client-builder
WORKDIR /build
COPY web/client/package*.json ./
RUN npm ci
COPY web/client/ ./
RUN npm run build

# Stage 2: production server
FROM node:20-alpine
WORKDIR /app
COPY web/package*.json ./
RUN npm ci
COPY web/ ./
COPY --from=client-builder /build/dist ./client/dist

EXPOSE 3001
CMD ["node", "server.js"]
