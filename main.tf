provider "azurerm" {
  features {}
  subscription_id = "d1e6f969-0e7e-456b-9324-8a0343e95482"
}

resource "azurerm_resource_group" "sonar_rg" {
  name     = var.resource_group_name
  location = var.location
}

resource "azurerm_virtual_network" "sonar_vnet" {
  name                = "sonar-vnet"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.sonar_rg.location
  resource_group_name = azurerm_resource_group.sonar_rg.name
}

resource "azurerm_subnet" "sonar_subnet" {
  name                 = "sonar-subnet"
  resource_group_name  = azurerm_resource_group.sonar_rg.name
  virtual_network_name = azurerm_virtual_network.sonar_vnet.name
  address_prefixes     = ["10.0.1.0/24"]
}

resource "azurerm_network_security_group" "sonar_nsg" {
  name                = "sonar-nsg"
  location            = azurerm_resource_group.sonar_rg.location
  resource_group_name = azurerm_resource_group.sonar_rg.name

  security_rule {
    name                       = "SSH"
    priority                   = 1001
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "22"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }
  security_rule {
    name                       = "SonarQube"
    priority                   = 1002
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "9000"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }
}

resource "azurerm_network_interface" "sonar_nic" {
  name                = "sonar-nic"
  location            = azurerm_resource_group.sonar_rg.location
  resource_group_name = azurerm_resource_group.sonar_rg.name

  ip_configuration {
    name                          = "internal"
    subnet_id                     = azurerm_subnet.sonar_subnet.id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.sonar_public_ip.id
  }

  # La asociación del NSG se realiza abajo
}

resource "azurerm_network_interface_security_group_association" "sonar_nic_nsg_assoc" {
  network_interface_id      = azurerm_network_interface.sonar_nic.id
  network_security_group_id = azurerm_network_security_group.sonar_nsg.id
}

resource "azurerm_public_ip" "sonar_public_ip" {
  name                = "sonar-public-ip"
  location            = azurerm_resource_group.sonar_rg.location
  resource_group_name = azurerm_resource_group.sonar_rg.name
  allocation_method   = "Static"
}

resource "azurerm_linux_virtual_machine" "sonar_vm" {
  name                = "sonarqube-vm"
  resource_group_name = azurerm_resource_group.sonar_rg.name
  location            = azurerm_resource_group.sonar_rg.location
  size                = var.vm_size
  admin_username      = var.admin_username
  network_interface_ids = [azurerm_network_interface.sonar_nic.id]
  admin_password      = "Sonar123!"
  disable_password_authentication = false

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "UbuntuServer"
    sku       = "18.04-LTS"
    version   = "latest"
  }

  tags = {
    environment = "sonarqube"
    project     = "Alquiler_Equipos"
  }
}
