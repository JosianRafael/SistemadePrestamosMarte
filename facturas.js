// // Funciones para generar las facturas de las paginas...

// function generarFactura(loan, cobrador) {
//     let facturaHTML = `
//         <div id="factura" style="
//             font-family: Arial, sans-serif;
//             width: 90%;
//             max-width: 600px;
//             padding: 20px;
//             border: 3px solid black;
//             text-align: center;
//             background: white;
//             color: black;
//             margin: auto;
//             font-size: 18px;
//         ">
//             <h1 style="margin: 10px 0;">Inversiones P&P Marte</h1>
//             <p style="font-size: 16px; margin: 5px 0;">Factura para Consumidor Final</p>
//             <hr style="border: 2px dashed black; margin: 10px 0;">
            
//             <div style="text-align: left; font-size: 18px;">
//                 <p><strong>Cliente:</strong> ${loan.nombre} ${loan.apellido}</p>
            
//                 <p><strong>Fecha de Inicio:</strong> ${loan.fechaPrestamo}</p>
//                 <p><strong>Estado:</strong> ${loan.fechaFinalizacion ? 'Terminado' : 'Activo'}</p>
//     `;

//     if (loan.fechaFinalizacion) {
//         facturaHTML += `<p><strong>Fecha de Finalización:</strong> ${loan.fechaFinalizacion}</p>`;
//     } else {
//         facturaHTML += `
//             <p><strong>Cuotas:</strong> ${loan.cuotas}</p>
//             <p><strong>Monto por Cuota:</strong> $${loan.montoPorCuota.toFixed(2)}</p>
//             <p><strong>Próximas Fechas de Pago:</strong><br> ${loan.fechasPago.join('<br>')}</p>
//         `;
//     }

//     facturaHTML += `
//             <p><strong>Cobrador:</strong> ${cobrador}</p>
//             </div>
//             <hr style="border: 2px dashed black; margin: 10px 0;">
//             <p style="margin: 10px 0; font-size: 20px;"><strong>¡Gracias por preferirnos!</strong></p>
//         </div>
//     `;

//     let facturaContainer = document.getElementById("factura-container");
//     if (!facturaContainer) {
//         facturaContainer = document.createElement("div");
//         facturaContainer.id = "factura-container";
//         document.body.appendChild(facturaContainer);
//     }
//     facturaContainer.innerHTML = facturaHTML;
//     facturaContainer.style.display = "block";

//     Swal.fire({
//         title: 'Factura del Préstamo',
//         html: facturaHTML,
//         icon: 'info',
//         showCancelButton: true,
//         confirmButtonText: 'Imprimir',
//     }).then((result) => {
//         if (result.isConfirmed) {
//             setTimeout(imprimirFactura, 500);
//         }
//     });
// }

// function imprimirFactura() {
//     const style = document.createElement("style");
//     style.innerHTML = `
//         @media print {
//             body * {
//                 visibility: hidden;
//             }
//             #factura-container, #factura-container * {
//                 visibility: visible;
//             }
//             #factura-container {
//                 position: absolute;
//                 left: 50%;
//                 top: 50%;
//                 transform: translate(-50%, -50%);
//                 width: 90%;
//                 max-width: 600px;
//                 display: block;
//             }
//         }
//     `;
//     document.head.appendChild(style);
    
//     setTimeout(() => {
//         window.print();
//         document.head.removeChild(style);
//     }, 300);
// }