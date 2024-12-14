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

##############################
# STATS
##############################

# return the first n numbers ordered by frequency
@app.route('/list_numbers', methods=['GET'])
def list_numbers(start=None, end=None, n=100):
    numbers = data_manager.numbers()
    numbers = numbers[:n]
    return numbers.to_dict(orient='records')

# return the first n groups ordered by frequency
@app.route('/list_groups', methods=['GET'])
def list_groups(start=None, end=None, n=100):
    groups = data_manager.groups()
    groups = groups[:n]
    return groups.to_dict(orient='records')

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
    msg = data_manager.messages(number=number, start=start, end=end)
    result = language_stats.contact_summary(msg)
    return result

@app.route('/frequency/<number>', methods=['GET'])
def frequency(number=None, start=None, end=None):
    msg = data_manager.messages(number=number, start=start, end=end)
    result = general_stats.frequency(msg, period='MS')

    return result

@app.route('/group_frequency/<group_id>', methods=['GET'])
def group_frequency(group_id, start=None, end=None):
    msg = data_manager.group_messages(int(group_id))
    result = general_stats.frequency(msg, period='MS')
    return result

@app.route('/summary', methods=['GET'])
def summary(start=None, end=None):
    msg = data_manager.messages(start=start, end=end)
    result = general_stats.summary(msg)
    return result

@app.route('/sentiment/<number>', methods=['GET'])
def sentiment(number, start=None, end=None):
    msg = data_manager.messages(number=number, start=start, end=end)
    result = sentiment_stats.contact_summary(msg)
    return result

@app.route('/emoji/<number>', methods=['GET'])
def emoji(number, start=None, end=None):
    n = 3
    msg = data_manager.messages(number=number, start=start, end=end)
    result = emoji_stats.contact_summary(msg, n)
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

@app.route('/group_connection_graph', methods=['GET'])
def group_connection_graph(start=None, end=None):
    return general_stats.group_connection_graph()

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
