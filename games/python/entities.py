"""Entities for Thirty Seven - Wanderer, Pale Ones, Crowd

Pale Ones use N-body swarm behavior. 3D-style sphere rendering (radial gradient + shadow).
"""

import math
import random
import pygame
from constants import (
    PALE_ONE_SPEED,
    PALE_R,
    COLLISION_RADIUS,
    AWAKEN_RADIUS,
    AWAKEN_TIME,
    BREATH_DURATION_MIN,
    BREATH_DURATION_MAX,
    LIGHTS_OUT_FALL,
    LIGHTS_OUT_RISE,
    RESPAWN_INVULN,
    WANDERER_SPEED,
    WANDERER_GREY,
    PALE_SKIN,
    AMBER,
    GOLD,
    AWAKENED_AMBER,
    CROWD_GREY,
    BLACK,
)


def _lighten(rgb, amount):
    return tuple(min(255, int(c + amount)) for c in rgb)


def _darken(rgb, amount):
    return tuple(max(0, int(c - amount)) for c in rgb)


def _draw_sphere(surf, cx, cy, radius, base_color, highlight=0.35):
    """Sphere-like circle: radial gradient (center lit, darker rim)."""
    light = _lighten(base_color, 40)
    dark = _darken(base_color, 50)
    for r in range(radius, 0, -1):
        t = 1 - (r / radius) * (1 - highlight)
        c = tuple(max(0, min(255, int(light[i] * t + dark[i] * (1 - t)))) for i in range(3))
        pygame.draw.circle(surf, c, (cx, cy), r)


def _draw_shadow(screen, x, y, radius):
    """Soft elliptical shadow under entity (offset down-right)."""
    sw, sh = int(radius * 1.6), int(radius * 0.5)
    sx, sy = int(x) + 3, int(y) + 4
    shadow_surf = pygame.Surface((sw * 2 + 4, sh * 2 + 4), pygame.SRCALPHA)
    pygame.draw.ellipse(shadow_surf, (15, 15, 20, 85), (2, 2, sw * 2, sh * 2))
    screen.blit(shadow_surf, (sx - sw - 2, sy - sh - 2))


class Wanderer(pygame.sprite.Sprite):
    """The Wanderer - carries the song. Moves, breathes, falls, rises."""

    def __init__(self, x, y):
        super().__init__()
        self.radius = 22  # Match web WANDERER_R
        self.image = pygame.Surface((self.radius * 2, self.radius * 2))
        self.image.set_colorkey(BLACK)
        self.rect = self.image.get_rect(center=(x, y))
        self.x, self.y = float(x), float(y)
        self.state = "alive"  # alive, breathing, falling, rising
        self.breath_timer = 0
        self.fall_timer = 0
        self.rise_timer = 0
        self.invuln_timer = 0
        self.lights_out_cooldown = 0
        self.awakened_count = 0

    def update(self, mouse_pos, key_delta, screen_rect):
        """key_delta: (dx, dy) from keyboard, or (0,0) if using mouse."""
        if self.state == "alive" or self.state == "breathing":
            if key_delta != (0, 0):
                dx, dy = key_delta
                dist = math.hypot(dx, dy) or 1
                self.x += (dx / dist) * WANDERER_SPEED
                self.y += (dy / dist) * WANDERER_SPEED
            else:
                mx, my = mouse_pos
                self.x = float(mx)
                self.y = float(my)
            self.x = max(screen_rect.left + self.radius, min(screen_rect.right - self.radius, self.x))
            self.y = max(screen_rect.top + self.radius, min(screen_rect.bottom - self.radius, self.y))
            self.rect.center = (int(self.x), int(self.y))

        if self.state == "breathing":
            self.breath_timer -= 1
            if self.breath_timer <= 0:
                self.state = "alive"
        elif self.state == "falling":
            self.fall_timer -= 1
            if self.fall_timer <= 0:
                self.state = "rising"
                self.rise_timer = LIGHTS_OUT_RISE
                self.invuln_timer = RESPAWN_INVULN
                self._just_rose = True
        elif self.state == "rising":
            self.rise_timer -= 1
            self.invuln_timer -= 1
            if self.rise_timer <= 0:
                self.state = "alive"
        if self.lights_out_cooldown > 0:
            self.lights_out_cooldown -= 1

    def breathe(self):
        """Begin breath - 3-7 second moment before fall."""
        if self.state == "alive" and self.lights_out_cooldown <= 0:
            self.state = "breathing"
            self.breath_timer = random.randint(BREATH_DURATION_MIN, BREATH_DURATION_MAX)
            return True
        return False

    def lights_out(self):
        """Voluntary fall - die to rise again."""
        if self.state == "breathing":
            self.state = "falling"
            self.fall_timer = LIGHTS_OUT_FALL
            self.lights_out_cooldown = 180
            return True
        return False

    def draw_shadow(self, screen):
        _draw_shadow(screen, self.rect.centerx, self.rect.centery, self.radius)

    def draw(self, screen):
        self.image.fill(BLACK)
        if self.state == "falling":
            pygame.draw.circle(self.image, WANDERER_GREY, (self.radius, self.radius), self.radius)
            alpha = max(0, int(255 * self.fall_timer / LIGHTS_OUT_FALL))
            self.image.set_alpha(alpha)
            screen.blit(self.image, self.rect)
            return
        if self.state == "rising":
            scale = 1 - (self.rise_timer / LIGHTS_OUT_RISE) * 0.5
            r = int(self.radius * scale)
            invuln_glow = self.invuln_timer > 0
        else:
            r = self.radius
            invuln_glow = False

        _draw_sphere(self.image, self.radius, self.radius, r, WANDERER_GREY)
        if invuln_glow:
            pygame.draw.circle(self.image, AMBER, (self.radius, self.radius), r + 3, 2)
        if self.state == "breathing":
            pulse = (self.breath_timer % 10)
            pygame.draw.circle(self.image, GOLD, (self.radius, self.radius), r + pulse, 1)
        self.image.set_colorkey(BLACK)
        screen.blit(self.image, self.rect)


class PaleOne(pygame.sprite.Sprite):
    """The Pale Ones - swarm hunt, N-body, keep distance. Like web 2D."""

    def __init__(self, x, y):
        super().__init__()
        self.radius = PALE_R
        self.image = pygame.Surface((self.radius * 2, self.radius * 2))
        self.image.set_colorkey(BLACK)
        self.rect = self.image.get_rect(center=(x, y))
        self.x, self.y = float(x), float(y)
        self.vx, self.vy = 0.0, 0.0

    def update(self, wanderer, all_pale_ones, screen_rect):
        if wanderer.state in ("falling", "rising") or wanderer.invuln_timer > 0:
            return
        n = len(all_pale_ones)
        swarm_factor = 0 if n <= 1 else min(1, (n - 1) * 0.18)
        sep_r = max(PALE_R * 2.5 + 12, 40 + n * 4)
        coh_r = 90 + n * 10
        seek_k, repel_k, coh_k = 1.2, 2.2, 0.12

        fx, fy = 0.0, 0.0
        dx0 = wanderer.x - self.x
        dy0 = wanderer.y - self.y
        d0 = math.hypot(dx0, dy0) or 1
        fx += (dx0 / d0) * seek_k
        fy += (dy0 / d0) * seek_k

        for q in all_pale_ones:
            if q is self:
                continue
            dx = q.x - self.x
            dy = q.y - self.y
            d = math.hypot(dx, dy) or 0.01
            if d < sep_r:
                s = (sep_r - d) / sep_r * swarm_factor * repel_k
                fx -= (dx / d) * s
                fy -= (dy / d) * s
            elif d < coh_r:
                s = (1 - (d - sep_r) / (coh_r - sep_r)) * swarm_factor * coh_k
                fx += (dx / d) * s
                fy += (dy / d) * s

        f_mag = math.hypot(fx, fy) or 1
        self.vx = self.vx * 0.88 + (fx / f_mag) * PALE_ONE_SPEED * 0.4
        self.vy = self.vy * 0.88 + (fy / f_mag) * PALE_ONE_SPEED * 0.4
        v_mag = math.hypot(self.vx, self.vy)
        if v_mag > PALE_ONE_SPEED:
            self.vx = (self.vx / v_mag) * PALE_ONE_SPEED
            self.vy = (self.vy / v_mag) * PALE_ONE_SPEED
        self.x += self.vx
        self.y += self.vy
        self.x = max(screen_rect.left + self.radius, min(screen_rect.right - self.radius, self.x))
        self.y = max(screen_rect.top + self.radius, min(screen_rect.bottom - self.radius, self.y))
        self.rect.center = (int(self.x), int(self.y))

    def draw_shadow(self, screen):
        _draw_shadow(screen, self.rect.centerx, self.rect.centery, self.radius)

    def draw(self, screen):
        self.image.fill(BLACK)
        _draw_sphere(self.image, self.radius, self.radius, self.radius, PALE_SKIN)
        self.image.set_colorkey(BLACK)
        screen.blit(self.image, self.rect)


class CrowdMember(pygame.sprite.Sprite):
    """Soul to be awakened. Stands still. Each has a note for the instrument."""

    def __init__(self, x, y):
        super().__init__()
        self.radius = 14  # Match web CROWD_R
        self.image = pygame.Surface((self.radius * 2, self.radius * 2))
        self.image.set_colorkey(BLACK)
        self.rect = self.image.get_rect(center=(x, y))
        self.awakened = False
        self.awaken_progress = 0
        self.sub_progress = 0

    def update(self, wanderer, level_index=0):
        if self.awakened:
            return
        prev = self.awaken_progress
        dist = math.hypot(wanderer.x - self.rect.centerx, wanderer.y - self.rect.centery)
        hits_per_progress = 1 + level_index // 10
        if dist < AWAKEN_RADIUS and wanderer.state == "alive":
            self.sub_progress += 1
            while self.sub_progress >= hits_per_progress and self.awaken_progress < AWAKEN_TIME:
                self.sub_progress -= hits_per_progress
                self.awaken_progress = min(AWAKEN_TIME, self.awaken_progress + 1)
                if self.awaken_progress >= AWAKEN_TIME:
                    self.awakened = True
                    break
        self._progressed = self.awaken_progress > prev

    def draw_shadow(self, screen):
        _draw_shadow(screen, self.rect.centerx, self.rect.centery, self.radius)

    def draw(self, screen):
        self.image.fill(BLACK)
        if self.awakened:
            _draw_sphere(self.image, self.radius, self.radius, self.radius, AWAKENED_AMBER, highlight=0.4)
        else:
            t = self.awaken_progress / AWAKEN_TIME
            r = int(61 + t * 194)
            g = int(61 + t * 79)
            b = int(64 - t * 14)
            r, g, b = min(255, r), min(255, g), max(0, b)
            _draw_sphere(self.image, self.radius, self.radius, self.radius, (r, g, b))
        self.image.set_colorkey(BLACK)
        screen.blit(self.image, self.rect)
