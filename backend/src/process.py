import pandas as pd
import multiprocessing
import src.data_manager as data_manager
import src.file_util as file_util
import src.configuration as config
import src.stats.general as general

from src.util import split_sender

# Toggle multi-core processing. Turn off for easier debugging.
PARALLEL_GROUP = True
PARALLEL_SINGLE = True

# Minimum number of messages required to do analysis
MIN_MESSAGE_NUM = 50

###############################################
#
# Note: all this happens have the pickles have
# been saved. So read from there directly.
##############################################

def quick_stats():
    return ['Analyzing over 200 messages',
            'from over 68 contacts',
            'in over 400 countries']

def generate_number_table():
    df = data_manager.messages().number.value_counts()
    df = df[df > MIN_MESSAGE_NUM]

    numbers = df.keys()

    if PARALLEL_SINGLE:
        pool = _cpu_pool()
        info_lst = list(pool.imap_unordered(_stats_for_number, numbers))
        pool.close()
        pool.join()
    else:
        print("running on single cpu")
        info_lst = [_stats_for_number(n) for n in tqdm(numbers)]

    number_table = pd.DataFrame(info_lst)
    number_table = number_table.sort_values(by='sent', ascending=False)
    number_table = number_table[(number_table.sent > MIN_MESSAGE_NUM)]
    number_table = number_table[(number_table.received > MIN_MESSAGE_NUM)]
    number_table = number_table.reset_index(drop=True)
    return number_table

def generate_group_table():
    chats = data_manager.chats()
    groups = chats[chats.is_group].index.values

    if PARALLEL_GROUP:
        pool = _cpu_pool()
        info_lst = list(pool.imap_unordered(_stats_for_group, groups))
        pool.close()
        pool.join()
    else:
        print("running on single cpu")
        info_lst = [_stats_for_group(g) for g in tqdm(groups)]

    group_table = pd.DataFrame(info_lst)
    group_table = group_table.sort_values(by='count', ascending=False)
    # group_table = group_table[(group_table.count > MIN_MESSAGE_NUM)] # TODO: BUG
    group_table = group_table.reset_index(drop=True)
    return group_table

def _cpu_pool():
    pool_num = multiprocessing.cpu_count()
    print("running on {} cpus".format(pool_num))
    return multiprocessing.Pool(pool_num)

def _stats_for_number(number):
    info_dict = {'number': number}
    info_dict.update(general.contact_info(number))
    info_dict.update(general.simple_stats(number))
    info_dict.update(general.conversation_stats(number))
    return info_dict

def _stats_for_group(group):
    info_dict = {}
    info_dict.update(general.group_stats(group))
    return info_dict
