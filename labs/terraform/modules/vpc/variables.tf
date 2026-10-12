variable "name" {
  description = "Name prefix for VPC resources"
  type        = string
}

variable "cidr_block" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "create_igw" {
  description = "Whether to create and attach an Internet Gateway"
  type        = bool
  default     = true
}

variable "tags" {
  description = "A map of tags to assign to the resources"
  type        = map(string)
  default     = {}
}
