# Feature Plan

Generated from a brainstorming session. Implement in any order unless dependencies are noted.

---

## 1. Expandable Match Rows
**Tab:** Match History

The match history table currently shows a hover tooltip with age-up times. Replace/extend this with a clickable expanded row that shows a full per-game breakdown.

Suggested expanded content:
- Age-up times comparison (already in hover, move here)
- Duration, map, civs — already visible in the row, but could be formatted more richly in the expanded view

---

## 2. Rivalry Arc Visualization ✅
**Tab:** Match History (new section above the table) or a new "Arc" tab

Show the shape of the rivalry over time — not just the current score. Options:
- Cumulative wins over game number (two lines, one per player)
- Running win rate % over game number
- "Era" bands highlighting dominant stretches

**Bonus:** Clicking a data point on the arc chart should scroll/highlight the corresponding match in the history table below.

---

## 3. Map detail page ✅
**Tab:** New tab

Show the overall stats for that map past winrate. Options:
- Average age up times for that map
- Any other features (Suggest them before implementing!)

Implementation notes:

- Not sure best way to implement this; maybe a new POST endpoint?

---


## 4. Civ Picker — Variety Weighting ✅
**Tab:** Civ Picker

Currently picks 3 civs at pure random. Weight the randomness so that never-picked or rarely-picked civs surface more often, nudging diversity over time.

Implementation notes:
- The never-picked civ list is already computed in `FunStats.jsx` — reuse that logic
- Could weight by: (1) never picked = highest weight, (2) picked once = medium, (3) frequently picked = lowest
- Match data is already available via `/api/matches`; fetch it in the picker and compute weights client-side

---

## 6. More Fun Stats Cards
**Tab:** Fun Stats

The Fun Stats tab has room for more cards. No specific ideas locked in yet — this is an open slot.

---

## 7. Remove Map Breakdown from Stats Tab
**Tab:** Stats

The per-player map breakdown in `Stats.jsx` is redundant with the Maps tab. Remove it to simplify the Stats tab.

---

## Rejected / Out of Scope
- Auto-ingest via file watcher — good idea, complexity TBD, not prioritized
- Editable Rules tab — needs auth, too complex for now
- Rematch launcher, Sensei mode in Civ Picker — not needed
