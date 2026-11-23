"""Builds the Giant Hostel textures from the reference photos in assets/reference/giant_hostel/.

  python3 tools/build_giant_hostel_assets.py        (needs Pillow + numpy: pip install pillow numpy)

Outputs:
  assets/textures/giant_hostel/*.jpg   - perspective-corrected crops of the real photos + photo-sampled textures
  data/tex_giant_hostel.js             - the same JPEGs as data URIs (AV.TEX_GH), so they also load from file://
                                         (browsers refuse file:// images as WebGL textures)
"""
import base64, io, json, os, random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REF = os.path.join(ROOT, 'assets', 'reference', 'giant_hostel')
OUT = os.path.join(ROOT, 'assets', 'textures', 'giant_hostel')
FONTS = '/System/Library/Fonts/Supplemental/'
os.makedirs(OUT, exist_ok=True)


def photo(name):
    return ImageOps.exif_transpose(Image.open(os.path.join(REF, name + '.jpg'))).convert('RGB')


def rectify(img, quad, size):
    """quad = source corners TL, TR, BR, BL (pixels) -> size (w, h) front-on image"""
    w, h = size
    dst = [(0, 0), (w, 0), (w, h), (0, h)]
    A, B = [], []
    for (x, y), (u, v) in zip(quad, dst):   # solve for the output->input projective map
        A.append([u, v, 1, 0, 0, 0, -x * u, -x * v]); B.append(x)
        A.append([0, 0, 0, u, v, 1, -y * u, -y * v]); B.append(y)
    coef = np.linalg.solve(np.array(A, float), np.array(B, float))
    return img.transform(size, Image.PERSPECTIVE, tuple(coef), Image.BICUBIC)


def seamless(img):
    """cross-fade with a half-offset copy so the texture tiles without visible seams"""
    a = np.asarray(img).astype(np.float32)
    for ax in (1, 0):
        n = a.shape[ax]; t = np.sin(np.pi * (np.arange(n) + .5) / n) ** 2
        t = t[None, :, None] if ax == 1 else t[:, None, None]
        a = a * t + np.roll(a, n // 2, axis=ax) * (1 - t)
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def grade(img, gain=1.0, lift=0.0, sat=1.0):
    a = np.asarray(img).astype(np.float32) / 255
    g = a.mean(axis=2, keepdims=True); a = g + (a - g) * sat
    return Image.fromarray(np.clip((a * gain + lift) * 255, 0, 255).astype(np.uint8))


def font(name, size):
    return ImageFont.truetype(FONTS + name, size)


def outlined(d, xy, text, f, fill, outline, ow, shadow=None, anchor='la'):
    x, y = xy
    if shadow: d.text((x + shadow, y + shadow), text, font=f, fill=outline, anchor=anchor, stroke_width=ow, stroke_fill=outline)
    d.text((x, y), text, font=f, fill=fill, anchor=anchor, stroke_width=ow, stroke_fill=outline)


res = {}

# ---- 1. Buds lightbox (image6): rectified sign face, wind chime painted out ----
im = rectify(photo('image6'), [(1057, 1477), (1905, 1664), (1937, 2109), (1054, 2000)], (1024, 576))
a = np.asarray(im).astype(np.float32)
x0, x1 = 708, 802                      # chime column (output pixels): fill with the cream sampled either side
for y in range(0, 312):
    l, r = a[y, x0 - 6:x0 - 2].mean(0), a[y, x1 + 2:x1 + 6].mean(0)
    for x in range(x0, x1): t = (x - x0) / (x1 - x0); a[y, x] = l * (1 - t) + r * t
im = grade(Image.fromarray(a.astype(np.uint8)).filter(ImageFilter.UnsharpMask(2, 60, 2)), 1.04)
res['buds'] = im.resize((1024, 512), Image.LANCZOS)

# ---- 2. glass door leaf (image1): rectified glass with the Christmas decals + PUSH stickers ----
im = rectify(photo('image1'), [(312, 1660), (876, 1850), (872, 3544), (320, 3881)], (512, 1100))
res['door'] = grade(im, 1.12, .02, .92).resize((512, 1024), Image.LANCZOS)

# ---- 3. red "no under 20" board (image1) ----
im = rectify(photo('image1'), [(999, 3249), (1254, 3270), (1284, 3672), (996, 3606)], (320, 448))
res['age'] = grade(im, 1.0, 0, .9).filter(ImageFilter.UnsharpMask(2, 80, 2)).resize((256, 512), Image.LANCZOS)

# ---- 4. black stone table top (image5): flat patch, made tileable ----
im = photo('image5').crop((1500, 2560, 2500, 3360)).resize((512, 512), Image.LANCZOS)
res['granite'] = seamless(grade(im, 1.0, 0, .6))

# ---- 5. brick slip cladding: palette + grain sampled from the planter bricks in image5 ----
src = np.asarray(photo('image5').crop((1880, 1100, 2180, 1190))).reshape(-1, 3).astype(np.float32)
src = src[(src[:, 0] > src[:, 1] + 30) & (src[:, 0] > src[:, 2] + 45) & (src.sum(1) > 200)]   # brick-coloured pixels only (no mortar / leaves / shadow)
src = src * .55 + np.median(src, 0) * .45
rng = random.Random(7); np.random.seed(7)
W = 512; bh, bw, mj = 30, 118, 5
cv = Image.new('RGB', (W, W), (196, 188, 176)); d = ImageDraw.Draw(cv)
for row in range(W // (bh + mj) + 1):
    y = row * (bh + mj); off = -(bw + mj) // 2 if row % 2 else 0
    for k in range(-1, W // (bw + mj) + 2):
        x = off + k * (bw + mj); c = src[rng.randrange(len(src))] * (.85 + rng.random() * .3)
        d.rectangle([x, y, x + bw - 1, y + bh - 1], fill=tuple(int(min(255, v)) for v in c))
a = np.asarray(cv).astype(np.float32); a *= (1 + np.random.normal(0, .07, a.shape[:2]))[:, :, None]
a[-40:] *= np.linspace(1, .82, 40)[:, None, None]     # dusty foot
res['brick'] = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(.6))

# ---- 6. GIANT HOSTEL vinyl banner (the photo is cut off; re-typeset from the photo's colours + layout) ----
#      Thai lines are left blank here (Pillow has no Thai shaping): the game writes them with the browser's Thai font.
MAG, INK, CYAN = (214, 28, 120), (18, 12, 16), (120, 220, 240)
Bw, Bh = 2100, 760
cv = Image.new('RGB', (Bw, Bh), (246, 244, 240)); d = ImageDraw.Draw(cv)
d.rectangle([0, 0, Bw, 92], fill=MAG)
d.text((40, 46), 'GUEST HOUSE  ·  HOSTEL  ·  CHIANG MAI', font=font('Arial Bold.ttf', 50), fill=CYAN, anchor='lm')
outlined(d, (60, 92), 'GIANT', font('Times New Roman Bold.ttf', 330), MAG, INK, 11, shadow=13)
outlined(d, (Bw - 60, 360), 'HOSTEL', font('Times New Roman Bold.ttf', 260), MAG, INK, 9, shadow=11, anchor='ra')
d.rectangle([0, Bh - 22, Bw, Bh], fill=MAG); d.rectangle([4, 4, Bw - 5, Bh - 5], outline=MAG, width=10)
a = np.asarray(cv).astype(np.float32)
yy, xx = np.mgrid[0:Bh, 0:Bw]
wr = 1 - .07 * np.clip(np.sin(xx / 61 + yy / 140) * np.sin(yy / 23 + xx / 400), 0, 1) - .04 * np.exp(-((xx - 1450) / 160) ** 2)
a *= wr[:, :, None]; a *= (1 + np.random.normal(0, .015, a.shape[:2]))[:, :, None]
res['banner'] = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).resize((1024, 512), Image.LANCZOS)

# ---- 7. WELCOME door mat: needle-felt grain sampled from image5, lettering like the real mat ----
felt = np.asarray(photo('image5').crop((300, 1880, 460, 1960))).reshape(-1, 3).astype(np.float32)
base, sd = np.median(felt, 0), felt.std(0).mean() / 255
fib = np.random.normal(0, sd * 1.4, (560, 900)); fib = np.asarray(Image.fromarray(((fib + .5) * 255).clip(0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))).astype(np.float32) / 255 - .5
cv = Image.fromarray(np.clip(base[None, None, :] * (1 + fib[:, :, None] * 1.6), 0, 255).astype(np.uint8))
cv = grade(cv, 1.05, 0, 1.1); d = ImageDraw.Draw(cv)
d.rectangle([0, 0, 899, 559], outline=(120, 30, 30), width=34)
d.text((450, 290), 'WELCOME', font=font('Arial Bold.ttf', 150), fill=(226, 206, 140), anchor='mm')
res['mat'] = cv.filter(ImageFilter.GaussianBlur(1.1)).resize((512, 256), Image.LANCZOS)

# ---- write JPEGs + the data-URI pack ----
pack = {}
for k, im in res.items():
    p = os.path.join(OUT, k + '.jpg'); im.save(p, quality=84, optimize=True)
    buf = io.BytesIO(); im.save(buf, 'JPEG', quality=80, optimize=True)
    pack[k] = 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode()
    print('%-8s %4dx%-4d %6.1f KB' % (k, im.width, im.height, len(buf.getvalue()) / 1024))
with open(os.path.join(ROOT, 'data', 'tex_giant_hostel.js'), 'w') as f:
    f.write('/* generated by tools/build_giant_hostel_assets.py from assets/reference/giant_hostel/ (do not edit) */\n')
    f.write('window.AV = window.AV || {}; AV.TEX_GH = ' + json.dumps(pack, indent=0) + ';\n')
