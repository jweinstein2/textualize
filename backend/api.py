from __future__ import print_function
import sys
import src.data_manager as data_manager
import src.file_util as file_util
import src.configuration as config
import src.stats.general as general_stats
import src.stats.language as language_stats
import src.stats.emoji as emoji_stats
import src.stats.sentiment as sentiment_stats
from http import HTTPStatus

from flask_cors import CORS
from flask import Flask, request

app = Flask(__name__)
CORS(app)

@app.route('/')
def heartbeat():
    print('heartbeat')
    return "", HTTPStatus.OK

@app.route('/source', methods=['GET', 'POST'])
def source():
    if request.method == 'GET':
        path =  config.get_backup_path();
        return {"source": path}
    else:
        path = request.json['source']
        config.set_backup_path(path)
        print(config.get_backup_path())
        return "", HTTPStatus.CREATED

def clear_src():
    config.reset();
    data_manager.clear();
    return True

def process():
    return data_manager.start_process()

def get_process_progress():
   status, msg = data_manager.process_progress()
   return status, msg

# use the saved database
def contact_info(number):
    content = general_stats.contact_info(number)
    return content

# use the saved database
def group_info(id):
    content = general_stats.group_info(int(id))
    return content

# return the first n numbers ordered by frequency
def get_numbers(start=None, end=None, n=100):
    numbers = data_manager.numbers()
    numbers = numbers[:n]
    return numbers.to_dict(orient='records')

# return the first n groups ordered by frequency
def get_groups(start=None, end=None, n=100):
    groups = data_manager.groups()
    groups = groups[:n]
    return groups.to_dict(orient='records')

def language_stats(number, start=None, end=None):
    msg = data_manager.messages(number=number, start=start, end=end)
    result = language_stats.contact_summary(msg)
    return result

def frequency(number=None, start=None, end=None):
    msg = data_manager.messages(number=number, start=start, end=end)
    result = general_stats.frequency(msg, period='M')

    return result

def group_frequency(group_id, start=None, end=None):
    msg = data_manager.group_messages(int(group_id))
    result = general_stats.frequency(msg, period='M')
    return result

def summary(start=None, end=None):
    msg = data_manager.messages(start=start, end=end)
    result = general_stats.summary(msg)
    return result

def sentiment(number, start=None, end=None):
    msg = data_manager.messages(number=number, start=start, end=end)
    result = sentiment_stats.contact_summary(msg)
    return result

def emoji(number, start=None, end=None):
    n = 5
    msg = data_manager.messages(number=number, start=start, end=end)
    result = emoji_stats.contact_summary(msg, n)
    return result

def group_connection_graph(start=None, end=None):
    return general_stats.group_connection_graph()

def main():
    app.run(host='127.0.0.1', port=5000)
    print('start running on {}'.format(addr))

if __name__ == '__main__':
    main()
