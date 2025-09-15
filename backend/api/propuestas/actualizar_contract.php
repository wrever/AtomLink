<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$propuesta_id = $input['propuesta_id'] ?? '';
$smart_contract_address = $input['smart_contract_address'] ?? '';

if (!$propuesta_id) {
    echo json_encode(['success' => false, 'error' => 'ID de propuesta no proporcionado']);
    exit;
}

if (!$smart_contract_address) {
    echo json_encode(['success' => false, 'error' => 'Dirección del smart contract no proporcionada']);
    exit;
}

// Validar formato de dirección Stellar (56 caracteres, empieza con C)
if (!preg_match('/^C[a-zA-Z0-9]{55}$/', $smart_contract_address)) {
    echo json_encode(['success' => false, 'error' => 'Formato de dirección Stellar inválido']);
    exit;
}

try {
    // Verificar que la propuesta existe y está aprobada
    $stmt = $conn->prepare("SELECT id, status FROM propuestas WHERE id = ?");
    $stmt->bind_param('i', $propuesta_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $propuesta = $result->fetch_assoc();
    
    if (!$propuesta) {
        echo json_encode(['success' => false, 'error' => 'Propuesta no encontrada']);
        exit;
    }
    
    if ($propuesta['status'] !== 'aceptada') {
        echo json_encode(['success' => false, 'error' => 'Solo se puede asignar smart contract a propuestas aprobadas']);
        exit;
    }
    
    // Actualizar la dirección del smart contract
    $stmt = $conn->prepare("UPDATE propuestas SET smart_contract_address = ? WHERE id = ?");
    $stmt->bind_param('si', $smart_contract_address, $propuesta_id);
    $stmt->execute();
    
    if ($stmt->affected_rows > 0) {
        echo json_encode([
            'success' => true,
            'message' => 'Smart contract asignado exitosamente'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'No se pudo actualizar la propuesta'
        ]);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Error al actualizar smart contract: ' . $e->getMessage()
    ]);
}

$conn->close();
?> 