# Anúncio em vídeo: "O baile da princesinha Helena"

Versão feminina, tema festa de princesa, no estilo de animação clássica de conto de fadas. Vertical 1080×1920, 24 qps, ~45 s.

- `anuncio-princesa-festa-no-link.mp4`: vídeo final com narração, efeitos e trilha (−14 LUFS).
- `capa.jpg`: quadro do cartão final, para usar como capa.
- `roteiro.json`: falas, legendas, voz e efeitos.

## Estilo
Céu de pôr do sol com estrelas e lua, castelo com janelas iluminadas e bandeiras ao vento, halos e brilhos, rastro de luz da varinha e fogos vistos pelas janelas do salão. Animação suave (24 qps) com dissolves entre cenas.

**Personagens e cenários são originais.** A princesa Helena não imita nenhuma personagem existente, e o vídeo não usa marcas ou personagens da Disney nem de outros estúdios.

## Áudio
- **Narração:** ElevenLabs (voz "Jessica", multilíngue).
- **Efeitos:** ElevenLabs (magia, fanfarra, relógio, pássaros, fogos).
- **Trilha:** valsa original composta por código em `compor_trilha.py` (harpa, celesta, cordas, triângulo).

## Gerar de novo
```bash
python3 gerar_audio.py     # narração e efeitos
node montar.mjs --previa   # quadros-chave para revisão
node montar.mjs            # vídeo completo em build/
```
