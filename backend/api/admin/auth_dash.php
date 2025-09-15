<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: *');
header('Access-Control-Allow-Methods: *');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../../vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

$JWT_SECRET = 'atom_admin_secret_key_2024_super_secure_and_long_enough_for_production';

// Obtener el token del header Authorization
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? '';
if (!$authHeader || !preg_match('/Bearer\\s(.*)/', $authHeader, $matches)) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'No autorizado']);
    exit;
}
$jwt = $matches[1];

try {
    $decoded = JWT::decode($jwt, new Key($JWT_SECRET, 'HS256'));
    
    // Verificar que el token no haya expirado
    if (isset($decoded->exp) && $decoded->exp < time()) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Token expirado']);
        exit;
    }
    
    // Verificar que el token tenga los campos necesarios
    if (!isset($decoded->admin_id) || !isset($decoded->email)) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Token inválido']);
        exit;
    }
    
    // Si llega aquí, el token es válido
    echo json_encode([
        'success' => true,
        'admin_id' => $decoded->admin_id,
        'email' => $decoded->email,
        'message' => 'Acceso autorizado al dashboard'
    ]);
    exit;
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Token inválido o expirado']);
    exit;
} 