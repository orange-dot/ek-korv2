# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source
COPY . .

# Build
RUN npm run build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# Copy package files and install production deps
COPY package*.json ./
RUN npm install --production

# Copy built files
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 8000

# Run
CMD ["node", "dist/index.js"]
