from flask import Flask, request, jsonify
from flask_cors import CORS
import wikipediaapi
from llm_response import get_response , ask_mor
# from gtts import gTTS
# import . from scrap

app = Flask(__name__)
 
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/api/submitDisabilities', methods=['POST'])
def submit_disabilities():
    try:
        # Get data from the request
        data = request.json
        disabilities = data.get('disabilities', [])

        # Determine the appropriate route
        if 'Visual Impairment' in disabilities:
            next_route = '/blind'
        elif 'Hearing Impairment' in disabilities:
            next_route = '/deaf'
        else:
            next_route = '/general'

        return jsonify({'success': True, 'next_route': next_route})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/scrap_subject', methods=['POST'])
def scrap_sub():
    try:
        data = request.json
        subject = data.get('subject')
        print(subject)

        if not subject:
            return jsonify({'error': 'Subject not provided'}), 400

        description = get_response(subject)
        print(description)

        return jsonify({'success': True, 'description': description})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/ask_more', methods=['POST'])
def handle_ask_more():
    """
    Endpoint to handle conversation queries.
    """
    data = request.get_json()
    query = data.get('query', '')
    
    response = ask_mor(query)
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
