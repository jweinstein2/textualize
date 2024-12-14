# import textstat
# import enchant

import src.data_manager as data_manager
from src.util import *

def contact_summary(messages):
    info_dict = {}
    sent, received = split_sender(messages)
    # dictionary = enchant.Dict("en_US")

    # TODO: dictionary isn't compiled in production build
    def process(txt, messages):
        words, text = extract_words(messages)
        n_words = len(words)
        # dict_words = list(filter(lambda w: dictionary.check(w), words))
        # n_dict_words = len(dict_words)
        # perc_proper = round(len(dict_words) / len(words) * 100, 1)
        avg_len = sum(list(map(len, words))) / len(words)
        # info_dict[txt + '_readability'] = textstat.text_standard(text, float_output=False)
        info_dict[txt + '_avg_wordlen'] = round(avg_len, 2)
        # info_dict[txt + '_perc_proper'] = perc_proper

    process('received', received)
    process('sent', sent)

    info_dict['unique'] = unique_words(messages)
    return info_dict

def unique_words(messages):
    (words, text) = extract_words(messages)
    (all_words, all_text) = extract_words(data_manager.messages())
    uni = unique(words, all_words)
    UI_SCALE = 100 # Scaling everything up looks better for wordcloud
    df = pd.DataFrame({'text': uni.index, 'value': uni.values * UI_SCALE})[:100]
    return df.to_dict(orient='records')

if __name__ == '__main__':
    import pdb; pdb.set_trace()
