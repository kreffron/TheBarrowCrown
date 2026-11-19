#!/usr/bin/env python3
"""Builds dist/index.html: one self-contained page with all code, data and styles inline."""
import glob
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = ['core', 'gfx', 'audio', 'ui', 'field', 'puzzle', 'hunt', 'script', 'battle', 'board', 'shapes', 'tactics', 'bonds', 'quips', 'terrain', 'fieldfx', 'pieces', 'beasts', 'beasts2', 'heroes', 'heroic', 'figures', 'icons', 'portraits', 'scenes', 'iso', 'menu', 'handbook', 'bios', 'worldmap', 'main']
DATA = ['rules', 'items', 'bestiary', 'looks']


def read(path):
    with open(os.path.join(ROOT, path), encoding='utf-8') as f:
        return f.read()


def chapters():
    out = []
    for d in sorted(glob.glob(os.path.join(ROOT, 'data', 'ch*'))):
        for f in sorted(glob.glob(os.path.join(d, '*.js'))):
            out.append(os.path.relpath(f, ROOT))
    return out


def main():
    files = ['src/%s.js' % s for s in SRC] + ['data/%s.js' % d for d in DATA] + chapters()
    js = '\n'.join('/* ===== %s ===== */\n%s' % (f, read(f)) for f in files)
    assert '</script' not in js
    html = read('src/page.html').replace('/*__CSS__*/', read('src/style.css')).replace('/*__JS__*/', js)
    os.makedirs(os.path.join(ROOT, 'dist'), exist_ok=True)
    with open(os.path.join(ROOT, 'dist', 'index.html'), 'w', encoding='utf-8') as f:
        f.write(html)
    os.makedirs(os.path.join(ROOT, 'docs'), exist_ok=True)              # GitHub Pages serves the docs folder
    with open(os.path.join(ROOT, 'docs', 'index.html'), 'w', encoding='utf-8') as f:
        f.write(html)
    print('built dist/index.html: %d files, %.0f KB' % (len(files), len(html.encode('utf-8')) / 1024))


if __name__ == '__main__':
    main()
