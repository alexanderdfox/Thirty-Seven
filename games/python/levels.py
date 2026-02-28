"""Level/Era definitions for Thirty Seven — aligned with web 2D"""

import random


def cool_color(seed):
    """Match web coolColor palette."""
    rng = random.Random(seed)
    r = rng.randint(2, 15)
    g = rng.randint(5, 29)
    b = rng.randint(18, 45)
    return (r, min(g, b - 5), b)


# Each level: name, bg_color, (wanderer_start), [pale_ones], [crowd], awaken_goal
# Positions as (x, y) percentages 0–1
# Layouts inspired by constellations (crowd = stars, pale ones = hunters in the void)

LEVELS = [
    # 1. Orion — The Hunter's belt and shoulders
    {
        "name": "THE BIRTHPLACE",
        "bg": (5, 5, 20),
        "wanderer": (0.5, 0.5),
        "pale_ones": [],
        "crowd": [(0.35, 0.5), (0.5, 0.5), (0.65, 0.5), (0.4, 0.35), (0.6, 0.38)],
        "awaken_goal": 3,
    },
    # 2. Ursa Major — The Big Dipper
    {
        "name": "OLD WORLD TAVERN",
        "bg": (25, 20, 15),
        "wanderer": (0.25, 0.55),
        "pale_ones": [(0.8, 0.3), (0.9, 0.7)],
        "crowd": [
            (0.25, 0.6), (0.35, 0.55), (0.45, 0.6), (0.4, 0.5),
            (0.5, 0.45), (0.6, 0.4), (0.7, 0.35),
        ],
        "awaken_goal": 4,
    },
    # 3. Cassiopeia — The W
    {
        "name": "NEON ALLEY",
        "bg": (15, 10, 35),
        "wanderer": (0.5, 0.5),
        "pale_ones": [(0.1, 0.2), (0.9, 0.2), (0.1, 0.8), (0.9, 0.8)],
        "crowd": [
            (0.25, 0.35), (0.38, 0.5), (0.5, 0.35), (0.62, 0.5), (0.75, 0.35),
            (0.4, 0.6), (0.6, 0.6), (0.5, 0.2),
        ],
        "awaken_goal": 5,
    },
    # 4. Cygnus — The Northern Cross
    {
        "name": "FOREST",
        "bg": (8, 15, 8),
        "wanderer": (0.5, 0.5),
        "pale_ones": [(0.15, 0.15), (0.85, 0.15), (0.5, 0.1), (0.2, 0.8), (0.8, 0.8)],
        "crowd": [
            (0.5, 0.25), (0.5, 0.5), (0.5, 0.75), (0.35, 0.5), (0.65, 0.5),
            (0.35, 0.35), (0.65, 0.35), (0.35, 0.65), (0.65, 0.65),
        ],
        "awaken_goal": 5,
    },
    # 5. Lyra + Pleiades — Dense star field
    {
        "name": "THE CROWD",
        "bg": (15, 10, 20),
        "wanderer": (0.5, 0.5),
        "pale_ones": [(0.1, 0.5), (0.9, 0.5), (0.5, 0.1), (0.5, 0.9), (0.2, 0.2), (0.8, 0.8)],
        "crowd": [
            (0.45, 0.4), (0.55, 0.45), (0.5, 0.55), (0.42, 0.5),
            (0.3, 0.3), (0.35, 0.28), (0.4, 0.3), (0.38, 0.35), (0.33, 0.32),
            (0.2, 0.5), (0.7, 0.5), (0.5, 0.2), (0.5, 0.8), (0.25, 0.7), (0.75, 0.25),
            (0.22, 0.4), (0.78, 0.6), (0.6, 0.72), (0.35, 0.55), (0.65, 0.35),
        ],
        "awaken_goal": 12,
    },
    # 6. Scorpius — The Scorpion's curve
    {
        "name": "LIGHTS OUT",
        "bg": (2, 2, 8),
        "wanderer": (0.5, 0.5),
        "pale_ones": [(0.2, 0.2), (0.8, 0.2), (0.2, 0.8), (0.8, 0.8), (0.5, 0.5)],
        "crowd": [
            (0.75, 0.4), (0.65, 0.45), (0.55, 0.5), (0.45, 0.55),
            (0.35, 0.6), (0.25, 0.65), (0.2, 0.7), (0.3, 0.4), (0.7, 0.6),
        ],
        "awaken_goal": 5,
    },
]


def generate_random_level(level_number):
    """Generate infinite random level. Match web generateRandomLevel."""
    rng = random.Random(level_number)
    bg = cool_color(level_number * 7919)

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
        "bg": bg,
        "wanderer": (0.5, 0.5),
        "pale_ones": pale_ones,
        "crowd": crowd,
        "awaken_goal": max(3, awaken_goal),
    }
