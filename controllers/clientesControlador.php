<?php
header("Content-Type: application/json"); // Indica que la respuesta será JSON
require_once("../Modules/clientesModulos.php");
require_once("../Modules/rutasModulos.php");
require_once("../Config/config.php"); // Asegúrate de incluir la conexión a la base de datos

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
                          $datos["direccion"], $datos["fechaPrestamo"], $datos["monto"],$datos["cuotas"],
                          $datos["montoPorCuota"], $datos["fechasPago"], $datos["mensaje"],$datos["ruta"]
                          ,$datos["interesMora"],$datos["frecuenciaCobro"],$datos["InteresPrestamo"],$datos["TipoInteres"])) {
        echo json_encode(['status' => 'error', 'message' => 'Datos inválidos']);
        exit;
    }
    
    // Sanitizar los datos
    $nombre = htmlspecialchars($datos["nombre"]);
    $apellido = htmlspecialchars($datos["apellido"]);
    $numero = htmlspecialchars($datos["numero"]);
    $email = htmlspecialchars($datos["correo"]);
    $direccion = htmlspecialchars($datos["direccion"]);
    $fechaprestamo = htmlspecialchars($datos["fechaPrestamo"]);
    $monto = htmlspecialchars($datos["monto"]);
    $cuotas = htmlspecialchars($datos["cuotas"]);
    $montoPorCuota = htmlspecialchars($datos["montoPorCuota"]);
    $fechasPago = $datos["fechasPago"];
    $mensaje = htmlspecialchars($datos["mensaje"]);
    $ruta = htmlspecialchars($datos["ruta"]);
    $interesMora = htmlspecialchars($datos["interesMora"]);
    $frecuenciaCobro = htmlspecialchars($datos["frecuenciaCobro"]);
    $interesPrestamo = htmlspecialchars($datos["InteresPrestamo"]);
    $tipoInteres = htmlspecialchars($datos["TipoInteres"]);
    // Verificar que los datos no estén vacíos
    if (empty($nombre) || empty($apellido) || empty($numero) || empty($direccion) ||
        empty($fechaprestamo) || empty($monto) || empty($cuotas) || empty($montoPorCuota) 
        || empty($fechasPago) || empty($mensaje) || empty($ruta) || empty($interesMora)
        ||empty($frecuenciaCobro) || empty($fechaprestamo) ||empty($tipoInteres)) {
        echo json_encode(['status' => 'error', 'message' => 'Favor complete todos los campos']);
        exit;
    }

    // Iniciar transacción
    mysqli_begin_transaction($link);
    try {
        // Llamar a la función para guardar el cliente
        GuardarClientesModulo($link, $nombre, $apellido, $numero, $email, $direccion);

        $cliente_id = mysqli_insert_id($link);

        $resultado = ConsultarRutasModulo($link,true,$ruta);
        $datos_ruta = mysqli_fetch_array($resultado);
        $ID_de_la_ruta = $datos_ruta["IDRuta"];
        $fondos_disponibles = $datos_ruta["Monto"];

        if ($fondos_disponibles < $monto)
        {
            // No hay fondos suficientes
            echo json_encode(['status' => 'error', 'message' => 'No hay fondos suficientes para otorgar el préstamo']);
            mysqli_rollback($link);
        }else
        {
            //Crear el prestamo
            CrearPrestamoModulo($link,$cliente_id,$monto,$cuotas,$mensaje,$fechaprestamo,
            $ID_de_la_ruta,$interesMora,$frecuenciaCobro,$interesPrestamo,$tipoInteres);
            
            $prestamo_id = mysqli_insert_id($link);
            $monto_negativo = -1 * $monto;
            
            //Modificar el monto de la ruta
            $confirmando_cambio = ModificarRutasMontoModulo($link,$monto_negativo,$ruta);

            if (!$confirmando_cambio)
            {
                //No se pudo modificar los fondos
                echo json_encode(['status' => 'error', 'message' => 'No se pudo modificar el saldo de la ruta']);
                mysqli_rollback($link);
            }

            //Crear el calendario de pagos
            CrearCalendarioDePagos($link,$prestamo_id,$montoPorCuota,$fechasPago,$cuotas);
            
            // Confirmar la transacción si todo va bien
            mysqli_commit($link);
            echo json_encode(['status' => 'success', 'message' => 'Cliente guardado correctamente']);
        }
    } catch (Exception $e) {
        // Revertir cambios en caso de error
        mysqli_rollback($link);
        echo json_encode(['status' => 'error', 'message' => 'Error al guardar cliente: ' . $e->getMessage()]);
    }
}

function EnviarResultadosClientesActivos($link)
{   
    $resultado = ConsultarClientesActivos($link);

    if (!$resultado) {
        echo json_encode(['status' => 'error', 'message' => 'No se encontraron clientes activos']);
        return;
    }

    $contenido = [];
    while ($fila = mysqli_fetch_assoc($resultado)) {
        $contenido[] = $fila;
    }
    file_put_contents("depuracionenviandodatosclientes.txt", "Datos enviados: " . print_r($contenido, true) . "\n", FILE_APPEND);

    echo json_encode($contenido);
}

function EnviarResultadosClientesActivosPrestamosDetalle($link)
{   
    $resultado = ConsultarClientesActivosconPrestamoDetalle($link);

    if (!$resultado) {
        echo json_encode(['status' => 'error', 'message' => 'No se encontraron clientes activos']);
        return;
    }

    $contenido = [];
    while ($fila = mysqli_fetch_assoc($resultado)) {
        $contenido[] = $fila;
    }
    file_put_contents("depuracionenviandodatosclientes.txt", "Datos enviados: " . print_r($contenido, true) . "\n", FILE_APPEND);
    echo json_encode($contenido);
}

function EnviarResultadosClientesPagosPendientes($link)
{   
    $resultado = ConsultarClientesPagosPendientes($link);
    if (!$resultado) {
        echo json_encode(['status' => 'error', 'message' => 'No se encontraron clientes con pagos pendientes']);
        return;
    }

    $contenido = [];
    while ($fila = mysqli_fetch_assoc($resultado)) {
        $contenido[] = $fila;
    }
    file_put_contents("depuracionenviandodatosclientes.txt", "Datos enviados: " . print_r($contenido, true) . "\n", FILE_APPEND);
    echo json_encode($contenido);
}

function EnviarClientesInactivosDetalles($link)
{
    $resultado = ConsultarClientesInactivosDetalles($link);
    if (!$resultado) {
        echo json_encode(['status' => 'error', 'message' => 'No se encontraron clientes inactivos']);
        return;
    }

    $contenido = [];
    while ($fila = mysqli_fetch_assoc($resultado)) {
        $contenido[] = $fila;
    }
    file_put_contents("depuracionenviandodatosclientes.txt", "Datos enviados clietnes inactivos: " . print_r($contenido, true) . "\n", FILE_APPEND);
    echo json_encode($contenido);
}

function EnviarClientesInactivosCalendarioPagos($link)
{
    $resultado = ConsultarClientesInactivosCalendario($link);
    if (!$resultado) {
        echo json_encode(['status' => 'error', 'message' => 'No se encontraron calendarios inactivos']);
        return;
    }

    $contenido = [];
    while ($fila = mysqli_fetch_assoc($resultado)) {
        $contenido[] = $fila;
    }
    file_put_contents("depuracionenviandodatosclientes.txt", "Datos enviados calendario clientes inactivos: " . print_r($contenido, true) . "\n", FILE_APPEND);
    echo json_encode($contenido);
}

function BorrarClientesInactivos($link,$datos)
{
    mysqli_begin_transaction($link);

    try
    {
        if (empty($datos["id"]))
        {
            echo json_encode(['status' => 'error', 'message' => 'Variable id vacia']);
            exit;
        }

        $cliente_id = $datos["id"];
        BorrarCliente($link,$cliente_id);
        mysqli_commit($link);
        echo json_encode(['status' => 'success', 'message' => 'Cliente borrado correctamente']);
    }
    catch(Exception $e)
    {
        mysqli_rollback($link);
        echo json_encode(['status' => 'error', 'message' => 'Error al borrar cliente: ' . $e->getMessage()]);
    }
}


if (!$link) {
    echo json_encode(['status' => 'error', 'message' => 'Error en la conexión a la base de datos']);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] == "POST")
{
    switch ($datos["accion"]) {
        case 'guardar':
            ControladorGuardarClientes($datos, $link);
            break;
        
        case 'leerclienteactivo';
            EnviarResultadosClientesActivos($link);
            break;
        case 'leerclientedetalle';
            EnviarResultadosClientesActivosPrestamosDetalle($link);
            break;
        case 'leerclientepagospendiente';
            EnviarResultadosClientesActivosPrestamosDetalle($link);
            break;
        case 'leerclientesinactivosdetalles';
            EnviarClientesInactivosDetalles($link);
            break;
        case 'leerclienteinactivocalendariopago';
            EnviarClientesInactivosCalendarioPagos($link);
            break;
        default:
            echo json_encode(['status' => 'error', 'message' => 'Error en la clave accion']);
            break;
    }
}

?>
