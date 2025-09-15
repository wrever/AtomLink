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

if (!$propuesta_id) {
    echo json_encode(['success' => false, 'error' => 'ID de propuesta no proporcionado']);
    exit;
}

try {
    // Verificar que la propuesta existe y está pendiente
    $stmt = $conn->prepare("SELECT id, status FROM propuestas WHERE id = ?");
    $stmt->bind_param('i', $propuesta_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $propuesta = $result->fetch_assoc();
    
    if (!$propuesta) {
        echo json_encode(['success' => false, 'error' => 'Propuesta no encontrada']);
        exit;
    }
    
    if ($propuesta['status'] !== 'pendiente') {
        echo json_encode(['success' => false, 'error' => 'La propuesta ya no está pendiente']);
        exit;
    }
    
    // Actualizar status de la propuesta a 'aceptada'
    $stmt = $conn->prepare("UPDATE propuestas SET status = 'aceptada' WHERE id = ?");
    $stmt->bind_param('i', $propuesta_id);
    $stmt->execute();
    
    if ($stmt->affected_rows > 0) {
        echo json_encode([
            'success' => true,
            'message' => 'Propuesta aprobada exitosamente. Ahora está disponible en el marketplace.'
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
        'error' => 'Error al aprobar propuesta: ' . $e->getMessage()
    ]);
}

$conn->close();
?> 