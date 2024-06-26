import os
import re

from dotenv import load_dotenv

from testlite import completion

load_dotenv()

anthropic_api_key = os.getenv("ANTHROPIC_API_KEY")
os.environ["ANTHROPIC_API_KEY"] = anthropic_api_key

def format_list(input_string):
    # Split the string into a list of phrases
    phrases = input_string.split(',')

    # Remove leading/trailing whitespace, quotation marks and final punctuation
    cleaned_phrases = [re.sub(r'^["\s]+|["\s]+$|[.,;:!?"]$', '', phrase) for phrase in phrases]

    return cleaned_phrases


def get_completion(prompt, messages, model='claude-3-opus-20240229'):
    messages.append({"role": "user", "content": prompt})

    response = completion(model=model, messages=messages)

    # Access the generated text from the response object
    generated_text = response.choices[0].message.content

    messages.append({"role": "assistant", "content": generated_text})

    return generated_text

def get_emotive_list(article_text, messages):
    prompt = f"""
    Extract all examples of emotive language used in the 
    following article, which is delimited by triple backticks.

    Format your response as a list of items separated by commas.

    Article: '''{article_text}'''
    """

    response = get_completion(prompt, messages)

    response = format_list(response)

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

def get_political_bias_list(article_text, messages):
    prompt = f"""
        You are evaluating in which ways the article below, delimited by triple backticks, is politically biased, specifically, biased to 
        either the left-wing or the right-wing.
        
        Extract all examples of politically biased phrases used in the article.

        Format your response as a list of items separated by commas.
        
        Article: ```{article_text}```
        """

    response = get_completion(prompt, messages)
    response = format_list(response)

    return response

def get_political_bias_rating(messages):
    prompt = """
        You are evaluating in which political direction the previous article is biased.
        
        On a scale from 1 (strongly left-wing) to 10 (strongly right-wing) can you rate the article for the position of it's political bias.

        Please format your response as an integer only.
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

def get_establishment_list(article_text, messages):
    prompt = f"""
            You are evaluating in which ways the article below, delimited by triple backticks, is biased in a manner that is either pro-establishment or anti-establishment.

            Extract all examples of politically biased phrases used in the article.

            Format your response as a list of items separated by commas.
            
            Article: ```{article_text}```
            """

    response = get_completion(prompt, messages)
    response = format_list(response)

    return response

def get_establishment_bias_rating(messages):
    prompt = """
        You are evaluating in which direction the previous article is biased, in regards to its stance on the establishment.

        On a scale from 1 (strongly anti-establishment) to 10 (strongly pro-establishment) can you rate the article for the position of it's establishment bias.

        Please format your response as an integer only.
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

def run(text):
    try:
        emo_msgs = [{"role": "system", "content": "You are an expert on journalism. You specialise in assessing how emotive language is used to position readers"}]
        emotive_list = get_emotive_list(text, emo_msgs)
        emotive_rating = get_emotive_rating(emo_msgs)

        pol_msgs = [{"role": "system", "content": "You are an expert on journalism and politics. You specialise in assessing the presence of political bias in articles."}]
        political_list = get_political_bias_list(text, pol_msgs)
        political_rating = get_political_bias_rating(pol_msgs)

        est_msgs = [{"role": "system", "content": "You are an expert on journalism and politics. You specialise in assessing the presence of pro or anti establishment bias in articles."}]
        establishment_list = get_establishment_list(text, est_msgs)
        establishment_bias_rating = get_establishment_bias_rating(est_msgs)

        result = {
            'emotive_list': emotive_list,
            'emotive_rating': emotive_rating,
            'political_list': political_list,
            'political_rating': political_rating,
            'establishment_list': establishment_list,
            'establishment_bias_rating': establishment_bias_rating
        }
        print(result)
        return result
    except Exception as e:
        print(e)