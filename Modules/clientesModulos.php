<?php
// Función para guardar un nuevo cliente en la base de datos
function GuardarClientesModulo($link, $nombre, $apellido, $telefono, $correo, $direccion)
{
    // Prepara la consulta SQL para insertar un nuevo cliente
    $query = "INSERT INTO clientes (nombre, apellido, telefono, correo, direccion) VALUES ('$nombre', '$apellido', '$telefono', '$correo', '$direccion')";
    // Ejecuta la consulta en la base de datos
    mysqli_query($link, $query);
}

// Función para crear un nuevo préstamo en la base de datos
function CrearPrestamoModulo($link, $cliente_id, $monto, $cuotas, $mensaje, $fecha_concesion, $ruta_id, $frecuenciaPago, $interesPrestamo)
{
    // Prepara la consulta SQL para insertar un nuevo préstamo
    $query = "INSERT INTO prestamos (id_cliente, monto, cuotas, interes, mensaje, fecha_concesion, frecuencia_pago, IDRuta) VALUES 
    ('$cliente_id', '$monto', '$cuotas', '$interesPrestamo', '$mensaje', '$fecha_concesion', '$frecuenciaPago', '$ruta_id')";
    // Ejecuta la consulta en la base de datos
    mysqli_query($link, $query);
}

// Función para crear un calendario de pagos para un préstamo
function CrearCalendarioDePagos($link, $id_prestamo, $montocuotas, $fechas_pago, $cuotas)
{
    // Itera sobre el número de cuotas para crear entradas en el calendario de pagos
    for ($i = 1; $i <= $cuotas; $i++) { 
        // Obtiene la fecha de pago correspondiente a la cuota actual
        $fecha = $fechas_pago[$i - 1];
        // Prepara la consulta SQL para insertar una entrada en el calendario de pagos
        $query = "INSERT INTO calendario_pagos (id_prestamo, numero_cuota, fecha_vencimiento, monto) VALUES ('$id_prestamo', '$montocuotas', '$fecha', '$montocuotas')";
        // Ejecuta la consulta en la base de datos
        mysqli_query($link, $query);
    }
}

// Función para consultar clientes activos en la base de datos
function ConsultarClientesActivos($link)
{
    // Prepara la consulta SQL para seleccionar todos los clientes activos
    $query = "SELECT * FROM vista_clientes_activos";
    // Ejecuta la consulta y devuelve el resultado
    return mysqli_query($link, $query);
}

// Función para consultar clientes activos con detalles de sus préstamos
function ConsultarClientesActivosconPrestamoDetalle($link)
{
    // Prepara la consulta SQL para seleccionar clientes activos y sus detalles de préstamos
    $query = "SELECT * FROM vista_clientes_activos_por_ruta";
    // Ejecuta la consulta y devuelve el resultado
    return mysqli_query($link, $query);
}

// Función para consultar clientes con pagos pendientes
function ConsultarClientesPagosPendientes($link)
{
    // Prepara la consulta SQL para seleccionar clientes con pagos pendientes
    $query = "SELECT * FROM vista_pagos_pendientes";
    // Ejecuta la consulta y devuelve el resultado
    return mysqli_query($link, $query);
}

// Función para borrar un cliente del histórico
function BorrarCliente($link, $cliente_id)
{
    // Prepara la consulta SQL para eliminar un cliente del histórico usando su ID
    $query = "DELETE * FROM clientes_historico WHERE id = '$cliente_id'";
    // Ejecuta la consulta para eliminar el cliente en la base de datos
    return mysqli_query($link, $query);
}

// Función para consultar detalles de clientes inactivos
function ConsultarClientesInactivosDetalles($link)
{
    // Prepara la consulta SQL para seleccionar detalles de clientes inactivos
    $query = "SELECT * FROM vista_cliente_prestamo_historico";
    // Ejecuta la consulta y devuelve el resultado
    return mysqli_query($link, $query);
}

// Función para consultar el calendario de pagos de clientes inactivos
function ConsultarClientesInactivosCalendario($link)
{
    // Prepara la consulta SQL para seleccionar el calendario de pagos de clientes inactivos
    $query = "SELECT * FROM vista_calendario_pagos_historico";
    // Ejecuta la consulta y devuelve el resultado
    return mysqli_query($link, $query);
}

// Función para consultar clientes con pagos atrasados
function ConsultarClientespagosatrasados($link)
{
    // Prepara la consulta SQL para seleccionar clientes con pagos atrasados
    $query = "SELECT * FROM clientes_pagos_atrasados";
    // Ejecuta la consulta y devuelve el resultado
    return mysqli_query($link, $query);
}

// Función para consultar análisis de riesgo de clientes
function ConsultarAnalisisRiesgo($link)
{
    // Prepara la consulta SQL para seleccionar análisis de riesgo
    $query = "SELECT * FROM vista_analisis_riesgo";
    // Ejecuta la consulta y devuelve el resultado
    return mysqli_query($link, $query);
}

// Función para procesar el pago de una cuota (sin implementar)
function ActualizarCuota($link, $ID_CalendarioPago,$valor)
{
    $query = "UPDATE calendario_pagos SET estado = '$valor' WHERE id = '$ID_CalendarioPago'";
    return mysqli_query($link,$query);
}

function ConsultarTodoslosPagos($link)
{
    $query = "SELECT * FROM consultar_calendario_pagos";
    return mysqli_query($link,$query);
}

function ConsultarHistorialClientes($link)
{
    $query = "SELECT * FROM vista_clientes_historial";
    return mysqli_query($link,$query);
}

function Dashboarddatos($link)
{
    $query = "SELECT * FROM totales_dashboard";
    return mysqli_query($link,$query);
}

function BorrarClienteprestamoycalendariopagos($link,$idcliente)
{
    $query = "DELETE FROM clientes WHERE id = '$idcliente'";
    return mysqli_query($link,$query);
}

?>
