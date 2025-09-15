#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, Map, Vec, Env, symbol_short};

/// Contrato Marketplace simplificado
#[contract]
pub struct MarketplaceSimple;

/// Información de venta
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SaleInfo {
    pub land_id: u32,
    pub seller: Address,
    pub price: u64,
    pub is_active: bool,
    pub created_at: u64,
}

/// Almacenamiento del contrato
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Storage {
    pub sales: Map<u32, SaleInfo>,
    pub seller_sales: Map<Address, Vec<u32>>,
    pub buyer_purchases: Map<Address, Vec<u32>>,
    pub admin: Address,
    pub commission_rate: u32,
}

#[contractimpl]
impl MarketplaceSimple {
    /// Inicializar el contrato
    pub fn initialize(env: Env, admin: Address, commission_rate: u32) {
        let storage = Storage {
            sales: Map::new(&env),
            seller_sales: Map::new(&env),
            buyer_purchases: Map::new(&env),
            admin,
            commission_rate,
        };
        
        env.storage().instance().set(&symbol_short!("STORAGE"), &storage);
    }

    /// Listar terreno para venta
    pub fn list_land(
        env: Env,
        seller: Address,
        land_id: u32,
        price: u64,
    ) -> bool {
        let mut storage: Storage = env.storage().instance().get(&symbol_short!("STORAGE"))
            .unwrap();

        // Verificar que no esté ya en venta
        if storage.sales.get(land_id).is_some() {
            return false;
        }

        let sale_info = SaleInfo {
            land_id,
            seller: seller.clone(),
            price,
            is_active: true,
            created_at: env.ledger().timestamp(),
        };

        storage.sales.set(land_id, sale_info);

        // Actualizar ventas del vendedor
        let mut seller_sales = storage.seller_sales.get(seller.clone()).unwrap_or(Vec::new(&env));
        seller_sales.push_back(land_id);
        storage.seller_sales.set(seller, seller_sales);

        env.storage().instance().set(&symbol_short!("STORAGE"), &storage);
        true
    }

    /// Comprar terreno
    pub fn buy_land(
        env: Env,
        buyer: Address,
        land_id: u32,
    ) -> bool {
        let mut storage: Storage = env.storage().instance().get(&symbol_short!("STORAGE"))
            .unwrap();

        let mut sale_info = storage.sales.get(land_id).unwrap();
        
        if !sale_info.is_active {
            return false;
        }

        // Guardar el seller antes de mover sale_info
        let seller = sale_info.seller.clone();

        // Marcar como vendido
        sale_info.is_active = false;
        storage.sales.set(land_id, sale_info);

        // Actualizar compras del comprador
        let mut buyer_purchases = storage.buyer_purchases.get(buyer.clone()).unwrap_or(Vec::new(&env));
        buyer_purchases.push_back(land_id);
        storage.buyer_purchases.set(buyer, buyer_purchases);

        // Remover de ventas del vendedor
        let mut seller_sales = storage.seller_sales.get(seller.clone()).unwrap_or(Vec::new(&env));
        seller_sales.remove(land_id);
        storage.seller_sales.set(seller, seller_sales);

        env.storage().instance().set(&symbol_short!("STORAGE"), &storage);
        true
    }

    /// Cancelar venta
    pub fn cancel_sale(
        env: Env,
        seller: Address,
        land_id: u32,
    ) -> bool {
        let mut storage: Storage = env.storage().instance().get(&symbol_short!("STORAGE"))
            .unwrap();

        let mut sale_info = storage.sales.get(land_id).unwrap();
        
        if sale_info.seller != seller || !sale_info.is_active {
            return false;
        }

        // Marcar como cancelado
        sale_info.is_active = false;
        storage.sales.set(land_id, sale_info);

        // Remover de ventas del vendedor
        let mut seller_sales = storage.seller_sales.get(seller.clone()).unwrap_or(Vec::new(&env));
        seller_sales.remove(land_id);
        storage.seller_sales.set(seller, seller_sales);

        env.storage().instance().set(&symbol_short!("STORAGE"), &storage);
        true
    }

    /// Obtener información de venta
    pub fn get_sale_info(env: Env, land_id: u32) -> Option<SaleInfo> {
        let storage: Storage = env.storage().instance().get(&symbol_short!("STORAGE"))
            .unwrap();
        
        storage.sales.get(land_id)
    }

    /// Obtener terrenos en venta de un vendedor
    pub fn get_seller_sales(env: Env, seller: Address) -> Vec<u32> {
        let storage: Storage = env.storage().instance().get(&symbol_short!("STORAGE"))
            .unwrap();
        
        storage.seller_sales.get(seller).unwrap_or(Vec::new(&env))
    }

    /// Obtener compras de un comprador
    pub fn get_buyer_purchases(env: Env, buyer: Address) -> Vec<u32> {
        let storage: Storage = env.storage().instance().get(&symbol_short!("STORAGE"))
            .unwrap();
        
        storage.buyer_purchases.get(buyer).unwrap_or(Vec::new(&env))
    }

    /// Obtener todos los terrenos en venta
    pub fn get_all_sales(env: Env) -> Vec<u32> {
        let _storage: Storage = env.storage().instance().get(&symbol_short!("STORAGE"))
            .unwrap();
        
        // Por simplicidad, retornamos un vector vacío
        // En una implementación real, necesitarías iterar sobre el mapa
        Vec::new(&env)
    }

    /// Verificar si un terreno está en venta
    pub fn is_land_for_sale(env: Env, land_id: u32) -> bool {
        let storage: Storage = env.storage().instance().get(&symbol_short!("STORAGE"))
            .unwrap();
        
        if let Some(sale_info) = storage.sales.get(land_id) {
            sale_info.is_active
        } else {
            false
        }
    }
}
