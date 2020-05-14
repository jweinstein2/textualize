import pickle
import pandas as pd
import json
import re
from datetime import date, datetime, timedelta

from src.util import *
import src.data_manager as data_manager

def contact_info(number):
    info_dict = {}
    contacts = data_manager.contacts()
    contact = contacts[contacts['value'] == parse_num(number)]
    try:
        contact = contact.iloc[0] # number often matches twice for imessage v. sms
        info_dict['name'] = str(contact.Name)
        info_dict['first'] = contact.get('First', '')
        info_dict['last'] = contact.get('Last', '')
    except Exception as e:
        info_dict['first'] = ''
        info_dict['last'] = ''
        info_dict['name'] = str(number)
    return info_dict

def simple_stats(number):
    info_dict = {}
    messages = data_manager.messages(number)
    sent, received = split_sender(messages)
    info_dict['sent'] = sent.shape[0]
    info_dict['received'] = received.shape[0]
    return info_dict

def conversation_stats(number, convo_gap=timedelta(hours=14)):
    info_dict = {}
    messages = data_manager.messages(number)
    all_msgs = data_manager.messages()

    # assumes messages are sorted by time
    prior = messages[:-1].reset_index()
    messages = messages[1:].reset_index()
    delta = messages.date - prior.date

    # conversations started /ended as a percentage of total
    new_convos = messages[delta > val_from_delta(convo_gap)]
    end_convos = prior[delta > val_from_delta(convo_gap)]
    my_new_convos = new_convos[new_convos.is_from_me == 1]
    my_end_convos = end_convos[end_convos.is_from_me == 1]
    info_dict['started'] = round((my_new_convos.shape[0] / max(1, new_convos.shape[0])) * 100, 1)
    info_dict['ended'] = round((my_end_convos.shape[0] / max(1, end_convos.shape[0])) * 100, 1)

    # response_time in seconds
    rt_sent = delta[(messages.is_from_me == 1) & (prior.is_from_me == 0) & (delta < val_from_delta(convo_gap))]
    rt_received = delta[(messages.is_from_me == 0) & (prior.is_from_me == 1) & (delta < val_from_delta(convo_gap))]

    info_dict['sent_response_time'] = delta_from_value(max(0, rt_sent.mean())).total_seconds()
    info_dict['received_response_time'] = delta_from_value(max(0, rt_received.mean())).total_seconds()


    #     # gap within conversations
    #     if not prev['is_from_me'] and curr['is_from_me']:
    #         your_rt = your_rt + (curr.timestamp - prev.timestamp)
    #         # check if there was a message sent in that time
    #         is_sent = all_msgs['is_from_me'] == 1
    #         is_time = all_msgs['timestamp'] > prev['timestamp']
    #         is_before = all_msgs['timestamp'] < curr['timestamp']
    #         is_ignored = len(all_msgs.loc[is_time & is_before & is_sent]) > 0
    #         ignored_tot += 1
    #         ignored += int(is_ignored)
    #
    # total = max(total, 1)
    # ignored_tot = max(ignored_tot, 1)
    # them_tot = max(them_tot, 1)
    # your_rt = timedelta(seconds=int((your_rt / ignored_tot).total_seconds()))
    # their_rt = timedelta(seconds=int((their_rt/ them_tot).total_seconds()))
    # info_dict['ignored'] = round((ignored * 100.0) / ignored_tot, 1)
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
    sorted_time = messages.date.sort_values()
    days = delta_from_value(sorted_time.iloc[-1] - sorted_time.iloc[0]).days
    days = max(days, 1)
    json['sent_daily'] = int(sent.shape[0] / days)
    json['received_daily'] = int(received.shape[0] / days)

    return json

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

def frequency(message_df, period='M', filter=None):
    if filter:
        message_df = message_df.dropna(subset = ['text'])
        message_df = message_df[message_df.text.str.contains(filter)]
    return frequency_plot(message_df, period)

if __name__ == '__main__':
    import pdb; pdb.set_trace()
