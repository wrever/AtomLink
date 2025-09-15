import { STELLAR_CONTRACTS } from '../contracts/stellarConfig';

// Función para comprar tokens usando el contrato Stellar real
export const buyTokensWithStellar = async (
  landId: number,
  amount: number,
  pricePerToken: number,
  buyerAddress: string,
  callContract: (contractAddress: string, functionName: string, args: any[]) => Promise<any>
): Promise<any> => {
  try {
    console.log('Iniciando compra real de tokens en Stellar...');
    console.log('Land ID:', landId);
    console.log('Cantidad:', amount);
    console.log('Precio por token:', pricePerToken);
    console.log('Comprador:', buyerAddress);

    // 1. Verificar que el terreno está disponible para venta
    const isForSale = await callContract(
      STELLAR_CONTRACTS.MARKETPLACE.address,
      'is_land_for_sale',
      [landId]
    );

    if (!isForSale) {
      throw new Error('El terreno no está disponible para venta');
    }

    // 2. Obtener información de la venta
    const saleInfo = await callContract(
      STELLAR_CONTRACTS.MARKETPLACE.address,
      'get_sale_info',
      [landId]
    );

    console.log('Información de venta:', saleInfo);

    // 3. Verificar que el precio es correcto
    const expectedPrice = saleInfo.price;
    const totalPrice = amount * pricePerToken;
    
    console.log('Validación de precio:');
    console.log('- Precio esperado (stroops):', expectedPrice);
    console.log('- Precio calculado (XLM):', totalPrice);
    console.log('- Precio calculado en stroops:', totalPrice * 10000000);
    
    // Convertir el precio calculado a stroops para comparar
    const totalPriceInStroops = Math.round(totalPrice * 10000000);
    
    if (totalPriceInStroops !== expectedPrice) {
      throw new Error(`Precio incorrecto. Esperado: ${expectedPrice} stroops (${expectedPrice/10000000} XLM), Calculado: ${totalPriceInStroops} stroops (${totalPrice} XLM)`);
    }

    // 4. Comprar el terreno
    const buyResult = await callContract(
      STELLAR_CONTRACTS.MARKETPLACE.address,
      'buy_land',
      [buyerAddress, landId]
    );

    console.log('Resultado de compra:', buyResult);

    if (!buyResult) {
      throw new Error('La compra falló');
    }

    // 5. Verificar que la compra fue exitosa
    const updatedSaleInfo = await callContract(
      STELLAR_CONTRACTS.MARKETPLACE.address,
      'get_sale_info',
      [landId]
    );

    if (updatedSaleInfo.is_active) {
      throw new Error('El terreno sigue disponible, la compra no se completó');
    }

    return {
      success: true,
      message: 'Compra exitosa en Stellar Network',
      details: {
        landId,
        amount,
        pricePerToken,
        totalPrice,
        buyerAddress,
        contractAddress: STELLAR_CONTRACTS.MARKETPLACE.address,
        saleInfo: updatedSaleInfo
      }
    };

  } catch (error) {
    console.error('Error en buyTokensWithStellar:', error);
    throw new Error(`Error al comprar tokens: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
};

export default buyTokensWithStellar;
