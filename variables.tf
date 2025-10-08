variable "resource_group_name" {
  description = "Nombre del grupo de recursos"
  default     = "sonar-rg"
}

variable "location" {
  description = "Ubicación de Azure"
  default     = "eastus"
}

variable "admin_username" {
  description = "Usuario administrador de la VM"
  default     = "azureuser"
}

variable "vm_size" {
  description = "Tamaño de la VM"
  default     = "Standard_B2s"
}

