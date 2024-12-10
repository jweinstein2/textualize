# file_util.py
# Currently only supports MacOS
import subprocess
import sqlite3
from pathlib import Path, PurePath
import pandas as pd
import glob
import os

MESSAGES = '3d0d7e5fb2ce288813306e4d4636395e047a3d28'
CONTACTS = '31bb7ba8914766d4ba40d6dfb6113c8b614be442'

# Returns the path within application data
# Creates the directory if necessary
def app_data_path(filename):
    path = Path('~/Library/Application Support/textualize/{}'.format(filename))
    path = path.expanduser()
    res = Path.mkdir(path.parent, parents=True, exist_ok=True)
    return path

def backup_message_db(backup_path):
    message_db = Path.home() / backup_path / '3d' / MESSAGES
    if (not Path.exists(message_db)):
        return None
    return message_db

def backup_contact_db(backup_path):
    try:
        contact_db = subprocess.check_output("find '" + backup_path + "' -iname '" + CONTACTS + "'", shell=True).splitlines()[0].decode("utf-8")
    except subprocess.CalledProcessError as e:
        return None
    return contact_db

def mac_message_db():
    path = Path('~/Library/Messages/chat.db')
    return path.expanduser()

# TODO: This might fail if there are multiple contact sources
def mac_contact_db():
    ADDRESS_BOOK = Path('~/Library/Application Support/AddressBook/Sources/').expanduser().as_posix()
    CONTACT_DB = 'AddressBook-v22.abcddb'
    try:
        contact_db = subprocess.check_output("find '" + ADDRESS_BOOK + "' -iname '" + CONTACT_DB + "'", shell=True).splitlines()[0].decode("utf-8")
    except subprocess.CalledProcessError as e:
        return None
    return contact_db


# Fetch any necessary message databases.
# Returns False if an error occured.
# Otherwise a tuple |4| containing:
#    1. message_df
#    2. handle_df
#    3. ch_join
#    4. cm_join
def fetch_message_tables(message_db):
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

def fetch_contact_table(contact_db):
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
    contact_df =  pd.read_sql_query(query, connection)
    cur.close()
    connection.close()
    return None, contact_df

def fetch_mac_contact_table(contact_db):
    connection = sqlite3.connect(contact_db)
    cur = connection.cursor()
    query = """
                SELECT
                            ZABCDRECORD.ZFIRSTNAME as First,
                            ZABCDRECORD.ZLASTNAME as Last,
                            ZABCDRECORD.Z_PK,
                            ZABCDPHONENUMBER.ZFULLNUMBER as Number,
                            ZABCDEMAILADDRESS.ZADDRESS as Email
                FROM
                            ((ZABCDRECORD
                    LEFT JOIN ZABCDPHONENUMBER ON ZABCDRECORD.Z_PK=ZABCDPHONENUMBER.ZOWNER)
                    LEFT JOIN ZABCDEMAILADDRESS ON ZABCDRECORD.Z_PK=ZABCDEMAILADDRESS.ZOWNER)
                ORDER BY
                            ZABCDRECORD.ZFIRSTNAME,
                            ZABCDRECORD.ZLASTNAME
            """
    contact_df =  pd.read_sql_query(query, connection)
    cur.close()
    connection.close()
    return None, contact_df

if __name__ == '__main__':
    import pdb; pdb.set_trace()
