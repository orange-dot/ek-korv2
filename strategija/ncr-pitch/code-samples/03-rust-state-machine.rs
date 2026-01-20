// Example: Rust exhaustive pattern matching
// Compiler enforces handling ALL cases - no forgotten edge cases

use std::time::Instant;

#[derive(Debug, Clone)]
pub enum FaultCode {
    Overvoltage,
    Overcurrent,
    Overtemperature,
    CommunicationLost,
}

#[derive(Debug, Clone)]
pub enum ModuleState {
    Offline,
    Initializing { start_time: Instant },
    Online { neighbor_count: u8 },
    Fault { code: FaultCode, recoverable: bool },
}

impl Module {
    pub fn handle_state(&mut self) {
        // Compiler ERROR if any case is not handled
        match &self.state {
            ModuleState::Offline => {
                self.start_discovery();
            }
            ModuleState::Initializing { start_time } => {
                if start_time.elapsed().as_secs() > 5 {
                    self.state = ModuleState::Fault {
                        code: FaultCode::CommunicationLost,
                        recoverable: true,
                    };
                }
            }
            ModuleState::Online { neighbor_count } => {
                if *neighbor_count == 0 {
                    self.broadcast_heartbeat();
                }
            }
            ModuleState::Fault { recoverable: true, .. } => {
                self.attempt_recovery();
            }
            ModuleState::Fault { recoverable: false, code } => {
                log::error!("Unrecoverable fault: {:?}", code);
                self.halt();
            }
        }
    }
}

// Option<T> instead of null - no null pointer dereferences
pub fn find_leader(modules: &[Module]) -> Option<&Module> {
    modules.iter().find(|m| m.is_leader)
}

// Usage: caller MUST handle None case
// let leader = find_leader(&modules);
// match leader {
//     Some(l) => println!("Leader: {}", l.id),
//     None => println!("No leader elected"),
// }
