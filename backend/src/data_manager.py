# Handles parsing messages specific to iOS
import threading
import shutil
import pandas as pd
import numpy as np
import time

import src.util as util
import src.file_util as file_util
import src.configuration as config
import src.process as process
import os

# Values of 'associated_message_type'
message_types = {
    'Text': 0,
    'Game Pidgeon': 3,
    'Love': 2000,
    'Like': 2001,
    'Dislike': 2002,
    'Laugh': 2003,
    'Emphasize': 2004,
    'Question': 2005,
    'Unlove': 3001,
    'Unlike': 3002,
    'Undislike': 3003,
    'Unlaugh': 3004,
    'Unquestion': 3005,
}

#############################################################
# FETCH DATA TABLES
# Only use these methods after completing the process step
#############################################################

_cache = {}

DATA_DIR = file_util.app_data_path('data')
NUMBER_TABLE_PATH = file_util.app_data_path('data/numbers.pck')
GROUP_TABLE_PATH = file_util.app_data_path('data/groups.pck')
CM_JOIN_PATH = file_util.app_data_path('data/chat_message_join.pck')
CH_JOIN_PATH = file_util.app_data_path('data/chat_handle_join.pck')
CONTACTS_PATH = file_util.app_data_path('data/contacts.pck')
MESSAGES_PATH = file_util.app_data_path('data/message.pck')
HANDLES_PATH = file_util.app_data_path('data/handle.pck')
CHAT_PATH = file_util.app_data_path('data/chat.pck')

def _fetch(path):
    df = _cache.get(path, None)
    if df is None: df = pd.read_pickle(path)
    _cache[path] = df
    return df

def _set(df, path):
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)
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

def chats():
    return _fetch(CHAT_PATH)

def numbers():
    return _fetch(NUMBER_TABLE_PATH)

def groups():
    return _fetch(GROUP_TABLE_PATH)

# Join groups and numbers for FE consumption
# TODO: Remove the processing division between groups and numbers
def processed_chats():
    number_list = numbers()
    number_list['members'] = np.empty((len(number_list), 0)).tolist() # Only used by groups
    number_list['is_group'] = False
    group_list = groups()
    group_list['is_group'] = True
    chat_list = pd.concat([group_list, number_list])
    chat_list = chat_list.replace(np.nan, 0) # TODO: hacky but allows us to use arbitrary json conversion in TS
    chat_list = chat_list[chat_list.count_total > 20]
    return chat_list

# Get the messages df filtered by time, group, and sender
def messages(number=None, is_group=None, start=None, end=None, type=0):
    df = _fetch(MESSAGES_PATH)

    if number: df = df.loc[df.number == number]
    if is_group is not None: df = df.loc[df['is_group'] == is_group]
    if type is not None: df = df.loc[df.associated_message_type == type]
    # TODO: add temporal filter
    # if start_date: df = df.loc[df['is_group'] >= start_date]
    # if start_date: df = df.loc[df['is_group'] < end_date]
    return df

# Get messages for a single group handle
def group_messages(index, start=None, end=None, type=0):
    msg_df = _fetch(MESSAGES_PATH)
    cm_join = _fetch(CM_JOIN_PATH)

    join = cm_join[cm_join.chat_id == index]
    msg_df = msg_df.set_index(['ROWID']).reindex(join.message_id)
    
    if type is not None: msg_df = msg_df.loc[msg_df.associated_message_type == type]
    return msg_df

def messages_general(id, is_group, start, end, type=None):
    if is_group:
        return group_messages(int(id), start, end, type)
    return messages(id, start, end, type)

def contact(number, fallback = None):
    contacts = _fetch(CONTACTS_PATH)
    contact = contacts[contacts['value'] == util.parse_num(number)]
    try:
        contact = contact.iloc[0] # number often matches twice for imessage v. sms
        return contact.to_dict()
    except Exception as e:
        return fallback

def safe_contact(number):
    c = contact(number)
    if c != None:
        return c
    return {'First': number, 'Last': '', 'value': number, 'Name': number}

#############################################################
# PROCESS WORK
#############################################################

process_lock = threading.Lock()

# "failed",      description
# "in progress", status
# "completed",   None
# "unstarted",   None
def process_progress():
    progress = config.get_process_progress()
    if process_lock.locked():
        return "in_progress", progress, None
    elif progress == -1:
        return "failed", progress, config.get_last_error()
    elif progress == 100:
        return "completed", progress, None
    else:
        return "unstarted", progress, None

# TODO: shutdown process thread
def clear():
    if process_lock.locked():
        print("processing in background: shit is about to go south")

    shutil.rmtree(file_util.app_data_path('data'), ignore_errors=True)
    cache = {}
    config.del_process_progress()
    config.del_last_error()

def start_process(type, source):
    if not process_lock.acquire(False):
        return 'process already in progress'

    config.set_process_progress(1)
    if type == 'backup':
        message_db = file_util.backup_message_db(source)
        contact_db = file_util.backup_contact_db(source)
    elif type == 'mac':
        message_db = file_util.mac_message_db()
        contact_db = file_util.mac_contact_db()
    else:
        return "Invalid process type"

    if (message_db == None):
        return "Unable to find message database"
    if (contact_db == None):
        return "Unable to find contact database"

    start_time = time.time()
    err, dfs = file_util.fetch_message_tables(message_db)
    if err: return err
    message_df, handle_df, ch_join, cm_join, chat_df = dfs

    if type == 'backup':
        err, contact_df = file_util.fetch_contact_table(contact_db)
        if err: return err
    else:
        err, contact_df = file_util.fetch_mac_contact_table(contact_db)
        if err: return err
        contact_df['value'] = contact_df['Number'].fillna(contact_df['Email'])
        contact_df = contact_df[contact_df['value'].notna()]


    contact_df = _format_contacts(contact_df)
    cm_join = _format_cm_join(cm_join)
    chat_df = _format_chat(chat_df, ch_join)
    message_df = _format_messages(message_df, handle_df, chat_df, cm_join)

    _set(contact_df, CONTACTS_PATH)
    _set(message_df, MESSAGES_PATH)
    _set(handle_df, HANDLES_PATH)
    _set(ch_join, CH_JOIN_PATH)
    _set(cm_join, CM_JOIN_PATH)
    _set(chat_df, CHAT_PATH)

    print('completed synchronous processing work (%s seconds)' % round((time.time() - start_time), 2))
    config.set_process_progress(5)

    # start non-blocking thread for heavy processing
    t = threading.Thread(target = async_process,
                     name = 'processing',
                     args = [process_lock])
    t.start()
    return None

def async_process(lock):
    config.del_last_error()
    try:
        start_time = time.time()
        number_stats = process.generate_number_table()
        _set(number_stats, NUMBER_TABLE_PATH)
        print('generated and saved number stats (%s seconds)' % round((time.time() - start_time), 2))

        config.set_process_progress(40)

        start_time = time.time()
        group_table = process.generate_group_table()
        _set(group_table, GROUP_TABLE_PATH)
        print('generated and saved group stats (%s seconds)' % round((time.time() - start_time), 2))
        config.set_process_progress(100)
    except Exception as e:
        config.set_process_progress(-1);
        config.set_last_error(str(e))
        lock.release()
        raise(e)

    lock.release()

def _format_chat(chat, ch_join):
    # add group information
    ch_counts = ch_join.chat_id.value_counts()
    ch_counts = ch_counts > 1
    ch_counts = ch_counts.sort_index()
    chat = chat.set_index('ROWID')
    chat['is_group'] = ch_counts
    return chat

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

def _format_messages(message_df, handle_df, chat_df, cm_join):
    # TODO: This could be skipped to save time
    message_df = message_df.dropna(subset = ['handle_id'])
    message_df['handle_id'] = message_df.handle_id.astype(int)
    handle_reordered = handle_df.set_index(['ROWID'])
    numbers = handle_reordered.reindex(message_df.handle_id).id
    # numbers = handle_reordered.loc[message_df.handle_id].id
    message_df['number'] = numbers.values

    # Add group information
    # Note: there are messages missing from the cm_join table. These are given NaN group info.
    cm_indexed = cm_join.set_index(['message_id'])
    chats = cm_indexed.reindex(message_df.ROWID).chat_id
    message_df['is_group'] = chat_df.reindex(chats).is_group.values

    return message_df
