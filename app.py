from flask import Flask, request, jsonify
from dotenv import load_dotenv
# Import functions from your main.py (make sure it's in the same directory)
from main import get_article_text, get_emotive_list, get_emotive_rating, get_political_bias_list, get_establishment_list, get_bias_rating

load_dotenv()
app = Flask(__name__)

@app.route('/analyze', methods=['POST'])
def analyze_article():
    try:
        url = request.json.get('url')
        messages = [{"role": "system", "content": "You are a helpful assistant."}]
        
        # Scrape and analyze the article
        article_text = get_article_text(url)
        emotive_list = get_emotive_list(article_text, messages)
        emotive_rating = get_emotive_rating(messages)
        political_list = get_political_bias_list(messages)
        establishment_list = get_establishment_list(messages)
        bias_ratings = get_bias_rating(messages)
        
        # Bundle results
        result = {
            'emotive_list': emotive_list,
            'emotive_rating': emotive_rating,
            'political_list': political_list,
            'establishment_list': establishment_list,
            'bias_ratings': bias_ratings
        }
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run()





