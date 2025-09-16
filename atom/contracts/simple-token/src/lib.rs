#![no_std]
use soroban_sdk::{contract, contractimpl, token, Address, Env, String, symbol_short};

#[contract]
pub struct SimpleToken;

#[contractimpl]
impl SimpleToken {
    // Inicializar el token
    pub fn initialize(env: Env, admin: Address, decimal: u32, name: String, symbol: String) {
        if env.storage().instance().has(&symbol_short!("admin")) {
            panic!("already initialized");
        }
        
        env.storage().instance().set(&symbol_short!("admin"), &admin);
        env.storage().instance().set(&symbol_short!("decimal"), &decimal);
        env.storage().instance().set(&symbol_short!("name"), &name);
        env.storage().instance().set(&symbol_short!("symbol"), &symbol);
    }

    // Obtener información del token
    pub fn get_info(env: Env) -> (String, String, u32) {
        let name: String = env.storage().instance().get(&symbol_short!("name")).unwrap();
        let symbol: String = env.storage().instance().get(&symbol_short!("symbol")).unwrap();
        let decimal: u32 = env.storage().instance().get(&symbol_short!("decimal")).unwrap();
        
        (name, symbol, decimal)
    }

    // Comprar tokens (mint)
    pub fn buy_tokens(env: Env, to: Address, amount: i128) {
        // Solo el admin puede mint
        let admin: Address = env.storage().instance().get(&symbol_short!("admin")).unwrap();
        admin.require_auth();

        // Verificar que la cantidad sea positiva
        if amount <= 0 {
            panic!("amount must be positive");
        }

        // Obtener balance actual
        let current_balance = env.storage().persistent().get(&to).unwrap_or(0i128);
        
        // Actualizar balance
        env.storage().persistent().set(&to, &(current_balance + amount));
    }

    // Obtener balance de un usuario
    pub fn get_balance(env: Env, user: Address) -> i128 {
        env.storage().persistent().get(&user).unwrap_or(0i128)
    }

    // Transferir tokens
    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        from.require_auth();

        if amount <= 0 {
            panic!("amount must be positive");
        }

        // Verificar balance suficiente
        let from_balance = env.storage().persistent().get(&from).unwrap_or(0i128);
        if from_balance < amount {
            panic!("insufficient balance");
        }

        // Actualizar balances
        let to_balance = env.storage().persistent().get(&to).unwrap_or(0i128);
        env.storage().persistent().set(&from, &(from_balance - amount));
        env.storage().persistent().set(&to, &(to_balance + amount));
    }

    // Obtener decimales
    pub fn decimals(env: Env) -> u32 {
        env.storage().instance().get(&symbol_short!("decimal")).unwrap()
    }

    // Obtener nombre
    pub fn name(env: Env) -> String {
        env.storage().instance().get(&symbol_short!("name")).unwrap()
    }

    // Obtener símbolo
    pub fn symbol(env: Env) -> String {
        env.storage().instance().get(&symbol_short!("symbol")).unwrap()
    }
}