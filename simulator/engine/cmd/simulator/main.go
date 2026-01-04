package main

import (
	"log"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	"github.com/elektrokombinacija/simulator/internal/engine"
)

func main() {
	log.Println("EK Simulator Engine starting...")

	// Configuration from environment
	cfg := engine.DefaultConfig()

	if url := os.Getenv("REDIS_URL"); url != "" {
		cfg.RedisURL = url
	}

	if rate := os.Getenv("TICK_RATE"); rate != "" {
		if d, err := time.ParseDuration(rate); err == nil {
			cfg.TickRate = d
		}
	}

	if scale := os.Getenv("TIME_SCALE"); scale != "" {
		if s, err := strconv.ParseFloat(scale, 64); err == nil {
			cfg.TimeScale = s
		}
	}

	if count := os.Getenv("MODULE_COUNT"); count != "" {
		if c, err := strconv.Atoi(count); err == nil {
			cfg.ModuleCount = c
		}
	}

	if count := os.Getenv("BUS_COUNT"); count != "" {
		if c, err := strconv.Atoi(count); err == nil {
			cfg.BusCount = c
		}
	}

	log.Printf("Configuration: TickRate=%v, TimeScale=%.1f, Modules=%d, Buses=%d",
		cfg.TickRate, cfg.TimeScale, cfg.ModuleCount, cfg.BusCount)

	// Create simulation
	sim, err := engine.NewSimulation(cfg)
	if err != nil {
		log.Fatalf("Failed to create simulation: %v", err)
	}
	defer sim.Close()

	// Start simulation
	sim.Start()

	// Handle shutdown signals
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	log.Println("Simulation running. Press Ctrl+C to stop.")

	// Wait for shutdown signal
	<-sigChan
	log.Println("Shutting down...")

	sim.Stop()
	log.Println("Simulation stopped.")
}
