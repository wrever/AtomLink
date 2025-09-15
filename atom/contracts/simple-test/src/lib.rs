#![no_std]

use soroban_sdk::{contract, contractimpl, Env, symbol_short};

/// Contrato de prueba simple
#[contract]
pub struct SimpleTest;

#[contractimpl]
impl SimpleTest {
    /// Función simple que retorna un número
    pub fn get_number(env: Env) -> u32 {
        42
    }
    
    /// Función que almacena un valor
    pub fn set_value(env: Env, value: u32) {
        env.storage().instance().set(&symbol_short!("VALUE"), &value);
    }
    
    /// Función que obtiene un valor almacenado
    pub fn get_value(env: Env) -> Option<u32> {
        env.storage().instance().get(&symbol_short!("VALUE"))
    }
}
