resource "aws_vpc" "hungryai_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  tags = {
    Name = "hungryai-vpc"
  }
}

resource "aws_internet_gateway" "hungryai_igw" {
  vpc_id = aws_vpc.hungryai_vpc.id
  tags = {
    Name = "hungryai-igw"
  }
}

resource "aws_subnet" "hungryai_subnet" {
  vpc_id                  = aws_vpc.hungryai_vpc.id
  cidr_block              = "10.0.0.0/24"
  map_public_ip_on_launch = false
  depends_on              = [aws_internet_gateway.hungryai_igw]
  tags = {
    Name = "hungryai-subnet"
  }
}

resource "aws_route_table" "hungryai_rt" {
  vpc_id = aws_vpc.hungryai_vpc.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.hungryai_igw.id
  }
  tags = {
    Name = "hungryai-rt"
  }
}

resource "aws_route_table_association" "assoc" {
  subnet_id      = aws_subnet.hungryai_subnet.id
  route_table_id = aws_route_table.hungryai_rt.id
}
