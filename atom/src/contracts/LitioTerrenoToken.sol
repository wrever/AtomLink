// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title LitioTerrenoToken
 * @dev Smart contract para tokenizar terrenos con yacimientos de litio
 * Basado en ERC-1155 para mayor flexibilidad
 */
contract LitioTerrenoToken is ERC1155, Ownable {
    using Strings for uint256;
    
    // Estructura para información del terreno
    struct TerrenoInfo {
        string nombre;
        string ubicacion;
        uint256 precioPorToken;
        uint256 supplyTotal;
        uint256 tokensDisponibles;
        string metadata;
        bool activo;
    }
    
    // Mapeo de token ID a información del terreno
    mapping(uint256 => TerrenoInfo) public terrenos;
    
    // Contador de terrenos
    uint256 public totalTerrenos;
    
    // Eventos
    event TerrenoCreado(uint256 indexed tokenId, string nombre, string ubicacion, uint256 precio, uint256 supply);
    event TokensComprados(address indexed comprador, uint256 indexed tokenId, uint256 cantidad, uint256 precioTotal);
    event PrecioActualizado(uint256 indexed tokenId, uint256 nuevoPrecio);
    event SupplyActualizado(uint256 indexed tokenId, uint256 nuevoSupply);
    
    constructor() ERC1155("") Ownable(msg.sender) {}
    
    /**
     * @dev URI para metadata de los tokens
     */
    function uri(uint256 tokenId) public view virtual override returns (string memory) {
        return string(abi.encodePacked("https://atomlink.pro/api/metadata/", tokenId.toString()));
    }
    
    /**
     * @dev Crear un nuevo terreno tokenizado
     * @param _nombre Nombre del terreno
     * @param _ubicacion Ubicación del terreno
     * @param _precioPorToken Precio por token en wei
     * @param _supplyTotal Supply total de tokens
     * @param _metadata Metadata adicional del terreno
     */
    function crearTerreno(
        string memory _nombre,
        string memory _ubicacion,
        uint256 _precioPorToken,
        uint256 _supplyTotal,
        string memory _metadata
    ) external onlyOwner returns (uint256) {
        require(_precioPorToken > 0, "Precio debe ser mayor a 0");
        require(_supplyTotal > 0, "Supply debe ser mayor a 0");
        
        uint256 tokenId = totalTerrenos + 1;
        
        terrenos[tokenId] = TerrenoInfo({
            nombre: _nombre,
            ubicacion: _ubicacion,
            precioPorToken: _precioPorToken,
            supplyTotal: _supplyTotal,
            tokensDisponibles: _supplyTotal,
            metadata: _metadata,
            activo: true
        });
        
        totalTerrenos = tokenId;
        
        // Mint inicial de tokens al owner
        _mint(msg.sender, tokenId, _supplyTotal, "");
        
        emit TerrenoCreado(tokenId, _nombre, _ubicacion, _precioPorToken, _supplyTotal);
        
        return tokenId;
    }
    
    /**
     * @dev Comprar tokens de un terreno
     * @param tokenId ID del token del terreno
     * @param cantidad Cantidad de tokens a comprar
     */
    function comprarTokens(uint256 tokenId, uint256 cantidad) external payable {
        TerrenoInfo storage terreno = terrenos[tokenId];
        require(terreno.activo, "Terreno no activo");
        require(cantidad > 0, "Cantidad debe ser mayor a 0");
        require(terreno.tokensDisponibles >= cantidad, "Tokens insuficientes");
        require(msg.value == terreno.precioPorToken * cantidad, "Precio incorrecto");
        
        // Transferir tokens al comprador
        _safeTransferFrom(owner(), msg.sender, tokenId, cantidad, "");
        
        // Actualizar disponibilidad
        terreno.tokensDisponibles -= cantidad;
        
        emit TokensComprados(msg.sender, tokenId, cantidad, msg.value);
    }
    
    /**
     * @dev Obtener información de un terreno
     * @param tokenId ID del token del terreno
     */
    function obtenerInfoTerreno(uint256 tokenId) external view returns (
        string memory nombre,
        string memory ubicacion,
        uint256 precioPorToken,
        uint256 supplyTotal,
        uint256 tokensDisponibles,
        string memory metadata,
        bool activo
    ) {
        TerrenoInfo storage terreno = terrenos[tokenId];
        return (
            terreno.nombre,
            terreno.ubicacion,
            terreno.precioPorToken,
            terreno.supplyTotal,
            terreno.tokensDisponibles,
            terreno.metadata,
            terreno.activo
        );
    }
    
    /**
     * @dev Obtener precio por token
     * @param tokenId ID del token del terreno
     */
    function obtenerPrecioPorToken(uint256 tokenId) external view returns (uint256) {
        return terrenos[tokenId].precioPorToken;
    }
    
    /**
     * @dev Obtener tokens disponibles
     * @param tokenId ID del token del terreno
     */
    function obtenerTokensDisponibles(uint256 tokenId) external view returns (uint256) {
        return terrenos[tokenId].tokensDisponibles;
    }
    
    /**
     * @dev Actualizar precio por token (solo owner)
     * @param tokenId ID del token del terreno
     * @param nuevoPrecio Nuevo precio por token
     */
    function actualizarPrecio(uint256 tokenId, uint256 nuevoPrecio) external onlyOwner {
        require(nuevoPrecio > 0, "Precio debe ser mayor a 0");
        require(terrenos[tokenId].activo, "Terreno no existe");
        
        terrenos[tokenId].precioPorToken = nuevoPrecio;
        
        emit PrecioActualizado(tokenId, nuevoPrecio);
    }
    
    /**
     * @dev Actualizar supply total (solo owner)
     * @param tokenId ID del token del terreno
     * @param nuevoSupply Nuevo supply total
     */
    function actualizarSupply(uint256 tokenId, uint256 nuevoSupply) external onlyOwner {
        require(nuevoSupply > 0, "Supply debe ser mayor a 0");
        require(terrenos[tokenId].activo, "Terreno no existe");
        require(nuevoSupply >= terrenos[tokenId].supplyTotal - terrenos[tokenId].tokensDisponibles, "Supply insuficiente");
        
        uint256 diferencia = nuevoSupply - terrenos[tokenId].supplyTotal;
        
        if (diferencia > 0) {
            // Mint tokens adicionales
            _mint(msg.sender, tokenId, diferencia, "");
            terrenos[tokenId].tokensDisponibles += diferencia;
        }
        
        terrenos[tokenId].supplyTotal = nuevoSupply;
        
        emit SupplyActualizado(tokenId, nuevoSupply);
    }
    
    /**
     * @dev Activar/desactivar terreno (solo owner)
     * @param tokenId ID del token del terreno
     * @param activo Estado de activación
     */
    function setTerrenoActivo(uint256 tokenId, bool activo) external onlyOwner {
        terrenos[tokenId].activo = activo;
    }
    
    /**
     * @dev Retirar ETH del contrato (solo owner)
     */
    function retirarETH() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No hay ETH para retirar");
        
        payable(owner()).transfer(balance);
    }
    
    /**
     * @dev Obtener balance de ETH del contrato
     */
    function obtenerBalanceETH() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Obtener total de terrenos creados
     */
    function obtenerTotalTerrenos() external view returns (uint256) {
        return totalTerrenos;
    }
    
    /**
     * @dev Verificar si un terreno existe
     * @param tokenId ID del token del terreno
     */
    function terrenoExiste(uint256 tokenId) external view returns (bool) {
        return terrenos[tokenId].activo;
    }
} 