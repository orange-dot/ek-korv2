# Edge AI Predictive Maintenance: TinyML Constraints Analysis

> **Topic:** Computational Constraints for On-Device ML on STM32G474
> **Version:** 1.0
> **Date:** January 2026
> **Status:** Paper-ready

---

## 1. Introduction

This document analyzes the computational constraints of running machine learning inference on the STM32G474 microcontroller used in EK3 modules. Understanding these constraints is essential for designing models that achieve good prediction accuracy within strict resource budgets.

---

## 2. Target Platform Specifications

### 2.1 STM32G474 Overview

```
STM32G474 SPECIFICATIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Core:
────────────────────────────────────────────
• Architecture: ARM Cortex-M4F
• Clock: 170 MHz maximum
• Pipeline: 3-stage
• FPU: Single-precision hardware FPU
• DSP: SIMD instructions (2×16-bit, 4×8-bit)

Memory:
────────────────────────────────────────────
• Flash: 512 KB
• SRAM: 128 KB (96 KB contiguous + 32 KB)
• CCM SRAM: 32 KB (tightly coupled, fast)

Peripherals (relevant):
────────────────────────────────────────────
• ADC: 5× 12-bit @ 4 MSPS
• Timers: Advanced motor control
• CAN-FD: 3× controllers
• DMA: 2× controllers, 16 channels total
```

### 2.2 Memory Map

```
MEMORY LAYOUT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FLASH (512 KB):
┌─────────────────────────────────────────┐ 0x0807_FFFF
│                                         │
│  ML Model Weights (100 KB max)          │ ← Quantized INT8
│                                         │
├─────────────────────────────────────────┤ 0x0806_7FFF
│                                         │
│  Application Code (~250 KB)             │
│  - RTOS kernel                          │
│  - Power control                        │
│  - Communication                        │
│  - Safety monitoring                    │
│                                         │
├─────────────────────────────────────────┤ 0x0802_0000
│  Bootloader (32 KB)                     │
└─────────────────────────────────────────┘ 0x0800_0000

SRAM (128 KB):
┌─────────────────────────────────────────┐ 0x2002_0000
│  Stack (8 KB)                           │
├─────────────────────────────────────────┤
│  Heap (16 KB)                           │
├─────────────────────────────────────────┤
│  ML Working Memory (20 KB max)          │ ← Activations, buffers
├─────────────────────────────────────────┤
│  Application Data (~40 KB)              │
├─────────────────────────────────────────┤
│  RTOS + Drivers (~24 KB)                │
└─────────────────────────────────────────┘ 0x2000_0000

CCM SRAM (32 KB): High-speed computation buffers
```

---

## 3. Computational Budget Analysis

### 3.1 Cycle Budget

```
INFERENCE CYCLE BUDGET:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Target inference time: T_inf = 10 ms
Clock frequency: f_clk = 170 MHz

Total cycles available:
────────────────────────────────────────────
C_total = T_inf × f_clk = 10 ms × 170 MHz = 1,700,000 cycles

Overhead deductions:
────────────────────────────────────────────
• Memory access stalls: ~10%     = 170,000 cycles
• Function call overhead: ~5%    = 85,000 cycles
• Data movement (DMA wait): ~5%  = 85,000 cycles
• Safety margin: ~10%            = 170,000 cycles

Net cycles for computation:
────────────────────────────────────────────
C_net = 1,190,000 cycles (~70% efficiency)
```

### 3.2 Operation Costs

```
OPERATION CYCLE COSTS (Cortex-M4F):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Floating Point (FP32):
────────────────────────────────────────────
Operation          | Cycles | Notes
───────────────────┼────────┼────────────────
FADD               | 1      | Pipelined
FMUL               | 1      | Pipelined
FMAC (a×b+c)       | 3      | Fused multiply-add
FDIV               | 14     | Avoid in hot path
FSQRT              | 14     | Avoid in hot path
FP comparison      | 1      |

Integer (INT8/INT16):
────────────────────────────────────────────
Operation          | Cycles | Notes
───────────────────┼────────┼────────────────
MUL (32-bit)       | 1      |
SMLAD (2×MAC)      | 1      | SIMD 2×16-bit MAC
Shift              | 1      |
Load/Store         | 2      | With cache miss: more

Activation Functions:
────────────────────────────────────────────
Function           | Cycles | Implementation
───────────────────┼────────┼────────────────
ReLU               | 1-2    | Max(0, x)
Sigmoid            | 20-50  | LUT or polynomial
Tanh               | 20-50  | LUT or polynomial
Softmax (n=4)      | ~100   | Exp + division
```

### 3.3 Maximum Model Capacity

```
MODEL CAPACITY ESTIMATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For INT8 quantized dense layer:
────────────────────────────────────────────
• MACs per inference: n_in × n_out
• Cycles per MAC: ~2 (SIMD optimized)
• Total cycles: 2 × n_in × n_out

Given C_net = 1,190,000 cycles:
• Max MACs: ~595,000 per inference

Example architectures that fit:
────────────────────────────────────────────

Architecture A (Small MLP):
• Input: 256 (16 features × 16 time steps)
• Dense 256 → 64:    16,384 MACs
• Dense 64 → 32:      2,048 MACs
• Dense 32 → 4:         128 MACs
• Total: 18,560 MACs → ~37,120 cycles ✓

Architecture B (Medium CNN):
• Input: 16 × 64 (features × time)
• Conv1D 16→32, k=3:  32×64×16×3 = 98,304 MACs
• Pool 2:             (no MACs)
• Conv1D 32→64, k=3:  64×32×32×3 = 196,608 MACs
• Pool 2:             (no MACs)
• Dense 64×16 → 4:    4,096 MACs
• Total: 299,008 MACs → ~598,016 cycles ✓

Architecture C (Tiny LSTM):
• Hidden size 32, sequence 64
• Per step: 4 × (32×16 + 32×32) = 6,144 MACs
• Total: 64 × 6,144 = 393,216 MACs → ~786,432 cycles ✓
  (But requires sequential execution)
```

---

## 4. Memory Constraints

### 4.1 Model Storage (Flash)

```
MODEL SIZE BUDGET:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total Flash: 512 KB
Application code: ~250 KB
Bootloader: 32 KB
Configuration: 10 KB
Reserved: 20 KB

Available for ML model: 200 KB
────────────────────────────────────────────
Target: 100 KB (leave headroom)

Model storage breakdown (INT8):
────────────────────────────────────────────
• Weights: 1 byte per parameter
• Biases: 4 bytes per output (INT32 accumulator)
• Quantization params: ~100 bytes per layer

Example (Architecture A):
• Dense 256→64: 256×64 + 64×4 = 16,640 bytes
• Dense 64→32:  64×32 + 32×4 = 2,176 bytes
• Dense 32→4:   32×4 + 4×4 = 144 bytes
• Overhead: ~500 bytes
• Total: ~19,460 bytes (~19 KB) ✓
```

### 4.2 Working Memory (RAM)

```
WORKING MEMORY BUDGET:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Available for ML: 20 KB

Memory components:
────────────────────────────────────────────

1. Input Buffer:
   • Size: features × window × dtype
   • Example: 16 × 64 × 1 = 1,024 bytes

2. Activation Buffers (ping-pong):
   • Need 2 buffers for layer I/O
   • Size: 2 × max(layer_output_size)
   • Example: 2 × 64 × 4 = 512 bytes (FP32 accum)

3. Intermediate Results:
   • Batch norm: 2 × layer_size (mean, var)
   • Softmax: layer_size

4. Output Buffer:
   • Size: output_dim × sizeof(float)
   • Example: 4 × 4 = 16 bytes

Total for Architecture A:
────────────────────────────────────────────
• Input: 1,024 bytes
• Activations: 512 bytes
• Intermediate: 256 bytes
• Output: 16 bytes
• Overhead: 200 bytes
• Total: ~2,008 bytes (~2 KB) ✓

Memory-Optimal Execution:
────────────────────────────────────────────
• Process layer-by-layer
• Reuse activation buffers
• Stream input if needed
```

### 4.3 Memory Access Patterns

```
MEMORY ACCESS OPTIMIZATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Cache behavior (ART Accelerator):
────────────────────────────────────────────
• 64 × 128-bit instruction cache lines
• Prefetch on sequential access
• ~0-wait state for cached access

Optimization strategies:
────────────────────────────────────────────

1. Weight Locality:
   • Store weights in row-major order
   • Sequential access patterns
   • Prefetch-friendly

2. Activation Reuse:
   • Tile computations for cache
   • Process in chunks fitting L1

3. DMA for Input:
   • Use DMA to load sensor data
   • Double-buffer for overlap
   • CPU free during transfer

4. CCM SRAM Usage:
   • Place hot buffers in CCM (32 KB)
   • Zero wait-state access
   • Ideal for activation ping-pong
```

---

## 5. Power Constraints

### 5.1 Power Budget

```
POWER ANALYSIS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STM32G474 Power Consumption:
────────────────────────────────────────────
Mode              | Current  | Power @3.3V
──────────────────┼──────────┼─────────────
Run 170 MHz       | 50 mA    | 165 mW
Run 80 MHz        | 25 mA    | 83 mW
Sleep             | 3 mA     | 10 mW
Stop 0            | 12 μA    | 40 μW
Stop 1            | 5 μA     | 17 μW

ML Inference Power:
────────────────────────────────────────────
• Inference duration: 10 ms
• Inference rate: 1 Hz (once per second)
• Duty cycle: 1%

Average power (inference):
P_avg = P_run × duty + P_sleep × (1 - duty)
P_avg = 165 mW × 0.01 + 10 mW × 0.99
P_avg ≈ 11.6 mW

Energy per inference:
E_inf = P_run × T_inf = 165 mW × 10 ms = 1.65 mJ
```

### 5.2 Thermal Implications

```
THERMAL ANALYSIS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Self-heating during inference:
────────────────────────────────────────────
• Short duration (10 ms) - negligible
• Thermal time constant >> inference time
• No throttling required

Continuous inference scenario:
────────────────────────────────────────────
• At 10 Hz: P_avg ≈ 26.5 mW
• Θ_JA ≈ 40 °C/W (typical QFP)
• ΔT ≈ 1.1 °C above ambient
• Within safe operating range
```

---

## 6. Quantization Strategy

### 6.1 Quantization Schemes

```
QUANTIZATION OPTIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Full Precision (FP32):
────────────────────────────────────────────
• 4 bytes per parameter
• Native FPU support
• No accuracy loss
• 4× larger models
• Moderate speed

INT8 Quantization (Recommended):
────────────────────────────────────────────
• 1 byte per parameter
• SIMD acceleration (4×)
• 1-2% accuracy loss typical
• 4× smaller models
• Fastest inference

Quantization formula:
x_q = round(x_f / scale) + zero_point

where:
• scale = (x_max - x_min) / 255
• zero_point = -round(x_min / scale)

INT4 Quantization (Experimental):
────────────────────────────────────────────
• 0.5 bytes per parameter
• 8× smaller models
• 3-5% accuracy loss
• Complex unpacking
• Not recommended for Cortex-M4
```

### 6.2 Quantization-Aware Training

```
QUANTIZATION-AWARE TRAINING (QAT):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Training procedure:
────────────────────────────────────────────

1. Train FP32 model normally
2. Insert fake quantization nodes:

   x_q = Q(x) = scale × (round(x / scale + zp) - zp)

3. Fine-tune with quantization noise
4. Export quantized weights

Benefits:
• Model learns to be robust to quantization
• Better accuracy than post-training quantization
• Especially important for small models

Implementation:
────────────────────────────────────────────
# TensorFlow Lite example
converter = tf.lite.TFLiteConverter.from_saved_model(model_path)
converter.optimizations = [tf.lite.Optimize.DEFAULT]
converter.target_spec.supported_ops = [tf.lite.OpsSet.TFLITE_BUILTINS_INT8]
converter.inference_input_type = tf.int8
converter.inference_output_type = tf.int8
tflite_model = converter.convert()
```

---

## 7. Supported Operations

### 7.1 TFLite Micro Operator Support

```
SUPPORTED OPERATORS (STM32):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Fully Supported (Optimized):
────────────────────────────────────────────
□ FULLY_CONNECTED (Dense)
□ CONV_2D (Conv1D via reshape)
□ DEPTHWISE_CONV_2D
□ AVERAGE_POOL_2D
□ MAX_POOL_2D
□ RESHAPE
□ SOFTMAX
□ ADD, MUL (elementwise)

Partially Supported:
────────────────────────────────────────────
△ LSTM (unrolled, high memory)
△ GRU (unrolled, high memory)
△ BATCH_NORMALIZATION (fused preferred)

Not Recommended:
────────────────────────────────────────────
✗ Attention mechanisms
✗ Transformer blocks
✗ Dynamic shapes
✗ String operations
```

### 7.2 CMSIS-NN Optimizations

```
CMSIS-NN ACCELERATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CMSIS-NN provides optimized kernels:
────────────────────────────────────────────

arm_fully_connected_s8():
• INT8 dense layer
• SIMD acceleration
• ~4× faster than naive

arm_convolve_s8():
• INT8 convolution
• Im2col + GEMM
• Optimized for small kernels

arm_relu_q7():
• Vectorized ReLU
• 4 elements per cycle

Performance gains vs. reference:
────────────────────────────────────────────
Operation          | Speedup
───────────────────┼─────────
Dense (256×64)     | 3.8×
Conv1D (3×3, 32)   | 4.2×
ReLU (256)         | 3.5×
MaxPool (2×2)      | 2.1×
```

---

## 8. Model Architecture Recommendations

### 8.1 Recommended Architectures

```
ARCHITECTURE RECOMMENDATIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tier 1: Minimal (< 5 KB model, < 2 ms inference)
────────────────────────────────────────────
• Small MLP: 256 → 32 → 4
• Parameters: ~8,500
• Use case: Simple anomaly detection

Tier 2: Standard (< 20 KB model, < 5 ms inference)
────────────────────────────────────────────
• MLP: 256 → 64 → 32 → 4
• 1D CNN: Conv(32,3) → Pool → Conv(64,3) → Dense(4)
• Parameters: ~20,000
• Use case: RUL classification

Tier 3: Advanced (< 50 KB model, < 10 ms inference)
────────────────────────────────────────────
• Deep CNN: 3× Conv blocks + Dense
• Tiny LSTM: hidden=32, unrolled
• Parameters: ~50,000
• Use case: Probabilistic RUL

Tier 4: Maximum (< 100 KB model, ~10 ms inference)
────────────────────────────────────────────
• ResNet-like with skip connections
• Multi-head output (HI + RUL + anomaly)
• Parameters: ~100,000
• Use case: Full predictive maintenance
```

### 8.2 Architecture Search Space

```
NEURAL ARCHITECTURE SEARCH (NAS) SPACE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Search dimensions:
────────────────────────────────────────────

1. Number of layers: L ∈ {2, 3, 4, 5}

2. Layer types:
   • Dense: width ∈ {16, 32, 64, 128}
   • Conv1D: filters ∈ {16, 32, 64}, kernel ∈ {3, 5, 7}
   • Pool: size ∈ {2, 4}

3. Activations:
   • ReLU (preferred)
   • ReLU6 (bounded)
   • Swish (if cycles permit)

4. Skip connections: {none, residual}

5. Normalization: {none, batch_norm_fused}

Constraints encoded:
────────────────────────────────────────────
• Total parameters ≤ 100,000
• Total MACs ≤ 500,000
• Peak activation memory ≤ 10 KB
```

---

## 9. Deployment Considerations

### 9.1 Model Deployment Pipeline

```
DEPLOYMENT PIPELINE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. TRAINING (Cloud/PC)
   ┌─────────────────────────────────────┐
   │ • Train FP32 model (PyTorch/TF)    │
   │ • Quantization-aware fine-tuning   │
   │ • Validation on held-out data      │
   └─────────────────────────────────────┘
              ↓
2. CONVERSION
   ┌─────────────────────────────────────┐
   │ • Export to TFLite format          │
   │ • INT8 quantization                │
   │ • Validate accuracy post-quant     │
   └─────────────────────────────────────┘
              ↓
3. OPTIMIZATION
   ┌─────────────────────────────────────┐
   │ • Generate C arrays (xxd)          │
   │ • Link with CMSIS-NN               │
   │ • Profile on target hardware       │
   └─────────────────────────────────────┘
              ↓
4. INTEGRATION
   ┌─────────────────────────────────────┐
   │ • Integrate with RTOS task         │
   │ • Set up input preprocessing       │
   │ • Configure output handling        │
   └─────────────────────────────────────┘
              ↓
5. VALIDATION
   ┌─────────────────────────────────────┐
   │ • On-target accuracy verification  │
   │ • Timing verification              │
   │ • Memory usage verification        │
   └─────────────────────────────────────┘
```

### 9.2 Runtime Integration

```
RTOS INTEGRATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Task configuration:
────────────────────────────────────────────
• Task priority: Low (background)
• Stack size: 2 KB
• Period: 1 Hz (configurable)

Pseudocode:
────────────────────────────────────────────
void ML_InferenceTask(void *arg) {
    // Initialize TFLite interpreter
    static tflite::MicroInterpreter interpreter(...);

    while (1) {
        // Wait for trigger (timer or event)
        xSemaphoreTake(inference_trigger, portMAX_DELAY);

        // Prepare input (copy from sensor buffer)
        memcpy(input_buffer, sensor_history, INPUT_SIZE);

        // Run inference
        uint32_t start = DWT->CYCCNT;
        interpreter.Invoke();
        uint32_t cycles = DWT->CYCCNT - start;

        // Process output
        float* output = interpreter.output(0)->data.f;
        process_prediction(output);

        // Report timing
        if (cycles > CYCLE_BUDGET) {
            log_warning("Inference exceeded budget");
        }
    }
}
```

---

## 10. Constraint Summary Table

| Constraint | Value | Notes |
|------------|-------|-------|
| Model size | ≤ 100 KB | Flash storage |
| Working RAM | ≤ 20 KB | Activations + buffers |
| Inference time | ≤ 10 ms | @ 170 MHz |
| Inference cycles | ≤ 1.7M | After overhead |
| Net compute cycles | ≤ 1.19M | 70% efficiency |
| Max MACs | ~500K | INT8 SIMD |
| Max parameters | ~100K | INT8 quantized |
| Power (average) | ≤ 15 mW | At 1 Hz inference |
| Input window | ≤ 256 samples | 2.56s @ 100 Hz |
| Output latency | ≤ 100 ms | Including preprocessing |

---

## Related Documents

- `01-problem-formulation.md` - Problem definition
- `03-algorithms.md` - Algorithm implementations
- `04-data-pipeline.md` - Data preprocessing
- `05-literature.md` - TinyML literature
