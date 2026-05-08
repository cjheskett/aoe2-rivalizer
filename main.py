civs = ["Achaemenids",
"Armenians",
"Athenians",
"Aztecs",
"Bengalis",
"Berbers",
"Bohemians",
"Britons",
"Bulgarians",
"Burgundians",
"Burmese",
"Byzantines",
"Celts",
"Chinese",
"Cumans",
"Dravidians",
"Ethiopians",
"Franks",
"Georgians",
"Goths",
"Gurjaras",
"Hindustanis",
"Huns",
"Incas",
"Italians",
"Japanese",
"Jurchens",
"Khitans",
"Khmer",
"Koreans",
"Lithuanians",
"Macedonians",
"Magyars",
"Malay",
"Malians",
"Mapuche",
"Maya",
"Mongols",
"Muisca",
"Persians",
"Poles",
"Portuguese",
"Puru",
"Romans",
"Saracens",
"Shu",
"Sicilians",
"Slavs",
"Spanish",
"Spartans",
"Tatars",
"Teutons",
"Thracians",
"Tupi",
"Turks",
"Vietnamese",
"Vikings",
"Wei",
"Wu"]

replay_dir = r"C:\Users\dkama\Games\Age of Empires 2 DE\76561197984930820\savegame"

import os
import random
from mgz.summary import Summary
import sqlite3

def remake_table():
    conn = sqlite3.connect("match_history.db")
    c = conn.cursor()
    c.execute('''DROP TABLE IF EXISTS match''')
    c.execute('''CREATE TABLE IF NOT EXISTS match
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  kam_civ_id INTEGER,
                  schnoz_civ_id INTEGER,
                  winner INTEGER,
                  date DATE,
                  time TIME,
              duration TIME)''')
    conn.commit()
    conn.close()

def get_random_civs(num_civs):
    return random.sample(civs, num_civs)

def parse_date(filename):
    # Extract the date part from the filename
    date_str = filename.split('@')[1].split(' ')[0]
    # Convert the date string to a datetime object
    from datetime import datetime
    date_obj = datetime.strptime(date_str, "%Y.%m.%d")
    return date_obj.strftime("%Y-%m-%d")

def parse_time(filename):
    # Extract the time part from the filename
    time_str = filename.split('@')[1].split(' ')[1]
    # Convert the time string to a datetime object
    from datetime import datetime
    time_obj = datetime.strptime(time_str, "%H%M%S")
    return time_obj.strftime("%H:%M:%S")

def parse_duration(milliseconds):
    # Convert milliseconds to a timedelta object
    from datetime import timedelta
    duration = timedelta(milliseconds=milliseconds)
    return duration

if __name__ == "__main__":
    
    new_db = "match_history.db"
    """test_file = r"MP Replay v101.103.44206.0 @2026.05.02 143023 (1).aoe2record"
    f = os.path.join(replay_dir, test_file)
    with open(f, "rb") as fh:
        summary = Summary(fh)
        players = summary.get_players()
        milliseconds = summary.get_duration()
        duration = parse_duration(milliseconds)
        print("Duration:", duration)
        
        exit()"""
    remake_table()

    for f in os.listdir(replay_dir):
            print("Looking at file:", f)
            if not f.endswith(".aoe2record"):
                print("Skipping non-replay file:", f)
                continue
            elif not f.startswith("MP Replay"):
                print("Skipping non-multiplayer replay file:", f)
                continue
            filepath = os.path.join(replay_dir, f)
            with open(filepath, "rb") as fh:
                summary = Summary(fh)
                players = summary.get_players()
                date = parse_date(f)
                time = parse_time(f)
                duration = parse_duration(summary.get_duration())
                if len(players) != 2:
                    print("This replay does not have exactly 2 players.")
                elif set([players[0]['name'], players[1]['name']]) != set(["Kamarill", "Schnozberries"]):
                    print("This replay does not have the expected players.")
                elif duration.total_seconds() < 300:
                    print("This replay is too short to be a valid match.")
                else:
                    kam = players[0] if players[0]['name'] == "Kamarill" else players[1]
                    schnoz = players[0] if players[0]['name'] == "Schnozberries" else players[1]
                    conn = sqlite3.connect(new_db)
                    c = conn.cursor()
                    c.execute('''INSERT INTO match (kam_civ_id, schnoz_civ_id, winner, date, time, duration) VALUES (?, ?, ?, ?, ?, ?)''', (kam['civilization'], schnoz['civilization'], 1 if kam['winner'] else 2, date, time, duration.total_seconds()))
                    conn.commit()
                    conn.close()
                #print("Map:", summary.get_map())
                #print("Settings:", summary.get_settings())
    exit()



    num_civs = int(input("Enter the number of civilizations to select: "))
    selected_civs = get_random_civs(num_civs)
    print("Selected Civilizations:")
    for civ in selected_civs:
        print(civ)
