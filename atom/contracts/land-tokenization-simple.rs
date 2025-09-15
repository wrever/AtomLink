#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, String, Vec, Map, u32, u64, Env, symbol_short};

/// Contrato simplificado de tokenización de terrenos
#[contract]
pub struct LandTokenization;

/// Información básica de un terreno
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct LandInfo {
    pub id: u32,
    pub owner: Address,
    pub price: u64,
    pub location: String,
    pub area: u64,
    pub is_available: bool,
}

/// Almacenamiento del contrato
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Storage {
    pub land_counter: u32,
    pub lands: Map<u32, LandInfo>,
    pub owner_lands: Map<Address, Vec<u32>>,
    pub admin: Address,
}

#[contractimpl]
impl LandTokenization {
    /// Inicializar el contrato
    pub fn initialize(env: Env, admin: Address) {
        let storage = Storage {
            land_counter: 0,
            lands: Map::new(&env),
            owner_lands: Map::new(&env),
            admin: admin.clone(),
        };
        
        env.storage().instance().set(&symbol_short!("STORAGE"), &storage);
    }

    /// Crear un nuevo terreno tokenizado
    pub fn create_land(
        env: Env,
        owner: Address,
        price: u64,
        location: String,
        area: u64,
    ) -> Result<u32, String> {
        if price == 0 {
            return Err(String::from_str(&env, "Price must be greater than 0"));
        }

        let mut storage: Storage = env.storage().instance().get(&symbol_short!("STORAGE"))
            .ok_or_else(|| String::from_str(&env, "Storage not found"))?;

        storage.land_counter += 1;
        let land_id = storage.land_counter;

        let land_info = LandInfo {
            id: land_id,
            owner: owner.clone(),
            price,
            location: location.clone(),
            area,
            is_available: true,
        };

        storage.lands.set(land_id, land_info);
        
        let mut owner_lands = storage.owner_lands.get(owner.clone()).unwrap_or(Vec::new(&env));
        owner_lands.push_back(land_id);
        storage.owner_lands.set(owner.clone(), owner_lands);

        env.storage().instance().set(&symbol_short!("STORAGE"), &storage);

        Ok(land_id)
    }

    /// Obtener información de un terreno
    pub fn get_land_info(env: Env, land_id: u32) -> Result<LandInfo, String> {
        let storage: Storage = env.storage().instance().get(&symbol_short!("STORAGE"))
            .ok_or_else(|| String::from_str(&env, "Storage not found"))?;

        storage.lands.get(land_id)
            .ok_or_else(|| String::from_str(&env, "Land not found"))
    }

    /// Obtener terrenos de un propietario
    pub fn get_owner_lands(env: Env, owner: Address) -> Result<Vec<u32>, String> {
        let storage: Storage = env.storage().instance().get(&symbol_short!("STORAGE"))
            .ok_or_else(|| String::from_str(&env, "Storage not found"))?;

        Ok(storage.owner_lands.get(owner).unwrap_or(Vec::new(&env)))
    }

    /// Transferir terreno
    pub fn transfer_land(
        env: Env,
        from: Address,
        to: Address,
        land_id: u32,
    ) -> Result<(), String> {
        let mut storage: Storage = env.storage().instance().get(&symbol_short!("STORAGE"))
            .ok_or_else(|| String::from_str(&env, "Storage not found"))?;

        let mut land_info = storage.lands.get(land_id)
            .ok_or_else(|| String::from_str(&env, "Land not found"))?;

        if land_info.owner != from {
            return Err(String::from_str(&env, "Unauthorized"));
        }

        land_info.owner = to.clone();
        storage.lands.set(land_id, land_info);

        let mut from_lands = storage.owner_lands.get(from.clone()).unwrap_or(Vec::new(&env));
        from_lands.retain(|&id| id != land_id);
        storage.owner_lands.set(from.clone(), from_lands);

        let mut to_lands = storage.owner_lands.get(to.clone()).unwrap_or(Vec::new(&env));
        to_lands.push_back(land_id);
        storage.owner_lands.set(to.clone(), to_lands);

        env.storage().instance().set(&symbol_short!("STORAGE"), &storage);

        Ok(())
    }

    /// Obtener contador total de terrenos
    pub fn get_total_lands(env: Env) -> Result<u32, String> {
        let storage: Storage = env.storage().instance().get(&symbol_short!("STORAGE"))
            .ok_or_else(|| String::from_str(&env, "Storage not found"))?;

        Ok(storage.land_counter)
    }
}