FROM node:20-alpine AS base
WORKDIR /app
RUN npm install -g npm@latest

FROM base AS backend-deps
COPY backend/package.json ./backend/package.json
WORKDIR /app/backend
RUN npm install

FROM base AS frontend-deps
COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
RUN npm install

FROM base AS backend-builder
COPY --from=backend-deps /app/backend/node_modules ./node_modules
COPY backend/ ./backend/
WORKDIR /app/backend
RUN npm run build

FROM base AS frontend-builder
COPY --from=frontend-deps /app/frontend/node_modules ./node_modules
COPY frontend/ ./frontend/
WORKDIR /app/frontend
RUN npm run build

FROM node:20-alpine AS backend-runtime
WORKDIR /app/backend
ENV NODE_ENV=production
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/node_modules ./node_modules
COPY --from=backend-builder /app/backend/package.json ./package.json
EXPOSE 5000
CMD ["node", "dist/server.js"]

FROM node:20-alpine AS frontend-runtime
WORKDIR /app/frontend
ENV NODE_ENV=production
COPY --from=frontend-builder /app/frontend/dist ./dist
COPY --from=frontend-builder /app/frontend/node_modules ./node_modules
COPY --from=frontend-builder /app/frontend/package.json ./package.json
RUN npm install -g serve
EXPOSE 80
CMD ["serve", "-s", "dist", "-l", "80"]
