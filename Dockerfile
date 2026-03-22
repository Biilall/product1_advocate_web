# Build stage for frontend
FROM node:18-alpine AS frontend-build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# Production stage - run both frontend and backend
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Copy built frontend
COPY --from=frontend-build /app/dist ./dist

# Copy backend source
COPY server ./server

# Install serve for frontend
RUN npm install -g serve

# Expose both ports
EXPOSE 8080 3001

# Run both frontend and backend
CMD ["sh", "-c", "serve -s dist -l 8080 & node --import tsx/esm server/server.ts"]