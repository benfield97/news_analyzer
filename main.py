import openai
import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
import os

load_dotenv()

openai.api_key = os.getenv('OPENAI_API_KEY')

def get_article_text(input, format = 'url'):
    # Send a request to the website
    if format == 'url':
        r = requests.get(input)

    elif format == 'html':
        r = input

    # Parse HTML and save to BeautifulSoup object
    soup = BeautifulSoup(r.text, "html.parser")

    # Find article text and combine it into one string
    article_text = ' '.join([p.text for p in soup.find_all('p')])

    return article_text


def get_completion(prompt, messages):
    messages.append({"role": "user", "content": prompt})

    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages= messages
    )

    messages.append({"role": "system", "content": response['choices'][0]['message']['content']})

    return response['choices'][0]['message']['content']



def get_emotive_list(article_text, messages):
    prompt = f"""
    Extract all examples of emotive language used in the 
    following article, which is delimited by triple backticks.

    Format your response as a list of items separated by commas.

    Article: '''{article_text}'''
    """

    response = get_completion(prompt, messages)

    return response


def get_emotive_rating(messages):
    prompt = """
        Based strictly on the presence of emotive language, can you rate on a scale of 1-10 how emotive the article is.
        
        Please format your response as an integer only
        """

    response = get_completion(prompt, messages)

    try:
        return int(response)

    except:
        prompt = """
        Please try again and format this response as an integer only.
        """

        response = get_completion(prompt, messages)

        return int(response)


def get_political_bias_list(messages):
    prompt = """
        You are evaluating in which ways the previous article is politically biased, specifically, biased to 
        either the left-wing or the right-wing.
        
        Extract all examples of politically biased phrases used in the 
        previous article, that was delimited by triple backticks.

        Format your response as a list of items separated by commas.
        """

    response = get_completion(prompt, messages)

    return response


def get_establishment_list(messages):
    prompt = """
            You are evaluating in which ways the previous article is biased in a manner that is either pro-establishment 
            or anti-establishment.

            Extract all examples of politically biased phrases used in the 
            previous article, that was delimited by triple backticks.

            Format your response as a list of items separated by commas.
            """

    response = get_completion(prompt, messages)

    return response


def get_bias_rating(messages):
    prompt = """
        You are evaluating in which ways the previous article is biased.
    
        On a scale of 1 to 10 can you rate the article in each of these categories, delimited by triple backticks.
        
        '''On a scale from 1 (strongly left-wing) to 10 (strongly right-wing)'''
        
        '''On a scale from 1 (strongly pro-establishment) to 10 (strongly anti-establishment)'''
        
        Please format your entire response as a list of integers only
        """

    response = get_completion(prompt, messages)

    biases = [int(s) for s in response.split(',')]

    return biases

def run(url):
    messages = [{"role": "system", "content": "You are a helpful assistant."}]
    article = get_article_text(url)
    emotive_list = get_emotive_list(article, messages)
    emotive_rating = get_emotive_rating(messages)
    political_list = get_political_bias_list(messages)
    establishment_list = get_establishment_list(messages)
    bias_ratings = get_bias_rating(messages)

    return {
        'emotive_list': emotive_list,
        'emotive_rating': emotive_rating,
        'political_list': political_list,
        'establishment_list': establishment_list,
        'bias_ratings': bias_ratings
    }
