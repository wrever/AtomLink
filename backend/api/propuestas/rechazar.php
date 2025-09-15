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

// Recibir datos (acepta JSON o x-www-form-urlencoded)
$input = file_get_contents('php://input');
$data = json_decode($input, true);
if (!$data) {
    $data = $_POST;
}

$propuesta_id = $data['propuesta_id'] ?? '';
$motivo = $data['motivo'] ?? '';

if (!validar_numero($propuesta_id)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'ID de propuesta inválido',
        'data' => null
    ]);
    exit;
}

// Eliminar la propuesta
$stmt = $conn->prepare("DELETE FROM propuestas WHERE id = ?");
if (!$stmt) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error en prepare: ' . $conn->error,
        'data' => null
    ]);
    exit;
}
$stmt->bind_param("i", $propuesta_id);
if ($stmt->execute()) {
    echo json_encode([
        'success' => true,
        'message' => 'Propuesta eliminada correctamente'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'No se pudo eliminar la propuesta: ' . $stmt->error,
        'data' => null
    ]);
}
exit;

// Helper para validar números enteros positivos
function validar_numero($valor) {
    return (is_numeric($valor) && intval($valor) > 0);
} 