from flask import Flask, request,
import mysql.connector
import pandas as pd

app = Flask(__name__)

DB_CONFIG ={
'host': 'localhost',
'database': 'financial_db',
'username': 'moahloli',
'password': 'r@ndom_p@$wd'
}

@app.route('/api/finances/upload/<int:userId>/<int:year>', methods=['POST'])
def upload_finances(userId, year):
    # Get the uploaded file from multipart/form-data
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    
    # Parse Excel file
    data = pd.read_excel(file)
    
    # Connect to database
    connection = mysql.connector.connect(**DB_CONFIG)
    cursor = connection.cursor()
    
    # Insert each row into financial_records
    for _, row in data.iterrows():
        cursor.execute(
            "INSERT INTO financial_records (user_id, year, month, amount) VALUES (%s, %s, %s, %s)",
            (userId, year, row['Month'], row['Amount'])
        )
    
    # Save changes
    connection.commit()
    cursor.close()
    connection.close()
    
    return jsonify({'message': 'Financial data uploaded successfully'}), 200

@app.route('/api/finances/<int:userId>/<int:year>', methods=['GET'])
def get_finances(userId, year):
    # Connect to database
    connection = mysql.connector.connect(**DB_CONFIG)
    cursor = connection.cursor()
    
    # Fetch financial records for the user and year
    cursor.execute(
        "SELECT month, amount FROM financial_records WHERE user_id = %s AND year = %s",
        (userId, year)
    )
    
    records = cursor.fetchall()
    cursor.close()
    connection.close()
    
    # Return records in JSON format
    result = []
    for record in records:
        result.append({
            'month': record[0],
            'amount': record[1]
        })
    
    return jsonify(result), 200

if __name__ == '__main__':
    app.run(debug=True)
