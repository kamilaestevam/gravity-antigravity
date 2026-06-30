"""Gera screenshots do manual Hub com marcadores numerados (1–4) para acesso à Gravity Store."""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

DRIVE_HUB = Path(
    r"G:\Meu Drive\4. Gravity\1. Manual e Onboarding\1. Imagens para manual e onboarding\3. Hub"
)
OUT_DIR = Path(
    r"c:\Users\danie\gravity-antigravity\servicos-global\configurador\public\university\screenshots"
)

# Coordenadas (x, y) no canvas 1912×909 — centro do badge
MARCADORES_SEM_PRODUTO = {
    "1": (1685, 188),   # Banner «Ir para Gravity Store»
    "2": (1705, 288),   # Link «Gravity Store» no cabeçalho (mais próximo do botão)
    "3": (462, 836),    # Card DISPONÍVEL na vitrine inferior
}

MARCADOR_MENU = {
    "4": (1764, 272),   # Item «Ir para Gravity Store» no menu do usuário (1913×908)
}


def _fonte(tamanho: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for nome in ("arialbd.ttf", "Arial Bold.ttf", "segoeuib.ttf", "calibrib.ttf"):
        try:
            return ImageFont.truetype(nome, tamanho)
        except OSError:
            continue
    return ImageFont.load_default()


def desenhar_badge(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int],
    numero: str,
    *,
    raio: int = 22,
) -> None:
    x, y = xy
    bbox = (x - raio, y - raio, x + raio, y + raio)
    draw.ellipse(bbox, fill="#6366f1", outline="#a5b4fc", width=3)
    fonte = _fonte(26)
    draw.text((x, y), numero, fill="#ffffff", font=fonte, anchor="mm")


def anotar(origem: Path, destino: Path, marcadores: dict[str, tuple[int, int]]) -> None:
    img = Image.open(origem).convert("RGBA")
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    for numero, pos in marcadores.items():
        desenhar_badge(draw, pos, numero)
    composto = Image.alpha_composite(img, overlay).convert("RGB")
    composto.save(destino, optimize=True)
    print(f"OK {destino.name} ({composto.size[0]}×{composto.size[1]})")


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    sem_produto = DRIVE_HUB / "tela_hub_inicial_sem_produto_contratado.png"
    menu = DRIVE_HUB / "tela_hub_ir_gravity_store_menu .png"

    anotar(
        sem_produto,
        OUT_DIR / "hub-acesso-gravity-store-numeros-1-2-3.png",
        MARCADORES_SEM_PRODUTO,
    )
    anotar(
        menu,
        OUT_DIR / "hub-acesso-gravity-store-menu-4.png",
        MARCADOR_MENU,
    )


if __name__ == "__main__":
    main()
