#![no_std]

use soroban_sdk::{contract, contractimpl};

#[contract]
pub struct UltraMinimal;

#[contractimpl]
impl UltraMinimal {
    pub fn add(a: u32, b: u32) -> u32 {
        a + b
    }
}
