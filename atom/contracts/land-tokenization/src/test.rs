use soroban_sdk::{testutils::Address as _, Address, Env, String, Vec, u32, u64};
use land_tokenization::{LandTokenization, LandTokenizationClient};
use interfaces::{LandInfo, TokenMetadata, ContractError};

#[test]
fn test_initialize() {
    let env = Env::default();
    let contract_id = env.register_contract(None, LandTokenization);
    let client = LandTokenizationClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let commission_rate = 250; // 2.5%

    client.initialize(&admin, &commission_rate);

    let (stored_admin, stored_commission) = client.get_contract_info().unwrap();
    assert_eq!(stored_admin, admin);
    assert_eq!(stored_commission, commission_rate);
}

#[test]
fn test_create_land() {
    let env = Env::default();
    let contract_id = env.register_contract(None, LandTokenization);
    let client = LandTokenizationClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let owner = Address::generate(&env);
    
    client.initialize(&admin, &250);

    let metadata = String::from_str(&env, r#"{"name": "Mining Land 1", "description": "Lithium-rich land"}"#);
    let location = String::from_str(&env, "Chile, Atacama Desert");
    let resource_type = String::from_str(&env, "mining");
    let token_metadata = TokenMetadata {
        name: String::from_str(&env, "AtomLink Mining Land #1"),
        symbol: String::from_str(&env, "AML1"),
        description: String::from_str(&env, "Tokenized mining land with lithium reserves"),
        image_uri: String::from_str(&env, "https://atomlink.com/images/land1.jpg"),
        attributes: Map::new(&env),
    };

    let land_id = client.create_land(
        &owner,
        &metadata,
        &1000000000, // 100 XLM in stroops
        &location,
        &resource_type,
        &1000000, // 1,000,000 m²
        &50000000, // $50,000 USD
        &token_metadata,
    ).unwrap();

    assert_eq!(land_id, 1);

    let land_info = client.get_land_info(&land_id).unwrap();
    assert_eq!(land_info.owner, owner);
    assert_eq!(land_info.price, 1000000000);
    assert_eq!(land_info.resource_type, resource_type);
}

#[test]
fn test_transfer_land() {
    let env = Env::default();
    let contract_id = env.register_contract(None, LandTokenization);
    let client = LandTokenizationClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let owner = Address::generate(&env);
    let new_owner = Address::generate(&env);
    
    client.initialize(&admin, &250);

    // Crear terreno
    let metadata = String::from_str(&env, r#"{"name": "Test Land"}"#);
    let location = String::from_str(&env, "Test Location");
    let resource_type = String::from_str(&env, "mining");
    let token_metadata = TokenMetadata {
        name: String::from_str(&env, "Test Land"),
        symbol: String::from_str(&env, "TEST"),
        description: String::from_str(&env, "Test land"),
        image_uri: String::from_str(&env, ""),
        attributes: Map::new(&env),
    };

    let land_id = client.create_land(
        &owner,
        &metadata,
        &1000000000,
        &location,
        &resource_type,
        &1000000,
        &50000000,
        &token_metadata,
    ).unwrap();

    // Transferir terreno
    client.transfer_land(&owner, &new_owner, &land_id).unwrap();

    let land_info = client.get_land_info(&land_id).unwrap();
    assert_eq!(land_info.owner, new_owner);

    // Verificar que el terreno aparece en la lista del nuevo propietario
    let new_owner_lands = client.get_owner_lands(&new_owner).unwrap();
    assert!(new_owner_lands.contains(land_id));
}

#[test]
fn test_get_owner_lands() {
    let env = Env::default();
    let contract_id = env.register_contract(None, LandTokenization);
    let client = LandTokenizationClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let owner = Address::generate(&env);
    
    client.initialize(&admin, &250);

    // Crear múltiples terrenos
    for i in 1..=3 {
        let metadata = String::from_str(&env, &format!(r#"{{"name": "Land {}"}}"#, i));
        let location = String::from_str(&env, &format!("Location {}", i));
        let resource_type = String::from_str(&env, "mining");
        let token_metadata = TokenMetadata {
            name: String::from_str(&env, &format!("Land {}", i)),
            symbol: String::from_str(&env, &format!("L{}", i)),
            description: String::from_str(&env, &format!("Land {}", i)),
            image_uri: String::from_str(&env, ""),
            attributes: Map::new(&env),
        };

        client.create_land(
            &owner,
            &metadata,
            &(1000000000 * i),
            &location,
            &resource_type,
            &(1000000 * i),
            &(50000000 * i),
            &token_metadata,
        ).unwrap();
    }

    let owner_lands = client.get_owner_lands(&owner).unwrap();
    assert_eq!(owner_lands.len(), 3);
    assert!(owner_lands.contains(1));
    assert!(owner_lands.contains(2));
    assert!(owner_lands.contains(3));
}
