<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: *');
header('Access-Control-Allow-Methods: *');
header('Content-Type: application/json; charset=UTF-8');

ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(0);

require_once '../../config/db.php';
require_once '../../utils/helpers.php';

$wallet = $_GET['wallet'] ?? '';
if (!validar_wallet($wallet)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Wallet inválida',
        'data' => null
    ]);
    exit;
}

// Buscar el ID de la wallet
$stmt = $conn->prepare("SELECT id FROM wallets WHERE wallet_address = ?");
if (!$stmt) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error en prepare: ' . $conn->error,
        'data' => null
    ]);
    exit;
}
$stmt->bind_param("s", $wallet);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();
if (!$row) {
    echo json_encode([
        'success' => true,
        'data' => []
    ]);
    exit;
}
$wallet_id = $row['id'];

// Consulta de activos agrupados por propuesta aceptada (terreno)
$sql = "SELECT 
    p.id, p.name as nombre, p.title as titulo, p.descripcion_corta, p.descripcion_larga, p.location as ubicacion, p.superficie, p.coordenadas, p.altitud, p.clima, p.materiales, p.infraestructura, p.documentacion, p.imagenes, p.price as precio, p.status, p.submittedDate as fecha_creacion, p.supply as tokens_totales, p.supply as tokens_disponibles, p.category as categoria, p.smart_contract_address, p.token_id,
    SUM(CASE WHEN tr.tipo = 'compra' THEN tr.monto ELSE 0 END) - SUM(CASE WHEN tr.tipo = 'venta' THEN tr.monto ELSE 0 END) AS tokens
FROM transacciones tr
JOIN propuestas p ON tr.terreno_id = p.id
WHERE tr.wallet_id = ? AND p.status = 'aceptada'
GROUP BY p.id
HAVING tokens > 0";

$stmt2 = $conn->prepare($sql);
if (!$stmt2) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error en prepare: ' . $conn->error,
        'data' => null
    ]);
    exit;
}
$stmt2->bind_param("i", $wallet_id);
$stmt2->execute();
$res2 = $stmt2->get_result();
$activos = [];
while ($row = $res2->fetch_assoc()) {
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
    
    // Convierte todos los strings a UTF-8 para evitar problemas de codificación
    foreach ($row as &$value) {
        if (is_string($value)) {
            $value = mb_convert_encoding($value, 'UTF-8', 'auto');
        }
    }
    unset($value);
    $activos[] = $row;
}
echo json_encode([
    'success' => true,
    'data' => $activos
]);
exit;