import os
import google.generativeai as genai

api_key = os.getenv('API_KEY')
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-1.5-flash')

def get_response(subject):
    # Construct the prompt
    prompt = f"""
    **User subject:**
    {subject}
    the user is blind and have difficulty learning , the user would like to learn about the subject
    generate a brief description and follow up question based on the subject if they like to know more and what are the interesting
    parts they could learn more from
    make it brief 

    **Response:**
    """

    # Generate the response
    try:
        response = model.generate_content(prompt)
        if response:
            print(response.text)
        return response.text if response and response.text else "No response generated."
    except Exception as e:
        return f"An error occurred: {str(e)}"

def ask_mor(query):
    try:
        response = model.generate_content(
            f"Provide a brief, friendly response to: {query}"
        )
        return {
            "info": response.text.strip() if response.text else "I'm not sure about that."
        }
    except Exception as e:
        return {
            "info": f"Sorry, an error occurred: {str(e)}"
        }