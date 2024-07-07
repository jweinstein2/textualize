import emoji
import regex

import src.data_manager as data_manager
from src.util import *

def _extract_emoji(text):
    emoji_list = []
    data = regex.findall(r'\X', text)
    for word in data:
        if any(char in emoji.UNICODE_EMOJI['en'] for char in word):
            emoji_list.append(word)
    return emoji_list

# TODO: Expensive. This should be cached.
def _all_emojis():
    all_text = data_manager.messages().text.str.cat(sep = " ")
    return _extract_emoji(all_text)

def contact_summary(messages, n):
    info_dict = {}
    text = messages.text.str.cat(sep = " ")
    emoji_list = _extract_emoji(text)

    info_dict['total_sent'] = len(emoji_list)
    value_count = pd.Series(emoji_list).value_counts()
    top_value_count = value_count[:n]
    top_value_count['other'] = value_count[n:].cumsum()[-1]
    df = pd.DataFrame({'name':top_value_count.index, 'value':top_value_count.values})
    info_dict['popular_pie'] = df.to_dict(orient='records')

    unique_emojis = unique(emoji_list, _all_emojis())[:5]
    df = pd.DataFrame({'name': unique_emojis.index, 'value': unique_emojis.values})
    info_dict['unique'] = df.to_dict(orient='records')
    return info_dict

if __name__ == '__main__':
    import pdb; pdb.set_trace()
