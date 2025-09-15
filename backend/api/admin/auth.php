<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: *');
header('Access-Control-Allow-Methods: *');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(0);

require_once '../../config/db.php';
require_once '../../vendor/autoload.php';

use Firebase\JWT\JWT;

$JWT_SECRET = 'atom_admin_secret_key_2024_super_secure_and_long_enough_for_production';

// Leer datos JSON del body
$data = json_decode(file_get_contents('php://input'), true);
$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

if (!$email || !$password) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Email y contraseña requeridos',
        'data' => null
    ]);
    exit;
}

// Buscar el admin por usuario (correo)
$stmt = $conn->prepare("SELECT id, usuario, password FROM admins WHERE usuario = ?");
if (!$stmt) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error en prepare: ' . $conn->error,
        'data' => null
    ]);
    exit;
}
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();
$admin = $result->fetch_assoc();

if (!$admin) {
    echo json_encode([
        'success' => false,
        'error' => 'Usuario o contraseña incorrectos',
        'data' => null
    ]);
    exit;
}

if (!password_verify($password, $admin['password'])) {
    echo json_encode([
        'success' => false,
        'error' => 'Usuario o contraseña incorrectos',
        'data' => null
    ]);
    exit;
}

// Si todo está bien, generar JWT y responder con los datos del admin
$payload = [
    'admin_id' => $admin['id'],
    'email' => $admin['usuario'],
    'iat' => time(),
    'exp' => time() + (60 * 60 * 24) // 24 horas
];

try {
    $jwt = JWT::encode($payload, $JWT_SECRET, 'HS256');
    
    echo json_encode([
        'success' => true,
        'data' => [
            'id' => $admin['id'],
            'email' => $admin['usuario'],
            'token' => $jwt
        ]
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error al generar token de autenticación',
        'data' => null
    ]);
}
exit;
