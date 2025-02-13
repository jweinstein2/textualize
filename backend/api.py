from __future__ import print_function
import sys
import src.data_manager as data_manager
import src.file_util as file_util
import src.configuration as config
import src.stats.general as general_stats
import src.stats.tapback as tapback
import src.stats.language as language_stats
import src.stats.emoji as emoji_stats
import src.stats.sentiment as sentiment_stats
from http import HTTPStatus
import multiprocessing

from src.util import *

from flask_cors import CORS
from flask import Flask, request

app = Flask(__name__)
CORS(app)

##############################
# CONFIGURATION
##############################

@app.route('/')
def heartbeat():
    print('heartbeat')
    return "", HTTPStatus.OK

# TODO: Deprecate /source DELETE. Always use /process DELETE instead
@app.route('/source', methods=['GET', 'DELETE'])
def source():
    if request.method == 'GET':
        path =  config.get_backup_path();
        return {"source": path}
    elif request.method == 'DELETE':
        config.reset();
        data_manager.clear();
        return "", HTTPStatus.OK

@app.route('/process', methods=['GET', 'POST', 'DELETE'])
def process():
    if request.method == 'DELETE':
        config.reset();
        data_manager.clear()
        return "", HTTPStatus.OK
    if request.method == 'GET':
        status, percent, error = data_manager.process_progress()
        return {"status": status, "percent": percent, "error": error}
    if request.method == 'POST':
        type = request.json.get('type')
        source = request.json.get('source')
        error = data_manager.start_process(type, source)

        if (error != None):
            console.log(error)
            return str(error), HTTPStatus.INTERNAL_SERVER_ERROR

        return "", HTTPStatus.OK

@app.route('/quick_stats', methods=['GET'])
def quick_stats():
    return general_stats.quick_stats()

##############################
# STATS
##############################

@app.route('/chats', methods=['GET'])
def list(start=None, end=None, n=300):
    chats = data_manager.processed_chats()
    chats = chats.sort_values(by='count_total', ascending=False)
    chats = chats[:n]
    return chats.to_dict(orient='records')

@app.route('/contact/<number>', methods=['GET'])
def contact_info(number):
    content = general_stats.contact_info(number)
    return content

# use the saved database
@app.route('/group/<id>', methods=['GET'])
def group_info(id):
    content = general_stats.group_info(int(id))
    return content

@app.route('/language/<number>', methods=['GET'])
def language(number, start=None, end=None):
    return result

@app.route('/frequency/', defaults={'number': None})
@app.route('/frequency/<number>', methods=['GET'])
def frequency(number=None, start=None, end=None):
    is_group = None if (number == None) else False
    msg = data_manager.messages(number=number, start=start, end=end, is_group=is_group)
    result = general_stats.frequency(msg, period='MS')

    return result

@app.route('/group_frequency/<group_id>', methods=['GET'])
def group_frequency(group_id, start=None, end=None):
    msg = data_manager.group_messages(int(group_id))
    result = general_stats.frequency(msg, period='MS')
    return result

@app.route('/group/<id>/tapback', methods=['GET'])
def group_tapback(id, start=None, end=None):
    msg = data_manager.group_messages(int(id))
    result = tapback.group_info(msg)
    return result

@app.route('/group/<id>/language', methods=['GET'])
def group_language(id, start=None, end=None):
    msg = data_manager.group_messages(int(id))
    result = language_stats.group_summary(msg)
    return result


##############################
# CHAT STATS
##############################

@app.route('/chat/<number>/emoji', methods=['GET'])
def emoji_widget(number, start=None, end=None):
    n = 3
    msg = data_manager.messages(number=number, start=start, end=end)
    result = emoji_stats.contact_summary(msg, n)

    response = {}
    response["type"] = "message"
    response["options"] = [["Sent (you)", "Received"],
                           ["Popular", "Unique"]]

    data = {}
    data["Sent (you)"] = {"Unique": [result['unique_sent']],
                          "Popular": [result['popular_sent']]}
    data["Received"] = {"Unique": [result['unique_received']],
                          "Popular": [result['popular_received']]}
    response["data"] = data
    return response

@app.route('/chat/<number>/sentiment', methods=['GET'])
def sentiment(number, start=None, end=None):
    msg = data_manager.messages(number=number, start=start, end=end)
    result = sentiment_stats.contact_summary(msg)
    response = {}
    response["type"] = "message"
    response["options"] = [["Sent (you)", "Received"],
                           ["Positive", "Negative"]]

    data = {}
    data["Sent (you)"] = {"Positive": result['pos_sent'],
                          "Negative": result['neg_sent']}
    data["Received"] = {"Positive": result['pos_received'],
                          "Negative": result['neg_received']}
    response["data"] = data
    return response

@app.route('/chat/<number>/wordcloud', methods=['GET'])
def wordcloud(number, start=None, end=None):
    msg = data_manager.messages(number=number, start=start, end=end)
    unique = language_stats.unique_words(msg)
    popular = language_stats.popular_words(msg) # TODO

    response = {}
    response["type"] = "wordcloud"
    response["options"] = [["Unique", "Popular"]]
    response["data"] = {"Unique": unique, "Popular": popular}
    return response

@app.route('/chat/<number>/count', methods=['GET'])
def count(number, start=None, end=None):
    msg = data_manager.messages(number=number, start=start, end=end, is_group=False)
    sent_msg, received_msg = split_sender(msg)
    sent = len(sent_msg)
    received = len(received_msg)
    total = sent + received

    response = {}
    response["type"] = "simple"
    response["format"] = "message_count"
    response["options"] = [["Total", "Sent", "Received"]]
    response["data"] = {"Total": {"value": total, "label": "Messages"},
                        "Sent": {"value": sent, "label": "Messages Sent"},
                        "Received": {"value": received, "label": "Messages Received"}}
    return response

# TODO: Properly handle start / end time frames.
@app.route('/chat/<number>/responsetime', methods=['GET'])
def response_time(number, start=None, end=None):
    chats = data_manager.processed_chats()
    chat = chats[chats.number == number].iloc[0]

    response = {}
    response["type"] = "simple"
    response["format"] = "response_time"
    response["options"] = [["Sent", "Received"]]
    response["data"] = {"Sent": {"value": chat.sent_response_time, "label": "on average"},
                        "Received": {"value": chat.received_response_time, "label": "on average"}}
    return response

# TODO: BUG! The oldest oldest messages aren't showing up...
@app.route('/chat/<number>/firstmessage', methods=['GET'])
def first_message(number, start=None, end=None):
    msg = data_manager.messages(number=number, start=start, end=end, is_group=False)
    msg = msg[msg.text.notna()]

    sent_msg, received_msg = split_sender(msg)
    sent_msg = sent_msg.sort_values(by='date_delivered', ascending=True)
    received_msg = received_msg.sort_values(by='date_delivered', ascending=True)

    response = {}
    response["type"] = "message"
    response["options"] = [["Sent", "Received"]]
    response["data"] = {"Sent": [sent_msg.iloc[0].text], "Received": [received_msg.iloc[0].text]}
    return response

@app.route('/chat/<number>/streak', methods=['GET'])
def streak(number, start=None, end=None):
    chats = data_manager.processed_chats()
    chat = chats[chats.number == number].iloc[0]

    def format_streak(s):
        if (s < 1): return str(s) + " 🪦"
        if (s < 3): return str(s) + " 😶‍🌫️"
        if (s < 6): return str(s) + " 🥱"
        if (s < 10): return str(s) + " 😤"
        if (s < 20): return str(s) + " 👯"
        return str(s) + " 🔥"

    response = {}
    response["type"] = "simple"
    response["options"] = [["Longest", "Current"]]
    response["data"] = {"Longest": {"value": format_streak(chat.longest_streak), "label": "days"},
                        "Current": {"value": format_streak(chat.current_streak), "label": "days"}}
    return response

@app.route('/chat/<number>/messages_by_time', methods=['GET'])
def messages_by_time(number, start=None, end=None):
    msg = data_manager.messages(number=number, start=start, end=end, is_group=False)
    by_day_of_week = general_stats.by_day_of_week(msg)
    by_time_of_day = general_stats.by_time_of_day(msg)

    # TODO: Move color values to FE
    series = [{ "name": "received", "color": "blue.6" }, 
                    { "name": "sent", "color": "green.6" }] 
    by_time_of_day_data = {"data": by_time_of_day, "series": series}
    by_day_of_week_data = {"data": by_day_of_week, "series": series}

    response = {}
    response["type"] = "bar_chart"
    response["options"] = [[ "Time of Day", "Day of Week"]]
    response["data"] = {"Day of Week": by_day_of_week_data, "Time of Day": by_time_of_day_data}
    return response

@app.route('/chat/<number>/top_groups', methods=['GET'])
def top_groups(number, start=None, end=None):
    contact = data_manager.contact(number)

    chats = data_manager.processed_chats()
    chats = chats.sort_values(by='count_total', ascending=False)
    chats = chats[chats.is_group == True]
    chats = chats[chats['members'].apply(lambda members: contact['First'] in members)]
    chats = chats[["count_total", "name", "id"]]
    chats = chats.rename(columns={"count_total": "value"})
    data = chats.to_dict(orient='records')

    response = {}
    response["type"] = "leaderboard"
    response["format"] = "message_count"
    response["options"] = []
    response["data"] = data
    return response

##############################
# SUMMARY STATS
##############################

@app.route('/group_connection_graph', methods=['GET'])
def group_connection_graph(start=None, end=None):
    return general_stats.group_connection_graph()

@app.route('/summary', methods=['GET'])
def summary(start=None, end=None):
    msg = data_manager.messages(start=start, end=end)
    result = general_stats.summary(msg)
    return result

@app.route('/summary/activity', methods=['GET'])
def activity_summary(start=None, end=None):
    response = {}
    response["type"] = "leaderboard"
    response["format"] = "message_count"
    response["options"] = [["Chats", "Groups"]]

    chats = data_manager.processed_chats()
    groups = chats[chats.is_group == True]
    contacts = chats[chats.is_group == False]
    groups = groups.sort_values(by='count_total', ascending=False)
    groups = groups[:3]
    contacts = contacts.sort_values(by='count_total', ascending=False)
    contacts = contacts[:3]

    groups = groups[["count_total", "id", "name"]]
    groups = groups.rename(columns={"count_total": "value"})
    contacts = contacts[["count_total", "number", "name"]]
    contacts = contacts.rename(columns={"count_total": "value", "number": "id"})

    data = {}
    data["Chats"] = contacts.to_dict(orient='records')
    data["Groups"] = groups.to_dict(orient='records')
    response["data"] = data

    return response

@app.route('/summary/responsetime', methods=['GET'])
def response_time_summary(start=None, end=None):
    response = {}
    response["type"] = "leaderboard"
    response["format"] = "response_time"
    response["options"] =  [["Sent (you)", "Received"],
                           ["Fastest", "Slowest"]]

    chats = data_manager.processed_chats()
    contacts = chats[chats.is_group == False]

    sent = contacts.sort_values(by='sent_response_time', ascending=True)
    sent = sent[sent.sent_response_time > 0]
    sent = sent.rename(columns={"sent_response_time": "value", "number": "id"})
    received = contacts.sort_values(by='received_response_time', ascending=True)
    received = received[received.received_response_time > 0]
    received = received.rename(columns={"received_response_time": "value", "number": "id"})

    sent_top = sent[:3]
    sent_bottom = sent[-3:]
    received_top = received[:3]
    received_bottom = received[-3:]

    data = {}
    data["Sent (you)"] = {"Fastest": sent_top.to_dict(orient='records'),
                          "Slowest": sent_bottom.to_dict(orient='records')}
    data["Received"] = {"Fastest": received_top.to_dict(orient='records'),
                          "Slowest": received_bottom.to_dict(orient='records')}
    response["data"] = data
    return response

@app.route('/summary/statemap', methods=['GET'])
def state_map(start = None, end = None):
    return general_stats.state_map()


##############################
# IPC
##############################

def parse_port():
    port = 4242
    try:
        port = int(sys.argv[1])
    except Exception as e:
        pass
    return '{}'.format(port)

def main():
    port = parse_port()
    try:
        app.run(host='127.0.0.1', port=port, debug=False)
    except KeyboardInterrupt:
        if sys.excepthook is sys.__excepthook__:
            sys.excepthook = _no_traceback_excepthook
        raise

if __name__ == '__main__':
    multiprocessing.freeze_support()
    main()
