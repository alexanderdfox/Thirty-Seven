"""Level/Era definitions for Thirty Seven"""

import random

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


def generate_random_level(level_number):
    """Generate an infinite random level. Difficulty scales with level_number."""
    rng = random.Random(level_number)  # Seed for reproducibility per level

    # Dark, varied background
    base = rng.randint(2, 25)
    bg = (
        base,
        base + rng.randint(0, 10),
        base + rng.randint(5, 25),
    )

    # Difficulty scales: more pale ones, more crowd, higher awaken goal
    pale_count = min(12, 4 + level_number // 2)
    crowd_count = min(30, 8 + level_number)
    awaken_goal = min(crowd_count - 2, 5 + level_number // 2)

    # Spawn positions - avoid center (wanderer start)
    def rand_pos():
        x = 0.15 + rng.random() * 0.7
        y = 0.15 + rng.random() * 0.7
        return (round(x, 2), round(y, 2))

    pale_ones = [rand_pos() for _ in range(pale_count)]
    crowd = [rand_pos() for _ in range(crowd_count)]

    era_names = [
        "THE RIFT", "ECHO", "ETERNAL RETURN", "THE CYCLE",
        "VOID", "THE SPARK", "LONGING", "THE NOTE",
    ]
    name = f"{rng.choice(era_names)} #{level_number}"

    return {
        "name": name,
        "subtitle": "The fire never dies.",
        "bg": bg,
        "wanderer": (0.5, 0.5),
        "pale_ones": pale_ones,
        "crowd": crowd,
        "awaken_goal": max(3, awaken_goal),
    }
