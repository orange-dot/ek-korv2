# Edge AI Predictive Maintenance: Algorithm Catalog

> **Topic:** TinyML Algorithms for On-Device RUL Prediction
> **Version:** 1.0
> **Date:** January 2026
> **Status:** Paper-ready

---

## 1. Introduction

This document presents algorithmic approaches for predictive maintenance on resource-constrained embedded devices. Each algorithm includes architecture details, pseudocode, complexity analysis, and TinyML-specific optimizations.

---

## 2. Algorithm Overview

```
ALGORITHM TAXONOMY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SUPERVISED LEARNING              UNSUPERVISED / SELF-SUPERVISED
├── MLP Regressor                ├── Autoencoder Anomaly
├── 1D CNN                       ├── Isolation Forest (Edge)
├── Temporal Conv Network        └── One-Class SVM
├── Tiny LSTM/GRU
└── Knowledge Distillation       ONLINE LEARNING
                                 ├── Incremental SGD
ENSEMBLE METHODS                 ├── Online Random Forest
├── Random Forest (Tiny)         └── Elastic Weight Consolidation
└── Gradient Boosted Trees
                                 FEDERATED LEARNING
                                 ├── FedAvg
                                 └── FedProx
```

---

## 3. Supervised Learning Algorithms

### 3.1 Tiny MLP for RUL Regression

```
ALGORITHM: TinyMLP-RUL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Architecture:
────────────────────────────────────────────
Input: x ∈ ℝ^(d×w)  [d features × w timesteps]
       Flatten to ℝ^(d×w)

Layer 1: Dense(d×w, h₁) + ReLU
Layer 2: Dense(h₁, h₂) + ReLU
Layer 3: Dense(h₂, 1)  [RUL output]

Recommended sizes:
• d = 16, w = 16: input_dim = 256
• h₁ = 64, h₂ = 32
• Total parameters: 256×64 + 64×32 + 32×1 = 18,496

PSEUDOCODE:
────────────────────────────────────────────
def tiny_mlp_forward(x, weights):
    """
    x: input tensor, shape (batch, d*w)
    weights: {W1, b1, W2, b2, W3, b3}
    """
    # Layer 1
    h1 = relu(matmul(x, W1) + b1)  # (batch, 64)

    # Layer 2
    h2 = relu(matmul(h1, W2) + b2)  # (batch, 32)

    # Output layer
    rul = matmul(h2, W3) + b3  # (batch, 1)

    return rul

def relu(x):
    return max(0, x)  # Elementwise

INT8 IMPLEMENTATION:
────────────────────────────────────────────
// CMSIS-NN optimized dense layer
arm_fully_connected_s8(
    input,        // INT8 input
    weights,      // INT8 weights
    input_dims,   // {batch, input_size}
    weights_dims, // {output_size, input_size}
    bias,         // INT32 bias
    output_shift, // Requantization shift
    output_mult,  // Requantization multiplier
    output_offset,// Output zero point
    output        // INT8 output
);
```

**Complexity Analysis:**
| Metric | Value |
|--------|-------|
| Parameters | 18,496 |
| MACs | 18,496 |
| Cycles (INT8) | ~37,000 |
| Inference time | ~0.2 ms |
| Model size | ~19 KB |

---

### 3.2 1D Convolutional Network

```
ALGORITHM: TinyCNN-1D
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Architecture:
────────────────────────────────────────────
Input: x ∈ ℝ^(d×w)  [d channels × w timesteps]

Block 1:
  Conv1D(d, 32, kernel=3, stride=1, pad='same')
  BatchNorm + ReLU
  MaxPool1D(pool_size=2)

Block 2:
  Conv1D(32, 64, kernel=3, stride=1, pad='same')
  BatchNorm + ReLU
  MaxPool1D(pool_size=2)

Block 3:
  Conv1D(64, 64, kernel=3, stride=1, pad='same')
  BatchNorm + ReLU
  GlobalAveragePool1D

Head:
  Dense(64, 1)  [RUL output]

For d=16, w=64:
• After Block 1: 32 × 32
• After Block 2: 64 × 16
• After Block 3: 64 × 1 (GAP)
• Output: 1

PSEUDOCODE:
────────────────────────────────────────────
def tiny_cnn_forward(x, params):
    """
    x: input tensor, shape (batch, channels, length)
    params: conv weights, bn params, dense weights
    """
    # Block 1
    h = conv1d(x, params.conv1_w, stride=1, pad='same')
    h = batch_norm(h, params.bn1)
    h = relu(h)
    h = max_pool1d(h, pool_size=2)

    # Block 2
    h = conv1d(h, params.conv2_w, stride=1, pad='same')
    h = batch_norm(h, params.bn2)
    h = relu(h)
    h = max_pool1d(h, pool_size=2)

    # Block 3
    h = conv1d(h, params.conv3_w, stride=1, pad='same')
    h = batch_norm(h, params.bn3)
    h = relu(h)
    h = global_avg_pool(h)

    # Output
    rul = dense(h, params.dense_w, params.dense_b)

    return rul

BATCH NORM FUSION:
────────────────────────────────────────────
# At deployment, fuse BN into conv weights:
W_fused = W * (gamma / sqrt(var + eps))
b_fused = beta - mean * gamma / sqrt(var + eps)

# Eliminates BN computation at inference
```

**Complexity Analysis:**
| Metric | Value |
|--------|-------|
| Parameters | ~25,000 |
| MACs | ~250,000 |
| Cycles (INT8) | ~500,000 |
| Inference time | ~3 ms |
| Model size | ~25 KB |

---

### 3.3 Temporal Convolutional Network (TCN)

```
ALGORITHM: TinyTCN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Architecture:
────────────────────────────────────────────
Dilated causal convolutions for temporal modeling

TCN Block (repeated):
  CausalConv1D(in_ch, out_ch, kernel=3, dilation=d)
  ReLU
  Dropout (training only)
  CausalConv1D(out_ch, out_ch, kernel=3, dilation=d)
  ReLU
  Residual connection (if in_ch == out_ch)

Stack:
  Block 1: dilation=1, channels=16→32
  Block 2: dilation=2, channels=32→32
  Block 3: dilation=4, channels=32→32
  Dense: 32→1

Receptive field with 3 blocks:
  RF = 1 + Σᵢ (kernel-1) × dilationᵢ
  RF = 1 + 2×1 + 2×2 + 2×4 = 15 timesteps

CAUSAL CONVOLUTION:
────────────────────────────────────────────
# Pad only on left side (causal)
def causal_conv1d(x, w, dilation):
    pad_size = (kernel_size - 1) * dilation
    x_padded = pad_left(x, pad_size)
    return conv1d(x_padded, w, dilation=dilation)

# Ensures output[t] depends only on input[0:t]

DILATED CONVOLUTION:
────────────────────────────────────────────
# Standard conv with gaps between filter elements
# dilation=2: filter taps at positions 0, 2, 4
# Exponentially increasing receptive field
```

**Complexity Analysis:**
| Metric | Value |
|--------|-------|
| Parameters | ~15,000 |
| MACs | ~150,000 |
| Cycles (INT8) | ~300,000 |
| Inference time | ~2 ms |
| Model size | ~15 KB |

**Advantages:**
- Parallelizable (unlike RNN)
- Stable gradients
- Flexible receptive field
- Efficient on MCU

---

### 3.4 Tiny LSTM/GRU

```
ALGORITHM: TinyLSTM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Architecture:
────────────────────────────────────────────
Input: x ∈ ℝ^(T×d)  [T timesteps × d features]
Hidden size: h = 32

LSTM equations (per timestep):
  fₜ = σ(Wf·[hₜ₋₁, xₜ] + bf)   # Forget gate
  iₜ = σ(Wi·[hₜ₋₁, xₜ] + bi)   # Input gate
  c̃ₜ = tanh(Wc·[hₜ₋₁, xₜ] + bc) # Candidate
  cₜ = fₜ ⊙ cₜ₋₁ + iₜ ⊙ c̃ₜ      # Cell state
  oₜ = σ(Wo·[hₜ₋₁, xₜ] + bo)   # Output gate
  hₜ = oₜ ⊙ tanh(cₜ)           # Hidden state

Output: Dense(h, 1) applied to final hₜ

UNROLLED IMPLEMENTATION:
────────────────────────────────────────────
def tiny_lstm_forward(x_seq, params):
    """
    x_seq: input sequence, shape (T, d)
    params: LSTM weights and biases
    """
    T, d = x_seq.shape
    h = params.h_size

    # Initialize states
    h_t = zeros(h)
    c_t = zeros(h)

    # Process sequence
    for t in range(T):
        x_t = x_seq[t]

        # Concatenate input and hidden
        concat = concatenate(h_t, x_t)  # (h + d,)

        # Gates (combined for efficiency)
        gates = matmul(concat, params.W_gates) + params.b_gates

        # Split gates
        f_t = sigmoid(gates[0:h])
        i_t = sigmoid(gates[h:2*h])
        c_tilde = tanh(gates[2*h:3*h])
        o_t = sigmoid(gates[3*h:4*h])

        # Update states
        c_t = f_t * c_t + i_t * c_tilde
        h_t = o_t * tanh(c_t)

    # Final output
    rul = matmul(h_t, params.W_out) + params.b_out

    return rul

SIGMOID/TANH APPROXIMATIONS:
────────────────────────────────────────────
# LUT-based (256 entries, INT8)
sigmoid_lut = [sigmoid(i/32 - 4) for i in range(256)]

def sigmoid_lut(x):
    idx = clamp(x * 32 + 128, 0, 255)
    return sigmoid_lut[int(idx)]

# Piecewise linear (faster, less accurate)
def sigmoid_pwl(x):
    if x < -4: return 0
    if x > 4: return 1
    return 0.5 + 0.25 * clamp(x, -2, 2)
```

**Complexity Analysis:**
| Metric | Value |
|--------|-------|
| Parameters | 4×(h×(h+d)+h) + h×1 ≈ 6,000 |
| MACs per step | 4×h×(h+d) ≈ 6,144 |
| MACs total (T=64) | ~393,000 |
| Cycles (INT8) | ~800,000 |
| Inference time | ~5 ms |
| Model size | ~6 KB |

**Note:** LSTM is sequential and cannot be parallelized. Consider TCN for similar accuracy with better MCU performance.

---

### 3.5 Knowledge Distillation

```
ALGORITHM: Knowledge Distillation for TinyML
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Concept:
────────────────────────────────────────────
Train a large "teacher" model, then train a
small "student" model to mimic the teacher.

Teacher: Large LSTM or Transformer (cloud)
Student: Tiny MLP or CNN (edge)

DISTILLATION LOSS:
────────────────────────────────────────────
L_distill = α × L_hard + (1-α) × L_soft

L_hard = MSE(student(x), y_true)  # Ground truth

L_soft = MSE(student(x), teacher(x))  # Teacher output

# Temperature scaling for softer distributions
L_soft_temp = KL(softmax(s/T), softmax(t/T)) × T²

Typical: α = 0.5, T = 3.0

TRAINING PROCEDURE:
────────────────────────────────────────────
1. Train teacher model on full dataset
   • Teacher: 3-layer LSTM, hidden=256
   • Training: Cloud GPU, full precision

2. Generate soft labels
   • Run teacher on training data
   • Store teacher predictions

3. Train student with distillation
   • Student: TinyMLP or TinyCNN
   • Loss: α × MSE(pred, true) + (1-α) × MSE(pred, teacher_pred)

4. Quantize student model
   • Quantization-aware fine-tuning
   • INT8 export

PSEUDOCODE:
────────────────────────────────────────────
def distillation_training(teacher, student, data, alpha=0.5):
    for x, y_true in data:
        # Teacher prediction (no gradient)
        with torch.no_grad():
            y_teacher = teacher(x)

        # Student prediction
        y_student = student(x)

        # Combined loss
        loss_hard = mse_loss(y_student, y_true)
        loss_soft = mse_loss(y_student, y_teacher)
        loss = alpha * loss_hard + (1 - alpha) * loss_soft

        # Backprop
        loss.backward()
        optimizer.step()
```

**Benefits:**
- Student achieves 90-95% of teacher accuracy
- 10-100× smaller model
- Transfers "dark knowledge" (uncertainty, relationships)

---

## 4. Anomaly Detection Algorithms

### 4.1 Tiny Autoencoder

```
ALGORITHM: TinyAutoencoder
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Architecture:
────────────────────────────────────────────
Encoder:
  Dense(input_dim, 64) + ReLU
  Dense(64, 16) + ReLU       # Bottleneck

Decoder:
  Dense(16, 64) + ReLU
  Dense(64, input_dim)       # Reconstruction

Training: MSE on healthy data only
Inference: High reconstruction error = anomaly

ANOMALY SCORE:
────────────────────────────────────────────
def anomaly_score(x, encoder, decoder, threshold):
    """
    x: input window
    Returns: anomaly_score, is_anomaly
    """
    # Encode-decode
    z = encoder(x)
    x_recon = decoder(z)

    # Reconstruction error
    mse = mean((x - x_recon) ** 2)

    # Normalize to [0, 1]
    score = sigmoid((mse - threshold) / scale)

    # Decision
    is_anomaly = score > 0.5

    return score, is_anomaly

# Threshold calibration:
# Set threshold at 99th percentile of healthy data MSE

HEALTH INDEX FROM AUTOENCODER:
────────────────────────────────────────────
HI(t) = 1 - clip(anomaly_score(x_t), 0, 1)

# HI = 1.0: Healthy (low reconstruction error)
# HI = 0.0: Degraded (high reconstruction error)
```

**Complexity Analysis:**
| Metric | Value |
|--------|-------|
| Parameters | ~18,000 |
| MACs | ~18,000 |
| Inference time | ~0.2 ms |
| Model size | ~18 KB |

---

### 4.2 Isolation Forest (Edge-Optimized)

```
ALGORITHM: TinyIsolationForest
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Concept:
────────────────────────────────────────────
Anomalies are isolated with fewer random splits.
Normal points require more splits.

Tree structure (memory-efficient):
────────────────────────────────────────────
// Each node: feature index + threshold
struct IForestNode {
    uint8_t feature;    // Feature to split
    int16_t threshold;  // Split threshold (quantized)
    uint8_t left;       // Left child index
    uint8_t right;      // Right child index
};

// Tree: array of nodes
// Max 255 nodes per tree (uint8_t indices)

INFERENCE:
────────────────────────────────────────────
def path_length(x, tree, max_depth):
    """
    Compute path length for sample x in tree.
    """
    node = 0  # Start at root
    depth = 0

    while depth < max_depth and not is_leaf(tree[node]):
        feat = tree[node].feature
        thresh = tree[node].threshold

        if x[feat] < thresh:
            node = tree[node].left
        else:
            node = tree[node].right

        depth += 1

    return depth

def anomaly_score(x, forest, n_trees, max_depth):
    """
    Compute ensemble anomaly score.
    """
    total_length = 0

    for t in range(n_trees):
        total_length += path_length(x, forest[t], max_depth)

    avg_length = total_length / n_trees

    # Normalize (c(n) is average path length in unsuccessful BST search)
    c_n = 2 * (log(n_samples - 1) + 0.5772) - 2 * (n_samples - 1) / n_samples
    score = 2 ** (-avg_length / c_n)

    return score

EDGE OPTIMIZATIONS:
────────────────────────────────────────────
• Fixed tree depth (max 8)
• Quantized thresholds (INT16)
• Compact node representation (4 bytes)
• 10 trees × 255 nodes × 4 bytes = 10 KB
```

**Complexity Analysis:**
| Metric | Value |
|--------|-------|
| Parameters | ~10 KB (10 trees) |
| Operations | ~800 comparisons |
| Inference time | ~0.1 ms |

---

## 5. Online Learning Algorithms

### 5.1 Incremental SGD

```
ALGORITHM: Incremental SGD for Continual Learning
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Concept:
────────────────────────────────────────────
Update model with each new sample (or mini-batch)
without storing full dataset.

BASIC UPDATE:
────────────────────────────────────────────
def online_update(model, x, y, lr=0.001):
    """
    Single-sample gradient update.
    """
    # Forward pass
    y_pred = model(x)
    loss = (y_pred - y) ** 2

    # Backward pass (simplified for last layer only)
    grad = 2 * (y_pred - y) * model.last_activation

    # Update
    model.W_last -= lr * grad
    model.b_last -= lr * 2 * (y_pred - y)

ELASTIC WEIGHT CONSOLIDATION:
────────────────────────────────────────────
# Prevent forgetting by penalizing changes to important weights

def ewc_loss(model, x, y, fisher, old_weights, lambda_ewc=1000):
    """
    Loss with EWC regularization.
    """
    # Standard loss
    y_pred = model(x)
    loss_task = (y_pred - y) ** 2

    # EWC penalty
    loss_ewc = 0
    for name, param in model.parameters():
        loss_ewc += (fisher[name] * (param - old_weights[name]) ** 2).sum()

    return loss_task + lambda_ewc * loss_ewc

# Fisher information (diagonal approximation):
def compute_fisher(model, data):
    fisher = {}
    for name, param in model.parameters():
        fisher[name] = zeros_like(param)

    for x, y in data:
        model.zero_grad()
        loss = model.loss(x, y)
        loss.backward()

        for name, param in model.parameters():
            fisher[name] += param.grad ** 2

    # Normalize
    for name in fisher:
        fisher[name] /= len(data)

    return fisher

MCU CONSTRAINTS:
────────────────────────────────────────────
• Store Fisher diagonal: same size as model
• Update frequency: 1 Hz max
• Gradient computation: last layer only for efficiency
• Memory: 2× model size (weights + Fisher)
```

---

### 5.2 Online Random Forest Update

```
ALGORITHM: Mondrian Forest (Online Random Forest)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Concept:
────────────────────────────────────────────
Extend random forest with new samples without
retraining from scratch.

MONDRIAN TREE UPDATE:
────────────────────────────────────────────
def extend_mondrian_tree(tree, x_new, y_new):
    """
    Extend tree to incorporate new sample.
    """
    # Find leaf for new sample
    leaf = find_leaf(tree, x_new)

    # Compute extension probability
    # (based on distance from existing bounding box)
    p_extend = compute_extend_prob(leaf, x_new)

    if random() < p_extend:
        # Create new split
        new_split = sample_split(leaf.bbox, x_new)
        insert_split(tree, leaf, new_split)

    # Update leaf statistics
    leaf.sum_y += y_new
    leaf.count += 1
    leaf.prediction = leaf.sum_y / leaf.count

SIMPLIFIED VERSION FOR MCU:
────────────────────────────────────────────
# Use reservoir sampling for leaf statistics
def update_tree_leaf(tree, x, y, reservoir_size=100):
    leaf = find_leaf(tree, x)

    # Reservoir sampling update
    leaf.count += 1
    if leaf.count <= reservoir_size:
        leaf.samples.append((x, y))
    else:
        j = randint(0, leaf.count)
        if j < reservoir_size:
            leaf.samples[j] = (x, y)

    # Update prediction (running mean)
    leaf.sum_y += y
    leaf.prediction = leaf.sum_y / leaf.count
```

---

## 6. Federated Learning Algorithms

### 6.1 FedAvg

```
ALGORITHM: FedAvg for Fleet Learning
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Setting:
────────────────────────────────────────────
• K EK3 modules in fleet
• Central coordinator (station controller)
• Communication: CAN-FD (limited bandwidth)

PROTOCOL:
────────────────────────────────────────────
Round t:

1. SERVER: Broadcast global model θ^(t)
   • Quantize to INT8 for transmission
   • Split into CAN frames

2. CLIENTS (parallel):
   for each module k:
       # Download global model
       θ_k ← θ^(t)

       # Local training (E epochs)
       for e in range(E):
           for (x, y) in local_data_k:
               θ_k ← θ_k - η × ∇L(θ_k; x, y)

       # Compute update
       Δθ_k = θ_k - θ^(t)

       # Upload (quantized)
       send_to_server(quantize(Δθ_k))

3. SERVER: Aggregate
   θ^(t+1) = θ^(t) + (1/K) × Σ_k Δθ_k

COMMUNICATION OPTIMIZATION:
────────────────────────────────────────────
# Gradient compression
def compress_gradient(delta, top_k_ratio=0.1):
    """
    Keep only top-k largest gradients.
    """
    k = int(len(delta) * top_k_ratio)
    indices = argsort(abs(delta))[-k:]
    values = delta[indices]

    # Quantize values to INT8
    scale = max(abs(values)) / 127
    values_q = round(values / scale).astype(int8)

    return indices, values_q, scale

# Communication: ~10% of model size
# For 20 KB model: ~2 KB per round

CAN-FD FRAMING:
────────────────────────────────────────────
# Max payload: 64 bytes per frame
# Model update: 2 KB = 32 frames
# At 5 Mbps: ~0.4 ms per frame
# Total upload time: ~13 ms
```

### 6.2 FedProx

```
ALGORITHM: FedProx (Handles Heterogeneity)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Motivation:
────────────────────────────────────────────
FedAvg assumes IID data and equal computation.
FedProx handles:
• Non-IID data across modules
• Varying compute capabilities
• Partial work (interrupted updates)

MODIFIED LOCAL OBJECTIVE:
────────────────────────────────────────────
minimize h_k(θ; θ^(t)) = L_k(θ) + (μ/2) × ||θ - θ^(t)||²

• L_k(θ): Local loss on module k's data
• (μ/2) × ||θ - θ^(t)||²: Proximal term
• μ: Proximal coefficient (typical: 0.01)

LOCAL UPDATE:
────────────────────────────────────────────
def fedprox_local_update(theta_global, local_data, E, eta, mu):
    theta_local = theta_global.copy()

    for e in range(E):
        for x, y in local_data:
            # Gradient of local loss
            grad_loss = compute_gradient(theta_local, x, y)

            # Gradient of proximal term
            grad_prox = mu * (theta_local - theta_global)

            # Combined update
            theta_local -= eta * (grad_loss + grad_prox)

    return theta_local

BENEFITS:
────────────────────────────────────────────
• Converges with non-IID data
• Tolerates partial updates
• μ = 0 reduces to FedAvg
```

---

## 7. Algorithm Comparison

### 7.1 Accuracy vs. Resources

| Algorithm | RUL RMSE | Model Size | Inference | Training |
|-----------|----------|------------|-----------|----------|
| TinyMLP | 12% | 19 KB | 0.2 ms | Cloud |
| TinyCNN | 10% | 25 KB | 3 ms | Cloud |
| TinyTCN | 9% | 15 KB | 2 ms | Cloud |
| TinyLSTM | 8% | 6 KB | 5 ms | Cloud |
| Distilled | 9% | 10 KB | 0.5 ms | Cloud |
| Autoencoder | N/A* | 18 KB | 0.2 ms | Cloud |
| IForest | N/A* | 10 KB | 0.1 ms | Edge |

*Anomaly detection, not RUL prediction

### 7.2 Selection Guide

```
ALGORITHM SELECTION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Use Case                    | Recommended Algorithm
────────────────────────────┼─────────────────────────────────
Minimum resources           | TinyMLP + Distillation
Best accuracy              | TinyCNN or TinyTCN
Long-term dependencies     | TinyTCN (not LSTM - too slow)
Anomaly detection only     | Autoencoder or IForest
Unsupervised               | Autoencoder
Online adaptation needed   | MLP + Incremental SGD
Fleet learning            | FedAvg with any base model
```

---

## Related Documents

- `01-problem-formulation.md` - Problem definition
- `02-tinyml-constraints.md` - Hardware constraints
- `04-data-pipeline.md` - Feature engineering
- `05-literature.md` - Algorithm references
