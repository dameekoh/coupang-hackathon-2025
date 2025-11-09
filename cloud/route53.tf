resource "aws_route53_zone" "hungryai_zone" {
  name = "asmirabdimazhit.com"
}

resource "aws_route53_record" "hungryai_a_record" {
  zone_id = aws_route53_zone.hungryai_zone.id
  name    = "hungryai.asmirabdimazhit.com"
  type    = "A"
  ttl     = 300
  records = [aws_eip.hungryai_ip.public_ip]
}

output "hungryai_name_servers" {
  description = "name servers for hungryai.asmirabdimazhit.com"
  value       = aws_route53_zone.hungryai_zone.name_servers
}
