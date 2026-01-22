# EKKL: EK-KOR Language

## Overview

EKKL (EK-KOR Language) is a minimal, deterministic domain-specific language designed for EK-KOR2 test vector oracles. It provides native Q16.16 fixed-point support and implements all EKK module logic in a language-independent, reproducible manner.

**Key features:**
- Native Q16.16 fixed-point arithmetic (using `fixed` crate)
- Deterministic evaluation (no floating-point in semantics)
- Static type checking
- Simple, Rust-like syntax
- JSON test vector integration

## Why EKKL?

When validating C and Rust implementations against the same specification, we need an authoritative oracle that:

1. **Is deterministic** - Same inputs always produce same outputs
2. **Uses fixed-point** - Matches embedded implementation semantics exactly
3. **Is language-independent** - Not biased toward C or Rust implementation details
4. **Is readable** - Serves as executable documentation

EKKL fills this role as the "third voice" in cross-implementation validation.

## Installation

```bash
cd ek-kor2/ekkl
cargo build --release
```

The `ekkl` binary will be in `target/release/ekkl`.

## CLI Usage

```bash
# Run an EKKL program
ekkl run examples/gradient.ekkl

# Type check without running
ekkl check spec/ekkl/field.ekkl

# Run a test vector through EKKL oracle
ekkl vector spec/test-vectors/field_001_publish_basic.json

# Interactive REPL
ekkl repl

# Show version
ekkl --version
```

## Language Reference

### Types

| Type | Description | Example |
|------|-------------|---------|
| `i8`, `i16`, `i32`, `i64` | Signed integers | `let x: i32 = 42` |
| `u8`, `u16`, `u32`, `u64` | Unsigned integers | `let id: u8 = 1` |
| `bool` | Boolean | `let ok: bool = true` |
| `q16_16` | Q16.16 fixed-point | `let load: q16_16 = 0.5q` |
| `[T; N]` | Fixed-size array | `let arr: [i32; 5]` |
| `()` | Unit type | `fn init() { }` |

### Fixed-Point Literals

Use the `q` suffix for fixed-point literals:

```rust
let half: q16_16 = 0.5q
let third: q16_16 = 0.333q
let one: q16_16 = 1.0q
let negative: q16_16 = -0.25q
```

### Functions

```rust
fn gradient(my_load: q16_16, neighbor_load: q16_16) -> q16_16 {
    return neighbor_load - my_load
}

fn main() -> q16_16 {
    return gradient(0.3q, 0.7q)
}
```

### Structs

```rust
struct Field {
    load: q16_16,
    thermal: q16_16,
    power: q16_16,
}

fn create_field() -> Field {
    return Field {
        load: 0.5q,
        thermal: 0.3q,
        power: 0.8q,
    }
}
```

### Enums

```rust
enum HealthState {
    Unknown,
    Alive,
    Suspect,
    Dead,
}

enum VoteValue {
    Abstain,
    Yes,
    No,
    Inhibit,
}
```

### Control Flow

```rust
// If statements
if load > 0.8q {
    return Error::Busy
} else {
    return Error::Ok
}

// Match expressions
match state {
    HealthState::Alive => return true,
    HealthState::Dead => return false,
    _ => return false,
}

// For loops
for i in 0..10 {
    sum = sum + arr[i]
}

// While loops
while count < threshold {
    count = count + 1
}
```

### Variable Binding

```rust
// Immutable binding
let x: i32 = 42

// Mutable binding
let mut counter: i32 = 0
counter = counter + 1
```

## Built-in Functions

### Q16.16 Operations

| Function | Description | Example |
|----------|-------------|---------|
| `q16_from_bits(i32)` | Create from raw bits | `q16_from_bits(32768)` → 0.5 |
| `q16_to_bits(q16_16)` | Get raw bits | `q16_to_bits(0.5q)` → 32768 |
| `q16_abs(q16_16)` | Absolute value | `q16_abs(-0.5q)` → 0.5 |
| `q16_floor(q16_16)` | Floor to integer | `q16_floor(1.7q)` → 1 |
| `q16_ceil(q16_16)` | Ceiling to integer | `q16_ceil(1.2q)` → 2 |
| `q16_round(q16_16)` | Round to nearest | `q16_round(1.5q)` → 2 |
| `q16_frac(q16_16)` | Fractional part | `q16_frac(1.7q)` → 0.7 |
| `q16_min(a, b)` | Minimum | `q16_min(0.3q, 0.7q)` → 0.3 |
| `q16_max(a, b)` | Maximum | `q16_max(0.3q, 0.7q)` → 0.7 |
| `q16_clamp(v, min, max)` | Clamp to range | `q16_clamp(1.5q, 0.0q, 1.0q)` → 1.0 |
| `q16_lerp(a, b, t)` | Linear interpolation | `q16_lerp(0.0q, 1.0q, 0.5q)` → 0.5 |
| `q16_saturating_add(a, b)` | Saturating add | No overflow |
| `q16_saturating_sub(a, b)` | Saturating subtract | No underflow |
| `q16_saturating_mul(a, b)` | Saturating multiply | No overflow |

### Array Operations

| Function | Description |
|----------|-------------|
| `array_len(arr)` | Get array length |
| `array_get(arr, idx)` | Get element at index |
| `array_set(arr, idx, val)` | Return new array with element set |

### Method Syntax

Fixed-point values support method calls:

```rust
let x: q16_16 = -0.5q
let abs_x = x.abs()          // 0.5
let bits = x.to_bits()       // raw i32
let clamped = x.clamp(0.0q, 1.0q)
```

Arrays support method calls:

```rust
let arr = [1, 2, 3]
let len = arr.len()          // 3
let first = arr.first()      // 1
let last = arr.last()        // 3
```

### Debug Functions

| Function | Description |
|----------|-------------|
| `print(...)` | Print values to stdout |
| `assert(bool)` | Assert condition is true |
| `assert_eq(a, b)` | Assert values are equal |

## Test Vector Integration

EKKL serves as the oracle for the EK-KOR2 test vector system. Test vectors are JSON files that define inputs and expected outputs:

```json
{
  "id": "field_001",
  "module": "field",
  "function": "field_publish",
  "input": {
    "module_id": 42,
    "field": {
      "load": 0.5,
      "thermal": 0.3,
      "power": 0.8
    }
  },
  "expected": {
    "return": "OK"
  }
}
```

Run a test vector through EKKL:

```bash
ekkl vector spec/test-vectors/field_001_publish_basic.json
```

Output:
```json
{
  "status": "ok",
  "result": {
    "return": "Ok",
    "components": [32768, 19661, 52429, 0, 0]
  }
}
```

### Supported Modules

| Module | Functions |
|--------|-----------|
| `field` | `field_gradient`, `field_publish`, `field_sample` |
| `consensus` | `consensus_propose`, `consensus_vote` |
| `heartbeat` | `heartbeat_received` |
| `topology` | `topology_discover` |

## Fixed-Point Representation

EKKL uses Q16.16 fixed-point internally. This matches the EK-KOR2 embedded implementation exactly:

| Float | Fixed (decimal) | Fixed (hex) |
|-------|-----------------|-------------|
| 0.0 | 0 | 0x00000000 |
| 0.25 | 16384 | 0x00004000 |
| 0.3 | 19661 | 0x00004CCD |
| 0.5 | 32768 | 0x00008000 |
| 0.8 | 52429 | 0x0000CCCD |
| 1.0 | 65536 | 0x00010000 |

Converting between representations:

```rust
// Float to fixed: multiply by 65536
let fixed = (0.5 * 65536) as i32  // = 32768

// Fixed to float: divide by 65536
let float = 32768.0 / 65536.0     // = 0.5
```

## REPL Usage

The interactive REPL is useful for exploring EKKL:

```
$ ekkl repl
EKKL 0.1.0 - Interactive REPL
Type expressions to evaluate. Use :quit to exit.

ekkl> 0.5q + 0.3q
0.8
ekkl> q16_to_bits(0.5q)
32768
ekkl> :load spec/ekkl/field.ekkl
Loaded: spec/ekkl/field.ekkl
ekkl> gradient(0.3q, 0.7q)
0.4
ekkl> :quit
```

REPL commands:
- `:quit` or `:q` - Exit
- `:help` or `:h` - Show help
- `:load <file>` - Load EKKL file

## Example: Field Gradient

The field gradient calculation is central to EK-KOR2's coordination:

```rust
// spec/ekkl/field.ekkl

/// Calculate gradient between local and neighbor field
/// Returns: positive = neighbor has more load (should shed)
///          negative = neighbor has less load (should accept)
fn field_gradient(my_load: q16_16, neighbor_load: q16_16) -> q16_16 {
    return neighbor_load - my_load
}

/// Main entry point for testing
fn main() -> q16_16 {
    // Module at 30% load, neighbor at 70% load
    // Gradient = 0.4 (positive, should shed load toward neighbor)
    return field_gradient(0.3q, 0.7q)
}
```

Run:
```bash
$ ekkl run spec/ekkl/field.ekkl
0.4
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    EKKL Architecture                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Source (.ekkl)                                             │
│       │                                                      │
│       ▼                                                      │
│   ┌─────────┐                                                │
│   │  Lexer  │  tokens                                        │
│   └────┬────┘                                                │
│        │                                                     │
│        ▼                                                     │
│   ┌─────────┐                                                │
│   │ Parser  │  AST                                           │
│   └────┬────┘                                                │
│        │                                                     │
│        ▼                                                     │
│   ┌───────────┐                                              │
│   │Type Check │  typed AST                                   │
│   └────┬──────┘                                              │
│        │                                                     │
│        ▼                                                     │
│   ┌───────────┐                                              │
│   │ Evaluator │  result                                      │
│   └───────────┘                                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Integration with Test Vector System

EKKL integrates with the multi-layer test pyramid:

```
Layer 4: LLM Oracle
Layer 3: Python Reference
Layer 2: Golden Outputs
Layer 1: Property Tests
Layer 0: Cross-Validation (C vs Rust)
    │
    └── EKKL Oracle (authoritative expected outputs)
```

When C and Rust implementations disagree, EKKL provides the authoritative answer based on the specification.

## Development

### Building

```bash
cd ek-kor2/ekkl
cargo build
cargo test
```

### Running Tests

```bash
# Unit tests
cargo test

# Integration with test vectors
cd ..
python tools/run_tests.py --oracle ekkl
```

### Project Structure

```
ekkl/
├── Cargo.toml
├── src/
│   ├── lib.rs          # Main library
│   ├── ast.rs          # Abstract syntax tree
│   ├── lexer.rs        # Tokenizer
│   ├── parser.rs       # Parser
│   ├── types.rs        # Type system
│   ├── eval.rs         # Evaluator
│   ├── builtins.rs     # Built-in functions
│   ├── value.rs        # Runtime values
│   ├── error.rs        # Error types
│   └── bin/
│       └── ekkl.rs     # CLI binary
└── tests/
    ├── lexer_tests.rs
    ├── parser_tests.rs
    └── eval_tests.rs
```
