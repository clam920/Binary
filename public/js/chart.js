
document.addEventListener('DOMContentLoaded', () =>{
    
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
});