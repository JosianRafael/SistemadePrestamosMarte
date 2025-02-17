<?php
require_once __DIR__ . '/../Config/config.php';
session_start();
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
    $rol = $fila["rol"];
    if ($rol == "Admin")
    {
        $pag = "sistema.php";
    }else
    {
        $pag = "secretaria.php";
    }

    if (password_verify($contrasena,$passwordHash)) {  // Comparación directa (sin password_verify)
<<<<<<< HEAD
        echo json_encode(["success" => true, "usuario" => $fila['usuario']]);
=======
        echo json_encode(["success" => true, "pag" => $pag ,"usuario" => $fila['usuario']]);
        $_SESSION["session"] = "admin";
>>>>>>> dd3913a515855912da74ccb9d5ea6e04d15aa422
    } else {
        echo json_encode(["success" => false, "error" => "Contraseña incorrecta."]);
    }
} else {
    echo json_encode(["success" => false, "error" => "Usuario no encontrado."]);
}

$stmt->close();
$link->close();

?>
