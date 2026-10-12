# Day 06: Load Balancing and CDNs

[← Previous Day](../day-05-ip-subnets-cidr/README.md) | [Next Day →](../day-07-networking-review-project/README.md)

## Goal
Understand how modern cloud architectures achieve high availability, fault tolerance, and low latency using Layer 4 & Layer 7 Load Balancers and Content Delivery Networks (CDNs).

## Time
⏱️ Approximately 75 minutes

## Learn
- 📖 [What is a CDN? - Cloudflare](https://www.cloudflare.com/learning/cdn/what-is-a-cdn/) — How Content Delivery Networks work, edge servers, caching, and latency reduction.
- 📖 [Elastic Load Balancing - AWS](https://aws.amazon.com/elasticloadbalancing/) — Architectural overview of Layer 4 vs Layer 7 load balancers, health checks, and traffic distribution.

## Do
1. Create a workspace directory for today's exercises:
   ```bash
   mkdir -p ~/cloud-engineering-journey/day-06
   cd ~/cloud-engineering-journey/day-06
   ```

2. Document Load Balancers and CDN principles in `traffic_management.md`:
   ```bash
   cat << 'EOF' > traffic_management.md
   # Load Balancing & Content Delivery Networks (CDNs)

   ## Layer 4 vs. Layer 7 Load Balancing
   - **Layer 4 (Transport / NLB):**
     - Operates on IP addresses and TCP/UDP ports.
     - Extremely fast; millions of requests per second with ultra-low latency.
     - Does not inspect application payload or HTTP headers.
     - Ideal for gaming servers, real-time streaming, and non-HTTP TCP sockets.
   - **Layer 7 (Application / ALB):**
     - Operates on HTTP/HTTPS data (URLs, paths, headers, cookies).
     - Can route traffic intelligently (e.g., `/api/*` to backend service, `/images/*` to static storage).
     - Handles SSL/TLS termination, redirects (HTTP -> HTTPS), and sticky sessions.

   ## Common Load Balancing Algorithms
   - **Round Robin:** Sequential request distribution across all healthy instances.
   - **Least Connections:** Routes new requests to the instance with the fewest active connections.
   - **IP Hash / Source Hash:** Maps client IP to a specific backend server for session stickiness.

   ## Health Checks: Keeping Applications Resilient
   Load balancers periodically query target servers (e.g., `GET /healthz`). If a server fails consecutive checks (unhealthy threshold), the load balancer stops routing traffic to it until it recovers.
   EOF
   ```

3. Build and run a local Python simulation of a Layer 7 Round-Robin reverse proxy with two mock backend services:
   ```bash
   cat << 'EOF' > lb_demo.py
   import http.server
   import socketserver
   import threading
   import urllib.request
   import time

   # Backend Server 1 (Port 8001)
   class Backend1(http.server.SimpleHTTPRequestHandler):
       def do_GET(self):
           self.send_response(200)
           self.send_header("Content-Type", "text/plain")
           self.end_headers()
           self.wfile.write(b"Response from Backend Server 1 [Port 8001]\n")
       def log_message(self, format, *args): return

   # Backend Server 2 (Port 8002)
   class Backend2(http.server.SimpleHTTPRequestHandler):
       def do_GET(self):
           self.send_response(200)
           self.send_header("Content-Type", "text/plain")
           self.end_headers()
           self.wfile.write(b"Response from Backend Server 2 [Port 8002]\n")
       def log_message(self, format, *args): return

   # Simple Round-Robin Load Balancer (Port 8000)
   backends = ["http://127.0.0.1:8001", "http://127.0.0.1:8002"]
   current_idx = 0
   lock = threading.Lock()

   class LoadBalancer(http.server.SimpleHTTPRequestHandler):
       def do_GET(self):
           global current_idx
           with lock:
               target = backends[current_idx]
               current_idx = (current_idx + 1) % len(backends)
           try:
               req = urllib.request.urlopen(target)
               body = req.read()
               self.send_response(200)
               self.send_header("Content-Type", "text/plain")
               self.send_header("X-Proxy-Target", target)
               self.end_headers()
               self.wfile.write(body)
           except Exception as e:
               self.send_response(502)
               self.end_headers()
               self.wfile.write(f"502 Bad Gateway: {e}".encode())
       def log_message(self, format, *args): return

   def run():
       s1 = socketserver.TCPServer(("127.0.0.1", 8001), Backend1)
       s2 = socketserver.TCPServer(("127.0.0.1", 8002), Backend2)
       lb = socketserver.TCPServer(("127.0.0.1", 8000), LoadBalancer)

       threading.Thread(target=s1.serve_forever, daemon=True).start()
       threading.Thread(target=s2.serve_forever, daemon=True).start()
       print("Load Balancer active on http://127.0.0.1:8000 (Forwarding to 8001 and 8002)...")
       lb.serve_forever()

   if __name__ == "__main__":
       run()
   EOF
   ```

4. Launch the load balancer simulation in the background and test Round Robin distribution:
   ```bash
   python3 lb_demo.py &
   LB_PID=$!
   sleep 1

   # Send 4 consecutive requests to the load balancer
   for i in {1..4}; do
       curl -s http://127.0.0.1:8000
   done

   kill $LB_PID 2>/dev/null || true
   ```
   Notice how each alternating request is served by Server 1, then Server 2, then Server 1, then Server 2!

5. Inspect live CDN caching headers on the public internet using `curl -I`:
   ```bash
   curl -s -I https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js | grep -iE "cache-control|cf-cache-status|x-cache|age|content-type"
   ```
   Look for:
   - `cf-cache-status: HIT` or `x-cache: Hit from cloudfront`: Indicates the response came from an edge server cache near you, not the origin server.
   - `age`: Indicates how many seconds the asset has been cached at the edge server.
   - `cache-control: public, max-age=...`: Tells browsers and CDN edge servers how long they may cache the file.

## Done When
- [ ] You can describe the differences between Layer 4 (Network) and Layer 7 (Application) load balancing.
- [ ] You can explain what a load balancer health check does and how it prevents 502/503 errors.
- [ ] You executed the local Round-Robin load balancer and verified alternating responses.
- [ ] You inspected real-world CDN caching headers (`cf-cache-status`, `age`, `cache-control`) using `curl`.

## Cost and Cleanup
$0 — no cloud resources used.

## Stretch Goal
Read about **Anycast routing**. Write a brief note in `traffic_management.md` explaining how Anycast allows hundreds of geographically distributed CDN edge servers around the globe to share the exact same public IP address, routing users to the nearest physical data center via BGP (Border Gateway Protocol).

## Common Mistakes
- **Assuming CDNs eliminate the need for an origin server**: CDNs are edge caches; if an asset is not cached (cache miss) or expires, the CDN must still contact your origin server to retrieve it.
- **Forgetting about sticky sessions with stateful apps**: If an application stores session state in local memory instead of a shared store like Redis, requests must use sticky sessions (session affinity) on the load balancer to avoid users being abruptly logged out.
- **Misconfiguring health check paths**: Pointing health checks to an expensive heavy endpoint (like a complex database query) can overload your servers just from health check traffic alone. Always use a dedicated, lightweight `/healthz` or `/status` endpoint.
