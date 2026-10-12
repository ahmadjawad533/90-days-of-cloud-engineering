# Day 37: EC2 Storage (EBS and Instance Store)
[← Previous Day](../day-36-launch-ec2/README.md) | [Next Day →](../day-38-s3-buckets/README.md)

## Goal
Master cloud block storage by creating, attaching, formatting, and mounting Amazon EBS volumes, taking point-in-time snapshots, and understanding the architectural differences between persistent EBS and ephemeral Instance Store.

## Time
⏱️ Approximately 75 minutes

## Learn
- 📖 [Amazon EBS User Guide](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AmazonEBS.html) — Official documentation explaining volume types (gp3, io2, st1), AZ constraints, encryption, and lifecycle management.
- 📖 [Amazon EC2 Instance Store](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/InstanceStorage.html) — Learn how physically attached NVMe/SSD ephemeral storage differs from networked EBS block storage.

## Do
In this lab, you will launch an EC2 instance, provision a separate 5 GiB gp3 EBS volume in the same Availability Zone, attach it, format it with a Linux filesystem, write test files, and create an EBS snapshot.

1. **Launch a t2.micro EC2 instance in a specific Availability Zone**:
   ```bash
   REGION="us-east-1"
   AZ="${REGION}a"

   AMI_ID=$(aws ssm get-parameter \
     --region "${REGION}" \
     --name "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64" \
     --query "Parameter.Value" \
     --output text)

   INSTANCE_ID=$(aws ec2 run-instances \
     --region "${REGION}" \
     --image-id "${AMI_ID}" \
     --instance-type t2.micro \
     --placement AvailabilityZone="${AZ}" \
     --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=day37-storage-ec2}]' \
     --query "Instances[0].InstanceId" \
     --output text)

   echo "Launching instance ${INSTANCE_ID} in ${AZ}..."
   aws ec2 wait instance-running --region "${REGION}" --instance-ids "${INSTANCE_ID}"
   ```

2. **Create an independent 5 GiB General Purpose SSD (gp3) EBS volume in the exact same AZ**:
   ```bash
   VOLUME_ID=$(aws ec2 create-volume \
     --region "${REGION}" \
     --availability-zone "${AZ}" \
     --size 5 \
     --volume-type gp3 \
     --tag-specifications 'ResourceType=volume,Tags=[{Key=Name,Value=day37-extra-volume}]' \
     --query "VolumeId" \
     --output text)

   echo "Created Volume: ${VOLUME_ID}"
   aws ec2 wait volume-available --region "${REGION}" --volume-ids "${VOLUME_ID}"
   ```

3. **Attach the EBS volume to the running instance**:
   ```bash
   aws ec2 attach-volume \
     --region "${REGION}" \
     --volume-id "${VOLUME_ID}" \
     --instance-id "${INSTANCE_ID}" \
     --device /dev/sdf

   aws ec2 wait volume-in-use --region "${REGION}" --volume-ids "${VOLUME_ID}"
   echo "Volume attached successfully."
   ```

4. **Format and mount the volume inside the EC2 instance**:
   Using AWS Systems Manager or SSH, inspect block devices and format the disk. (If executing via AWS SSM Run Command):
   ```bash
   # Check block devices and format as ext4
   aws ssm send-command \
     --region "${REGION}" \
     --instance-ids "${INSTANCE_ID}" \
     --document-name "AWS-RunShellScript" \
     --parameters 'commands=[
       "lsblk",
       "sudo mkfs -t ext4 /dev/xvdf",
       "sudo mkdir -p /mnt/data",
       "sudo mount /dev/xvdf /mnt/data",
       "echo \"Persistent cloud storage test\" | sudo tee /mnt/data/message.txt",
       "df -h /mnt/data",
       "cat /mnt/data/message.txt"
     ]'
   ```
   *(Note: On modern Amazon Linux kernels, `/dev/sdf` appears as `/dev/xvdf` or `/dev/nvme1n1`. Use `lsblk` to identify the device name).*

5. **Create a point-in-time EBS Snapshot**:
   Take a snapshot of the volume while it is attached to preserve its state:
   ```bash
   SNAPSHOT_ID=$(aws ec2 create-snapshot \
     --region "${REGION}" \
     --volume-id "${VOLUME_ID}" \
     --description "Backup snapshot for Day 37 lab" \
     --tag-specifications 'ResourceType=snapshot,Tags=[{Key=Name,Value=day37-ebs-snapshot}]' \
     --query "SnapshotId" \
     --output text)

   echo "Created Snapshot: ${SNAPSHOT_ID}"
   aws ec2 wait snapshot-completed --region "${REGION}" --snapshot-ids "${SNAPSHOT_ID}"
   echo "Snapshot is completed and safely stored in Amazon S3 backend."
   ```

6. **Detach the volume**:
   ```bash
   # Unmount inside the OS first (if connected via SSH or SSM)
   aws ssm send-command \
     --region "${REGION}" \
     --instance-ids "${INSTANCE_ID}" \
     --document-name "AWS-RunShellScript" \
     --parameters 'commands=["sudo umount /mnt/data"]' 2>/dev/null || true

   # Detach EBS volume from EC2
   aws ec2 detach-volume --region "${REGION}" --volume-id "${VOLUME_ID}"
   aws ec2 wait volume-available --region "${REGION}" --volume-ids "${VOLUME_ID}"
   echo "Volume detached and ready for re-attachment or archiving."
   ```

## Done When
- [ ] Extra 5 GiB gp3 EBS volume provisioned in `${REGION}a`.
- [ ] Volume successfully attached to `${INSTANCE_ID}` as a block device.
- [ ] Volume formatted with ext4 filesystem and mounted to `/mnt/data`.
- [ ] Snapshot created and confirmed in `completed` state via `aws ec2 describe-snapshots`.

## Cost and Cleanup
Expected Cost: **$0.00** — The AWS Free Tier provides 30 GiB of EBS storage (gp2/gp3) and 1 GiB of snapshot storage per month.

Clean up all resources to prevent ongoing storage allocation:
```bash
REGION="us-east-1"

# 1. Delete the EBS Snapshot
aws ec2 delete-snapshot --region "${REGION}" --snapshot-id "${SNAPSHOT_ID}"

# 2. Delete the EBS Volume
aws ec2 delete-volume --region "${REGION}" --volume-id "${VOLUME_ID}"

# 3. Terminate the EC2 instance
aws ec2 terminate-instances --region "${REGION}" --instance-ids "${INSTANCE_ID}"
aws ec2 wait instance-terminated --region "${REGION}" --instance-ids "${INSTANCE_ID}"

echo "All storage resources cleanly removed."
```

## Azure / GCP Equivalents
| AWS Storage Service | Azure Equivalent | GCP Equivalent |
|---------------------|------------------|----------------|
| Amazon EBS (gp3) | Azure Managed Disk (Premium SSD / Standard SSD) | Google Cloud Persistent Disk (pd-balanced / pd-ssd) |
| EBS Snapshot | Azure Managed Disk Snapshot | Compute Engine Persistent Disk Snapshot |
| EC2 Instance Store (Ephemeral) | Azure Temporary Disk / NVMe Direct | Google Cloud Local SSD (Scratch disk) |
| Multi-Attach EBS (io2) | Azure Shared Disks | Google Cloud Multi-writer PD |

- 📖 [Azure Managed Disks Documentation](https://learn.microsoft.com/en-us/azure/virtual-machines/managed-disks-overview)
- 📖 [Google Cloud Persistent Disk Documentation](https://cloud.google.com/compute/docs/disks)

## Stretch Goal
Configure `/etc/fstab` persistent mounting: Retrieve the filesystem UUID using `sudo blkid /dev/xvdf`, add an entry to `/etc/fstab` using `UUID=... /mnt/data ext4 defaults,nofail 0 2`, and reboot the instance. Verify that the filesystem automatically mounts without hanging boot if the volume is detached.

## Common Mistakes
- **Availability Zone Mismatch**: Creating an EBS volume in `us-east-1a` while your EC2 instance is running in `us-east-1b`. EBS volumes cannot be attached across Availability Zones; you must snapshot and restore into the target AZ.
- **Detaching without unmounting**: Forcing an EBS detachment while processes are actively reading or writing to `/mnt/data` can corrupt the filesystem. Always `umount` within the OS first.
- **Relying on Instance Store for permanent data**: EC2 Instance Store disks are ephemeral; when an instance is stopped or hardware fails, all data on the instance store is permanently erased. Use EBS for persistent data.
