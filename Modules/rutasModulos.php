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

function ModificarRutasMontoModulo($link,$montocambiar,$rutaid)
{

    $montoRuta = ConsultarRutasModulo($link,true,$rutaid);
    if (mysqli_num_rows($montoRuta) == 1)
    {
        $montoRuta = mysqli_fetch_array($montoRuta);
        $montoRuta = $montoRuta["Monto"];
        $total = $montoRuta + $montocambiar;
        $query = "UPDATE rutas SET Monto = '$total' WHERE IDRuta = '$rutaid'";
        return mysqli_query($link,$query);
    }else
    {
        return false;
    }

}

function BorrarRuta ($link,$idRuta)
{
    $query = "DELETE * FROM rutas WHERE IDRuta = '$idRuta'";
    return mysqli_query($link,$query);
}

?>