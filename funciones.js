// Aqui estaran todas las funciones de Js que hacen que la pagina funcione. No borrar nada sin previo aviso.

// Variables globales
// ###############################################################################
// ###############################################################################

let prestamo = {};
let tablaAmortizacion = [];
let prestamosChart, clientesChart;
let pagosVencidos = JSON.parse(localStorage.getItem('pagosVencidos')) || [];
let multasChart, recargosChart;
let configuracionRecordatorios = JSON.parse(localStorage.getItem('configuracionRecordatorios')) || {
    diasAnticipacion: 3,
    metodos: ['email']
};

        //Obtiene el id del elemento para la navegacion
        function $(id) { return document.getElementById(id); }

        //###############################################################################
        // F U N C I O N  P A R A   D E S P LA Z A R S E   E N T R E  S E C I O N E S
        // ###############################################################################

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
// ###############################################################################
// Función para agregar un nuevo cliente (Super importantes esta funcion)...
/// Función para agregar un nuevo cliente.
// ###############################################################################
// ==========================
// FUNCIÓN PARA AGREGAR UN NUEVO CLIENTE
// ==========================
function addClient(e) {
    e.preventDefault(); // Prevenir el comportamiento por defecto del formulario
    
    const cuotas = parseInt(document.getElementById('cuotas').value); // Obtener el número de cuotas como un entero
    // Validar que el número de cuotas no exceda 12
    if (cuotas > 12) {
        Swal.fire('Error', 'El número máximo de cuotas es 12', 'error'); // Mostrar mensaje de error
        return; // Salir de la función
    }

    const monto = parseFloat(document.getElementById('monto').value); // Obtener el monto como un número de punto flotante
    // Validar que el monto sea un número positivo
    if (isNaN(monto) || monto <= 0) {
        Swal.fire('Error', 'El monto debe ser un número positivo', 'error'); // Mostrar mensaje de error
        return; // Salir de la función
    }

    const montoPorCuota = monto / cuotas; // Calcular el monto por cuota
    const frecuenciaCobro = document.getElementById('frecuenciaCobro').value;  // Obtener frecuencia de cobro

    // Generar fechas dinámicamente
    const fechasPago = calcularFechasPago(new Date(), cuotas, frecuenciaCobro); // Calcular las fechas de pago

    // Crear un objeto para el nuevo cliente
    const newClient = {
        id: Date.now(), // Asignar un ID único basado en la fecha y hora actual
        nombre: document.getElementById('nombre').value, // Obtener el nombre del cliente
        apellido: document.getElementById('apellido').value, // Obtener el apellido del cliente
        numero: document.getElementById('numero').value, // Obtener el número de contacto
        correo: document.getElementById('correo').value || 'No proporcionado', // Obtener el correo, o indicar que no fue proporcionado
        direccion: document.getElementById('direccion').value, // Obtener la dirección
        fechaPrestamo: new Date().toISOString().split('T')[0], // Obtener la fecha del préstamo en formato YYYY-MM-DD
        monto: monto, // Almacenar el monto total
        cuotas: cuotas, // Almacenar el número de cuotas
        montoPorCuota: montoPorCuota, // Almacenar el monto por cuota
        fechasPago: fechasPago,  // Fechas adaptadas a la frecuencia de cobro
        ruta: document.getElementById('ruta').value, // Obtener la ruta
        mensaje: document.getElementById('mensaje').value, // Obtener un mensaje adicional
        interesMora: parseFloat(document.getElementById('interesMora').value) || 0, // Obtener el interés por mora, o establecer en 0
        frecuenciaCobro: frecuenciaCobro, // Almacenar la frecuencia de cobro
        accion: 'guardar'  // Etiqueta para la acción de guardar
    };

    // Enviar datos a PHP usando JSON
    fetch('controllers/clientesControlador.php', {
        method: 'POST', // Método HTTP para la solicitud
        headers: {
            'Content-Type': 'application/json' // Tipo de contenido de la solicitud
        },
        body: JSON.stringify(newClient) // Convertir el objeto newClient a JSON
    })
    .then(response => response.json()) // Convertir la respuesta a JSON
    .then(data => {
        // Validar si la respuesta indica éxito
        if (data.success) {
            Swal.fire('Éxito', 'Cliente registrado correctamente', 'success'); // Mostrar mensaje de éxito
            document.getElementById('clientForm').reset(); // Reiniciar el formulario
            renderClients(); // Renderizar la lista de clientes
            updateDashboard(); // Actualizar el tablero de control
            showSection('prestamos'); // Mostrar la sección de préstamos
        } else {
            Swal.fire('Error', 'Hubo un problema con la conexión al servidor.', 'error'); // Mostrar mensaje de error
        }
    })
    .catch(error => {
        Swal.fire('Error', 'Hubo un problema con la conexión al servidor.', 'error'); // Mostrar mensaje de error
        console.error('Error:', error); // Registrar el error en la consola
    });
}

// ==========================
// FUNCIÓN PARA CALCULAR LAS FECHAS DE PAGO
// ==========================
function calcularFechasPago(fechaInicio, cuotas, frecuencia) {
    let fechas = []; // Inicializar un arreglo para almacenar las fechas de pago
    let fecha = new Date(fechaInicio); // Crear una nueva fecha a partir de la fecha de inicio

    // Generar las fechas de pago según la frecuencia especificada
    for (let i = 0; i < cuotas; i++) {
        switch (frecuencia) {
            case "diario":
                fecha.setDate(fecha.getDate() + 1); // Sumar 1 día
                break;
            case "semanal":
                fecha.setDate(fecha.getDate() + 7); // Sumar 7 días
                break;
            case "mensual":
                fecha.setMonth(fecha.getMonth() + 1); // Sumar 1 mes
                break;
            case "quincenal":
                fecha.setDate(fecha.getDate() + 15);  // Añadir 15 días
                break;
                
            default:
                fecha.setMonth(fecha.getMonth() + 1); // Por defecto, sumar 1 mes
        }
        // Guardar la fecha en formato YYYY-MM-DD
        fechas.push(new Date(fecha).toISOString().split('T')[0]);
    }

    return fechas; // Devolver el arreglo de fechas
}

// ==========================
// FUNCIÓN PARA ABRIR EL FORMULARIO DE EDICIÓN
// ==========================
function openEditRouteModal(clientId) {
    const clients = getClients(); // Obtener la lista de clientes
    const clientToEdit = clients.find(client => client.id === clientId); // Buscar el cliente que se quiere editar

    if (clientToEdit) {
        $('editClientId').value = clientToEdit.id; // Establecer el ID del cliente en el campo de edición
        $('editRuta').value = clientToEdit.ruta; // Establecer la ruta del cliente en el campo de edición

        document.getElementById('editRouteModal').style.display = 'block'; // Mostrar el modal de edición
    }
}

// ==========================
// FUNCIÓN PARA CERRAR EL MODAL DE EDICIÓN
// ==========================
function closeEditModal() {
    document.getElementById('editRouteModal').style.display = 'none'; // Ocultar el modal de edición
}



        // ==========================
// EVENTOS PARA CUANDO EL DOCUMENTO ESTÉ CARGADO
// ==========================
document.addEventListener("DOMContentLoaded", () => {
    initRouteForm(); // Inicializar el formulario de rutas
    loadRoutes(); // Cargar rutas al inicio
});

// ==========================
// FUNCIÓN PARA INICIALIZAR EL FORMULARIO DE RUTAS
// ==========================
function initRouteForm() {
    const routeForm = document.getElementById("routeForm"); // Obtener el formulario de rutas

    routeForm.addEventListener("submit", (event) => {
        event.preventDefault(); // Prevenir el envío del formulario por defecto

        // Obtener los valores del formulario
        const nombreRuta = document.getElementById("nombreRuta").value; // Obtener el nombre de la ruta
        const fondosRuta = document.getElementById("fondosRuta").value; // Obtener los fondos de la ruta
        
        // Crear un objeto JSON con los datos de la ruta
        const rutaData = {
            nombreRuta: nombreRuta, // Nombre de la ruta
            fondosRuta: parseFloat(fondosRuta), // Fondos convertidos a número
            accion: "guardar" // Acción para guardar
        };

        // Enviar datos a PHP usando fetch
        fetch("controllers/rutasControlador.php", {
            method: "POST", // Método de la solicitud
            headers: {
                "Content-Type": "application/json" // Tipo de contenido
            },
            body: JSON.stringify(rutaData) // Convertir datos a JSON
        })
        .then(response => response.json()) // Convertir la respuesta a JSON
        .then(data => {
            console.log(data); // Manejar la respuesta de PHP aquí
            alert("Ruta creada exitosamente."); // Alertar éxito
            routeForm.reset(); // Limpiar el formulario después de enviar
            loadRoutes(); // Recargar las rutas después de agregar una nueva
        })
        .catch(error => console.error("Error:", error)); // Manejar errores
    });
}

// ==========================
// FUNCIÓN PARA LLAMAR A LAS RUTAS
// ==========================
function CallRoutes() {
    const rutaData = {
        accion: 'obtenerRutas' // Clave de acción para obtener rutas
    };

    fetch('controllers/rutasControlador.php', {
        method: 'POST', // Método de la solicitud
        headers: {
            'Content-Type': 'application/json' // Tipo de contenido
        },
        body: JSON.stringify(rutaData) // Convertir datos a JSON
    })
    .then(response => response.json()) // Convertir la respuesta a JSON
    .then(rutas => {
        console.log(rutas); // Depuración: imprime los datos recibidos
        printRoutes(rutas); // Llama a la función para imprimir las rutas
    })
    .catch(error => console.error('Error al enviar la solicitud:', error)); // Manejar errores
}

// ==========================
// FUNCIÓN PARA CARGAR LAS RUTAS
// ==========================
function loadRoutes() {
    fetch('controllers/rutasControlador.php', {
        method: 'POST', // o 'GET', dependiendo de lo que necesites
        headers: {
            'Content-Type': 'application/json' // Tipo de contenido
        },
        body: JSON.stringify({
            accion: 'obtenerRutas' // Acción para obtener rutas
        })
    })
    .then(response => response.json()) // Convertir la respuesta a JSON
    .then(rutas => {
        const rutasSelect = document.getElementById('ruta'); // Obtener el elemento select para rutas
        rutasSelect.innerHTML = ''; // Limpiar las opciones existentes

        // Agregar la opción predeterminada
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.disabled = true;
        defaultOption.selected = true;
        defaultOption.textContent = 'Selecciona una ruta'; // Texto de la opción predeterminada
        rutasSelect.appendChild(defaultOption); // Agregar la opción predeterminada

        // Agregar la opción duplicada
        const duplicateOption = document.createElement('option');
        duplicateOption.value = '';
        duplicateOption.textContent = 'Selecciona una ruta'; // Texto de la opción duplicada
        rutasSelect.appendChild(duplicateOption); // Agregar la opción duplicada

        // Agregar opciones para cada ruta
        rutas.forEach(ruta => {
            const option = document.createElement('option'); // Crear una nueva opción
            option.value = ruta.IDRuta; // Usar IDRuta como valor de la opción
            option.textContent = `Nombre: ${ruta.NombreRuta}, Monto: ${ruta.Monto}`; // Texto de la opción
            rutasSelect.appendChild(option); // Agregar la opción al select
        });

        // Llamar a printRoutes para mostrar las rutas
        printRoutes(rutas); // Imprimir rutas
    })
    .catch(error => console.error('Error al cargar las rutas:', error)); // Manejar errores
}

// ==========================
// FUNCIÓN PARA IMPRIMIR LAS RUTAS
// ==========================
function printRoutes(rutas) {
    if (!Array.isArray(rutas)) {
        console.error("Error: 'rutas' no es un array", rutas); // Validar que rutas es un array
        return; // Salir de la función si no es un array
    }

    // Aquí iría la lógica para imprimir las rutas en el DOM, por ejemplo:
    const routesContainer = document.getElementById('rutasList'); // Obtener el contenedor para mostrar las rutas
    routesContainer.innerHTML = ''; // Limpiar el contenedor antes de imprimir nuevas rutas

    // Imprimir cada ruta en el contenedor
    // Suponiendo que routesContainer ya está definido y contiene las rutas
rutas.forEach(ruta => {
    const rutaElement = document.createElement('div'); // Crear un nuevo elemento para la ruta
    rutaElement.style.display = 'flex'; // Usar flexbox para alinear elementos en línea
    rutaElement.style.alignItems = 'center'; // Alinear verticalmente los elementos al centro

    // Crear un texto que muestra la ruta y el monto
    const textoRuta = document.createElement('span');
    textoRuta.textContent = `Ruta: ${ruta.NombreRuta}, Monto: ${ruta.Monto}`; // Establecer el texto del elemento
    rutaElement.appendChild(textoRuta); // Agregar el texto al elemento de ruta

    // Crear botón de Editar
    const editarButton = document.createElement('button');
    editarButton.textContent = 'Editar';
    editarButton.onclick = () => {
        abrirFormularioEdicion(ruta); // Llamar a la función para abrir el formulario
    };
    editarButton.style.marginLeft = '10px'; // Añadir un margen para separar el botón del texto
    rutaElement.appendChild(editarButton); // Agregar el botón de editar

    // Crear botón de Eliminar
    const eliminarButton = document.createElement('button');
    eliminarButton.textContent = 'Eliminar';
    eliminarButton.onclick = () => {
        // Enviar la solicitud AJAX para eliminar
        const data = { accion: 'borrar', rutaid: ruta.IDRuta };
        enviarDatos(data);
    };
    eliminarButton.style.marginLeft = '10px'; // Añadir un margen para separar el botón del texto
    rutaElement.appendChild(eliminarButton); // Agregar el botón de eliminar

    // Agregar el elemento de ruta al contenedor
    routesContainer.appendChild(rutaElement);
});

// Función para abrir el formulario de edición
function abrirFormularioEdicion(ruta) {
    const formulario = document.getElementById('formularioEdicion');
    formulario.querySelector('#nombreRutaInput').value = ruta.NombreRuta; // Prellenar el campo de nombre
    formulario.querySelector('#montoInput').value = ruta.Monto; // Prellenar el campo de monto
    formulario.style.display = 'block'; // Mostrar el formulario
}

// Función para enviar datos al servidor usando fetch
function enviarDatos(data) {
    fetch('controllers/rutasControlador.php', { // Reemplaza 'controllers/rutasControlador.php' con la URL de tu script PHP
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data) // Convertir el objeto a JSON
    })
    .then(response => response.json()) // Esperar la respuesta en JSON
    .then(result => {
        console.log('Respuesta del servidor:', result);

        // Manejar la respuesta del servidor y mostrar la alerta correspondiente
        if (result.status === 'success') {
            Swal.fire(
                'Éxito', // Título de la alerta
                result.message, // Mensaje de la alerta
                'success' // Tipo de alerta
            );
        } else {
            Swal.fire(
                'Error', // Título de la alerta
                result.message, // Mensaje de la alerta
                'error' // Tipo de alerta
            );
        }
    })
    .catch(error => {
        console.error('Error:', error);

        // Mostrar alerta de error en caso de fallo en la conexión o en la solicitud
        Swal.fire(
            'Error', // Título de la alerta
            'Hubo un problema con la conexión al servidor.', // Mensaje de la alerta
            'error' // Tipo de alerta
        );
    });
}

// Función para guardar los cambios
function guardarCambios() {
    const nombreRuta = document.getElementById('nombreRutaInput').value;
    const monto = document.getElementById('montoInput').value;

    const data = { accion: 'editar', nombreRuta: nombreRuta, monto: monto, idruta: IDRuta };
    enviarDatos(data); // Enviar la solicitud AJAX para editar

    cerrarFormulario(); // Cerrar el formulario después de guardar
}

// Función para cerrar el formulario
function cerrarFormulario() {
    const formulario = document.getElementById('formularioEdicion');
    formulario.style.display = 'none'; // Ocultar el formulario
}

}

            
        // Llama a loadRoutes cuando la página se cargue
document.addEventListener('DOMContentLoaded', (event) => {
    loadRoutes(); // Carga las rutas al iniciar la página
});

// Obtiene el nombre de la ruta a partir de su ID
function getRouteNameById(routeId, rutas) {
    const ruta = rutas.find(r => r.IDRuta == routeId); // Busca la ruta por ID
    return ruta ? ruta.NombreRuta : "Ruta no encontrada"; // Retorna el nombre de la ruta o un mensaje de error
}

// Envía un mensaje de WhatsApp con el número y el mensaje especificado
function sendWhatsAppMessageReduced(numero) {
    const mensaje = encodeURIComponent(document.getElementById(`mensaje-${numero}`).value); // Codifica el mensaje
    window.open(`https://wa.me/${numero}?text=${mensaje}`, '_blank'); // Abre WhatsApp con el mensaje
}


// Renderiza la lista de clientes en la tabla
// Renderiza la lista de clientes en la tabla
function renderClients() {        
    // Obtener clientes y todos los calendarios de pagos en paralelo
    const fetchClientes = fetch('controllers/clientesControlador.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'leerclientedetalle' }) 
    }).then(response => response.json());

    const fetchCalendarios = fetch('controllers/clientesControlador.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'leerclienteactivocalendariopago' }) 
    }).then(response => response.json());

    Promise.all([fetchClientes, fetchCalendarios])
        .then(([clients, pagos]) => {
            console.log("Clientes obtenidos:", clients);
            console.log("Pagos obtenidos:", pagos);

            const clientTable = document.getElementById('clientTable');
            if (!clientTable) {
                console.error("Elemento clientTable no encontrado");
                return;
            }

            clientTable.innerHTML = `
                <tbody>
                    ${clients.map(client => {
                        // Filtrar pagos que pertenecen a este cliente
                        const pagosCliente = pagos.filter(pago => pago.id_cliente === client.cliente_id);
                        const diasRestantes = pagosCliente.length > 0 
                            ? calcularDiasRestantes(pagosCliente[pagosCliente.length - 1].fecha_vencimiento)
                            : "Sin pagos";

                        return `
                            <tr class="text-xs">
                                <td class="p-2">${client.cliente_nombre}</td>
                                <td class="p-2">${client.cliente_apellido}</td>
                                <td class="p-2">${client.cliente_telefono}</td>
                                <td class="p-2">${pagosCliente.length}</td>
                                <td class="p-2">${diasRestantes > 0 ? diasRestantes + ' días' : 'Vencido'}</td>
                                <td class="p-2">
                                    <button onclick="editClient(${client.cliente_id})" class="action-button mb-1 text-xs">Editar</button>
                                    <button onclick="deleteClient(${client.cliente_id})" class="action-button mb-1 text-xs">Borrar</button>
                                    <button onclick="finishLoan(${client.cliente_id})" class="action-button text-xs">Terminar</button>
                                    <button onclick="togglePayments(${client.cliente_id})" class="action-button text-xs">Ver Pagos</button>
                                </td>
                            </tr>
                            <tr id="payments-${client.cliente_id}" class="hidden">
                                <td colspan="7">
                                    <div class="p-2 bg-gray-800 rounded">
                                        <h3 class="text-sm font-bold mb-1">Calendario de Pagos</h3>
                                        <table class="w-full text-xs">
                                            <thead>
                                                <tr>
                                                    <th class="p-1 border">Fecha</th>
                                                    <th class="p-1 border">Monto</th>
                                                    <th class="p-1 border">Estado</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                ${pagosCliente.length > 0 ? pagosCliente.map(pago => `
                                                    <tr>
                                                        <td class="p-1 border">${pago.fecha_vencimiento}</td>
                                                        <td class="p-1 border">$${pago.numero_cuota}</td>
                                                        <td class="p-1 border">${pago.Estado}</td>
                                                    </tr>
                                                `).join('') : `<tr><td colspan="3" class="text-center">Sin pagos registrados</td></tr>`}
                                            </tbody>
                                        </table>
                                    </div>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            `;
        })
        .catch(error => console.error('Error al obtener datos:', error));
}

renderClients();

function togglePayments(clientId) {
    const paymentRow = document.getElementById(`payments-${clientId}`);
    if (!paymentRow) return;
    paymentRow.classList.toggle("hidden");
}
       
        /**
 * Función asíncrona para mostrar la ruta más popular en el dashboard.
 * Esta función obtiene todas las rutas y clientes, cuenta cuántos
 * clientes están asociados a cada ruta y determina cuál es la más popular.
 */
async function mostrarRutaMasPopular() {
    try {
        // Obtener rutas desde el controlador mediante una solicitud POST
        const responseRutas = await fetch('controllers/rutasControlador.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // Especificar que el contenido es JSON
            },
            body: JSON.stringify({ accion: 'obtenerRutas' }) // Enviar acción para obtener rutas
        });

        // Verificar si la respuesta fue exitosa
        if (!responseRutas.ok) {
            throw new Error('Error al obtener rutas'); // Lanzar un error si la respuesta no es correcta
        }

        // Convertir la respuesta de rutas a un objeto JSON
        const rutas = await responseRutas.json();

        // Obtener la lista de clientes
        const clients = await getClients(); // Llamar a la función para obtener los clientes

        // Validar que los datos de clientes sean un array
        if (!Array.isArray(clients)) {
            throw new Error('Los datos de clientes no son un array'); // Lanzar un error si no es un array
        }

        const rutaCount = {}; // Objeto para contar la cantidad de clientes por ruta

        // Contar cuántos clientes corresponden a cada ruta
        clients.forEach(client => {
            const rutaId = client.ruta_id; // Obtener el ID de la ruta del cliente
            if (!rutaCount[rutaId]) {
                rutaCount[rutaId] = 0; // Inicializar el contador si no existe
            }
            rutaCount[rutaId]++; // Incrementar el contador de la ruta
        });

        // Inicializar variables para encontrar la ruta más popular
        let maxClientes = 0; // Contador máximo de clientes
        let rutaMasPopular = ''; // Nombre de la ruta más popular

        // Iterar sobre el objeto de conteo de rutas para encontrar la más popular
        for (const rutaId in rutaCount) {
            if (rutaCount[rutaId] > maxClientes) {
                maxClientes = rutaCount[rutaId]; // Actualizar el número máximo de clientes
                rutaMasPopular = getRouteNameById(rutaId, rutas); // Obtener el nombre de la ruta correspondiente
            }
        }
        updateTotalRutas(rutas.length);
        // Mostrar la ruta más popular en el elemento correspondiente en el DOM
        const rutaMasPopularElement = document.getElementById('rutaMasPopular');
        rutaMasPopularElement.textContent = `Ruta: ${rutaMasPopular} (N° Clientes: ${maxClientes})`;
    } catch (error) {
        console.error('Error en mostrarRutaMasPopular:', error); // Manejar cualquier error ocurrido
    }
}

mostrarRutaMasPopular();

/**
 * Función para actualizar el total de rutas en el dashboard.
 * Esta función cambia el texto del elemento especificado con el nuevo total.
 * @param {number} total - El número total de rutas a mostrar.
 */
function updateTotalRutas(total) {
    document.getElementById('totalRutas').innerText = total; // Cambiar el texto del elemento con el nuevo total
}

/**
 * Función para enviar un mensaje a través de WhatsApp a un cliente específico.
 * Esta función construye la URL de WhatsApp con el número del cliente y el mensaje
 * proporcionado en el campo de entrada asociado.
 * @param {number} clientId - El ID del cliente al que se le enviará el mensaje.
 */
function sendWhatsAppMessage(clientId) {
    const client = getClients().find(c => c.id === clientId); // Buscar el cliente por ID
    if (!client) return; // Salir si no se encuentra el cliente

    const message = encodeURIComponent(document.getElementById(`mensaje-${clientId}`).value); // Obtener y codificar el mensaje
    const whatsappUrl = `https://wa.me/${client.numero}?text=${message}`; // Construir la URL de WhatsApp
    window.open(whatsappUrl, '_blank'); // Abrir la URL en una nueva pestaña
}

/**
 * Función asíncrona para renderizar los préstamos finalizados en una tabla.
 * Esta función obtiene los préstamos finalizados del servidor y los muestra en la interfaz.
 */
async function renderFinishedLoans() {
    try {
        // Hacer una solicitud POST para obtener los préstamos finalizados
        const response = await fetch('controllers/clientesControlador.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // Establecer tipo de contenido a JSON
            },
            body: JSON.stringify({ accion: "leerclientesinactivosdetalles" }) // Acción para obtener detalles de préstamos
        });

        // Convertir la respuesta en JSON
        const data = await response.json();

        // Asegurarse de que `data` es un array
        const loans = Array.isArray(data) ? data : []; // Usar un array vacío si no es un array

        // Advertencia si no hay préstamos finalizados
        if (loans.length === 0) {
            console.warn("No hay préstamos finalizados.");
        }

        // Renderizar la tabla con la respuesta del servidor
        document.getElementById('finishedLoansTable').innerHTML = loans.map(loan => `
            <tr>
                <td class="p-2">${loan.nombre}</td>
                <td class="p-2">${loan.apellido}</td>
                <td class="p-2">${loan.correo}</td>
                <td class="p-2">$${parseFloat(loan.monto).toFixed(2)}</td>
                <td class="p-2">${loan.fecha_finalizacion || 'No disponible'}</td>
            </tr>
        `).join(''); // Usar map para crear las filas de la tabla

    } catch (error) {
        console.error('Error al obtener los préstamos finalizados:', error); // Manejar cualquier error ocurrido
    }
}

renderFinishedLoans();
/**
 * Función para calcular los días restantes hasta la fecha del último pago.
 * @param {string} fechaUltimoPago - La fecha del último pago en formato de cadena.
 * @returns {number} - El número de días restantes hasta el último pago.
 */
function calcularDiasRestantes(fechaUltimoPago) {
    const hoy = new Date(); // Obtener la fecha actual
    const ultimoPago = new Date(fechaUltimoPago); // Convertir la fecha del último pago a objeto Date
    const diferencia = ultimoPago.getTime() - hoy.getTime(); // Calcular la diferencia en milisegundos
    return Math.ceil(diferencia / (1000 * 3600 * 24)); // Devolver la diferencia en días
}

/**
 * Función para editar la información de un cliente.
 * Esta función abre un modal con la información del cliente que se desea editar.
 * @param {number} id - El ID del cliente a editar.
 */
function editClient(id) {
    const clients = getClients(); // Obtener la lista de clientes
    const client = clients.find(c => c.id === id); // Buscar el cliente por ID
    if (client) {
        // Rellenar los campos del modal con la información del cliente
        $('editId').value = client.id;
        $('editNombre').value = client.nombre;
        $('editApellido').value = client.apellido;
        $('editNumero').value = client.numero;
        $('editCorreo').value = client.correo;
        $('editDireccion').value = client.direccion;
        $('editMonto').value = client.monto;
        $('editCuotas').value = client.cuotas;
        $('editMensaje').value = client.mensaje;
        $('editModal').classList.remove('hidden'); // Mostrar el modal
        $('editModal').classList.add('flex'); // Cambiar clase para que sea visible
    }
}

/**
 * Función para editar un préstamo finalizado.
 * Esta función abre un modal con la información del préstamo que se desea editar.
 * @param {number} id - El ID del préstamo a editar.
 */
function editFinishedLoan(id) {
    const finishedLoans = getFinishedLoans(); // Obtener la lista de préstamos finalizados
    const loan = finishedLoans.find(l => l.id === id); // Buscar el préstamo por ID
    if (loan) {
        // Rellenar los campos del modal con la información del préstamo
        $('editId').value = loan.id;
        $('editNombre').value = loan.nombre;
        $('editApellido').value = loan.apellido;
        $('editNumero').value = loan.numero;
        $('editCorreo').value = loan.correo;
        $('editDireccion').value = loan.direccion;
        $('editMonto').value = loan.monto;
        $('editCuotas').value = loan.cuotas;
        $('editMensaje').value = loan.mensaje;
        $('editModal').classList.remove('hidden'); // Mostrar el modal
        $('editModal').classList.add('flex'); // Cambiar clase para que sea visible
    }
}

/**
 * Función para cerrar el modal de edición.
 * Esta función oculta el modal y restablece su estado.
 */
function closeEditModal() {
    $('editModal').classList.add('hidden'); // Ocultar el modal
    $('editModal').classList.remove('flex'); // Cambiar clase para que no sea visible
}



        // ==========================
// EVENTOS PARA CUANDO EL DOCUMENTO ESTÉ CARGADO
// ==========================

// Función para obtener la lista de clientes desde el servidor.
// Esta función realiza una solicitud POST al controlador de clientes para obtener los detalles de todos los clientes.
// Devuelve una promesa que se resuelve con la respuesta en formato JSON o un arreglo vacío en caso de error.
function getClients() {
    return fetch('controllers/clientesControlador.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ accion: 'leerclientedetalle' })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al obtener clientes');
        }
        return response.json();
    })
    .catch(error => {
        console.error('Error en getClients:', error);
        return [];
    });
}

// Función para obtener la lista de préstamos terminados.
// Realiza una solicitud POST al controlador de clientes para obtener los detalles de los préstamos que ya han finalizado.
// Devuelve una promesa que se resuelve con la respuesta en formato JSON o un arreglo vacío en caso de error.
function getFinishedLoans() {
    return fetch('controllers/clientesControlador.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ accion: 'leerclientesinactivosdetalles' })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al obtener préstamos vencidos');
        }
        return response.json();
    })
    .catch(error => {
        console.error('Error en getFinishedLoans:', error);
        return [];
    });
}

// Función asíncrona para actualizar el gráfico de préstamos.
// Esta función obtiene los clientes mediante getClients, verifica los datos recibidos, 
// y luego crea o actualiza un gráfico de barras que muestra los montos de los préstamos de cada cliente.
async function updatePrestamosChart() {
    try {
        const clients = await getClients(); // Espera a que se obtengan los clientes

        // Verifica si la respuesta es un arreglo y tiene elementos
        if (!Array.isArray(clients) || clients.length === 0) {
            console.error("No se recibieron datos válidos de clientes:", clients);
            return;
        }

        const ctx = document.getElementById('prestamosChart').getContext('2d');

        // Si el gráfico ya existe, destrúyelo antes de crear uno nuevo
        if (prestamosChart) {
            prestamosChart.destroy();
        }

        // Crea un nuevo gráfico de barras con los datos de los préstamos
        prestamosChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: clients.map(client => `${client.cliente_nombre} ${client.cliente_apellido}`),
                datasets: [{
                    label: 'Monto del Préstamo',
                    data: clients.map(client => parseFloat(client.prestamo_monto)),
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
    } catch (error) {
        console.error("Error al obtener los clientes:", error);
    }
}

// Función asíncrona para actualizar el gráfico de clientes activos y terminados.
// Obtiene tanto los clientes activos como los préstamos terminados, y crea un gráfico de torta que 
// representa la proporción de préstamos activos frente a los terminados.
async function updateClientesChart() {
    try {
        // Esperamos a que se resuelvan las promesas
        const clients = await getClients(); 
        const finishedLoans = await getFinishedLoans();
        
        const ctx = document.getElementById('clientesChart').getContext('2d');
        
        // Verificamos si el gráfico ya existe para destruirlo antes de crear uno nuevo
        if (clientesChart) {
            clientesChart.destroy();
        }

        // Creamos el gráfico con los datos obtenidos
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
    } catch (error) {
        console.error('Error al actualizar el gráfico de clientes:', error);
    }
}

// Llama a las funciones para inicializar los gráficos al cargar el documento
document.addEventListener('DOMContentLoaded', () => {
    updateClientesChart();
    updatePrestamosChart();
    renderPagosVencidos(); // Llama a la función para renderizar los pagos vencidos
});

// Función asíncrona para renderizar los pagos vencidos en la interfaz.
// Obtiene los pagos vencidos desde el servidor y genera una tabla en HTML 
// para mostrar la información de cada pago atrasado.
async function renderPagosVencidos() {
    try {
        // Obtener pagos vencidos desde el servidor
        const response = await fetch('controllers/clientesControlador.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ accion: 'leerclientespagosatrasados' })
        });

        const data = await response.json();

        // Si la respuesta es un array, no necesitas verificar 'success' ni 'pagos'
        if (!Array.isArray(data)) throw new Error('Datos mal formateados');

        // Usamos el array directamente
        const pagosVencidos = data;

        // Generar la tabla con los datos obtenidos
        const tablaVencidos = pagosVencidos.map(pago => `
            <tr>
                <td class="p-2">${pago.cliente_nombre}</td>
                <td class="p-2">${pago.cliente_apellido}</td>
                <td class="p-2">$${parseFloat(pago.montopago).toFixed(2)}</td>
                <td class="p-2">${pago.cuota_mora}</td> <!-- Puedes cambiar esto según el campo -->
                <td class="p-2">$${parseFloat(pago.monto_total).toFixed(2)}</td>
                <td class="p-2">${pago.dias_retraso}</td>
                <td class="p-2">
                    <button onclick="deleteLatePayment(${pago.id})" class="action-button">Eliminar</button>
                </td>
            </tr>
        `).join('');

        // Actualizar las tablas con los datos renderizados
        document.getElementById('pagosVencidosTable').innerHTML = tablaVencidos;
        document.getElementById('multasRecargosTable').innerHTML = tablaVencidos;

    } catch (error) {
        console.error('Error al obtener los pagos vencidos:', error);
    }
}

// Función asíncrona para eliminar un pago vencido.
// Envía una solicitud al servidor para eliminar un pago específico 
// y sincroniza los pagos vencidos después de la eliminación.
async function deleteLatePayment(id) {
    const response = await fetch('eliminar_pago_vencido.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
    });

    const data = await response.json();
    if (data.success) {
        syncPagosVencidosConServidor(); // Actualiza la lista de pagos vencidos
    }
}

// Función para renderizar los recordatorios de pago en la interfaz.
// Carga la configuración de recordatorios y muestra los próximos recordatorios de pago.
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

// Función para calcular los próximos recordatorios de pago.
// Esta función toma la configuración de recordatorios y verifica las fechas de pago
// de los clientes para determinar cuáles son los próximos recordatorios a mostrar.
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
                monto: client.monto,
                fecha: fecha.toLocaleDateString()
            }))
    );
}

        
    // ==========================
// EVENTOS PARA CUANDO EL DOCUMENTO ESTÉ CARGADO
// ==========================

/**
 * Muestra los detalles del préstamo y solicita el nombre del cobrador.
 * 
 * @param id - ID del préstamo que se desea visualizar.
 */
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

/**
 * Genera y muestra la factura del préstamo.
 * 
 * @param loan - Objeto que representa el préstamo.
 * @param cobrador - Nombre del cobrador asignado.
 */
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

/**
 * Imprime la factura generada.
 */
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

// ==========================
// EVENTO PARA ELIMINAR UN PRÉSTAMO FINALIZADO
// ==========================

/**
 * Elimina un préstamo finalizado después de confirmar la acción.
 * 
 * - ID del préstamo a eliminar.
 */
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

// ==========================
// RENDERIZAR ANÁLISIS DE RIESGO
// ==========================

/**
 * Renderiza el análisis de riesgo de los clientes obteniendo datos del servidor.
 */
async function renderAnalisisRiesgo() {
    try {
        // Obtener datos de análisis de riesgo desde el servidor
        const response = await fetch('controllers/clientesControlador.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ accion: 'leeranalisisriesgo' })
        });

        const data = await response.json();

        // Ajustar esta línea para verificar 'status' en lugar de 'success'
        if (data.status !== 'success') throw new Error(data.message || 'Error desconocido');

        // Función para calcular el porcentaje de riesgo
        function calcularPorcentajeRiesgo(cuotasIniciales, cuotasAtrasadas) {
            const puntosAFavor = cuotasAtrasadas * 10; // Restar 8 puntos por cada cuota atrasada
            const porcentajeRiesgo = Math.max(0, 100 - puntosAFavor);
            // Asegurarse de que el porcentaje no supere el 100%
            return Math.min(100, porcentajeRiesgo);
        }

        // Generar la tabla con los datos obtenidos
        $('riskAnalysisTable').innerHTML = data.analisis.map(client => {
            // Calcular el porcentaje de riesgo para cada cliente
            const porcentajeRiesgo = calcularPorcentajeRiesgo(client.cuotas, client.cuotasAtrasadas);

            const rowClass = porcentajeRiesgo <= 70 ? 'text-red-500' : '';
            return `
                <tr class="${rowClass}">
                    <td class="p-2">${client.nombre}</td>
                    <td class="p-2">${client.apellido}</td>
                    <td class="p-2">${client.cuotas}</td>
                    <td class="p-2">${client.cuotasAtrasadas}</td>
                    <td class="p-2">${porcentajeRiesgo.toFixed(2)}%</td>
                </tr>
            `;
        }).join('');

    } catch (error) {
        console.error('Error al obtener el análisis de riesgo:', error);
    }
}

 
// ==========================
// CALCULAR PORCENTAJE DE RIESGO
// ==========================

/**
 * Calcula el porcentaje de riesgo de un cliente basado en las cuotas iniciales y las cuotas atrasadas.
 * 
 * @param {number} cuotasIniciales - Total de cuotas iniciales del préstamo.
 * @param {number} cuotasAtrasadas - Total de cuotas que están atrasadas.
 * @returns {number} - Porcentaje de riesgo calculado, limitado a un máximo de 100.
 */
function calcularPorcentajeRiesgo(cuotasIniciales, cuotasAtrasadas) {
    // Se multiplica el número de cuotas atrasadas por 10 para calcular los puntos en contra
    const puntosAFavor = cuotasAtrasadas * 10; // Restar 10 puntos por cada cuota atrasada

    // Se calcula el porcentaje de riesgo, asegurando que no sea menor a 0
    const porcentajeRiesgo = Math.max(0, 100 - puntosAFavor);
    // Asegurarse de que el porcentaje no supere el 100%
    return Math.min(100, porcentajeRiesgo); // Retornar el porcentaje de riesgo limitado a 100
}

// ==========================
// EVENTOS PARA FORMULARIOS
// ==========================

// Se añaden eventos a los formularios para gestionar la creación y edición de clientes
$('clientForm').addEventListener('submit', addClient); // Evento para añadir un nuevo cliente
$('editForm').addEventListener('submit', saveEdit); // Evento para guardar los cambios de edición de un cliente
$('recordatoriosForm').addEventListener('submit', saveRecordatoriosConfig); // Evento para guardar la configuración de recordatorios

// ==========================
// RENDERIZAR CLIENTES Y PRESTAMOS
// ==========================

// Llamadas a las funciones para renderizar la lista de clientes y préstamos finalizados al cargar la página
renderClients(); // Renderizar la lista de clientes
renderFinishedLoans(); // Renderizar la lista de préstamos finalizados
updateDashboard(); // Actualizar el tablero de control
showSection('dashboard'); // Mostrar la sección del tablero de control

// ==========================
// RENDERIZAR CALENDARIO DE PAGOS
// ==========================

/**
 * Renderiza los próximos pagos y los pagos vencidos en el calendario de pagos.
 */
function renderCalendarioPagos() {
    renderProximosPagos(); // Renderizar los próximos pagos
    renderPagosVencidos(); // Renderizar los pagos que ya están vencidos
}

// ==========================
// RENDERIZAR PRÓXIMOS PAGOS
// ==========================

/**
 * Obtiene y renderiza los próximos pagos desde el servidor.
 */
async function renderProximosPagos() {
    try {
        // Obtener los datos de los próximos pagos desde el servidor
        const response = await fetch('controllers/clientesControlador.php', {
            method: 'POST', // Método de la solicitud
            headers: {
                'Content-Type': 'application/json' // Tipo de contenido
            },
            body: JSON.stringify({ accion: 'leerclienteactivocalendariopago' }) // Cuerpo de la solicitud con la acción deseada
        });

        // Verificar si la respuesta es exitosa
        if (!response.ok) {
            throw new Error('No se pudo obtener los datos'); // Lanzar un error si la respuesta no es ok
        }

        // Convertir la respuesta a JSON
        const data = await response.json();

        // Verificar si la respuesta tiene éxito y los datos esperados
        if (!Array.isArray(data) || data.length === 0) {
            throw new Error('No se recibieron datos válidos o no hay pagos próximos'); // Lanzar error si no hay datos válidos
        }

        // Generar la tabla con los datos obtenidos
        document.getElementById('proximosPagosTable').innerHTML = data.map(pago => `
            <tr>
                <td class="p-2">${pago.Nombre} ${pago.Apellido}</td> <!-- Nombre del cliente -->
                <td class="p-2">${pago.fecha_vencimiento}</td> <!-- Fecha de vencimiento del pago -->
                <td class="p-2">${pago.numero_cuota}</td> <!-- Número de cuota -->
                <td class="p-2">${pago.Estado}</td> <!-- Estado del pago -->
                <td class="p-2">${pago.dias_faltantes}</td> <!-- Días restantes para el pago -->
                <td class="p-2">
                    <button onclick="deletePayment(${pago.Id})" class="action-button">Eliminar</button> <!-- Botón para eliminar el pago -->
                </td>
            </tr>
        `).join(''); // Convertir el array de pagos en filas de tabla

    } catch (error) {
        console.error('Error al obtener los próximos pagos:', error); // Manejo de errores
    }
}

// ==========================
// MOSTRAR PRESTAMOS VENCIDOS
// ==========================

// Llamar a la función para mostrar la cantidad de préstamos vencidos cuando se carga el dashboard
mostrarPrestamosVencidos(); // Mostrar préstamos vencidos al cargar el dashboard

// ==========================
// ACTUALIZAR INFORMACIÓN CADA MINUTO
// ==========================

// Configurar un intervalo para renderizar información cada minuto
setInterval(() => {
    renderClients(); // Renderizar la lista de clientes
    renderCalendarioPagos(); // Renderizar el calendario de pagos
    renderAnalisisRiesgo(); // Renderizar el análisis de riesgo
}, 60000); // Intervalo de 60000 ms (1 minuto)





