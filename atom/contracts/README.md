# AtomLink Stellar Contracts

Contratos inteligentes para tokenización de terrenos en Stellar Soroban.

## Estructura

```
contracts/
├── interfaces/           # Interfaces compartidas
├── land-tokenization/    # Contrato de tokenización de terrenos
├── marketplace/          # Contrato de marketplace
└── Cargo.toml           # Workspace configuration
```

## Instalación en Mac

```bash
# 1. Instalar Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# 2. Instalar Stellar CLI
cargo install --locked soroban-cli

# 3. Instalar target WASM
rustup target add wasm32-unknown-unknown

# 4. Configurar Stellar CLI
soroban config network add testnet --rpc-url https://soroban-testnet.stellar.org:443 --network-passphrase "Test SDF Network ; September 2015"
soroban config identity generate admin
soroban config identity fund admin --network testnet
```

## Compilación

```bash
# Compilar todos los contratos
soroban contract build

# O compilar individualmente
cargo build --target wasm32-unknown-unknown --release
```

## Deploy

```bash
# Deploy LandTokenization
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/land_tokenization.wasm \
  --source-account admin \
  --network testnet

# Deploy Marketplace  
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/marketplace.wasm \
  --source-account admin \
  --network testnet
```

## Inicialización

```bash
# Inicializar LandTokenization
soroban contract invoke \
  --id CONTRACT_ID \
  --source-account admin \
  --network testnet \
  -- \
  initialize \
  --owner ADMIN_ADDRESS

# Inicializar Marketplace
soroban contract invoke \
  --id CONTRACT_ID \
  --source-account admin \
  --network testnet \
  -- \
  initialize \
  --owner ADMIN_ADDRESS
```

## Funciones Principales

### LandTokenization
- `create_land()` - Crear nuevo terreno tokenizado
- `buy_tokens()` - Comprar tokens del terreno
- `get_land_info()` - Obtener información del terreno
- `get_available_tokens()` - Tokens disponibles

### Marketplace
- `create_listing()` - Crear listing de venta
- `buy_from_listing()` - Comprar desde listing
- `cancel_listing()` - Cancelar listing
- `get_listing()` - Obtener información del listing

## Configuración Frontend

Actualizar `src/config/stellar.ts` con los Contract IDs reales:

```typescript
CONTRACTS: {
  LAND_TOKENIZATION: {
    address: 'CONTRACT_ID_REAL',
    name: 'LandTokenization'
  },
  MARKETPLACE: {
    address: 'CONTRACT_ID_REAL', 
    name: 'Marketplace'
  }
}
```
