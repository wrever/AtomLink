<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(0);

require_once '../../config/db.php';

// Obtener propuestas aprobadas que se han convertido en terrenos disponibles
$sql = "SELECT 
    p.id,
    p.name as nombre,
    p.title as titulo,
    p.descripcion_corta,
    p.descripcion_larga,
    p.location as ubicacion,
    p.superficie,
    p.coordenadas,
    p.altitud,
    p.clima,
    p.materiales,
    p.infraestructura,
    p.documentacion,
    p.imagenes,
    p.price as precio,
    p.supply as tokens_totales,
    p.supply as tokens_disponibles,
    p.tokenType as tipo_token,
    p.category as categoria,
    p.smart_contract_address,
    p.submittedDate as fecha_creacion,
    p.status,
    'disponible' as terreno_status
FROM propuestas p 
WHERE p.status = 'aceptada'
ORDER BY p.submittedDate DESC";

$result = $conn->query($sql);

if ($result === false) {
    echo json_encode([
        'success' => false,
        'error' => $conn->error,
        'sql' => $sql,
        'data' => []
    ]);
    exit;
}

$terrenos = [];
while ($row = $result->fetch_assoc()) {
    // Decodificar campos JSON si no están vacíos
    $row['imagenes'] = !empty($row['imagenes']) ? json_decode($row['imagenes'], true) : [];
    $row['materiales'] = !empty($row['materiales']) ? json_decode($row['materiales'], true) : [];
    $row['infraestructura'] = !empty($row['infraestructura']) ? json_decode($row['infraestructura'], true) : [];
    $row['documentacion'] = !empty($row['documentacion']) ? json_decode($row['documentacion'], true) : [];
    
    // Asegurar que tenemos una imagen principal
    if (empty($row['imagenes']) || !is_array($row['imagenes']) || count($row['imagenes']) === 0) {
        $row['imagen'] = 'https://via.placeholder.com/400x250?text=Terreno';
    } else {
        $row['imagen'] = $row['imagenes'][0];
    }
    
    $terrenos[] = $row;
}

echo json_encode([
    'success' => true,
    'data' => $terrenos
]);
// No cerrar el PHP ni dejar espacios en blanco después 