# Guía de Deploy - Contratos Stellar para AtomLink

## 🚀 Deploy usando Stellar Laboratory

### 1. Acceder a Stellar Laboratory
- Ve a: https://laboratory.stellar.org/
- Selecciona **"Soroban"** en el menú superior
- Elige **"Deploy Contract"**

### 2. Contratos a Deployar

#### A. Contrato LandTokenization
- **Archivo**: `land-tokenization/src/lib.rs`
- **Funciones principales**:
  - `create_land()`: Crear terreno tokenizado
  - `transfer_land()`: Transferir propiedad
  - `get_land_info()`: Consultar información
  - `get_owner_lands()`: Listar terrenos del propietario

#### B. Contrato Marketplace
- **Archivo**: `marketplace/src/lib.rs`
- **Funciones principales**:
  - `list_land_for_sale()`: Listar terreno para venta
  - `buy_land()`: Comprar terreno
  - `cancel_sale()`: Cancelar venta
  - `get_sale_info()`: Obtener información de venta

### 3. Pasos para Deploy

1. **Compilar contratos** en Stellar Laboratory
2. **Deploy a Testnet** usando la interfaz web
3. **Obtener Contract IDs** de los contratos deployados
4. **Actualizar configuración** en `stellarConfig.ts`

### 4. Configuración Post-Deploy

Una vez deployados, actualizar:
```typescript
export const STELLAR_CONTRACTS = {
  LAND_TOKENIZATION: {
    address: 'CONTRACT_ID_AQUI', // Reemplazar con ID real
    name: 'LandTokenization',
  },
  MARKETPLACE: {
    address: 'CONTRACT_ID_AQUI', // Reemplazar con ID real
    name: 'Marketplace',
  }
};
```

### 5. Pruebas

- **Testnet**: https://testnet.steexp.com/
- **Explorador**: https://testnet.stellar.org/
- **Friendbot**: https://friendbot.stellar.org/

## 📋 Estado Actual

- ✅ Contratos implementados
- ✅ Frontend migrado a Stellar
- ✅ Build exitoso
- ⏳ Deploy pendiente
- ⏳ Pruebas pendientes
