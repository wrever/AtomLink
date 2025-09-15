#![no_std]

use soroban_sdk::{contracttype, Address, String, Map};

/// Información completa de un terreno tokenizado
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct LandInfo {
    /// ID único del terreno
    pub id: u32,
    /// Propietario actual
    pub owner: Address,
    /// Metadatos del terreno (JSON string)
    pub metadata: String,
    /// Precio en XLM (en stroops)
    pub price: u64,
    /// Timestamp de creación
    pub created_at: u64,
    /// Si está disponible para venta
    pub is_available: bool,
    /// Ubicación geográfica
    pub location: String,
    /// Tipo de recurso (mining, real_estate, energy, infrastructure)
    pub resource_type: String,
    /// Área en metros cuadrados
    pub area: u64,
    /// Valor estimado en USD
    pub estimated_value_usd: u64,
}

/// Metadatos de tokenización
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct TokenMetadata {
    /// Nombre del token
    pub name: String,
    /// Símbolo del token
    pub symbol: String,
    /// Descripción
    pub description: String,
    /// URI de imagen
    pub image_uri: String,
    /// Atributos adicionales
    pub attributes: Map<String, String>,
}

/// Información de venta en marketplace
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SaleInfo {
    /// ID del terreno
    pub land_id: u32,
    /// Vendedor
    pub seller: Address,
    /// Precio de venta
    pub sale_price: u64,
    /// Timestamp de inicio de venta
    pub sale_start: u64,
    /// Timestamp de fin de venta (0 = sin límite)
    pub sale_end: u64,
    /// Si la venta está activa
    pub is_active: bool,
}

/// Eventos del contrato
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum ContractEvent {
    /// Terreno creado (land_id, owner, price)
    LandCreated(u32, Address, u64),
    /// Terreno transferido (land_id, from, to)
    LandTransferred(u32, Address, Address),
    /// Terreno puesto en venta (land_id, seller, price)
    LandListed(u32, Address, u64),
    /// Terreno vendido (land_id, seller, buyer, price)
    LandSold(u32, Address, Address, u64),
    /// Terreno removido de venta (land_id, seller)
    LandUnlisted(u32, Address),
}

/// Errores del contrato
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum ContractError {
    /// Terreno no encontrado
    LandNotFound,
    /// No autorizado para esta operación
    Unauthorized,
    /// Terreno no disponible para venta
    NotAvailable,
    /// Precio inválido
    InvalidPrice,
    /// Terreno ya existe
    LandAlreadyExists,
    /// Venta no encontrada
    SaleNotFound,
    /// Venta no activa
    SaleNotActive,
    /// Fondos insuficientes
    InsufficientFunds,
    /// Parámetros inválidos
    InvalidParameters,
}
