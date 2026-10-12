# Day 07: Cloud Networking Review and Project

[← Previous Day](../day-06-load-balancing-and-cdns/README.md) | [Next Day →](../day-08-intro-to-linux/README.md)

## Goal
Synthesize the foundational networking concepts from Days 1–6 into a comprehensive, interview-ready technical document: *"What happens when you type a URL into a browser and press Enter?"*

## Time
⏱️ Approximately 120 minutes

## Learn
- 📖 [How Does the Internet Work? - MDN Web Docs](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/Web_mechanics/How_does_the_Internet_work) — Review of fundamental internet infrastructure and protocol layers.
- 📖 [An Overview of HTTP - MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview) — Review of HTTP request/response lifecycles, headers, and status codes.

## Do
The question *"What happens when you type `https://www.example.com` into your browser and press Enter?"* is the single most common systems and cloud engineering interview question. It tests whether you understand how hardware, operating systems, networks, cryptography, and cloud infrastructure work together.

Today, you will build a complete, detailed architectural breakdown of this entire flow.

1. Create a workspace directory for your project:
   ```bash
   mkdir -p ~/cloud-engineering-journey/day-07
   cd ~/cloud-engineering-journey/day-07
   ```

2. Create the project file `what-happens-when-url.md`:
   ```bash
   cat << 'EOF' > what-happens-when-url.md
   # What Happens When You Type a URL into a Browser and Press Enter

   A complete technical walkthrough of the networking, systems, and cloud infrastructure lifecycle.

   ---

   ## Phase 1: URL Parsing & Local Caches
   1. **URL Breakdown:** The browser parses the user's input:
      - **Protocol:** `https://` (port 443) or `http://` (port 80).
      - **Host / Domain:** `www.example.com`.
      - **Path & Resource:** `/index.html` or `/api/v1/users`.
   2. **HSTS Check:** The browser verifies its HTTP Strict Transport Security (HSTS) preload list to ensure the connection must use HTTPS.
   3. **Local Cache Hierarchy:**
      - The browser checks its internal DNS cache.
      - If missing, the OS kernel checks its DNS cache.
      - The OS checks the local hosts file (`/etc/hosts` on Linux/macOS, `C:\Windows\System32\drivers\etc\hosts` on Windows).

   ## Phase 2: DNS Resolution Pipeline
   If the IP is not cached locally, the OS sends a query to the configured recursive resolver (e.g., your ISP or `1.1.1.1`):
   1. **Root Nameserver:** Recursive resolver asks a Root DNS server (`.`) for the `.com` Top-Level Domain (TLD) nameservers.
   2. **TLD Nameserver:** Resolver asks the `.com` TLD server for the authoritative nameservers of `example.com`.
   3. **Authoritative Nameserver:** Resolver asks the authoritative nameserver (e.g., AWS Route 53 or Cloudflare DNS) for the `A` (IPv4) or `AAAA` (IPv6) record.
   4. **Caching & Return:** The authoritative server returns the IP address along with a TTL. The resolver caches the result and returns the IP to the client OS.

   ## Phase 3: Network Routing & Local Gateway (ARP)
   1. The client checks if the target IP is on the local subnet using its subnet mask.
   2. Because it is outside the local network, the packet must go to the default gateway (router).
   3. **ARP (Address Resolution Protocol):** The client sends an ARP request (or checks its ARP cache) to find the MAC address of the default gateway router.
   4. **Packet Encapsulation:** The OS encapsulates the IP packet into an Ethernet frame (Layer 2) with the router's MAC address as the destination.
   5. **Internet Routing (BGP):** Routers across the internet use Border Gateway Protocol (BGP) to forward the packet across Autonomous Systems (AS) toward the destination data center.

   ## Phase 4: TCP 3-Way Handshake (Layer 4)
   Before any application data is sent, the client and server establish a reliable TCP connection:
   1. **SYN:** Client sends a TCP packet with the `SYN` flag set and an initial sequence number ($ISN_c$).
   2. **SYN-ACK:** Server responds with `SYN` and `ACK` ($ISN_c + 1$).
   3. **ACK:** Client sends `ACK` ($ISN_s + 1$). The connection state becomes `ESTABLISHED`.

   ## Phase 5: TLS 1.3 Cryptographic Handshake (Layer 6)
   Because HTTPS is requested, TLS encryption is established:
   1. **Client Hello:** Client sends supported cipher suites, TLS version, and a random key share.
   2. **Server Hello & Certificate:** Server selects cipher suite, provides its public SSL/TLS certificate, and sends its key share.
   3. **Certificate Validation:** Client validates the certificate against its trusted Certificate Authorities (CAs), checking domain name, expiration, and revocation status.
   4. **Session Key Derivation:** Both parties use Elliptic Curve Diffie-Hellman to derive matching symmetric session keys. All subsequent traffic is encrypted.

   ## Phase 6: Cloud Edge, Load Balancer & Application Tier (Layer 7)
   1. **CDN Edge Server:** If configured, the request reaches an Anycast edge location. If the static asset is cached (`HIT`), it returns immediately.
   2. **Application Load Balancer (ALB):** On a cache miss or dynamic request, traffic reaches the cloud ALB in a public subnet.
   3. **Health-checked Routing:** The ALB terminates TLS, evaluates routing rules, and forwards the plain HTTP request over an internal private subnet to a healthy backend container or VM.
   4. **Application & Database:** The backend application processes the request, executes queries against a managed database (e.g., Amazon RDS), and constructs an HTTP response.
   5. **HTTP Response:** The server returns HTTP headers (e.g., `200 OK`, `Content-Type: text/html`, cookies) and the HTML payload.

   ## Phase 7: Browser Rendering Engine
   1. **DOM Construction:** Browser parses raw HTML bytes into tokens, nodes, and the Document Object Model (DOM) tree.
   2. **CSSOM Construction:** Browser parses linked CSS styles into the CSS Object Model (CSSOM).
   3. **Render Tree:** Browser combines DOM and CSSOM into a Render Tree, filtering out hidden nodes (`display: none`).
   4. **Layout (Reflow):** Browser calculates exact pixel dimensions and screen coordinates for each element.
   5. **Painting:** Browser paints pixels onto the display buffer via the GPU.
   6. **Subsequent Assets:** As HTML is parsed, new requests are spawned asynchronously for images, stylesheets, fonts, and JavaScript files.
   EOF
   ```

3. Trace a live DNS resolution path to see the hierarchy in action using `dig +trace`:
   ```bash
   dig +trace example.com
   ```
   Notice the output displays the exact multi-tier query path:
   - Root servers (`a.root-servers.net` to `m.root-servers.net`)
   - TLD servers (`a.gtld-servers.net`)
   - Authoritative nameservers for the domain.

4. Inspect the combined TCP + TLS handshake timings using `curl`:
   ```bash
   curl -w "DNS: %{time_namelookup}s | TCP: %{time_connect}s | TLS: %{time_appconnect}s | First Byte: %{time_starttransfer}s | Total: %{time_total}s\n" -so /dev/null https://example.com
   ```

5. Review and finalize your `what-happens-when-url.md` file. Ensure you can explain every phase clearly without hesitation.

## Done When
- [ ] You have created and reviewed `what-happens-when-url.md` in your project folder.
- [ ] Your document thoroughly covers all 7 phases: URL parsing, DNS resolution, ARP/routing, TCP 3-way handshake, TLS handshake, cloud LB/CDN processing, and browser rendering.
- [ ] You used `dig +trace` and `curl` to observe these phases in real time from your terminal.
- [ ] You feel confident answering the classic interview question: *"What happens when you type a URL into a browser?"*

## Cost and Cleanup
$0 — no cloud resources used.

## Stretch Goal
Add an ASCII or Mermaid flowchart diagram directly inside your `what-happens-when-url.md` document illustrating the packet journey from user browser -> DNS -> CDN -> ALB -> EC2 / Container -> RDS Database -> Browser. Commit this file to your personal Git repository as your very first cloud engineering portfolio artifact!

## Common Mistakes
- **Forgetting the TLS handshake**: Many beginners jump straight from the TCP handshake into the HTTP GET request, omitting the TLS 1.3 key exchange and SSL certificate validation.
- **Skipping the local ARP and default gateway step**: Traffic cannot leave your laptop without resolving the Layer 2 MAC address of your local network router.
- **Neglecting the cloud infrastructure layer**: In modern production environments, requests rarely hit an application server directly; they almost always pass through a CDN edge, an Anycast IP, a Web Application Firewall (WAF), and a Layer 7 Load Balancer.
