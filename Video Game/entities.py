"""Entities for Thirty Seven - Wanderer, Pale Ones, Crowd"""

import math
import pygame
from constants import (
    WANDERER_SPEED,
    PALE_ONE_SPEED,
    AWAKEN_RADIUS,
    AWAKEN_TIME,
    WANDERER_GREY,
    PALE_SKIN,
    PALE_EYES,
    AMBER,
    GOLD,
    FLAME,
    SOUL_GLOW,
    BLACK,
)


class Wanderer(pygame.sprite.Sprite):
    """The Wanderer - carries the song. Moves, breathes, falls, rises."""

    def __init__(self, x, y):
        super().__init__()
        self.radius = 20
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

    def update(self, keys, screen_rect):
        if self.state == "alive" or self.state == "breathing":
            dx, dy = 0, 0
            if keys[pygame.K_w] or keys[pygame.K_UP]:
                dy = -1
            if keys[pygame.K_s] or keys[pygame.K_DOWN]:
                dy = 1
            if keys[pygame.K_a] or keys[pygame.K_LEFT]:
                dx = -1
            if keys[pygame.K_d] or keys[pygame.K_RIGHT]:
                dx = 1
            if dx or dy:
                dist = math.sqrt(dx * dx + dy * dy)
                dx, dy = dx / dist, dy / dist
            self.x += dx * WANDERER_SPEED
            self.y += dy * WANDERER_SPEED
            self.rect.center = (int(self.x), int(self.y))
            self.rect.clamp_ip(screen_rect)

        if self.state == "breathing":
            self.breath_timer -= 1
            if self.breath_timer <= 0:
                self.state = "alive"
        elif self.state == "falling":
            self.fall_timer -= 1
            if self.fall_timer <= 0:
                self.state = "rising"
                self.rise_timer = 45
                self.invuln_timer = 90
        elif self.state == "rising":
            self.rise_timer -= 1
            self.invuln_timer -= 1
            if self.rise_timer <= 0:
                self.state = "alive"
        if self.lights_out_cooldown > 0:
            self.lights_out_cooldown -= 1

    def breathe(self):
        """Begin breath - brief moment before fall."""
        if self.state == "alive" and self.lights_out_cooldown <= 0:
            self.state = "breathing"
            self.breath_timer = 30
            return True
        return False

    def lights_out(self):
        """Voluntary fall - die to rise again."""
        if self.state == "breathing":
            self.state = "falling"
            self.fall_timer = 60
            self.lights_out_cooldown = 180
            return True
        return False

    def draw(self, screen):
        self.image.fill(BLACK)
        if self.state == "falling":
            pygame.draw.circle(self.image, WANDERER_GREY, (self.radius, self.radius), self.radius)
            screen.blit(self.image, self.rect)
            return
        if self.state == "rising":
            scale = 1 - (self.rise_timer / 45) * 0.5
            r = int(self.radius * scale)
            invuln_glow = self.invuln_timer > 0
        else:
            r = self.radius
            invuln_glow = False

        # Base circle
        pygame.draw.circle(self.image, WANDERER_GREY, (self.radius, self.radius), r)
        if invuln_glow:
            pygame.draw.circle(self.image, AMBER, (self.radius, self.radius), r + 3, 2)
        if self.state == "breathing":
            pulse = (30 - self.breath_timer) % 10
            pygame.draw.circle(self.image, GOLD, (self.radius, self.radius), r + pulse, 1)

        screen.blit(self.image, self.rect)


class PaleOne(pygame.sprite.Sprite):
    """The Pale Ones - hunt the Wanderer. Drink time."""

    def __init__(self, x, y):
        super().__init__()
        self.radius = 18
        self.image = pygame.Surface((self.radius * 2, self.radius * 2))
        self.image.set_colorkey(BLACK)
        self.rect = self.image.get_rect(center=(x, y))
        self.x, self.y = float(x), float(y)

    def update(self, wanderer):
        if wanderer.state in ("falling", "rising") or wanderer.invuln_timer > 0:
            return
        dx = wanderer.x - self.x
        dy = wanderer.y - self.y
        dist = math.sqrt(dx * dx + dy * dy)
        if dist > 5:
            dx, dy = dx / dist, dy / dist
            self.x += dx * PALE_ONE_SPEED
            self.y += dy * PALE_ONE_SPEED
        self.rect.center = (int(self.x), int(self.y))

    def draw(self, screen):
        self.image.fill(BLACK)
        pygame.draw.circle(self.image, PALE_SKIN, (self.radius, self.radius), self.radius)
        pygame.draw.circle(self.image, PALE_EYES, (self.radius - 5, self.radius - 3), 3)
        pygame.draw.circle(self.image, PALE_EYES, (self.radius + 5, self.radius - 3), 3)
        screen.blit(self.image, self.rect)


class CrowdMember(pygame.sprite.Sprite):
    """Soul to be awakened. Stands still until touched by the Wanderer."""

    def __init__(self, x, y):
        super().__init__()
        self.radius = 12
        self.image = pygame.Surface((self.radius * 2, self.radius * 2))
        self.image.set_colorkey(BLACK)
        self.rect = self.image.get_rect(center=(x, y))
        self.awakened = False
        self.awaken_progress = 0

    def update(self, wanderer):
        if self.awakened:
            return
        dist = math.hypot(wanderer.x - self.rect.centerx, wanderer.y - self.rect.centery)
        if dist < AWAKEN_RADIUS and wanderer.state == "alive":
            self.awaken_progress = min(AWAKEN_TIME, self.awaken_progress + 1)
            if self.awaken_progress >= AWAKEN_TIME:
                self.awakened = True

    def draw(self, screen):
        self.image.fill(BLACK)
        if self.awakened:
            pygame.draw.circle(self.image, FLAME, (self.radius, self.radius), self.radius)
            pygame.draw.circle(self.image, AMBER, (self.radius, self.radius), self.radius - 2)
        else:
            grey = (60 + self.awaken_progress // 2, 60 + self.awaken_progress // 2, 65)
            pygame.draw.circle(self.image, grey, (self.radius, self.radius), self.radius)
            if self.awaken_progress > 0:
                pygame.draw.arc(
                    self.image,
                    AMBER,
                    (2, 2, self.radius * 2 - 4, self.radius * 2 - 4),
                    0,
                    2 * 3.14159 * self.awaken_progress / AWAKEN_TIME,
                    2,
                )
        screen.blit(self.image, self.rect)
