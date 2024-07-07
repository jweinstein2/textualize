from __future__ import print_function
import sys
import zerorpc
import src.data_manager as data_manager
import src.file_util as file_util
import src.configuration as config
import src.stats.general as general_stats
import src.stats.language as language_stats
import src.stats.emoji as emoji_stats
import src.stats.sentiment as sentiment_stats

class Api(object):
    def state(self):
        status, additional = data_manager.process_progress()
        if status == "completed":
            state = 3
        elif status == "failed":
            state = 2
        elif status == "in_progress":
            state = 2
        elif status == "unstarted":
            state = 1
        else:
            print("unexpected state")
            state = 0

        return state

    def set_source(self, path):
        if file_util.is_valid_source(path):
            config.set_backup_path(path)
            return True
        return False

    def clear_src(self):
        config.reset();
        data_manager.clear();
        return True

    def process(self):
        return data_manager.start_process()

    def get_process_progress(self):
       status, msg = data_manager.process_progress()
       return status, msg

    # use the saved database
    def contact_info(self, number):
        content = general_stats.contact_info(number)
        return content

    # use the saved database
    def group_info(self, id):
        content = general_stats.group_info(int(id))
        return content

    # return the first n numbers ordered by frequency
    def get_numbers(self, start=None, end=None, n=100):
        numbers = data_manager.numbers()
        numbers = numbers[:n]
        return numbers.to_dict(orient='records')

    # return the first n groups ordered by frequency
    def get_groups(self, start=None, end=None, n=100):
        groups = data_manager.groups()
        groups = groups[:n]
        return groups.to_dict(orient='records')

    def language_stats(self, number, start=None, end=None):
        msg = data_manager.messages(number=number, start=start, end=end)
        result = language_stats.contact_summary(msg)
        return result

    def frequency(self, number=None, start=None, end=None):
        msg = data_manager.messages(number=number, start=start, end=end)
        result = general_stats.frequency(msg, period='M')
        return result

    def group_frequency(self, group_id, start=None, end=None):
        msg = data_manager.group_messages(int(group_id))
        result = general_stats.frequency(msg, period='M')
        return result

    def summary(self, start=None, end=None):
        msg = data_manager.messages(start=start, end=end)
        result = general_stats.summary(msg)
        return result

    def sentiment(self, number, start=None, end=None):
        msg = data_manager.messages(number=number, start=start, end=end)
        result = sentiment_stats.contact_summary(msg)
        return result

    def emoji(self, number, start=None, end=None):
        n = 5
        msg = data_manager.messages(number=number, start=start, end=end)
        result = emoji_stats.contact_summary(msg, n)
        return result

    def group_connection_graph(self, start=None, end=None):
        return general_stats.group_connection_graph()

    def test(self):
        import pdb; pdb.set_trace()


def parse_port():
    port = 4242
    try:
        port = int(sys.argv[1])
    except Exception as e:
        pass
    return '{}'.format(port)

def main():
    addr = 'tcp://127.0.0.1:' + parse_port()
    s = zerorpc.Server(Api(), heartbeat=None)
    s.bind(addr)
    print('start running on {}'.format(addr))
    s.run()

if __name__ == '__main__':
    main()
