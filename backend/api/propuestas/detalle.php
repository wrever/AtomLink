<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');

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

$stmt = $conn->prepare("SELECT * FROM propuestas WHERE id = ? LIMIT 1");
$stmt->bind_param('i', $id);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();

if (!$row) {
    echo json_encode([
        'success' => false,
        'error' => 'Propuesta no encontrada',
        'data' => null
    ]);
    exit;
}

// Decodificar campos JSON si corresponde
$row['materiales'] = !empty($row['materiales']) ? json_decode($row['materiales'], true) : [];
$row['infraestructura'] = !empty($row['infraestructura']) ? json_decode($row['infraestructura'], true) : [];
$row['documentacion'] = !empty($row['documentacion']) ? json_decode($row['documentacion'], true) : [];
$row['imagenes'] = !empty($row['imagenes']) ? json_decode($row['imagenes'], true) : [];

// Devolver todos los datos
echo json_encode([
    'success' => true,
    'data' => $row
]);
exit; 