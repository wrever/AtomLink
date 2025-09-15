#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, String, Vec, Map, u32, u64, Bytes, Env, symbol_short, panic_with_error};
use interfaces::{LandInfo, SaleInfo, ContractEvent, ContractError};

/// Contrato Marketplace para compra de terrenos tokenizados
/// Equivalente funcional al marketplace de Ethereum pero en Stellar
#[contract]
pub struct Marketplace;

/// Almacenamiento del contrato
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Storage {
    /// Mapa de terrenos en venta por ID
    pub lands_for_sale: Map<u32, SaleInfo>,
    /// Mapa de terrenos por propietario
    pub owner_lands: Map<Address, Vec<u32>>,
    /// Mapa de compras por comprador
    pub buyer_purchases: Map<Address, Vec<u32>>,
    /// Administrador del contrato
    pub admin: Address,
    /// Comisión de AtomLink (en basis points, 100 = 1%)
    pub commission_rate: u32,
    /// Contador de ventas
    pub total_sales: u32,
    /// Contador de compras
    pub total_purchases: u32,
}

#[contractimpl]
impl Marketplace {
    /// Inicializar el contrato marketplace
    pub fn initialize(env: Env, admin: Address, commission_rate: u32) {
        let storage = Storage {
            lands_for_sale: Map::new(&env),
            owner_lands: Map::new(&env),
            buyer_purchases: Map::new(&env),
            admin: admin.clone(),
            commission_rate,
            total_sales: 0,
            total_purchases: 0,
        };
        
        env.storage().instance().set(&symbol_short!("STORAGE"), &storage);
        
        // Emitir evento de inicialización
        env.events().publish(
            (symbol_short!("MARKET"), symbol_short!("INIT")),
            ContractEvent::LandListed {
                land_id: 0,
                seller: admin,
                price: 0,
            }
        );
    }

    /// Listar terreno para venta (solo administrador)
    pub fn list_land_for_sale(
        env: Env,
        admin: Address,
        land_id: u32,
        land_info: LandInfo,
        sale_price: u64,
        sale_duration: u64, // 0 = sin límite de tiempo
    ) -> Result<(), ContractError> {
        // Verificar que el llamador es administrador
        let storage: Storage = env.storage().instance().get(&symbol_short!("STORAGE"))
            .ok_or(ContractError::InvalidParameters)?;
        
        if storage.admin != admin {
            return Err(ContractError::Unauthorized);
        }

        // Verificar que el terreno no esté ya en venta
        if storage.lands_for_sale.contains_key(land_id) {
            return Err(ContractError::LandAlreadyExists);
        }

        // Verificar que el precio es válido
        if sale_price == 0 {
            return Err(ContractError::InvalidPrice);
        }

        // Crear información de venta
        let sale_info = SaleInfo {
            land_id,
            seller: land_info.owner.clone(),
            sale_price,
            sale_start: env.ledger().timestamp(),
            sale_end: if sale_duration > 0 { 
                env.ledger().timestamp() + sale_duration 
            } else { 
                0 
            },
            is_active: true,
        };

        // Actualizar storage
        let mut new_storage = storage.clone();
        new_storage.lands_for_sale.set(land_id, sale_info.clone());
        new_storage.total_sales += 1;
        
        // Agregar a la lista del propietario
        let mut owner_lands = new_storage.owner_lands.get(land_info.owner.clone()).unwrap_or(Vec::new(&env));
        owner_lands.push_back(land_id);
        new_storage.owner_lands.set(land_info.owner, owner_lands);

        env.storage().instance().set(&symbol_short!("STORAGE"), &new_storage);

        // Emitir evento
        env.events().publish(
            (symbol_short!("LAND"), symbol_short!("LISTED")),
            ContractEvent::LandListed {
                land_id,
                seller: sale_info.seller,
                price: sale_price,
            }
        );

        Ok(())
    }

    /// Comprar terreno (función principal del marketplace)
    pub fn buy_land(
        env: Env,
        buyer: Address,
        land_id: u32,
        land_info: LandInfo,
    ) -> Result<(), ContractError> {
        let mut storage: Storage = env.storage().instance().get(&symbol_short!("STORAGE"))
            .ok_or(ContractError::InvalidParameters)?;

        // Verificar que el terreno está en venta
        let sale_info = storage.lands_for_sale.get(land_id)
            .ok_or(ContractError::SaleNotFound)?;

        // Verificar que la venta está activa
        if !sale_info.is_active {
            return Err(ContractError::SaleNotActive);
        }

        // Verificar que no ha expirado
        if sale_info.sale_end > 0 && env.ledger().timestamp() > sale_info.sale_end {
            return Err(ContractError::SaleNotActive);
        }

        // Verificar que el comprador no es el vendedor
        if sale_info.seller == buyer {
            return Err(ContractError::InvalidParameters);
        }

        // TODO: Verificar que el comprador tiene suficientes XLM
        // Esto se manejará en el frontend con Stellar Wallets Kit

        // Calcular comisión de AtomLink
        let commission = (sale_info.sale_price * storage.commission_rate as u64) / 10000;
        let seller_amount = sale_info.sale_price - commission;

        // TODO: Transferir XLM al vendedor y comisión a AtomLink
        // Esto se manejará en el frontend con Stellar Wallets Kit

        // Actualizar storage
        storage.lands_for_sale.remove(land_id);
        storage.total_purchases += 1;

        // Agregar a la lista de compras del comprador
        let mut buyer_purchases = storage.buyer_purchases.get(buyer.clone()).unwrap_or(Vec::new(&env));
        buyer_purchases.push_back(land_id);
        storage.buyer_purchases.set(buyer.clone(), buyer_purchases);

        // Remover de la lista del vendedor
        let mut seller_lands = storage.owner_lands.get(sale_info.seller.clone()).unwrap_or(Vec::new(&env));
        seller_lands.retain(|&id| id != land_id);
        storage.owner_lands.set(sale_info.seller.clone(), seller_lands);

        // Agregar a la lista del comprador
        let mut buyer_lands = storage.owner_lands.get(buyer.clone()).unwrap_or(Vec::new(&env));
        buyer_lands.push_back(land_id);
        storage.owner_lands.set(buyer.clone(), buyer_lands);

        env.storage().instance().set(&symbol_short!("STORAGE"), &storage);

        // Emitir evento
        env.events().publish(
            (symbol_short!("LAND"), symbol_short!("SOLD")),
            ContractEvent::LandSold {
                land_id,
                seller: sale_info.seller,
                buyer,
                price: sale_info.sale_price,
            }
        );

        Ok(())
    }

    /// Cancelar venta de terreno
    pub fn cancel_sale(
        env: Env,
        seller: Address,
        land_id: u32,
    ) -> Result<(), ContractError> {
        let mut storage: Storage = env.storage().instance().get(&symbol_short!("STORAGE"))
            .ok_or(ContractError::InvalidParameters)?;

        let sale_info = storage.lands_for_sale.get(land_id)
            .ok_or(ContractError::SaleNotFound)?;

        // Verificar que el llamador es el vendedor
        if sale_info.seller != seller {
            return Err(ContractError::Unauthorized);
        }

        // Remover de la venta
        storage.lands_for_sale.remove(land_id);
        env.storage().instance().set(&symbol_short!("STORAGE"), &storage);

        // Emitir evento
        env.events().publish(
            (symbol_short!("LAND"), symbol_short!("UNLISTED")),
            ContractEvent::LandUnlisted {
                land_id,
                seller,
            }
        );

        Ok(())
    }

    /// Obtener información de venta
    pub fn get_sale_info(env: Env, land_id: u32) -> Result<SaleInfo, ContractError> {
        let storage: Storage = env.storage().instance().get(&symbol_short!("STORAGE"))
            .ok_or(ContractError::InvalidParameters)?;

        storage.lands_for_sale.get(land_id)
            .ok_or(ContractError::SaleNotFound)
    }

    /// Obtener terrenos en venta
    pub fn get_lands_for_sale(env: Env) -> Result<Vec<u32>, ContractError> {
        let storage: Storage = env.storage().instance().get(&symbol_short!("STORAGE"))
            .ok_or(ContractError::InvalidParameters)?;

        let mut lands_for_sale = Vec::new(&env);
        
        // Iterar sobre todas las ventas activas
        for (land_id, sale_info) in storage.lands_for_sale.iter() {
            if sale_info.is_active {
                lands_for_sale.push_back(land_id);
            }
        }

        Ok(lands_for_sale)
    }

    /// Obtener terrenos de un propietario
    pub fn get_owner_lands(env: Env, owner: Address) -> Result<Vec<u32>, ContractError> {
        let storage: Storage = env.storage().instance().get(&symbol_short!("STORAGE"))
            .ok_or(ContractError::InvalidParameters)?;

        Ok(storage.owner_lands.get(owner).unwrap_or(Vec::new(&env)))
    }

    /// Obtener compras de un comprador
    pub fn get_buyer_purchases(env: Env, buyer: Address) -> Result<Vec<u32>, ContractError> {
        let storage: Storage = env.storage().instance().get(&symbol_short!("STORAGE"))
            .ok_or(ContractError::InvalidParameters)?;

        Ok(storage.buyer_purchases.get(buyer).unwrap_or(Vec::new(&env)))
    }

    /// Obtener estadísticas del marketplace
    pub fn get_marketplace_stats(env: Env) -> Result<(u32, u32, u32), ContractError> {
        let storage: Storage = env.storage().instance().get(&symbol_short!("STORAGE"))
            .ok_or(ContractError::InvalidParameters)?;

        let active_sales = storage.lands_for_sale.len();
        Ok((active_sales, storage.total_sales, storage.total_purchases))
    }

    /// Verificar si un terreno está en venta
    pub fn is_land_for_sale(env: Env, land_id: u32) -> Result<bool, ContractError> {
        let storage: Storage = env.storage().instance().get(&symbol_short!("STORAGE"))
            .ok_or(ContractError::InvalidParameters)?;

        match storage.lands_for_sale.get(land_id) {
            Some(sale_info) => Ok(sale_info.is_active),
            None => Ok(false),
        }
    }

    /// Obtener información del contrato
    pub fn get_contract_info(env: Env) -> Result<(Address, u32), ContractError> {
        let storage: Storage = env.storage().instance().get(&symbol_short!("STORAGE"))
            .ok_or(ContractError::InvalidParameters)?;

        Ok((storage.admin, storage.commission_rate))
    }

    /// Actualizar comisión (solo administrador)
    pub fn update_commission_rate(
        env: Env,
        admin: Address,
        new_rate: u32,
    ) -> Result<(), ContractError> {
        let mut storage: Storage = env.storage().instance().get(&symbol_short!("STORAGE"))
            .ok_or(ContractError::InvalidParameters)?;

        if storage.admin != admin {
            return Err(ContractError::Unauthorized);
        }

        if new_rate > 10000 { // Máximo 100%
            return Err(ContractError::InvalidParameters);
        }

        storage.commission_rate = new_rate;
        env.storage().instance().set(&symbol_short!("STORAGE"), &storage);

        Ok(())
    }
}

#[cfg(test)]
mod test;
