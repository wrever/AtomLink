#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, String, Vec, Map, u32, u64, Env, symbol_short};

/// Contrato simplificado de marketplace
#[contract]
pub struct Marketplace;

/// Información de venta
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SaleInfo {
    pub land_id: u32,
    pub seller: Address,
    pub price: u64,
    pub is_active: bool,
}

/// Almacenamiento del contrato
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Storage {
    pub sales: Map<u32, SaleInfo>,
    pub land_tokenization_contract: Address,
    pub admin: Address,
}

#[contractimpl]
impl Marketplace {
    /// Inicializar el contrato
    pub fn initialize(env: Env, admin: Address, land_tokenization_contract: Address) {
        let storage = Storage {
            sales: Map::new(&env),
            land_tokenization_contract,
            admin: admin.clone(),
        };
        
        env.storage().instance().set(&symbol_short!("STORAGE"), &storage);
    }

    /// Listar terreno para venta
    pub fn list_land(
        env: Env,
        seller: Address,
        land_id: u32,
        price: u64,
    ) -> Result<(), String> {
        if price == 0 {
            return Err(String::from_str(&env, "Price must be greater than 0"));
        }

        let mut storage: Storage = env.storage().instance().get(&symbol_short!("STORAGE"))
            .ok_or_else(|| String::from_str(&env, "Storage not found"))?;

        let sale_info = SaleInfo {
            land_id,
            seller: seller.clone(),
            price,
            is_active: true,
        };

        storage.sales.set(land_id, sale_info);
        env.storage().instance().set(&symbol_short!("STORAGE"), &storage);

        Ok(())
    }

    /// Comprar terreno
    pub fn buy_land(
        env: Env,
        buyer: Address,
        land_id: u32,
    ) -> Result<(), String> {
        let mut storage: Storage = env.storage().instance().get(&symbol_short!("STORAGE"))
            .ok_or_else(|| String::from_str(&env, "Storage not found"))?;

        let mut sale_info = storage.sales.get(land_id)
            .ok_or_else(|| String::from_str(&env, "Sale not found"))?;

        if !sale_info.is_active {
            return Err(String::from_str(&env, "Sale is not active"));
        }

        // Aquí normalmente transferiríamos XLM del comprador al vendedor
        // Por simplicidad, solo marcamos como vendido
        sale_info.is_active = false;
        storage.sales.set(land_id, sale_info);
        env.storage().instance().set(&symbol_short!("STORAGE"), &storage);

        Ok(())
    }

    /// Obtener información de venta
    pub fn get_sale_info(env: Env, land_id: u32) -> Result<SaleInfo, String> {
        let storage: Storage = env.storage().instance().get(&symbol_short!("STORAGE"))
            .ok_or_else(|| String::from_str(&env, "Storage not found"))?;

        storage.sales.get(land_id)
            .ok_or_else(|| String::from_str(&env, "Sale not found"))
    }

    /// Cancelar venta
    pub fn cancel_sale(
        env: Env,
        seller: Address,
        land_id: u32,
    ) -> Result<(), String> {
        let mut storage: Storage = env.storage().instance().get(&symbol_short!("STORAGE"))
            .ok_or_else(|| String::from_str(&env, "Storage not found"))?;

        let mut sale_info = storage.sales.get(land_id)
            .ok_or_else(|| String::from_str(&env, "Sale not found"))?;

        if sale_info.seller != seller {
            return Err(String::from_str(&env, "Unauthorized"));
        }

        sale_info.is_active = false;
        storage.sales.set(land_id, sale_info);
        env.storage().instance().set(&symbol_short!("STORAGE"), &storage);

        Ok(())
    }
}