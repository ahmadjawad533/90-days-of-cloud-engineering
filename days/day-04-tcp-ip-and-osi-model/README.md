# Day 04: TCP/IP and the OSI Model

[← Previous Day](../day-03-how-the-internet-works/README.md) | [Next Day →](../day-05-ip-subnets-cidr/README.md)

## Goal
Master the OSI 7-layer and TCP/IP 4-layer networking models, understand data encapsulation and decapsulation, and contrast reliable connection-oriented TCP with connectionless UDP.

## Time
⏱️ Approximately 75 minutes

## Learn
- 📖 [What is the OSI Model? - Cloudflare](https://www.cloudflare.com/learning/ddos/glossary/open-systems-interconnection-model-osi/) — Clear visual guide to the 7 layers of the OSI model and data encapsulation.
- 📖 [TCP (Transmission Control Protocol) - MDN Web Docs](https://developer.mozilla.org/en-US/docs/Glossary/TCP) — Explanation of reliable stream delivery, connections, and the TCP 3-way handshake.

## Do
1. Create a workspace directory for today's exercises:
   ```bash
   mkdir -p ~/cloud-engineering-journey/day-04
   cd ~/cloud-engineering-journey/day-04
   ```

2. Document the OSI 7-Layer model and its TCP/IP mapping in `osi_model.md`:
   ```bash
   cat << 'EOF' > osi_model.md
   # OSI vs. TCP/IP Model Mapping

   | OSI Layer # | OSI Layer Name | Primary Protocol Data Unit (PDU) | Core Responsibilities & Protocols | TCP/IP Model Equivalent |
   |:---:|:---|:---|:---|:---|
   | **7** | Application | Data | User-facing protocols (HTTP, HTTPS, DNS, SSH, SMTP) | Application Layer |
   | **6** | Presentation | Data | Data formatting, encryption, compression (TLS/SSL, JSON, JPEG) | Application Layer |
   | **5** | Session | Data | Authentication, session persistence, connection management | Application Layer |
   | **4** | Transport | Segments (TCP) / Datagrams (UDP) | End-to-end communication, port addressing, flow control (TCP, UDP) | Transport Layer |
   | **3** | Network | Packets | Logical IP addressing, routing across internetworks (IPv4, IPv6, ICMP, routers) | Internet / Network Layer |
   | **2** | Data Link | Frames | Physical addressing (MAC addresses), switches, local network hops | Network Interface / Link |
   | **1** | Physical | Bits | Physical mediums, electrical signals, optical fiber cables, radio frequencies | Network Interface / Link |

   ## Encapsulation Flow (Sending Data):
   Data (L7-L5) -> Segment (L4: adds Port header) -> Packet (L3: adds IP header) -> Frame (L2: adds MAC header & CRC trailer) -> Bits (L1: physical wire)
   EOF
   ```

3. Explore the TCP 3-Way Handshake mechanism:
   ```bash
   cat << 'EOF' >> osi_model.md

   ## TCP 3-Way Handshake (Connection Establishment)
   1. **SYN (Synchronize):** Client sends a SYN segment with an initial sequence number (ISN_c) to the server.
   2. **SYN-ACK (Synchronize-Acknowledge):** Server acknowledges receipt with ACK = ISN_c + 1 and sends its own SYN with ISN_s.
   3. **ACK (Acknowledge):** Client acknowledges the server's SYN with ACK = ISN_s + 1. The connection state transitions to ESTABLISHED.

   ## TCP 4-Way Handshake (Connection Teardown)
   1. Client sends FIN.
   2. Server responds with ACK.
   3. Server sends its own FIN when ready to close.
   4. Client responds with ACK and enters TIME_WAIT state before closing.
   EOF
   ```

4. Inspect active listening ports and TCP sockets on your machine using `ss`:
   ```bash
   # List all listening TCP sockets with numerical port addresses
   ss -tln

   # List all active established or pending TCP connections
   ss -tan
   ```

5. Experience raw TCP socket communication using `nc` (netcat):
   - In terminal window 1 (or running in the background), start a TCP listener on port 9000:
     ```bash
     nc -l -p 9000 &
     NC_PID=$!
     ```
   - Send data over a TCP connection using another netcat instance:
     ```bash
     echo "Hello Cloud Engineer over TCP Layer 4!" | nc 127.0.0.1 9000
     ```
   - Clean up the background netcat process:
     ```bash
     kill $NC_PID 2>/dev/null || true
     ```

6. Compare TCP vs UDP in `osi_model.md`:
   - **TCP**: Connection-oriented, guarantees packet delivery via acknowledgments, retransmits lost packets, preserves order, enforces congestion control. Used by HTTP/HTTPS, SSH, Git, Database connections.
   - **UDP**: Connectionless, best-effort delivery, no retransmissions, zero connection handshake overhead, low latency. Used by DNS queries, video streaming, VoIP, online gaming, DHCP.

## Done When
- [ ] You can recite the 7 layers of the OSI model and explain the mnemonic (e.g., "Please Do Not Throw Sausage Pizza Away").
- [ ] You can describe the TCP 3-way handshake (SYN, SYN-ACK, ACK) and why it is needed.
- [ ] You can explain why cloud load balancers and firewalls operate differently at Layer 4 (Transport) vs Layer 7 (Application).
- [ ] You used `ss` to inspect open ports and socket states on your local machine.

## Cost and Cleanup
$0 — no cloud resources used.

## Stretch Goal
Use `curl` with timing metrics to see how much time the TCP handshake takes versus TLS negotiation:
```bash
curl -w "\nDNS Lookup: %{time_namelookup}s\nTCP Connect: %{time_connect}s\nTLS Handshake: %{time_appconnect}s\nTotal Time: %{time_total}s\n" -so /dev/null https://aws.amazon.com
```
Notice how `time_connect` reflects the TCP 3-way handshake round trip, while `time_appconnect` captures the TLS handshake.

## Common Mistakes
- **Confusing Layer 3 (IP) with Layer 4 (Port)**: An IP address identifies the host device on a network; a port number identifies the specific application or process running on that host.
- **Assuming UDP is unreliable and therefore useless**: UDP is intentionally lightweight. Video and audio streaming prefer dropping an occasional frame over pausing audio to wait for a retransmitted packet.
- **Thinking security groups in the cloud can inspect HTTP URL paths**: AWS Security Groups operate at Layer 3/4 (IP addresses, protocols, port numbers). To inspect URLs, query parameters, or HTTP request bodies, you need a Layer 7 tool like an Application Load Balancer or Web Application Firewall (WAF).
