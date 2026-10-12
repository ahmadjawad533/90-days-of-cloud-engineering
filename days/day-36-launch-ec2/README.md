# Day 36: Launch an EC2 Instance
[← Previous Day](../day-35-security-groups-nacls/README.md) | [Next Day →](../day-37-ec2-storage/README.md)

## Goal
Launch, bootstrap, and connect to a free-tier eligible Amazon EC2 Linux instance running an automated web server using user data and the AWS CLI.

## Time
⏱️ Approximately 75 minutes

## Learn
- 📖 [Amazon EC2 User Guide for Linux Instances](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/) — Official documentation covering EC2 instance lifecycle, instance families, Amazon Machine Images (AMIs), and configuration.
- 📖 [Run Commands at Launch with User Data](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/user-data.html) — AWS guide on bootstrapping instances with cloud-init shell scripts and retrieving instance metadata.

## Do
In this lab, you will query the latest Amazon Linux 2023 AMI, configure an SSH key pair and Security Group, launch a free-tier eligible instance with an automated user data script that starts an Nginx web server, and verify the deployment.

1. **Query the latest Amazon Linux 2023 AMI ID dynamically using SSM Parameter Store**:
   ```bash
   REGION="us-east-1"

   AMI_ID=$(aws ssm get-parameter \
     --region "${REGION}" \
     --name "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64" \
     --query "Parameter.Value" \
     --output text)

   echo "Resolved AMI ID: ${AMI_ID}"
   ```

2. **Create a dedicated SSH Key Pair**:
   ```bash
   aws ec2 create-key-pair \
     --region "${REGION}" \
     --key-name "day36-ec2-key" \
     --query "KeyMaterial" \
     --output text > day36-ec2-key.pem

   chmod 400 day36-ec2-key.pem
   echo "Saved private key to day36-ec2-key.pem"
   ```

3. **Create an EC2 Security Group for HTTP and SSH**:
   ```bash
   # Get your public IP for restricted SSH access
   MY_IP="$(curl -s https://checkip.amazonaws.com)/32"

   # Get default VPC ID
   DEFAULT_VPC_ID=$(aws ec2 describe-vpcs \
     --region "${REGION}" \
     --filters "Name=isDefault,Values=true" \
     --query "Vpcs[0].VpcId" \
     --output text)

   SG_ID=$(aws ec2 create-security-group \
     --region "${REGION}" \
     --group-name "day36-web-ec2-sg" \
     --description "Allow SSH and HTTP access" \
     --vpc-id "${DEFAULT_VPC_ID}" \
     --query "GroupId" \
     --output text)

   # Allow SSH only from your IP
   aws ec2 authorize-security-group-ingress \
     --region "${REGION}" \
     --group-id "${SG_ID}" \
     --protocol tcp \
     --port 22 \
     --cidr "${MY_IP}"

   # Allow HTTP from anywhere
   aws ec2 authorize-security-group-ingress \
     --region "${REGION}" \
     --group-id "${SG_ID}" \
     --protocol tcp \
     --port 80 \
     --cidr 0.0.0.0/0

   echo "Created Security Group: ${SG_ID}"
   ```

4. **Prepare the User Data Bootstrap Script**:
   Create a local file `userdata.sh` that installs Nginx and queries the Instance Metadata Service (IMDSv2) to render a landing page:
   ```bash
   cat << 'EOF' > userdata.sh
   #!/bin/bash
   dnf update -y
   dnf install -y nginx

   # Retrieve instance metadata using secure IMDSv2
   TOKEN=$(curl -s -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")
   INSTANCE_ID=$(curl -s -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/instance-id)
   AZ=$(curl -s -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/placement/availability-zone)

   cat << HTML > /usr/share/nginx/html/index.html
   <!DOCTYPE html>
   <html>
   <head><title>Day 36 EC2 Demo</title></head>
   <body style="font-family: Arial; text-align: center; margin-top: 50px;">
     <h1>Hello from Amazon EC2!</h1>
     <p><strong>Instance ID:</strong> ${INSTANCE_ID}</p>
     <p><strong>Availability Zone:</strong> ${AZ}</p>
     <p>Bootstrapped automatically via user data!</p>
   </body>
   </html>
   HTML

   systemctl enable nginx
   systemctl start nginx
   EOF
   ```

5. **Launch the Free-Tier Eligible EC2 Instance**:
   Use `t2.micro` (or `t3.micro` in regions where `t2.micro` is unavailable):
   ```bash
   INSTANCE_ID=$(aws ec2 run-instances \
     --region "${REGION}" \
     --image-id "${AMI_ID}" \
     --instance-type t2.micro \
     --key-name "day36-ec2-key" \
     --security-group-ids "${SG_ID}" \
     --user-data file://userdata.sh \
     --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=day36-web-server}]' \
     --query "Instances[0].InstanceId" \
     --output text)

   echo "Launched Instance ID: ${INSTANCE_ID}"
   ```

6. **Wait for the instance to enter the running state and test the web server**:
   ```bash
   aws ec2 wait instance-running --region "${REGION}" --instance-ids "${INSTANCE_ID}"

   PUBLIC_IP=$(aws ec2 describe-instances \
     --region "${REGION}" \
     --instance-ids "${INSTANCE_ID}" \
     --query "Reservations[0].Instances[0].PublicIpAddress" \
     --output text)

   echo "EC2 Public IP: ${PUBLIC_IP}"
   echo "Waiting 30 seconds for bootstrap script to finish installing Nginx..."
   sleep 30

   # Test via curl
   curl -s "http://${PUBLIC_IP}"
   ```

## Done When
- [ ] Instance `day36-web-server` is in the `running` state.
- [ ] SSH private key file `day36-ec2-key.pem` is generated and secured (`chmod 400`).
- [ ] Security group allows inbound port 80 and restricts port 22 to your IP.
- [ ] `curl http://${PUBLIC_IP}` returns the custom HTML page displaying the Instance ID and Availability Zone.

## Cost and Cleanup
Expected Cost: **$0.00** — The AWS Free Tier includes 750 hours/month of `t2.micro` or `t3.micro` Linux instances for the first 12 months.

Terminate the instance and remove security resources:
```bash
REGION="us-east-1"

# 1. Terminate the instance
aws ec2 terminate-instances --region "${REGION}" --instance-ids "${INSTANCE_ID}"
echo "Waiting for instance termination..."
aws ec2 wait instance-terminated --region "${REGION}" --instance-ids "${INSTANCE_ID}"

# 2. Delete the Security Group
aws ec2 delete-security-group --region "${REGION}" --group-id "${SG_ID}"

# 3. Delete the Key Pair and local files
aws ec2 delete-key-pair --region "${REGION}" --key-name "day36-ec2-key"
rm -f day36-ec2-key.pem userdata.sh

echo "Cleanup completed successfully."
```

## Azure / GCP Equivalents
| AWS | Azure | GCP |
|-----|-------|-----|
| Amazon EC2 Instance | Azure Virtual Machine (VM) | Compute Engine VM instance |
| AMI (Amazon Machine Image) | Azure VM Image / Marketplace Image | Compute Engine Image |
| User Data (cloud-init) | Custom Script Extension / Cloud-init | Startup Script (metadata) |
| Key Pair | Azure SSH Key Resource | Project / Instance Metadata SSH Keys |
| Instance Metadata Service (IMDSv2) | Azure Instance Metadata Service (IMDS) | Compute Engine Metadata Server |

- 📖 [Azure Virtual Machines Documentation](https://learn.microsoft.com/en-us/azure/virtual-machines/linux/overview)
- 📖 [Google Cloud Compute Engine Instances](https://cloud.google.com/compute/docs/instances)

## Stretch Goal
Connect without opening port 22: Attach the AWS managed policy `AmazonSSMManagedInstanceCore` to an IAM instance profile (learned on Day 32), attach that profile to your EC2 instance, and remove the port 22 inbound rule completely. Connect securely via the AWS Systems Manager Session Manager:
```bash
aws ssm start-session --target "${INSTANCE_ID}"
```

## Common Mistakes
- **Opening SSH (port 22) to `0.0.0.0/0`**: Exposing SSH to the entire world invites automated brute-force attacks within seconds. Always restrict to your current IP (`/32`) or utilize AWS Systems Manager Session Manager.
- **Using IMDSv1 instead of IMDSv2**: IMDSv1 (`http://169.254.169.254/latest/meta-data/`) is vulnerable to SSRF attacks. Always acquire a token via `PUT` request first when querying metadata.
- **Forgetting to wait for cloud-init**: User data runs asynchronously upon boot. Attempting to `curl` the instance immediately after it enters the `running` state will often return `Connection refused` until package installation completes.
