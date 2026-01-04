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
    ],
  },
  {
    id: 'technical',
    title: 'Technical',
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
| Input Voltage | 380-480 VAC |
| Output Voltage | 200-920 VDC |
| Efficiency | >97% |
| Power Factor | >0.99 |
| THD | <5% |

### Mechanical
| Parameter | Value |
|-----------|-------|
| Dimensions | 200 × 320 × 44 mm |
| Weight | 3.5 kg |
| Format | 1U half-width blade |
| Cooling | Forced air |
| IP Rating | IP20 (in rack) |

### Semiconductors
- **Primary MOSFETs**: Wolfspeed C3M0016120K (1200V SiC)
- **Secondary MOSFETs**: Wolfspeed C3M0021120K (1200V SiC)
- **Gate Driver**: Silicon Labs Si8271
- **Controller**: STM32G474RET6

### Topology
LLC resonant converter with:
- ZVS primary switching
- ZCS secondary switching
- 400 kHz switching frequency
- Integrated PFC stage
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
- LLC resonant control loop
- Current/voltage regulation
- Temperature monitoring
- Fault detection and protection

### Rack-Level Control (Master STM32)
- Module coordination
- Load balancing
- Hot-swap management
- External communication

### Communication Stack
- **Internal**: CAN-FD @ 5 Mbps
- **External**: Ethernet/OCPP
- **Diagnostics**: USB-C debug port

### Safety Features
- Hardware overcurrent protection
- Overvoltage shutdown
- Thermal derating
- Arc fault detection
- Ground fault monitoring
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
