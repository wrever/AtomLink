#![no_std]

use soroban_sdk::{contract, contractimpl, Env};

#[contract]
pub struct MinimalTest;

#[contractimpl]
impl MinimalTest {
    pub fn hello() -> u32 {
        42
    }
}
