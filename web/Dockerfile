# Build stage
FROM node:20-alpine AS builder

# Copy all source (including tehnika for markdown imports)
COPY . /project
WORKDIR /project/web

# Install dependencies fresh in container
RUN rm -rf node_modules package-lock.json && npm install

# Build
RUN npm run build

# Runtime stage - nginx for static files
FROM nginx:alpine

# Copy custom nginx config
COPY web/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files
COPY --from=builder /project/web/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Run nginx
CMD ["nginx", "-g", "daemon off;"]
