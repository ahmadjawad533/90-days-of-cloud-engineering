# Day 41: What Are Containers?
[← Previous Day](../day-40-three-tier-vpc/README.md) | [Next Day →](../day-42-docker-basics/README.md)

## Goal
Understand the core concepts of containers, how they fundamentally differ from virtual machines, and the Linux kernel primitives (namespaces and cgroups) that make container isolation possible.

## Time
⏱️ Approximately 60 minutes

## Learn
- 📖 [Docker Overview — Architecture and Concepts](https://docs.docker.com/get-started/docker-overview/) — Official guide explaining the Docker engine architecture, images, containers, and registries.
- 📖 [Docker Get Started Guide](https://docs.docker.com/get-started/) — High-level walkthrough of containerization fundamentals and terminology.

## Do
In this exercise, you will explore the exact Linux operating system features that enable containerization: Namespaces (isolation) and Control Groups (resource limits).

1. Open your terminal (Linux host, VM, or WSL2 on Windows).

2. Inspect the Linux process tree on your system to see how standard processes share a single kernel:
   ```bash
   ps -ef | head -n 20
   ```

3. View the active Linux namespaces currently registered by your operating system:
   ```bash
   lsns
   ```
   Notice the namespace types listed: `net` (networking), `pid` (process IDs), `mnt` (mount points), `ipc` (inter-process communication), `uts` (hostname), and `user` (user mapping). Containers use these exact namespaces to create an isolated runtime box.

4. Inspect the Control Groups (cgroups) supported by your running kernel:
   ```bash
   cat /proc/cgroups
   ```
   Look at controllers such as `cpu`, `memory`, `pids`, and `blkio`. When Docker restricts a container to "512 MB RAM", it configures the `memory` cgroup.

5. Test process isolation manually using the standard Linux `unshare` tool to see how a new hostname namespace works:
   ```bash
   # Run a subshell with an isolated UTS (hostname) namespace
   sudo unshare --uts bash
   
   # Change the hostname in this isolated shell
   hostname container-test
   
   # Verify the new hostname inside this namespace
   hostname
   
   # Exit the subshell
   exit
   
   # Verify that your host machine's hostname remains untouched
   hostname
   ```

6. Summarize the VM vs. Container comparison in your notes:
   - **Virtual Machines:** Include a full guest OS, virtual BIOS, virtual virtualized hardware, managed by a Hypervisor (Type 1 or Type 2). Heavyweight (GBs, minutes to boot).
   - **Containers:** Share the host OS kernel, package only the application binaries and dependencies, isolated via namespaces and cgroups. Lightweight (MBs, milliseconds to boot).

## Done When
- [ ] You can explain why containers start in sub-seconds compared to virtual machines.
- [ ] You verified your host's active namespaces using `lsns`.
- [ ] You inspected `/proc/cgroups` to see resource controllers.
- [ ] You successfully tested isolated namespaces using the `unshare` command without modifying your host system.

## Cost and Cleanup
$0 — no cloud resources used (run locally on your Linux machine or WSL2). No background processes were left running, so no cleanup is required.

## Stretch Goal
Explore how container filesystems work by examining the `chroot` command (`man chroot`). Read about the Open Container Initiative (OCI) image and runtime specifications to understand how industry standards ensure container portability across different container engines (Docker, Podman, containerd).

## Common Mistakes
- **Confusing containers with miniature virtual machines:** Containers do not boot an independent operating system kernel. They are simply isolated standard processes running directly on the host's Linux kernel.
- **Assuming container security equals VM isolation:** Because containers share the host kernel, a vulnerability in the host kernel can affect all containers on that host if containers are run with root privileges. Always follow the principle of least privilege.
- **Trying to run native Linux containers on bare Windows/macOS without a VM:** Linux containers require a Linux kernel. On macOS and Windows, Docker uses a lightweight Linux VM (such as WSL2 on Windows or HyperKit/Virtualization framework on macOS) behind the scenes to provide the Linux kernel.
