# Day 25: Python Basics for Cloud

[← Previous Day](../day-24-merge-conflicts/README.md) | [Next Day →](../day-26-python-data-structures/README.md)

## Goal
Master fundamental Python syntax, variables, types, and control flow relevant to cloud automation and scripting.

## Time
⏱️ Approximately 75 minutes

## Learn
- 📖 [The Python Tutorial — An Informal Introduction to Python](https://docs.python.org/3/tutorial/introduction.html) — Official documentation covering numbers, strings, variables, and interactive interpreter usage.
- 📖 [The Python Tutorial — More Control Flow Tools](https://docs.python.org/3/tutorial/controlflow.html) — Official guide on `if` statements, `for` loops, `range()`, and defining functions.

## Do
Cloud engineers rarely write large monolithic applications from scratch. Instead, they write scripts that parse configuration, check server health, filter cloud resources, and glue APIs together. Today, you will write your first cloud helper scripts in Python.

1. **Verify Python 3 is installed**
   Open your terminal and check your Python version:
   ```bash
   python3 --version
   ```
   Ensure you have Python 3.8 or higher.

2. **Create a workspace directory for Day 25**
   ```bash
   mkdir -p ~/cloud-python/day-25
   cd ~/cloud-python/day-25
   ```

3. **Experiment with the interactive REPL**
   Launch the Python interactive shell:
   ```bash
   python3
   ```
   Try basic arithmetic and variable assignment:
   ```python
   instance_count = 5
   cost_per_hour = 0.0416  # t3.medium hourly price
   daily_cost = instance_count * cost_per_hour * 24
   print(f"Estimated daily cost: ${daily_cost:.2f}")
   exit()
   ```

4. **Write an instance cost calculator script**
   Create a file named `cost_calculator.py`:
   ```bash
   cat << 'EOF' > cost_calculator.py
   """Cloud Instance Cost Calculator."""

   def calculate_monthly_cost(instance_type: str, count: int, hourly_rate: float) -> float:
       hours_in_month = 730  # Average hours in a month
       total = count * hourly_rate * hours_in_month
       return round(total, 2)

   instances = [
       {"type": "t3.micro", "count": 4, "hourly_rate": 0.0104},
       {"type": "t3.medium", "count": 2, "hourly_rate": 0.0416},
       {"type": "m5.large", "count": 1, "hourly_rate": 0.0960},
   ]

   grand_total = 0.0
   print("=== Monthly Cloud Cost Projection ===")

   for item in instances:
       cost = calculate_monthly_cost(item["type"], item["count"], item["hourly_rate"])
       grand_total += cost
       print(f"- {item['count']}x {item['type']} @ ${item['hourly_rate']}/hr: ${cost:.2f}/month")

   print(f"\nTotal Estimated Monthly Spend: ${grand_total:.2f}")

   # Budget alert threshold check
   budget_limit = 100.00
   if grand_total > budget_limit:
       print(f"⚠️  WARNING: Projected spend exceeds budget limit of ${budget_limit:.2f}!")
   else:
       print(f"✅ Spend is within budget limit of ${budget_limit:.2f}.")
   EOF
   ```

5. **Run the script and inspect output**
   ```bash
   python3 cost_calculator.py
   ```

6. **Create a server status checker script with control flow**
   Create a file named `server_status.py`:
   ```bash
   cat << 'EOF' > server_status.py
   """Server Status Evaluator."""

   def evaluate_server(name: str, cpu_utilization: float, memory_utilization: float, status_code: int) -> str:
       if status_code != 200:
           return f"CRITICAL: {name} returned HTTP {status_code}"
       elif cpu_utilization > 85.0 or memory_utilization > 90.0:
           return f"WARNING: {name} high resource load (CPU: {cpu_utilization}%, MEM: {memory_utilization}%)"
       else:
           return f"HEALTHY: {name} operating normally (CPU: {cpu_utilization}%, MEM: {memory_utilization}%)"

   servers = [
       ("web-server-01", 42.5, 60.1, 200),
       ("web-server-02", 89.2, 75.0, 200),
       ("api-gateway-01", 15.0, 30.5, 502),
       ("db-replica-01", 91.0, 95.5, 200),
   ]

   for name, cpu, mem, code in servers:
       result = evaluate_server(name, cpu, mem, code)
       print(result)
   EOF
   ```

7. **Execute and observe how conditionals branch**
   ```bash
   python3 server_status.py
   ```

## Done When
- [ ] `python3 --version` displays Python 3.8 or newer.
- [ ] You launched the Python interactive shell, executed expressions, and cleanly exited.
- [ ] `cost_calculator.py` executed successfully and printed per-instance and total projected costs.
- [ ] `server_status.py` evaluated different server conditions and correctly categorized CRITICAL, WARNING, and HEALTHY nodes.

## Cost and Cleanup
$0 — no cloud resources used. Everything runs locally on your machine.
To clean up local files when finished:
```bash
rm -rf ~/cloud-python/day-25
```

## Stretch Goal
Extend `cost_calculator.py` to prompt the user interactively using `input()` for an instance type, count, and hourly price, then dynamically calculate the cost and output whether it fits within an entered budget.

## Common Mistakes
- **Mixing Tabs and Spaces**: Python relies on consistent whitespace indentation. Always use 4 spaces per indentation level. Mixing tabs and spaces results in an `IndentationError`.
- **String and Number Concatenation**: Trying to do `"Total: " + cost` will raise a `TypeError`. Use f-strings (`f"Total: {cost}"`) or explicit conversion `str(cost)`.
- **Confusing `=` with `==`**: Using `=` in an `if` condition assigns a value rather than testing equality. Python will raise a `SyntaxError`. Always use `==` for comparisons.
