#!/usr/bin/env bash
# Egy dia (vagy annak egy téglalapja) kivágása a diasorból PNG-be: tananyag/img/dia-NNN[-utotag].png
#
#   tools/dia-kep.sh <dia> [x y szélesség magasság] [-n utótag]
#
# A koordináták 150 dpi-s képpontban értendők (egy 16:9-es dia kb. 2000×1125 px). Kivágás nélkül a teljes dia.
# A diasor helye a FEGATT_PDF környezeti változóval felülírható.
set -euo pipefail
PDF="${FEGATT_PDF:-/forlinux/MEGA/MEGABase/obsidian/Vault/ME/ACTIVE/A fejlődés gazdaságtörténete/resources/Fegatt.pdf}"
OUT="$(cd "$(dirname "$0")/.." && pwd)/tananyag/img"

[ $# -ge 1 ] || { sed -n '2,7p' "$0"; exit 1; }
page="$1"; shift
crop=(); suffix=""
if [ $# -ge 4 ] && [[ "$1" =~ ^[0-9]+$ ]]; then crop=(-x "$1" -y "$2" -W "$3" -H "$4"); shift 4; fi
if [ "${1:-}" = "-n" ]; then suffix="-$2"; fi

name="$(printf 'dia-%03d%s' "$page" "$suffix")"
mkdir -p "$OUT"
pdftoppm -f "$page" -l "$page" -r 150 -png -singlefile "${crop[@]}" "$PDF" "$OUT/$name"
# Méretcsökkentés 256 színű palettára (diagramokon, térképeken nem látható), ha a Pillow elérhető.
python3 -I -c 'import sys; from PIL import Image
im = Image.open(sys.argv[1]).convert("RGB")
im.quantize(256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).save(sys.argv[1], optimize=True)' "$OUT/$name.png" 2>/dev/null || true
echo "$OUT/$name.png"
