<?php
// Configurar los encabezados de respuesta para indicar que se devuelve JSON y permitir CORS
header("Content-Type: application/json"); // Indica que la respuesta será en formato JSON
header("Access-Control-Allow-Origin: *"); // Permite solicitudes de cualquier origen
header("Access-Control-Allow-Methods: POST, GET, OPTIONS"); // Permite los métodos HTTP especificados
header("Access-Control-Allow-Headers: Content-Type"); // Permite el encabezado Content-Type

require_once("../Modules/rutasModulos.php"); // Incluir el módulo que contiene funciones relacionadas con las rutas
require_once("../Config/config.php"); // Incluir la configuración y conexión a la base de datos

date_default_timezone_set("America/Santo_Domingo"); // Establecer la zona horaria

// Leer los datos JSON enviados por el cliente
$json = file_get_contents("php://input"); // Obtener el contenido de la entrada estándar
$datos = json_decode($json, true); // Decodificar el JSON a un array asociativo

// Guardar datos recibidos en un log para depuración
file_put_contents("debug_log.txt", "Datos recibidos: " . print_r($datos, true) . "\n", FILE_APPEND); // Log para depuración

// Función para procesar los datos del cliente y guardar una nueva ruta
function ControladorGuardarRutas($datos, $link)
{
    // Validar que los datos requeridos estén presentes
    if (!$datos || !isset($datos["nombreRuta"], $datos["fondosRuta"])) {
        echo json_encode(['status' => 'error', 'message' => 'Datos inválidos']); // Enviar mensaje de error
        exit; // Finalizar la ejecución
    }
    
    // Sanitizar los datos para evitar inyección de código
    $nombre = htmlspecialchars($datos["nombreRuta"]); // Sanitizar el nombre de la ruta
    $montoruta = htmlspecialchars($datos["fondosRuta"]); // Sanitizar el monto de la ruta

    // Verificar que los datos no estén vacíos
    if (empty($nombre) || empty($montoruta)) {
        echo json_encode(['status' => 'error', 'message' => 'Favor complete todos los campos']); // Mensaje de error si faltan campos
        exit; // Finalizar la ejecución
    }

    // Iniciar una transacción en la base de datos
    mysqli_begin_transaction($link);
    try {
        // Llamar a la función que guarda la ruta en la base de datos
        GuardarRutasModulo($link, $nombre, $montoruta);
        // Confirmar la transacción si todo va bien
        mysqli_commit($link);
        echo json_encode(['status' => 'success', 'message' => 'Ruta guardada correctamente']); // Mensaje de éxito
    } catch (Exception $e) {
        // Revertir cambios en caso de error
        mysqli_rollback($link);
        echo json_encode(['status' => 'error', 'message' => 'Error al guardar Ruta: ' . $e->getMessage()]); // Mensaje de error con detalles
    }
}

// Función para consultar las rutas guardadas
function ControladorConsultarRutas($link)
{
    // Llamar a la función que consulta las rutas en la base de datos
    $resultado = ConsultarRutasModulo($link);
    
    // Verificar si se encontraron resultados
    if (!$resultado) {
        echo json_encode(['status' => 'error', 'message' => 'No se encontraron rutas']); // Mensaje de error si no hay rutas
        return; // Finalizar la ejecución
    }

    $rutas = []; // Array para almacenar las rutas
    // Recorrer los resultados y almacenar cada fila en el array
    while ($fila = mysqli_fetch_assoc($resultado)) {
        $rutas[] = $fila; // Agregar fila al array de rutas
    }
    // Guardar datos recibidos en un log para depuración
    file_put_contents("depuracionderutas.txt", "Datos recibidos: " . print_r($rutas, true) . "\n", FILE_APPEND); // Log para depuración

    echo json_encode($rutas); // Enviar las rutas como respuesta en formato JSON
}

// Función para modificar el monto de una ruta existente
function ControladorModificarRutasMonto($link, $datos)
{   
    // Validar que los datos requeridos estén presentes
    if (!$datos || !isset($datos["IDRuta"], $datos["fondosRuta"])) {
        echo json_encode(['status' => 'error', 'message' => 'Datos inválidos']); // Mensaje de error
        exit; // Finalizar la ejecución
    }
    
    // Sanitizar los datos
    $nombreRuta = htmlspecialchars($datos["IDRuta"]); // Sanitizar el ID de la ruta
    $montoruta = htmlspecialchars($datos["fondosRuta"]); // Sanitizar el monto de la ruta

    // Verificar que los datos no estén vacíos
    if (empty($nombreRuta) || empty($montoruta)) {
        echo json_encode(['status' => 'error', 'message' => 'Favor complete todos los campos']); // Mensaje de error
        exit; // Finalizar la ejecución
    }

    // Iniciar una transacción
    mysqli_begin_transaction($link);
    try {
        // Llamar a la función para modificar el monto de la ruta
        $resultado = ModificarRutasMontoModulo($link, $montoruta, $nombreRuta);
        if ($resultado) {
            // Confirmar la transacción si todo va bien
            mysqli_commit($link);
            echo json_encode(['status' => 'success', 'message' => 'Ruta Actualizada correctamente']); // Mensaje de éxito
        } else {
            // Lanzar una excepción si la modificación falla
            throw new Exception('No se pudo actualizar la ruta.'); // Lanzar error
        }

    } catch (Exception $e) {
        // Revertir cambios en caso de error
        mysqli_rollback($link);
        echo json_encode(['status' => 'error', 'message' => 'Error al modificar ruta: ' . $e->getMessage()]); // Mensaje de error con detalles
    }
}

// Función para borrar una ruta existente
function BorrarRutaControlador($link, $datos)
{
    // Validar que los datos requeridos estén presentes
    if (!$datos || !isset($datos["IDRuta"])) {
        echo json_encode(['status' => 'error', 'message' => 'Dato inválido']); // Mensaje de error
        exit; // Finalizar la ejecución
    }

    $idRuta = htmlspecialchars($datos["IDRuta"]); // Sanitizar el ID de la ruta

    // Verificar que los datos no estén vacíos
    if (empty($idRuta)) {
        echo json_encode(['status' => 'error', 'message' => 'El campo id Ruta esta vacio']); // Mensaje de error si el ID está vacío
        exit; // Finalizar la ejecución
    }

    // Iniciar una transacción
    mysqli_begin_transaction($link);
    try {
        // Llamar a la función para borrar la ruta
        $resultado = BorrarRuta($link, $idRuta);
        if ($resultado) {
            // Confirmar la transacción si todo va bien
            mysqli_commit($link);
            echo json_encode(['status' => 'success', 'message' => 'Ruta borrada correctamente']); // Mensaje de éxito
        } else {
            // Lanzar una excepción si la modificación falla
            throw new Exception('No se pudo borrar la ruta.'); // Lanzar error
        }

    } catch (Exception $e) {
        // Revertir cambios en caso de error
        mysqli_rollback($link);
        echo json_encode(['status' => 'error', 'message' => 'Error al borrar ruta: ' . $e->getMessage()]); // Mensaje de error con detalles
    }
}

// Verificar la conexión a la base de datos
if (!$link) {
    echo json_encode(['status' => 'error', 'message' => 'Error en la conexión a la base de datos']); // Mensaje de error si no hay conexión
    exit; // Finalizar la ejecución
}

// Procesar la solicitud según el método HTTP y la acción especificada en los datos
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Verificar qué acción se debe ejecutar
    if ($datos["accion"] == "obtenerRutas") {
        ControladorConsultarRutas($link); // Llamar a la función para consultar rutas
    } elseif ($datos["accion"] == "modificar") {
        ControladorModificarRutasMonto($link, $datos); // Llamar a la función para modificar rutas
    } elseif ($datos["accion"] == "guardar") {
        ControladorGuardarRutas($datos, $link); // Llamar a la función para guardar rutas
    } elseif ($datos["accion"] == "borrar") {
        BorrarRutaControlador($link, $datos); // Llamar a la función para borrar rutas
    }
}

?>
