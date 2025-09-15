use soroban_sdk::{testutils::Address as _, Address, Env, String, Vec, u32, u64};
use marketplace::{Marketplace, MarketplaceClient};
use interfaces::{LandInfo, TokenMetadata, ContractError};

#[test]
fn test_initialize_marketplace() {
    let env = Env::default();
    let contract_id = env.register_contract(None, Marketplace);
    let client = MarketplaceClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let commission_rate = 250; // 2.5%

    client.initialize(&admin, &commission_rate);

    let (stored_admin, stored_commission) = client.get_contract_info().unwrap();
    assert_eq!(stored_admin, admin);
    assert_eq!(stored_commission, commission_rate);
}

#[test]
fn test_list_land_for_sale() {
    let env = Env::default();
    let contract_id = env.register_contract(None, Marketplace);
    let client = MarketplaceClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let owner = Address::generate(&env);
    
    client.initialize(&admin, &250);

    // Crear información del terreno
    let land_info = LandInfo {
        id: 1,
        owner: owner.clone(),
        metadata: String::from_str(&env, r#"{"name": "Test Land"}"#),
        price: 1000000000, // 100 XLM in stroops
        created_at: env.ledger().timestamp(),
        is_available: true,
        location: String::from_str(&env, "Test Location"),
        resource_type: String::from_str(&env, "mining"),
        area: 1000000,
        estimated_value_usd: 50000000,
    };

    let sale_price = 1000000000; // 100 XLM
    let sale_duration = 86400; // 24 horas

    client.list_land_for_sale(
        &admin,
        &1,
        &land_info,
        &sale_price,
        &sale_duration,
    ).unwrap();

    // Verificar que el terreno está en venta
    let is_for_sale = client.is_land_for_sale(&1).unwrap();
    assert!(is_for_sale);

    let sale_info = client.get_sale_info(&1).unwrap();
    assert_eq!(sale_info.land_id, 1);
    assert_eq!(sale_info.seller, owner);
    assert_eq!(sale_info.sale_price, sale_price);
    assert!(sale_info.is_active);
}

#[test]
fn test_buy_land() {
    let env = Env::default();
    let contract_id = env.register_contract(None, Marketplace);
    let client = MarketplaceClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let seller = Address::generate(&env);
    let buyer = Address::generate(&env);
    
    client.initialize(&admin, &250);

    // Crear y listar terreno
    let land_info = LandInfo {
        id: 1,
        owner: seller.clone(),
        metadata: String::from_str(&env, r#"{"name": "Test Land"}"#),
        price: 1000000000,
        created_at: env.ledger().timestamp(),
        is_available: true,
        location: String::from_str(&env, "Test Location"),
        resource_type: String::from_str(&env, "mining"),
        area: 1000000,
        estimated_value_usd: 50000000,
    };

    client.list_land_for_sale(
        &admin,
        &1,
        &land_info,
        &1000000000,
        &86400,
    ).unwrap();

    // Comprar terreno
    client.buy_land(&buyer, &1, &land_info).unwrap();

    // Verificar que ya no está en venta
    let is_for_sale = client.is_land_for_sale(&1).unwrap();
    assert!(!is_for_sale);

    // Verificar que aparece en las compras del comprador
    let buyer_purchases = client.get_buyer_purchases(&buyer).unwrap();
    assert!(buyer_purchases.contains(1));

    // Verificar que aparece en los terrenos del comprador
    let buyer_lands = client.get_owner_lands(&buyer).unwrap();
    assert!(buyer_lands.contains(1));
}

#[test]
fn test_cancel_sale() {
    let env = Env::default();
    let contract_id = env.register_contract(None, Marketplace);
    let client = MarketplaceClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let seller = Address::generate(&env);
    
    client.initialize(&admin, &250);

    // Crear y listar terreno
    let land_info = LandInfo {
        id: 1,
        owner: seller.clone(),
        metadata: String::from_str(&env, r#"{"name": "Test Land"}"#),
        price: 1000000000,
        created_at: env.ledger().timestamp(),
        is_available: true,
        location: String::from_str(&env, "Test Location"),
        resource_type: String::from_str(&env, "mining"),
        area: 1000000,
        estimated_value_usd: 50000000,
    };

    client.list_land_for_sale(
        &admin,
        &1,
        &land_info,
        &1000000000,
        &86400,
    ).unwrap();

    // Verificar que está en venta
    let is_for_sale = client.is_land_for_sale(&1).unwrap();
    assert!(is_for_sale);

    // Cancelar venta
    client.cancel_sale(&seller, &1).unwrap();

    // Verificar que ya no está en venta
    let is_for_sale = client.is_land_for_sale(&1).unwrap();
    assert!(!is_for_sale);
}

#[test]
fn test_get_marketplace_stats() {
    let env = Env::default();
    let contract_id = env.register_contract(None, Marketplace);
    let client = MarketplaceClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let seller = Address::generate(&env);
    let buyer = Address::generate(&env);
    
    client.initialize(&admin, &250);

    // Crear y listar terreno
    let land_info = LandInfo {
        id: 1,
        owner: seller.clone(),
        metadata: String::from_str(&env, r#"{"name": "Test Land"}"#),
        price: 1000000000,
        created_at: env.ledger().timestamp(),
        is_available: true,
        location: String::from_str(&env, "Test Location"),
        resource_type: String::from_str(&env, "mining"),
        area: 1000000,
        estimated_value_usd: 50000000,
    };

    client.list_land_for_sale(
        &admin,
        &1,
        &land_info,
        &1000000000,
        &86400,
    ).unwrap();

    // Comprar terreno
    client.buy_land(&buyer, &1, &land_info).unwrap();

    // Verificar estadísticas
    let (active_sales, total_sales, total_purchases) = client.get_marketplace_stats().unwrap();
    assert_eq!(active_sales, 0); // Ya no hay ventas activas
    assert_eq!(total_sales, 1); // Se creó 1 venta
    assert_eq!(total_purchases, 1); // Se hizo 1 compra
}
