<?php
// Script para actualizar el terreno 7 con el contrato del token simple
require_once 'config/db.php';

// Dirección del contrato del token simple
$tokenContractAddress = 'CDR7HKQ7I2QKP6KXJCMS3SXVY7OP4VBIOYRSWRT5ZAXFNHNC73364KAX';

// Actualizar el terreno 7 con la dirección del contrato
$sql = "UPDATE propuestas 
        SET smart_contract_address = ? 
        WHERE id = 7 AND status = 'aceptada'";

$stmt = $conn->prepare($sql);
$stmt->bind_param('s', $tokenContractAddress);

if ($stmt->execute()) {
    echo "✅ Terreno 7 actualizado exitosamente con el contrato del token simple\n";
    echo "📋 Dirección del contrato: $tokenContractAddress\n";
    
    // Verificar la actualización
    $checkSql = "SELECT id, name, smart_contract_address FROM propuestas WHERE id = 7";
    $result = $conn->query($checkSql);
    if ($row = $result->fetch_assoc()) {
        echo "🔍 Verificación:\n";
        echo "   - ID: " . $row['id'] . "\n";
        echo "   - Nombre: " . $row['name'] . "\n";
        echo "   - Contrato: " . $row['smart_contract_address'] . "\n";
    }
} else {
    echo "❌ Error actualizando el terreno: " . $stmt->error . "\n";
}

$stmt->close();
$conn->close();
?>
