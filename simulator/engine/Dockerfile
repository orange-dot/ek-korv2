# Build stage
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Install dependencies
RUN apk add --no-cache git

# Copy go mod files
COPY go.mod ./
RUN go mod download

# Copy source
COPY . .

# Tidy and build
RUN go mod tidy && CGO_ENABLED=0 GOOS=linux go build -o /simulator ./cmd/simulator

# Runtime stage
FROM alpine:3.19

WORKDIR /app

# Copy binary
COPY --from=builder /simulator .

# Run
CMD ["./simulator"]
