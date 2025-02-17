<?php
session_start();

if (!isset($_SESSION["session"]))
{
    header("Location: index.php");
    exit();
}

?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inversiones P&P Marte</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: black;
            color: white;
            font-size: 0.9rem;
        }
        .bg-card {
            background-color: rgba(255, 255, 255, 0.05);
        }
        .action-button {
            @apply bg-blue-500 text-white p-1 rounded hover:bg-blue-600 text-xs;
            width: 80px;
            height: 28px;
        }
    </style>
</head>
<body class="min-h-screen">
    <nav style="border-bottom: 1px solid white;" class="flex justify-between items-center p-4 bg-gray-900 text-white dark:text-black">
        <div class="flex items-center space-x-2">
            <span style="color: white;" class="text-2xl font-bold">💰 Inversiones P&P Marte</span>
        </div>
        <div class="flex items-center space-x-6">
            <span style="color: white;" class="text-sm">Bienvenido Sr armando, haz ingresado como admin</span>
            <img style="width: 50px;" src="https://static.vecteezy.com/system/resources/previews/010/158/758/non_2x/dollar-money-icon-sign-symbol-design-free-png.png" id="darkModeToggle" class="p-2">
                
        </img>
        </div>
    </nav>
    <div class="grid lg:grid-cols-[280px_1fr]">
        <aside class="border-r bg-gray-900 backdrop-blur shadow-lg">
            <div class="flex h-16 items-center gap-2 border-b px-6 bg-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>
                <span class="font-bold text-white">Sistema de Préstamos</span>
            </div>
            <nav class="space-y-2 px-2 py-3">
                <button class="w-full text-left p-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded transition-all" onclick="showSection('dashboard')">Dashboard</button>
                <button class="w-full text-left p-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded transition-all" onclick="showSection('registro')">Registro de Clientes</button>
                <button class="w-full text-left p-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded transition-all" onclick="showSection('prestamos-terminados')">Préstamos Terminados</button>
                <button class="w-full text-left p-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded transition-all" onclick="showSection('recordatorios-pago')">Agenda de Notas</button>
                <button class="w-full text-left p-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded transition-all" onclick="showSection('historial-prestamos')">Historial de Préstamos</button>
                <button class="w-full text-left p-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded transition-all" onclick="showSection('analisis-riesgo')">Análisis de Riesgo</button>
                <button class="w-full text-left p-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded transition-all" onclick="showSection('prestamos-calculadora')">EMI Calculadora</button>
            </nav>
        </aside>

        <div id="prestamos-calculadora" class="section hidden max-w-6xl mx-auto p-6 bg-gray-900 text-white">
            <h2 class="text-3xl font-bold mb-8 text-center text-blue-400">Calculadora de Préstamos</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <!-- Formulario de la calculadora -->
                <div class="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h3 class="text-2xl font-semibold mb-4 text-blue-300">Detalles del Préstamo</h3>
                    <form id="calculadoraPrestamosForm" class="space-y-4">
                        <div class="flex flex-col">
                            <label for="montoPrestamo" class="text-sm font-medium text-gray-300 mb-1">Monto del préstamo</label>
                            <input type="number" id="montoPrestamo" placeholder="Ej: 10000" class="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50" required>
                        </div>
                        <div class="flex flex-col">
                            <label for="tasaInteres" class="text-sm font-medium text-gray-300 mb-1">Tasa de interés (%)</label>
                            <input type="number" id="tasaInteres" placeholder="Ej: 5" class="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50" required>
                        </div>
                        <div class="flex flex-col">
                            <label for="tipoTasa" class="text-sm font-medium text-gray-300 mb-1">Tipo de tasa</label>
                            <select id="tipoTasa" class="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50" required>
                                <option value="anual">Anual</option>
                                <option value="mensual">Mensual</option>
                                <option value="diaria">Diaria</option>
                            </select>
                        </div>
                        <div class="flex flex-col">
                            <label for="plazoPrestamo" class="text-sm font-medium text-gray-300 mb-1">Plazo (meses)</label>
                            <input type="number" id="plazoPrestamo" placeholder="Ej: 12" class="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50" required>
                        </div>
                        <div class="flex flex-col">
                            <label for="frecuenciaPago" class="text-sm font-medium text-gray-300 mb-1">Frecuencia de pago</label>
                            <select id="frecuenciaPago" class="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50" required>
                                <option value="mensual">Mensual</option>
                                <option value="quincenal">Quincenal</option>
                                <option value="semanal">Semanal</option>
                            </select>
                        </div>
                        <div class="flex flex-col">
                            <label for="tipoInteres" class="text-sm font-medium text-gray-300 mb-1">Tipo de interés</label>
                            <select id="tipoInteres" class="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50" required>
                                <option value="fijo">Fijo</option>
                                <option value="variable">Variable</option>
                            </select>
                        </div>
                        <div class="flex flex-col">
                            <label for="cuotaInicial" class="text-sm font-medium text-gray-300 mb-1">Cuota inicial (opcional)</label>
                            <input type="number" id="cuotaInicial" placeholder="Ej: 1000" class="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                        </div>
                        <button type="submit" class="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105">Calcular</button>
                    </form>
                </div>
                
                <!-- Resultados de la calculadora -->
                <div id="resultadosCalculadora" class="bg-gray-800 p-6 rounded-lg shadow-lg hidden">
                    <h3 class="text-2xl font-semibold mb-4 text-blue-300">Resultados del Préstamo</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="bg-gray-700 p-4 rounded-lg">
                            <p class="text-lg font-medium text-gray-300">Monto total a pagar</p>
                            <p class="text-3xl font-bold text-green-400" id="montoTotal"></p>
                        </div>
                        <div class="bg-gray-700 p-4 rounded-lg">
                            <p class="text-lg font-medium text-gray-300">Cuota periódica</p>
                            <p class="text-3xl font-bold text-blue-400" id="cuotaPeriodica"></p>
                        </div>
                        <div class="bg-gray-700 p-4 rounded-lg">
                            <p class="text-lg font-medium text-gray-300">Intereses totales</p>
                            <p class="text-3xl font-bold text-yellow-400" id="interesesTotales"></p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Tabla de amortización -->
            <div id="tablaAmortizacion" class="mt-8 bg-gray-800 p-6 rounded-lg shadow-lg hidden">
                <h3 class="text-2xl font-semibold mb-4 text-blue-300">Tabla de Amortización</h3>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm text-left text-gray-300">
                        <thead class="text-xs uppercase bg-gray-700 text-gray-400">
                            <tr>
                                <th class="px-6 py-3">Nº Pago</th>
                                <th class="px-6 py-3">Cuota</th>
                                <th class="px-6 py-3">Capital</th>
                                <th class="px-6 py-3">Interés</th>
                                <th class="px-6 py-3">Saldo Pendiente</th>
                            </tr>
                        </thead>
                        <tbody id="tablaAmortizacionBody"></tbody>
                    </table>
                </div>
            </div>
            
            <!-- Gráficos -->
            <div id="graficos" class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 hidden">
                <div class="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h3 class="text-2xl font-semibold mb-4 text-blue-300">Distribución del Préstamo</h3>
                    <canvas id="graficoDistribucion"></canvas>
                </div>
                <div class="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h3 class="text-2xl font-semibold mb-4 text-blue-300">Evolución del Saldo Pendiente</h3>
                    <canvas id="graficoAmortizacion"></canvas>
                </div>
            </div>
            
            <!-- Opciones adicionales -->
            <div class="mt-8 bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 class="text-2xl font-semibold mb-4 text-blue-300">Opciones Adicionales</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="flex flex-col">
                        <label for="pagoAnticipado" class="text-sm font-medium text-gray-300 mb-1">Pago anticipado</label>
                        <div class="flex">
                            <input type="number" id="pagoAnticipado" placeholder="Monto" class="flex-grow p-2 rounded-l bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                            <button id="calcularPagoAnticipado" class="bg-green-600 text-white px-4 py-2 rounded-r font-semibold hover:bg-green-700 transition duration-300 ease-in-out">Calcular</button>
                        </div>
                    </div>
                    <div class="flex flex-col">
                        <label for="diasAtraso" class="text-sm font-medium text-gray-300 mb-1">Días de atraso</label>
                        <div class="flex">
                            <input type="number" id="diasAtraso" placeholder="Días" class="flex-grow p-2 rounded-l bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                            <button id="calcularMora" class="bg-yellow-600 text-white px-4 py-2 rounded-r font-semibold hover:bg-yellow-700 transition duration-300 ease-in-out">Calcular Mora</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        
        
        <main class="p-6">
            <div id="dashboard" class="section">
                <div class="mb-6 flex items-center justify-between">
                    <div class="space-y-1">
                        <h1 class="text-2xl font-bold">Dashboard</h1>
                        <div class="text-sm text-gray-400" id="currentDate"></div>
                    </div>
                </div>
                <div class="grid gap-4 md:grid-cols-3">
                    <div class="bg-card p-4 rounded">
                        <h3 class="text-sm text-gray-400">Total Préstamos</h3>
                        <p class="text-2xl font-bold" id="totalPrestamos">$0</p>
                    </div>
                    <div class="bg-card p-4 rounded">
                        <h3 class="text-sm text-gray-400">Clientes Activos</h3>
                        <p class="text-2xl font-bold" id="clientesActivos">0</p>
                    </div>
                    <div class="bg-card p-4 rounded">
                        <h3 class="text-sm text-gray-400">Préstamos Pendientes</h3>
                        <p class="text-2xl font-bold" id="prestamosPendientes">0</p>
                    </div>
                    <div class="bg-card p-4 rounded">
                        <h3 class="text-sm text-gray-400">Total de Rutas</h3> <!-- Título para total de rutas -->
                        <p class="text-2xl font-bold" id="totalRutas">0</p> <!-- Usando el nuevo ID totalRutas -->
                    </div>
                    <div class="bg-card p-4 rounded">
                        <h3 class="text-xs text-gray-400">Ruta Más Popular</h3>
                        <p class="text-xl font-bold" id="rutaMasPopular">Ruta: X (N° Clientes: 0)</p>
                    </div>
                    <div class="bg-card p-4 rounded">
                        <h3 class="text-sm text-gray-400">Préstamos Vencidos</h3>
                        <p class="text-2xl font-bold" id="prestamosVencidos">0</p>
                    </div>
                    
                    
                    
                </div>
                <div class="grid gap-4 md:grid-cols-2 mt-6">
                    <div class="bg-card p-4 rounded">
                        <canvas id="prestamosChart"></canvas>
                    </div>
                    <div class="bg-card p-4 rounded">
                        <canvas id="clientesChart"></canvas>
                    </div>
                </div>
            </div>

            <div id="registro" class="section hidden">
                <h2 class="text-2xl font-bold mb-4 mt-6">Crear Rutas</h2>
                

                <h3 class="text-xl font-bold mt-4">Lista de Rutas</h3>
    <ul id="listaRutas" class="mt-2 bg-gray-700 p-4 rounded"></ul>


    <div id="editRouteModal" style="display: none;">
        <h2>Editar Ruta</h2>
        <form id="editRouteForm">
            <input type="hidden" id="editClientId" />
            <label for="editRuta">Ruta:</label>
            <input type="text" id="editRuta" required />
            <button type="submit">Guardar Cambios</button>
            <button type="button" onclick="closeEditModal()">Cancelar</button>
        </form>
    </div>
    
    
    <form id="routeForm" class="bg-card p-6 rounded-lg shadow-md space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input type="text" id="nombreRuta" placeholder="Nombre de la ruta"
            class="w-full p-3 bg-gray-800 text-white rounded-lg focus:ring focus:ring-blue-500" required>
        <input type="number" id="fondosRuta" placeholder="Fondos de la ruta"
            class="w-full p-3 bg-gray-800 text-white rounded-lg focus:ring focus:ring-blue-500" required>
    </div>

    <div class="flex flex-wrap gap-2 justify-center">
        <button type="submit" class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition">
            Crear Ruta
        </button>
    </div>
</form>
    <h2 class="text-2xl font-bold mb-4">Registro de Clientes</h2>

    <form id="clientForm" class="bg-card p-4 rounded space-y-4">
        <input type="text" id="nombre" placeholder="Nombre" class="w-full p-2 bg-gray-800 rounded" required>
        <input type="text" id="apellido" placeholder="Apellido" class="w-full p-2 bg-gray-800 rounded" required>
        <input type="number" id="numero" placeholder="Número de teléfono. Ej: 8095730808" class="w-full p-2 bg-gray-800 rounded" required>
        <input type="email" id="correo" placeholder="Correo electrónico (opcional)" class="w-full p-2 bg-gray-800 rounded">
        <input type="text" id="direccion" placeholder="Dirección, donde vive ?" class="w-full p-2 bg-gray-800 rounded" required>
        <input type="number" id="monto" placeholder="Monto del préstamo" class="w-full p-2 bg-gray-800 rounded" required>
        <input type="number" id="cuotas" placeholder="Número de cuotas (máx. 12)" class="w-full p-2 bg-gray-800 rounded" required min="1" max="12">
    
        <!-- Nuevo campo: Interés por mora -->
        <input type="number" id="interesMora" placeholder="Interés de prestamos (%)" class="w-full p-2 bg-gray-800 rounded" required min="0">
    
        <!-- Nuevo campo: Frecuencia de cobro -->
        <select id="frecuenciaCobro" class="w-full p-2 bg-gray-800 rounded" required>
            <option value="" disabled selected>Selecciona la frecuencia de cobro</option>
            <option value="diario">Diario</option>
            <option value="semanal">Semanal</option>
            <option value="quincenal">Quincenal</option>
            <option value="mensual">Mensual</option>
        </select>
    
        <select id="ruta" class="w-full p-2 bg-gray-800 rounded" required>
            <option value="" disabled selected>Selecciona una ruta</option>
            <option value="">Selecciona una ruta</option>
        </select>
    
        <textarea id="mensaje" placeholder="Mensaje" class="w-full p-2 bg-gray-800 rounded" required></textarea>
        <button type="submit" class="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">Registrar Cliente</button>
    </form>
    
                
            </div>
            
        
            <div id="prestamos" class="section hidden">
                <h2 class="text-2xl font-bold mb-4">Préstamos Activos</h2>
                <input type="text" id="filterInput" placeholder="Filtrar por nombre" class="mb-4 p-2 border border-white bg-black text-white">
                <div class="bg-card p-4 rounded overflow-x-auto">
                    <table class="w-full">
                        <thead>
                            <tr class="text-left">
                                <th class="p-2">Nombre</th>
                                <th class="p-2">Apellido</th>
                                <th class="p-2">Telefono</th>
                                <th class="p-2">Ruta pertenece</th>
                                <th class="p-2">Monto prestamo</th>
                                <th class="p-2">Cuotas</th>
                                <th class="p-2">Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="clientTable"></tbody>
                    </table>
                    
                    
                    

                </div>
                <br>
                        <br>
                        <br>
                        <br>
                <!-- Contenedor centrado para la segunda tabla -->
<!-- Contenedor para la tabla de préstamos activos -->
<table id="clientTable" class="w-full border-collapse">
    <!-- El cuerpo de la tabla se llenará dinámicamente -->
</table>

<!-- Contenedor para las tablas reducidas divididas por rutas -->
<div id="clientTableReducedContainer"></div>


            </div>

            
            <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
            
        
            <div id="prestamos-terminados" class="section hidden">
                <h2 class="text-2xl font-bold mb-4">Préstamos Terminados</h2>
                <input type="text" id="filterFinishedInput" placeholder="Filtrar por nombre" class="mb-4 p-2 border bg-black text-white border-white"> <br>
                • <strong>Aviso:</strong> No se Recomienda borrar la informacion de los prestamos terminados.
                <br>
                <br>
                <div class="bg-card p-4 rounded overflow-x-auto">
                    <table class="w-full">
                        <thead>
                            <tr class="text-left">
                                <th class="p-2">Nombre</th>
                                <th class="p-2">Apellido</th>
                                <th class="p-2">Correo</th>
                                <th class="p-2">Monto Pagado</th>
                                <th class="p-2">Fecha de Finalización</th>
                            </tr>
                        </thead>F
                        <tbody id="finishedLoansTable"></tbody>
                    </table>
                </div>
            </div>
            <div id="calendario-pagos" class="section hidden">
                <h2 class="text-2xl font-bold mb-4">Calendario de Pagos</h2>
                <div class="bg-card p-4 rounded overflow-x-auto mb-6">
                    <h3 class="text-xl font-semibold mb-2">Pagos Próximos</h3>
                    <input type="text" id="filterProximosInput" placeholder="Filtrar por nombre" class="mb-4 p-2 border bg-black text-white border-white">
                    <table class="w-full">
                        <thead>
                            <tr class="text-left">
                                <th class="p-2">Nombre</th>
                                <th class="p-2">Apellido</th>
                                <th class="p-2">Monto</th>
                                <th class="p-2">Fecha de Pago</th>
                                <th class="p-2">Días Restantes</th>
                                <th class="p-2">Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="proximosPagosTable"></tbody>
                    </table>
                </div>
                <div class="bg-card p-4 rounded overflow-x-auto">
                    <h3 class="text-xl font-semibold mb-2">Pagos Vencidos</h3>
                    <table class="w-full">
                        <thead>
                            <tr class="text-left">
                                <th class="p-2">Nombre</th>
                                <th class="p-2">Apellido</th>
                                <th class="p-2">Monto Original</th>
                                <th class="p-2">Interés por Mora</th>
                                <th class="p-2">Monto Total</th>
                                <th class="p-2">Días de Retraso</th>
                                <th class="p-2">Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="pagosVencidosTable"></tbody>
                    </table>
                </div>
            </div>

            <div id="multas-recargos" class="section hidden">
                <h2 class="text-2xl font-bold mb-4">Multas y Recargos</h2>
                <input type="text" id="filterLatePaymentsInput" placeholder="Filtrar por nombre" class="mb-4 p-2 border bg-black text-white border-white">
                <div class="bg-card p-4 rounded overflow-x-auto mb-6">
                    <h3 class="text-xl font-semibold mb-2">Pagos Vencidos</h3>
                    <table class="w-full">
                        <thead>
                            <tr class="text-left">
                                <th class="p-2">Nombre</th>
                                <th class="p-2">Apellido</th>
                                <th class="p-2">Monto Original</th>
                                <th class="p-2">Interés por Mora</th>
                                <th class="p-2">Monto Total</th>
                                <th class="p-2">Días de Retraso</th>
                                <th class="p-2">Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="multasRecargosTable"></tbody>
                    </table>
                </div>
                <div class="grid gap-4 md:grid-cols-2 mt-6">
                    <div class="bg-card p-4 rounded">
                        <canvas id="multasChart"></canvas>
                    </div>
                    <div class="bg-card p-4 rounded">
                        <canvas id="recargosChart"></canvas>
                    </div>
                </div>
            </div>

<!--El apartado de Rutas y carteras no se esta usando en la pagina, se mantendra el codigo pero no se usara-->
                <div id="carteras-prestamos" class="section hidden max-w-4xl mx-auto">
                    <h2 class="text-2xl font-bold mb-4">Carteras Préstamos</h2>
                    <!-- Formulario para crear nueva ruta -->
                    <div class="bg-black p-4 rounded shadow mb-6">
                        <h3 class="text-xl font-semibold mb-2">Crear Nueva Ruta</h3>
                        <form id="nuevaRutaForm" class="grid grid-cols-2 gap-4">
                            <input type="text" id="nombreRuta" placeholder="Nombre de la Ruta" class="p-2 rounded" required>
                            <input type="number" id="fondosRuta" placeholder="Fondos Disponibles" class="p-2 rounded" required>
                            <button type="submit" class="bg-blue-600 text-white p-2 rounded col-span-2 hover:bg-blue-700">Crear Ruta</button>
                        </form>
                    </div>
                    
                    <!-- Lista de Rutas -->
                    <div class="bg-black p-4 rounded shadow mb-6">
                        <h3 class="text-xl font-semibold mb-2">Rutas Existentes</h3>
                        <div id="listaRutas" class="grid gap-4"></div>
                    </div>
                    
                    <!-- Formulario para agregar cliente a ruta -->
                    <div class="bg-black p-4 rounded shadow mb-6">
                        <h3 class="text-xl font-semibold mb-2">Agregar Cliente a Ruta</h3>
                        <form id="agregarClienteForm" class="grid grid-cols-2 gap-4">
                            <select id="rutaSeleccionada" class="p-2 rounded" required>
                                <option value="">Seleccionar Ruta</option>
                            </select>
                            <input type="text" id="nombreCliente" placeholder="Nombre del Cliente" class="p-2 rounded" required>
                            <input type="text" id="apellidoCliente" placeholder="Dirección del cliente, donde vive ?" class="p-2 rounded" required>
                            <input type="tel" id="numeroCliente" placeholder="Número de Teléfono" class="p-2 rounded" required>
                            <input type="number" id="montoPrestamo" placeholder="Monto del Préstamo" class="p-2 rounded" required>
                            <button type="submit" class="bg-green-600 text-white p-2 rounded col-span-2 hover:bg-green-700">Agregar Cliente</button>
                        </form>
                    </div>

                    
                    
                    <!-- Tabla de Clientes por Ruta -->
                    <div class="bg-black p-4 rounded shadow overflow-x-auto mb-6">
                        <h3 class="text-xl font-semibold mb-2">Clientes por Ruta general: </h3>
                        <table class="w-full border-collapse">
                            <thead>
                                <tr class="border-b border-gray-600">
                                    <th class="p-2 text-left">Ruta</th>
                                    <th class="p-2 text-left">Nombre</th>
                                    <th class="p-2 text-left">Direccion del cliente</th>
                                    <th class="p-2 text-left">Número Telefono</th>
                                    <th class="p-2 text-left">Monto Prestado</th>
                                    <th class="p-2 text-left">Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="clientesPorRutaTable"></tbody>
                        </table>
                    </div>
            
                    <!-- Nueva sección: Clientes Divididos por Rutas -->
                    <div class="bg-black p-4 rounded shadow overflow-x-auto">
                        <h3 class="text-xl font-semibold mb-2">Clientes Divididos por Rutas: </h3>
                        <br>
                        <div id="clientesDivididosPorRutas"></div>
                    </div>
                </div>

            <div id="recordatorios-pago" class="section hidden">
                <div class="bg-card p-4 rounded">
                    <div id="agenda-notas" class="">
                        <h2 class="text-2xl font-bold mb-4">Agenda de Notas</h2>
                        <div class="bg-card p-4 rounded">
                            <h3 class="text-xl font-semibold mb-2">Configuración de Notas</h3>
                            <form id="notasForm" class="space-y-4">
                                <div>
                                    <label for="tituloNota" class="block text-sm font-medium text-gray-300">Título de la Nota:</label>
                                    <input type="text" id="tituloNota" name="tituloNota" class="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white" required>
                                </div>
                                <div>
                                    <label for="fechaNota" class="block text-sm font-medium text-gray-300">Fecha:</label>
                                    <input type="date" id="fechaNota" name="fechaNota" class="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white" required>
                                </div>
                                <div>
                                    <label for="descripcionNota" class="block text-sm font-medium text-gray-300">Descripción:</label>
                                    <textarea id="descripcionNota" name="descripcionNota" rows="4" class="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white" required></textarea>
                                </div>
                                <button type="submit" class="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">Guardar Nota</button>
                            </form>
                        </div>
                        <div class="bg-card p-4 rounded mt-6">
                            <h3 class="text-xl font-semibold mb-2">Notas Guardadas</h3>
                            <table class="min-w-full bg-gray-800 text-white">
                                <thead>
                                    <tr>
                                        <th class="py-2 px-4 border-b">Título</th>
                                        <th class="py-2 px-4 border-b">Fecha</th>
                                        <th class="py-2 px-4 border-b">Descripción</th>
                                        <th class="py-2 px-4 border-b">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody id="listaNotas">
                                    <!-- Las notas se agregarán aquí dinámicamente -->
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!--Este formulario no se esta usando-->
                    
                    <form id="recordatoriosForm" class="space-y-4">
                        <div>
                        </div>
                        <div> 
                            <div class="mt-2 space-y-2">     
                            </div>
                        </div>
                    </form>
                </div>
                <div class="bg-card p-4 rounded mt-6">
                   

                    <ul id="proximosRecordatorios" class="list-disc pl-5"></ul>
                </div>
            </div>

            <div id="historial-prestamos" class="section hidden">
                <h2 class="text-2xl font-bold mb-4">Historial de Préstamos / Facturación</h2>
                <input type="text" id="filterHistorialInput" placeholder="Filtrar por nombre" class="mb-4 p-2 border border-white bg-black text-white">
                <div class="bg-card p-4 rounded overflow-x-auto">
                    <table class="w-full">
                        <thead>
                            <tr class="text-left">
                                <th class="p-2">ID</th>
                                <th class="p-2">Cliente</th>
                                <th class="p-2">Monto</th>
                                <th class="p-2">Fecha Inicio</th>
                                <th class="p-2">Fecha Fin</th>
                                <th class="p-2">Estado</th>
                                <th class="p-2">Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="historialPrestamosTable"></tbody>
                    </table>
                </div>
            </div>

            <div id="analisis-riesgo" class="section hidden">
                <h2 class="text-2xl font-bold mb-4">Análisis de Riesgo</h2>
                <input type="text" id="filterAnalisisInput" placeholder="Filtrar por nombre" class="mb-4 p-2 border bg-black text-white border-white">
                <div class="bg-card p-4 rounded overflow-x-auto">
                    <table class="w-full">
                        <thead>
                            <tr class="text-left">
                                <th class="p-2">Nombre</th>
                                <th class="p-2">Apellido</th>
                                <th class="p-2">Cuotas Iniciales</th>
                                <th class="p-2">Cuotas Atrasadas</th>
                                <th class="p-2">Porcentaje de Riesgo</th>
                            </tr>
                        </thead>
                        <tbody id="riskAnalysisTable"></tbody>
                    </table>
                </div>
            </div>
        </main>
    </div>

    <div id="formularioEdicion" style="display:none; border: 1px solid #ccc; padding: 20px; margin-top: 20px;">
        <h2>Editar Ruta</h2>
        <label for="nombreRutaInput">Nombre de la Ruta:</label>
        <input type="text" id="nombreRutaInput" required>
        <br><br>
        <label for="montoInput">Monto:</label>
        <input type="number" id="montoInput" required>
        <br><br>
        <button onclick="guardarCambios()">Guardar Cambios</button>
        <button onclick="cerrarFormulario()">Cancelar</button>
    </div>
    
    

    <div id="editModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 hidden items-center justify-center">
        <div class="bg-gray-800 p-4 rounded shadow">
            <h2 class="text-xl font-semibold mb-2">Editar Cliente</h2>
            <form id="editForm" class="space-y-2">
                <input type="hidden" id="editId">
                <input type="text" id="editNombre" placeholder="Nombre" class="w-full p-2 bg-gray-700 rounded" required>
                <input type="text" id="editApellido" placeholder="Apellido" class="w-full p-2 bg-gray-700 rounded" required>
                <input type="tel" id="editNumero" placeholder="Número de teléfono" class="w-full p-2 bg-gray-700 rounded" required>
                <input type="email" id="editCorreo" placeholder="Correo electrónico (opcional)" class="w-full p-2 bg-gray-700 rounded">
                <input type="text" id="editDireccion" placeholder="Dirección" class="w-full p-2 bg-gray-700 rounded" required>
                <input type="number" id="editMonto" placeholder="Monto del préstamo" class="w-full p-2 bg-gray-700 rounded" required>
                <input type="number" id="editCuotas" placeholder="Número de cuotas (máx. 12)" class="w-full p-2 bg-gray-700 rounded" required min="1" max="12">
                <textarea id="editMensaje" placeholder="Mensaje" class="w-full p-2 bg-gray-700 rounded"></textarea>
                <div class="flex justify-end space-x-2">
                    <button type="button" onclick="closeEditModal()" class="bg-gray-500 text-white p-2 rounded hover:bg-gray-600">Cancelar</button>
                    <button type="submit" class="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">Guardar Cambios</button>
                </div>
            </form>
        </div>
    </div>

    <footer style="color: white;" class="text-center p-4 bg-gray-900 text-white dark:text-black">
        © 2025 Inversiones P&P Marte. Todos los derechos reservados.<br>
        By: Josian Viñas & Felix Mendoza
    </footer>
    <script src="secretaria.js"></script>
    <script src="calculadora.js"></script>
    <script src="facturas.js"></script>
</body>
</html>

