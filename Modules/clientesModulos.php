<?php

function GuardarClientesModulo($link,$nombre,$apellido,$telefono,$correo,$direccion)
{
    $query = "INSERT INTO clientes (nombre, apellido,telefono,correo,direccion) VALUES ('$nombre', '$apellido','$telefono','$correo','$direccion')";
    mysqli_query($link,$query);
}

function CrearPrestamoModulo ($link,$cliente_id,$monto,$cuotas,$mensaje,$fecha_concesion,$ruta_id)
{
    $query = "INSERT INTO prestamos (id_cliente, monto,cuotas,mensaje,fecha_concesion,IDRuta) VALUES ('$cliente_id', '$monto','$cuotas','$mensaje','$fecha_concesion','$ruta_id')";
    mysqli_query($link,$query);
}

function CrearCalendarioDePagos ($link,$id_prestamo,$montocuotas,$fechas_pago,$cuotas)
{
    for ($i=1; $i < $cuotas; $i++) { 
        $fecha = $fechas_pago[$i-1];
        $query = "INSERT INTO calendario_pagos (id_prestamo, numero_cuota, fecha_vencimiento, monto) VALUES ('$id_prestamo','$montocuotas','$fecha','$montocuotas')";
        mysqli_query($link,$query);
    }
}

?>