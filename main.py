replay_dir = r"C:\Users\dkama\Games\Age of Empires 2 DE\76561197984930820\savegame"

import os
from mgz.summary import Summary
import psycopg2 as pg2
from datetime import datetime, timedelta

def parse_datetime(filename):
    parts = filename.split('@')[1].split(' ')
    return datetime.strptime(f"{parts[0]} {parts[1]}", "%Y.%m.%d %H%M%S")


if __name__ == "__main__":
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("DATABASE_URL environment variable is not set.")
        exit(1)
    conn = pg2.connect(db_url)
    c = conn.cursor()
    c.execute("SELECT played_at FROM match")
    existing = {str(row[0]) for row in c.fetchall()}
    new_matches = []
    total_files = len(os.listdir(replay_dir))
    [inserts, non_replays, non_mp, wrong_players, short_games, already_processed] = [0] * 6
    for f in os.listdir(replay_dir):
        print("\nLooking at file:", f)
        if not f.endswith(".aoe2record"):
            print("\tSkipping non-replay file:", f)
            non_replays += 1
            continue
        elif not f.startswith("MP Replay"):
            print("\tSkipping non-multiplayer replay file:", f)
            non_mp += 1
            continue
        filepath = os.path.join(replay_dir, f)
        played_at = parse_datetime(f)
        if str(played_at) in existing:
            print(f"\tSkipping already-processed: {f}")
            already_processed += 1
            continue
        with open(filepath, "rb") as fh:
            summary = Summary(fh)
            players = summary.get_players()
            map_name = summary.get_map()['name']
            duration = timedelta(milliseconds=summary.get_duration())
            if len(players) != 2:
                print("\tThis replay does not have exactly 2 players.")
                wrong_players += 1
                continue
            elif set([players[0]['name'], players[1]['name']]) != set(["Kamarill", "Schnozberries"]):
                print("\tThis replay does not have the expected players.")
                wrong_players += 1
                continue
            elif duration.total_seconds() < 300:
                print("\tThis replay is too short to be a valid match.")
                short_games += 1
                continue
            else:
                kam = players[0] if players[0]['name'] == "Kamarill" else players[1]
                schnoz = players[0] if players[0]['name'] == "Schnozberries" else players[1]
                new_matches.append((kam['civilization'], schnoz['civilization'], 1 if kam['winner'] else 2, played_at, duration.total_seconds(), map_name))

    if new_matches:
        c.executemany('''INSERT INTO match (kam_civ_id, schnoz_civ_id, winner, played_at, duration, map)
                         VALUES (%s, %s, %s, %s, %s, %s)''', new_matches)
        conn.commit()
        print(f"Inserted {len(new_matches)} new match(es).")
    
    print("Summary:")
    print(f"\tTotal files: {total_files}")
    print(f"\tNon-replay files: {non_replays}")
    print(f"\tNon-multiplayer replays: {non_mp}")
    print(f"\tReplays with wrong players: {wrong_players}")
    print(f"\tShort games: {short_games}")
    conn.close()