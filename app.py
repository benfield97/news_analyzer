from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS

# Import functions from your main.py (make sure it's in the same directory)
from main import run

load_dotenv()
app = Flask(__name__)
CORS(app)

# test 
@app.route('/', methods=['GET'])
def home():
    return "News Analyzer Chrome Extension"


@app.route('/analyze', methods=['POST'])
def analyze_text():
    try:
        text = request.json.get('text')
        result = run(text)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run()





