<?php
// backend/utils/helpers.php

function respuesta_json($exito, $mensaje, $data = null) {
    header('Content-Type: application/json');
    echo json_encode([
        'exito' => $exito,
        'mensaje' => $mensaje,
        'data' => $data
    ]);
    exit;
}

function validar_wallet($wallet) {
    // Validación simple de dirección (puedes mejorarla)
    return preg_match('/^0x[a-fA-F0-9]{40}$/', $wallet);
} 