<?php

function GuardarRutasModulo($link,$nombreruta,$monto)
{
    $query = "INSERT INTO rutas (NombreRuta, Monto) VALUES ('$nombreruta', '$monto')";
    mysqli_query($link,$query);
}

function ConsultarRutasModulo($link,$varios = false, $rutaid = "")
{   
    if (!$varios)
    {
         $query = "SELECT * FROM vista_rutas";
        return mysqli_query($link,$query);
    }else
    {
        $query = "SELECT * FROM vista_rutas WHERE IDRuta = '$rutaid'";
        return mysqli_query($link,$query);
    }
   
}

function ModificarRutasMontoModulo($link,$montocambiar,$nombreruta)
{
    $query = "SELECT  Monto FROM rutas WHERE IDRuta = '$nombreruta'";
    $resultado = mysqli_query($link,$query);
    $total = 0;
    if (mysqli_num_rows($resultado) == 1)
    {
        $resultado = mysqli_fetch_array($resultado);
        $total = $resultado["Monto"] + $montocambiar;
        $query = "UPDATE rutas SET Monto = '$total'";
        $resultado = mysqli_query($link,$query);
        return true;
    }else
    {
        return false;
    }
}

?>