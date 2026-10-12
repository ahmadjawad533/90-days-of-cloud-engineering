output "vpc_id" {
  description = "The ID of the provisioned VPC"
  value       = aws_vpc.main.id
}

output "vpc_arn" {
  description = "The ARN of the provisioned VPC"
  value       = aws_vpc.main.arn
}

output "vpc_cidr_block" {
  description = "The CIDR block of the provisioned VPC"
  value       = aws_vpc.main.cidr_block
}
