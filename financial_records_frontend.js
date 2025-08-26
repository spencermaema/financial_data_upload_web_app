<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Financial Records</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js"></script>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .upload-section {
            background: #f5f5f5;
            padding: 20px;
            border-radius: 5px;
            margin-bottom: 30px;
        }
        
        .form-group {
            margin-bottom: 15px;
        }
        
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        
        input {
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 3px;
        }
        
        button {
            background: #007bff;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 3px;
            cursor: pointer;
        }
        
        button:hover {
            background: #0056b3;
        }
        
        .data-section {
            display: none;
        }
        
        .user-info {
            background: #e9ecef;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        
        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        
        th {
            background: #f8f9fa;
        }
        
        .chart-container {
            width: 100%;
            height: 400px;
        }
    </style>
</head>
<body>
    <h1>Financial Records Upload</h1>
    
    <!-- File Upload Form -->
    <div class="upload-section">
        <h2>Upload Financial Data</h2>
        <form id="uploadForm">
            <div class="form-group">
                <label for="userId">User ID:</label>
                <input type="number" id="userId" required>
            </div>
            
            <div class="form-group">
                <label for="year">Year:</label>
                <input type="number" id="year" required>
            </div>
            
            <div class="form-group">
                <label for="file">Excel File (.xlsx):</label>
                <input type="file" id="file" accept=".xlsx" required>
            </div>
            
            <button type="submit">Upload</button>
        </form>
    </div>
    
    <!-- Data Display -->
    <div id="dataSection" class="data-section">
        <div class="user-info">
            <h2>User: <span id="userName"></span></h2>
            <h3>Year: <span id="displayYear"></span></h3>
        </div>
        
        <h3>Financial Records</h3>
        <table id="recordsTable">
            <thead>
                <tr>
                    <th>Month</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody id="recordsBody">
            </tbody>
        </table>
        
        <h3>Bar Chart</h3>
        <div class="chart-container">
            <canvas id="barChart"></canvas>
        </div>
    </div>

    <script>
        const uploadForm = document.getElementById('uploadForm');
        const dataSection = document.getElementById('dataSection');
        
        uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const userId = document.getElementById('userId').value;
            const year = document.getElementById('year').value;
            const fileInput = document.getElementById('file');
            const file = fileInput.files[0];
            
            // Upload file
            const formData = new FormData();
            formData.append('file', file);
            
            try {
                const uploadResponse = await fetch(`http://localhost:5000/api/finances/upload/${userId}/${year}`, {
                    method: 'POST',
                    body: formData
                });
                
                if (uploadResponse.ok) {
                    // Fetch and display data
                    await fetchAndDisplayData(userId, year);
                } else {
                    alert('Upload failed');
                }
            } catch (error) {
                alert('Error uploading file');
            }
        });
        
        async function fetchAndDisplayData(userId, year) {
            try {
                // Fetch financial records
                const response = await fetch(`http://localhost:5000/api/finances/${userId}/${year}`);
                const records = await response.json();
                
                // Display user info
                document.getElementById('userName').textContent = `User ${userId}`;
                document.getElementById('displayYear').textContent = year;
                
                // Display table
                const tbody = document.getElementById('recordsBody');
                tbody.innerHTML = '';
                records.forEach(record => {
                    const row = tbody.insertRow();
                    row.insertCell(0).textContent = record.month;
                    row.insertCell(1).textContent = record.amount;
                });
                
                // Create bar chart
                createBarChart(records);
                
                // Show data section
                dataSection.style.display = 'block';
                
            } catch (error) {
                alert('Error fetching data');
            }
        }
        
        function createBarChart(records) {
            const ctx = document.getElementById('barChart').getContext('2d');
            
            // Destroy existing chart if it exists
            if (window.myChart) {
                window.myChart.destroy();
            }
            
            const months = records.map(record => record.month);
            const amounts = records.map(record => record.amount);
            
            window.myChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: months,
                    datasets: [{
                        label: 'Amount',
                        data: amounts,
                        backgroundColor: 'rgba(0, 123, 255, 0.8)',
                        borderColor: 'rgba(0, 123, 255, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    </script>
</body>
</html>
