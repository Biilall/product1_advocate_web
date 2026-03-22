# Build stage for frontend
FROM node:20 AS frontend-build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# Production stage - run backend that serves frontend
FROM node:20

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Copy built frontend
COPY --from=frontend-build /app/dist ./dist

# Copy backend source
COPY server ./server

# Create uploads directory
RUN mkdir -p uploads

# Expose port 8080 for Cloud Run
EXPOSE 8080

# Run the backend server (which now serves both API and static files)
CMD ["node", "--import", "tsx/esm", "server/server.ts"]