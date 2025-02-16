<?php
require_once __DIR__ . '/../Config/config.php';

$usuario = $_POST['usuario'];
$contrasena = $_POST['password'];

$query = "SELECT usuario, password FROM login_usuario WHERE usuario = ?";
$stmt = $link->prepare($query);
$stmt->bind_param("s", $usuario);
$stmt->execute();
$resultado = $stmt->get_result();

if ($resultado->num_rows > 0) {
    $fila = $resultado->fetch_assoc();
    $passwordHash = $fila['password'];  // Contraseña almacenada en la base de datos (texto plano)

    if ($contrasena === $passwordHash) {  // Comparación directa (sin password_verify)
        echo json_encode(["success" => true, "usuario" => $fila['usuario']]);
    } else {
        echo json_encode(["success" => false, "error" => "Contraseña incorrecta."]);
    }
} else {
    echo json_encode(["success" => false, "error" => "Usuario no encontrado."]);
}

$stmt->close();
$link->close();
?>
