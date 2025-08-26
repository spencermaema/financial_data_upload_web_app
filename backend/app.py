from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import pandas as pd
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'database': 'financial_db',
    'user': 'moahloli',  # Fixed: was 'username'
    'password': 'r@ndom_p@$wd'
}

def get_db_connection():
    """Create and return a database connection"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except mysql.connector.Error as err:
        print(f"Database connection error: {err}")
        return None

@app.route('/api/finances/upload/<int:userId>/<int:year>', methods=['POST'])
def upload_finances(userId, year):
    try:
        # Check if file is present
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Validate file extension
        if not file.filename.lower().endswith(('.xlsx', '.xls')):
            return jsonify({'error': 'Invalid file format. Please upload an Excel file (.xlsx or .xls)'}), 400
        
        # Parse Excel file
        try:
            data = pd.read_excel(file)
        except Exception as e:
            return jsonify({'error': f'Error reading Excel file: {str(e)}'}), 400
        
        # Validate required columns
        required_columns = ['Month', 'Amount']
        missing_columns = [col for col in required_columns if col not in data.columns]
        if missing_columns:
            return jsonify({'error': f'Missing required columns: {", ".join(missing_columns)}'}), 400
        
        # Connect to database
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor()
        
        # Delete existing records for this user and year (optional - for re-uploads)
        cursor.execute(
            "DELETE FROM financial_records WHERE user_id = %s AND year = %s",
            (userId, year)
        )
        
        # Insert each row into financial_records
        records_inserted = 0
        for _, row in data.iterrows():
            try:
                # Validate data types
                month = str(row['Month']).strip()
                amount = float(row['Amount'])
                
                if not month:
                    continue  # Skip empty months
                
                cursor.execute(
                    "INSERT INTO financial_records (user_id, year, month, amount) VALUES (%s, %s, %s, %s)",
                    (userId, year, month, amount)
                )
                records_inserted += 1
            except (ValueError, TypeError) as e:
                print(f"Skipping invalid row: {row}, Error: {e}")
                continue
        
        # Save changes
        connection.commit()
        cursor.close()
        connection.close()
        
        return jsonify({
            'message': 'Financial data uploaded successfully',
            'records_inserted': records_inserted
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/api/finances/<int:userId>/<int:year>', methods=['GET'])
def get_finances(userId, year):
    try:
        # Connect to database
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor()
        
        # Fetch financial records for the user and year
        cursor.execute(
            "SELECT month, amount FROM financial_records WHERE user_id = %s AND year = %s ORDER BY month",
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
                'amount': float(record[1])  # Ensure amount is a float
            })
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'Financial API is running'}), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)