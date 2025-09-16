#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, Address, Env, String, symbol_short,
};

#[derive(Clone)]
#[contracttype]
enum DataKey {
    TokenAddr,       // Address del token creado
    PayTokenAddr,    // Address del token de pago
    PriceN,          // numerador del precio (en unidades mínimas del token de pago)
    PriceD,          // denominador del precio (>0)
    Treasury,        // Address que recibe pagos
    Initialized,     // bool
}

fn get<T: soroban_sdk::TryFromVal<soroban_sdk::Env, soroban_sdk::Val>>(e: &Env, k: DataKey) -> T {
    e.storage().instance().get::<DataKey, T>(&k).unwrap()
}
fn put<T: soroban_sdk::IntoVal<soroban_sdk::Env, soroban_sdk::Val>>(e: &Env, k: DataKey, v: &T) {
    e.storage().instance().set(&k, v);
}

#[contract]
pub struct TokenSale;

#[contractimpl]
impl TokenSale {
    /// Inicializa la venta de tokens
    pub fn init(
        e: Env,
        token_wasm_hash: String,
        _name: String,
        _symbol: String,
        _decimals: u32,
        pay_token: Address,
        price_n: i128,
        price_d: i128,
        treasury: Address,
    ) {
        if e.storage().instance().has(&DataKey::Initialized) {
            panic!("Already initialized");
        }
        if price_d <= 0 || price_n <= 0 {
            panic!("Bad price");
        }

        // Guardar config
        put(&e, DataKey::TokenAddr, &Address::from_string(&token_wasm_hash));
        put(&e, DataKey::PayTokenAddr, &pay_token);
        put(&e, DataKey::PriceN, &price_n);
        put(&e, DataKey::PriceD, &price_d);
        put(&e, DataKey::Treasury, &treasury);
        put(&e, DataKey::Initialized, &true);
    }

    /// Compra `amount` del token vendido pagando con `pay_token`.
    pub fn buy(e: Env, buyer: Address, amount: i128) {
        if amount <= 0 {
            panic!("Bad amount");
        }

        // Para que el token de pago autorice el débito del comprador.
        buyer.require_auth();

        let token_addr: Address = get(&e, DataKey::TokenAddr);
        let pay_addr: Address = get(&e, DataKey::PayTokenAddr);
        let price_n: i128 = get(&e, DataKey::PriceN);
        let price_d: i128 = get(&e, DataKey::PriceD);
        let treasury: Address = get(&e, DataKey::Treasury);

        // costo = amount * price_n / price_d (redondeo hacia arriba para evitar subpago)
        let cost = (amount
            .checked_mul(price_n)
            .expect("overflow mul")
            + (price_d - 1))
            / price_d;

        // 1) Cobrar con el token de pago (transfer from buyer → treasury)
        let pay = e.contract(&pay_addr);
        pay.invoke(&symbol_short!("transfer"), (buyer.clone(), treasury, cost));

        // 2) Mintear al comprador (este contrato es admin del token)
        let token = e.contract(&token_addr);
        token.invoke(&symbol_short!("mint"), (buyer, amount));
    }

    // Helpers de lectura
    pub fn token_address(e: Env) -> Address {
        get(&e, DataKey::TokenAddr)
    }
    pub fn pay_token(e: Env) -> Address {
        get(&e, DataKey::PayTokenAddr)
    }
    pub fn price(e: Env) -> (i128, i128) {
        (get(&e, DataKey::PriceN), get(&e, DataKey::PriceD))
    }
    pub fn treasury(e: Env) -> Address {
        get(&e, DataKey::Treasury)
    }
}