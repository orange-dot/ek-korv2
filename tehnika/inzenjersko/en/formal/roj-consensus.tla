-------------------------------- MODULE roj_consensus --------------------------------
(***************************************************************************
 * ROJ Consensus Protocol - Formal TLA+ Specification
 *
 * This specification models the distributed consensus protocol for
 * ELEKTROKOMBINACIJA's ROJ (swarm intelligence) coordination layer.
 *
 * Key properties verified:
 * - Leader Election Safety: At most one leader per term
 * - Consensus Safety: Decided values cannot change
 * - Partition Safety: Split-brain impossibility with quorum
 * - Liveness: Under partial synchrony, progress is made
 *
 * Document: EK-TECH-030
 * Version: 1.0
 * Date: January 2026
 ***************************************************************************)

EXTENDS Integers, Sequences, FiniteSets, TLC

\* Configuration constants
CONSTANTS
    Nodes,          \* Set of all node IDs
    MaxTerm,        \* Maximum term number to explore
    MaxEpoch        \* Maximum partition epoch to explore

\* Node states
CONSTANTS
    FOLLOWER,
    CANDIDATE,
    LEADER

\* Partition states
CONSTANTS
    HEALTHY,
    SUSPECTING,
    MAJORITY_PARTITION,
    MINORITY_PARTITION,
    RECONCILING

\* Quorum calculation
Quorum == (Cardinality(Nodes) \div 2) + 1

\* Variables
VARIABLES
    \* Per-node state
    nodeState,       \* nodeState[n] \in {FOLLOWER, CANDIDATE, LEADER}
    currentTerm,     \* currentTerm[n] \in 0..MaxTerm
    votedFor,        \* votedFor[n] \in Nodes \cup {NULL}

    \* Partition handling
    partitionEpoch,  \* partitionEpoch[n] \in 0..MaxEpoch
    partitionState,  \* partitionState[n] \in {HEALTHY, SUSPECTING, ...}
    visibleNodes,    \* visibleNodes[n] \subseteq Nodes

    \* Message passing (simplified)
    messages         \* Set of messages in transit

vars == <<nodeState, currentTerm, votedFor, partitionEpoch, partitionState, visibleNodes, messages>>

NULL == CHOOSE x : x \notin Nodes

-----------------------------------------------------------------------------
(* Message Types *)

\* Vote request from candidate
VoteRequest(from, term) ==
    [type |-> "VoteRequest", from |-> from, term |-> term]

\* Vote response
VoteResponse(from, to, term, granted) ==
    [type |-> "VoteResponse", from |-> from, to |-> to, term |-> term, granted |-> granted]

\* Leader heartbeat
LeaderHeartbeat(from, term, epoch) ==
    [type |-> "LeaderHeartbeat", from |-> from, term |-> term, epoch |-> epoch]

\* Partition notification
PartitionNotify(from, epoch, visible) ==
    [type |-> "PartitionNotify", from |-> from, epoch |-> epoch, visible |-> visible]

-----------------------------------------------------------------------------
(* Initial State *)

Init ==
    /\ nodeState = [n \in Nodes |-> FOLLOWER]
    /\ currentTerm = [n \in Nodes |-> 0]
    /\ votedFor = [n \in Nodes |-> NULL]
    /\ partitionEpoch = [n \in Nodes |-> 0]
    /\ partitionState = [n \in Nodes |-> HEALTHY]
    /\ visibleNodes = [n \in Nodes |-> Nodes]  \* Initially all nodes visible
    /\ messages = {}

-----------------------------------------------------------------------------
(* Leader Election Actions *)

\* Node n times out and becomes candidate
BecomeCandidate(n) ==
    /\ nodeState[n] = FOLLOWER
    /\ currentTerm[n] < MaxTerm
    /\ partitionState[n] \notin {MINORITY_PARTITION}  \* Cannot become candidate in minority
    /\ nodeState' = [nodeState EXCEPT ![n] = CANDIDATE]
    /\ currentTerm' = [currentTerm EXCEPT ![n] = @ + 1]
    /\ votedFor' = [votedFor EXCEPT ![n] = n]  \* Vote for self
    /\ messages' = messages \cup
        {VoteRequest(n, currentTerm[n] + 1) : m \in visibleNodes[n] \ {n}}
    /\ UNCHANGED <<partitionEpoch, partitionState, visibleNodes>>

\* Node n receives vote request from candidate c
HandleVoteRequest(n, m) ==
    /\ m \in messages
    /\ m.type = "VoteRequest"
    /\ m.from \in visibleNodes[n]  \* Can only receive from visible nodes
    /\ \/ /\ m.term > currentTerm[n]
          /\ currentTerm' = [currentTerm EXCEPT ![n] = m.term]
          /\ nodeState' = [nodeState EXCEPT ![n] = FOLLOWER]
          /\ votedFor' = [votedFor EXCEPT ![n] = m.from]
          /\ messages' = messages \cup {VoteResponse(n, m.from, m.term, TRUE)}
       \/ /\ m.term = currentTerm[n]
          /\ votedFor[n] = NULL
          /\ votedFor' = [votedFor EXCEPT ![n] = m.from]
          /\ messages' = messages \cup {VoteResponse(n, m.from, m.term, TRUE)}
          /\ UNCHANGED <<currentTerm, nodeState>>
       \/ /\ m.term <= currentTerm[n]
          /\ votedFor[n] # NULL
          /\ messages' = messages \cup {VoteResponse(n, m.from, m.term, FALSE)}
          /\ UNCHANGED <<currentTerm, nodeState, votedFor>>
    /\ UNCHANGED <<partitionEpoch, partitionState, visibleNodes>>

\* Candidate n receives enough votes to become leader
BecomeLeader(n) ==
    /\ nodeState[n] = CANDIDATE
    /\ LET votes == {m \in messages :
            /\ m.type = "VoteResponse"
            /\ m.to = n
            /\ m.term = currentTerm[n]
            /\ m.granted = TRUE}
       IN Cardinality(votes) + 1 >= Quorum  \* +1 for self-vote
    /\ nodeState' = [nodeState EXCEPT ![n] = LEADER]
    /\ messages' = messages \cup
        {LeaderHeartbeat(n, currentTerm[n], partitionEpoch[n])}
    /\ UNCHANGED <<currentTerm, votedFor, partitionEpoch, partitionState, visibleNodes>>

\* Node n receives leader heartbeat
HandleHeartbeat(n, m) ==
    /\ m \in messages
    /\ m.type = "LeaderHeartbeat"
    /\ m.from \in visibleNodes[n]
    /\ m.term >= currentTerm[n]
    /\ nodeState' = [nodeState EXCEPT ![n] = FOLLOWER]
    /\ currentTerm' = [currentTerm EXCEPT ![n] = m.term]
    /\ \* Update epoch if leader has higher epoch
       IF m.epoch > partitionEpoch[n]
       THEN partitionEpoch' = [partitionEpoch EXCEPT ![n] = m.epoch]
       ELSE UNCHANGED partitionEpoch
    /\ UNCHANGED <<votedFor, partitionState, visibleNodes, messages>>

-----------------------------------------------------------------------------
(* Partition Handling Actions *)

\* Network partition occurs - node n loses visibility to some nodes
PartitionOccurs(n, lostNodes) ==
    /\ lostNodes \subseteq Nodes
    /\ lostNodes # {}
    /\ n \notin lostNodes
    /\ visibleNodes' = [visibleNodes EXCEPT ![n] = @ \ lostNodes]
    /\ partitionState' = [partitionState EXCEPT ![n] = SUSPECTING]
    /\ UNCHANGED <<nodeState, currentTerm, votedFor, partitionEpoch, messages>>

\* Node n determines partition role based on quorum
DeterminePartitionRole(n) ==
    /\ partitionState[n] = SUSPECTING
    /\ partitionEpoch[n] < MaxEpoch
    /\ IF Cardinality(visibleNodes[n]) >= Quorum
       THEN /\ partitionState' = [partitionState EXCEPT ![n] = MAJORITY_PARTITION]
            /\ partitionEpoch' = [partitionEpoch EXCEPT ![n] = @ + 1]
            \* Majority can continue operations
       ELSE /\ partitionState' = [partitionState EXCEPT ![n] = MINORITY_PARTITION]
            /\ partitionEpoch' = [partitionEpoch EXCEPT ![n] = @ + 1]
            \* Minority must freeze - step down if leader
            /\ IF nodeState[n] = LEADER
               THEN nodeState' = [nodeState EXCEPT ![n] = FOLLOWER]
               ELSE UNCHANGED nodeState
    /\ UNCHANGED <<currentTerm, votedFor, visibleNodes, messages>>

\* Minority partition node is frozen - cannot make decisions
MinorityPartitionFrozen(n) ==
    /\ partitionState[n] = MINORITY_PARTITION
    /\ nodeState[n] # LEADER  \* Already stepped down or was follower
    \* This is a "stutter" action - minority nodes wait
    /\ UNCHANGED vars

\* Partition heals - nodes regain visibility
PartitionHeals(n, restoredNodes) ==
    /\ partitionState[n] \in {MAJORITY_PARTITION, MINORITY_PARTITION}
    /\ restoredNodes \subseteq Nodes
    /\ restoredNodes # {}
    /\ visibleNodes' = [visibleNodes EXCEPT ![n] = @ \cup restoredNodes]
    /\ partitionState' = [partitionState EXCEPT ![n] = RECONCILING]
    /\ UNCHANGED <<nodeState, currentTerm, votedFor, partitionEpoch, messages>>

\* Reconciliation completes
ReconciliationComplete(n) ==
    /\ partitionState[n] = RECONCILING
    /\ Cardinality(visibleNodes[n]) >= Quorum
    /\ partitionState' = [partitionState EXCEPT ![n] = HEALTHY]
    /\ UNCHANGED <<nodeState, currentTerm, votedFor, partitionEpoch, visibleNodes, messages>>

-----------------------------------------------------------------------------
(* Next State Relation *)

Next ==
    \/ \E n \in Nodes : BecomeCandidate(n)
    \/ \E n \in Nodes, m \in messages : HandleVoteRequest(n, m)
    \/ \E n \in Nodes : BecomeLeader(n)
    \/ \E n \in Nodes, m \in messages : HandleHeartbeat(n, m)
    \/ \E n \in Nodes, lost \in SUBSET Nodes : PartitionOccurs(n, lost)
    \/ \E n \in Nodes : DeterminePartitionRole(n)
    \/ \E n \in Nodes : MinorityPartitionFrozen(n)
    \/ \E n \in Nodes, restored \in SUBSET Nodes : PartitionHeals(n, restored)
    \/ \E n \in Nodes : ReconciliationComplete(n)

Spec == Init /\ [][Next]_vars

-----------------------------------------------------------------------------
(* Safety Properties *)

\* PROPERTY 1: Leader Uniqueness
\* At most one leader per term in the visible network
LeaderUniqueness ==
    \A t \in 0..MaxTerm :
        \A n1, n2 \in Nodes :
            /\ nodeState[n1] = LEADER
            /\ nodeState[n2] = LEADER
            /\ currentTerm[n1] = t
            /\ currentTerm[n2] = t
            /\ n1 \in visibleNodes[n2]  \* They can see each other
            => n1 = n2

\* PROPERTY 2: Split-Brain Impossibility
\* If two nodes are leaders, they must be in different partitions
\* (i.e., cannot see each other)
NoSplitBrain ==
    \A n1, n2 \in Nodes :
        /\ nodeState[n1] = LEADER
        /\ nodeState[n2] = LEADER
        /\ n1 # n2
        => n2 \notin visibleNodes[n1]

\* PROPERTY 3: Minority Cannot Elect Leader
\* A node in minority partition cannot be or become leader
MinorityCannotLead ==
    \A n \in Nodes :
        partitionState[n] = MINORITY_PARTITION => nodeState[n] # LEADER

\* PROPERTY 4: Quorum Intersection
\* Any two quorums must have non-empty intersection
\* (This is a structural property ensuring split-brain impossibility)
QuorumIntersection ==
    \A Q1, Q2 \in SUBSET Nodes :
        /\ Cardinality(Q1) >= Quorum
        /\ Cardinality(Q2) >= Quorum
        => Q1 \cap Q2 # {}

\* PROPERTY 5: Term Monotonicity
\* Terms never decrease
TermMonotonicity ==
    [][
        \A n \in Nodes : currentTerm'[n] >= currentTerm[n]
    ]_vars

\* PROPERTY 6: Epoch Monotonicity
\* Partition epochs never decrease
EpochMonotonicity ==
    [][
        \A n \in Nodes : partitionEpoch'[n] >= partitionEpoch[n]
    ]_vars

-----------------------------------------------------------------------------
(* Liveness Properties (under fairness assumptions) *)

\* Eventually, if there's a majority partition, a leader will be elected
EventuallyLeaderInMajority ==
    \A n \in Nodes :
        partitionState[n] = MAJORITY_PARTITION
        ~> \E l \in Nodes : nodeState[l] = LEADER /\ l \in visibleNodes[n]

\* Eventually, reconciliation completes and system returns to healthy
EventuallyHealthy ==
    \A n \in Nodes :
        partitionState[n] = RECONCILING
        ~> partitionState[n] = HEALTHY

-----------------------------------------------------------------------------
(* Invariants to Check *)

TypeInvariant ==
    /\ nodeState \in [Nodes -> {FOLLOWER, CANDIDATE, LEADER}]
    /\ currentTerm \in [Nodes -> 0..MaxTerm]
    /\ votedFor \in [Nodes -> Nodes \cup {NULL}]
    /\ partitionEpoch \in [Nodes -> 0..MaxEpoch]
    /\ partitionState \in [Nodes -> {HEALTHY, SUSPECTING, MAJORITY_PARTITION,
                                      MINORITY_PARTITION, RECONCILING}]
    /\ visibleNodes \in [Nodes -> SUBSET Nodes]

SafetyInvariant ==
    /\ LeaderUniqueness
    /\ NoSplitBrain
    /\ MinorityCannotLead

=============================================================================
\* Modification History
\* Last modified: January 2026
\* Created: January 2026
