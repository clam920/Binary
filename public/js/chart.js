const confirmationMsg = document.getElementById('confirmation');
// const close = document.getElementById('close');

document.addEventListener('DOMContentLoaded', () => {
    
    const chartDataElement = document.getElementById('chartData');
    const chartData = JSON.parse(chartDataElement.textContent);
    const chartContainer = document.getElementById('chartContainer');
    const ctx = document.getElementById('myChart').getContext('2d');

    const myChart = new Chart(ctx, {
        type: 'pie',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            legend: {
                position: 'right',
            },
            title: {
                display: true,
                text: 'Waste Distribution',
            },
        },
    });

    // Show chart when button is clicked
    const showStatisticsButton = document.getElementById('showStatistics');
    showStatisticsButton.addEventListener('click', () => {
        chartContainer.style.display = 'block';
        // Update chart if needed
        myChart.update();
    });

    // Function to delete scan item
    async function deleteScan(scanId, scanItemElement) {
        try {
            console.log(`Deleting scan item with ID: ${scanId}`);
            const response = await fetch('history_delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                mode: 'cors',
                cache: 'default',
                body: JSON.stringify({ scanId: scanId })
            });

            if (response.ok) {
                // Remove the scan item from the DOM
                console.log('Scan entry deleted successfully.');
                scanItemElement.remove();
                confirmationMsg.showModal();
            } else {
                const errorMessage = await response.text();
                console.error('Failed to delete scan entry:', errorMessage);
            }
        } catch (error) {
            console.error('Error deleting scan entry:', error);
        }
    }

    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const scanItemElement = event.target.closest('.scan-item');
            const scanId = scanItemElement.getAttribute('data-id');
            console.log(`Button clicked for scan ID: ${scanId}`); 
            deleteScan(scanId, scanItemElement);
        });
    });

});

document.getElementById('closeDeleteMsg').addEventListener('click', function () {
    confirmationMsg.close();
})