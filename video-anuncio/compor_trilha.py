"""Trilha sonora ORIGINAL composta por código (sem direitos de terceiros).

Ukulele dedilhado (síntese Karplus-Strong), glockenspiel na melodia, baixo suave,
palmas e chocalho leves. Dó maior, 112 bpm, progressão C–G–Am–F.
Uso: python3 compor_trilha.py <duracao_segundos> <saida.wav>
"""
import sys
import wave

import numpy as np

SR = 44100
BPM = 112
BEAT = 60 / BPM
rng = np.random.default_rng(7)

dur = float(sys.argv[1])
out_path = sys.argv[2]
N = int((dur + 2.5) * SR)
mix = np.zeros(N)


def hz(midi: float) -> float:
    return 440.0 * 2 ** ((midi - 69) / 12)


def add(sig: np.ndarray, t: float, gain: float):
    i = int(t * SR)
    if i >= N:
        return
    j = min(N, i + len(sig))
    mix[i:j] += sig[: j - i] * gain


def pluck(freq: float, length: float = 1.4, bright: float = 0.5) -> np.ndarray:
    """Corda dedilhada (Karplus-Strong)."""
    n = int(length * SR)
    period = int(SR / freq)
    buf = rng.uniform(-1, 1, period)
    out = np.empty(n)
    for k in range(n):
        i = k % period
        out[k] = buf[i]
        buf[i] = 0.996 * (bright * buf[i] + (1 - bright) * buf[(i + 1) % period])
    env = np.minimum(1, np.linspace(0, 40, n)) * np.exp(-np.linspace(0, 4.5, n))
    return out * env


def glock(freq: float, length: float = 1.2) -> np.ndarray:
    t = np.arange(int(length * SR)) / SR
    tone = np.sin(2 * np.pi * freq * t) + 0.35 * np.sin(2 * np.pi * freq * 2.76 * t) * np.exp(-t * 9) + 0.15 * np.sin(2 * np.pi * freq * 5.4 * t) * np.exp(-t * 14)
    return tone * np.exp(-t * 3.2) * np.minimum(1, t * 400)


def bass(freq: float, length: float) -> np.ndarray:
    t = np.arange(int(length * SR)) / SR
    tone = np.sin(2 * np.pi * freq * t) + 0.25 * np.sin(2 * np.pi * freq * 2 * t)
    return tone * np.exp(-t * 2.2) * np.minimum(1, t * 200)


def noise_hit(length: float, decay: float, hp: bool = True) -> np.ndarray:
    n = int(length * SR)
    x = rng.uniform(-1, 1, n)
    if hp:
        x = np.diff(np.concatenate([[0], x]))  # agudiza (chocalho/palma)
    return x * np.exp(-np.arange(n) / SR * decay)


# Acordes (notas MIDI) e fundamentais do baixo
CHORDS = [([60, 64, 67, 72], 36), ([59, 62, 67, 71], 43), ([57, 60, 64, 69], 45), ([57, 60, 65, 69], 41)]
# Melodia do glockenspiel por compasso (tempo em batidas, nota MIDI)
MELODY = [
    [(0, 76), (1, 79), (2, 84), (3, 79)],
    [(0, 79), (1.5, 77), (2, 74), (3, 71)],
    [(0, 72), (1, 76), (2, 81), (3, 79)],
    [(0, 77), (1, 76), (2, 74), (3.5, 72)],
]

bar_len = 4 * BEAT
n_bars = int(np.ceil(dur / bar_len))
pluck_cache: dict[int, np.ndarray] = {}
for b in range(n_bars):
    t0 = b * bar_len
    notes, root = CHORDS[b % 4]
    # Ukulele: arpejo em colcheias
    pattern = [0, 2, 1, 3, 2, 1, 3, 2]
    for k, idx in enumerate(pattern):
        m = notes[idx]
        if m not in pluck_cache:
            pluck_cache[m] = pluck(hz(m))
        add(pluck_cache[m], t0 + k * BEAT / 2 + rng.uniform(0, 0.008), 0.16 if k % 2 == 0 else 0.11)
    # Baixo nos tempos 1 e 3
    add(bass(hz(root), BEAT * 1.8), t0, 0.32)
    add(bass(hz(root + 7), BEAT * 1.6), t0 + 2 * BEAT, 0.22)
    # Glockenspiel a partir do 3º compasso (entra depois da introdução)
    if b >= 2:
        for beat, m in MELODY[b % 4]:
            add(glock(hz(m)), t0 + beat * BEAT, 0.12)
    # Palmas nos tempos 2 e 4; chocalho em colcheias
    for beat in (1, 3):
        add(noise_hit(0.18, 28), t0 + beat * BEAT, 0.10)
    for k in range(8):
        add(noise_hit(0.06, 70), t0 + k * BEAT / 2, 0.035 if k % 2 else 0.02)

# Acorde final soando (fim do anúncio)
for m in (60, 64, 67, 72, 76):
    add(pluck(hz(m), 2.5, 0.6), n_bars * bar_len, 0.14)
add(glock(hz(84), 2.0), n_bars * bar_len, 0.14)

# Corta na duração pedida com fade-out curto e normaliza
end = int(dur * SR)
mix = mix[:end]
fade = int(1.2 * SR)
mix[-fade:] *= np.linspace(1, 0, fade)
mix[: int(0.05 * SR)] *= np.linspace(0, 1, int(0.05 * SR))
mix = np.tanh(mix * 1.4) / np.tanh(1.4)  # saturação leve, timbre mais "quente"
mix *= 0.89 / np.max(np.abs(mix))
pcm = (mix * 32767).astype(np.int16)
stereo = np.repeat(pcm[:, None], 2, axis=1)
with wave.open(out_path, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(stereo.tobytes())
print(f"trilha: {dur:.1f}s em {out_path}")
