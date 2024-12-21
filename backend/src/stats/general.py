import pickle
import itertools
import pandas as pd
import json
import re
from datetime import date, datetime, timedelta

from src.util import *
import src.data_manager as dm

# A list of text displayed while loading.
# All processing time should be minimal.
#
# https://www.intradyn.com/text-message-statistics-trends/
def quick_stats():
    messages = dm.messages()
    contacts = dm.contacts()
    chats = data_manager.chats()
    groups = chats[chats.is_group].index.values

    msg_count = truncate_num(len(messages))
    contact_count = truncate_num(len(contacts))
    group_count = len(groups)
    # first_msg = messages.iloc[0].text # Could be NONE

    return [
            f"Analyzing over {msg_count} messages...",
            f"Neil Papworth sent the first SMS reading \"Merry Christmas\" on December 3rd, 1992.",
            # f"Your first message began {first_msg}",
            f"Parsing conversations with over {contact_count} contacts...",
            f"16 million messages are sent every minute. How many were yours?",
            f"Reading all your most embarrassing messages...",
            f"Digging through {group_count} group chats...",
            ]

def contact_info(number):
    info_dict = {}
    contact = dm.contact(number)
    if contact != None:
        name = contact.get('Name', contact.get('Value'))
        if not name:
            name = str(number)
        info_dict['name'] = name
        info_dict['first'] = contact.get('First', '')
        info_dict['last'] = contact.get('Last', '')
    else:
        info_dict['first'] = ''
        info_dict['last'] = ''
        info_dict['name'] = str(number)
    return info_dict

def group_info(id):
    info_dict = {}
    ch_join = dm.ch_join()
    handles = dm.handles()
    messages = dm.group_messages(id)
    chats = dm.chats()

    info_dict['name'] = chats.loc[id].display_name or ''
    group_handles = ch_join[ch_join.chat_id == id].handle_id
    info_dict['members'] = _first_names(group_handles)

    return info_dict

def simple_stats(number):
    info_dict = {}
    messages = dm.messages(number)
    sent, received = split_sender(messages)
    info_dict['sent'] = sent.shape[0]
    info_dict['received'] = received.shape[0]

    return info_dict

def conversation_stats(number, convo_gap=timedelta(hours=14)):
    info_dict = {}
    messages = dm.messages(number)
    all_msgs = dm.messages()

    messages = messages.sort_values(by=['date'])
    info_dict['oldest_date'] = 0 if messages.empty else ts(messages.iloc[0].date)
    info_dict['newest_date'] = 0 if messages.empty else ts(messages.iloc[-1].date)

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

def group_contacts(group):
    info_dict = {}
    # contacts = dm.contacts()
    # contact = contacts[contacts['value'] == parse_num(number)]
    # try:
    #     contact = contact.iloc[0] # number often matches twice for imessage v. sms
    #     info_dict['name'] = str(contact.Name)
    #     info_dict['first'] = contact.get('First', '')
    #     info_dict['last'] = contact.get('Last', '')
    # except Exception as e:
    #     info_dict['first'] = ''
    #     info_dict['last'] = ''
    #     info_dict['name'] = str(number)
    # return info_dict
    #
    # group_handles = ch_join[ch_join.chat_id == group].handle_id
    # info_dict['people'] = group_handles.count()
    # info_dict['count'] = messages.shape[0]
    return info_dict

# Summary information for a group. Used to populate the group list.
def group_summary(group):
    info_dict = {}
    ch_join = dm.ch_join()
    messages = dm.group_messages(group)
    chats = dm.chats()

    group_handles = ch_join[ch_join.chat_id == group].handle_id
    info_dict['id'] = group
    info_dict['people'] = group_handles.count()
    info_dict['count'] = messages.shape[0] # TODO: rename to avoid conflict with panda definition
    info_dict['name'] = chats.loc[group].display_name
    info_dict['members'] = _first_names(group_handles)
    sorted_messages = messages.sort_values(by=['date'])
    info_dict['oldest_date'] = 0 if messages.empty else ts(messages.iloc[0].date)
    info_dict['newest_date'] = 0 if messages.empty else ts(messages.iloc[-1].date)
    return info_dict

def group_connection_graph():
    MIN_MESSAGE_THRESHOLD = 20
    MAX_NODE_COUNT = 150

    connection_matrix = {}
    handles = dm.handles().set_index(['ROWID'])
    ch_join = dm.ch_join()
    groups = dm.groups()

    for i in groups.index:
        group = groups.loc[i]
        count = group['count']
        id = group.id
        chat_handles = handles.reindex(ch_join[ch_join.chat_id == id].handle_id)
        for pair in itertools.combinations(chat_handles.id.values, 2):
            if pair not in connection_matrix:
                connection_matrix[pair] = 0
            connection_matrix[pair] += count

    sorted_matrix = sorted(connection_matrix.items(), key=lambda item:item[1])
    sorted_matrix = filter(lambda x: x[1] > MIN_MESSAGE_THRESHOLD, sorted_matrix)

    edges = []
    nodes_set = set()
    for k, v in sorted_matrix:
        if (len(nodes_set) >= MAX_NODE_COUNT):
            if k[0] in nodes_set or k[1] in nodes_set:
                continue

        edges.append({'from': k[0], 'to': k[1], 'value': v.item()})
        nodes_set.add(k[0])
        nodes_set.add(k[1])

    nodes = []
    for i in list(nodes_set):
        contact = data_manager.safe_contact(i)
        node = {'id': i, 'label': contact['First'], 'title': contact['Name']}
        nodes.append(node)

    return {'nodes': nodes, 'edges': edges}

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

def frequency(message_df, period='M', filter=None):
    if filter:
        message_df = message_df.dropna(subset = ['text'])
        message_df = message_df[message_df.text.str.contains(filter)]
    return frequency_plot(message_df, period)

def streak(number):
    messages = dm.messages(number)
    current, longest = _streak_stats(messages)
    return {'current_streak': current, 'longest_streak': longest}

def group_streak(group):
    messages = dm.group_messages(group)
    current, longest = _streak_stats(messages)
    return {'current_streak': current, 'longest_streak': longest}

def _streak_stats(messages):
    first = ts(data_manager.messages().date.min())
    last = ts(data_manager.messages().date.max())
    dates = pd.date_range(first, last, freq='d')
    bins = dates.map(lambda d: val(d))
    day_counts = messages.date.value_counts(sort=False, bins=bins).tolist()

    max_streak = 0
    current = 0
    for i in day_counts:
        if i == 0:
            max_streak = max(current, max_streak)
            current = 0
        else:
            current += 1
    max_streak = max(max_streak, current)

    return current, max_streak

# Return a list of names for a list of handles
def _first_names(group_handles):
    handles = dm.handles()

    members = []
    chat_handles = handles.set_index(['ROWID']).reindex(group_handles)
    for i in chat_handles.id:
        contact = dm.contact(i)
        if contact == None:
            members.append(str(i))
        else:
            members.append(contact['First'] or str(i))
    return members

if __name__ == '__main__':
    import pdb; pdb.set_trace()
