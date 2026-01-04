import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  FileText,
  ChevronDown,
  ChevronRight,
  Home,
  Shield,
  Cpu,
  Zap,
  Truck,
  Bot,
  BookOpen,
  AlertTriangle,
  Calendar,
  User,
} from 'lucide-react';
import PasswordGate from '../components/PasswordGate';

// Document structure
const DOCUMENT_CATEGORIES = [
  {
    id: 'ip-foundation',
    title: 'IP Foundation',
    icon: Shield,
    documents: [
      {
        id: 'modular-architecture',
        title: 'Modular Architecture',
        disclosureId: 'EK-2026-001',
        date: '2026-01-02',
        status: 'disclosed',
        summary: 'Unified Modular Power Architecture for Scalable EV Charging Systems Using Standardized Hot-Swappable Power Modules',
        content: `
## Problem Statement

Current EV chargers use either:
- **Monolithic design**: Failure = complete charger down, 2-14 days downtime
- **Coarse modules (10-50 kW)**: Heavy, manual replacement, 10-33% capacity loss per failure

## Our Solution: EK3 Module

A standardized 3.3 kW power module that scales from e-bike charging (1 module) to MCS megawatt charging (909 modules).

### Key Innovations
1. **Granular Modularity**: 3.3 kW per module (vs industry 10-50 kW)
2. **Hot-Swappable**: 60-second robotic replacement
3. **Unified Architecture**: Same module for 3 kW to 3 MW systems
4. **Graceful Degradation**: 0.1% capacity loss per module failure

### Technical Specifications
- **Power**: 3.3 kW per module
- **Topology**: LLC resonant converter
- **Efficiency**: >97%
- **Dimensions**: 200 × 320 × 44 mm (1U half-width)
- **Weight**: 3.5 kg
- **MOSFETs**: Wolfspeed 900V SiC
- **Controller**: STM32G474
- **Communication**: CAN-FD @ 5 Mbps
        `,
      },
      {
        id: 'swap-station',
        title: 'Swap Station Design',
        disclosureId: 'EK-2026-002',
        date: '2026-01-02',
        status: 'disclosed',
        summary: 'Robotic Module Swap Station with Automated Diagnostics and Predictive Maintenance',
        content: `
## Overview

Automated station for replacing EK3 modules without human intervention.

### Key Features
- **Swap Time**: <60 seconds per module
- **Capacity**: 50+ spare modules
- **Diagnostics**: Full module testing before/after swap
- **Integration**: Works with Robot A (bus-side) and Robot B (station-side)

### Process Flow
1. AI predicts module failure 2 weeks ahead
2. Bus schedules swap during regular depot visit
3. Robot A (on bus) disconnects failing module
4. Robot B (at station) performs swap
5. Failed module enters diagnostics queue
6. Fresh module installed, bus returns to service

### Benefits
- Zero unplanned downtime
- No specialized technicians needed
- Automatic inventory management
- Full traceability and logging
        `,
      },
      {
        id: 'distributed-sparing',
        title: 'Distributed Sparing',
        disclosureId: 'EK-2026-003',
        date: '2026-01-02',
        status: 'disclosed',
        summary: 'Network-Wide Spare Module Distribution Strategy with Dynamic Rebalancing',
        content: `
## Concept

Instead of each station maintaining large spare inventory, modules are shared across the network.

### Algorithm
1. **Demand Prediction**: ML model predicts failures per station
2. **Dynamic Allocation**: Spare modules redistributed based on predicted demand
3. **Just-in-Time**: Modules shipped to stations before failures occur
4. **Pool Optimization**: Central warehouse + distributed cache at stations

### Economic Impact
- **Inventory Reduction**: 60% less spare modules needed
- **Capital Efficiency**: Better utilization of spare inventory
- **Logistics Cost**: Optimized shipping routes
        `,
      },
      {
        id: 'fleet-logistics',
        title: 'Fleet Logistics AI',
        disclosureId: 'EK-2026-004',
        date: '2026-01-02',
        status: 'disclosed',
        summary: 'AI-Powered Fleet Charging Optimization with Real-Time Route and Schedule Adaptation',
        content: `
## System Overview

Central AI orchestrates charging for entire bus fleet, optimizing for:
- Minimum downtime
- Grid load balancing
- Route schedule compliance
- Battery health

### Features
1. **Predictive Scheduling**: Knows which buses need charging before drivers do
2. **Dynamic Routing**: Redirects buses to optimal charging stations
3. **V2G Integration**: Uses bus batteries for grid stabilization
4. **Peak Shaving**: Avoids expensive peak electricity rates

### Data Inputs
- Real-time battery SoC from all buses
- Traffic conditions
- Weather (affects energy consumption)
- Grid electricity prices
- Scheduled routes and departures
        `,
      },
      {
        id: 'coordinated-robots',
        title: 'Coordinated Robots',
        disclosureId: 'EK-2026-005',
        date: '2026-01-02',
        status: 'disclosed',
        summary: 'Dual-Robot Coordination System for Autonomous Module Replacement',
        content: `
## Two-Robot Architecture

### Robot A (Bus-Mounted)
- **Location**: Installed on each bus
- **Weight**: <15 kg
- **Functions**:
  - Connector manipulation
  - Module extraction/insertion
  - Real-time diagnostics
  - Communication with Robot B

### Robot B (Station-Side)
- **Location**: At each swap station
- **Weight**: ~50 kg
- **Functions**:
  - Module storage management
  - Module testing/conditioning
  - Logistics coordination
  - Fleet-wide inventory tracking

### Coordination Protocol
1. Robots establish secure connection
2. A identifies module to replace
3. B prepares replacement module
4. Synchronized swap execution
5. Verification and logging
        `,
      },
      {
        id: 'ek-rtos',
        title: 'EK-RTOS Microkernel',
        disclosureId: 'EK-2026-006',
        date: '2026-01-04',
        status: 'disclosed',
        summary: 'MINIX-Inspired Microkernel RTOS for Fault-Tolerant Power Electronics with MPU Isolation',
        content: `
## Innovation

A microkernel RTOS that brings MINIX reliability principles to embedded power electronics using MPU instead of MMU.

### MINIX Mapping
| MINIX Concept | EK-RTOS Implementation |
|---------------|------------------------|
| MMU isolation | MPU regions (no MMU needed) |
| User-space servers | Unprivileged service tasks |
| Message passing IPC | Zero-copy shared memory |
| Reincarnation server | Watchdog + auto-restart |
| Minimal kernel | ~8KB kernel code |

### Key Features
- **Fault Isolation**: Each service in own MPU region
- **Auto-Restart**: Failed services restart in <50ms without system reset
- **Message Passing**: MINIX-style synchronous IPC
- **Hybrid Privilege**: Hard RT in kernel, services isolated
- **Tiny Footprint**: 32KB Flash, 8KB RAM kernel

### Architecture
- **Layer 0**: Privileged drivers (LLC, CAN-FD, ADC)
- **Layer 1**: Microkernel (scheduler, MPU, IPC)
- **Layer 2**: Reincarnation server
- **Layer 3**: User services (Thermal, Swarm, Audit, OCPP)

### vs. FreeRTOS
| Aspect | FreeRTOS | EK-RTOS |
|--------|----------|---------|
| Fault isolation | None | Full MPU |
| Bug in logging | System crash | Logger restarts |
| Service update | Full reflash | Single service |
        `,
      },
    ],
  },
  {
    id: 'technical',
    title: 'Technical Specs',
    icon: Cpu,
    documents: [
      {
        id: 'ek3-design',
        title: 'EK3 Detailed Design',
        date: '2026-01-02',
        status: 'complete',
        summary: 'Complete technical specification of the EK3 3.3 kW power module',
        content: `
## EK3 Module Specifications

### Electrical
| Parameter | Value |
|-----------|-------|
| Output Power | 3.3 kW |
| Input Voltage | 650V DC (from central PFC) |
| Output Voltage | 50-500V DC |
| Efficiency (peak) | >96% @ 50% load |
| Efficiency (full) | >94% @ 3.3 kW |
| Standby Power | <3W (deep sleep) |

### Mechanical
| Parameter | Value |
|-----------|-------|
| Dimensions | 200 × 320 × 44 mm |
| Weight | 3.5 kg |
| Format | 1U half-width blade |
| Cooling | Forced air (shared) |
| IP Rating | IP20 (in rack) |

### Semiconductors
- **MOSFETs**: Wolfspeed C3M0065090D (900V SiC, 65mΩ)
- **Gate Driver**: Silicon Labs Si8271 (isolated)
- **Controller**: STM32G474RET6 (170MHz, HRTIM)
- **Current Sensor**: Infineon TLI4971 (±120A)

### Topology
LLC resonant DC/DC converter with:
- ZVS primary switching (zero voltage)
- ZCS secondary switching (zero current)
- Planar transformer (PCB integrated)
- Film capacitors only (no electrolytics)
- 50,000+ hour design life
        `,
      },
      {
        id: 'control-system',
        title: 'Control System',
        date: '2026-01-02',
        status: 'complete',
        summary: 'STM32-based control architecture with CAN-FD communication',
        content: `
## Control Architecture

### Module-Level Control (STM32G474)
- LLC resonant control loop (HRTIM @ 184ps resolution)
- Current/voltage regulation (dual-loop)
- Temperature monitoring (NTC + IR sensor)
- Fault detection (<1μs response)

### Communication Stack
- **Internal**: CAN-FD @ 5 Mbps (dual redundant bus)
- **External**: Ethernet/OCPP 2.0.1
- **Diagnostics**: USB-C debug port
- **Protocol**: Custom EK-CAN with CMAC authentication

### Safety Features (Hardware Layer 0)
- Hardware OCP: <1μs response, non-bypassable
- Hardware OVP: Zener clamp + crowbar
- Hardware OTP: Thermal fuse backup
- Arc fault detection: dI/dt monitoring
- Ground fault: 30mA RCD equivalent
        `,
      },
    ],
  },
  {
    id: 'architecture',
    title: 'Architecture',
    icon: Cpu,
    documents: [
      {
        id: 'microkernel',
        title: 'Microkernel Architecture',
        disclosureId: 'EK-TECH-010',
        date: '2026-01-03',
        status: 'complete',
        summary: 'MINIX-inspired layered architecture for fault-tolerant power systems',
        content: `
## Microkernel Philosophy

### Inspiration: MINIX Operating System
The EK3 architecture draws from microkernel OS design principles:

| OS Concept | Power Electronics Equivalent |
|------------|------------------------------|
| Minimal kernel | Hardware protection (OCP, OVP, OTP) + LLC control |
| User processes | Health monitoring, thermal, swarm coordination |
| IPC | CAN-FD message passing between modules |
| Process isolation | Galvanic isolation + separate MCU per module |
| Graceful degradation | N-1 redundancy, wide power striping |
| Hot reload | Hot-swap module replacement |

### Four-Layer Architecture
- **Layer 0 (HAL)**: STM32 peripherals, SiC MOSFETs, magnetics
- **Layer 1 (Kernel)**: OCP/OVP/OTP hardware, LLC controller, CAN-FD driver
- **Layer 2 (Services)**: Health monitor, thermal manager, swarm coordinator, audit logger
- **Layer 3 (Application)**: OCPP gateway, Fleet AI, cloud telemetry, operator UI

### Key Benefits
- Module failure = 0.4% capacity loss (not 10-33%)
- Independent firmware updates per module
- Same architecture from 3 kW to 3 MW
- No single point of failure
        `,
      },
      {
        id: 'rack-system',
        title: 'Rack System Design',
        disclosureId: 'EK-TECH-016',
        date: '2026-01-03',
        status: 'complete',
        summary: '3PAR-inspired passive backplane rack for 84 modules (277 kW)',
        content: `
## Custom Rack System

### 3PAR Storage Inspiration
| 3PAR Concept | EK3 Implementation |
|--------------|-------------------|
| Wide striping | All modules share load equally |
| No dedicated spare | Distributed sparing (N+M) |
| Autonomous nodes | Modules self-coordinate via Raft |
| Passive backplane | Only power + CAN routing |
| Hot-swap | Module replacement without shutdown |

### Specifications
| Parameter | Value |
|-----------|-------|
| Capacity | 84 EK3 modules |
| Total power | 277 kW (84 × 3.3 kW) |
| Redundancy | N-1 (98.8% with one failure) |
| Height | 42U standard rack |
| Width | 600 mm |
| Depth | 1000 mm |
| Weight (loaded) | ~400 kg |

### Backplane Design
- **Passive only**: No active components, no CPU
- **Power bus**: 650V DC distribution
- **Communication**: Dual CAN-FD (redundant)
- **Connectors**: Blind-mate, 10,000+ cycles
- **Robot access**: Front-accessible slots
        `,
      },
    ],
  },
  {
    id: 'security',
    title: 'Security',
    icon: Shield,
    documents: [
      {
        id: 'security-model',
        title: 'Security Model',
        disclosureId: 'EK-TECH-011',
        date: '2026-01-03',
        status: 'complete',
        summary: 'Defense-in-depth security with 6 layers from hardware to cloud',
        content: `
## Defense-in-Depth Model

### Security Layers
- **Layer 0**: Hardware security (tamper, crypto, OTP fuses)
- **Layer 1**: Firmware security (secure boot, code signing)
- **Layer 2**: Access control (RBAC, capability model)
- **Layer 3**: Message authentication (CMAC signatures)
- **Layer 4**: API authentication (OAuth2, API keys)
- **Layer 5**: Network security (TLS 1.3, VPN, firewall)

### Threat Model
| Threat | Risk | Mitigation |
|--------|------|------------|
| Remote attack | High | TLS, OAuth2, rate limiting |
| CAN bus injection | Medium | CMAC, sequence numbers |
| Physical access | Medium | Tamper detection, RDP Level 2 |
| Supply chain | Low | Secure boot, attestation |
| Insider threat | Low | RBAC, comprehensive audit logging |

### Trust Tiers
- **Tier 0 (Hardware)**: Non-bypassable, always active
- **Tier 1 (Kernel)**: Safety-critical, minimal attack surface
- **Tier 2 (Authenticated)**: Verified identity, limited scope
- **Tier 3 (External)**: Untrusted, full validation required
        `,
      },
      {
        id: 'hardware-security',
        title: 'Hardware Security',
        disclosureId: 'EK-TECH-013',
        date: '2026-01-03',
        status: 'complete',
        summary: 'PCB-level security with guard rings, tamper detection, and crypto',
        content: `
## Hardware Security Design

### PCB Security Features
- **Guard rings**: 0.5mm width, via stitching @ 2mm
- **Buried traces**: Sensitive signals on inner layers
- **Via stitching**: Around crypto section perimeter
- **Conformal coating**: Moisture + tampering protection

### Cryptographic Hardware
- **AES-256**: Hardware accelerator in STM32G474
- **CMAC**: Message authentication for CAN-FD
- **TRNG**: True random number generator
- **Secure storage**: OTP fuses for keys

### Tamper Protection
| Feature | Response |
|---------|----------|
| Enclosure open | Key zeroization |
| Voltage glitch | System reset |
| Debug port probe | Lockout + log |
| Temperature extreme | Graceful shutdown |

### Production Security
- **JTAG disabled**: RDP Level 2 (permanent)
- **Unique keys**: Per-module provisioning
- **Attestation**: Hardware identity verification
- **Secure boot**: Signed firmware only
        `,
      },
      {
        id: 'audit-logging',
        title: 'Audit Logging',
        disclosureId: 'EK-TECH-012',
        date: '2026-01-03',
        status: 'complete',
        summary: 'Tamper-evident logging with hash chains and cloud replication',
        content: `
## Audit Logging System

### Log Categories
- **Security events**: Auth, access control, tamper
- **Safety events**: Faults, shutdowns, recoveries
- **Operational events**: Swaps, maintenance, config
- **Performance events**: Efficiency, temperature, load

### Tamper Evidence
- **Hash chains**: Each entry links to previous
- **Sequence numbers**: Gap detection
- **Timestamps**: NTP-synced, signed
- **Cloud replication**: Real-time backup

### Storage Architecture
- **Local**: 8MB flash, circular buffer
- **Edge**: Gateway aggregation
- **Cloud**: Long-term retention (7 years)

### Compliance
- SOC 2 Type II compatible
- GDPR data handling
- IEC 62443 security logging
        `,
      },
    ],
  },
  {
    id: 'firmware',
    title: 'Firmware',
    icon: Cpu,
    documents: [
      {
        id: 'firmware-arch',
        title: 'Firmware Architecture',
        disclosureId: 'EK-TECH-014',
        date: '2026-01-03',
        status: 'complete',
        summary: 'Real-time firmware with RTOS, secure boot, and OTA updates',
        content: `
## Firmware Design

### RTOS Selection: FreeRTOS
- **Tick rate**: 1 kHz (1ms resolution)
- **Tasks**: 8 priority levels
- **Memory**: Static allocation (no malloc)
- **Stack**: MPU-protected per task

### Task Architecture
| Task | Priority | Period | Function |
|------|----------|--------|----------|
| LLC Control | Highest | 100μs | PWM, current loop |
| Safety Monitor | High | 1ms | Fault detection |
| CAN Handler | High | Event | Message TX/RX |
| Thermal | Medium | 100ms | Temperature control |
| Health | Low | 1s | Diagnostics |
| Telemetry | Lowest | 10s | Cloud reporting |

### Secure Boot Chain
1. ROM bootloader (immutable)
2. First-stage loader (signed)
3. Application firmware (signed)
4. Configuration data (CMAC)

### OTA Updates
- **Dual bank**: A/B partition scheme
- **Atomic**: Complete or rollback
- **Signed**: RSA-2048 + SHA-256
- **Delta**: Differential updates supported
        `,
      },
      {
        id: 'connector-spec',
        title: 'Connector Specification',
        disclosureId: 'EK-TECH-015',
        date: '2026-01-03',
        status: 'complete',
        summary: 'Blind-mate connector system for robotic hot-swap operations',
        content: `
## EK3 Connector System

### Requirements
- **Robotic operation**: No visual alignment needed
- **Hot-swap**: Connect under partial load
- **Cycle life**: 10,000+ insertions
- **Current**: 50A continuous per power pin

### Connector Layout
| Section | Pins | Function |
|---------|------|----------|
| Power | 4 | 650V DC (sequenced) |
| Ground | 2 | Safety ground |
| CAN-H/L | 4 | Dual CAN-FD bus |
| Aux | 4 | I2C, GPIO, sense |
| Guide | 2 | Mechanical alignment |

### Sequencing
1. Guide pins engage (mechanical alignment)
2. Ground pins make contact
3. Aux pins connect (presence detect)
4. Power pins last (inrush limited)

### Specifications
- **Vendor**: Custom (Anderson SBS derivative)
- **Rating**: 50A @ 1000V DC
- **Contact**: Silver-plated copper
- **Housing**: High-temp thermoplastic
- **Keying**: Polarized, foolproof
        `,
      },
    ],
  },
];

// Status badge component
function StatusBadge({ status }) {
  const styles = {
    disclosed: 'bg-amber-100 text-amber-800 border-amber-200',
    filed: 'bg-blue-100 text-blue-800 border-blue-200',
    active: 'bg-green-100 text-green-800 border-green-200',
    complete: 'bg-slate-100 text-slate-800 border-slate-200',
  };

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${styles[status] || styles.complete}`}>
      {status}
    </span>
  );
}

// Sidebar navigation
function DocSidebar({ categories, selectedDoc, onSelect }) {
  const [expanded, setExpanded] = useState(categories.map(c => c.id));

  const toggleCategory = (id) => {
    setExpanded(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <nav className="w-72 bg-white border-r border-slate-200 h-full overflow-y-auto">
      <div className="p-4 border-b border-slate-200">
        <Link to="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm">
          <Home className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="p-4">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Documents
        </h2>

        {categories.map(category => {
          const Icon = category.icon;
          const isExpanded = expanded.includes(category.id);

          return (
            <div key={category.id} className="mb-2">
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
                <Icon className="w-4 h-4 text-slate-500" />
                <span className="font-medium text-sm">{category.title}</span>
              </button>

              {isExpanded && (
                <div className="ml-6 mt-1 space-y-1">
                  {category.documents.map(doc => (
                    <button
                      key={doc.id}
                      onClick={() => onSelect(doc)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm rounded-lg transition-colors ${
                        selectedDoc?.id === doc.id
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      <span className="truncate">{doc.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}

// Document viewer
function DocViewer({ document }) {
  if (!document) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="text-center text-slate-400">
          <BookOpen className="w-12 h-12 mx-auto mb-4" />
          <p>Select a document to view</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">
                {document.title}
              </h1>
              <p className="text-slate-600">{document.summary}</p>
            </div>
            <StatusBadge status={document.status} />
          </div>

          <div className="flex items-center gap-6 text-sm text-slate-500">
            {document.disclosureId && (
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>{document.disclosureId}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{document.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Bojan Janjatovic</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl border border-slate-200 p-8">
          <div className="prose prose-slate max-w-none">
            {/* Simple markdown-like rendering */}
            {document.content.split('\n').map((line, i) => {
              if (line.startsWith('## ')) {
                return <h2 key={i} className="text-xl font-bold text-slate-900 mt-8 mb-4 first:mt-0">{line.replace('## ', '')}</h2>;
              }
              if (line.startsWith('### ')) {
                return <h3 key={i} className="text-lg font-semibold text-slate-800 mt-6 mb-3">{line.replace('### ', '')}</h3>;
              }
              if (line.startsWith('| ')) {
                // Simple table rendering
                const cells = line.split('|').filter(c => c.trim());
                if (line.includes('---')) return null;
                return (
                  <div key={i} className="grid grid-cols-2 gap-4 py-2 border-b border-slate-100">
                    {cells.map((cell, j) => (
                      <span key={j} className={j === 0 ? 'font-medium text-slate-700' : 'text-slate-600'}>
                        {cell.trim()}
                      </span>
                    ))}
                  </div>
                );
              }
              if (line.startsWith('- **')) {
                const match = line.match(/- \*\*(.+?)\*\*: (.+)/);
                if (match) {
                  return (
                    <div key={i} className="flex gap-2 py-1">
                      <span className="font-semibold text-slate-700">{match[1]}:</span>
                      <span className="text-slate-600">{match[2]}</span>
                    </div>
                  );
                }
              }
              if (line.startsWith('- ')) {
                return <li key={i} className="text-slate-600 ml-4">{line.replace('- ', '')}</li>;
              }
              if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ')) {
                return <li key={i} className="text-slate-600 ml-4 list-decimal">{line.replace(/^\d+\. /, '')}</li>;
              }
              if (line.trim() === '') return <div key={i} className="h-2" />;
              return <p key={i} className="text-slate-600 leading-relaxed">{line}</p>;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Main page component
function PatentPortfolioContent() {
  const { t } = useTranslation();
  const [selectedDoc, setSelectedDoc] = useState(null);

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">ELEKTROKOMBINACIJA</h1>
            <p className="text-sm text-slate-500">Patent Portfolio</p>
          </div>
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">Confidential</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        <DocSidebar
          categories={DOCUMENT_CATEGORIES}
          selectedDoc={selectedDoc}
          onSelect={setSelectedDoc}
        />
        <DocViewer document={selectedDoc} />
      </div>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 px-6 py-3">
        <p className="text-xs text-slate-400 text-center">
          CONFIDENTIAL - These documents represent intellectual property of ELEKTROKOMBINACIJA.
          Unauthorized distribution is prohibited.
        </p>
      </footer>
    </div>
  );
}

export default function PatentPortfolioPage() {
  return (
    <PasswordGate
      password="ritamneredadjaniritamneredadjanidjanjipoizborudjanji"
      storageKey="ek_patent_unlocked"
      title="Patent Portfolio"
    >
      <PatentPortfolioContent />
    </PasswordGate>
  );
}
