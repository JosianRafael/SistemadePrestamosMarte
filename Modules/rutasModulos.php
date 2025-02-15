<?php

// Función para guardar una nueva ruta en la base de datos
function GuardarRutasModulo($link, $nombreruta, $monto)
{
    // Prepara la consulta SQL para insertar una nueva ruta
    $query = "INSERT INTO rutas (NombreRuta, Monto) VALUES ('$nombreruta', '$monto')";
    // Ejecuta la consulta en la base de datos
    mysqli_query($link, $query);
}

// Función para consultar rutas en la base de datos
function ConsultarRutasModulo($link, $varios = false, $rutaid = "")
{   
    // Si no se solicitan múltiples rutas
    if (!$varios)
    {
        // Prepara la consulta SQL para seleccionar todas las rutas
        $query = "SELECT * FROM vista_rutas";
        // Ejecuta la consulta y devuelve el resultado
        return mysqli_query($link, $query);
    }
    // Si se solicita una ruta específica
    else
    {
        // Prepara la consulta SQL para seleccionar una ruta específica por su ID
        $query = "SELECT * FROM vista_rutas WHERE IDRuta = '$rutaid'";
        // Ejecuta la consulta y devuelve el resultado
        return mysqli_query($link, $query);
    }
}

// Función para modificar el monto de una ruta existente
function ModificarRutasMontoModulo($link, $montocambiar, $rutaid)
{
    // Consulta el monto actual de la ruta utilizando su ID
    $montoRuta = ConsultarRutasModulo($link, true, $rutaid);
    
    // Verifica si se encontró exactamente una ruta
    if (mysqli_num_rows($montoRuta) == 1)
    {
        // Obtiene los datos de la ruta
        $montoRuta = mysqli_fetch_array($montoRuta);
        // Extrae el monto actual de la ruta
        $montoRuta = $montoRuta["Monto"];
        // Calcula el nuevo total sumando el monto a cambiar
        $total = $montoRuta + $montocambiar;
        // Prepara la consulta SQL para actualizar el monto de la ruta
        $query = "UPDATE rutas SET Monto = '$total' WHERE IDRuta = '$rutaid'";
        // Ejecuta la consulta para actualizar el monto en la base de datos
        return mysqli_query($link, $query);
    }
    // Si no se encontró la ruta, devuelve false
    else
    {
        return false;
    }
}

// Función para borrar una ruta de la base de datos
function BorrarRuta($link, $idRuta)
{
    // Prepara la consulta SQL para eliminar una ruta específica por su ID
    $query = "DELETE * FROM rutas WHERE IDRuta = '$idRuta'";
    // Ejecuta la consulta para eliminar la ruta en la base de datos
    return mysqli_query($link, $query);
}

?>
