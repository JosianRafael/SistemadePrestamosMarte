<?php

function GuardarClientesModulo($link,$nombre,$apellido,$telefono,$correo,$direccion)
{
    $query = "INSERT INTO clientes (nombre, apellido,telefono,correo,direccion) VALUES ('$nombre', '$apellido','$telefono','$correo','$direccion')";
    mysqli_query($link,$query);
}

function CrearPrestamoModulo ($link,$cliente_id,$monto,$cuotas,$mensaje,$fecha_concesion,$ruta_id,$frecuenciaPago,$interesPrestamo)
{
    $query = "INSERT INTO prestamos (id_cliente, monto,cuotas,interes,mensaje,fecha_concesion,frecuencia_pago,IDRuta) VALUES 
    ('$cliente_id', '$monto','$cuotas','$interesPrestamo','$mensaje','$fecha_concesion','$frecuenciaPago','$ruta_id')";
    mysqli_query($link,$query);
}

function CrearCalendarioDePagos ($link,$id_prestamo,$montocuotas,$fechas_pago,$cuotas)
{
    for ($i=1; $i <= $cuotas; $i++) { 
        $fecha = $fechas_pago[$i-1];
        $query = "INSERT INTO calendario_pagos (id_prestamo, numero_cuota, fecha_vencimiento, monto) VALUES ('$id_prestamo','$montocuotas','$fecha','$montocuotas')";
        mysqli_query($link,$query);
    }
}

function ConsultarClientesActivos($link)
{
    $query = "SELECT * FROM vista_clientes_activos";
    return mysqli_query($link,$query);
}

function ConsultarClientesActivosconPrestamoDetalle($link)
{
    $query = "SELECT * FROM vista_clientes_activos_por_ruta";
    return mysqli_query($link,$query);
}

function ConsultarClientesPagosPendientes($link)
{
    $query = "SELECT * FROM vista_pagos_pendientes";
    return mysqli_query($link,$query);
}

function BorrarCliente($link,$cliente_id)
{
    $query = "DELETE * FROM  clientes_historico WHERE id = '$cliente_id'";
    return mysqli_query($link,$query);
}

function ConsultarClientesInactivosDetalles($link)
{
    $query = "SELECT * FROM vista_cliente_prestamo_historico";
    return mysqli_query($link,$query);
}

function ConsultarClientesInactivosCalendario($link)
{
    $query = "SELECT * FROM vista_calendario_pagos_historico";
    return mysqli_query($link,$query);
}

function PagarCuota($link,$ID_CalendarioPago,$monto)
{
    
}

?>