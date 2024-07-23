import emoji
import regex

import src.data_manager as data_manager
from src.util import *

def _extract_emoji(text):
    emoji_list = []
    data = regex.findall(r'\X', text)
    return [e.chars[0] for e in emoji.analyze(data)]

# TODO: Expensive. This should be cached.
def _all_emojis():
    all_text = data_manager.messages().text.str.cat(sep = " ")
    return _extract_emoji(all_text)

def contact_summary(messages, n):
    info_dict = {}
    text = messages.text.str.cat(sep = " ")
    emoji_list = _extract_emoji(text)

    value_count = pd.Series(emoji_list).value_counts()

    pop = value_count.iloc[:n].keys()
    string_pop = ''.join(pop.tolist())
    info_dict['popular_sent'] = string_pop;

    # TODO: Fill these in
    info_dict['popular_received'] = 'TODO';
    info_dict['unique_sent'] = 'TODO';
    info_dict['unique_received'] = 'TODO';

    # unique_emojis = unique(emoji_list, _all_emojis())[:5]
    # df = pd.DataFrame({'name': unique_emojis.index, 'value': unique_emojis.values})
    # info_dict['unique'] = df.to_dict(orient='records')

    return info_dict

if __name__ == '__main__':
    import pdb; pdb.set_trace()
