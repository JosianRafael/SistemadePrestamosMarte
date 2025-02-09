<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

header("Content-Type: application/json"); // Indica que la respuesta será JSON
require_once("../Modules/rutasModulos.php");
require_once("../Config/config.php"); // Asegúrate de incluir la conexión a la base de datos

date_default_timezone_set("America/Santo_Domingo"); // Zona horaria

// Leer los datos JSON enviados por el cliente
$json = file_get_contents("php://input");
$datos = json_decode($json, true);

// Guardar datos recibidos en un log para depuración
file_put_contents("debug_log.txt", "Datos recibidos: " . print_r($datos, true) . "\n", FILE_APPEND);

// Función para procesar los datos del cliente
function ControladorGuardarRutas($datos, $link)
{
    if (!$datos || !isset($datos["nombreRuta"], $datos["fondosRuta"])) {
        echo json_encode(['status' => 'error', 'message' => 'Datos inválidos']);
        exit;
    }
    
    // Sanitizar los datos
    $nombre = htmlspecialchars($datos["nombreRuta"]);
    $montoruta = htmlspecialchars($datos["fondosRuta"]);

    // Verificar que los datos no estén vacíos
    if (empty($nombre) || empty($montoruta)) {
        echo json_encode(['status' => 'error', 'message' => 'Favor complete todos los campos']);
        exit;
    }

    // Iniciar transacción
    mysqli_begin_transaction($link);
    try {
        // Llamar a la función para guardar la ruta
        GuardarRutasModulo($link,$nombre,$montoruta);
        // Confirmar la transacción si todo va bien
        mysqli_commit($link);
        echo json_encode(['status' => 'success', 'message' => 'Ruta guardada correctamente']);
    } catch (Exception $e) {
        // Revertir cambios en caso de error
        mysqli_rollback($link);
        echo json_encode(['status' => 'error', 'message' => 'Error al guardar Ruta: ' . $e->getMessage()]);
    }
}


header('Content-Type: application/json');

$resultado = ConsultarRutasModulo($link);

if (!$resultado) {
    echo json_encode(["error" => "Error en la consulta"]);
    exit;
}

$rutas = mysqli_fetch_all($resultado, MYSQLI_ASSOC);

// Verificar si hay datos
if (empty($rutas)) {
    echo json_encode([]); // Devolver un array vacío en lugar de una respuesta vacía
    exit;
}

echo json_encode($rutas);



function ControladorConsultarRutas($link)
{
    $resultado = ConsultarRutasModulo($link);
    
    if (!$resultado) {
        echo json_encode(['status' => 'error', 'message' => 'No se encontraron rutas']);
        return;
    }

    $rutas = [];
    while ($fila = mysqli_fetch_assoc($resultado)) {
        $rutas[] = $fila;
    }
    file_put_contents("depuracionderutas.txt", "Datos recibidos: " . print_r($rutas, true) . "\n", FILE_APPEND);

    echo json_encode($rutas);
}

function ControladorModificarRutasMonto($link,$datos)
{   

    if (!$datos || !isset($datos["nombreRuta"], $datos["fondos"])) {
        echo json_encode(['status' => 'error', 'message' => 'Datos inválidos']);
        exit;
    }
    
    // Sanitizar los datos
    $nombreRuta = htmlspecialchars($datos["nombreRuta"]);
    $montoruta = htmlspecialchars($datos["fondosRuta"]);

    // Verificar que los datos no estén vacíos
    if (empty($nombreRuta) || empty($montoruta)) {
        echo json_encode(['status' => 'error', 'message' => 'Favor complete todos los campos']);
        exit;
    }

    // Iniciar transacción
    mysqli_begin_transaction($link);
    try {
        // Llamar a la función para modificar la ruta
        ModificarRutasMontoModulo($link,$montoruta,$nombreRuta);
        // Confirmar la transacción si todo va bien
        mysqli_commit($link);
        echo json_encode(['status' => 'success', 'message' => 'Ruta Actualizada correctamente']);
    } catch (Exception $e) {
        // Revertir cambios en caso de error
        mysqli_rollback($link);
        echo json_encode(['status' => 'error', 'message' => 'Error al modificar ruta: ' . $e->getMessage()]);
    }
}

if (!$link) {
    echo json_encode(['status' => 'error', 'message' => 'Error en la conexión a la base de datos']);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] == "POST")
{
    if ($datos["accion"] == "obtenerRutas")
    {
        ControladorConsultarRutas($link);
    }elseif($datos["accion"] == "")
    {
        ControladorModificarRutasMonto($link,$datos);
    }elseif($datos["accion"] == "lectura")
    {
        ControladorGuardarRutas($datos, $link);
    }
}



?>
