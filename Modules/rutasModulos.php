<?php

function GuardarRutasModulo($link,$nombreruta,$monto)
{
    $query = "INSERT INTO rutas (NombreRuta, Monto) VALUES ('$nombreruta', '$monto')";
    mysqli_query($link,$query);
}

function ConsultarRutasModulo($link,$varios = false, $nombreruta = "")
{   
    if (!$varios)
    {
         $query = "SELECT * FROM vista_rutas";
        return mysqli_query($link,$query);
    }else
    {
        $query = "SELECT * FROM vista_rutas WHERE IDRuta = '$nombreruta'";
        return mysqli_query($link,$query);
    }
   
}

function ModificarRutasMontoModulo($link,$montocambiar,$nombreruta)
{
    $query = "SELECT  Monto FROM rutas WHERE NombreRuta = '$nombreruta'";
    $resultado = mysqli_query($link,$query);
    $total = 0;
    if (mysqli_num_rows($resultado) == 1)
    {
        $resultado = mysqli_fetch_array($resultado);
        $total = $resultado["Monto"] + $montocambiar;
    }
    $query = "UPDATE rutas SET Monto = '$total'";
}

?>