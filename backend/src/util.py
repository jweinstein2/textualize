import pandas as pd
import re
from datetime import date, datetime, timedelta
import src.data_manager as data_manager
import math # temp

unix = datetime(1970, 1, 1)  # UTC
cocoa = datetime(2001, 1, 1)  # UTC

# TODO:
# Between ts() and val() the timestamp gets
# moved around
def ts(val):
    val = val / (10 ** 9)
    delta = cocoa - unix
    timestamp = datetime.fromtimestamp(val) + delta
    timestamp.strftime('%Y-%m-%d %H:%M:%S')
    return pd.to_datetime(timestamp)

def val(ts):
    delta = cocoa - unix
    ts = ts - delta
    ts = ts.timestamp()
    return ts * (10 ** 9)

# One second precision
def val_from_delta(timedelta):
    secs = timedelta.total_seconds()
    return secs * (10 ** 9)

# One second precision
def delta_from_value(val):
    secs = val / (10 ** 9)
    if math.isnan(secs):
        import pdb; pdb.set_trace()
    return timedelta(seconds=secs)

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

def frequency_plot(message_df, period):
    first = ts(data_manager.messages().date.min())
    last = ts(data_manager.messages().date.max())
    dates = pd.date_range(first, last, freq=period)
    bins = dates.map(lambda d: val(d))

    sent, received = split_sender(message_df)
    freq_sent = sent.date.value_counts(sort=False, bins=bins).tolist()
    freq_received = received.date.value_counts(sort=False, bins=bins).tolist()

    # this could be sped up
    data = [{'Label': str(l), 'Sent': int(s), 'Received': int(r)} for l, s, r in zip(dates[1:], freq_sent, freq_received)]
    return data

if __name__ == '__main__':
    import pdb; pdb.set_trace()
