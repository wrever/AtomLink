<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../../config/db.php';

$fileName = $_GET['file'] ?? '';

if (!$fileName) {
    http_response_code(400);
    echo json_encode(['error' => 'Nombre de archivo no proporcionado']);
    exit;
}

// Sanitizar el nombre del archivo para seguridad
$fileName = basename($fileName); // Solo obtiene el nombre del archivo, sin path
$filePath = '../../uploads/propuestas/' . $fileName;

// Verificar que el archivo existe y está dentro del directorio permitido
if (!file_exists($filePath) || !is_file($filePath)) {
    http_response_code(404);
    echo json_encode(['error' => 'Archivo no encontrado']);
    exit;
}

// Obtener información del archivo
$fileSize = filesize($filePath);
$fileExtension = pathinfo($fileName, PATHINFO_EXTENSION);

// Determinar el tipo MIME basado en la extensión
$mimeTypes = [
    'pdf' => 'application/pdf',
    'doc' => 'application/msword',
    'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'txt' => 'text/plain',
    'jpg' => 'image/jpeg',
    'jpeg' => 'image/jpeg',
    'png' => 'image/png',
    'gif' => 'image/gif',
    'zip' => 'application/zip',
    'rar' => 'application/x-rar-compressed'
];

$mimeType = $mimeTypes[$fileExtension] ?? 'application/octet-stream';

// Configurar headers para forzar la descarga
header('Content-Type: ' . $mimeType);
header('Content-Disposition: attachment; filename="' . $fileName . '"');
header('Content-Length: ' . $fileSize);
header('Cache-Control: no-cache, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

// Leer y enviar el archivo
readfile($filePath);
exit;
?> 