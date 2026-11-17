# Anúncio em vídeo: "O convite do Theo"

Historinha narrada em estilo **recorte de papel** para Reels, Stories e TikTok (vertical 1080×1920, 24 qps, ~45 s).

- `anuncio-festa-no-link.mp4`: vídeo final, com narração, efeitos e trilha (−14 LUFS, padrão das redes).
- `capa.jpg`: quadro do cartão final, para usar como capa.
- `roteiro.json`: falas, legendas, voz e efeitos. Edite aqui para mudar o texto.

## Como foi feito
- **Narração:** ElevenLabs (voz "Jessica", modelo multilíngue, português). Conferida por transcrição automática.
- **Efeitos sonoros:** ElevenLabs (papel, vento, brilho, "pop", festa, teclado).
- **Trilha:** composta por código em `compor_trilha.py` (ukulele, glockenspiel, baixo, palmas). É original, sem direitos de terceiros.
- **Animação:** `cena.html` (SVG). Cada peça de papel tem sombra e borda irregular, os fantoches têm alfinetes nas articulações e a cadência é de stop-motion (12 desenhos por segundo com "tremidinho").
- **Personagens:** os personagens originais da loja (ursinho Theo, dinossauro, coelhinha, leãozinho, baleia).

## Gerar de novo
```bash
python3 gerar_audio.py     # narração e efeitos (reaproveita o que já existe em build/)
node montar.mjs --previa   # quadros-chave para revisão
node montar.mjs            # vídeo completo em build/anuncio-festa-no-link.mp4
node montar.mjs --audio    # refaz só a trilha e a mixagem
```
Para trocar uma fala, edite `roteiro.json` e apague o MP3 correspondente em `build/audio/` antes de rodar `gerar_audio.py`.
