# Handles parsing messages specific to iOS

import threading
import shutil
import pandas as pd

import src.util as util
import src.file_util as file_util
import src.configuration as config

CM_JOIN_PATH = file_util.app_data_path('data/chat_message_join.pck')
CH_JOIN_PATH = file_util.app_data_path('data/chat_handle_join.pck')
CONTACTS_PATH = file_util.app_data_path('data/contacts.pck')
MESSAGES_PATH = file_util.app_data_path('data/message.pck')
HANDLES_PATH = file_util.app_data_path('data/handle.pck')

process_lock = threading.Lock()

# Returns
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
    config.del_process_progress()
    config.del_last_error()

# Synchronously begin process
def process():
    backup_path = config.get_backup_path()
    if backup_path == None:
        return False, 'backup path has not been set'

    if not process_lock.acquire(False):
        return False, 'process already in progress'


    # TODO: get quick stats to return immediately
    content = ['Analyzing over 200 messages',
               'from over 68 contacts',
               'in over 400 countries']

    # start non-blocking thread for heavy processing
    t = threading.Thread(target = _async_process,
                     name = 'processing',
                     args = (backup_path, process_lock))
    t.start()
    return True, content

#: MARK: Methods that read directly from the pickled dataframes
def cm_join():
    return pd.read_pickle(CM_JOIN_PATH)

def ch_join():
    return pd.read_pickle(CH_JOIN_PATH)

def handles():
    return pd.read_pickle(HANDLES_PATH)

def contacts():
    return pd.read_pickle(CONTACTS_PATH)

# Get the messages df filtered by time, group, and sender
def messages(number=None, is_group=None, start=None, end=None):
    df = pd.read_pickle(MESSAGES_PATH)

    if number: df = df.loc[df.number == number]
    if is_group is not None: df = df.loc[df['is_group'] == is_group]
    # TODO: add temporal filter
    # if start_date: df = df.loc[df['is_group'] >= start_date]
    # if start_date: df = df.loc[df['is_group'] < end_date]
    return df

# MARK: Helper Methods
def _async_process(path, lock):
    config.del_last_error()
    try:
        success, message = _process(path)
        if not success:
            config.set_process_progress(-1)
            config.set_last_error(message)
            print("Handled failure while processing")
            print(message)
            return
        elif success:
            config.set_process_progress(100)
    except Exception as e:
        config.set_process_progress(-1);
        config.set_last_error(str(e))
        print("Unexpected error while processing")
        print(e)
    lock.release()

def _process(backup_path):
    err, dfs = file_util.fetch_message_tables(backup_path)
    if err: return False, 'error fetching messages'
    message_df, handle_df, ch_join, cm_join = dfs

    err, contact_df = file_util.fetch_contact_table(backup_path)
    if err: return False, 'error fetching contacts'

    # XXX
    # MessageId: 834570 belongs to 18 chats. I believe this is anomalous
    # due to a third party messing with my chat database (2019-09-14)
    # To prevent breaking analysis, I filter this one message.
    cm_join = cm_join.drop_duplicates(subset='message_id', keep='first')
    # XXX

    # TODO: this is really slow
    message_df['timestamp'] = message_df['date'].apply(util.ts)

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

    # generate full name string
    first = list(map(lambda v: v or "", contact_df["First"]))
    last = list(map(lambda v: v or "", contact_df["Last"]))
    full = ["{} {}".format(a_, b_) for a_, b_ in zip(first, last)]
    full = [s.strip() for s in full]
    contact_df['Name'] = full
    contact_df = contact_df.loc[contact_df['Name'] != " "]

    # simplify phone number data
    contact_df['value'] = contact_df['value'].map(lambda a: util.parse_num(a))

    # save databases
    contact_df.to_pickle(CONTACTS_PATH)
    message_df.to_pickle(MESSAGES_PATH)
    handle_df.to_pickle(HANDLES_PATH)
    ch_join.to_pickle(CH_JOIN_PATH)
    cm_join.to_pickle(CM_JOIN_PATH)

    config.set_process_progress(100);
    return True, None
