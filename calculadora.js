// Aqui apareceran las funciones de Js de la calculadora de la pagina...

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
    
    // ###############################################################################
    // ###############################################################################
    
    // Funcion principal que genera todos los graficos, no borrar, es una funcion importante.
    // ###############################################################################
    
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
    
    // ###############################################################################
    // ###############################################################################
    
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
    
    // ###############################################################################
    // ###############################################################################
    // ###############################################################################
    
    // Funcion para calcular la mora de la calculardora.
    
    // ###############################################################################
    // ###############################################################################
    
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
    
    // ###############################################################################
    // ###############################################################################
    
    // Funcion simple para animar los numeros en la calculadora..
    
    // ###############################################################################
    // ###############################################################################
    
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
    // ###############################################################################
    // ###############################################################################
    
    // Event listeners // Carga la pagina de la calculadora..
    
    // ###############################################################################
    // ###############################################################################
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
    
    // Fin de las funciones de las calculadoras...


     // ###############################################################################
         // ###############################################################################  

        // Cargar notas desde localStorage al cargar la página. 
        // En esta funcion simplemente se guardaran las notas.

        // ###############################################################################
        // ###############################################################################
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
    // Tabla de todas laa notas de la pagina que se vayan agregando.
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
    // Funcion para poder completar las notas...
        function completarNota(button) {
            const fila = button.closest("tr");
            fila.style.textDecoration = "line-through"; // Marca la nota como completada
    
            // Actualiza el estado de completada en localStorage
            const notas = JSON.parse(localStorage.getItem("notas")) || [];
            const notaIndex = Array.from(document.getElementById("listaNotas").children).indexOf(fila);
            notas[notaIndex].completada = true; // Marca como completada
            localStorage.setItem("notas", JSON.stringify(notas));
        }
    // Funcion para poder editar las notas...
        function editarNota(button) {
            const fila = button.closest("tr");
            const titulo = fila.children[0].innerText;
            const fecha = fila.children[1].innerText;
            const descripcion = fila.children[2].innerText;
    
            // Rellena el formulario con los datos de la nota...
            document.getElementById("tituloNota").value = titulo;
            document.getElementById("fechaNota").value = fecha;
            document.getElementById("descripcionNota").value = descripcion;
    
            // Elimina la fila de la tabla
            eliminarNota(button);
        }
    // Funcion para poder eliminar las notas del bloc de notas...
        function eliminarNota(button) {
            const fila = button.closest("tr");
            const notas = JSON.parse(localStorage.getItem("notas")) || [];
            const notaIndex = Array.from(document.getElementById("listaNotas").children).indexOf(fila);
            
            // Elimina la nota del array
            notas.splice(notaIndex, 1);
            localStorage.setItem("notas", JSON.stringify(notas)); // Actualiza localStorage
    
            fila.remove(); // Elimina la fila de la tabla
        }