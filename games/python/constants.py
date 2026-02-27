"""Constants for Thirty Seven - A Pygame Parable"""

# Display
SCREEN_WIDTH = 1280
SCREEN_HEIGHT = 720
FPS = 60

# Colors - Dark, luminous palette
BLACK = (0, 0, 0)
VOID = (5, 5, 15)
GREY = (80, 80, 85)
WANDERER_GREY = (90, 90, 95)
PALE_SKIN = (220, 210, 200)
PALE_EYES = (180, 170, 200)
AMBER = (255, 180, 80)
GOLD = (255, 215, 100)
FLAME = (255, 140, 50)
SOUL_GLOW = (255, 200, 120)
RIFT_BLUE = (80, 100, 200)
WHITE = (255, 255, 255)
DARK_GREY = (30, 30, 35)

# Game
WANDERER_SPEED = 5
PALE_ONE_SPEED = 3.5
AWAKEN_RADIUS = 80
AWAKEN_TIME = 60  # frames to awaken
LIGHTS_OUT_COOLDOWN = 180  # frames before can lights out again
BREATH_DURATION = 30  # frames of breath (brief invulnerability)
RESPAWN_INVULN = 90  # frames invulnerable after rise

# Vow states
VOW_BREATHE = "breathe"
VOW_FALL = "fall"
VOW_RISE = "rise"
VOW_DONE = "done"
