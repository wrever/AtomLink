<?php
require_once 'config/db.php';

// Dirección del contrato simple token
$simpleTokenAddress = 'CC3Q6XY7AW5MSDJEDE2RIAGWOTEO4JHVMAMJ7QFHTQ2DGJLOVR7MNMDU';

try {
    $pdo = new PDO($dsn, $username, $password, $options);
    
    // Actualizar el terreno 7 con la dirección del contrato simple
    $sql = "UPDATE propuestas SET smart_contract_address = :address WHERE id = 7";
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':address', $simpleTokenAddress);
    
    if ($stmt->execute()) {
        echo "✅ Terreno 7 actualizado con contrato simple: $simpleTokenAddress\n";
    } else {
        echo "❌ Error actualizando terreno 7\n";
    }
    
} catch (PDOException $e) {
    echo "❌ Error de conexión: " . $e->getMessage() . "\n";
}
?>
