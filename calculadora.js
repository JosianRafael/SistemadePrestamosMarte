document.getElementById('loanForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const amount = parseFloat(document.getElementById('amount').value);
    const interest = parseFloat(document.getElementById('interest').value) / 100 / 12;
    const months = parseInt(document.getElementById('months').value);
    const type = document.getElementById('type').value;
    const frequency = document.getElementById('frequency').value;

    const amortizationSchedule = [];
    let balance = amount;

    // Cálculo del pago mensual
    const monthlyPayment = calculateMonthlyPayment(amount, interest, months, type);
    let totalPaid = 0;
    let totalInterestPaid = 0;

    for (let month = 1; month <= months; month++) {
        const interestPayment = balance * interest;
        const principalPayment = monthlyPayment - interestPayment;
        balance -= principalPayment;

        totalPaid += monthlyPayment;
        totalInterestPaid += interestPayment;

        amortizationSchedule.push({
            month: month,
            payment: monthlyPayment,
            interest: interestPayment,
            principal: principalPayment,
            balance: Math.max(balance, 0)
        });
    }

    // Mostrar tabla de amortización
    displayAmortizationTable(amortizationSchedule);

    // Mostrar tabla y gráficos
    document.getElementById('amortizationTableContainer').classList.remove('hidden');
    document.getElementById('chartsContainer').classList.remove('hidden');
    document.getElementById('summaryContainer').classList.remove('hidden');

    // Crear gráficos de pagos e intereses
    createCharts(amortizationSchedule);

    // Mostrar resumen
    document.getElementById('totalPaid').textContent = `Total Pagado: $${totalPaid.toFixed(2)}`;
    document.getElementById('totalInterest').textContent = `Intereses Totales: $${totalInterestPaid.toFixed(2)}`;
});

// Función para calcular el pago mensual
function calculateMonthlyPayment(amount, interest, months, type) {
    let monthlyPayment;

    if (type === 'fixed') {
        monthlyPayment = (amount * interest) / (1 - Math.pow(1 + interest, -months));
    } else {
        const adjustment = Math.random() * 0.02; // Ajuste aleatorio del interés
        monthlyPayment = (amount * (interest + adjustment)) / (1 - Math.pow(1 + (interest + adjustment), -months));
    }

    return monthlyPayment;
}

// Función para mostrar la tabla de amortización
function displayAmortizationTable(schedule) {
    const amortizationTable = document.getElementById('amortizationTable');
    amortizationTable.innerHTML = schedule.map(item => `
        <tr class="text-white">
            <td class="p-2">${item.month}</td>
            <td class="p-2">$${item.payment.toFixed(2)}</td>
            <td class="p-2">$${item.interest.toFixed(2)}</td>
            <td class="p-2">$${item.principal.toFixed(2)}</td>
            <td class="p-2">$${item.balance.toFixed(2)}</td>
        </tr>
    `).join('');
}

// Función para crear gráficos
function createCharts(schedule) {
    const ctxPayment = document.getElementById('paymentChart').getContext('2d');
    const ctxInterest = document.getElementById('interestChart').getContext('2d');

    const labels = schedule.map(item => `Mes ${item.month}`);
    const paymentData = schedule.map(item => item.payment);
    const interestData = schedule.map(item => item.interest);

    new Chart(ctxPayment, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Pago Mensual',
                data: paymentData,
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2
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

    new Chart(ctxInterest, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Intereses Pagados',
                data: interestData,
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 2
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
