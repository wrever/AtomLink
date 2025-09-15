#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, String, Vec, Map, Env, symbol_short};
use interfaces::{LandInfo, TokenMetadata, ContractEvent, ContractError};

/// Contrato principal de tokenización de terrenos
/// Equivalente a ERC-1155 para terrenos fraccionados
#[contract]
pub struct LandTokenization;

/// Almacenamiento del contrato
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Storage {
    /// Contador de terrenos creados
    pub land_counter: u32,
    /// Mapa de terrenos por ID
    pub lands: Map<u32, LandInfo>,
    /// Mapa de terrenos por propietario
    pub owner_lands: Map<Address, Vec<u32>>,
    /// Mapa de metadatos de tokens
    pub token_metadata: Map<u32, TokenMetadata>,
    /// Administrador del contrato
    pub admin: Address,
    /// Comisión de AtomLink (en basis points, 100 = 1%)
    pub commission_rate: u32,
}

#[contractimpl]
impl LandTokenization {
    /// Inicializar el contrato
    pub fn initialize(env: Env, admin: Address, commission_rate: u32) {
        let storage = Storage {
            land_counter: 0,
            lands: Map::new(&env),
            owner_lands: Map::new(&env),
            token_metadata: Map::new(&env),
            admin: admin.clone(),
            commission_rate,
        };
        
        env.storage().instance().set(&symbol_short!("STORAGE"), &storage);
        
        // Emitir evento de inicialización
        env.events().publish(
            (symbol_short!("INIT"), symbol_short!("CONTRACT")),
            ContractEvent::LandCreated(0, admin, 0)
        );
    }

    /// Crear un nuevo terreno tokenizado
    pub fn create_land(
        env: Env,
        owner: Address,
        metadata: String,
        price: u64,
        location: String,
        resource_type: String,
        area: u64,
        estimated_value_usd: u64,
        token_metadata: TokenMetadata,
    ) -> Result<u32, ContractError> {
        // Verificar que el precio sea válido
        if price == 0 {
            return Err(ContractError::InvalidPrice);
        }

        // Obtener storage
        let mut storage: Storage = env.storage().instance().get(&symbol_short!("STORAGE"))
            .ok_or(ContractError::InvalidParameters)?;

        // Incrementar contador
        storage.land_counter += 1;
        let land_id = storage.land_counter;

        // Crear información del terreno
        let land_info = LandInfo {
            id: land_id,
            owner: owner.clone(),
            metadata: metadata.clone(),
            price,
            created_at: env.ledger().timestamp(),
            is_available: true,
            location: location.clone(),
            resource_type: resource_type.clone(),
            area,
            estimated_value_usd,
        };

        // Guardar terreno
        storage.lands.set(land_id, land_info.clone());
        storage.token_metadata.set(land_id, token_metadata);

        // Agregar a la lista del propietario
        let mut owner_lands = storage.owner_lands.get(owner.clone()).unwrap_or(Vec::new(&env));
        owner_lands.push_back(land_id);
        storage.owner_lands.set(owner.clone(), owner_lands);

        // Actualizar storage
        env.storage().instance().set(&symbol_short!("STORAGE"), &storage);

        // Emitir evento
        env.events().publish(
            (symbol_short!("LAND"), symbol_short!("CREATED")),
            ContractEvent::LandCreated(land_id, owner, price)
        );

        Ok(land_id)
    }

    /// Transferir terreno a otro propietario
    pub fn transfer_land(
        env: Env,
        from: Address,
        to: Address,
        land_id: u32,
    ) -> Result<(), ContractError> {
        let mut storage: Storage = env.storage().instance().get(&symbol_short!("STORAGE"))
            .ok_or(ContractError::InvalidParameters)?;

        // Verificar que el terreno existe
        let mut land_info = storage.lands.get(land_id)
            .ok_or(ContractError::LandNotFound)?;

        // Verificar que el remitente es el propietario
        if land_info.owner != from {
            return Err(ContractError::Unauthorized);
        }

        // Actualizar propietario
        land_info.owner = to.clone();
        storage.lands.set(land_id, land_info);

        // Actualizar listas de propietarios
        let mut from_lands = storage.owner_lands.get(from.clone()).unwrap_or(Vec::new(&env));
        from_lands.retain(|&id| id != land_id);
        storage.owner_lands.set(from.clone(), from_lands);

        let mut to_lands = storage.owner_lands.get(to.clone()).unwrap_or(Vec::new(&env));
        to_lands.push_back(land_id);
        storage.owner_lands.set(to.clone(), to_lands);

        // Actualizar storage
        env.storage().instance().set(&symbol_short!("STORAGE"), &storage);

        // Emitir evento
        env.events().publish(
            (symbol_short!("LAND"), symbol_short!("TRANSFER")),
            ContractEvent::LandTransferred(land_id, from, to)
        );

        Ok(())
    }

    /// Obtener información de un terreno
    pub fn get_land_info(env: Env, land_id: u32) -> Result<LandInfo, ContractError> {
        let storage: Storage = env.storage().instance().get(&symbol_short!("STORAGE"))
            .ok_or(ContractError::InvalidParameters)?;

        storage.lands.get(land_id)
            .ok_or(ContractError::LandNotFound)
    }

    /// Obtener terrenos de un propietario
    pub fn get_owner_lands(env: Env, owner: Address) -> Result<Vec<u32>, ContractError> {
        let storage: Storage = env.storage().instance().get(&symbol_short!("STORAGE"))
            .ok_or(ContractError::InvalidParameters)?;

        Ok(storage.owner_lands.get(owner).unwrap_or(Vec::new(&env)))
    }

    /// Obtener metadatos de token
    pub fn get_token_metadata(env: Env, land_id: u32) -> Result<TokenMetadata, ContractError> {
        let storage: Storage = env.storage().instance().get(&symbol_short!("STORAGE"))
            .ok_or(ContractError::InvalidParameters)?;

        storage.token_metadata.get(land_id)
            .ok_or(ContractError::LandNotFound)
    }

    /// Actualizar disponibilidad del terreno
    pub fn set_land_availability(
        env: Env,
        owner: Address,
        land_id: u32,
        is_available: bool,
    ) -> Result<(), ContractError> {
        let mut storage: Storage = env.storage().instance().get(&symbol_short!("STORAGE"))
            .ok_or(ContractError::InvalidParameters)?;

        let mut land_info = storage.lands.get(land_id)
            .ok_or(ContractError::LandNotFound)?;

        if land_info.owner != owner {
            return Err(ContractError::Unauthorized);
        }

        land_info.is_available = is_available;
        storage.lands.set(land_id, land_info);

        env.storage().instance().set(&symbol_short!("STORAGE"), &storage);

        Ok(())
    }

    /// Obtener contador total de terrenos
    pub fn get_total_lands(env: Env) -> Result<u32, ContractError> {
        let storage: Storage = env.storage().instance().get(&symbol_short!("STORAGE"))
            .ok_or(ContractError::InvalidParameters)?;

        Ok(storage.land_counter)
    }

    /// Obtener información del contrato
    pub fn get_contract_info(env: Env) -> Result<(Address, u32), ContractError> {
        let storage: Storage = env.storage().instance().get(&symbol_short!("STORAGE"))
            .ok_or(ContractError::InvalidParameters)?;

        Ok((storage.admin, storage.commission_rate))
    }
}

#[cfg(test)]
mod test;
