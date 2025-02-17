<?php
require_once __DIR__ . '/../Config/config.php';
session_start();

// Verificar si las claves existen antes de usarlas
$usuario = $_POST['usuario'] ?? null;
$contrasena = $_POST['password'] ?? null;

if (!$usuario || !$contrasena) {
    echo json_encode(["success" => false, "error" => "Faltan datos obligatorios."]);
    exit;
}

// Modificar la consulta SQL para incluir 'rol'
$query = "SELECT usuario, password, rol FROM login_usuario WHERE usuario = ?";
$stmt = $link->prepare($query);
$stmt->bind_param("s", $usuario);
$stmt->execute();
$resultado = $stmt->get_result();

if ($resultado->num_rows > 0) {
    $fila = $resultado->fetch_assoc();
    $passwordHash = $fila['password'];  
    $rol = $fila["rol"];  // Ya no dará error porque ahora sí está en la consulta

    // Verificar contraseña
    if (password_verify($contrasena, $passwordHash)) {
        $_SESSION["session"] = "admin";  
        
        // Definir la página a redirigir según el rol
        $pag = ($rol == "Admin") ? "sistema.php" : "secretaria.php";

        // Respuesta JSON correcta en un solo `echo`
        echo json_encode([
            "success" => true, 
            "usuario" => $fila['usuario'],
            "pag" => $pag
        ]);
    } else {
        echo json_encode(["success" => false, "error" => "Contraseña incorrecta."]);
    }
} else {
    echo json_encode(["success" => false, "error" => "Usuario no encontrado."]);
}

$stmt->close();
$link->close();
?>
