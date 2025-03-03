document.getElementById('contratoForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Recoger datos del formulario
    const datos = {
        prestamista: {
            nombre: document.getElementById('nombrePrestamista').value,
            dni: document.getElementById('dniPrestamista').value,
            direccion: document.getElementById('direccionPrestamista').value,
            telefono: document.getElementById('telefonoPrestamista').value
        },
        cliente: {
            nombre: document.getElementById('nombreCliente').value,
            dni: document.getElementById('dniCliente').value,
            direccion: document.getElementById('direccionCliente').value,
            telefono: document.getElementById('telefonoCliente').value,
            email: document.getElementById('emailCliente').value,
            ocupacion: document.getElementById('ocupacionCliente').value
        },
        prestamo: {
            monto: document.getElementById('montoPrestamo').value,
            interes: document.getElementById('interesPrestamo').value,
            plazo: document.getElementById('plazoPrestamo').value,
            metodoPago: document.getElementById('metodoPago').value,
            fechaInicio: document.getElementById('fechaInicio').value,
            diaPago: document.getElementById('diaPago').value
        },
        garantias: document.getElementById('garantias').value,
        penalizacionMora: document.getElementById('penalizacionMora').value,
        condicionesEspeciales: document.getElementById('condicionesEspeciales').value,
        referencias: {
            ref1: {
                nombre: document.getElementById('nombreRef1').value,
                telefono: document.getElementById('telefonoRef1').value
            },
            ref2: {
                nombre: document.getElementById('nombreRef2').value,
                telefono: document.getElementById('telefonoRef2').value
            }
        },
        fecha: new Date().toLocaleDateString(),
        numeroContrato: 'CTR-' + Date.now()
    };

    // Generar contenido del contrato
    const contenidoContrato = `
        <div class="text-center mb-6">
            <h2 class="text-2xl font-bold">CONTRATO DE PRÉSTAMO</h2>
            <p>No. ${datos.numeroContrato}</p>
            <p>Fecha: ${datos.fecha}</p>
        </div>

        <div class="mb-6">
            <h3 class="font-bold mb-2">COMPARECEN:</h3>
            
            <p class="mb-4">Por una parte, <strong>${datos.prestamista.nombre}</strong>, con identificación ${datos.prestamista.dni}, 
            domiciliado en ${datos.prestamista.direccion}, en adelante denominado EL PRESTAMISTA.</p>
            
            <p class="mb-4">Por otra parte, <strong>${datos.cliente.nombre}</strong>, con identificación ${datos.cliente.dni}, 
            domiciliado en ${datos.cliente.direccion}, de ocupación ${datos.cliente.ocupacion}, 
            en adelante denominado EL PRESTATARIO.</p>
        </div>

        <div class="mb-6">
            <h3 class="font-bold mb-2">TÉRMINOS DEL PRÉSTAMO:</h3>
            <ul class="list-disc pl-5 space-y-2">
                <li>Monto del préstamo: $${datos.prestamo.monto}</li>
                <li>Tasa de interés anual: ${datos.prestamo.interes}%</li>
                <li>Plazo: ${datos.prestamo.plazo} meses</li>
                <li>Método de pago: ${datos.prestamo.metodoPago}</li>
                <li>Fecha de inicio: ${new Date(datos.prestamo.fechaInicio).toLocaleDateString()}</li>
                <li>Día de pago: ${datos.prestamo.diaPago} de cada mes</li>
                <li>Cuota ${datos.prestamo.metodoPago}: $${calcularCuotaMensual(datos.prestamo.monto, datos.prestamo.interes, datos.prestamo.plazo)}</li>
            </ul>
        </div>

        ${datos.garantias ? `
        <div class="mb-6">
            <h3 class="font-bold mb-2">GARANTÍAS:</h3>
            <p>${datos.garantias}</p>
        </div>
        ` : ''}

        <div class="mb-6">
            <h3 class="font-bold mb-2">PENALIZACIONES Y CONDICIONES:</h3>
            <p>En caso de mora, se aplicará una tasa de interés adicional del ${datos.penalizacionMora}% sobre el monto vencido.</p>
            ${datos.condicionesEspeciales ? `<p class="mt-2">Condiciones especiales: ${datos.condicionesEspeciales}</p>` : ''}
        </div>

        <div class="mb-6">
            <h3 class="font-bold mb-2">REFERENCIAS DEL PRESTATARIO:</h3>
            <p>1. ${datos.referencias.ref1.nombre} - Tel: ${datos.referencias.ref1.telefono}</p>
            <p>2. ${datos.referencias.ref2.nombre} - Tel: ${datos.referencias.ref2.telefono}</p>
        </div>

        <div class="mb-6">
            <h3 class="font-bold mb-2">DECLARACIÓN DE LAS PARTES:</h3>
            <p>Ambas partes declaran que conocen y aceptan todas las condiciones establecidas en el presente contrato, 
            y se comprometen a cumplirlas en su totalidad. El incumplimiento de cualquiera de las cláusulas dará derecho 
            al PRESTAMISTA a dar por vencido el plazo y exigir el pago total del préstamo más los intereses correspondientes.</p>
        </div>

        <div class="mt-8 grid grid-cols-2 gap-8">
            <div class="text-center">
                <div class="border-t border-gray-400 pt-2">
                    <p>_______________________</p>
                    <p>${datos.prestamista.nombre}</p>
                    <p class="text-sm">EL PRESTAMISTA</p>
                    <p class="text-sm">${datos.prestamista.dni}</p>
                </div>
            </div>
            <div class="text-center">
                <div class="border-t border-gray-400 pt-2">
                    <p>_______________________</p>
                    <p>${datos.cliente.nombre}</p>
                    <p class="text-sm">EL PRESTATARIO</p>
                    <p class="text-sm">${datos.cliente.dni}</p>
                </div>
            </div>
        </div>
    `;

    // Mostrar el modal con el contrato
    document.getElementById('contenidoContrato').innerHTML = contenidoContrato;
    document.getElementById('modalContrato').classList.remove('hidden');
});

// Cerrar modal
document.getElementById('cerrarModal').addEventListener('click', function() {
    document.getElementById('modalContrato').classList.add('hidden');
});

// Imprimir contrato
document.getElementById('imprimirContrato').addEventListener('click', function() {
    window.print();
});

// Función para calcular la cuota mensual
function calcularCuotaMensual(monto, tasaAnual, plazo) {
    const tasaMensual = (tasaAnual / 100) / 12;
    const cuota = (monto * tasaMensual * Math.pow(1 + tasaMensual, plazo)) / 
                 (Math.pow(1 + tasaMensual, plazo) - 1);
    return cuota.toFixed(2);
}