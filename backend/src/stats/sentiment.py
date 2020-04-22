from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from src.util import *

def contact_summary(messages):
    info_dict = {}
    analyzer = SentimentIntensityAnalyzer()

    def pol(analyzer, text):
        if not text:
            return {'neg': 0, 'neu': 1, 'pos': 0, 'compound': 0}
        return analyzer.polarity_scores(text)

    def extremes(df):
        polarity = df.text.apply(lambda x: pol(analyzer, x))
        df['compound'] = polarity.apply(lambda x: x['compound'])
        df_sort = df.sort_index(by='compound')
        pos = df_sort[-3:][['text', 'compound']]
        neg = df_sort[:3][['text', 'compound']]
        return pos.text.tolist(), neg.text.tolist()

    sent, rcvd = split_sender(messages)
    info_dict['pos_sent'], info_dict['neg_sent'] = extremes(sent)
    info_dict['pos_received'], info_dict['neg_received'] = extremes(rcvd)
    return info_dict

def summary(messages):
    pass
