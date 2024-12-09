from flask import Flask, jsonify, request
from flask_cors import CORS
import pyodbc


app = Flask(__name__)
CORS(app)  # Esto permite solicitudes desde cualquier origen

server = '192.168.0.6,1500'
database = 'CEHOSAM'
username = 'sa'
password = 'Infotec123'

# Establecer la conexión
def get_db_connection():
    conn = pyodbc.connect(
        'DRIVER={ODBC Driver 17 for SQL Server};'
        f'SERVER={server};'
        f'DATABASE={database};'
        f'UID={username};'
        f'PWD={password}'
    )
    return conn

@app.route('/historia_c', methods=['GET'])
def historia_c():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT codigo, medico, fecha_real,evolucion FROM historias01 WHERE codigo='1130307335'")
        rv = cur.fetchall()
        cur.close()
        payload = []
        for result in rv:
            content = {
                'Cedula': result[0].strip() if isinstance(result[0], str) else result[0],
                'Medico': result[1].strip() if isinstance(result[1], str) else result[1],
                'Fecha': result[2].strip() if isinstance(result[2], str) else result[2],
                'evolucion': result[3].strip() if isinstance(result[3], str) else result[3]
            }
            payload.append(content)
        return jsonify(payload)
    except Exception as e:
        print(e)
        
        return jsonify({"informacion": str(e)})
    
#Metodo para buscar la historia clinica por cedula
@app.route('/historia_cedula/<cedula>', methods=['GET'])
def historia_cedula(cedula):
    print(f"Cédula recibida: {cedula}")
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT id, codigo, medico, fecha_real,evolucion FROM historias01 WHERE codigo=?", (cedula,))
        rv = cur.fetchall()
        cur.close()
        payload = []
        for result in rv:
            content = {
                'id': result[0],
                'Cedula': result[1].strip() if isinstance(result[1], str) else result[1],
                'Medico': result[2].strip() if isinstance(result[2], str) else result[2],
                'Fecha': result[3].strip() if isinstance(result[3], str) else result[3],
                'evolucion': result[4].strip() if isinstance(result[4], str) else result[4]
            }
            payload.append(content)
        return jsonify(payload)
        
    except Exception as e:
        print(e)
        

        return jsonify({"informacion": str(e)})

@app.route('/historia_id/<id>', methods=['GET'])
def obtener_historia_por_id(id):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT id, codigo, medico, fecha_real, evolucion FROM historias01 WHERE id=?", (id,))
        result = cur.fetchone()
        cur.close()
        
        if result:
            content = {
                'id': result[0],
                'Cedula': result[1].strip() if isinstance(result[1], str) else result[1],
                'Medico': result[2].strip() if isinstance(result[2], str) else result[2],
                'Fecha': result[3].strip() if isinstance(result[3], str) else result[3],
                'evolucion': result[4].strip() if isinstance(result[4], str) else result[4]
            }
            return jsonify(content)
        else:
            return jsonify({"error": "Historia no encontrada"}), 404
    except Exception as e:
        print(f"Error al obtener la historia clínica: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/historia_id/<id>', methods=['PUT'])
def actualizar_historia_por_id(id):
    try:
        data = request.json
        medico = data.get('medico')
        evolucion = data.get('evolucion')

        conn = get_db_connection()
        cur = conn.cursor()

        query = """
            UPDATE historias01
            SET Medico = ?, Evolucion = ?
            WHERE id = ?
        """
        cur.execute(query, (medico, evolucion, id))
        conn.commit()

        if cur.rowcount == 0:
            return jsonify({"error": "No se encontró la historia clínica"}), 404

        cur.close()
        return jsonify({"mensaje": "Historia clínica actualizada correctamente"}), 200
    except Exception as e:
        print(f"Error al actualizar la historia clínica: {e}")
        return jsonify({"error": str(e)}), 500





if __name__ == '__main__':
    app.run(debug=True)

