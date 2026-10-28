# Recollection Revamp — Rules Spec v0.1

A real-time, two-player card battle modeled on *Assassin's Creed Recollection* (Ubisoft, iPad, 2011).
Rules marked **[orig]** follow the original as documented by reviews and the fan wiki.
Rules marked **[fix]** deliberately change the original. Rules marked **[decided]** fill gaps the
sources don't cover. Every number in this document lives in `src/engine/config.ts` and can be tuned.

## 1. Goal

- The board has **three regions**. **[orig]**
- Reaching **10 influence** in a region gives you control of it. **[orig]**
- At **dusk** (end of each day), a player who controls **two or more** regions wins. **[decided]**
  Checking at dusk instead of instantly gives the opponent until the end of the day to respond.
- Matches are capped at **20 days**. When the cap is reached, the player with more controlled
  regions wins. If that's tied, the player with more total influence wins. Otherwise the match
  is a draw. **[decided]**

## 2. Time

- The game runs on a fixed clock: **1 day = 60 ticks**. At normal speed, 6 ticks pass per
  second, so a day lasts 10 seconds. **[decided]**
- Each day has a day half and a night half of 30 ticks each. The night half is only a visual
  marker: nothing behaves differently at night. Most things take **half a day (30 ticks)**.
  **[orig]**
- "Quick" actions resolve in **6 ticks**. **[orig]** (The original said many actions resolve
  quickly; the exact speed is our choice.)

## 3. Economy and hand

- Each player starts with **4 gold** and an income of **1 gold per day**. Income is paid at
  dusk. **[orig]**
- Your opening ready hand is **6 cards**. Once per match, before you play your first card, you
  may **reshuffle** your hand into your deck and draw 6 new cards. **[orig]**
- At each dusk you draw **1 card** if your hand has fewer than 6. **[orig]**
- An empty deck has no penalty: you simply stop drawing.

## 4. Cards ("Memories")

Every card has a **cost** in gold, paid when you play it, and a **specialty**.

### Agents

Agents have **Strength**, which works like health, and **Influence**, which is how much
influence they add when they campaign and how much damage they deal in a conflict. **[orig]**

1. **Recruit:** play the card. The agent spends half a day recruiting, then waits at your
   headquarters (HQ) ready for orders. Any "on arrive" ability triggers at this point.
2. **Campaign:** send a ready agent to a region. It campaigns there for half a day. You may have
   at most **2 agents campaigning in one region**. **[orig]**
3. **Resolve:** when a campaign finishes:
   - **Uncontested** (no enemy agent campaigning in that region): add the agent's Influence to
     the region, and trigger any "on campaign" ability. **[orig]**
   - **Contested:** the agent fights the enemy agent that has been in the region longest. Each
     loses Strength equal to the other's Influence. An agent at 0 Strength is eliminated and its
     card goes to the archive. Survivors add no influence. **[orig]** Both agents' campaigns end
     here. **[decided]**
4. **Rest:** either way, surviving agents return to HQ and rest for half a day before they can
   act again. **[orig]**
5. Damage **persists** for the rest of the match. **[decided]** Some cards heal.
6. A player can have at most **6 agents** in play. **[decided]**

Agent keywords **[decided]**:

- **Stealth:** this agent's campaigns are never contested, and it never contests others.
- **First strike:** in a conflict, this agent deals its damage first. If that eliminates the
  enemy, the enemy deals no damage back.

### Sites

- Play a site into a region. It takes half a day to build. **[orig]**
- At every dusk, each built site adds its influence to its region for its owner. **[orig]**
- Some sites have daily effects, such as gaining gold. **[decided]**
- You may have at most **2 sites per region**. **[decided]**

### Actions

- One-shot effects that target a region, an agent, a site, or nothing. **[orig]**
- Each action resolves after either half a day or a quick delay. **[orig]**
- If the target is gone by the time the action resolves, the action **fizzles** and the gold is
  not refunded. **[decided]**

## 5. Influence

- Each player's influence in a region ranges from 0 to 10.
- When a gain would take you past 10, the excess **erodes** your opponent's influence in that
  region instead. **[fix]** In the original, erosion only happened once both players were at 10,
  so extra influence was wasted.
- You keep control of a region while your influence stays at 10. If both players are at 10, the
  current controller keeps it. Dropping below 10 loses control, and the opponent takes the region
  if they are at 10.

## 6. Deck building ("Sequences")

- A sequence has **30–60 cards**. **[fix]** The original required 50–300.
- At most **3 copies** of any card, and **1 copy** of a unique card. Only one copy of a unique
  agent can be in play at a time. **[decided]**
- Specialties: **Gold** is open to every sequence, plus up to **two** other specialties of your
  choice. **[orig]**
- Ready-made starter sequences are included, with no random paid packs. **[fix]**

## 7. Specialties

| Specialty | Identity |
|-----------|----------|
| Gold | Economy: merchants, banks, bribes. Allowed in every sequence. |
| Crime | Thieves and assassins: stealth, stealing gold, sabotage, poison. |
| Faith | High-influence clergy, cheap sites, healing. |
| Media | Draining enemy influence, rumors, sending agents back to hand. |
| Order | Tough soldiers who win conflicts. |
| Scholar | Drawing cards, efficiency, Leonardo's inventions. |

## 8. Order of operations each tick

1. Advance the clock by one tick.
2. Resolve everything due this tick, in this order: actions, agents finishing recruiting,
   campaigns (earliest-sent first), agents finishing rest, sites finishing construction.
3. If this tick ends a day (**dusk**), then in this order: sites add influence and run daily
   effects; check for a winner (including the day cap); pay income; draw cards.

Player commands (play a card, send an agent, reshuffle) are applied between ticks. For any
given seed and sequence of commands, the engine always produces the same result.
