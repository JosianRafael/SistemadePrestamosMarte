<?php
header("Content-Type: application/json"); // Indica que la respuesta será JSON
require_once("../Modules/clientesModulos.php");
require_once("../config/database.php"); // Asegúrate de incluir la conexión a la base de datos

date_default_timezone_set("America/Santo_Domingo"); // Zona horaria

// Leer los datos JSON enviados por el cliente
$json = file_get_contents("php://input");
$datos = json_decode($json, true);

// Guardar datos recibidos en un log para depuración
file_put_contents("debug_log.txt", "Datos recibidos: " . print_r($datos, true) . "\n", FILE_APPEND);

// Función para procesar los datos del cliente
function ControladorGuardarClientes($datos, $link)
{
    if (!$datos || !isset($datos["nombre"], $datos["apellido"], $datos["numero"], $datos["correo"], 
                          $datos["direccion"], $datos["fechaprestamo"], $datos["montoPorCuota"], $datos["fechasPago"], $datos["mensaje"],$datos["ruta"])) {
        echo json_encode(['status' => 'error', 'message' => 'Datos inválidos']);
        exit;
    }
    
    // Sanitizar los datos
    $nombre = htmlspecialchars($datos["nombre"]);
    $apellido = htmlspecialchars($datos["apellido"]);
    $numero = htmlspecialchars($datos["numero"]);
    $email = htmlspecialchars($datos["correo"]);
    $direccion = htmlspecialchars($datos["direccion"]);
    $fechaprestamo = htmlspecialchars($datos["fechaprestamo"]);
    $montoPorCuota = htmlspecialchars($datos["montoPorCuota"]);
    $fechasPago = htmlspecialchars($datos["fechasPago"]);
    $mensaje = htmlspecialchars($datos["mensaje"]);
    $ruta = htmlspecialchars($datos["ruta"]);
    // Verificar que los datos no estén vacíos
    if (empty($nombre) || empty($apellido) || empty($numero) || empty($direccion) ||
        empty($fechaprestamo) || empty($montoPorCuota) || empty($fechasPago) || empty($mensaje)) {
        echo json_encode(['status' => 'error', 'message' => 'Datos inválidos']);
        exit;
    }

    // Iniciar transacción
    mysqli_begin_transaction($link);
    try {
        // Llamar a la función para guardar el cliente
        GuardarClientesModulo($link, $nombre, $apellido, $numero, $email, $direccion, $ruta);
        // Confirmar la transacción si todo va bien
        mysqli_commit($link);
        echo json_encode(['status' => 'success', 'message' => 'Cliente guardado correctamente']);
    } catch (Exception $e) {
        // Revertir cambios en caso de error
        mysqli_rollback($link);
        echo json_encode(['status' => 'error', 'message' => 'Error al guardar cliente: ' . $e->getMessage()]);
    }
}

ControladorGuardarClientes($datos, $link);
?>
