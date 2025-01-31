# import textstat
# import enchant

import src.data_manager as data_manager
from src.util import *

# TODO: Remove / Reuse this code
# def contact_summary(messages):
#     info_dict = {}
#     sent, received = split_sender(messages)
#     # dictionary = enchant.Dict("en_US")
#
#     # TODO: dictionary isn't compiled in production build
#     def process(txt, messages):
#         words, text = extract_words(messages)
#         n_words = len(words)
#         # dict_words = list(filter(lambda w: dictionary.check(w), words))
#         # n_dict_words = len(dict_words)
#         # perc_proper = round(len(dict_words) / len(words) * 100, 1)
#         avg_len = sum(list(map(len, words))) / len(words)
#         # info_dict[txt + '_readability'] = textstat.text_standard(text, float_output=False)
#         info_dict[txt + '_avg_wordlen'] = round(avg_len, 2)
#         # info_dict[txt + '_perc_proper'] = perc_proper
#
#     process('received', received)
#     process('sent', sent)
#     return info_dict

def group_summary(messages):
    info_dict = {}
    info_dict['unique'] = unique_words(messages)
    return info_dict

def unique_words(messages):
    (words, _) = extract_words(messages, True, True)
    (all_words, _) = extract_words(data_manager.messages(), True, True)
    uni = unique(words, all_words)
    df = pd.DataFrame({'text': uni.index, 'value': uni.values})[:100]
    return df.to_dict(orient='records')

def popular_words(messages):
    (words, _) = extract_words(messages, True, True)
    word_counts = pd.Series(words).value_counts().sort_values(ascending=False)[:100]

    df = word_counts.to_frame(name='value').reset_index(names=['text'])
    return df.to_dict(orient='records')

if __name__ == '__main__':
    import pdb; pdb.set_trace()
