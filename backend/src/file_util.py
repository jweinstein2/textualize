# file_util.py
# Currently only supports MacOS
import subprocess
import sqlite3
from pathlib import Path, PurePath
import pandas as pd

MESSAGES = '3d0d7e5fb2ce288813306e4d4636395e047a3d28'
CONTACTS = '31bb7ba8914766d4ba40d6dfb6113c8b614be442'

# Returns the path within application data
# Creates the directory if necessary
def app_data_path(filename):
    path = Path('~/Library/Application Support/textualize/{}'.format(filename))
    path = path.expanduser()
    res = Path.mkdir(path.parent, parents=True, exist_ok=True)
    return path

# Finds possible sources
# TODO: Add iMessage desktop app backup location
# TODO: display timestamps if multiple backups exists
# TODO: Windows Support
def guess_src():
    possible = {}

    # iPhone backup location
    backup_dir = Path('~/Library/Application Support/MobileSync/Backup/')
    backup_dir = backup_dir.expanduser()
    if backup_dir.is_dir():
        for item in backup_dir.iterdir():
            if item.stem[0] == '.':
                continue
            possible['iphone'] = str(PurePath(backup_dir, item))

    # MacOS iMessage backup location
    # possible['desktop'] = Path(...)

    return possible

# Fetch any necessary message databases.
# Returns False if an error occured.
# Otherwise a tuple |4| containing:
#    1. message_df
#    2. handle_df
#    3. ch_join
#    4. cm_join
def fetch_message_tables(backup_path):
    try:
        message_db = subprocess.check_output("find '" + backup_path + "' -iname '" + MESSAGES + "'", shell=True).splitlines()[0].decode("utf-8")
    except subprocess.CalledProcessError as e:
        return e, None

    connection = sqlite3.connect(message_db)
    cur = connection.cursor()
    message_df = pd.read_sql_query("SELECT * FROM message", connection)
    handle_df = pd.read_sql_query("SELECT * FROM handle", connection)
    ch_join = pd.read_sql_query("SELECT * FROM chat_handle_join", connection)
    cm_join = pd.read_sql_query("SELECT * FROM chat_message_join", connection)
    chat = pd.read_sql_query("SELECT * FROM chat", connection)
    cur.close()
    connection.close()


    # Filter message table to be only what we need (lots of columns)
    message_df = message_df[['ROWID', 'text', 'account', 'type', 'handle_id', 'service', 'date', 'date_read', 'date_delivered', 'is_from_me', 'associated_message_type']]

    return None, (message_df, handle_df, ch_join, cm_join, chat)

def fetch_contact_table(backup_path):
    try:
        contact_db = subprocess.check_output("find '" + backup_path + "' -iname '" + CONTACTS + "'", shell=True).splitlines()[0].decode("utf-8")
    except subprocess.CalledProcessError as e:
        return e, None

    connection = sqlite3.connect(contact_db)
    cur = connection.cursor()
    query = """
        Select
            ABPerson.First,
            ABPerson.Last,
            ABMultiValue.value
        from
            ABPerson,
            ABMultiValue
        where
            ABMultiValue.value IS NOT NULL
                AND
            ABPerson.ROWID = ABMultiValue.record_id
        order by
            ABPerson.First,
            ABPerson.Last"""
    connection = sqlite3.connect(contact_db)
    cur = connection.cursor()
    contact_df =  pd.read_sql_query(query, connection)
    cur.close()
    connection.close()
    return None, contact_df

if __name__ == '__main__':
    import pdb; pdb.set_trace()
