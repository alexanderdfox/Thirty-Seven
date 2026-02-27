"""Level/Era definitions for Thirty Seven"""

# Each level: name, bg_color, (wanderer_start), [pale_ones], [crowd], awaken_goal
# Positions as (x, y) percentages of screen

LEVELS = [
    {
        "name": "THE BIRTHPLACE",
        "subtitle": "One cycle. One condition. Forever true.",
        "bg": (5, 5, 20),
        "wanderer": (0.5, 0.5),
        "pale_ones": [],
        "crowd": [(0.2, 0.3), (0.8, 0.3), (0.5, 0.8), (0.3, 0.6), (0.7, 0.5)],
        "awaken_goal": 3,
    },
    {
        "name": "OLD WORLD TAVERN",
        "subtitle": "A song. The only song I know.",
        "bg": (25, 20, 15),
        "wanderer": (0.2, 0.5),
        "pale_ones": [(0.8, 0.3), (0.9, 0.7)],
        "crowd": [
            (0.4, 0.4), (0.5, 0.5), (0.6, 0.4),
            (0.35, 0.7), (0.65, 0.7), (0.5, 0.25),
        ],
        "awaken_goal": 4,
    },
    {
        "name": "NEON ALLEY",
        "subtitle": "The promise that the cycle continues.",
        "bg": (15, 10, 35),
        "wanderer": (0.5, 0.5),
        "pale_ones": [(0.1, 0.2), (0.9, 0.2), (0.1, 0.8), (0.9, 0.8)],
        "crowd": [
            (0.2, 0.5), (0.3, 0.4), (0.3, 0.6),
            (0.7, 0.5), (0.8, 0.4), (0.8, 0.6),
            (0.5, 0.2), (0.5, 0.8),
        ],
        "awaken_goal": 5,
    },
    {
        "name": "FOREST",
        "subtitle": "Before the kingdoms. There was always the cycle.",
        "bg": (8, 15, 8),
        "wanderer": (0.5, 0.5),
        "pale_ones": [(0.15, 0.15), (0.85, 0.15), (0.5, 0.1), (0.2, 0.8), (0.8, 0.8)],
        "crowd": [
            (0.25, 0.3), (0.75, 0.3), (0.25, 0.7), (0.75, 0.7),
            (0.5, 0.4), (0.4, 0.6), (0.6, 0.6),
        ],
        "awaken_goal": 5,
    },
    {
        "name": "THE CROWD",
        "subtitle": "Awaken! They wanted to feel alive.",
        "bg": (15, 10, 20),
        "wanderer": (0.5, 0.5),
        "pale_ones": [(0.1, 0.5), (0.9, 0.5), (0.5, 0.1), (0.5, 0.9), (0.2, 0.2), (0.8, 0.8)],
        "crowd": [
            (0.2 + (i % 5) * 0.15, 0.2 + (i // 5) * 0.15)
            for i in range(20)
        ],
        "awaken_goal": 12,
    },
    {
        "name": "LIGHTS OUT",
        "subtitle": "Let the darkness come.",
        "bg": (2, 2, 8),
        "wanderer": (0.5, 0.5),
        "pale_ones": [(0.2, 0.2), (0.8, 0.2), (0.2, 0.8), (0.8, 0.8), (0.5, 0.5)],
        "crowd": [(0.3, 0.4), (0.7, 0.4), (0.3, 0.6), (0.7, 0.6), (0.5, 0.5)],
        "awaken_goal": 5,
    },
]
