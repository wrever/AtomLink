<?php
header('Access-Control-Allow-Origin: *');

$baseDir = realpath(__DIR__ . '/../../uploads/propuestas/');
$file = $_GET['file'] ?? '';

// Seguridad: evitar path traversal
if (!$file || strpos($file, '..') !== false || strpos($file, '/') !== false || strpos($file, '\\') !== false) {
    http_response_code(400);
    echo 'Archivo inválido';
    exit;
}

$fullPath = $baseDir . DIRECTORY_SEPARATOR . $file;
if (!file_exists($fullPath) || !is_file($fullPath)) {
    http_response_code(404);
    echo 'Archivo no encontrado';
    exit;
}

// Forzar descarga
header('Content-Description: File Transfer');
header('Content-Type: application/octet-stream');
header('Content-Disposition: attachment; filename="' . basename($file) . '"');
header('Expires: 0');
header('Cache-Control: must-revalidate');
header('Pragma: public');
header('Content-Length: ' . filesize($fullPath));
readfile($fullPath);
exit; 