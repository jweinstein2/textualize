# Handles parsing messages specific to iOS
import threading
import shutil
import pandas as pd
import time

import src.util as util
import src.file_util as file_util
import src.configuration as config
import src.preprocess as preprocess

#############################################################
# FETCH DATA TABLES
# Only use these methods after completing the process step
#############################################################

_cache = {}

NUMBER_STAT_PATH = file_util.app_data_path('data/numbers.pck')
CM_JOIN_PATH = file_util.app_data_path('data/chat_message_join.pck')
CH_JOIN_PATH = file_util.app_data_path('data/chat_handle_join.pck')
CONTACTS_PATH = file_util.app_data_path('data/contacts.pck')
MESSAGES_PATH = file_util.app_data_path('data/message.pck')
HANDLES_PATH = file_util.app_data_path('data/handle.pck')

def _fetch(path):
    df = _cache.get(path, None)
    if df is None: df = pd.read_pickle(path)
    _cache[path] = df
    return df

def _set(df, path):
    _cache[path] = df
    df.to_pickle(path)

def cm_join():
    return _fetch(CM_JOIN_PATH)

def ch_join():
    return _fetch(CH_JOIN_PATH)

def handles():
    return _fetch(HANDLES_PATH)

def contacts():
    return _fetch(CONTACTS_PATH)

def numbers():
    return _fetch(NUMBER_STAT_PATH)

# Get the messages df filtered by time, group, and sender
def messages(number=None, is_group=None, start=None, end=None):
    df = _fetch(MESSAGES_PATH)

    if number: df = df.loc[df.number == number]
    if is_group is not None: df = df.loc[df['is_group'] == is_group]
    # TODO: add temporal filter
    # if start_date: df = df.loc[df['is_group'] >= start_date]
    # if start_date: df = df.loc[df['is_group'] < end_date]
    return df

#############################################################
# PREPROCESS WORK
#############################################################

process_lock = threading.Lock()

# "failed",      description
# "in progress", status
# "completed",   None
# "unstarted",   None
def process_progress():
    if process_lock.locked():
        return "in_progress", config.get_process_progress()

    progress = config.get_process_progress()
    if progress == -1:
        # something went wrong
        return "failed", config.get_last_error()
    elif progress == 100:
        return "completed", None
    else:
        return "unstarted", progress

# TODO: shutdown process thread
def clear():
    if process_lock.locked():
        print("processing in background: shit is about to go south")

    shutil.rmtree(app_data_path('data'), ignore_errors=True)
    cache = {}
    config.del_process_progress()
    config.del_last_error()

def start_process():
    backup_path = config.get_backup_path()
    if backup_path == None:
        return 'backup path has not been set', None
    if not process_lock.acquire(False):
        return 'process already in progress', None

    start_time = time.time()
    err, dfs = file_util.fetch_message_tables(backup_path)
    if err: return err, None
    message_df, handle_df, ch_join, cm_join = dfs

    err, contact_df = file_util.fetch_contact_table(backup_path)
    if err: return err, None

    contact_df = _format_contacts(contact_df)
    cm_join = _format_cm_join(cm_join)
    message_df = _format_messages(message_df, handle_df, cm_join, ch_join)

    _set(contact_df, CONTACTS_PATH)
    _set(message_df, MESSAGES_PATH)
    _set(handle_df, HANDLES_PATH)
    _set(ch_join, CH_JOIN_PATH)
    _set(cm_join, CM_JOIN_PATH)


    print('completed synchronous processing work (%s seconds)' % round((time.time() - start_time), 2))

    # start non-blocking thread for heavy processing
    t = threading.Thread(target = async_process,
                     name = 'processing',
                     args = [process_lock])
    t.start()
    return None, preprocess.quick_stats()

def async_process(lock):
    config.del_last_error()
    try:
        start_time = time.time()
        number_stats = preprocess.generate_number_stats()
        _set(number_stats, NUMBER_STAT_PATH)
        print('generated and saved number stats (%s seconds)' % round((time.time() - start_time), 2))
        config.set_process_progress(100)
    except Exception as e:
        config.set_process_progress(-1);
        config.set_last_error(str(e))
        lock.release()
        raise(e)

    lock.release()

def _format_cm_join(cm_join):
    # MessageId: 834570 belongs to 18 chats. I believe this is anomalous
    # due to a third party messing with my chat database (2019-09-14)
    # To prevent breaking analysis, I filter this one message.
    return cm_join.drop_duplicates(subset='message_id', keep='first')

def _format_contacts(df):
    # generate full name string
    first = list(map(lambda v: v or "", df["First"]))
    last = list(map(lambda v: v or "", df["Last"]))
    full = ["{} {}".format(a_, b_) for a_, b_ in zip(first, last)]
    full = [s.strip() for s in full]
    df['Name'] = full
    df = df.loc[df['Name'] != " "]

    # simplify phone number data
    df['value'] = df['value'].map(lambda a: util.parse_num(a))
    return df

def _format_messages(message_df, handle_df, cm_join, ch_join):
    # TODO: this is really slow and unecessary
    # message_df['timestamp'] = message_df['date'].apply(util.ts)

    # TODO: This could be skipped to save time
    # add number (0 for sent messages in groupchat)
    message_df = message_df.dropna(subset = ['handle_id'])
    message_df['handle_id'] = message_df.handle_id.astype(int)
    handle_reordered = handle_df.set_index(['ROWID'])
    numbers = handle_reordered.loc[message_df.handle_id].id
    message_df['number'] = numbers.values

    # add group information
    message_df['is_group'] = 2
    message_ids = message_df.ROWID
    chat_ids = cm_join.set_index(['message_id']).loc[message_ids].chat_id
    ch_counts = ch_join.chat_id.value_counts()
    ch_counts.loc[ch_counts <= 1] = 0
    ch_counts.loc[ch_counts > 1] = 1
    ch_counts = ch_counts.astype(bool)
    message_df['is_group'] = ch_counts[chat_ids].values
    return message_df
