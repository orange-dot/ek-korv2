#!/usr/bin/env python3
"""
JEZGRO CAN-FD Swarm Simulator

Simulates multiple JEZGRO nodes communicating over CAN bus.
Demonstrates leader election, heartbeats, and fault tolerance.

Usage:
    python swarm_simulator.py [--nodes N] [--virtual]

Options:
    --nodes N     Number of nodes to simulate (default: 5)
    --virtual     Use virtual CAN bus (no vcan required)
    --duration S  Run for S seconds (default: 30)
"""

import argparse
import threading
import time
import random
import sys
from dataclasses import dataclass
from enum import Enum
from typing import Optional, Dict, List

# Try to import python-can
try:
    import can
    CAN_AVAILABLE = True
except ImportError:
    CAN_AVAILABLE = False
    print("Warning: python-can not installed. Using simulated bus.")
    print("Install with: pip install python-can")


class NodeState(Enum):
    """Node states for leader election"""
    FOLLOWER = 0
    CANDIDATE = 1
    LEADER = 2


@dataclass
class CanMessage:
    """CAN message structure"""
    id: int
    data: bytes
    timestamp: float = 0.0


class VirtualCanBus:
    """Virtual CAN bus for testing without real CAN interface"""

    def __init__(self):
        self.subscribers: List['JezgroNode'] = []
        self.lock = threading.Lock()

    def register(self, node: 'JezgroNode'):
        with self.lock:
            self.subscribers.append(node)

    def send(self, msg: CanMessage, sender: 'JezgroNode'):
        """Broadcast message to all nodes except sender"""
        with self.lock:
            for node in self.subscribers:
                if node != sender:
                    node.receive_message(msg)


class JezgroNode:
    """
    Simulates a JEZGRO node with leader election and heartbeat.

    CAN Message IDs:
        0x100-0x1FF: Coordination (heartbeat, election)
        0x200-0x2FF: Power control
        0x300-0x3FF: Telemetry
    """

    # Message types
    MSG_HEARTBEAT = 0x100
    MSG_VOTE_REQUEST = 0x110
    MSG_VOTE_RESPONSE = 0x111
    MSG_LEADER_ANNOUNCE = 0x120
    MSG_POWER_STATUS = 0x200
    MSG_TELEMETRY = 0x300

    # Timing constants (ms)
    HEARTBEAT_INTERVAL = 100
    ELECTION_TIMEOUT_MIN = 150
    ELECTION_TIMEOUT_MAX = 300

    def __init__(self, node_id: int, bus, virtual: bool = False):
        self.node_id = node_id
        self.bus = bus
        self.virtual = virtual

        # State
        self.state = NodeState.FOLLOWER
        self.current_term = 0
        self.voted_for: Optional[int] = None
        self.leader_id: Optional[int] = None
        self.votes_received = 0

        # Timing
        self.last_heartbeat = time.time()
        self.election_timeout = self._random_timeout()

        # Stats
        self.messages_sent = 0
        self.messages_received = 0

        # Control
        self.running = True
        self.lock = threading.Lock()
        self.rx_queue: List[CanMessage] = []

        # Register with virtual bus if using one
        if virtual and hasattr(bus, 'register'):
            bus.register(self)

    def _random_timeout(self) -> float:
        """Generate random election timeout"""
        return random.uniform(
            self.ELECTION_TIMEOUT_MIN / 1000,
            self.ELECTION_TIMEOUT_MAX / 1000
        )

    def _send_can(self, msg_id: int, data: bytes):
        """Send CAN message"""
        msg = CanMessage(id=msg_id, data=data, timestamp=time.time())

        if self.virtual:
            self.bus.send(msg, self)
        else:
            can_msg = can.Message(
                arbitration_id=msg_id,
                data=data,
                is_extended_id=False,
                is_fd=True
            )
            try:
                self.bus.send(can_msg)
            except can.CanError as e:
                print(f"Node {self.node_id}: CAN send error: {e}")

        self.messages_sent += 1

    def receive_message(self, msg: CanMessage):
        """Called when message received (virtual bus)"""
        with self.lock:
            self.rx_queue.append(msg)

    def _process_message(self, msg_id: int, data: bytes):
        """Process received CAN message"""
        self.messages_received += 1

        if msg_id == self.MSG_HEARTBEAT:
            sender_id = data[0]
            sender_term = data[1]
            is_leader = data[2]

            if is_leader and sender_term >= self.current_term:
                self.state = NodeState.FOLLOWER
                self.leader_id = sender_id
                self.current_term = sender_term
                self.last_heartbeat = time.time()

        elif msg_id == self.MSG_VOTE_REQUEST:
            candidate_id = data[0]
            candidate_term = data[1]

            # Vote if we haven't voted this term and candidate is valid
            if candidate_term > self.current_term:
                self.current_term = candidate_term
                self.voted_for = candidate_id
                self.state = NodeState.FOLLOWER

                # Send vote response
                response = bytes([self.node_id, candidate_term, 1])
                self._send_can(self.MSG_VOTE_RESPONSE, response)

        elif msg_id == self.MSG_VOTE_RESPONSE:
            voter_id = data[0]
            term = data[1]
            granted = data[2]

            if self.state == NodeState.CANDIDATE and term == self.current_term:
                if granted:
                    self.votes_received += 1

        elif msg_id == self.MSG_LEADER_ANNOUNCE:
            leader_id = data[0]
            term = data[1]

            if term >= self.current_term:
                self.current_term = term
                self.leader_id = leader_id
                self.state = NodeState.FOLLOWER
                self.last_heartbeat = time.time()

    def _send_heartbeat(self):
        """Send heartbeat (if leader)"""
        is_leader = 1 if self.state == NodeState.LEADER else 0
        data = bytes([self.node_id, self.current_term, is_leader, 0, 0, 0, 0, 0])
        self._send_can(self.MSG_HEARTBEAT, data)

    def _start_election(self):
        """Start leader election"""
        self.state = NodeState.CANDIDATE
        self.current_term += 1
        self.voted_for = self.node_id
        self.votes_received = 1  # Vote for self
        self.election_timeout = self._random_timeout()

        print(f"Node {self.node_id}: Starting election (term {self.current_term})")

        # Request votes
        data = bytes([self.node_id, self.current_term, 0, 0, 0, 0, 0, 0])
        self._send_can(self.MSG_VOTE_REQUEST, data)

    def _check_election_result(self, total_nodes: int):
        """Check if we won the election"""
        if self.state == NodeState.CANDIDATE:
            # Simple majority
            if self.votes_received > total_nodes // 2:
                self.state = NodeState.LEADER
                self.leader_id = self.node_id
                print(f"Node {self.node_id}: Became LEADER (term {self.current_term})")

                # Announce leadership
                data = bytes([self.node_id, self.current_term, 0, 0, 0, 0, 0, 0])
                self._send_can(self.MSG_LEADER_ANNOUNCE, data)

    def run(self, total_nodes: int):
        """Main node loop"""
        print(f"Node {self.node_id}: Started")

        last_heartbeat_sent = 0

        while self.running:
            now = time.time()

            # Process incoming messages
            with self.lock:
                messages = self.rx_queue.copy()
                self.rx_queue.clear()

            for msg in messages:
                self._process_message(msg.id, msg.data)

            # If using real CAN, poll for messages
            if not self.virtual and CAN_AVAILABLE:
                try:
                    msg = self.bus.recv(timeout=0.01)
                    if msg:
                        self._process_message(msg.arbitration_id, bytes(msg.data))
                except can.CanError:
                    pass

            # Leader sends heartbeats
            if self.state == NodeState.LEADER:
                if now - last_heartbeat_sent > self.HEARTBEAT_INTERVAL / 1000:
                    self._send_heartbeat()
                    last_heartbeat_sent = now

            # Followers check for heartbeat timeout
            elif self.state == NodeState.FOLLOWER:
                if now - self.last_heartbeat > self.election_timeout:
                    self._start_election()

            # Candidates check election result
            elif self.state == NodeState.CANDIDATE:
                self._check_election_result(total_nodes)

                # Election timeout - restart
                if now - self.last_heartbeat > self.election_timeout:
                    self._start_election()

            time.sleep(0.01)  # 10ms loop

    def get_status(self) -> str:
        """Get node status string"""
        state_str = self.state.name
        if self.state == NodeState.LEADER:
            return f"LEADER (term {self.current_term})"
        elif self.leader_id is not None:
            return f"follower -> {self.leader_id}"
        else:
            return state_str


def simulate_fault(nodes: List[JezgroNode], fault_node_id: int):
    """Simulate node failure"""
    for node in nodes:
        if node.node_id == fault_node_id:
            print(f"\n*** FAULT: Node {fault_node_id} failed! ***\n")
            node.running = False
            return node
    return None


def main():
    parser = argparse.ArgumentParser(description='JEZGRO CAN-FD Swarm Simulator')
    parser.add_argument('--nodes', type=int, default=5, help='Number of nodes')
    parser.add_argument('--virtual', action='store_true', help='Use virtual bus')
    parser.add_argument('--duration', type=int, default=30, help='Duration in seconds')
    parser.add_argument('--fault-test', action='store_true', help='Test fault tolerance')
    args = parser.parse_args()

    print("=" * 60)
    print("  JEZGRO CAN-FD Swarm Simulator")
    print("=" * 60)
    print(f"  Nodes: {args.nodes}")
    print(f"  Bus: {'Virtual' if args.virtual or not CAN_AVAILABLE else 'vcan0'}")
    print(f"  Duration: {args.duration}s")
    print("=" * 60)
    print()

    # Create bus
    if args.virtual or not CAN_AVAILABLE:
        bus = VirtualCanBus()
        use_virtual = True
    else:
        try:
            bus = can.Bus('vcan0', bustype='socketcan', fd=True)
            use_virtual = False
            print("Using real CAN interface: vcan0")
        except Exception as e:
            print(f"Cannot open vcan0: {e}")
            print("Falling back to virtual bus")
            bus = VirtualCanBus()
            use_virtual = True

    # Create nodes
    nodes: List[JezgroNode] = []
    threads: List[threading.Thread] = []

    for i in range(args.nodes):
        node = JezgroNode(i, bus, virtual=use_virtual)
        nodes.append(node)

        t = threading.Thread(target=node.run, args=(args.nodes,), daemon=True)
        threads.append(t)
        t.start()

    # Monitor loop
    start_time = time.time()
    fault_triggered = False

    try:
        while time.time() - start_time < args.duration:
            time.sleep(1)

            # Print status
            print(f"\n--- Status (t={int(time.time() - start_time)}s) ---")
            for node in nodes:
                if node.running:
                    print(f"  Node {node.node_id}: {node.get_status()} "
                          f"[tx:{node.messages_sent} rx:{node.messages_received}]")
                else:
                    print(f"  Node {node.node_id}: OFFLINE")

            # Fault injection test
            if args.fault_test and not fault_triggered:
                if time.time() - start_time > 10:
                    # Find leader and kill it
                    for node in nodes:
                        if node.state == NodeState.LEADER:
                            simulate_fault(nodes, node.node_id)
                            fault_triggered = True
                            break

    except KeyboardInterrupt:
        print("\n\nInterrupted by user")

    # Shutdown
    print("\nShutting down...")
    for node in nodes:
        node.running = False

    for t in threads:
        t.join(timeout=1)

    if not use_virtual:
        bus.shutdown()

    # Final stats
    print("\n" + "=" * 60)
    print("  Final Statistics")
    print("=" * 60)
    total_tx = sum(n.messages_sent for n in nodes)
    total_rx = sum(n.messages_received for n in nodes)
    print(f"  Total messages sent: {total_tx}")
    print(f"  Total messages received: {total_rx}")

    leaders = [n for n in nodes if n.state == NodeState.LEADER and n.running]
    if leaders:
        print(f"  Final leader: Node {leaders[0].node_id}")
    else:
        print("  No leader (system partitioned or all failed)")

    print("=" * 60)


if __name__ == "__main__":
    main()
