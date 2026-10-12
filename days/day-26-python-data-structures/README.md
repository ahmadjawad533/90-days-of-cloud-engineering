# Day 26: Python Data Structures

[← Previous Day](../day-25-python-basics/README.md) | [Next Day →](../day-27-file-io-error-handling/README.md)

## Goal
Manipulate lists, dictionaries, tuples, sets, and nested data structures to parse cloud resource inventories and API responses.

## Time
⏱️ Approximately 80 minutes

## Learn
- 📖 [The Python Tutorial — Data Structures](https://docs.python.org/3/tutorial/datastructures.html) — Official guide covering list methods, list comprehensions, tuples, sets, and dictionaries.
- 📖 [The Python Tutorial — Looping Techniques](https://docs.python.org/3/tutorial/datastructures.html#looping-techniques) — Official documentation on `items()`, `enumerate()`, and filtering data structures.

## Do
Cloud provider APIs (AWS Boto3, Azure SDK, Google Cloud Client Libraries) return structured data as nested dictionaries and lists. Being proficient with dictionary lookups, filtering lists, and extracting nested keys is an essential cloud engineering skill.

1. **Create your Day 26 working directory**
   ```bash
   mkdir -p ~/cloud-python/day-26
   cd ~/cloud-python/day-26
   ```

2. **Understand the core cloud data structures**
   - **List `[]`**: Ordered, mutable sequence (e.g., list of instance IDs, list of IP addresses).
   - **Dict `{}`**: Key-value pairs (e.g., tags, configuration parameters, API JSON payloads).
   - **Tuple `()`**: Immutable sequence (e.g., `(host, port)` connection pairs).
   - **Set `{}`**: Unordered collection of unique items (e.g., finding unique AWS regions or deduplicating security group rules).

3. **Build an AWS-style resource inventory parser**
   Create a file named `parse_inventory.py` that mimics the nested dictionary response returned by cloud APIs:
   ```bash
   cat << 'EOF' > parse_inventory.py
   """Simulated Cloud API Response Parser."""

   # Typical AWS describe_instances structure
   ec2_inventory = {
       "Reservations": [
           {
               "ReservationId": "r-01a2b3c4d5",
               "Instances": [
                   {
                       "InstanceId": "i-0a1b2c3d4e5f60001",
                       "InstanceType": "t3.micro",
                       "State": {"Name": "running", "Code": 16},
                       "PrivateIpAddress": "10.0.1.45",
                       "Tags": [
                           {"Key": "Name", "Value": "prod-api-server-01"},
                           {"Key": "Environment", "Value": "production"},
                           {"Key": "Owner", "Value": "devops-team"},
                       ],
                   },
                   {
                       "InstanceId": "i-0a1b2c3d4e5f60002",
                       "InstanceType": "t3.small",
                       "State": {"Name": "stopped", "Code": 80},
                       "PrivateIpAddress": "10.0.1.46",
                       "Tags": [
                           {"Key": "Name", "Value": "staging-worker"},
                           {"Key": "Environment", "Value": "staging"},
                       ],
                   },
               ],
           },
           {
               "ReservationId": "r-09z8y7x6w5",
               "Instances": [
                   {
                       "InstanceId": "i-0a1b2c3d4e5f60003",
                       "InstanceType": "t3.large",
                       "State": {"Name": "running", "Code": 16},
                       "PrivateIpAddress": "10.0.2.100",
                       "Tags": [
                           {"Key": "Name", "Value": "prod-db-primary"},
                           {"Key": "Environment", "Value": "production"},
                           {"Key": "Backup", "Value": "daily"},
                       ],
                   }
               ],
           },
       ]
   }

   # Helper to safely extract a tag by key
   def get_tag_value(tags_list, key_name, default="<none>"):
       for tag in tags_list:
           if tag.get("Key") == key_name:
               return tag.get("Value")
       return default

   print("=== Cloud Instance Inventory ===")
   running_instances = []
   environments = set()

   for reservation in ec2_inventory.get("Reservations", []):
       for inst in reservation.get("Instances", []):
           inst_id = inst["InstanceId"]
           inst_type = inst["InstanceType"]
           state = inst["State"]["Name"]
           name_tag = get_tag_value(inst.get("Tags", []), "Name")
           env_tag = get_tag_value(inst.get("Tags", []), "Environment")

           environments.add(env_tag)

           if state == "running":
               running_instances.append(inst_id)

           print(f"ID: {inst_id} | Name: {name_tag:<20} | Type: {inst_type} | State: {state:<8} | Env: {env_tag}")

   print("\n=== Summary Metrics ===")
   print(f"Total Running Instances: {len(running_instances)} -> {running_instances}")
   print(f"Unique Environments: {sorted(list(environments))}")
   EOF
   ```

4. **Run the parser script**
   ```bash
   python3 parse_inventory.py
   ```

5. **Practice List and Dict Comprehensions**
   Create `comprehensions_demo.py` to practice concise data transformations:
   ```bash
   cat << 'EOF' > comprehensions_demo.py
   """Cloud Data Filtering with Comprehensions."""

   raw_subnets = [
       {"id": "subnet-01", "cidr": "10.0.1.0/24", "zone": "us-east-1a", "public": True},
       {"id": "subnet-02", "cidr": "10.0.2.0/24", "zone": "us-east-1b", "public": True},
       {"id": "subnet-03", "cidr": "10.0.3.0/24", "zone": "us-east-1a", "public": False},
       {"id": "subnet-04", "cidr": "10.0.4.0/24", "zone": "us-east-1b", "public": False},
   ]

   # List comprehension: Filter only public subnet IDs
   public_subnet_ids = [sub["id"] for sub in raw_subnets if sub["public"]]
   print(f"Public Subnet IDs: {public_subnet_ids}")

   # Dict comprehension: Map subnet ID to CIDR block
   subnet_map = {sub["id"]: sub["cidr"] for sub in raw_subnets}
   print(f"Subnet ID -> CIDR Map: {subnet_map}")

   # Set comprehension: Extract unique availability zones
   zones = {sub["zone"] for sub in raw_subnets}
   print(f"Unique Availability Zones: {zones}")
   EOF
   ```

6. **Run the comprehensions script**
   ```bash
   python3 comprehensions_demo.py
   ```

## Done When
- [ ] You ran `parse_inventory.py` and successfully extracted tags, instance IDs, and states from nested dicts.
- [ ] You identified how `.get()` prevents `KeyError` crashes when tags or keys are absent.
- [ ] You ran `comprehensions_demo.py` and filtered list items into lists, dict mappings, and deduplicated sets.

## Cost and Cleanup
$0 — no cloud resources used. Everything runs locally on your machine.
To clean up:
```bash
rm -rf ~/cloud-python/day-26
```

## Stretch Goal
Write a function `filter_instances(inventory, required_tags)` that accepts the inventory dictionary and a dictionary of required tags (e.g. `{"Environment": "production"}`). Return a list of instance IDs that match all specified tags.

## Common Mistakes
- **Direct Dictionary Key Access (`dict['key']`)**: If `'key'` does not exist, Python throws an unhandled `KeyError`. Always use `dict.get('key', default_value)` when dealing with cloud provider API outputs where fields may be optional.
- **Modifying a List While Iterating Over It**: Calling `list.remove()` or `list.pop()` inside a `for item in list:` loop causes elements to be skipped. Iterate over a slice copy `for item in list[:]:` or use list comprehensions to filter.
- **Mutable Default Arguments**: Defining a function like `def append_tag(tag, tags=[])` reuses the same list across function calls. Always use `def append_tag(tag, tags=None): if tags is None: tags = []`.
