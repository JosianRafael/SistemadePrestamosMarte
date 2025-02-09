<?php

function GuardarClientesModulo($link,$nombre,$apellido,$telefono,$correo,$direccion,$rutaID)
{
    $query = "INSERT INTO clientes (nombre, apellido,telefono,correo,direccion,ruta_ID) VALUES ('$nombre', '$apellido','$telefono','$correo','$direccion','$rutaID')";
    mysqli_query($link,$query);
}

function CrearPrestamoModulo ($link,$cliente_id,$monto,$cuotas,$mensaje,$fecha_concesion)
{
    $query = "INSERT INTO prestamos (id_cliente, monto,cuotas,mensaje,fecha_concesion) VALUES ('$cliente_id', '$monto','$cuotas','$mensaje','$fecha_concesion')";
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