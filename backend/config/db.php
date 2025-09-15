<?php
// backend/config/db.php

$host = 'localhost';
$user = 'atomlink_brunixso';
$password = 'Brn08a19!';
$dbname = 'atomlink_all';

$conn = new mysqli($host, $user, $password, $dbname);

if ($conn->connect_error) {
    die('Error de conexión a la base de datos: ' . $conn->connect_error);
}

// Puedes usar $conn en tus scripts PHP para consultas 