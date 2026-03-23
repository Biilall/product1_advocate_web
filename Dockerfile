# # Build stage for frontend
# FROM node:20 AS frontend-build

# WORKDIR /app

# COPY package*.json ./
# RUN npm install

# COPY . .

# RUN npm run build

# # Production stage - run backend that serves frontend
# FROM node:20

# WORKDIR /app

# # Install dependencies
# COPY package*.json ./
# RUN npm install --production

# # Copy built frontend
# COPY --from=frontend-build /app/dist ./dist

# # Copy backend source
# COPY server ./server

# # Create uploads directory
# RUN mkdir -p uploads

# # Expose port 8080 for Cloud Run
# EXPOSE 8080

# # Run the backend server (which now serves both API and static files)
# CMD ["node", "--import", "tsx/esm", "server/server.ts"]

# Stage 1: Build frontend + compile backend TS
FROM node:20 AS builder

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies (including dev)
RUN npm install

# Copy all source
COPY . .

# Build frontend (Vite)
RUN npm run build

# Compile backend TS to JS
RUN npx tsc --project tsconfig.backend.json

# Stage 2: Production image
FROM node:20

WORKDIR /app

# Copy only production dependencies
COPY package*.json ./
RUN npm install --production

# Copy compiled frontend + backend
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server_build ./server_build

# Ensure uploads folder exists
RUN mkdir -p uploads

# Expose Cloud Run port
EXPOSE 8080

# Use compiled JS server
CMD ["node", "server_build/server.js"]