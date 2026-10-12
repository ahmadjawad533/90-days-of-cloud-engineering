resource "aws_vpc" "this" {
  cidr_block           = var.cidr_block
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = merge(
    var.tags,
    {
      Name = var.name
    }
  )
}

resource "aws_internet_gateway" "this" {
  count  = var.create_igw ? 1 : 0
  vpc_id = aws_vpc.this.id

  tags = merge(
    var.tags,
    {
      Name = "${var.name}-igw"
    }
  )
}
