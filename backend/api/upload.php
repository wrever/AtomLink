<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

$targetDir = __DIR__ . '/../../uploads/';
$maxFileSize = 5 * 1024 * 1024; // 5MB
$allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

if (!isset($_FILES['imagen'])) {
    echo json_encode(['success' => false, 'error' => 'No se envió ningún archivo']);
    exit;
}

$file = $_FILES['imagen'];
if ($file['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['success' => false, 'error' => 'Error al subir el archivo']);
    exit;
}
if ($file['size'] > $maxFileSize) {
    echo json_encode(['success' => false, 'error' => 'El archivo es demasiado grande (máx 5MB)']);
    exit;
}
if (!in_array(mime_content_type($file['tmp_name']), $allowedTypes)) {
    echo json_encode(['success' => false, 'error' => 'Tipo de archivo no permitido']);
    exit;
}

// Generar nombre único
$ext = pathinfo($file['name'], PATHINFO_EXTENSION);
$nombreArchivo = uniqid('img_', true) . '.' . $ext;
$rutaDestino = $targetDir . $nombreArchivo;

if (!move_uploaded_file($file['tmp_name'], $rutaDestino)) {
    echo json_encode(['success' => false, 'error' => 'No se pudo guardar el archivo']);
    exit;
}

// Ruta relativa para guardar en la base de datos
$rutaRelativa = 'uploads/' . $nombreArchivo;
echo json_encode(['success' => true, 'ruta' => $rutaRelativa]); 