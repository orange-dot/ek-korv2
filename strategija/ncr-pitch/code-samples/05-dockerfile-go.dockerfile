# Example: Minimal Go Dockerfile
# Result: ~10-15 MB image (vs 400+ MB for JVM)

# Build stage
FROM golang:1.22-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /service ./cmd/service

# Runtime stage - literally empty base
FROM scratch

# Copy only the binary - no runtime, no shell, nothing
COPY --from=builder /service /service

# Optional: CA certificates for HTTPS
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

ENTRYPOINT ["/service"]

# Result:
# - Image size: ~10-15 MB
# - Attack surface: minimal (no shell, no package manager)
# - Startup time: milliseconds
# - No "works on my machine" - same binary everywhere
