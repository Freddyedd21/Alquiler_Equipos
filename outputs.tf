output "vm_public_ip" {
  description = "IP pública de la VM SonarQube"
  value       = azurerm_public_ip.sonar_public_ip.ip_address
}
