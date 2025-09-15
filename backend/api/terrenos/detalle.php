<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: *');
header('Access-Control-Allow-Methods: *');

require_once '../../config/db.php';

$id = $_GET['id'] ?? '';
if (!$id) {
    echo json_encode([
        'success' => false,
        'error' => 'ID no proporcionado',
        'data' => null
    ]);
    exit;
}

$sql = "SELECT 
    p.id,
    p.name as nombre,
    p.title as titulo,
    p.descripcion_corta,
    p.descripcion_larga,
    p.location as ubicacion,
    p.superficie,
    p.coordenadas,
    p.altitud,
    p.clima,
    p.materiales,
    p.infraestructura,
    p.documentacion,
    p.imagenes,
    p.price as precio,
    p.supply as tokens_totales,
    p.supply as tokens_disponibles,
    p.tokenType as tipo_token,
    p.category as categoria,
    p.smart_contract_address,
    p.submittedDate as fecha_creacion,
    p.status,
    'disponible' as terreno_status
FROM propuestas p 
WHERE p.id = ? AND p.status = 'aceptada'
LIMIT 1";
$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $id);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();

if (!$row) {
    echo json_encode([
        'success' => false,
        'error' => 'Terreno no encontrado o no está disponible',
        'data' => null
    ]);
    exit;
}

// Decodificar campos JSON si no están vacíos
$row['imagenes'] = !empty($row['imagenes']) ? json_decode($row['imagenes'], true) : [];
$row['materiales'] = !empty($row['materiales']) ? json_decode($row['materiales'], true) : [];
$row['infraestructura'] = !empty($row['infraestructura']) ? json_decode($row['infraestructura'], true) : [];
$row['documentacion'] = !empty($row['documentacion']) ? json_decode($row['documentacion'], true) : [];

// Asegurar que tenemos una imagen principal
if (empty($row['imagenes']) || !is_array($row['imagenes']) || count($row['imagenes']) === 0) {
    $row['imagen'] = 'https://via.placeholder.com/400x250?text=Terreno';
} else {
    $row['imagen'] = $row['imagenes'][0];
}

// Validar y obtener información del smart contract si existe
if (!empty($row['smart_contract_address'])) {
    $contractInfo = validateAndGetContractInfo($row['smart_contract_address'], $id);
    $row['contract_info'] = $contractInfo;
    
    // Si el contrato tiene información válida, usar esos valores
    if ($contractInfo['isValid'] && isset($contractInfo['info'])) {
        $row['precio_contract'] = $contractInfo['info']['precioPorToken'] ?? $row['precio'];
        $row['supply_contract'] = $contractInfo['info']['supplyTotal'] ?? $row['tokens_totales'];
        $row['tokens_disponibles_contract'] = $contractInfo['info']['tokensDisponibles'] ?? $row['tokens_disponibles'];
        $row['terreno_activo'] = $contractInfo['info']['activo'] ?? true;
    }
}

echo json_encode([
    'success' => true,
    'data' => $row
]);

// Función para validar y obtener información del contrato
function validateAndGetContractInfo($contractAddress, $terrenoId) {
    // Validar formato de dirección
    if (!preg_match('/^0x[a-fA-F0-9]{40}$/', $contractAddress)) {
        return [
            'isValid' => false,
            'error' => 'Dirección de contrato inválida'
        ];
    }
    
    // Aquí podrías hacer una llamada a un servicio web3 para validar el contrato
    // Por ahora, retornamos información básica
    return [
        'isValid' => true,
        'contractAddress' => $contractAddress,
        'terrenoId' => $terrenoId,
        'info' => [
            'precioPorToken' => null, // Se obtendrá desde el frontend
            'supplyTotal' => null,    // Se obtendrá desde el frontend
            'tokensDisponibles' => null, // Se obtendrá desde el frontend
            'activo' => true
        ],
        'message' => 'Contrato válido, información se obtendrá desde el frontend'
    ];
}
// No cerrar el PHP ni dejar espacios en blanco después 