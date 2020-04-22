import pickle
import pandas as pd
import json
from datetime import date, datetime, timedelta
import multiprocessing
import re

from src.util import *
import src.data_manager as data_manager

def contact(number):
    info_dict = {}
    contacts = data_manager.contacts()
    contact = contacts[contacts['value'] == parse_num(number)]
    try:
        contact = contact.iloc[0] # number often matches twice for imessage v. sms
        info_dict['name'] = str(contact.Name)
        info_dict['first'] = contact.get('First', '')
        info_dict['last'] = contact.get('Last', '')
    except Exception as e:
        info_dict['firt'] = ''
        info_dict['last'] = ''
        info_dict['name'] = str(number)

    return info_dict

def summary(messages):
    json = {}

    individual, group = split_group(messages)
    ss = messages.is_group.value_counts()
    df = pd.DataFrame({'name':ss.index, 'value':ss.values})
    json['individual_group_pie'] = df.to_dict(orient='records')

    ss = group.is_from_me.value_counts()
    df = pd.DataFrame({'name':ss.index, 'value':ss.values})
    json['sent_received_group_pie'] = df.to_dict(orient='records')

    ss = individual.is_from_me.value_counts()
    df = pd.DataFrame({'name':ss.index, 'value':ss.values})
    json['sent_received_individual_pie'] = df.to_dict(orient='records')

    sent, received = split_sender(messages)
    sorted_time = messages.timestamp.sort_values()
    days = (sorted_time.iloc[-1] - sorted_time.iloc[0]).days
    json['sent_daily'] = int(sent.shape[0] / days)
    json['received_daily'] = int(received.shape[0] / days)

    return json

def numbers(message_df, n):
    df = message_df.number.value_counts()[:n]
    return df.to_dict()

def info_for_number(number, msg_df):
    messages = msg_df[msg_df.number == number]

    info_dict = {}
    contacts = data_manager.contacts()
    contact = contacts[contacts['value'] == parse_num(number)]
    try:
        contact = contact.iloc[0] # number often matches twice for imessage v. sms
        info_dict['first'] = contact.get('First', '')
        info_dict['last'] = contact.get('Last', '')
    except Exception as e:
        info_dict['firt'] = ''
        info_dict['last'] = ''

    info_dict['number'] = number
    info_dict['sent'] = int(messages.is_from_me.value_counts().get(1, 0))
    info_dict['received'] = int( messages.is_from_me.value_counts().get(0, 0))

    return info_dict

def contacts_summary(msg_df, n):
    df = msg_df.number.value_counts()
    df = df[df > 100]
    if n is not None:
        df = df[:n]

    numbers = df.keys()
    parallel = False

    if parallel:
        pool_num = multiprocessing.cpu_count()
        print("running on {} cpus".format(pool_num))
        pool = multiprocessing.Pool(pool_num)
        info_lst = list(pool.imap_unordered(info_for_number, numbers))
        pool.close()
        pool.join()
    else:
        print("running on single cpu")
        info_lst = [info_for_number(n, msg_df) for n in numbers]

    return info_lst

def tapback(message_df):
    pass
    # def count(key, msgs):
    #     count msgs.text.apply(lambda msg: re.match(key + '“.*”$', msg))
    #     vc = count.value_counts()
    #     import pdb; pdb.set_trace()
    #
    #
    # sent, received = split_sender(message_df)
    # count("Loved", sent)

def frequency(message_df, period='M'):
    message_df = message_df.sort_values(by='timestamp').reset_index()

    periods = message_df.timestamp.dt.to_period(period)
    first = periods[0].to_timestamp()
    # last = periods.tail(1).values[0].to_timestamp()
    last = datetime.now()

    sent, recieved = split_sender(message_df)
    count_sent = sent['timestamp'].groupby(periods).agg('count')
    count_recieved = recieved['timestamp'].groupby(periods).agg('count')

    dates = pd.date_range(first, last, freq=period)
    y_s = [count_sent.get(date, 0) for date in dates]
    y_r = [count_recieved.get(date, 0) for date in dates]

    data = [{'Label': str(l), 'Sent': int(s), 'Received': int(r)} for l, s, r in zip(dates, y_s, y_r)]
    return data

if __name__ == '__main__':
    import pdb; pdb.set_trace()
