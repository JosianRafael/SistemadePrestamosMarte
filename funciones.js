
// Variables globales
let prestamo = {};
let tablaAmortizacion = [];

// Función principal de cálculo
function calcularPrestamo(event) {
event.preventDefault();
console.log("Calculando préstamo...");

// Obtener valores del formulario
prestamo = {
monto: parseFloat(document.getElementById('montoPrestamo').value),
tasaInteres: parseFloat(document.getElementById('tasaInteres').value) / 100,
tipoTasa: document.getElementById('tipoTasa').value,
plazo: parseInt(document.getElementById('plazoPrestamo').value),
frecuenciaPago: document.getElementById('frecuenciaPago').value,
tipoInteres: document.getElementById('tipoInteres').value,
cuotaInicial: parseFloat(document.getElementById('cuotaInicial').value) || 0
};

console.log("Datos del préstamo:", prestamo);

// Ajustar la tasa de interés según el tipo y la frecuencia
let tasaEfectiva = ajustarTasaInteres(prestamo.tasaInteres, prestamo.tipoTasa, prestamo.frecuenciaPago);

// Calcular la cuota periódica
let numeroPagos = calcularNumeroPagos(prestamo.plazo, prestamo.frecuenciaPago);
let cuotaPeriodica = calcularCuotaPeriodica(prestamo.monto - prestamo.cuotaInicial, tasaEfectiva, numeroPagos);

// Generar tabla de amortización
tablaAmortizacion = generarTablaAmortizacion(prestamo.monto - prestamo.cuotaInicial, tasaEfectiva, numeroPagos, cuotaPeriodica);

// Mostrar resultados
mostrarResultadosConAnimacion(cuotaPeriodica, tablaAmortizacion);

// Generar gráficos
generarGraficos(tablaAmortizacion);

// Mostrar secciones de resultados
document.getElementById('resultadosCalculadora').classList.remove('hidden');
document.getElementById('tablaAmortizacion').classList.remove('hidden');
document.getElementById('graficos').classList.remove('hidden');
}

function ajustarTasaInteres(tasa, tipo, frecuencia) {
let tasaAnual = tasa;
if (tipo === 'mensual') {
tasaAnual = Math.pow(1 + tasa, 12) - 1;
} else if (tipo === 'diaria') {
tasaAnual = Math.pow(1 + tasa, 365) - 1;
}

switch (frecuencia) {
case 'mensual':
    return Math.pow(1 + tasaAnual, 1/12) - 1;
case 'quincenal':
    return Math.pow(1 + tasaAnual, 1/24) - 1;
case 'semanal':
    return Math.pow(1 + tasaAnual, 1/52) - 1;
default:
    return tasaAnual;
}
}

function calcularNumeroPagos(plazo, frecuencia) {
switch (frecuencia) {
case 'mensual':
    return plazo;
case 'quincenal':
    return plazo * 2;
case 'semanal':
    return Math.floor(plazo * 4.3);
default:
    return plazo;
}
}

function calcularCuotaPeriodica(monto, tasaEfectiva, numeroPagos) {
return (monto * tasaEfectiva * Math.pow(1 + tasaEfectiva, numeroPagos)) / (Math.pow(1 + tasaEfectiva, numeroPagos) - 1);
}

function generarTablaAmortizacion(monto, tasaEfectiva, numeroPagos, cuotaPeriodica) {
let saldoPendiente = monto;
let tabla = [];

for (let i = 1; i <= numeroPagos; i++) {
let interes = saldoPendiente * tasaEfectiva;
let capital = cuotaPeriodica - interes;
saldoPendiente -= capital;

tabla.push({
    numeroPago: i,
    cuota: cuotaPeriodica,
    capital: capital,
    interes: interes,
    saldoPendiente: Math.max(saldoPendiente, 0)
});

if (saldoPendiente <= 0) break;
}

return tabla;
}

function mostrarResultadosConAnimacion(cuotaPeriodica, tablaAmortizacion) {
console.log("Mostrando resultados con animación...");
let montoTotal = tablaAmortizacion.reduce((sum, pago) => sum + pago.cuota, 0) + prestamo.cuotaInicial;
let interesesTotales = tablaAmortizacion.reduce((sum, pago) => sum + pago.interes, 0);

animateValue(document.getElementById('montoTotal'), 0, montoTotal, 1000);
animateValue(document.getElementById('cuotaPeriodica'), 0, cuotaPeriodica, 1000);
animateValue(document.getElementById('interesesTotales'), 0, interesesTotales, 1000);

// Generar tabla de amortización
const tbody = document.getElementById('tablaAmortizacionBody');
tbody.innerHTML = '';
tablaAmortizacion.forEach((pago, index) => {
const row = tbody.insertRow();
row.innerHTML = `
    <td class="px-6 py-4 ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700'}">${pago.numeroPago}</td>
    <td class="px-6 py-4 ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700'}">$${pago.cuota.toFixed(2)}</td>
    <td class="px-6 py-4 ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700'}">$${pago.capital.toFixed(2)}</td>
    <td class="px-6 py-4 ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700'}">$${pago.interes.toFixed(2)}</td>
    <td class="px-6 py-4 ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700'}">$${pago.saldoPendiente.toFixed(2)}</td>
`;
});
}

function generarGraficos(tablaAmortizacion) {
console.log("Generando gráficos...");
// Gráfico de distribución
const ctxDistribucion = document.getElementById('graficoDistribucion').getContext('2d');
new Chart(ctxDistribucion, {
type: 'doughnut',
data: {
    labels: ['Capital', 'Intereses'],
    datasets: [{
        data: [
            prestamo.monto,
            tablaAmortizacion.reduce((sum, pago) => sum + pago.interes, 0)
        ],
        backgroundColor: ['#4CAF50', '#FFC107'],
        borderColor: ['#45a049', '#e6ac00'],
        borderWidth: 1
    }]
},
options: {
    responsive: true,
    plugins: {
        legend: {
            position: 'bottom',
            labels: {
                color: '#e2e8f0'
            }
        },
        title: {
            display: true,
            text: 'Distribución del Préstamo',
            color: '#e2e8f0',
            font: {
                size: 16
            }
        }
    }
}
});

// Gráfico de amortización
const ctxAmortizacion = document.getElementById('graficoAmortizacion').getContext('2d');
new Chart(ctxAmortizacion, {
type: 'line',
data: {
    labels: tablaAmortizacion.map(pago => pago.numeroPago),
    datasets: [{
        label: 'Saldo Pendiente',
        data: tablaAmortizacion.map(pago => pago.saldoPendiente),
        borderColor: '#3498db',
        backgroundColor: 'rgba(52, 152, 219, 0.1)',
        fill: true,
        tension: 0.4
    }]
},
options: {
    responsive: true,
    plugins: {
        legend: {
            position: 'bottom',
            labels: {
                color: '#e2e8f0'
            }
        },
        title: {
            display: true,
            text: 'Evolución del Saldo Pendiente',
            color: '#e2e8f0',
            font: {
                size: 16
            }
        }
    },
    scales: {
        x: {
            title: {
                display: true,
                text: 'Número de Pago',
                color: '#e2e8f0'
            },
            ticks: {
                color: '#e2e8f0'
            },
            grid: {
                color: 'rgba(255, 255, 255, 0.1)'
            }
        },
        y: {
            title: {
                display: true,
                text: 'Saldo Pendiente',
                color: '#e2e8f0'
            },
            ticks: {
                color: '#e2e8f0',
                callback: function(value, index, values) {
                    return '$' + value.toFixed(2);
                }
            },
            grid: {
                color: 'rgba(255, 255, 255, 0.1)'
            }
        }
    }
}
});
}

function calcularPagoAnticipado() {
console.log("Calculando pago anticipado...");
const pagoAnticipado = parseFloat(document.getElementById('pagoAnticipado').value);
if (isNaN(pagoAnticipado) || pagoAnticipado <= 0) {
alert('Por favor, ingrese un monto válido para el pago anticipado.');
return;
}

// Recalcular la tabla de amortización con el pago anticipado
let nuevaTabla = [...tablaAmortizacion];
let saldoPendiente = nuevaTabla[nuevaTabla.length - 1].saldoPendiente - pagoAnticipado;

if (saldoPendiente <= 0) {
alert('El pago anticipado cubre completamente el saldo pendiente.');
return;
}

// Ajustar la tabla de amortización
nuevaTabla = nuevaTabla.map(pago => {
if (pago.saldoPendiente > saldoPendiente) {
    let nuevoInteres = saldoPendiente * (pago.interes / pago.saldoPendiente);
    let nuevoCapital = pago.cuota - nuevoInteres;
    saldoPendiente = Math.max(saldoPendiente - nuevoCapital, 0);
    
    return {
        ...pago,
        capital: nuevoCapital,
        interes: nuevoInteres,
        saldoPendiente: saldoPendiente
    };
}
return pago;
}).filter(pago => pago.saldoPendiente > 0);

// Actualizar resultados y gráficos
mostrarResultadosConAnimacion(nuevaTabla[0].cuota, nuevaTabla);
generarGraficos(nuevaTabla);
}

function calcularMora() {
console.log("Calculando mora...");
const diasAtraso = parseInt(document.getElementById('diasAtraso').value);
if (isNaN(diasAtraso) || diasAtraso <= 0) {
alert('Por favor, ingrese un número válido de días de atraso.');
return;
}

// Calcular la mora (ejemplo: 5% anual sobre el saldo pendiente)
const tasaMoraDiaria = 0.05 / 365;
const saldoPendiente = tablaAmortizacion[tablaAmortizacion.length - 1].saldoPendiente;
const montoMora = saldoPendiente * tasaMoraDiaria * diasAtraso;

alert(`El monto de la mora por ${diasAtraso} días de atraso es: $${montoMora.toFixed(2)}`);
}

function animateValue(obj, start, end, duration) {
let startTimestamp = null;
const step = (timestamp) => {
if (!startTimestamp) startTimestamp = timestamp;
const progress = Math.min((timestamp - startTimestamp) / duration, 1);
obj.textContent = '$' + (progress * (end - start) + start).toFixed(2);
if (progress < 1) {
    window.requestAnimationFrame(step);
}
};
window.requestAnimationFrame(step);
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
console.log("DOM fully loaded and parsed");
const form = document.getElementById('calculadoraPrestamosForm');
const btnPagoAnticipado = document.getElementById('calcularPagoAnticipado');
const btnMora = document.getElementById('calcularMora');

if (form) {
form.addEventListener('submit', calcularPrestamo);
console.log("Form submit event listener added");
} else {
console.error("Form element not found");
}

if (btnPagoAnticipado) {
btnPagoAnticipado.addEventListener('click', calcularPagoAnticipado);
console.log("Pago anticipado button event listener added");
} else {
console.error("Pago anticipado button not found");
}

if (btnMora) {
btnMora.addEventListener('click', calcularMora);
console.log("Mora button event listener added");
} else {
console.error("Mora button not found");
}
});

                    // El código JavaScript existente permanece igual
                    // Cargar datos del localStorage o inicializar si no existen
                    let rutas = JSON.parse(localStorage.getItem('rutas')) || [];
            
                    // Función para guardar datos en localStorage
                    function guardarDatos() {
                        localStorage.setItem('rutas', JSON.stringify(rutas));
                    }
            
                    // Función para crear una nueva ruta
                    function crearRuta(nombre, fondos) {
                        const nuevaRuta = {
                            id: Date.now(),
                            nombre: nombre,
                            fondosIniciales: parseFloat(fondos),
                            fondosDisponibles: parseFloat(fondos),
                            clientes: []
                        };
                        rutas.push(nuevaRuta);
                        guardarDatos();
                        actualizarListaRutas();
                        actualizarSelectRutas();
                        actualizarClientesDivididosPorRutas();
                    }
            
                    // Función para agregar un cliente a una ruta
                    function agregarCliente(rutaId, nombre, apellido, numero, montoPrestamo) {
                        const ruta = rutas.find(r => r.id === parseInt(rutaId));
                        if (ruta && ruta.fondosDisponibles >= montoPrestamo) {
                            const nuevoCliente = {
                                id: Date.now(),
                                nombre: nombre,
                                apellido: apellido,
                                numero: numero,
                                montoPrestamo: parseFloat(montoPrestamo)
                            };
                            ruta.clientes.push(nuevoCliente);
                            ruta.fondosDisponibles -= nuevoCliente.montoPrestamo;
                            guardarDatos();
                            actualizarListaRutas();
                            actualizarTablaClientes();
                            actualizarSelectRutas();
                            actualizarClientesDivididosPorRutas();
                        } else {
                            alert("Fondos insuficientes en la ruta seleccionada.");
                        }
                    }
            
                    // Función para actualizar la lista de rutas en el DOM
                    function actualizarListaRutas() {
                        const listaRutas = document.getElementById('listaRutas');
                        listaRutas.innerHTML = '';
                        rutas.forEach(ruta => {
                            const rutaElement = document.createElement('div');
                            rutaElement.className = 'bg-gray-800 p-4 rounded shadow mb-2';
                            rutaElement.innerHTML = `
                                <h4 class="font-bold">${ruta.nombre}</h4>
                                <p>Fondos iniciales: $${ruta.fondosIniciales.toFixed(2)}</p>
                                <p>Fondos disponibles: $${ruta.fondosDisponibles.toFixed(2)}</p>
                                <button onclick="editarRuta(${ruta.id})" class="bg-yellow-600 text-white p-1 rounded mr-2 hover:bg-yellow-700">Editar</button>
                                <button onclick="borrarRuta(${ruta.id})" class="bg-red-600 text-white p-1 rounded hover:bg-red-700">Borrar</button>
                            `;
                            listaRutas.appendChild(rutaElement);
                        });
                    }
            
                    // Función para actualizar el select de rutas
                    function actualizarSelectRutas() {
                        const selectRutas = document.getElementById('rutaSeleccionada');
                        selectRutas.innerHTML = '<option value="">Seleccionar Ruta</option>';
                        rutas.forEach(ruta => {
                            const option = document.createElement('option');
                            option.value = ruta.id;
                            option.textContent = `${ruta.nombre} - $${ruta.fondosDisponibles.toFixed(2)}`;
                            selectRutas.appendChild(option);
                        });
                    }
            
                    // Función para actualizar la tabla de clientes
                    function actualizarTablaClientes() {
                        const tablaClientes = document.getElementById('clientesPorRutaTable');
                        tablaClientes.innerHTML = '';
                        rutas.forEach(ruta => {
                            ruta.clientes.forEach(cliente => {
                                const row = tablaClientes.insertRow();
                                row.className = 'border-b border-gray-600';
                                row.innerHTML = `
                                    <td class="p-2">${ruta.nombre}</td>
                                    <td class="p-2">${cliente.nombre}</td>
                                    <td class="p-2">${cliente.apellido}</td>
                                    <td class="p-2">${cliente.numero}</td>
                                    <td class="p-2">$${cliente.montoPrestamo.toFixed(2)}</td>
                                    <td class="p-2">
                                        <button onclick="pagarPrestamo(${ruta.id}, ${cliente.id})" class="bg-green-600 text-white p-1 rounded mr-2 hover:bg-green-700">Pagar</button>
                                        <button onclick="editarCliente(${ruta.id}, ${cliente.id})" class="bg-yellow-600 text-white p-1 rounded mr-2 hover:bg-yellow-700">Editar</button>
                                        <button onclick="borrarCliente(${ruta.id}, ${cliente.id})" class="bg-red-600 text-white p-1 rounded hover:bg-red-700">Borrar</button>
                                    </td>
                                `;
                            });
                        });
                    }
            
                    // Nueva función para actualizar la sección de clientes divididos por rutas
                    function actualizarClientesDivididosPorRutas() {
                        const contenedor = document.getElementById('clientesDivididosPorRutas');
                        contenedor.innerHTML = '';
                        rutas.forEach(ruta => {
                            const rutaElement = document.createElement('div');
                            rutaElement.className = 'mb-4';
                            rutaElement.innerHTML = `
                                <h4 class="font-bold text-lg mb-2">${ruta.nombre}</h4>
                                <table class="w-full border-collapse">
                                    <thead>
                                        <tr class="border-b border-gray-600">
                                            <th class="p-2 text-left">Nombre</th>
                                            <th class="p-2 text-left">Direccion del cliente</th>
                                            <th class="p-2 text-left">Número Telefono</th>
                                            <th class="p-2 text-left">Monto Prestado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${ruta.clientes.map(cliente => `
                                            <tr class="border-b border-gray-600">
                                                <td class="p-2">${cliente.nombre}</td>
                                                <td class="p-2">${cliente.apellido}</td>
                                                <td class="p-2">${cliente.numero}</td>
                                                <td class="p-2">$${cliente.montoPrestamo.toFixed(2)}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            `;
                            contenedor.appendChild(rutaElement);
                        });
                    }
            
                    // Función para manejar el pago de un préstamo
                    function pagarPrestamo(rutaId, clienteId) {
                        const ruta = rutas.find(r => r.id === rutaId);
                        if (ruta) {
                            const clienteIndex = ruta.clientes.findIndex(c => c.id === clienteId);
                            if (clienteIndex !== -1) {
                                const montoPagado = ruta.clientes[clienteIndex].montoPrestamo;
                                ruta.fondosDisponibles += montoPagado;
                                ruta.clientes.splice(clienteIndex, 1);
                                guardarDatos();
                                actualizarListaRutas();
                                actualizarTablaClientes();
                                actualizarSelectRutas();
                                actualizarClientesDivididosPorRutas();
                            }
                        }
                    }
            
                    // Función para editar una ruta
                    function editarRuta(rutaId) {
                        const ruta = rutas.find(r => r.id === rutaId);
                        if (ruta) {
                            const nuevoNombre = prompt("Ingrese el nuevo nombre de la ruta:", ruta.nombre);
                            const nuevosFondos = prompt("Ingrese los nuevos fondos iniciales:", ruta.fondosIniciales);
                            if (nuevoNombre && nuevosFondos) {
                                ruta.nombre = nuevoNombre;
                                const nuevosFondosFloat = parseFloat(nuevosFondos);
                                const diferencia = nuevosFondosFloat - ruta.fondosIniciales;
                                ruta.fondosIniciales = nuevosFondosFloat;
                                ruta.fondosDisponibles += diferencia;
                                guardarDatos();
                                actualizarListaRutas();
                                actualizarSelectRutas();
                                actualizarTablaClientes();
                                actualizarClientesDivididosPorRutas();
                            }
                        }
                    }
            
                    // Función para borrar una ruta
                    function borrarRuta(rutaId) {
                        if (confirm("¿Está seguro de que desea borrar esta ruta?")) {
                            rutas = rutas.filter(r => r.id !== rutaId);
                            guardarDatos();
                            actualizarListaRutas();
                            actualizarSelectRutas();
                            actualizarTablaClientes();
                            actualizarClientesDivididosPorRutas();
                        }
                    }
            
                    // Función para editar un cliente
                    function editarCliente(rutaId, clienteId) {
                        const ruta = rutas.find(r => r.id === rutaId);
                        if (ruta) {
                            const cliente = ruta.clientes.find(c => c.id === clienteId);
                            if (cliente) {
                                const nuevoNombre = prompt("Ingrese el nuevo nombre del cliente:", cliente.nombre);
                                const nuevoApellido = prompt("Ingrese el nuevo apellido del cliente:", cliente.apellido);
                                const nuevoNumero = prompt("Ingrese el nuevo número del cliente:", cliente.numero);
                                const nuevoMonto = prompt("Ingrese el nuevo monto del préstamo:", cliente.montoPrestamo);
                                if (nuevoNombre && nuevoApellido && nuevoNumero && nuevoMonto) {
                                    ruta.fondosDisponibles += cliente.montoPrestamo;
                                    cliente.nombre = nuevoNombre;
                                    cliente.apellido = nuevoApellido;
                                    cliente.numero = nuevoNumero;
                                    cliente.montoPrestamo = parseFloat(nuevoMonto);
                                    ruta.fondosDisponibles -= cliente.montoPrestamo;
                                    guardarDatos();
                                    actualizarListaRutas();
                                    actualizarTablaClientes();
                                    actualizarSelectRutas();
                                    actualizarClientesDivididosPorRutas();
                                }
                            }
                        }
                    }
            
                    // Función para borrar un cliente
                    function borrarCliente(rutaId, clienteId) {
                        if (confirm("¿Está seguro de que desea borrar este cliente?")) {
                            const ruta = rutas.find(r => r.id === rutaId);
                            if (ruta) {
                                const clienteIndex = ruta.clientes.findIndex(c => c.id === clienteId);
                                if (clienteIndex !== -1) {
                                    ruta.fondosDisponibles += ruta.clientes[clienteIndex].montoPrestamo;
                                    ruta.clientes.splice(clienteIndex, 1);
                                    guardarDatos();
                                    actualizarListaRutas();
                                    actualizarTablaClientes();
                                    actualizarSelectRutas();
                                    actualizarClientesDivididosPorRutas();
                                }
                            }
                        }
                    }
            
                    // Event Listeners
                    document.getElementById('nuevaRutaForm').addEventListener('submit', function(e) {
                        e.preventDefault();
                        const nombreRuta = document.getElementById('nombreRuta').value;
                        const fondosRuta = document.getElementById('fondosRuta').value;
                        crearRuta(nombreRuta, fondosRuta);
                        this.reset();
                    });
            
                    document.getElementById('agregarClienteForm').addEventListener('submit', function(e) {
                        e.preventDefault();
                        const rutaId = document.getElementById('rutaSeleccionada').value;
                        const nombre = document.getElementById('nombreCliente').value;
                        const apellido = document.getElementById('apellidoCliente').value;
                        const numero = document.getElementById('numeroCliente').value;
                        const montoPrestamo = document.getElementById('montoPrestamo').value;
                        agregarCliente(rutaId, nombre, apellido, numero, montoPrestamo);
                        this.reset();
                    });
            
                    // Inicialización
                    actualizarListaRutas();
                    actualizarSelectRutas();
                    actualizarTablaClientes();
                    actualizarClientesDivididosPorRutas();
                
        // Cargar notas desde localStorage al cargar la página
        document.addEventListener("DOMContentLoaded", cargarNotas);
    
        document.getElementById("notasForm").addEventListener("submit", function(event) {
            event.preventDefault(); // Evita que el formulario se envíe y recargue la página
            
            // Obtiene los valores de los campos
            const titulo = document.getElementById("tituloNota").value;
            const fecha = document.getElementById("fechaNota").value;
            const descripcion = document.getElementById("descripcionNota").value;
    
            // Crea un objeto de nota
            const nota = { titulo, fecha, descripcion, completada: false };
    
            // Obtiene las notas existentes del localStorage
            const notas = JSON.parse(localStorage.getItem("notas")) || [];
            notas.push(nota); // Agrega la nueva nota al array
    
            // Guarda las notas actualizadas en localStorage
            localStorage.setItem("notas", JSON.stringify(notas));
    
            // Carga las notas en la tabla
            agregarNotaATabla(nota);
    
            // Limpia los campos del formulario
            document.getElementById("notasForm").reset();
        });
    
        function cargarNotas() {
            const notas = JSON.parse(localStorage.getItem("notas")) || [];
            notas.forEach(nota => agregarNotaATabla(nota));
        }
    
        function agregarNotaATabla(nota) {
            const nuevaFila = document.createElement("tr");
            nuevaFila.innerHTML = `
                <td class="py-2 px-4 border-b">${nota.titulo}</td>
                <td class="py-2 px-4 border-b">${nota.fecha}</td>
                <td class="py-2 px-4 border-b">${nota.descripcion}</td>
                <td class="py-2 px-4 border-b">
                    <button class="bg-green-500 text-white p-1 rounded hover:bg-green-600" onclick="completarNota(this)">Completar</button>
                    <button class="bg-yellow-500 text-white p-1 rounded hover:bg-yellow-600" onclick="editarNota(this)">Editar</button>
                    <button class="bg-red-500 text-white p-1 rounded hover:bg-red-600" onclick="eliminarNota(this)">Eliminar</button>
                </td>
            `;
            document.getElementById("listaNotas").appendChild(nuevaFila);
        }
    
        function completarNota(button) {
            const fila = button.closest("tr");
            fila.style.textDecoration = "line-through"; // Marca la nota como completada
    
            // Actualiza el estado de completada en localStorage
            const notas = JSON.parse(localStorage.getItem("notas")) || [];
            const notaIndex = Array.from(document.getElementById("listaNotas").children).indexOf(fila);
            notas[notaIndex].completada = true; // Marca como completada
            localStorage.setItem("notas", JSON.stringify(notas));
        }
    
        function editarNota(button) {
            const fila = button.closest("tr");
            const titulo = fila.children[0].innerText;
            const fecha = fila.children[1].innerText;
            const descripcion = fila.children[2].innerText;
    
            // Rellena el formulario con los datos de la nota
            document.getElementById("tituloNota").value = titulo;
            document.getElementById("fechaNota").value = fecha;
            document.getElementById("descripcionNota").value = descripcion;
    
            // Elimina la fila de la tabla
            eliminarNota(button);
        }
    
        function eliminarNota(button) {
            const fila = button.closest("tr");
            const notas = JSON.parse(localStorage.getItem("notas")) || [];
            const notaIndex = Array.from(document.getElementById("listaNotas").children).indexOf(fila);
            
            // Elimina la nota del array
            notas.splice(notaIndex, 1);
            localStorage.setItem("notas", JSON.stringify(notas)); // Actualiza localStorage
    
            fila.remove(); // Elimina la fila de la tabla
        }

        let prestamosChart, clientesChart;
        const INTERES_POR_MORA = 0.05;
        let pagosVencidos = JSON.parse(localStorage.getItem('pagosVencidos')) || [];
        let multasChart, recargosChart;
        let configuracionRecordatorios = JSON.parse(localStorage.getItem('configuracionRecordatorios')) || {
            diasAnticipacion: 3,
            metodos: ['email']
        };

        function $(id) { return document.getElementById(id); }
        function getClients() { return JSON.parse(localStorage.getItem('clients')) || []; }
        function saveClients(clients) { localStorage.setItem('clients', JSON.stringify(clients)); }
        function getFinishedLoans() { return JSON.parse(localStorage.getItem('finishedLoans')) || []; }
        function saveFinishedLoans(loans) { localStorage.setItem('finishedLoans', JSON.stringify(loans)); }
        function savePagosVencidos() { localStorage.setItem('pagosVencidos', JSON.stringify(pagosVencidos)); }

        function showSection(sectionId) {
            document.querySelectorAll('.section').forEach(section => section.classList.add('hidden'));
            $(sectionId).classList.remove('hidden');
            switch(sectionId) {
                case 'dashboard':
                    updateDashboard();
                    break;
                case 'calendario-pagos':
                    renderCalendarioPagos();
                    break;
                case 'multas-recargos':
                    renderMultasRecargos();
                    break;
                case 'recordatorios-pago':
                    renderRecordatoriosPago();
                    break;
                case 'historial-prestamos':
                    renderHistorialPrestamos();
                    break;
                case 'analisis-riesgo':
                    renderAnalisisRiesgo();
                    break;
            }
        }

        // Función para agregar un nuevo cliente
function addClient(e) {
    e.preventDefault();
    const cuotas = parseInt($('cuotas').value);
    if (cuotas > 12) {
        Swal.fire('Error', 'El número máximo de cuotas es 12', 'error');
        return;
    }

    const clients = getClients();
    const monto = parseFloat($('monto').value);
    const montoPorCuota = monto / cuotas;
    const fechasPago = [];
    const fechaActual = new Date();

    for (let i = 1; i <= cuotas; i++) {
        const fechaPago = new Date(fechaActual);
        fechaPago.setMonth(fechaActual.getMonth() + i);
        fechasPago.push(fechaPago.toISOString().split('T')[0]);
    }

    const newClient = {
        id: Date.now(),
        nombre: $('nombre').value,
        apellido: $('apellido').value,
        numero: $('numero').value,
        correo: $('correo').value || 'No proporcionado',
        direccion: $('direccion').value,
        fechaPrestamo: new Date().toISOString().split('T')[0],
        monto: monto,
        cuotas: cuotas,
        montoPorCuota: montoPorCuota,
        fechasPago: fechasPago,
        ruta: $('ruta').value,  // Nuevo campo de selección
        mensaje: $('mensaje').value
    };

    // Guardar en local y actualizar UI
    clients.push(newClient);
    saveClients(clients);
    $('clientForm').reset();
    renderClients();
    updateDashboard();
    Swal.fire('Éxito', 'Cliente registrado correctamente', 'success');
    showSection('prestamos');

    // Enviar datos a PHP usando JSON
    fetch('controllers/clientesControlador.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newClient)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            Swal.fire('Éxito', 'Cliente registrado correctamente', 'success');
        } else {
            Swal.fire('Error', 'Hubo un problema con la conexión al servidor. Inténtalo de nuevo.'  || 'Ocurrió un problema al registrar el cliente', 'error');
        }
    })
    .catch(error => {
        Swal.fire('Error', 'Hubo un problema con la conexión al servidor. Inténtalo de nuevo.', 'error');
        console.error('Error:', error);
    });
}

// Función para abrir el formulario de edición
function openEditRouteModal(clientId) {
    const clients = getClients();
    const clientToEdit = clients.find(client => client.id === clientId);

    if (clientToEdit) {
        $('editClientId').value = clientToEdit.id;
        $('editRuta').value = clientToEdit.ruta;

        document.getElementById('editRouteModal').style.display = 'block';
    }
}

// Función para cerrar el modal de edición
function closeEditModal() {
    document.getElementById('editRouteModal').style.display = 'none';
}

// Evento para manejar la edición y actualización de la ruta
document.getElementById('editRouteForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const clientId = parseInt($('editClientId').value);
    const updatedRuta = $('editRuta').value;

    const clients = getClients();
    const clientIndex = clients.findIndex(client => client.id === clientId);

    if (clientIndex !== -1) {
        clients[clientIndex].ruta = updatedRuta;
        saveClients(clients);
        Swal.fire('Éxito', 'Ruta actualizada correctamente', 'success');
        renderClients(); // Actualiza la lista de clientes
        closeEditModal(); // Cierra el modal
    } else {
        Swal.fire('Error', 'No se encontró el cliente', 'error');
    }
});


        document.addEventListener("DOMContentLoaded", () => {
            initRouteForm();
        });
        
        document.addEventListener("DOMContentLoaded", () => {
            initRouteForm();
            loadRoutes(); // Cargar rutas al inicio
        });
        
        function initRouteForm() {
            const routeForm = document.getElementById("routeForm");
        
            routeForm.addEventListener("submit", (event) => {
                event.preventDefault(); // Prevenir el envío del formulario por defecto
        
                // Obtener los valores del formulario
                const nombreRuta = document.getElementById("nombreRuta").value;
                const fondosRuta = document.getElementById("fondosRuta").value;
        
                // Crear un objeto JSON
                const rutaData = {
                    nombreRuta: nombreRuta,
                    fondosRuta: parseFloat(fondosRuta),
                    tipo: "lectura" // Cambiar a "escritura" o "lectura" según sea necesario 
                };
        
                // Enviar datos a PHP usando fetch
                fetch("ruta.php", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(rutaData)
                })
                .then(response => response.json())
                .then(data => {
                    console.log(data); // Manejar la respuesta de PHP aquí
                    alert("Ruta creada exitosamente.");
                    routeForm.reset(); // Limpiar el formulario después de enviar
                    loadRoutes(); // Recargar las rutas después de agregar una nueva
                })
                .catch(error => console.error("Error:", error));
            });
        }
        
        function loadRoutes() {
            fetch("rutasControlador.php")
                .then(response => response.json())
                .then(rutas => {
                    const rutasList = document.getElementById("rutasList");
                    rutasList.innerHTML = ""; // Limpiar la lista existente
        
                    rutas.forEach(ruta => {
                        const listItem = document.createElement("li");
                        listItem.textContent = `Nombre: ${ruta.nombreRuta}, Fondos: ${ruta.fondosRuta}, accion: "consultarRuta" `;
                        rutasList.appendChild(listItem);
                    });
                })
                .catch(error => console.error("Error al cargar las rutas:", error));
        }
        
        
        
            
        
        

        function renderClients() {
    const clients = getClients();
    $('clientTable').innerHTML = clients.map(client => {
        const diasRestantes = calcularDiasRestantes(client.fechasPago[client.fechasPago.length - 1]);
        return `
            <tr class="text-xs">
                <td class="p-2">${client.nombre}</td>
                <td class="p-2">${client.apellido}</td>
                <td class="p-2">${client.numero}</td>
                <td class="p-2">${client.correo}</td>
                <td class="p-2">$${client.monto.toFixed(2)}</td>
                <td class="p-2">${client.cuotas}</td>
                <td class="p-2">${client.fechasPago.join(', ')}</td>
                <td class="p-2">${diasRestantes > 0 ? diasRestantes + ' días' : 'Vencido'}</td>
                <td class="p-2">
                    <input type="text" id="mensaje-${client.id}" value="${client.mensaje}" class="w-full p-1 bg-gray-700 rounded text-xs">
                    <button onclick="sendWhatsAppMessage(${client.id})" class="action-button mt-1 text-xs">Enviar WhatsApp</button>
                </td>
                <td class="p-2">
                    <button onclick="editClient(${client.id})" class="action-button mb-1 text-xs">Editar</button>
                    <button onclick="deleteClient(${client.id})" class="action-button mb-1 text-xs">Borrar</button>
                    <button onclick="finishLoan(${client.id})" class="action-button text-xs">Terminar</button>
                </td>
            </tr>
        `;
    }).join('');
}


function sendWhatsAppMessage(clientId) {
    const client = getClients().find(c => c.id === clientId);
    if (!client) return;

    const message = encodeURIComponent(document.getElementById(`mensaje-${clientId}`).value);
    const whatsappUrl = `https://wa.me/${client.numero}?text=${message}`;
    window.open(whatsappUrl, '_blank');
}

        function renderFinishedLoans() {
            const finishedLoans = getFinishedLoans();
            $('finishedLoansTable').innerHTML = finishedLoans.map(loan => `
                <tr>
                    <td class="p-2">${loan.nombre}</td>
                    <td class="p-2">${loan.apellido}</td>
                    <td class="p-2">${loan.correo}</td>
                    <td class="p-2">$${loan.monto.toFixed(2)}</td>
                    <td class="p-2">${loan.fechaFinalizacion}</td>
                    <td class="p-2">
                        <button onclick="editFinishedLoan(${loan.id})" class="action-button mb-1">Editar</button>
                        <button onclick="returnLoan(${loan.id})" class="action-button mb-1">Devolver</button>
                        <button onclick="deleteFinishedLoan(${loan.id})" class="action-button">Eliminar</button>
                    </td>
                </tr>
            `).join('');
        }

        function calcularDiasRestantes(fechaUltimoPago) {
            const hoy = new Date();
            const ultimoPago = new Date(fechaUltimoPago);
            const diferencia = ultimoPago.getTime() - hoy.getTime();
            return Math.ceil(diferencia / (1000 * 3600 * 24));
        }

        function editClient(id) {
            const clients = getClients();
            const client = clients.find(c => c.id === id);
            if (client) {
                $('editId').value = client.id;
                $('editNombre').value = client.nombre;
                $('editApellido').value = client.apellido;
                $('editNumero').value = client.numero;
                $('editCorreo').value = client.correo;
                $('editDireccion').value = client.direccion;
                $('editMonto').value = client.monto;
                $('editCuotas').value = client.cuotas;
                $('editMensaje').value = client.mensaje;
                $('editModal').classList.remove('hidden');
                $('editModal').classList.add('flex');
            }
        }

        function editFinishedLoan(id) {
            const finishedLoans = getFinishedLoans();
            const loan = finishedLoans.find(l => l.id === id);
            if (loan) {
                $('editId').value = loan.id;
                $('editNombre').value = loan.nombre;
                $('editApellido').value = loan.apellido;
                $('editNumero').value = loan.numero;
                $('editCorreo').value = loan.correo;
                $('editDireccion').value = loan.direccion;
                $('editMonto').value = loan.monto;
                $('editCuotas').value = loan.cuotas;
                $('editMensaje').value = loan.mensaje;
                $('editModal').classList.remove('hidden');
                $('editModal').classList.add('flex');
            }
        }

        function closeEditModal() {
            $('editModal').classList.add('hidden');
            $('editModal').classList.remove('flex');
        }

        function saveEdit(e) {
            e.preventDefault();
            const id = parseInt($('editId').value);
            const clients = getClients();
            const finishedLoans = getFinishedLoans();
            let index = clients.findIndex(c => c.id === id);
            let isFinishedLoan = false;

            if (index === -1) {
                index = finishedLoans.findIndex(l => l.id === id);
                isFinishedLoan = true;
            }

            if (index !== -1) {
                const monto = parseFloat($('editMonto').value);
                const cuotas = parseInt($('editCuotas').value);
                if (cuotas > 12) {
                    Swal.fire('Error', 'El número máximo de cuotas es 12', 'error');
                    return;
                }
                const montoPorCuota = monto / cuotas;
                const fechasPago = [];
                const fechaActual = new Date();
                for (let i = 1; i <= cuotas; i++) {
                    const fechaPago = new Date(fechaActual);
                    fechaPago.setMonth(fechaActual.getMonth() + i);
                    fechasPago.push(fechaPago.toISOString().split('T')[0]);
                }
                const updatedLoan = {
                    id: id,
                    nombre: $('editNombre').value,
                    apellido: $('editApellido').value,
                    numero: $('editNumero').value,
                    correo: $('editCorreo').value || 'No proporcionado',
                    direccion: $('editDireccion').value,
                    monto: monto,
                    cuotas: cuotas,
                    montoPorCuota: montoPorCuota,
                    fechasPago: fechasPago,
                    mensaje: $('editMensaje').value
                };

                if (isFinishedLoan) {
                    finishedLoans[index] = { ...finishedLoans[index], ...updatedLoan };
                    saveFinishedLoans(finishedLoans);
                } else {
                    clients[index] = { ...clients[index], ...updatedLoan };
                    saveClients(clients);
                }

                renderClients();
                renderFinishedLoans();
                updateDashboard();
                closeEditModal();
                Swal.fire('Éxito', 'Préstamo actualizado correctamente', 'success');
            }
        }

        function deleteClient(id) {
            Swal.fire({
                title: '¿Estás seguro?',
                text: "No podrás revertir esta acción",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, borrar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    const clients = getClients().filter(c => c.id !== id);
                    saveClients(clients);
                    renderClients();
                    updateDashboard();
                    Swal.fire(
                        'Borrado',
                        'El cliente ha sido eliminado.',
                        'success'
                    );
                }
            });
        }

        function sendMessage(id) {
            const clients = getClients();
            const index = clients.findIndex(c => c.id === id);
            if (index !== -1) {
                const nuevoMensaje = $(`mensaje-${id}`).value;
                clients[index].mensaje = nuevoMensaje;
                saveClients(clients);
                Swal.fire('Éxito', `Mensaje actualizado para ${clients[index].nombre} ${clients[index].apellido}`, 'success');
            }
        }

        function finishLoan(id) {
            Swal.fire({
                title: '¿Finalizar préstamo?',
                text: "Este préstamo se marcará como terminado",
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, finalizar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    const clients = getClients();
                    const index = clients.findIndex(c => c.id === id);
                    if (index !== -1) {
                        const finishedLoan = {
                            ...clients[index],
                            fechaFinalizacion: new Date().toISOString().split('T')[0]
                        };
                        const finishedLoans = getFinishedLoans();
                        finishedLoans.push(finishedLoan);
                        saveFinishedLoans(finishedLoans);
                        clients.splice(index, 1);
                        saveClients(clients);
                        renderClients();
                        renderFinishedLoans();
                        updateDashboard();
                        Swal.fire('Éxito', 'Préstamo marcado como terminado', 'success');
                    }
                }
            });
        }

        function returnLoan(id) {
            Swal.fire({
                title: '¿Devolver préstamo?',
                text: "Este préstamo se marcará como activo nuevamente",
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, devolver',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    const finishedLoans = getFinishedLoans();
                    const index = finishedLoans.findIndex(l => l.id === id);
                    if (index !== -1) {
                        const loan = finishedLoans[index];
                        delete loan.fechaFinalizacion;
                        const clients = getClients();
                        clients.push(loan);
                        saveClients(clients);
                        finishedLoans.splice(index, 1);
                        saveFinishedLoans(finishedLoans);
                        renderClients();
                        renderFinishedLoans();
                        updateDashboard();
                        Swal.fire('Éxito', 'Préstamo devuelto a activos', 'success');
                    }
                }
            });
        }

        function updateDashboard() {
            const clients = getClients();
            const totalPrestamos = clients.reduce((sum, client) => sum + client.monto, 0);
            $('totalPrestamos').textContent = `$${totalPrestamos.toFixed(2)}`;
            $('clientesActivos').textContent = clients.length;
            $('prestamosPendientes').textContent = clients.length;
            $('currentDate').textContent = new Date().toLocaleDateString();

            updatePrestamosChart();
            updateClientesChart();
        }

        function updatePrestamosChart() {
            const clients = getClients();
            const ctx = $('prestamosChart').getContext('2d');
            
            if (prestamosChart) {
                prestamosChart.destroy();
            }

            prestamosChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: clients.map(client => `${client.nombre} ${client.apellido}`),
                    datasets: [{
                        label: 'Monto del Préstamo',
                        data: clients.map(client => client.monto),
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        function updateClientesChart() {
            const clients = getClients();
            const finishedLoans = getFinishedLoans();
            const ctx = $('clientesChart').getContext('2d');
            
            if (clientesChart) {
                clientesChart.destroy();
            }

            clientesChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: ['Préstamos Activos', 'Préstamos Terminados'],
                    datasets: [{
                        data: [clients.length, finishedLoans.length],
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.6)',
                            'rgba(54, 162, 235, 0.6)'
                        ]
                    }]
                },
                options: {
                    responsive: true
                }
            });
        }

        function deletePayment(clientId, fechaPago) {
            Swal.fire({
                title: '¿Estás seguro?',
                text: "¿Deseas eliminar este pago?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    const clients = getClients();
                    const clientIndex = clients.findIndex(c => c.id === clientId);
                    if (clientIndex !== -1) {
                        clients[clientIndex].fechasPago = clients[clientIndex].fechasPago.filter(f => f !== fechaPago);
                        saveClients(clients);
                        renderCalendarioPagos();
                        Swal.fire('Eliminado', 'El pago ha sido eliminado.', 'success');
                    }
                }
            });
        }

        function deleteLatePayment(id) {
            Swal.fire({
                title: '¿Estás seguro?',
                text: "¿Deseas eliminar este pago vencido?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    pagosVencidos = pagosVencidos.filter(p => p.id !== id);
                    savePagosVencidos();
                    renderPagosVencidos();
                    Swal.fire('Eliminado', 'El pago vencido ha sido eliminado.', 'success');
                }
            });
        }

        function checkPagosVencidos() {
            const clients = getClients();
            const hoy = new Date();
            let clientesActualizados = false;
            
            clients.forEach(client => {
                client.fechasPago = client.fechasPago.filter(fechaPago => {
                    const diasRetraso = calcularDiasRestantes(fechaPago) * -1;
                    if (diasRetraso > 0) {
                        const pagoVencido = {
                            id: Date.now(), 
                            clientId: client.id,
                            nombre: client.nombre,
                            apellido: client.apellido,
                            montoOriginal: client.montoPorCuota,
                            montoTotal: client.montoPorCuota,
                            diasRetraso: diasRetraso,
                            fechaVencimiento: fechaPago
                        };
                        pagosVencidos.push(pagoVencido);
                        clientesActualizados = true;
                        return false;
                    }
                    return true;
                });
            });

            if (clientesActualizados) {
                saveClients(clients);
                savePagosVencidos();
            }
            renderCalendarioPagos();
            renderMultasRecargos();
        }

        function aplicarInteresPorMora() {
            let actualizados = false;
            pagosVencidos.forEach(pago => {
                const diasTranscurridos = Math.floor((new Date() - new Date(pago.fechaVencimiento)) / (1000 * 60 * 60 * 24));
                const semanasCompletas = Math.floor(diasTranscurridos / 7);
                if (semanasCompletas > Math.floor(pago.diasRetraso / 7)) {
                    pago.montoTotal *= (1 + INTERES_POR_MORA);
                    pago.diasRetraso = diasTranscurridos;
                    actualizados = true;
                }
            });
            if (actualizados) {
                savePagosVencidos();
                renderPagosVencidos();
                renderMultasRecargos();
            }
        }

        function renderMultasRecargos() {
            renderPagosVencidos();
            updateMultasRecargosCharts();
        }

        function renderPagosVencidos() {
            const tablaVencidos = `
                ${pagosVencidos.map(pago => `
                    <tr>
                        <td class="p-2">${pago.nombre}</td>
                        <td class="p-2">${pago.apellido}</td>
                        <td class="p-2">$${pago.montoOriginal.toFixed(2)}</td>
                        <td class="p-2">$${(pago.montoTotal - pago.montoOriginal).toFixed(2)}</td>
                        <td class="p-2">$${pago.montoTotal.toFixed(2)}</td>
                        <td class="p-2">${pago.diasRetraso}</td>
                        <td class="p-2">
                            <button onclick="deleteLatePayment(${pago.id})" class="action-button">Eliminar</button>
                        </td>
                    </tr>
                `).join('')}
            `;
            $('pagosVencidosTable').innerHTML = tablaVencidos;
            $('multasRecargosTable').innerHTML = tablaVencidos;
        }

        function updateMultasRecargosCharts() {
            const ctx1 = $('multasChart').getContext('2d');
            const ctx2 = $('recargosChart').getContext('2d');
            
            if (multasChart) multasChart.destroy();
            if (recargosChart) recargosChart.destroy();

            const montosOriginales = pagosVencidos.map(pago => pago.montoOriginal);
            const intereses = pagosVencidos.map(pago => pago.montoTotal - pago.montoOriginal);

            multasChart = new Chart(ctx1, {
                type: 'bar',
                data: {
                    labels: pagosVencidos.map(pago => `${pago.nombre} ${pago.apellido}`),
                    datasets: [{
                        label: 'Monto Original',
                        data: montosOriginales,
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });

            recargosChart = new Chart(ctx2, {
                type: 'bar',
                data: {
                    labels: pagosVencidos.map(pago => `${pago.nombre} ${pago.apellido}`),
                    datasets: [{
                        label: 'Interés por Mora',
                        data: intereses,
                        backgroundColor: 'rgba(255, 99, 132, 0.6)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        function renderRecordatoriosPago() {
            $('diasAnticipacion').value = configuracionRecordatorios.diasAnticipacion;
            document.querySelectorAll('input[name="metodoNotificacion"]').forEach(checkbox => {
                checkbox.checked = configuracionRecordatorios.metodos.includes(checkbox.value);
            });

            const proximosRecordatorios = calcularProximosRecordatorios();
            $('proximosRecordatorios').innerHTML = proximosRecordatorios.map(recordatorio => `
                <li>${recordatorio.cliente} - Pago de $${recordatorio.monto.toFixed(2)} el ${recordatorio.fecha}</li>
            `).join('');
        }

        function calcularProximosRecordatorios() {
            const clients = getClients();
            const hoy = new Date();
            const limiteFecha = new Date(hoy.getTime() + configuracionRecordatorios.diasAnticipacion * 24 * 60 * 60 * 1000);

            return clients.flatMap(client => 
                client.fechasPago
                    .filter(fecha => {
                        const fechaPago = new Date(fecha);
                        return fechaPago > hoy && fechaPago <= limiteFecha;
                    })
                    .map(fecha => ({
                        cliente: `${client.nombre} ${client.apellido}`,
                        monto: client.montoPorCuota,
                        fecha: fecha
                    }))
            ).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        }

        function saveRecordatoriosConfig(e) {
            e.preventDefault();
            configuracionRecordatorios.diasAnticipacion = parseInt($('diasAnticipacion').value);
            configuracionRecordatorios.metodos = Array.from(document.querySelectorAll('input[name="metodoNotificacion"]:checked')).map(checkbox => checkbox.value);
            localStorage.setItem('configuracionRecordatorios', JSON.stringify(configuracionRecordatorios));
            Swal.fire('Éxito', 'Configuración de recordatorios guardada', 'success');
            renderRecordatoriosPago();
        }

        function renderHistorialPrestamos() {
            const clients = getClients();
            const finishedLoans = getFinishedLoans();
            const allLoans = [...clients, ...finishedLoans].sort((a, b) => new Date(b.fechaPrestamo) - new Date(a.fechaPrestamo));

            $('historialPrestamosTable').innerHTML = allLoans.map(loan => `
                <tr>
                    <td class="p-2">${loan.id}</td>
                    <td class="p-2">${loan.nombre} ${loan.apellido}</td>
                    <td class="p-2">$${loan.monto.toFixed(2)}</td>
                    <td class="p-2">${loan.fechaPrestamo}</td>
                    <td class="p-2">${loan.fechaFinalizacion || 'Activo'}</td>
                    <td class="p-2">${loan.fechaFinalizacion ? 'Terminado' : 'Activo'}</td>
                    <td class="p-2">
                        <button onclick="viewLoanDetails(${loan.id})" class="action-button">Imprimir</button>
                    </td>
                </tr>
            `).join('');
        }

        function viewLoanDetails(id) {
    const clients = getClients();
    const finishedLoans = getFinishedLoans();
    const loan = clients.find(c => c.id === id) || finishedLoans.find(l => l.id === id);

    if (loan) {
        Swal.fire({
            title: "Seleccionar Cobrador",
            input: "text",
            inputPlaceholder: "Nombre del cobrador",
            showCancelButton: true,
            confirmButtonText: "Continuar",
        }).then((result) => {
            if (result.isConfirmed && result.value.trim() !== "") {
                const cobrador = result.value.trim();
                generarFactura(loan, cobrador);
            }
        });
    }
}

function generarFactura(loan, cobrador) {
    let facturaHTML = `
        <div id="factura" style="
            font-family: Arial, sans-serif;
            width: 90%;
            max-width: 600px;
            padding: 20px;
            border: 3px solid black;
            text-align: center;
            background: white;
            color: black;
            margin: auto;
            font-size: 18px;
        ">
            <h1 style="margin: 10px 0;">Inversiones P&P Marte</h1>
            <p style="font-size: 16px; margin: 5px 0;">Factura para Consumidor Final</p>
            <hr style="border: 2px dashed black; margin: 10px 0;">
            
            <div style="text-align: left; font-size: 18px;">
                <p><strong>Cliente:</strong> ${loan.nombre} ${loan.apellido}</p>
                <p><strong>Monto:</strong> $${loan.monto.toFixed(2)}</p>
                <p><strong>Fecha de Inicio:</strong> ${loan.fechaPrestamo}</p>
                <p><strong>Estado:</strong> ${loan.fechaFinalizacion ? 'Terminado' : 'Activo'}</p>
    `;

    if (loan.fechaFinalizacion) {
        facturaHTML += `<p><strong>Fecha de Finalización:</strong> ${loan.fechaFinalizacion}</p>`;
    } else {
        facturaHTML += `
            <p><strong>Cuotas:</strong> ${loan.cuotas}</p>
            <p><strong>Monto por Cuota:</strong> $${loan.montoPorCuota.toFixed(2)}</p>
            <p><strong>Próximas Fechas de Pago:</strong><br> ${loan.fechasPago.join('<br>')}</p>
        `;
    }

    facturaHTML += `
            <p><strong>Cobrador:</strong> ${cobrador}</p>
            </div>
            <hr style="border: 2px dashed black; margin: 10px 0;">
            <p style="margin: 10px 0; font-size: 20px;"><strong>¡Gracias por preferirnos!</strong></p>
        </div>
    `;

    let facturaContainer = document.getElementById("factura-container");
    if (!facturaContainer) {
        facturaContainer = document.createElement("div");
        facturaContainer.id = "factura-container";
        document.body.appendChild(facturaContainer);
    }
    facturaContainer.innerHTML = facturaHTML;
    facturaContainer.style.display = "block";

    Swal.fire({
        title: 'Factura del Préstamo',
        html: facturaHTML,
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Imprimir',
    }).then((result) => {
        if (result.isConfirmed) {
            setTimeout(imprimirFactura, 500);
        }
    });
}

function imprimirFactura() {
    const style = document.createElement("style");
    style.innerHTML = `
        @media print {
            body * {
                visibility: hidden;
            }
            #factura-container, #factura-container * {
                visibility: visible;
            }
            #factura-container {
                position: absolute;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                width: 90%;
                max-width: 600px;
                display: block;
            }
        }
    `;
    document.head.appendChild(style);
    
    setTimeout(() => {
        window.print();
        document.head.removeChild(style);
    }, 300);
}


        function deleteFinishedLoan(id) {
            Swal.fire({
                title: '¿Estás seguro?',
                text: "Esta acción no se puede deshacer",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    const finishedLoans = getFinishedLoans();
                    const updatedLoans = finishedLoans.filter(loan => loan.id !== id);
                    saveFinishedLoans(updatedLoans);
                    renderFinishedLoans();
                    Swal.fire(
                        'Eliminado',
                        'El préstamo ha sido eliminado.',
                        'success'
                    );
                }
            });
        }

        function renderAnalisisRiesgo() {
    const clients = getClients();
    $('riskAnalysisTable').innerHTML = clients.map(client => {
        const cuotasAtrasadas = pagosVencidos.filter(pago => pago.clientId === client.id).length;
        const porcentajeRiesgo = calcularPorcentajeRiesgo(client.cuotas, cuotasAtrasadas);
        const rowClass = porcentajeRiesgo <= 70 ? 'text-red-500' : '';
        return `
            <tr class="${rowClass}">
                <td class="p-2">${client.nombre}</td>
                <td class="p-2">${client.apellido}</td>
                <td class="p-2">${client.cuotas}</td>
                <td class="p-2">${cuotasAtrasadas}</td>
                <td class="p-2">${porcentajeRiesgo.toFixed(2)}%</td>
            </tr>
        `;
    }).join('');
}

function calcularPorcentajeRiesgo(cuotasIniciales, cuotasAtrasadas) {
    const puntosAFavor = cuotasAtrasadas * 10; // Restar 8 puntos por cada cuota atrasada
    const porcentajeRiesgo = Math.max(0, 100 - puntosAFavor);
    // Asegurarte de que el porcentaje no supere el 100%
    return Math.min(100, porcentajeRiesgo);
}

$('clientForm').addEventListener('submit', addClient);
$('editForm').addEventListener('submit', saveEdit);
$('recordatoriosForm').addEventListener('submit', saveRecordatoriosConfig);

renderClients();
renderFinishedLoans();
updateDashboard();
showSection('dashboard');

function renderCalendarioPagos() {
    renderProximosPagos();
    renderPagosVencidos();
}

function renderProximosPagos() {
    const clients = getClients();
    const hoy = new Date();
    const proximosPagos = clients.flatMap(client => 
        client.fechasPago.map(fecha => ({
            ...client,
            fechaPago: fecha,
            diasRestantes: calcularDiasRestantes(fecha)
        }))
    ).filter(pago => pago.diasRestantes >= 0)
    .sort((a, b) => a.diasRestantes - b.diasRestantes);

    $('proximosPagosTable').innerHTML = proximosPagos.map(pago => `
        <tr>
            <td class="p-2">${pago.nombre}</td>
            <td class="p-2">${pago.apellido}</td>
            <td class="p-2">$${pago.montoPorCuota.toFixed(2)}</td>
            <td class="p-2">${pago.fechaPago}</td>
            <td class="p-2">${pago.diasRestantes}</td>
            <td class="p-2">
                <button onclick="deletePayment(${pago.id}, '${pago.fechaPago}')" class="action-button">Eliminar</button>
            </td>
        </tr>
    `).join('');
}

setInterval(checkPagosVencidos, 86400000); // Cada 24 horas
setInterval(aplicarInteresPorMora, 86400000); // Cada 24 horas
setInterval(() => {
    renderClients();
    renderCalendarioPagos();
    renderMultasRecargos();
    renderAnalisisRiesgo();
}, 60000); // Cada minuto




