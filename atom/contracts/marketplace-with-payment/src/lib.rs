#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, vec, Address, Env, Vec, Map, String};

#[contract]
pub struct MarketplaceWithPayment;

#[contractimpl]
impl MarketplaceWithPayment {
    /// Inicializar el contrato
    pub fn initialize(env: Env) {
        let storage = Storage {
            sales: Map::new(&env),
            seller_sales: Map::new(&env),
            buyer_purchases: Map::new(&env),
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

        let sale_info = SaleInfo {
            land_id,
            seller: seller.clone(),
            price,
            is_active: true,
            created_at: env.ledger().timestamp,
        };

        storage.sales.set(land_id, sale_info);

        // Agregar a ventas del vendedor
        let mut seller_sales = storage.seller_sales.get(seller.clone()).unwrap_or(Vec::new(&env));
        seller_sales.push_back(land_id);
        storage.seller_sales.set(seller, seller_sales);

        env.storage().instance().set(&symbol_short!("STORAGE"), &storage);
        true
    }

    /// Comprar terreno con pago
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

        let seller = sale_info.seller.clone();
        let price = sale_info.price;

        // Transferir XLM del comprador al vendedor
        env.contracts().invoke(
            &env.current_contract_address(),
            &symbol_short!("transfer"),
            vec![&env, 
                buyer.clone().into_val(&env),
                seller.clone().into_val(&env),
                price.into_val(&env)
            ]
        );

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

    /// Obtener información de venta
    pub fn get_sale_info(env: Env, land_id: u32) -> SaleInfo {
        let storage: Storage = env.storage().instance().get(&symbol_short!("STORAGE"))
            .unwrap();
        storage.sales.get(land_id).unwrap()
    }

    /// Verificar si el terreno está en venta
    pub fn is_land_for_sale(env: Env, land_id: u32) -> bool {
        let storage: Storage = env.storage().instance().get(&symbol_short!("STORAGE"))
            .unwrap();
        match storage.sales.get(land_id) {
            Some(sale_info) => sale_info.is_active,
            None => false,
        }
    }

    /// Obtener todas las ventas
    pub fn get_all_sales(env: Env) -> Vec<SaleInfo> {
        let storage: Storage = env.storage().instance().get(&symbol_short!("STORAGE"))
            .unwrap();
        let mut sales = Vec::new(&env);
        for (_, sale_info) in storage.sales.iter() {
            sales.push_back(sale_info);
        }
        sales
    }

    /// Obtener ventas del vendedor
    pub fn get_seller_sales(env: Env, seller: Address) -> Vec<u32> {
        let storage: Storage = env.storage().instance().get(&symbol_short!("STORAGE"))
            .unwrap();
        storage.seller_sales.get(seller).unwrap_or(Vec::new(&env))
    }

    /// Obtener compras del comprador
    pub fn get_buyer_purchases(env: Env, buyer: Address) -> Vec<u32> {
        let storage: Storage = env.storage().instance().get(&symbol_short!("STORAGE"))
            .unwrap();
        storage.buyer_purchases.get(buyer).unwrap_or(Vec::new(&env))
    }
}

#[derive(Clone)]
pub struct Storage {
    pub sales: Map<u32, SaleInfo>,
    pub seller_sales: Map<Address, Vec<u32>>,
    pub buyer_purchases: Map<Address, Vec<u32>>,
}

#[derive(Clone)]
pub struct SaleInfo {
    pub land_id: u32,
    pub seller: Address,
    pub price: u64,
    pub is_active: bool,
    pub created_at: u64,
}
