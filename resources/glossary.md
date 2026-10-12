# Cloud Engineering Glossary

A quick-reference dictionary of 80+ essential cloud engineering, DevOps, networking, Linux, container, and infrastructure terms arranged alphabetically from A to Z.

---

## A
- **API Gateway**: A managed service that acts as a single reverse proxy entry point for client requests, handling routing, rate limiting, authentication, and protocol translation.
- **Application Load Balancer (ALB)**: A layer 7 load balancer that routes HTTP and HTTPS traffic based on request attributes such as URL paths, host headers, and query parameters.
- **Availability Zone (AZ)**: One or more discrete data centers with redundant power, networking, and connectivity within an AWS region.
- **Auto Scaling Group (ASG)**: A collection of EC2 instances managed as a logical group that automatically adjusts capacity up or down based on defined metrics and health checks.
- **Amazon Machine Image (AMI)**: A pre-configured virtual machine template containing an OS, software, and configuration used to launch EC2 instances.

## B
- **BGP (Border Gateway Protocol)**: A standardized exterior gateway protocol designed to exchange routing and reachability information among autonomous systems on the internet.
- **Bastion Host (Jump Box)**: A hardened, dedicated server located in a public subnet used as a secure proxy to access private instances via SSH.
- **Block Storage**: Storage architecture that splits data into evenly sized blocks with unique identifiers, typically attached to virtual machines (e.g., AWS EBS).
- **Blue-Green Deployment**: A release management strategy that minimizes downtime and risk by running two identical production environments ("Blue" and "Green") and switching traffic between them.
- **Bucket (S3)**: A top-level logical container for storing objects in Amazon Simple Storage Service (S3).

## C
- **Canary Deployment**: A deployment technique where new software versions are rolled out to a small percentage of users before expanding to the entire fleet.
- **CIDR (Classless Inter-Domain Routing)**: A method for allocating IP addresses and IP routing using prefix notation (e.g., `10.0.0.0/16`).
- **CDN (Content Delivery Network)**: A geographically distributed network of proxy edge servers that caches content close to end users to reduce latency.
- **CI/CD (Continuous Integration / Continuous Delivery)**: An automated methodology where code changes are regularly built, tested, packaged, and deployed to production.
- **CloudFormation**: AWS's native template-driven Infrastructure as Code service using JSON or YAML.
- **CloudWatch**: An AWS monitoring and observability service that collects metrics, logs, and triggers automated alarm actions.
- **CNI (Container Network Interface)**: A CNCF specification and library for configuring network interfaces in Linux containers and Kubernetes pods.
- **Container**: A lightweight, standalone, executable package of software that includes everything needed to run an application (code, runtime, system tools, libraries).
- **Control Plane**: The management layer of a distributed system (such as Kubernetes or AWS) responsible for maintaining desired state, scheduling, and orchestrating nodes.
- **CSI (Container Storage Interface)**: A standard specification for exposing block and file storage systems to containerized workloads on Kubernetes.
- **CRUD**: An acronym representing the four fundamental database operations: Create, Read, Update, and Delete.

## D
- **DaemonSet**: A Kubernetes workload controller ensuring that all (or some) nodes run a single copy of a specified Pod (often used for log collectors or monitoring agents).
- **Data Plane**: The layer of an architecture responsible for processing and forwarding actual user data and network packets based on control plane decisions.
- **DHCP (Dynamic Host Configuration Protocol)**: A network management protocol used to dynamically assign IP addresses and other configuration parameters to devices.
- **DNS (Domain Name System)**: The internet naming system that translates human-readable domain names (like `example.com`) into numerical IP addresses.
- **Docker**: An open-source platform that automates the building, packaging, shipping, and running of applications inside isolated containers.
- **Dockerfile**: A text document containing sequential instructions to build a runnable container image.
- **Drift (IaC)**: The discrepancy between the real-world state of cloud infrastructure and the declared configuration in an Infrastructure as Code template.

## E
- **EBS (Elastic Block Store)**: High-performance, persistent block storage volumes designed for use with Amazon EC2 instances.
- **EC2 (Elastic Compute Cloud)**: A web service that provides resizable, on-demand compute capacity (virtual machines) in the AWS cloud.
- **ECR (Elastic Container Registry)**: A fully managed Docker container registry service provided by AWS for storing, managing, and deploying container images.
- **ECS (Elastic Container Service)**: A fully managed container orchestration service developed by AWS that supports Docker containers.
- **EFS (Elastic File System)**: A serverless, fully elastic network file system (NFS) that can be concurrently mounted across thousands of compute instances.
- **Egress**: Network traffic exiting or leaving a private network, cloud VPC, or data center boundary.
- **EKS (Elastic Kubernetes Service)**: A managed Kubernetes service provided by AWS that automates control plane provisioning and maintenance.
- **Elastic IP**: A static, public IPv4 address designed for dynamic cloud computing that can be rapidly remapped to any EC2 instance in a region.
- **Envoy**: An open-source, high-performance edge and service proxy designed for cloud-native applications and service meshes.
- **Ephemeral Storage**: Temporary storage allocated to a compute instance or container that is automatically destroyed when the instance stops or terminates.

## F
- **Fargate**: A serverless compute engine for containers on AWS that runs containers without requiring you to manage underlying EC2 virtual machine servers.
- **Firewall**: A network security device or software filter that monitors and controls incoming and outgoing network traffic based on predetermined rules.

## G
- **GitOps**: An operational framework where Git repositories serve as the single source of truth for declaratively defining infrastructure and application deployments.
- **Grafana**: An open-source multi-platform visualization and analytics web application that graphs time-series metrics from Prometheus, CloudWatch, and other sources.
- **gRPC**: A high-performance, open-source universal Remote Procedure Call (RPC) framework developed by Google that uses HTTP/2 and Protocol Buffers.

## H
- **Health Check**: An automated probe sent periodically by a load balancer or orchestrator to verify whether a service instance or container is ready to accept traffic.
- **Helm**: A package manager for Kubernetes that packages, configures, and deploys complex applications using reusable charts.
- **Horizontal Scaling**: Adding or removing more instances of a workload (scaling out/in) to handle changing traffic loads.

## I
- **IaC (Infrastructure as Code)**: The practice of managing and provisioning computing infrastructure through human-readable, version-controlled definition files rather than manual processes.
- **IAM (Identity and Access Management)**: A framework of policies and technologies that controls authentication and authorization to cloud resources.
- **Idempotency**: A property of an operation whereby performing it multiple times yields the same result as performing it once.
- **Ingress**: Network traffic entering a private network, cloud VPC, or Kubernetes cluster from an external origin.
- **Ingress Controller (K8s)**: A specialized load balancer and reverse proxy that implements the Kubernetes Ingress resource to route HTTP/S traffic to cluster services.
- **Internet Gateway (IGW)**: A horizontally scaled, redundant VPC component that allows communication between instances in a public subnet and the public internet.
- **Instance**: A virtual server running in a cloud provider's compute environment (e.g., an EC2 instance).

## K
- **Kubelet**: An agent that runs on each node in a Kubernetes cluster, ensuring that containers described in PodSpecs are running and healthy.
- **Kubernetes (K8s)**: An open-source system for automating deployment, scaling, and management of containerized applications.

## L
- **Lambda**: A serverless, event-driven compute service from AWS that runs code in response to events without provisioning or managing servers.
- **Least Privilege**: The information security principle stating that a user or system entity should be granted only the minimum permissions necessary to perform its intended job.
- **Load Balancer**: A device or software service that distributes incoming network traffic across multiple backend servers to ensure high availability and responsiveness.

## M
- **Microservice**: An architectural style that structures an application as a collection of small, autonomous, loosely coupled services organized around business domains.
- **Multi-AZ**: An AWS deployment pattern where resources (such as RDS databases) are replicated across multiple distinct Availability Zones to provide high availability and failover.

## N
- **NACL (Network Access Control List)**: An optional, stateless subnet-level security layer that controls inbound and outbound traffic using ordered allow and deny rules.
- **NAT Gateway (Network Address Translation)**: A managed cloud service that allows instances in a private subnet to connect outbound to the internet while preventing external services from initiating inbound connections.
- **Namespace (K8s / Linux)**: A mechanism to isolate resources, processes, network stacks, or cluster workloads into separate virtual environments.
- **Network Interface (ENI)**: A virtual network interface card attached to an EC2 instance that contains private and public IP addresses, MAC addresses, and security groups.
- **Node**: A physical or virtual worker machine within a computing cluster (such as a Kubernetes cluster) capable of running workloads.

## O
- **Object Storage**: A data storage architecture that manages data as unstructured objects with metadata and a globally unique identifier (e.g., Amazon S3), accessed via HTTP REST APIs.
- **Observability**: The degree to which the internal state of a system can be inferred from knowledge of its external outputs (metrics, logs, and distributed traces).
- **Orchestration**: The automated configuration, coordination, and management of computer systems, containers, middleware, and services.

## P
- **Pod**: The smallest deployable unit of compute in Kubernetes, consisting of one or more co-located containers sharing storage, network, and execution specifications.
- **Prometheus**: An open-source systems monitoring and alerting toolkit that collects and stores metrics as time-series data using a pull-based HTTP model.
- **Public Subnet**: A subnet whose route table contains an explicit route to an Internet Gateway (`0.0.0.0/0 -> igw-xxxx`).

## R
- **RDS (Relational Database Service)**: A managed cloud database service from AWS supporting engines like PostgreSQL, MySQL, MariaDB, and Oracle.
- **Region**: A separate geographic area in the world containing multiple isolated and physically separated Availability Zones.
- **ReplicaSet**: A Kubernetes controller that maintains a stable set of replica Pods running at any given time.
- **REST (Representational State Transfer)**: A software architectural style for distributed hypermedia systems that utilizes standard HTTP verbs (GET, POST, PUT, DELETE) and stateless communication.
- **Route Table**: A set of routing rules (associations of destination CIDR blocks to target gateways/interfaces) determining where network traffic from subnets is directed.

## S
- **S3 (Simple Storage Service)**: An industry-leading, highly scalable, durable (99.999999999%), and secure object storage service provided by AWS.
- **SaaS (Software as a Service)**: A cloud computing model where users access fully hosted software applications over the internet on a subscription basis.
- **Secrets Manager**: A managed security service used to store, rotate, monitor, and retrieve sensitive credentials, API keys, and database passwords securely.
- **Security Group**: A stateful virtual firewall associated with network interfaces or compute instances that controls inbound and outbound traffic at the instance level.
- **Serverless**: A cloud execution model where the cloud provider dynamically manages the allocation and provisioning of servers, scaling from zero and billing strictly on execution time.
- **Service Mesh**: A dedicated infrastructure layer (e.g., Istio, Linkerd) for handling service-to-service communication, mutual TLS encryption, traffic routing, and observability across microservices.
- **Snapshot**: A point-in-time incremental backup of an EBS volume, RDS database, or virtual disk stored durably in object storage.
- **SSH (Secure Shell)**: A cryptographic network protocol for operating network services and remote server administration securely over an unsecured network.
- **SSL/TLS (Secure Sockets Layer / Transport Layer Security)**: Cryptographic protocols designed to provide end-to-end communication security and encryption over a computer network.
- **State File (Terraform)**: A JSON file used by Terraform (`terraform.tfstate`) to map real-world infrastructure resources to your configuration files and keep track of metadata.
- **Stateful vs Stateless**: A stateless application retains no stored client session data between requests, whereas a stateful application preserves client session state and database records across sessions.
- **Subnet**: A logical subdivision of an IP network within a VPC, bound to a single Availability Zone.

## T
- **Terraform**: An open-source declarative Infrastructure as Code software tool created by HashiCorp that provisions cloud and on-premises resources using HashiCorp Configuration Language (HCL).
- **Transit Gateway (TGW)**: A network transit hub in AWS that connects thousands of Virtual Private Clouds (VPCs) and on-premises networks together via a central gateway.
- **Trivy**: A comprehensive, fast, and open-source vulnerability and misconfiguration scanner for container images, Git repositories, and Kubernetes.

## V
- **Vertical Scaling**: Increasing or decreasing the compute, memory, or I/O capacity of a single server or instance (scaling up/down).
- **VPC (Virtual Private Cloud)**: A logically isolated virtual network dedicated to your cloud account that closely resembles a traditional on-premises data center network.
- **VPC Peering**: A direct network connection between two VPCs that enables routing traffic between them using private IPv4 or IPv6 addresses.
- **VPN (Virtual Private Network)**: An encrypted communication tunnel that connects an on-premises network or individual user device securely to a cloud VPC over the internet.

## W
- **WAF (Web Application Firewall)**: A layer 7 security firewall that monitors, filters, and blocks malicious HTTP/HTTPS traffic to and from web applications (e.g., stopping SQL injection and cross-site scripting).

## Y
- **YAML (YAML Ain't Markup Language)**: A human-readable data serialization language commonly used for configuration files in Kubernetes, Docker Compose, and CI/CD pipelines.
