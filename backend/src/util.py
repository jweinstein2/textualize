import pandas as pd
import re
from datetime import date, datetime, timedelta

def ts(val):
    val = val / 10 ** 9
    unix = datetime(1970, 1, 1)  # UTC
    cocoa = datetime(2001, 1, 1)  # UTC
    delta = cocoa - unix
    timestamp = datetime.fromtimestamp(val) + delta
    timestamp.strftime('%Y-%m-%d %H:%M:%S')
    return pd.to_datetime(timestamp)

def parse_num(num):
    return "".join(list(filter(str.isdigit, num)))[-10:]

def split_sender(msg):
    sent = msg.loc[msg.is_from_me == 1]
    received = msg.loc[msg.is_from_me == 0]
    return sent, received

def split_group(msg):
    group = msg.loc[msg.is_group == 1]
    individual = msg.loc[msg.is_group == 0]
    return individual, group

def extract_words(msg):
    text = "\n".join(filter(None, msg['text'].tolist()))
    words = list(map(lambda s: s.lower(), re.compile('\w+').findall(text)))
    return words, text

def unique(subset, corpus, threshold=5):
    subset_count = pd.Series(subset).value_counts()
    corpus_count = pd.Series(corpus).value_counts()
    unique = subset_count.divide(corpus_count).dropna().sort_values(ascending=False)

    drop = list(filter(lambda x: subset_count[x] < threshold, unique[unique == 1].keys()))
    unique = unique.drop(labels = drop)

    return unique

if __name__ == '__main__':
    import pdb; pdb.set_trace()
