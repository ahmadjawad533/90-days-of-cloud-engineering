# Day 03: How the Internet Works (DNS, HTTP)

[← Previous Day](../day-02-cloud-service-models/README.md) | [Next Day →](../day-04-tcp-ip-and-osi-model/README.md)

## Goal
Understand the core mechanisms of the internet, including how Domain Name System (DNS) maps human-readable names to IP addresses and how HTTP/HTTPS requests and responses exchange data.

## Time
⏱️ Approximately 75 minutes

## Learn
- 📖 [How Does the Internet Work? - MDN Web Docs](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/Web_mechanics/How_does_the_Internet_work) — Comprehensive breakdown of internet cables, packets, routers, ISPs, and IP routing.
- 📖 [An Overview of HTTP - MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview) — Deep dive into the client-server HTTP protocol, status codes, methods, and message structure.

## Do
1. Create a workspace directory for today's exercises:
   ```bash
   mkdir -p ~/cloud-engineering-journey/day-03
   cd ~/cloud-engineering-journey/day-03
   ```

2. Perform DNS lookups using `dig` (or `nslookup` / `host`) to inspect DNS record types:
   ```bash
   # Lookup an A record (IPv4 address)
   dig example.com A +noall +answer

   # Lookup AAAA record (IPv6 address)
   dig example.com AAAA +noall +answer

   # Lookup MX records (Mail servers)
   dig google.com MX +noall +answer

   # Lookup NS records (Authoritative Name Servers)
   dig example.com NS +noall +answer
   ```

3. Query specific recursive DNS resolvers (Cloudflare `1.1.1.1` and Google `8.8.8.8`) directly:
   ```bash
   dig @1.1.1.1 github.com +noall +answer
   dig @8.8.8.8 github.com +noall +answer
   ```
   Note the `TTL` (Time To Live) column in the answer section. This value indicates how many seconds intermediate resolvers are permitted to cache the record before asking authoritative servers again.

4. Inspect raw HTTP transactions using `curl -v` (verbose mode):
   ```bash
   # Inspect plain HTTP connection and redirect header (301 Moved Permanently)
   curl -v http://example.com
   ```
   Look for:
   - `>` lines: The HTTP request sent by the client (`GET / HTTP/1.1`, `Host: example.com`, `User-Agent`, etc.)
   - `<` lines: The HTTP response returned by the server (`HTTP/1.1 200 OK`, `Content-Type`, `Content-Length`)

5. Follow redirects and inspect HTTPS encrypted connections:
   ```bash
   # Follow redirect (-L) and view headers only (-I)
   curl -IL https://github.com
   ```

6. Inspect an SSL/TLS certificate chain using `openssl s_client`:
   ```bash
   openssl s_client -connect example.com:443 -servername example.com </dev/null 2>/dev/null | grep -E "subject|issuer|Verify return code"
   ```

## Done When
- [ ] You can explain the DNS resolution hierarchy (Root DNS -> TLD DNS -> Authoritative Name Server).
- [ ] You know the meaning of HTTP status codes: 200 (OK), 301 (Moved Permanently), 400 (Bad Request), 403 (Forbidden), 404 (Not Found), 500 (Internal Server Error), and 502/503 (Bad Gateway / Service Unavailable).
- [ ] You successfully resolved DNS records and inspected HTTP headers from your command line.

## Cost and Cleanup
$0 — no cloud resources used.

## Stretch Goal
Trace the route network packets travel from your machine to a public server using `traceroute` or `tracepath`:
```bash
tracepath -n 1.1.1.1
```
Analyze each hop along the path. Notice how your packets traverse your local default gateway, your ISP router, intermediate transit internet exchange points (IXPs), and finally reach Cloudflare's network.

## Common Mistakes
- **Confusing DNS A records and CNAME records**: An `A` record maps a domain name directly to an IPv4 address. A `CNAME` (Canonical Name) record aliases one domain name to another domain name, never directly to an IP address.
- **Ignoring DNS TTL during migrations**: If you change a DNS record while the old record has a 24-hour TTL (86400 seconds), users will continue routing to the old IP address until their local cache expires.
- **Assuming HTTPS encrypts the domain name during DNS lookup**: Traditional DNS queries over UDP port 53 are sent in plain text unless using modern encrypted DNS protocols like DNS over HTTPS (DoH) or DNS over TLS (DoT).
