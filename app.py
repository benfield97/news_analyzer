from flask import Flask, request, jsonify
from dotenv import load_dotenv
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
def analyze_article():
    try:
        url = request.json.get('url')     
        # Bundle results
        result = run(url)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run()





