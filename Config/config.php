<?php

//Creando cadena de conexión.
define("DB_HOST", "localhost");
define("DB_USER", "root");
define("DB_PASSWORD", "");
define("DB_NAME", "empresa_prestamos");

$link = mysqli_connect(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);

?>