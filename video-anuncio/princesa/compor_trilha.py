"""Trilha ORIGINAL de conto de fadas composta por código (valsa em 3/4).

Harpa em arpejos (Karplus-Strong brilhante), celesta/caixinha de música na melodia,
cordas suaves de fundo e triângulo. Fá maior, 132 bpm (valsa).
Uso: python3 compor_trilha.py <duracao_segundos> <saida.wav>
"""
import sys
import wave

import numpy as np

SR = 44100
BPM = 132
BEAT = 60 / BPM
rng = np.random.default_rng(11)
dur = float(sys.argv[1])
out_path = sys.argv[2]
N = int((dur + 3) * SR)
mix = np.zeros(N)


def hz(m: float) -> float:
    return 440.0 * 2 ** ((m - 69) / 12)


def add(sig, t, gain):
    i = int(t * SR)
    if i >= N:
        return
    j = min(N, i + len(sig))
    mix[i:j] += sig[: j - i] * gain


def harp(freq, length=2.2):
    n = int(length * SR)
    period = max(2, int(SR / freq))
    buf = rng.uniform(-1, 1, period)
    out = np.empty(n)
    for k in range(n):
        i = k % period
        out[k] = buf[i]
        buf[i] = 0.998 * (0.62 * buf[i] + 0.38 * buf[(i + 1) % period])
    return out * np.exp(-np.linspace(0, 3.2, n)) * np.minimum(1, np.linspace(0, 60, n))


def celesta(freq, length=1.6):
    t = np.arange(int(length * SR)) / SR
    tone = np.sin(2 * np.pi * freq * t) + 0.5 * np.sin(2 * np.pi * freq * 4 * t) * np.exp(-t * 10) + 0.2 * np.sin(2 * np.pi * freq * 3.01 * t) * np.exp(-t * 6)
    return tone * np.exp(-t * 2.6) * np.minimum(1, t * 600)


def strings(freqs, length):
    t = np.arange(int(length * SR)) / SR
    sig = np.zeros_like(t)
    for f in freqs:
        for det in (-0.25, 0.0, 0.25):  # coro leve
            ff = f * 2 ** (det / 12)
            sig += np.sin(2 * np.pi * ff * t + 0.3 * np.sin(2 * np.pi * 5 * t))
    env = np.minimum(1, t / 0.6) * np.minimum(1, (length - t) / 0.6)
    return sig * env / (len(freqs) * 3)


def triangle(length=1.0):
    t = np.arange(int(length * SR)) / SR
    return (np.sin(2 * np.pi * 4200 * t) + 0.6 * np.sin(2 * np.pi * 6100 * t)) * np.exp(-t * 6)


# F – Dm – Bb – C (graus da valsa)
CHORDS = [[53, 57, 60, 65], [50, 53, 57, 62], [46, 50, 53, 58], [48, 52, 55, 60]]
MELODY = [
    [(0, 77), (1, 79), (2, 81)],
    [(0, 81), (1.5, 79), (2, 77)],
    [(0, 74), (1, 77), (2, 82)],
    [(0, 81), (1, 79), (2, 76)],
    [(0, 77), (1, 81), (2, 84)],
    [(0, 86), (1.5, 84), (2, 81)],
    [(0, 82), (1, 81), (2, 79)],
    [(0, 77), (2, 76)],
]
bar = 3 * BEAT
n_bars = int(np.ceil(dur / bar))
cache = {}
for b in range(n_bars):
    t0 = b * bar
    ch = CHORDS[(b // 2) % 4]
    # harpa: baixo no tempo 1, arpejo subindo nos tempos 2 e 3
    seq = [(0, ch[0] - 12), (1, ch[1]), (1.5, ch[2]), (2, ch[3]), (2.5, ch[2] + 12)]
    for beat, m in seq:
        if m not in cache:
            cache[m] = harp(hz(m))
        add(cache[m], t0 + beat * BEAT + rng.uniform(0, 0.006), 0.2 if beat == 0 else 0.12)
    if b % 2 == 0:
        add(strings([hz(m) for m in ch], bar * 2 + 0.3), t0, 0.12)
    if b >= 2:
        for beat, m in MELODY[b % 8]:
            add(celesta(hz(m)), t0 + beat * BEAT, 0.13)
    if b % 4 == 3:
        add(triangle(), t0 + 2 * BEAT, 0.05)

# Acorde final brilhante
end_t = n_bars * bar
for m in (53, 60, 65, 69, 72, 77):
    add(harp(hz(m), 3.0), end_t + (m - 53) * 0.03, 0.14)
add(celesta(hz(89), 2.5), end_t + 0.3, 0.12)

end = int(dur * SR)
mix = mix[:end]
fade = int(1.5 * SR)
mix[-fade:] *= np.linspace(1, 0, fade)
mix[: int(0.05 * SR)] *= np.linspace(0, 1, int(0.05 * SR))
mix = np.tanh(mix * 1.3) / np.tanh(1.3)
mix *= 0.89 / np.max(np.abs(mix))
pcm = (mix * 32767).astype(np.int16)
with wave.open(out_path, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(np.repeat(pcm[:, None], 2, axis=1).tobytes())
print(f"trilha: {dur:.1f}s em {out_path}")
