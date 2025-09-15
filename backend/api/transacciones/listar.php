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

// Normaliza la dirección a minúsculas para comparación insensible a mayúsculas/minúsculas
$wallet = strtolower($_GET['wallet'] ?? '');

if (!validar_wallet($wallet)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Wallet inválida',
        'data' => []
    ]);
    exit;
}

// Buscar el ID de la wallet (comparando en minúsculas)
$stmt = $conn->prepare("SELECT id FROM wallets WHERE LOWER(wallet_address) = ?");
if (!$stmt) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error en prepare: ' . $conn->error,
        'data' => []
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

// Buscar las transacciones de la wallet
$sql = "SELECT 
    tr.id, 
    tr.monto AS amount, 
    tr.tipo AS type, 
    tr.fecha AS date, 
    tr.hash, 
    tr.smart_contract_address,
    p.id AS terreno_id,
    p.name AS terreno_name, 
    p.title AS terreno_title,
    p.category AS category, 
    p.price AS price, 
    p.location AS location,
    p.smart_contract_address AS terreno_contract,
    p.token_id
FROM transacciones tr
JOIN propuestas p ON tr.terreno_id = p.id
WHERE tr.wallet_id = ? AND p.status = 'aceptada'
ORDER BY tr.fecha DESC";

$stmt2 = $conn->prepare($sql);
if (!$stmt2) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error en prepare transacciones: ' . $conn->error,
        'data' => []
    ]);
    exit;
}
$stmt2->bind_param("i", $wallet_id);
$stmt2->execute();
$res2 = $stmt2->get_result();
$transacciones = [];

while ($row = $res2->fetch_assoc()) {
    // Calcular valor total de la transacción
    $precio_numerico = floatval(str_replace([' ETH', ' USD'], '', $row['price']));
    $valor_total = $row['amount'] * $precio_numerico;
    
    // Convierte todos los strings a UTF-8 para evitar problemas de codificación
    foreach ($row as &$value) {
        if (is_string($value)) {
            $value = mb_convert_encoding($value, 'UTF-8', 'auto');
        }
    }
    unset($value);
    
    $transacciones[] = [
        'id' => $row['id'],
        'amount' => intval($row['amount']),
        'type' => $row['type'],
        'date' => $row['date'],
        'hash' => $row['hash'],
        'smart_contract_address' => $row['smart_contract_address'],
        'terreno_id' => $row['terreno_id'],
        'terreno_name' => $row['terreno_name'] ?: $row['terreno_title'],
        'category' => $row['category'],
        'price' => $row['price'],
        'location' => $row['location'],
        'terreno_contract' => $row['terreno_contract'],
        'token_id' => $row['token_id'],
        'total_value' => $valor_total
    ];
}

echo json_encode([
    'success' => true,
    'data' => $transacciones
]);
exit; 