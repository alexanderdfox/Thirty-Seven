"""UI for Thirty Seven — matches web 2D layout and styling."""

import pygame
from constants import (
    AMBER,
    GOLD,
    WHITE,
    VOID,
    HUD_MUTED,
    BTN_BORDER,
    BTN_OUTLINE,
    AWAKENED_AMBER,
)


def get_menu_rects(screen):
    """Return play and how rects for click detection (no draw)."""
    cx, cy = screen.get_width() // 2, screen.get_height() // 2
    return {
        "play": pygame.Rect(cx - 100, cy + 90, 200, 48),
        "how": pygame.Rect(cx - 100, cy + 150, 200, 44),
    }


def get_how_done_rect(screen):
    """Return Done button rect for how modal."""
    panel_h = 340
    cx = screen.get_width() // 2
    panel_bottom = screen.get_height() // 2 + panel_h // 2
    return pygame.Rect(cx - 50, panel_bottom - 55, 100, 36)


def get_level_complete_continue_rect(screen):
    """Return Continue button rect."""
    cx, cy = screen.get_width() // 2, screen.get_height() // 2
    return pygame.Rect(cx - 60, cy + 35, 120, 40)


def draw_text(screen, text, x, y, font, color, center=True):
    surf = font.render(text, True, color)
    rect = surf.get_rect(center=(x, y)) if center else surf.get_rect(topleft=(x, y))
    screen.blit(surf, rect)
    return rect


def draw_menu(screen, font_large, font_small):
    """Title screen — PLAY, HOW TO PLAY. Returns rects for click detection."""
    screen.fill((5, 5, 8))
    # Simple gradient: top darker
    pygame.draw.rect(screen, (10, 10, 24), (0, 0, screen.get_width(), screen.get_height()))

    cx, cy = screen.get_width() // 2, screen.get_height() // 2
    draw_text(screen, "THIRTY SEVEN", cx, cy - 80, font_large, GOLD)
    draw_text(screen, "A Parable of Desire, Death,", cx, cy - 20, font_small, (153, 153, 166))
    draw_text(screen, "and the Undying Cycle", cx, cy + 5, font_small, (153, 153, 166))
    draw_text(screen, "2D", cx, cy + 45, font_small, AWAKENED_AMBER)

    play_w, play_h = 200, 48
    play_rect = pygame.Rect(cx - play_w // 2, cy + 90, play_w, play_h)
    pygame.draw.rect(screen, GOLD, play_rect)
    pygame.draw.rect(screen, AWAKENED_AMBER, play_rect, 1)
    draw_text(screen, "PLAY", cx, cy + 114, font_small, (0, 0, 0))

    how_w, how_h = 200, 44
    how_rect = pygame.Rect(cx - how_w // 2, cy + 150, how_w, how_h)
    pygame.draw.rect(screen, (0, 0, 0, 0), how_rect)
    pygame.draw.rect(screen, BTN_BORDER, how_rect, 1)
    draw_text(screen, "HOW TO PLAY", cx, cy + 172, font_small, BTN_OUTLINE)

    return {"play": play_rect, "how": how_rect}


def draw_how_modal(screen, font_small):
    """How to Play modal. Returns done_rect."""
    overlay = pygame.Surface((screen.get_width(), screen.get_height()))
    overlay.fill((0, 0, 0))
    overlay.set_alpha(216)
    screen.blit(overlay, (0, 0))

    panel_w, panel_h = 420, 340
    panel = pygame.Rect(screen.get_width() // 2 - panel_w // 2, screen.get_height() // 2 - panel_h // 2, panel_w, panel_h)
    pygame.draw.rect(screen, (13, 13, 26), panel)
    pygame.draw.rect(screen, BTN_BORDER, panel, 1)

    cx = panel.centerx
    draw_text(screen, "How to Play", cx, panel.top + 40, font_small, GOLD)
    lines = [
        "Mouse / WASD: Move the Wanderer",
        "Get near souls (grey circles) to awaken them",
        "Awakened souls turn amber—reach the goal to advance",
        "Avoid the Pale Ones (pale circles)—they hunt you",
        "Tap BREATHE, then LIGHTS OUT to become invulnerable",
        "During fall/rise you cannot be caught",
    ]
    for i, line in enumerate(lines):
        draw_text(screen, line, panel.left + 30, panel.top + 85 + i * 24, font_small, (217, 214, 199), center=False)
    draw_text(screen, "While true. Breathe. Fall. Rise. Done.", cx, panel.top + 250, font_small, (179, 166, 128))
    draw_text(screen, "The fire never dies.", cx, panel.top + 275, font_small, AWAKENED_AMBER)

    done_rect = pygame.Rect(cx - 50, panel.bottom - 55, 100, 36)
    pygame.draw.rect(screen, GOLD, done_rect)
    draw_text(screen, "Done", cx, done_rect.centery, font_small, (0, 0, 0))
    return done_rect


def draw_game_hud(screen, font_small, level_name, awakened, goal, level_timer_sec=37):
    """Top bar: back, level name, timer, awaken count. Returns back_rect."""
    w = screen.get_width()
    # Back button
    back_rect = pygame.Rect(12, 8, 40, 36)
    draw_text(screen, "←", back_rect.centerx, back_rect.centery, font_small, BTN_OUTLINE)
    # Level name center
    draw_text(screen, level_name, w // 2, 28, font_small, HUD_MUTED)
    # Timer and awaken count right
    draw_text(screen, f"{level_timer_sec}  {awakened}/{goal}", w - 70, 28, font_small, AMBER)
    return back_rect


def draw_vow(screen, font_small, state):
    """Vow text top center."""
    states = {
        "alive": ("While true. Do.", GOLD),
        "breathing": ("Breathe...", AMBER),
        "falling": ("Fall.", WHITE),
        "rising": ("Rise.", GOLD),
    }
    text, color = states.get(state, ("While true. Do.", GOLD))
    draw_text(screen, text, screen.get_width() // 2, 58, font_small, color)


def draw_breathe_button(screen, font_small):
    """BREATHE button bottom center. Returns rect."""
    cx = screen.get_width() // 2
    by = screen.get_height() - 48
    rect = pygame.Rect(cx - 80, by - 18, 160, 36)
    pygame.draw.rect(screen, (50, 45, 35), rect)
    pygame.draw.rect(screen, BTN_BORDER, rect, 1)
    draw_text(screen, "BREATHE", cx, rect.centery, font_small, GOLD)
    return rect


def draw_level_complete(screen, font_large, font_small, level_name):
    """Overlay with LEVEL COMPLETE, level name, Continue. Returns continue_rect."""
    overlay = pygame.Surface((screen.get_width(), screen.get_height()))
    overlay.fill((0, 0, 0))
    overlay.set_alpha(191)
    screen.blit(overlay, (0, 0))

    cx, cy = screen.get_width() // 2, screen.get_height() // 2
    draw_text(screen, "LEVEL COMPLETE", cx, cy - 50, font_large, GOLD)
    draw_text(screen, level_name, cx, cy - 5, font_small, (179, 166, 128))

    cont_rect = pygame.Rect(cx - 60, cy + 35, 120, 40)
    pygame.draw.rect(screen, GOLD, cont_rect)
    draw_text(screen, "Continue", cx, cont_rect.centery, font_small, (0, 0, 0))
    return cont_rect


def draw_victory(screen, font_large, font_small):
    """Victory screen."""
    screen.fill(VOID)
    draw_text(screen, "THE FIRE NEVER DIES", screen.get_width() // 2, screen.get_height() // 2 - 60, font_large, GOLD)
    draw_text(screen, "And neither does the longing that kindles it.", screen.get_width() // 2, screen.get_height() // 2 - 10, font_small, AMBER)
    draw_text(screen, "While true. Breathe. Fall. Rise. Done.", screen.get_width() // 2, screen.get_height() // 2 + 40, font_small, (200, 180, 120))
    draw_text(screen, "Press SPACE to play again | ESC to quit", screen.get_width() // 2, screen.get_height() // 2 + 120, font_small, (150, 150, 160))
