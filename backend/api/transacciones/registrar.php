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

$wallet = $_POST['wallet'] ?? '';
$terreno_id = $_POST['terreno_id'] ?? '';
$monto = intval($_POST['monto'] ?? 0);
$hash = $_POST['hash'] ?? '';
$smart_contract_address = $_POST['smart_contract_address'] ?? '';
$fecha = date('Y-m-d H:i:s');

// Validaciones
if (!validar_wallet($wallet)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Wallet inválida',
        'data' => null
    ]);
    exit;
}

if (!$terreno_id || !$monto || $monto <= 0) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Datos incompletos o inválidos',
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
    // Si la wallet no existe, la creamos
    $stmt2 = $conn->prepare("INSERT INTO wallets (wallet_address) VALUES (?)");
    if (!$stmt2) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Error al crear wallet: ' . $conn->error,
            'data' => null
        ]);
        exit;
    }
    $stmt2->bind_param("s", $wallet);
    $stmt2->execute();
    $wallet_id = $stmt2->insert_id;
} else {
    $wallet_id = $row['id'];
}

// Validar stock disponible antes de registrar la transacción
$stmtStock = $conn->prepare("SELECT supply FROM propuestas WHERE id = ? AND status = 'aceptada'");
if (!$stmtStock) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error en prepare stock: ' . $conn->error,
        'data' => null
    ]);
    exit;
}
$stmtStock->bind_param("i", $terreno_id);
$stmtStock->execute();
$resStock = $stmtStock->get_result();
$rowStock = $resStock->fetch_assoc();

if (!$rowStock) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Terreno no encontrado o no está disponible',
        'data' => null
    ]);
    exit;
}

$tokens_disponibles = intval($rowStock['supply']);
if ($tokens_disponibles < $monto) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'No hay suficientes tokens disponibles. Disponible: ' . $tokens_disponibles . ', Solicitado: ' . $monto,
        'data' => null
    ]);
    exit;
}

// Registrar la transacción
$stmt3 = $conn->prepare("INSERT INTO transacciones (wallet_id, terreno_id, monto, tipo, fecha, hash, smart_contract_address) VALUES (?, ?, ?, 'compra', ?, ?, ?)");
if (!$stmt3) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error al registrar transacción: ' . $conn->error,
        'data' => null
    ]);
    exit;
}
$stmt3->bind_param("iiisss", $wallet_id, $terreno_id, $monto, $fecha, $hash, $smart_contract_address);

if (!$stmt3->execute()) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error al ejecutar transacción: ' . $stmt3->error,
        'data' => null
    ]);
    exit;
}

// Actualizar supply en la tabla propuestas (terrenos aceptados)
$stmt4 = $conn->prepare("UPDATE propuestas SET supply = supply - ? WHERE id = ? AND status = 'aceptada'");
if (!$stmt4) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error al actualizar supply: ' . $conn->error,
        'data' => null
    ]);
    exit;
}
$stmt4->bind_param("ii", $monto, $terreno_id);

if (!$stmt4->execute()) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error al ejecutar actualización de supply: ' . $stmt4->error,
        'data' => null
    ]);
    exit;
}

// Respuesta exitosa
echo json_encode([
    'success' => true,
    'message' => 'Transacción registrada exitosamente',
    'data' => [
        'transaction_id' => $stmt3->insert_id,
        'wallet_id' => $wallet_id,
        'terreno_id' => $terreno_id,
        'monto' => $monto,
        'hash' => $hash,
        'fecha' => $fecha
    ]
]);
exit; 