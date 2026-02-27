"""UI and text for Thirty Seven"""

import pygame
from constants import AMBER, GOLD, WHITE, DARK_GREY, VOID


def draw_text(screen, text, x, y, font, color=AMBER, center=True):
    """Draw text, optionally centered on (x,y)."""
    surf = font.render(text, True, color)
    if center:
        rect = surf.get_rect(center=(x, y))
    else:
        rect = surf.get_rect(topleft=(x, y))
    screen.blit(surf, rect)


def draw_vow(screen, font_small, state):
    """Draw current vow state: Breathe / Fall / Rise / Done."""
    states = {
        "alive": ("While true. Do.", GOLD),
        "breathing": ("Breathe...", AMBER),
        "falling": ("Fall.", WHITE),
        "rising": ("Rise.", GOLD),
        "done": ("Done.", AMBER),
    }
    text, color = states.get(state, ("While true.", AMBER))
    draw_text(screen, text, screen.get_width() // 2, 40, font_small, color)


def draw_instructions(screen, font_small):
    """Draw controls."""
    lines = [
        "Mouse: Move",
        "SPACE: Breathe (hold to prepare Lights Out)",
        "SPACE again: Lights Out (voluntary fall)",
        "Awaken the crowd. Avoid the Pale Ones.",
    ]
    for i, line in enumerate(lines):
        draw_text(screen, line, 20, screen.get_height() - 100 + i * 22, font_small, (150, 150, 160), center=False)


def draw_hud(screen, font_small, awakened, goal, level_name):
    """Draw HUD."""
    draw_text(screen, f"Awakened: {awakened}/{goal}", screen.get_width() - 150, 30, font_small, AMBER, center=False)
    draw_text(screen, level_name, screen.get_width() // 2, screen.get_height() - 30, font_small, (100, 100, 120))


def draw_title_screen(screen, font_large, font_small):
    """Title screen."""
    screen.fill(VOID)
    draw_text(screen, "THIRTY SEVEN", screen.get_width() // 2, screen.get_height() // 2 - 50, font_large, GOLD)
    draw_text(screen, "A Parable of Desire, Death, and the Undying Cycle", screen.get_width() // 2, screen.get_height() // 2, font_small, AMBER)
    draw_text(screen, "Press SPACE to begin", screen.get_width() // 2, screen.get_height() // 2 + 80, font_small, (150, 150, 160))


def draw_game_over(screen, font_large, font_small, caught_by_pale_ones):
    """Game over screen."""
    screen.fill(VOID)
    if caught_by_pale_ones:
        draw_text(screen, "THE PALE ONES TOOK YOU", screen.get_width() // 2, screen.get_height() // 2 - 40, font_large, (200, 180, 180))
        draw_text(screen, "The song was never theirs to claim.", screen.get_width() // 2, screen.get_height() // 2, font_small, AMBER)
    else:
        draw_text(screen, "THE CYCLE CONTINUES", screen.get_width() // 2, screen.get_height() // 2 - 40, font_large, GOLD)
        draw_text(screen, "The fire never dies.", screen.get_width() // 2, screen.get_height() // 2, font_small, AMBER)
    draw_text(screen, "Press R to try again | ESC to quit", screen.get_width() // 2, screen.get_height() // 2 + 80, font_small, (150, 150, 160))


def draw_victory(screen, font_large, font_small):
    """Victory / end screen."""
    screen.fill(VOID)
    draw_text(screen, "THE FIRE NEVER DIES", screen.get_width() // 2, screen.get_height() // 2 - 60, font_large, GOLD)
    draw_text(screen, "And neither does the longing that kindles it.", screen.get_width() // 2, screen.get_height() // 2 - 10, font_small, AMBER)
    draw_text(screen, "While true. Breathe. Fall. Rise. Done.", screen.get_width() // 2, screen.get_height() // 2 + 40, font_small, (200, 180, 120))
    draw_text(screen, "Press SPACE to play again | ESC to quit", screen.get_width() // 2, screen.get_height() // 2 + 120, font_small, (150, 150, 160))
