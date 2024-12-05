import emoji
import regex

import src.data_manager as data_manager
import src.util  as util
import src.configuration as config

import pandas as pd

def _extract_emoji(text):
    emoji_list = []
    data = regex.findall(r'\X', text)
    return [e.chars[0] for e in emoji.analyze(data)]

# This call is expensive; the result is cached.
def _all_emojis(isFromMe = None):
    all = config.get_all_emoji(isFromMe)
    if all != None:
        return all

    messages = data_manager.messages()
    if (isFromMe != None) :
        messages = messages[messages.is_from_me == isFromMe]

    all_text = messages.text.str.cat(sep = " ")
    emoji = _extract_emoji(all_text)
    config.set_all_emoji(emoji, isFromMe)
    return emoji

def _top_emojis(messages, n, all_emojis):
    text = messages.text.str.cat(sep = " ")
    emoji_list = _extract_emoji(text)
    value_count = pd.Series(emoji_list).value_counts()
    pop = value_count.iloc[:n].keys()
    top = ''.join(pop.tolist())

    unique_emojis = util.unique(emoji_list, all_emojis)[:n]
    df = pd.DataFrame({'name': unique_emojis.index, 'value': unique_emojis.values})
    unique_emojis = df.to_dict(orient='records')
    unique_emoji = map(lambda v: v['name'], unique_emojis)
    unique = ''.join(list(unique_emoji))

    return top, unique

def contact_summary(messages, n):
    info_dict = {}
    sent = messages[messages.is_from_me == 1]
    received = messages[messages.is_from_me == 0]

    all_sent = _all_emojis(1)
    all_received = _all_emojis(0)

    top_sent, unique_sent = _top_emojis(sent, n, all_sent)
    top_received, unique_received = _top_emojis(received, n, all_received)

    info_dict['popular_sent'] = top_sent;
    info_dict['popular_received'] = top_received;
    info_dict['unique_sent'] = unique_sent;
    info_dict['unique_received'] = unique_received;

    return info_dict

if __name__ == '__main__':
    import pdb; pdb.set_trace()
