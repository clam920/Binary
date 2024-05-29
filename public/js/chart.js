const confirmationMsg = document.getElementById('confirmation');

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

    const showStatisticsButton = document.getElementById('showStatistics');
    showStatisticsButton.addEventListener('click', () => {
        chartContainer.style.display = 'block';
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
                console.log('Scan entry deleted successfully.');
                scanItemElement.remove();
                // Show success message in modal
                document.getElementById('confirmToDelete').style.display = 'none';
                document.getElementById('itemDeleted').style.display = 'block';
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
            confirmationMsg.setAttribute('data-scan-id', scanId);
            confirmationMsg.setAttribute('data-scan-element-id', scanItemElement.id);
            document.getElementById('confirmToDelete').style.display = 'block';
            document.getElementById('itemDeleted').style.display = 'none';
            confirmationMsg.showModal();
            console.log(`Button clicked for scan ID: ${scanId}`);
        });
    });

    document.querySelector('.confirm-To-Delete').addEventListener('click', () => {
        const scanId = confirmationMsg.getAttribute('data-scan-id');
        const scanItemElement = document.querySelector(`.scan-item[data-id="${scanId}"]`);
        if (scanId && scanItemElement) {
            deleteScan(scanId, scanItemElement);
        }
    });

    document.querySelectorAll('#closeDeleteMsg, #closeDeleteMsgSuccess').forEach(button => {
        button.addEventListener('click', () => {
            confirmationMsg.close();
        });
    });
});
