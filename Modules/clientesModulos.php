<?php
require_once("../Config/config.php");


function GuardarClientesModulo($link,$nombre,$apellido,$telefono,$correo,$direccion,$rutaID)
{
    $query = "INSERT INTO clientes (nombre, apellido,telefono,correo,direccion,ruta_ID) VALUES ('$nombre', '$apellido','$telefono','$correo','$direccion','$rutaID')";
    mysqli_query($link,$query);
}

function CrearPrestamoModulo($link,$idCliente,$monto,$cuotas,$mensaje,$fechaconcesion)
{
    
}

?>