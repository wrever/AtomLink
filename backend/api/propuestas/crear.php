<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: *');
header('Access-Control-Allow-Methods: *');
header('Content-Type: application/json; charset=UTF-8');

ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(0);

require_once '../../config/db.php';

// Leer datos del formulario (POST)
$data = $_POST;

// Serializar arrays a JSON
$materiales_json = isset($data['materiales']) ? (is_array($data['materiales']) ? json_encode($data['materiales'], JSON_UNESCAPED_UNICODE) : $data['materiales']) : '[]';
$infraestructura_json = isset($data['infraestructura']) ? (is_array($data['infraestructura']) ? json_encode($data['infraestructura'], JSON_UNESCAPED_UNICODE) : $data['infraestructura']) : '[]';
$documentacion_json = '[]'; // Por ahora vacío
$imagenes_json = '[]'; // Por ahora vacío
$imagen_url = null; // Por ahora vacío

// Insertar en la base de datos
$stmt = $conn->prepare("INSERT INTO propuestas (
    name, title, ownerName, ownerEmail, ownerIdNumber, ownerDocNumber, descripcion_corta, descripcion_larga, category, tokenType, supply, price, location, superficie, coordenadas, altitud, clima, materiales, infraestructura, documentacion, imagen, imagenes, status, submittedBy, submittedDate
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

if (!$stmt) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error en prepare: ' . $conn->error,
        'data' => null
    ]);
    exit;
}

$stmt->bind_param(
    "ssssssssssisssssssssssss",
    $data['name'] ?? '',
    $data['title'] ?? '',
    $data['ownerName'] ?? '',
    $data['ownerEmail'] ?? '',
    $data['ownerIdNumber'] ?? '',
    $data['ownerDocNumber'] ?? '',
    $data['descripcion_corta'] ?? '',
    $data['descripcion_larga'] ?? '',
    $data['category'] ?? '',
    $data['tokenType'] ?? '',
    intval($data['supply'] ?? 0),
    $data['price'] ?? '',
    $data['location'] ?? '',
    $data['superficie'] ?? '',
    $data['coordenadas'] ?? '',
    $data['altitud'] ?? '',
    $data['clima'] ?? '',
    $materiales_json,
    $infraestructura_json,
    $documentacion_json,
    $imagen_url,
    $imagenes_json,
    $status = 'pendiente',
    $data['ownerEmail'] ?? '',
    $fecha = date('Y-m-d')
);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'id' => $conn->insert_id]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $stmt->error,
        'data' => null
    ]);
}
$stmt->close();
$conn->close();
exit; 