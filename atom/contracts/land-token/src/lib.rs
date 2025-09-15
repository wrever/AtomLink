#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, String, Map, Vec, Env, symbol_short};

/// Contrato de tokenización de terrenos
#[contract]
pub struct LandToken;

/// Información de un terreno
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct LandInfo {
    pub id: u32,
    pub owner: Address,
    pub metadata: String,
    pub price: u64,
    pub created_at: u64,
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
impl LandToken {
    /// Inicializar el contrato
    pub fn initialize(env: Env, admin: Address) {
        let storage = Storage {
            land_counter: 0,
            lands: Map::new(&env),
            owner_lands: Map::new(&env),
            admin,
        };
        
        env.storage().instance().set(&symbol_short!("STORAGE"), &storage);
    }

    /// Crear un nuevo terreno
    pub fn create_land(
        env: Env,
        owner: Address,
        metadata: String,
        price: u64,
    ) -> u32 {
        let mut storage: Storage = env.storage().instance().get(&symbol_short!("STORAGE"))
            .unwrap();

        let land_id = storage.land_counter + 1;
        
        let land_info = LandInfo {
            id: land_id,
            owner: owner.clone(),
            metadata,
            price,
            created_at: env.ledger().timestamp(),
            is_available: true,
        };

        storage.lands.set(land_id, land_info);
        storage.land_counter = land_id;

        // Actualizar terrenos del propietario
        let mut owner_lands = storage.owner_lands.get(owner.clone()).unwrap_or(Vec::new(&env));
        owner_lands.push_back(land_id);
        storage.owner_lands.set(owner, owner_lands);

        env.storage().instance().set(&symbol_short!("STORAGE"), &storage);
        land_id
    }

    /// Obtener información de un terreno
    pub fn get_land(env: Env, land_id: u32) -> Option<LandInfo> {
        let storage: Storage = env.storage().instance().get(&symbol_short!("STORAGE"))
            .unwrap();
        
        storage.lands.get(land_id)
    }

    /// Transferir terreno
    pub fn transfer_land(
        env: Env,
        from: Address,
        to: Address,
        land_id: u32,
    ) -> bool {
        let mut storage: Storage = env.storage().instance().get(&symbol_short!("STORAGE"))
            .unwrap();

        let mut land_info = storage.lands.get(land_id).unwrap();
        
        if land_info.owner != from {
            return false;
        }

        land_info.owner = to.clone();
        storage.lands.set(land_id, land_info);

        // Actualizar listas de terrenos
        let mut from_lands = storage.owner_lands.get(from.clone()).unwrap_or(Vec::new(&env));
        from_lands.remove(land_id);
        storage.owner_lands.set(from, from_lands);

        let mut to_lands = storage.owner_lands.get(to.clone()).unwrap_or(Vec::new(&env));
        to_lands.push_back(land_id);
        storage.owner_lands.set(to, to_lands);

        env.storage().instance().set(&symbol_short!("STORAGE"), &storage);
        true
    }

    /// Obtener terrenos de un propietario
    pub fn get_owner_lands(env: Env, owner: Address) -> Vec<u32> {
        let storage: Storage = env.storage().instance().get(&symbol_short!("STORAGE"))
            .unwrap();
        
        storage.owner_lands.get(owner).unwrap_or(Vec::new(&env))
    }

    /// Obtener contador de terrenos
    pub fn get_land_count(env: Env) -> u32 {
        let storage: Storage = env.storage().instance().get(&symbol_short!("STORAGE"))
            .unwrap();
        
        storage.land_counter
    }
}
