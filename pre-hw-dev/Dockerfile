# JEZGRO RTOS - Renode Test Environment
# Build and test firmware in Docker with ARM toolchain + Renode
#
# Build:   docker build -t jezgro-test .
# Run:     docker run --rm jezgro-test
# Shell:   docker run --rm -it jezgro-test /bin/bash

FROM antmicro/renode:latest

LABEL maintainer="Elektrokombinacija"
LABEL description="JEZGRO RTOS build and test environment"

# Install build dependencies
RUN apt-get update && apt-get install -y \
    cmake \
    ninja-build \
    gcc-arm-none-eabi \
    libnewlib-arm-none-eabi \
    && rm -rf /var/lib/apt/lists/*

# Create working directory
WORKDIR /jezgro

# Copy project files
COPY cmake/ cmake/
COPY include/ include/
COPY src/ src/
COPY renode/ renode/
COPY CMakeLists.txt .
COPY tests/ tests/

# Build ARM firmware
RUN mkdir -p build-arm && \
    cd build-arm && \
    cmake -DCMAKE_TOOLCHAIN_FILE=../cmake/arm-none-eabi.cmake -G Ninja .. && \
    cmake --build . && \
    echo "Build complete:" && \
    arm-none-eabi-size jezgro_firmware

# Copy test runner script
COPY docker/run-tests.sh /usr/local/bin/run-tests
RUN chmod +x /usr/local/bin/run-tests

# Default: run all tests
CMD ["run-tests"]
