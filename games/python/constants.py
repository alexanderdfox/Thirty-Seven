"""Constants for Thirty Seven - A Pygame Parable"""

# Display
SCREEN_WIDTH = 1280
SCREEN_HEIGHT = 720
FPS = 60

# Colors - match web 2D palette
BLACK = (0, 0, 0)
VOID = (5, 5, 20)  # #050514
WANDERER_GREY = (90, 90, 95)  # 0x5a5a5f
PALE_SKIN = (220, 210, 200)  # 0xdcd2c8
CROWD_GREY = (96, 96, 96)  # 0x606060 base
AWAKENED_AMBER = (255, 140, 50)  # 0xff8c32
AMBER = (255, 179, 80)  # 0xffb350
GOLD = (255, 215, 102)  # 0xffd766
WHITE = (255, 255, 255)
HUD_MUTED = (128, 128, 144)  # 0x808090
BTN_BORDER = (153, 136, 102)  # 0x998866
BTN_OUTLINE = (230, 217, 179)  # 0xe6d9b3

# Game (aligned with web 2D)
WANDERER_SPEED = 4
PALE_ONE_SPEED = 1.8
PALE_R = 18
COLLISION_RADIUS = 38
AWAKEN_RADIUS = 80
AWAKEN_TIME = 60  # frames to awaken
LIGHTS_OUT_COOLDOWN = 180  # frames before can lights out again
BREATH_DURATION_MIN = 3 * FPS  # 3 seconds min
BREATH_DURATION_MAX = 7 * FPS  # 7 seconds max
LEVEL_TIME_SECONDS = 37
LIGHTS_OUT_FALL = 5 * FPS  # 5 seconds falling
LIGHTS_OUT_RISE = 5 * FPS  # 5 seconds rising (10 sec total lights out)
RESPAWN_INVULN = 5 * FPS  # invulnerable during rise

# Vow states
VOW_BREATHE = "breathe"
VOW_FALL = "fall"
VOW_RISE = "rise"
VOW_DONE = "done"
