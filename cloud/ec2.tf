resource "tls_private_key" "hackathon_key" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "random_id" "key_suffix" {
  byte_length = 4
}

resource "aws_key_pair" "generated_key" {
  key_name   = "hungryai-key-${random_id.key_suffix.hex}"
  public_key = tls_private_key.hackathon_key.public_key_openssh
}

data "aws_ami" "amazon_linux_2" {
  most_recent = true
  owners      = ["amazon"]
  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
}

resource "aws_security_group" "hungryai_instance_sg" {
  name        = "hungryai-instance-sg"
  description = "allow ssh and go app port"
  vpc_id      = aws_vpc.hungryai_vpc.id
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["219.240.45.11/32"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "hungryai_server" {
  ami                    = data.aws_ami.amazon_linux_2.id
  instance_type          = "t3.micro"
  key_name               = aws_key_pair.generated_key.key_name
  vpc_security_group_ids = [aws_security_group.hungryai_instance_sg.id]
  subnet_id              = aws_subnet.hungryai_subnet.id

  user_data = file("user-data.sh")  
  tags = {
    Name = "hungryai-server"
  }
}

resource "aws_eip" "hungryai_ip" {
  domain = "vpc"
  tags = {
    Name = "hungryai-static-ip"
  }
}

resource "aws_eip_association" "hungryai_ip_assoc" {
  instance_id   = aws_instance.hungryai_server.id
  allocation_id = aws_eip.hungryai_ip.id
}


output "ip" {
  description = "public ip address of the ec2 instance"
  value       = aws_eip.hungryai_ip.public_ip
}

output "dns" {
  description = "public dns name of the instance"
  value       = aws_eip.hungryai_ip.public_dns
}

output "private_key_pem" {
  description = "generated private key."
  value       = tls_private_key.hackathon_key.private_key_pem
  sensitive   = true
}

output "ssh_command" {
  description = "command to run"
  value       = "ssh -i hungryai.pem ec2-user@${aws_eip.hungryai_ip.public_dns}"
}
