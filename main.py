replay_dir = r"C:\Users\dkama\Games\Age of Empires 2 DE\76561197984930820\savegame"

import os
from mgz.summary import Summary
import psycopg2 as pg2
from datetime import datetime, timedelta

def parse_datetime(filename):
    parts = filename.split('@')[1].split(' ')
    return datetime.strptime(f"{parts[0]} {parts[1]}", "%Y.%m.%d %H%M%S")

def parse_duration(milliseconds):
    # Convert milliseconds to a timedelta object
    duration = timedelta(milliseconds=milliseconds)
    return duration

if __name__ == "__main__":
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("DATABASE_URL environment variable is not set.")
        exit(1)
    t = datetime.now()

    for f in os.listdir(replay_dir):
        print("Looking at file:", f)
        if not f.endswith(".aoe2record"):
            print("\tSkipping non-replay file:", f)
            continue
        elif not f.startswith("MP Replay"):
            print("\tSkipping non-multiplayer replay file:", f)
            continue
        filepath = os.path.join(replay_dir, f)                
        played_at = parse_datetime(f)
        print("\tPlayed at:", played_at)
        print("Type of played_at:", type(played_at))
        conn = pg2.connect(db_url)
        c = conn.cursor()
        c.execute("SELECT 1 FROM match WHERE played_at = %s", (played_at.isoformat(),))
        exists = c.fetchone()
        conn.close()
        if exists:
            print(f"\tSkipping already-processed: {f}")
            continue
        with open(filepath, "rb") as fh:
            summary = Summary(fh)
            players = summary.get_players()
            map_name = summary.get_map()['name']
            duration = parse_duration(summary.get_duration())
            if len(players) != 2:
                print("\tThis replay does not have exactly 2 players.")
            elif set([players[0]['name'], players[1]['name']]) != set(["Kamarill", "Schnozberries"]):
                print("\tThis replay does not have the expected players.")
            elif duration.total_seconds() < 300:
                print("\tThis replay is too short to be a valid match.")
            else:
                kam = players[0] if players[0]['name'] == "Kamarill" else players[1]
                schnoz = players[0] if players[0]['name'] == "Schnozberries" else players[1]
                conn = pg2.connect(db_url)
                c = conn.cursor()
                c.execute('''INSERT INTO match (kam_civ_id, schnoz_civ_id, winner, played_at, duration, map)
                             VALUES (%s, %s, %s, %s, %s, %s)''',
                          (kam['civilization'], schnoz['civilization'], 1 if kam['winner'] else 2, played_at, duration.total_seconds(), map_name))
                conn.commit()
                conn.close()
            #print("Map:", summary.get_map())
            #print("Settings:", summary.get_settings())