// Aqui estaran todas las funciones de Js que hacen que la pagina funcione. No borrar nada sin previo aviso.

// Variables globales
// ###############################################################################
// ###############################################################################

let prestamo = {};
let tablaAmortizacion = [];

// Funcion que calcula el interes por mora de los pagos vencidos..
        let prestamosChart, clientesChart;
        const INTERES_POR_MORA = 0.05;
        let pagosVencidos = JSON.parse(localStorage.getItem('pagosVencidos')) || [];
        let multasChart, recargosChart;
        let configuracionRecordatorios = JSON.parse(localStorage.getItem('configuracionRecordatorios')) || {
            diasAnticipacion: 3,
            metodos: ['email']
        };

        function verificarPagosVencidos() {
            const clients = getClients();
            const hoy = new Date().toISOString().split('T')[0]; // Fecha actual en formato YYYY-MM-DD
        
            clients.forEach(client => {
                client.fechasPago.forEach((fecha, index) => {
                    if (fecha < hoy) { // Si la fecha de pago ya pasó
                        let montoVencido = client.montoPorCuota * (1 + INTERES_POR_MORA); // Aplica interés
                        let pagoVencido = {
                            id: client.id,
                            nombre: client.nombre,
                            apellido: client.apellido,
                            montoOriginal: client.montoPorCuota,
                            montoConMora: montoVencido.toFixed(2),
                            fechaVencimiento: fecha,
                            diasAtraso: Math.floor((new Date(hoy) - new Date(fecha)) / (1000 * 60 * 60 * 24)) // Días de atraso
                        };
        
                        // Evita agregar duplicados en la lista de pagos vencidos
                        if (!pagosVencidos.some(p => p.id === client.id && p.fechaVencimiento === fecha)) {
                            pagosVencidos.push(pagoVencido);
                        }
                    }
                });
            });
        
            savePagosVencidos(); // Guarda la lista en localStorage
            renderPagosVencidos(); // Actualiza la UI
        }

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
// ###############################################################################
// Función para agregar un nuevo cliente (Super importantes esta funcion)...
/// Función para agregar un nuevo cliente.
// ###############################################################################
function addClient(e) {
    e.preventDefault();
    
    const cuotas = parseInt(document.getElementById('cuotas').value);
    if (cuotas > 12) {
        Swal.fire('Error', 'El número máximo de cuotas es 12', 'error');
        return;
    }

    const clients = getClients();
    const monto = parseFloat(document.getElementById('monto').value);
    if (isNaN(monto) || monto <= 0) {
        Swal.fire('Error', 'El monto debe ser un número positivo', 'error');
        return;
    }

    const montoPorCuota = monto / cuotas;
    const frecuenciaCobro = document.getElementById('frecuenciaCobro').value;  // Obtener frecuencia de cobro

    // Generar fechas dinámicamente
    const fechasPago = calcularFechasPago(new Date(), cuotas, frecuenciaCobro);
    
    const newClient = {
        id: Date.now(),
        nombre: document.getElementById('nombre').value,
        apellido: document.getElementById('apellido').value,
        numero: document.getElementById('numero').value,
        correo: document.getElementById('correo').value || 'No proporcionado',
        direccion: document.getElementById('direccion').value,
        fechaPrestamo: new Date().toISOString().split('T')[0],
        monto: monto,
        cuotas: cuotas,
        montoPorCuota: montoPorCuota,
        fechasPago: fechasPago,  // Fechas adaptadas a la frecuencia de cobro
        ruta: document.getElementById('ruta').value,
        mensaje: document.getElementById('mensaje').value,
        interesMora: parseFloat(document.getElementById('interesMora').value) || 0,
        frecuenciaCobro: frecuenciaCobro
    };

    // Guardar en local y actualizar UI
    clients.push(newClient);
    saveClients(clients);
    document.getElementById('clientForm').reset();
    renderClients(); // Asegúrate de que esto esté después de guardar el cliente
    updateDashboard();
    Swal.fire('Éxito', 'Cliente registrado correctamente', 'success');
    showSection('prestamos');
    
    // Agregar la etiqueta 'accion' al objeto newClient
    newClient.accion = 'guardar';
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
            Swal.fire('Error', 'Hubo un problema con la conexión al servidor.', 'error');
        }
    })
    .catch(error => {
        Swal.fire('Error', 'Hubo un problema con la conexión al servidor.', 'error');
        console.error('Error:', error);
    });
}
// Funcion para poder calcular las fechas pago...
function calcularFechasPago(fechaInicio, cuotas, frecuencia) {
    let fechas = [];
    let fecha = new Date(fechaInicio);

    for (let i = 0; i < cuotas; i++) {
        switch (frecuencia) {
            case "diario":
                fecha.setDate(fecha.getDate() + 1);
                break;
            case "semanal":
                fecha.setDate(fecha.getDate() + 7);
                break;
            case "mensual":
                fecha.setMonth(fecha.getMonth() + 1);
                break;
            case "anual":
                fecha.setFullYear(fecha.getFullYear() + 1);
                break;
            default:
                fecha.setMonth(fecha.getMonth() + 1); // Por defecto, mensual
        }
        fechas.push(new Date(fecha).toISOString().split('T')[0]); // Guardar en formato YYYY-MM-DD
    }

    return fechas;
}
// Función para abrir el formulario de edición...
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
                    accion: "guardar" // Cambiar a "escritura" o "lectura" según sea necesario 
                };
        
                // Enviar datos a PHP usando fetch
                fetch("controllers/rutasControlador.php", {
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
        // Funcion para llamar a las rutas..
        function CallRoutes() {
            const rutaData = {
                accion: 'obtenerRutas' // Clave de acción
            };
        
            fetch('controllers/rutasControlador.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(rutaData)
            })
            .then(response => response.json())
            .then(rutas => {
                console.log(rutas); // Depuración: imprime los datos recibidos
                printRoutes(rutas); // Llama a la función para imprimir las rutas
            })
            .catch(error => console.error('Error al enviar la solicitud:', error));
        }

    function loadRoutes() {
        fetch('controllers/rutasControlador.php',
            {
                method: 'POST', // o 'GET', dependiendo de lo que necesites
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    accion: 'obtenerRutas'
                })
            })
            .then(response => response.json())
            .then(rutas => {
                const rutasSelect = document.getElementById('ruta');
                rutasSelect.innerHTML = ''; // Limpiar las opciones existentes
    
                // Agregar la opción predeterminada
                const defaultOption = document.createElement('option');
                defaultOption.value = '';
                defaultOption.disabled = true;
                defaultOption.selected = true;
                defaultOption.textContent = 'Selecciona una ruta';
                rutasSelect.appendChild(defaultOption);
    
                // Agregar la opción duplicada
                const duplicateOption = document.createElement('option');
                duplicateOption.value = '';
                duplicateOption.textContent = 'Selecciona una ruta';
                rutasSelect.appendChild(duplicateOption);
    
                // Agregar opciones para cada ruta
                rutas.forEach(ruta => {
                    const option = document.createElement('option');
                    option.value = ruta.IDRuta; // Usar IDRuta como valor de la opción
                    option.textContent = `Nombre: ${ruta.NombreRuta}, Monto: ${ruta.Monto}`;
                    rutasSelect.appendChild(option);
                });
    
                // Llamar a printRoutes para mostrar las rutas
                printRoutes(rutas);
            })
            .catch(error => console.error('Error al cargar las rutas:', error));
    }
    
    function printRoutes(rutas) {
        if (!Array.isArray(rutas)) {
            console.error("Error: 'rutas' no es un array", rutas);
            return;
        }
    
        const rutasList = document.getElementById("rutasList");
        rutasList.innerHTML = ""; // Limpiar antes de agregar nuevas rutas
    
        rutas.forEach(ruta => {
            const li = document.createElement("li");
            li.className = "bg-gray-800 p-2 rounded mt-2";
            li.textContent = `Ruta: ${ruta.NombreRuta || "Sin nombre"} - Fondos: ${ruta.Monto || "0"}`;
            rutasList.appendChild(li);
        });
    }
    
        
        
        // Llama a CallRoutes para probar la funcionalidad
        CallRoutes();
        
        // Llama a loadRoutes cuando la página se cargue
        document.addEventListener('DOMContentLoaded', (event) => {
            loadRoutes();
        });
        
        
        
        function getRouteNameById(routeId, rutas) {
            const ruta = rutas.find(r => r.IDRuta == routeId);
            return ruta ? ruta.NombreRuta : "Ruta no encontrada";
        }
        
        function sendWhatsAppMessageReduced(numero) {
            const mensaje = encodeURIComponent($(`mensaje-${numero}`).value);
            window.open(`https://wa.me/${numero}?text=${mensaje}`, '_blank');
        }
        
        function renderClients() {
            const clients = getClients();
            console.log("Clientes obtenidos:", clients); // Verifica si hay clientes
        
            fetch('controllers/rutasControlador.php',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        accion: 'obtenerRutas'
                    })
                })
                .then(response => response.json())
                .then(rutas => {
                    console.log("Rutas obtenidas:", rutas); // Verifica si las rutas se obtienen correctamente
        
                    updateTotalRutas(rutas.length);
        
                    const clientTable = document.getElementById('clientTable');
                    if (!clientTable) {
                        console.error("Elemento clientTable no encontrado");
                        return;
                    }
        
                    clientTable.innerHTML = `
                        <tbody>
                            ${clients.map(client => {
                                const diasRestantes = calcularDiasRestantes(client.fechasPago[client.fechasPago.length - 1]);
                                const rutaNombre = getRouteNameById(client.ruta, rutas);
        
                                return `
                                    <tr class="text-xs">
                                        <td class="p-2">${client.nombre}</td>
                                        <td class="p-2">${client.apellido}</td>
                                        <td class="p-2">${client.numero}</td>
                                        <td class="p-2">${rutaNombre}</td>
                                        <td class="p-2">$${client.monto.toFixed(2)}</td>
                                        <td class="p-2">${client.cuotas}</td>
                                        <td class="p-2">${client.fechasPago.join(',<br> ')}</td>
                                        <td class="p-2">${diasRestantes > 0 ? diasRestantes + ' días' : 'Vencido'}</td>
                                        <td class="p-2">
                                            <button onclick="editClient(${client.id})" class="action-button mb-1 text-xs">Editar</button>
                                            <button onclick="deleteClient(${client.id})" class="action-button mb-1 text-xs">Borrar</button>
                                            <button onclick="finishLoan(${client.id})" class="action-button text-xs">Terminar</button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    `;
        
                    // Tabla reducida dividida por rutas
                    const clientTableReducedContainer = document.getElementById('clientTableReducedContainer');
                    if (!clientTableReducedContainer) {
                        console.error("Elemento clientTableReducedContainer no encontrado");
                        return;
                    }
        
                    const clientsByRoute = {};
                    clients.forEach(client => {
                        const rutaNombre = getRouteNameById(client.ruta, rutas);
                        if (!clientsByRoute[rutaNombre]) {
                            clientsByRoute[rutaNombre] = [];
                        }
                        clientsByRoute[rutaNombre].push(client);
                    });
        
                    let reducedTablesHTML = '';
                    Object.keys(clientsByRoute).forEach(ruta => {
                        reducedTablesHTML += `
                            <div class="mb-5">
                                <h2 class="text-lg font-bold mb-2">Ruta: ${ruta}</h2>
                                <table class="w-full border-collapse">
                                    <thead>
                                        <tr>
                                            <th class="p-2 border">Nombre</th>
                                            <th class="p-2 border">Apellido</th>
                                            <th class="p-2 border">Teléfono</th>
                                            <th class="p-2 border">Monto Final</th>
                                            <th class="p-2 border">Ruta</th>
                                            <th class="p-2 border">Dirección</th>
                                            <th class="p-2 border">WhatsApp Mensaje</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    ${clientsByRoute[ruta].map(client => {
                                        // Asegúrate de que el interés sea un número y maneja el caso donde no esté definido
                                        const interes = parseFloat(client.interesMora) || 0; // Usar interesMora en lugar de interes
                                        const monto = parseFloat(client.monto) || 0; // Asegúrate de que el monto también sea un número
                                        const montoFinal = monto + (monto * (interes / 100)); // Calcula el monto final incluyendo el interés
        
                                        return `
                                            <tr class="text-sm">
                                                <td class="p-2 border">${client.nombre}</td>
                                                <td class="p-2 border">${client.apellido}</td>
                                                <td class="p-2 border">${client.numero}</td>
                                                <td class="p-2 border">$${montoFinal.toFixed(2)}</td>
                                                <td class="p-2 border">${ruta}</td>
                                                <td class="p-2 border">${client.direccion}</td>
                                                <td class="p-2 border">
                                                    <input type="text" id="mensaje-${client.numero}" class="p-1 w-28 text-xs bg-gray-700 rounded" placeholder="Mensaje">
                                                    <button onclick="sendWhatsAppMessageReduced(${client.numero})" class="bg-green-600 text-white text-xs px-2 py-1 rounded">Enviar</button>
                                                </td>
                                            </tr>
                                        `;
                                    }).join('')}
                                    
                                    </tbody>
                                </table>
                            </div>
                        `;
                    });
        
                    clientTableReducedContainer.innerHTML = reducedTablesHTML;
                })
                .catch(error => console.error('Error al obtener rutas:', error));
        }
             
        function mostrarRutaMasPopular() {
            const rutaData = {
                accion: 'obtenerRutas' // Clave de acción
            };
        
            fetch('controllers/rutasControlador.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(rutaData) // Enviar datos al servidor
            })
            .then(response => response.json())
            .then(rutas => {
                const clients = getClients();
                const rutaCount = {};
        
                // Contar los clientes por ruta
                clients.forEach(client => {
                    const rutaId = client.ruta;
                    if (!rutaCount[rutaId]) {
                        rutaCount[rutaId] = 0;
                    }
                    rutaCount[rutaId]++;
                });
        
                // Encontrar la ruta con más clientes
                let maxClientes = 0;
                let rutaMasPopular = '';
        
                for (const rutaId in rutaCount) {
                    if (rutaCount[rutaId] > maxClientes) {
                        maxClientes = rutaCount[rutaId];
                        rutaMasPopular = getRouteNameById(rutaId, rutas); // Obtener el nombre de la ruta
                    }
                }
        
                // Mostrar la ruta más popular en el cuadro
                const rutaMasPopularElement = document.getElementById('rutaMasPopular');
                rutaMasPopularElement.textContent = `Ruta: ${rutaMasPopular} (N° Clientes: ${maxClientes})`;
            })
            .catch(error => console.error('Error al obtener rutas:', error));
        }
        
        // Llamar a la función para mostrar la ruta más popular cuando se carga el dashboard
        mostrarRutaMasPopular();     
        // Función para actualizar el total de rutas
        function updateTotalRutas(total) {
            document.getElementById('totalRutas').innerText = total; // Cambiar a un nuevo ID
        }

function sendWhatsAppMessage(clientId) {
    const client = getClients().find(c => c.id === clientId);
    if (!client) return;

    const message = encodeURIComponent(document.getElementById(`mensaje-${clientId}`).value);
    const whatsappUrl = `https://wa.me/${client.numero}?text=${message}`;
    window.open(whatsappUrl, '_blank');
}

async function renderFinishedLoans() {
    try {
        const response = await fetch('controllers/clientesControlador.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ accion: "leerclientesinactivosdetalles" })
        });

        const data = await response.json();

        // `data` ya es un array, lo usamos directamente
        const loans = Array.isArray(data) ? data : [];

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
        `).join('');

    } catch (error) {
        console.error('Error al obtener los préstamos finalizados:', error);
    }
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
                    const finishedLoans = getFinishedLoans(); // Obtiene los préstamos terminados
                    const index = finishedLoans.findIndex(l => l.id === id); // Encuentra el índice del préstamo
        
                    if (index !== -1) {
                        const loan = finishedLoans[index]; // Obtiene el préstamo encontrado
                        delete loan.fechaFinalizacion; // Elimina la fecha de finalización
                        const clients = getClients(); // Obtiene la lista de clientes
                        clients.push(loan); // Agrega el préstamo devuelto a la lista de clientes
                        saveClients(clients); // Guarda la lista actualizada de clientes
                        finishedLoans.splice(index, 1); // Elimina el préstamo de la lista de terminados
                        saveFinishedLoans(finishedLoans); // Guarda la lista actualizada de préstamos terminados
                        renderClients(); // Actualiza la tabla de clientes activos
                        renderFinishedLoans(); // Actualiza la tabla de préstamos terminados
                        updateDashboard(); // Actualiza el dashboard
                        Swal.fire('Éxito', 'Préstamo devuelto a activos', 'success');
                    } else {
                        Swal.fire('Error', 'No se encontró el préstamo para devolver.', 'error');
                    }
                }
            });
        }

        function updateDashboard() {
            const clients = getClients(); // Obtén la lista actual de clientes activos
            const totalPrestamos = clients.reduce((sum, client) => sum + client.monto, 0);
            
            $('totalPrestamos').textContent = `$${totalPrestamos.toFixed(2)}`;
            $('clientesActivos').textContent = clients.length;
            $('prestamosPendientes').textContent = clients.length; // Este campo puede necesitar ajuste
            $('currentDate').textContent = new Date().toLocaleDateString();
        
            updatePrestamosChart(); // Asegúrate de que estas funciones existan
            updateClientesChart();
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
                            fechaFinalizacion: new Date().toISOString().split('T')[0] // Fecha de finalización
                        };
        
                        // Actualizar la lista de préstamos terminados
                        const finishedLoans = getFinishedLoans();
                        finishedLoans.push(finishedLoan);
                        saveFinishedLoans(finishedLoans);
        
                        // Eliminar el cliente de los activos
                        clients.splice(index, 1);
                        saveClients(clients);
        
                        // Re-renderizar ambas tablas
                        renderClients(); // Actualizar la tabla de clientes activos
                        renderFinishedLoans(); // Actualizar la tabla de préstamos terminados
        
                        // Actualizar el dashboard
                        updateDashboard();
        
                        Swal.fire('Éxito', 'Préstamo marcado como terminado', 'success');
                    }
                }
            });
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

        async function checkPagosVencidos() {
            const clients = getClients();
            let clientesActualizados = false;
            let pagosVencidos = [];
        
            clients.forEach(client => {
                client.fechasPago = client.fechasPago.filter(fechaPago => {
                    const diasRetraso = calcularDiasRestantes(fechaPago) * -1;
                    if (diasRetraso > 0) {
                        const pagoVencido = {
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
                await fetch('guardar_pagos_vencidos.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ pagosVencidos })
                });
        
                await syncPagosVencidosConServidor(); // Recargar pagos vencidos desde PHP
            }
            renderCalendarioPagos();
            renderMultasRecargos();
        }
        
        async function aplicarInteresPorMora() {
            const response = await fetch('aplicar_interes.php', { method: 'POST' });
            const data = await response.json();
            if (data.success) {
                syncPagosVencidosConServidor();
            }
        }
        
        async function syncPagosVencidosConServidor() {
            const response = await fetch('obtener_pagos_vencidos.php');
            pagosVencidos = await response.json();
            renderPagosVencidos();
            renderMultasRecargos();
        }
        
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
                        <td class="p-2">${pago.nombre}</td>
                        <td class="p-2">${pago.apellido}</td>
                        <td class="p-2">$${parseFloat(pago.monto).toFixed(2)}</td>
                        <td class="p-2">${pago.mensaje || 'No disponible'}</td> <!-- Puedes cambiar esto según el campo -->
                        <td class="p-2">${pago.estado_prestamo}</td>
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
                
        
        async function deleteLatePayment(id) {
            const response = await fetch('eliminar_pago_vencido.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
        
            const data = await response.json();
            if (data.success) {
                syncPagosVencidosConServidor();
            }
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

        async function renderHistorialPrestamos() {
            try {
                // Obtener historial de préstamos desde el servidor
                const response = await fetch('server.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ action: 'getHistorialPrestamos' })
                });
        
                const data = await response.json();
                if (!data.success) throw new Error(data.message);
        
                const allLoans = data.historial.sort((a, b) => new Date(b.fechaPrestamo) - new Date(a.fechaPrestamo));
        
                // Generar la tabla con los datos obtenidos
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
        
            } catch (error) {
                console.error('Error al obtener el historial de préstamos:', error);
            }
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

        //quitar esta opcion
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

        async function renderAnalisisRiesgo() {
            try {
                // Obtener datos de análisis de riesgo desde el servidor
                const response = await fetch('server.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ action: 'getAnalisisRiesgo' })
                });
        
                const data = await response.json();
                if (!data.success) throw new Error(data.message);
        
                // Generar la tabla con los datos obtenidos
                $('riskAnalysisTable').innerHTML = data.analisis.map(client => {
                    const rowClass = client.porcentajeRiesgo <= 70 ? 'text-red-500' : '';
                    return `
                        <tr class="${rowClass}">
                            <td class="p-2">${client.nombre}</td>
                            <td class="p-2">${client.apellido}</td>
                            <td class="p-2">${client.cuotas}</td>
                            <td class="p-2">${client.cuotasAtrasadas}</td>
                            <td class="p-2">${client.porcentajeRiesgo.toFixed(2)}%</td>
                        </tr>
                    `;
                }).join('');
        
            } catch (error) {
                console.error('Error al obtener el análisis de riesgo:', error);
            }
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
async function renderProximosPagos() {
    try {
        // Obtener los datos de los próximos pagos desde el servidor
        const response = await fetch('server.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ action: 'getProximosPagos' })
        });

        const data = await response.json();
        if (!data.success) throw new Error(data.message);

        // Generar la tabla con los datos obtenidos
        $('proximosPagosTable').innerHTML = data.proximosPagos.map(pago => `
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

    } catch (error) {
        console.error('Error al obtener los próximos pagos:', error);
    }
}

function mostrarPrestamosVencidos() {
    const clients = getClients(); // Obtener todos los clientes
    let countVencidos = 0; // Contador para préstamos vencidos

    clients.forEach(client => {
        const diasRestantes = calcularDiasRestantes(client.fechasPago[client.fechasPago.length - 1]);
        if (diasRestantes <= 0) {
            countVencidos++; // Aumentar el contador si el préstamo está vencido
        }
    });

    // Mostrar la cantidad de préstamos vencidos en el cuadro
    const prestamosVencidosElement = document.getElementById('prestamosVencidos');
    prestamosVencidosElement.textContent = countVencidos;
}

// Llamar a la función para mostrar la cantidad de préstamos vencidos cuando se carga el dashboard
mostrarPrestamosVencidos();

setInterval(checkPagosVencidos, 86400000); // Cada 24 horas
setInterval(aplicarInteresPorMora, 86400000); // Cada 24 horas
setInterval(() => {
    renderClients();
    renderCalendarioPagos();
    renderMultasRecargos();
    renderAnalisisRiesgo();
}, 60000); // Cada minuto




