#!/usr/bin/env python3
"""
THIRTY SEVEN
A Pygame Parable of Desire, Death, and the Undying Cycle

Based on the screenplay by the same name.
Move with WASD. Breathe with SPACE. Lights Out with SPACE again during breath.
Awaken the crowd. Avoid the Pale Ones. The fire never dies.
"""

import pygame
import math

from constants import (
    SCREEN_WIDTH,
    SCREEN_HEIGHT,
    FPS,
    BLACK,
    VOID,
)
from entities import Wanderer, PaleOne, CrowdMember
from levels import LEVELS
from ui import (
    draw_vow,
    draw_instructions,
    draw_hud,
    draw_title_screen,
    draw_game_over,
    draw_victory,
)


def main():
    pygame.init()
    screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
    pygame.display.set_caption("Thirty Seven — A Parable")
    clock = pygame.time.Clock()

    font_large = pygame.font.Font(None, 72)
    font_small = pygame.font.Font(None, 32)

    # Game state
    state = "title"  # title, playing, level_complete, game_over, victory
    level_index = 0
    wanderer = None
    pale_ones = []
    crowd = []
    level_data = None
    caught_by_pale_ones = False

    def load_level(idx):
        nonlocal wanderer, pale_ones, crowd, level_data
        if idx >= len(LEVELS):
            return False
        level_data = LEVELS[idx]
        w, h = SCREEN_WIDTH, SCREEN_HEIGHT

        wx = int(level_data["wanderer"][0] * w)
        wy = int(level_data["wanderer"][1] * h)
        wanderer = Wanderer(wx, wy)

        pale_ones = [
            PaleOne(int(p[0] * w), int(p[1] * h))
            for p in level_data["pale_ones"]
        ]

        crowd = [
            CrowdMember(int(c[0] * w), int(c[1] * h))
            for c in level_data["crowd"]
        ]
        return True

    def get_awakened_count():
        return sum(1 for c in crowd if c.awakened)

    def check_pale_collision():
        if wanderer.invuln_timer > 0 or wanderer.state in ("falling", "rising"):
            return False
        for p in pale_ones:
            dist = math.hypot(wanderer.x - p.x, wanderer.y - p.y)
            if dist < 35:
                return True
        return False

    running = True
    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:
                    if state == "playing":
                        state = "title"
                        level_index = 0
                    else:
                        running = False
                elif state == "title":
                    if event.key == pygame.K_SPACE:
                        state = "playing"
                        load_level(0)
                elif state == "game_over":
                    if event.key == pygame.K_r:
                        state = "playing"
                        load_level(level_index)
                elif state == "victory":
                    if event.key == pygame.K_SPACE:
                        state = "playing"
                        level_index = 0
                        load_level(0)
                elif state == "playing" and event.key == pygame.K_SPACE:
                    if wanderer.state == "alive":
                        wanderer.breathe()
                    elif wanderer.state == "breathing":
                        wanderer.lights_out()
                elif state == "level_complete":
                    if event.key == pygame.K_SPACE:
                        level_index += 1
                        if load_level(level_index):
                            state = "playing"
                        else:
                            state = "victory"

        if state == "playing":
            keys = pygame.key.get_pressed()
            wanderer.update(keys, screen.get_rect())
            for p in pale_ones:
                p.update(wanderer)
            for c in crowd:
                c.update(wanderer)

            if check_pale_collision():
                state = "game_over"
                caught_by_pale_ones = True

            awakened = get_awakened_count()
            if awakened >= level_data["awaken_goal"]:
                state = "level_complete"

        # Draw
        if state == "title":
            draw_title_screen(screen, font_large, font_small)
        elif state == "game_over":
            draw_game_over(screen, font_large, font_small, caught_by_pale_ones)
        elif state == "victory":
            draw_victory(screen, font_large, font_small)
        elif state == "level_complete":
            screen.fill(level_data["bg"] if level_data else VOID)
            font_mid = pygame.font.Font(None, 48)
            surf = font_mid.render("LEVEL COMPLETE", True, (255, 215, 100))
            screen.blit(surf, surf.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2 - 20)))
            surf2 = font_small.render("Press SPACE to continue", True, (150, 150, 160))
            screen.blit(surf2, surf2.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2 + 30)))
        elif state == "playing":
            screen.fill(level_data["bg"])
            # Draw level subtitle
            title_surf = font_small.render(level_data["name"], True, (80, 80, 100))
            screen.blit(title_surf, (20, 20))

            for c in crowd:
                c.draw(screen)
            for p in pale_ones:
                p.draw(screen)
            wanderer.draw(screen)

            draw_vow(screen, font_small, wanderer.state)
            draw_hud(screen, font_small, get_awakened_count(), level_data["awaken_goal"], level_data["name"])
            draw_instructions(screen, font_small)

        pygame.display.flip()
        clock.tick(FPS)

    pygame.quit()


if __name__ == "__main__":
    main()
