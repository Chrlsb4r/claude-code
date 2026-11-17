"""Gera narração (por cena) e efeitos sonoros com a ElevenLabs e mede as durações.

Uso: python3 video-anuncio/gerar_audio.py
Saída: video-anuncio/build/audio/*.mp3 e video-anuncio/build/tempos.json
A autenticação é injetada pelo proxy do ambiente (nenhuma chave no código).
"""
import json
import subprocess
from pathlib import Path

RAIZ = Path(__file__).resolve().parent
SAIDA = RAIZ / "build" / "audio"
SAIDA.mkdir(parents=True, exist_ok=True)
roteiro = json.loads((RAIZ / "roteiro.json").read_text())
API = "https://api.elevenlabs.io/v1"


def post(url: str, body: dict, destino: Path):
    if destino.exists() and destino.stat().st_size > 1000:
        return  # reaproveita (evita gastar créditos de novo)
    r = subprocess.run(
        ["curl", "-sS", "-o", str(destino), "-w", "%{http_code}", "-X", "POST", url,
         "-H", "Content-Type: application/json", "-d", json.dumps(body)],
        capture_output=True, text=True, check=True,
    )
    if r.stdout != "200":
        erro = destino.read_text(errors="ignore")[:300]
        destino.unlink(missing_ok=True)
        raise SystemExit(f"Falha {r.stdout} em {url}: {erro}")


def duracao(p: Path) -> float:
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)],
                         capture_output=True, text=True, check=True).stdout
    return float(out.strip())


voz = roteiro["voz"]
falas = [c["fala"] for c in roteiro["cenas"]]
tempos = {"cenas": [], "efeitos": {}}
for i, cena in enumerate(roteiro["cenas"]):
    arq = SAIDA / f"fala-{i + 1:02d}-{cena['id']}.mp3"
    post(
        f"{API}/text-to-speech/{voz['voice_id']}?output_format=mp3_44100_128",
        {
            "text": cena["fala"],
            "model_id": voz["modelo"],
            "language_code": "pt",
            # Contexto das falas vizinhas mantém a entonação contínua entre cenas.
            "previous_text": " ".join(falas[:i])[-500:] or None,
            "next_text": " ".join(falas[i + 1:])[:500] or None,
            "voice_settings": {"stability": 0.45, "similarity_boost": 0.8, "style": 0.4, "use_speaker_boost": True, "speed": 1.0},
        },
        arq,
    )
    tempos["cenas"].append({"id": cena["id"], "arquivo": arq.name, "duracao": round(duracao(arq), 3)})
    print(f"{cena['id']:<13} {tempos['cenas'][-1]['duracao']:.2f}s")

for nome, efx in roteiro["efeitos"].items():
    arq = SAIDA / f"efeito-{nome}.mp3"
    post(f"{API}/sound-generation?output_format=mp3_44100_128",
         {"text": efx["texto"], "duration_seconds": efx["duracao"], "prompt_influence": 0.6}, arq)
    tempos["efeitos"][nome] = {"arquivo": arq.name, "duracao": round(duracao(arq), 3)}
    print(f"efeito {nome:<8} {tempos['efeitos'][nome]['duracao']:.2f}s")

(RAIZ / "build" / "tempos.json").write_text(json.dumps(tempos, indent=2, ensure_ascii=False))
print("total narração:", round(sum(c["duracao"] for c in tempos["cenas"]), 2), "s")
