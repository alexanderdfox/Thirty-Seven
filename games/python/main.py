#!/usr/bin/env python3
"""
THIRTY SEVEN — A Parable of Desire, Death, and the Undying Cycle

Python version matching web 2D: layout, colors, HUD, BREATHE button.
Mouse or WASD, Pale Ones swarm, procedural audio.
"""

import pygame
import math

from constants import (
    SCREEN_WIDTH,
    SCREEN_HEIGHT,
    FPS,
    VOID,
    COLLISION_RADIUS,
    PALE_R,
    LEVEL_TIME_SECONDS,
)
from entities import Wanderer, PaleOne, CrowdMember
from levels import LEVELS, generate_random_level
from ui import (
    draw_menu,
    draw_how_modal,
    draw_game_hud,
    draw_vow,
    draw_breathe_button,
    draw_level_complete,
    draw_victory,
    get_menu_rects,
    get_how_done_rect,
    get_level_complete_continue_rect,
)
from audio import (
    init_mixer,
    menu_tap,
    breathe as audio_breathe,
    lights_out as audio_lights_out,
    rise as audio_rise,
    awaken as audio_awaken,
    caught as audio_caught,
    level_complete as audio_level_complete,
    start_drone,
    stop_drone,
    play_proximity_tone,
    note_for_crowd_index,
)


def main():
    pygame.init()
    from audio import init_mixer
    init_mixer()
    screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
    pygame.display.set_caption("Thirty Seven — A Parable")
    clock = pygame.time.Clock()

    font_large = pygame.font.Font(None, 72)
    font_small = pygame.font.Font(None, 32)

    state = "title"  # title, playing, level_complete, victory, how_modal
    level_index = 0
    frame = 0
    level_timer = LEVEL_TIME_SECONDS * FPS
    wanderer = None
    pale_ones = []
    crowd = []
    level_data = None
    keys = {}

    def load_level(idx):
        nonlocal wanderer, pale_ones, crowd, level_data, level_timer
        level_timer = LEVEL_TIME_SECONDS * FPS
        stop_drone()
        if idx < len(LEVELS):
            level_data = LEVELS[idx]
        else:
            level_data = generate_random_level(idx + 1)
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
        level_seed = idx if idx < len(LEVELS) else idx + 1000
        start_drone(level_seed)
        return True

    def get_key_delta():
        dx = (1 if (keys.get(pygame.K_RIGHT) or keys.get(pygame.K_d)) else 0) - (1 if (keys.get(pygame.K_LEFT) or keys.get(pygame.K_a)) else 0)
        dy = (1 if (keys.get(pygame.K_DOWN) or keys.get(pygame.K_s)) else 0) - (1 if (keys.get(pygame.K_UP) or keys.get(pygame.K_w)) else 0)
        return (dx, dy)

    def get_awakened_count():
        return sum(1 for c in crowd if c.awakened)

    def enforce_pale_min_distance():
        min_dist = PALE_R * 2.5
        for i in range(len(pale_ones)):
            for j in range(i + 1, len(pale_ones)):
                p, q = pale_ones[i], pale_ones[j]
                dx = q.x - p.x
                dy = q.y - p.y
                d = math.hypot(dx, dy) or 0.01
                if d < min_dist:
                    overlap = min_dist - d
                    nx, ny = dx / d, dy / d
                    p.x -= nx * overlap * 0.5
                    p.y -= ny * overlap * 0.5
                    q.x += nx * overlap * 0.5
                    q.y += ny * overlap * 0.5
                    p.rect.center = (int(p.x), int(p.y))
                    q.rect.center = (int(q.x), int(q.y))

    def check_pale_collision():
        if wanderer.invuln_timer > 0 or wanderer.state in ("falling", "rising"):
            return False
        for p in pale_ones:
            if math.hypot(wanderer.x - p.x, wanderer.y - p.y) < COLLISION_RADIUS:
                return True
        return False

    def handle_breathe():
        if wanderer.state == "alive":
            if wanderer.breathe():
                audio_breathe()
        elif wanderer.state == "breathing":
            if wanderer.lights_out():
                audio_lights_out()

    running = True
    while running:
        mouse_pos = pygame.mouse.get_pos()
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            elif event.type == pygame.KEYDOWN:
                keys[event.key] = True
                if event.key == pygame.K_ESCAPE:
                    if state == "how_modal":
                        state = "title"
                    elif state == "playing":
                        state = "title"
                        level_index = 0
                        stop_drone()
                        pygame.mouse.set_visible(True)
                    else:
                        running = False
                elif state == "title" and event.key == pygame.K_SPACE:
                    menu_tap()
                    state = "playing"
                    load_level(0)
                    pygame.mouse.set_visible(False)
                elif state == "victory" and event.key == pygame.K_SPACE:
                    menu_tap()
                    state = "playing"
                    level_index = 0
                    load_level(0)
                    pygame.mouse.set_visible(False)
                elif state == "playing" and event.key == pygame.K_SPACE:
                    handle_breathe()
                elif state == "level_complete" and event.key == pygame.K_SPACE:
                    menu_tap()
                    level_index += 1
                    load_level(level_index)
                    state = "playing"
                    pygame.mouse.set_visible(False)
            elif event.type == pygame.KEYUP:
                keys[event.key] = False
            elif event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
                if state == "title":
                    rects = get_menu_rects(screen)
                    if rects["play"].collidepoint(mouse_pos):
                        menu_tap()
                        state = "playing"
                        load_level(0)
                        pygame.mouse.set_visible(False)
                    elif rects["how"].collidepoint(mouse_pos):
                        menu_tap()
                        state = "how_modal"
                elif state == "how_modal":
                    if get_how_done_rect(screen).collidepoint(mouse_pos):
                        menu_tap()
                        state = "title"
                elif state == "playing":
                    back_rect = pygame.Rect(12, 8, 40, 36)
                    breathe_rect = pygame.Rect(screen.get_width() // 2 - 80, screen.get_height() - 66, 160, 36)
                    if back_rect.collidepoint(mouse_pos):
                        menu_tap()
                        state = "title"
                        level_index = 0
                        stop_drone()
                        pygame.mouse.set_visible(True)
                    elif breathe_rect.collidepoint(mouse_pos):
                        handle_breathe()
                elif state == "level_complete":
                    if get_level_complete_continue_rect(screen).collidepoint(mouse_pos):
                        menu_tap()
                        level_index += 1
                        load_level(level_index)
                        state = "playing"
                        pygame.mouse.set_visible(False)

        if state == "playing":
            frame += 1
            key_delta = get_key_delta()
            rect = screen.get_rect()
            wanderer.update(mouse_pos, key_delta, rect)
            for p in pale_ones:
                p.update(wanderer, pale_ones, rect)
            enforce_pale_min_distance()
            for i, c in enumerate(crowd):
                c.update(wanderer, level_index)
                if getattr(c, "_progressed", False) and c.awaken_progress < 60:
                    last = getattr(c, "_last_tone_frame", -99)
                    if frame - last >= 12:
                        c._last_tone_frame = frame
                        play_proximity_tone(note_for_crowd_index(i), 0.1)
            if check_pale_collision():
                audio_caught()
                load_level(level_index)
            if getattr(wanderer, "_just_rose", False):
                wanderer._just_rose = False
                audio_rise()
            awakened = get_awakened_count()
            for c in crowd:
                if c.awakened and not getattr(c, "_played_awaken", False):
                    c._played_awaken = True
                    audio_awaken()
            if awakened >= level_data["awaken_goal"]:
                audio_level_complete()
                state = "level_complete"
                pygame.mouse.set_visible(True)
            else:
                level_timer -= 1
                if level_timer <= 0:
                    audio_caught()
                    load_level(level_index)

        # Draw
        if state == "title":
            draw_menu(screen, font_large, font_small)
        elif state == "how_modal":
            draw_menu(screen, font_large, font_small)
            draw_how_modal(screen, font_small)
        elif state == "victory":
            draw_victory(screen, font_large, font_small)
        elif state == "level_complete":
            screen.fill(level_data["bg"] if level_data else VOID)
            draw_level_complete(screen, font_large, font_small, level_data["name"])
        elif state == "playing":
            screen.fill(level_data["bg"])
            for c in crowd:
                c.draw_shadow(screen)
            for p in pale_ones:
                p.draw_shadow(screen)
            wanderer.draw_shadow(screen)
            for c in crowd:
                c.draw(screen)
            for p in pale_ones:
                p.draw(screen)
            wanderer.draw(screen)
            draw_game_hud(screen, font_small, level_data["name"], get_awakened_count(), level_data["awaken_goal"], max(0, level_timer // FPS))
            draw_vow(screen, font_small, wanderer.state)
            draw_breathe_button(screen, font_small)

        pygame.display.flip()
        clock.tick(FPS)

    stop_drone()
    pygame.quit()


if __name__ == "__main__":
    main()
