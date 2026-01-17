# JEZGRO Docker Test Makefile
# Quick commands for Docker-based testing

.PHONY: build test shell renode clean

IMAGE_NAME := jezgro-test
CONTAINER_NAME := jezgro-test

# Build Docker image
build:
	docker build -t $(IMAGE_NAME) ..

# Run all tests
test: build
	docker run --rm --name $(CONTAINER_NAME) $(IMAGE_NAME)

# Interactive shell
shell: build
	docker run --rm -it --name $(CONTAINER_NAME) $(IMAGE_NAME) /bin/bash

# Interactive Renode session
renode: build
	docker run --rm -it --name $(CONTAINER_NAME) $(IMAGE_NAME) \
		renode --console --disable-xwt -e " \
			mach create; \
			machine LoadPlatformDescription @/jezgro/renode/stm32g474-minimal.repl; \
			sysbus LoadELF @/jezgro/build-arm/jezgro_firmware; \
			start"

# Run single test (usage: make single-test TEST_NAME="Boot")
single-test: build
	docker run --rm --name $(CONTAINER_NAME) $(IMAGE_NAME) \
		renode-test --variable FIRMWARE:@/jezgro/build-arm/jezgro_firmware \
		/jezgro/tests/jezgro.robot --test "$(TEST_NAME)"

# Clean up
clean:
	docker rmi $(IMAGE_NAME) 2>/dev/null || true
	docker rm -f $(CONTAINER_NAME) 2>/dev/null || true

# Show firmware size
size: build
	docker run --rm $(IMAGE_NAME) arm-none-eabi-size /jezgro/build-arm/jezgro_firmware

# Help
help:
	@echo "JEZGRO Docker Test Commands:"
	@echo "  make build    - Build Docker image"
	@echo "  make test     - Run all tests"
	@echo "  make shell    - Interactive shell"
	@echo "  make renode   - Interactive Renode"
	@echo "  make size     - Show firmware size"
	@echo "  make clean    - Remove Docker image"
