"""Procedural audio for Thirty Seven — musical instrument layer.

Map game state to sound: crowd = notes to play, proximity = volume.
Movement through the space creates melody. Breathe, Fall, Rise = drone phrases."""

import math
import pygame
import numpy as np

SAMPLE_RATE = 44100

# Pentatonic scale (C minor) — each crowd member gets a note
# 65.41 = C3, 73.42 = D3, 82.41 = Eb3, 98 = G3, 110 = A3, 130.81 = C4, etc.
PENTATONIC = [65.41, 73.42, 82.41, 98, 110, 130.81, 146.83, 164.81, 196, 220]


def _seeded_random(seed):
    """Lcg rng matching web version."""
    state = seed
    def rng():
        nonlocal state
        state = (state * 1103515245 + 12345) & 0x7FFFFFFF
        return state / 0x7FFFFFFF
    return rng


def _make_tone(freq, duration, volume=0.25, decay=True):
    """Generate sine wave as int16 numpy array."""
    n = int(SAMPLE_RATE * duration)
    t = np.linspace(0, duration, n, dtype=np.float32)
    wave = np.sin(2 * np.pi * freq * t).astype(np.float32)
    if decay:
        envelope = np.exp(-t / (duration * 0.6))
        wave *= envelope
    wave = (wave * volume * 32767).astype(np.int16)
    return wave


def _play_buffer(wave):
    """Play numpy buffer via pygame."""
    try:
        sound = pygame.sndarray.make_sound(wave)
        sound.play()
    except Exception:
        pass


def init_mixer():
    """Init pygame mixer for our sample rate. Force mono so 1D arrays work."""
    init = pygame.mixer.get_init()
    if init is not None:
        _, _, channels = init
        if channels != 1:
            pygame.mixer.quit()
            init = None
    if init is None:
        pygame.mixer.init(frequency=SAMPLE_RATE, size=-16, channels=1, buffer=1024)


# --- Event sounds (match web) ---

def menu_tap():
    init_mixer()
    _play_buffer(_make_tone(880, 0.08, 0.15))


def breathe():
    init_mixer()
    _play_buffer(_make_tone(220, 0.15, 0.2))


def lights_out():
    init_mixer()
    # Descending drone
    wave = np.concatenate([
        _make_tone(165, 0.13, 0.2),
        _make_tone(123, 0.13, 0.22),
        _make_tone(98, 0.14, 0.25),
    ])
    _play_buffer(wave)


def rise():
    init_mixer()
    _play_buffer(_make_tone(440, 0.2, 0.2))


def caught():
    init_mixer()
    _play_buffer(_make_tone(150, 0.5, 0.3))


def level_complete():
    init_mixer()
    _play_buffer(_make_tone(523, 0.25, 0.2))


def awaken():
    """Bell-like awaken tone."""
    init_mixer()
    _play_buffer(_make_tone(660, 0.12, 0.15))


# --- Musical instrument: proximity tones ---

def note_for_crowd_index(i):
    """Pitch for crowd member i — pentatonic."""
    return PENTATONIC[i % len(PENTATONIC)]


def play_proximity_tone(freq, intensity=0.12):
    """Soft tone when near unawakened crowd — you're playing them."""
    init_mixer()
    wave = _make_tone(freq, 0.18, intensity, decay=True)
    _play_buffer(wave)


# --- Background chord drone (level ambience) ---

def notes_for_level(level_seed):
    """Root + intervals, matching web Music.notesForSeed."""
    rng = _seeded_random(level_seed)
    roots = [55, 61.74, 65.41, 73.42, 82.41, 92.5, 98, 110]
    root = roots[math.floor(rng() * len(roots))]
    intervals = [[1, 1.5, 2], [1, 1.26, 1.5], [1, 1.5, 2.25], [1, 1.41, 2]]
    a, b, c = intervals[math.floor(rng() * len(intervals))]
    return [root * a, root * b, root * c]


_drone_sound = None


def start_drone(level_seed):
    """Start background chord drone for level."""
    global _drone_sound
    init_mixer()
    freqs = notes_for_level(level_seed)
    duration = 2.5
    n = int(SAMPLE_RATE * duration)
    t = np.linspace(0, duration, n, dtype=np.float32)
    mixed = np.zeros(n, dtype=np.float32)
    for f in freqs:
        mixed += np.sin(2 * np.pi * f * t).astype(np.float32) * 0.06
    mixed = np.clip(mixed, -1, 1)
    wave = (mixed * 32767).astype(np.int16)
    _drone_sound = pygame.sndarray.make_sound(wave)
    _drone_sound.play(loops=-1)


def stop_drone():
    global _drone_sound
    if _drone_sound:
        _drone_sound.stop()
        _drone_sound = None
