'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cx as mergeClasses, keyframes, style } from '@cumulo/css';
import { HStack, Stack, vars } from '@cumulo/core';

const EASE_SPRING_BOUNCE = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
const EASE_IN_OUT_SMOOTH = 'cubic-bezier(0.45, 0, 0.55, 1)';

const SCENE_WIDTH = 1440;
const SCENE_HEIGHT = 500;
/** Extra bottom bleed so upward scroll-parallax shifts (-28px / -40px) never reveal a gap at the bottom edge. */
const PARALLAX_BOTTOM_Y = 560;

export interface LandscapeConfig {
  bounciness: number;
  dotPitch: number;
  dotScale: number;
  inkOpacity: number;
  mountainScale: number;
  treeScale: number;
  cloudScale: number;
  lawnRatio: number;
  /** Any integer. Changes mountain, cloud and tree placement. */
  seed: number;
}

export const DEFAULT_CONFIG: LandscapeConfig = {
  bounciness: 1.55,
  dotPitch: 4.5,
  dotScale: 0.8,
  inkOpacity: 0.95,
  mountainScale: 0.95,
  treeScale: 1.2,
  cloudScale: 0.7,
  lawnRatio: 0.5,
  seed: 7,
};

/* -------------------------------------------------------------------------- */
/*  Animation + styles                                                         */
/* -------------------------------------------------------------------------- */

const cloudDriftMain = keyframes(
  { from: { transform: 'translate3d(0, 0, 0)' }, to: { transform: 'translate3d(150px, 0, 0)' } },
  'footer-cloud-drift-main',
);
const cloudDriftSecondary = keyframes(
  { from: { transform: 'translate3d(0, 0, 0)' }, to: { transform: 'translate3d(-8px, 12px, 0)' } },
  'footer-cloud-drift-secondary',
);
const waterShimmer = keyframes(
  {
    from: { opacity: 0.22, transform: 'translateY(0px)' },
    to: { opacity: 0.85, transform: 'translateY(3px)' },
  },
  'footer-water-shimmer',
);
const parallaxSkyShift = keyframes(
  { from: { transform: 'translate3d(0, -4px, 0)' }, to: { transform: 'translate3d(0, 2px, 0)' } },
  'footer-parallax-sky',
);
const parallaxFarMountainShift = keyframes(
  { from: { transform: 'translate3d(0, -20px, 0)' }, to: { transform: 'translate3d(0, 18px, 0)' } },
  'footer-parallax-far-mtn',
);
const parallaxMidLakeShift = keyframes(
  { from: { transform: 'translate3d(0, 12px, 0)' }, to: { transform: 'translate3d(0, -24px, 0)' } },
  'footer-parallax-mid-lake',
);
const parallaxLawnDepthRise = keyframes(
  { from: { transform: 'translate3d(0, 28px, 0)' }, to: { transform: 'translate3d(0, -28px, 0)' } },
  'footer-parallax-lawn-depth',
);
const parallaxFrontGrassRise = keyframes(
  { from: { transform: 'translate3d(0, 86px, 0)' }, to: { transform: 'translate3d(0, -40px, 0)' } },
  'footer-parallax-front-grass',
);

const wrapStyle = style(
  {
    position: 'relative',
    overflow: 'clip',
  },
  'doc-footer-landscape-wrap',
);

const landscapeSvgStyle = style(
  {
    display: 'block',
    width: '100%',
    height: 'auto',
    minHeight: 'clamp(250px, 44dvh, 360px)',
    userSelect: 'none',
    touchAction: 'manipulation',
    viewTimeline: '--footer-landscape block',
  },
  'doc-footer-landscape-svg',
);

const landscapeSvgPlayingStyle = style(
  {
    touchAction: 'none',
  },
  'doc-footer-landscape-svg-playing',
);

const interactivePlayerStyle = style(
  {
    cursor: 'pointer',
  },
  'doc-footer-game-player-clickable',
);

const hudTopBarStyle = style(
  {
    position: 'absolute',
    top: vars.spacing.md,
    left: vars.spacing.sm,
    right: vars.spacing.sm,
    fontFamily: vars.font.mono,
    fontSize: vars.font.size.xs,
    lineHeight: vars.line.height.tight,
    color: vars.surface.muted,
    pointerEvents: 'none',
    '@media': {
      '(max-width: 640px)': {
        fontSize: vars.font.size['2xs'],
      },
    },
  },
  'doc-footer-game-hud-top',
);

const hudStatsPillStyle = style(
  {
    paddingBlock: vars.spacing['3xs'],
    paddingInline: vars.spacing.xs,
    borderRadius: vars.radius.full,
    backgroundColor: `color-mix(in oklch, ${vars.surface.bg.DEFAULT} 80%, transparent)`,
    whiteSpace: 'nowrap',
  },
  'doc-footer-game-stats',
);

const hudBestStyle = style(
  {
    color: vars.surface.subtle,
  },
  'doc-footer-game-best',
);

const hudPowerupPillStyle = style(
  {
    paddingBlock: vars.spacing['3xs'],
    paddingInline: vars.spacing.xs,
    borderRadius: vars.radius.full,
    color: vars.surface.fg,
    backgroundColor: `color-mix(in oklch, ${vars.surface.bg.DEFAULT} 88%, transparent)`,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: vars.surface.border,
    whiteSpace: 'nowrap',
  },
  'doc-footer-game-powerup',
);

const hudButtonStyle = style(
  {
    pointerEvents: 'auto',
    cursor: 'pointer',
    font: 'inherit',
    color: 'inherit',
    backgroundColor: `color-mix(in oklch, ${vars.surface.bg.DEFAULT} 80%, transparent)`,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: vars.surface.border,
    borderRadius: vars.radius.full,
    paddingBlock: vars.spacing['3xs'],
    paddingInline: vars.spacing.xs,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  'doc-footer-game-quit',
);

const hudBottomWrapStyle = style(
  {
    position: 'absolute',
    bottom: vars.spacing.md,
    left: vars.spacing.md,
    right: vars.spacing.md,
    pointerEvents: 'none',
    fontFamily: vars.font.mono,
    fontSize: vars.font.size['2xs'],
    lineHeight: vars.line.height.tight,
  },
  'doc-footer-game-hud-bottom',
);

const hudHintPillStyle = style(
  {
    color: vars.surface.muted,
    whiteSpace: 'nowrap',
    paddingBlock: vars.spacing['3xs'],
    paddingInline: vars.spacing.xs,
    borderRadius: vars.radius.full,
    backgroundColor: `color-mix(in oklch, ${vars.surface.bg.DEFAULT} 82%, transparent)`,
  },
  'doc-footer-game-hint',
);

const hudGameOverButtonStyle = style(
  {
    pointerEvents: 'auto',
    cursor: 'pointer',
    font: 'inherit',
    color: vars.surface.fg,
    backgroundColor: `color-mix(in oklch, ${vars.surface.bg.DEFAULT} 92%, transparent)`,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: vars.surface.border,
    borderRadius: vars.radius.full,
    paddingBlock: vars.spacing['3xs'],
    paddingInline: vars.spacing.sm,
    whiteSpace: 'nowrap',
  },
  'doc-footer-game-retry',
);

const desktopOnlyHintStyle = style(
  {
    '@media': {
      '(hover: none) and (pointer: coarse)': { display: 'none' },
    },
  },
  'doc-footer-game-hint-desktop',
);

const touchOnlyHintStyle = style(
  {
    display: 'none',
    '@media': {
      '(hover: none) and (pointer: coarse)': { display: 'inline' },
    },
  },
  'doc-footer-game-hint-touch',
);

function parallaxLayer(kf: { name: string }, id: string): ReturnType<typeof style> {
  return style(
    {
      willChange: 'transform',
      '@supports': {
        '((animation-timeline: view()) and (animation-range: entry))': {
          animationName: kf.name,
          animationTimingFunction: 'linear',
          animationFillMode: 'both',
          animationTimeline: '--footer-landscape',
          animationRange: 'entry 20% entry 100%',
        },
      },
      '@media': {
        '(prefers-reduced-motion: reduce)': { animationName: 'none !important' },
      },
    },
    id,
  );
}

const parallaxSkyLayerStyle = parallaxLayer(parallaxSkyShift, 'doc-footer-parallax-sky');
const parallaxFarMtnLayerStyle = parallaxLayer(
  parallaxFarMountainShift,
  'doc-footer-parallax-far-mtn',
);
const parallaxMidLakeLayerStyle = parallaxLayer(
  parallaxMidLakeShift,
  'doc-footer-parallax-mid-lake',
);
const parallaxLawnDepthLayerStyle = parallaxLayer(
  parallaxLawnDepthRise,
  'doc-footer-parallax-lawn-depth',
);
const parallaxFrontGrassLayerStyle = parallaxLayer(
  parallaxFrontGrassRise,
  'doc-footer-parallax-front-grass',
);

const interactiveTreeGroupStyle = style(
  {
    transformBox: 'fill-box',
    transformOrigin: 'bottom center',
    transition: `transform 420ms ${EASE_SPRING_BOUNCE}`,
    ':hover': { transform: 'scaleY(1.05) scaleX(0.98)' },
    '@media': {
      '(hover: none)': { transform: 'none' },
      '(prefers-reduced-motion: reduce)': { transition: 'none', transform: 'none' },
    },
  },
  'doc-footer-tree-bounce',
);

const cloudBankAnimStyle = style(
  {
    animation: `${cloudDriftMain} 64s ${EASE_IN_OUT_SMOOTH} infinite alternate`,
    '@media': { '(prefers-reduced-motion: reduce)': { animation: 'none' } },
  },
  'doc-footer-cloud-bank',
);
const cloudRightAnimStyle = style(
  {
    animation: `${cloudDriftSecondary} 32s ${EASE_IN_OUT_SMOOTH} infinite alternate`,
    '@media': { '(prefers-reduced-motion: reduce)': { animation: 'none' } },
  },
  'doc-footer-cloud-right',
);
const lakeReflectionsAnimStyle = style(
  {
    animation: `${waterShimmer} 6s ${EASE_IN_OUT_SMOOTH} infinite alternate`,
    '@media': { '(prefers-reduced-motion: reduce)': { animation: 'none' } },
  },
  'doc-footer-lake-shimmer',
);

/* -------------------------------------------------------------------------- */
/*  Deterministic randomness + geometry helpers                                */
/* -------------------------------------------------------------------------- */

type Pt = [number, number];

const f1 = (v: number): string => v.toFixed(1);
const clampOpacity = (v: number): number => Math.min(Math.max(v, 0.02), 0.98);

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeNoise(seed: number): (x: number) => number {
  const r = mulberry32(seed);
  const lat: number[] = Array.from({ length: 256 }, () => r());
  const at = (i: number): number => lat[((i % 256) + 256) % 256] ?? 0;
  return (x) => {
    const i = Math.floor(x);
    const t = x - i;
    const u = t * t * (3 - 2 * t);
    return at(i) * (1 - u) + at(i + 1) * u;
  };
}

function fbm(n: (x: number) => number, x: number, oct = 4): number {
  let sum = 0;
  let amp = 0.5;
  let fr = 1;
  let norm = 0;
  for (let o = 0; o < oct; o++) {
    sum += amp * n(x * fr + o * 13.7);
    norm += amp;
    amp *= 0.5;
    fr *= 2.1;
  }
  return sum / norm;
}

const poly = (pts: Pt[]): string =>
  `${pts.map(([x, y], i) => `${i ? 'L' : 'M'} ${f1(x)} ${f1(y)}`).join(' ')} Z`;
const polyline = (pts: Pt[]): string =>
  pts.map(([x, y], i) => `${i ? 'L' : 'M'} ${f1(x)} ${f1(y)}`).join(' ');

/** Scalloped, billowing closed outline. `amp` controls how deep the cusps between lobes cut. */
function blobShape(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  k: number,
  phase: number,
  amp: number,
  n = 36,
): Pt[] {
  return Array.from({ length: n }, (_, i): Pt => {
    const th = (i / n) * Math.PI * 2;
    const rr = 1 - amp + amp * Math.abs(Math.sin((k * th) / 2 + phase));
    return [cx + Math.cos(th) * rx * rr, cy + Math.sin(th) * ry * rr];
  });
}

/** Crescent of core shadow on the lower/right side of a blob outline. */
function shadeArc(
  pts: Pt[],
  cx: number,
  cy: number,
  shiftX: number,
  shiftY: number,
  k = 0.62,
): string {
  const n = pts.length;
  const outer = pts.slice(0, Math.floor(n * 0.48));
  const inner = outer
    .map(([x, y]): Pt => [cx + (x - cx) * k + shiftX, cy + (y - cy) * k - shiftY])
    .toReversed();
  return poly([...outer, ...inner]);
}

function cubic(p0: Pt, p1: Pt, p2: Pt, p3: Pt, n: number): Pt[] {
  return Array.from({ length: n + 1 }, (_, i): Pt => {
    const t = i / n;
    const u = 1 - t;
    return [
      u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
      u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
    ];
  });
}

function quad(p0: Pt, p1: Pt, p2: Pt, n: number): Pt[] {
  return Array.from({ length: n + 1 }, (_, i): Pt => {
    const t = i / n;
    const u = 1 - t;
    return [
      u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0],
      u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1],
    ];
  });
}

/** Polygon around a centreline whose width tapers from w0 to w1. */
function taperPoly(pts: Pt[], w0: number, w1: number): string {
  const left: Pt[] = [];
  const right: Pt[] = [];
  pts.forEach((p, i) => {
    const a = pts[i - 1] ?? p;
    const b = pts[i + 1] ?? p;
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const m = Math.hypot(dx, dy) || 1;
    const w = (w0 + ((w1 - w0) * i) / Math.max(1, pts.length - 1)) / 2;
    left.push([p[0] - (dy / m) * w, p[1] + (dx / m) * w]);
    right.push([p[0] + (dy / m) * w, p[1] - (dx / m) * w]);
  });
  return poly([...left, ...right.toReversed()]);
}

/* -------------------------------------------------------------------------- */
/*  Mountains                                                                  */
/* -------------------------------------------------------------------------- */

// [x, height above horizon]
const FAR_ANCHORS: Pt[] = [
  [-20, 34],
  [60, 44],
  [150, 38],
  [230, 18],
  [300, 0],
  [420, 0],
  [500, 30],
  [640, 72],
  [720, 100],
  [786, 124],
  [830, 108],
  [880, 96],
  [950, 104],
  [1040, 110],
  [1120, 96],
  [1190, 100],
  [1250, 108],
  [1320, 132],
  [1390, 148],
  [1460, 156],
];
const MID_ANCHORS: Pt[] = [
  [-20, 0],
  [420, 0],
  [520, 26],
  [620, 50],
  [700, 72],
  [786, 106],
  [840, 84],
  [900, 48],
  [960, 16],
  [1020, 0],
  [1060, 0],
  [1130, 34],
  [1220, 66],
  [1310, 104],
  [1360, 92],
  [1440, 106],
  [1460, 108],
];
const NEAR_ANCHORS: Pt[] = [
  [-20, 0],
  [500, 0],
  [580, 20],
  [680, 40],
  [740, 34],
  [800, 22],
  [860, 38],
  [930, 26],
  [1000, 0],
  [1090, 0],
  [1180, 24],
  [1280, 48],
  [1380, 62],
  [1460, 66],
];

/** Shift the whole range sideways, jitter anchor positions and rescale peak heights. */
function jitterAnchors(anchors: Pt[], r: () => number, shift: number): Pt[] {
  return anchors.map(([x, h], i): Pt => {
    const edge = i === 0 || i === anchors.length - 1;
    return [
      edge ? x : x + shift + (r() - 0.5) * 22,
      h === 0 ? 0 : Math.max(6, h * (0.74 + r() * 0.5)),
    ];
  });
}

function heightAt(anchors: Pt[], x: number): number {
  let out = 0;
  anchors.forEach((a, i) => {
    const b = anchors[i + 1];
    if (b && x >= a[0] && x <= b[0]) {
      const t = (x - a[0]) / (b[0] - a[0] || 1);
      out = a[1] + (b[1] - a[1]) * t;
    }
  });
  return out;
}

function makeRidge(
  anchors: Pt[],
  seed: number,
  horizonY: number,
  scale: number,
  rough: number,
): Pt[] {
  const n = makeNoise(seed);
  const pts: Pt[] = [];
  for (let x = -10; x <= 1450; x += 5) {
    const base = heightAt(anchors, x);
    const d =
      ((fbm(n, x / 60, 3) - 0.5) * 1.2 + (fbm(n, x / 9 + 40, 2) - 0.5) * 0.35) *
      rough *
      Math.min(base, 60) *
      0.35;
    pts.push([x, horizonY - Math.max(0, base + d) * scale]);
  }
  return pts;
}

const ridgeFill = (pts: Pt[], horizonY: number): string => {
  const first = pts[0];
  const last = pts[pts.length - 1];
  if (!first || !last) return '';
  return `M ${f1(first[0])} ${f1(horizonY)} ${pts.map(([x, y]) => `L ${f1(x)} ${f1(y)}`).join(' ')} L ${f1(last[0])} ${f1(horizonY)} Z`;
};

/** Pen hatching on slopes facing away from the light (descending to the right). */
function ridgeHatch(pts: Pt[], horizonY: number, seed: number, density: number): string {
  const r = mulberry32(seed);
  let d = '';
  let prev: Pt | undefined;
  for (const p of pts) {
    if (prev) {
      const s = (p[1] - prev[1]) / (p[0] - prev[0]);
      if (s > 0.18 && r() < density) {
        const len = Math.min(horizonY - p[1], 6 + s * 38 * (0.5 + r()));
        d += `M ${f1(p[0])} ${f1(p[1] + 1)} l ${f1(-len * 0.12)} ${f1(len)} `;
      }
    }
    prev = p;
  }
  return d;
}

/** Jagged ravine lines descending from local summits. */
function ridgeRavines(pts: Pt[], horizonY: number, seed: number): string {
  const r = mulberry32(seed);
  let d = '';
  pts.forEach((p, i) => {
    const a = pts[i - 6];
    const b = pts[i + 6];
    if (!a || !b || p[1] > horizonY - 25) return;
    if (p[1] < a[1] - 3 && p[1] < b[1] - 3 && r() < 0.6) {
      for (let k = 0; k < 3; k++) {
        let x = p[0] + k * 5 - 4;
        let y = p[1] + 4;
        const end = p[1] + (horizonY - p[1]) * (0.45 + r() * 0.4);
        d += `M ${f1(x)} ${f1(y)}`;
        while (y < end) {
          x += (r() - 0.35) * 5;
          y += 5 + r() * 6;
          d += ` L ${f1(x)} ${f1(y)}`;
        }
      }
    }
  });
  return d;
}

/** Scalloped band of forest canopy hugging the lower slopes. */
function scallopBand(
  pts: Pt[],
  horizonY: number,
  frac: number,
  noiseAmp: number,
  seed: number,
): string {
  const n = makeNoise(seed);
  let d = `M -10 ${f1(horizonY)}`;
  let py = horizonY;
  pts.forEach(([x, y], i) => {
    if (i % 2) return;
    const ty =
      y + (horizonY - y) * frac + (n(x / 40) - 0.5) * noiseAmp * (horizonY - y > 6 ? 1 : 0);
    d += ` Q ${f1(x - 5)} ${f1(Math.min(py, ty) - 3.5)} ${f1(x)} ${f1(ty)}`;
    py = ty;
  });
  return `${d} L 1450 ${f1(horizonY)} Z`;
}

/* -------------------------------------------------------------------------- */
/*  Clouds: one billowing silhouette per cloud                                 */
/* -------------------------------------------------------------------------- */

interface CloudLayer {
  outline: string;
  creases: string;
  shade1: string;
  shade2: string;
}

interface CloudGeo {
  layers: CloudLayer[];
  cx: number;
  base: number;
}

/**
 * Builds a cumulus as a single path: a chain of arcs along a swelling envelope
 * (big billows in the middle, small ones on the shoulders) closed by a gently
 * curved flat base. Nothing is clipped, so the bottom is always intact.
 */
function cloudLayer(seed: number, cx: number, w: number, base: number, h: number): CloudLayer {
  const r = mulberry32(seed);
  const x0 = cx - w / 2;
  const x1 = cx + w / 2;
  const env = (x: number): number => Math.pow(Math.max(0, Math.sin((Math.PI * (x - x0)) / w)), 0.7);

  const pts: Pt[] = [[x0, base]];
  let x = x0;
  for (;;) {
    x += h * (0.2 + 0.4 * Math.max(env(x), 0.25)) * (0.75 + 0.5 * r());
    if (x > x1 - h * 0.12) break;
    pts.push([x, base - env(x) * h * (0.42 + 0.58 * r())]);
  }
  pts.push([x1, base]);

  let outline = `M ${f1(x0)} ${f1(base)}`;
  let creases = '';
  let prev: Pt = [x0, base];
  pts.forEach((p, i) => {
    if (i === 0) return;
    const dist = Math.hypot(p[0] - prev[0], p[1] - prev[1]);
    const rad = dist * (0.5 + 0.12 * r());
    outline += ` A ${f1(rad)} ${f1(rad)} 0 0 1 ${f1(p[0])} ${f1(p[1])}`;
    if (i < pts.length - 1 && base - p[1] > h * 0.28) {
      creases += `M ${f1(p[0])} ${f1(p[1])} q ${f1(-dist * 0.08)} ${f1(h * 0.16)} ${f1(dist * 0.16)} ${f1(h * (0.26 + 0.12 * r()))} `;
    }
    prev = p;
  });
  outline += ` Q ${f1(cx)} ${f1(base + h * 0.07)} ${f1(x0)} ${f1(base)} Z`;

  const wave = (f0: number, f1_: number, amp: number): string => {
    const step = Math.max(12, h * 0.2);
    let s = `M ${f1(x0 - 4)} ${f1(base + 6)}`;
    for (let xx = x0 - 4; xx <= x1 + 4; xx += step) {
      const t = Math.min(1, Math.max(0, (xx - x0) / w));
      s += ` L ${f1(xx)} ${f1(base - h * (f0 + (f1_ - f0) * t) - (r() - 0.5) * h * amp)}`;
    }
    return `${s} L ${f1(x1 + 4)} ${f1(base + 6)} Z`;
  };

  return { outline, creases, shade1: wave(0.16, 0.42, 0.1), shade2: wave(0.04, 0.14, 0.05) };
}

/** A tall, narrow back billow behind a wider, lower front bank gives the cloud depth. */
function makeCloud(seed: number, cx: number, w: number, base: number, h: number): CloudGeo {
  const r = mulberry32(seed * 3 + 1);
  return {
    cx,
    base,
    layers: [
      cloudLayer(seed, cx + (r() - 0.5) * w * 0.25, w * (0.5 + 0.15 * r()), base, h),
      cloudLayer(seed + 17, cx, w, base, h * 0.62),
    ],
  };
}

/* -------------------------------------------------------------------------- */
/*  Seeded layout (mountains, clouds, trees)                                   */
/* -------------------------------------------------------------------------- */

interface TreeSpec {
  x: number;
  trunkH: number;
  w: number;
  h: number;
  seed: number;
}

function layoutTrees(seed: number): {
  left: TreeSpec[];
  center: TreeSpec;
  gap: TreeSpec[];
  right: TreeSpec[];
  pineDx: number;
} {
  const r = mulberry32(seed);
  const nl = 5 + Math.floor(r() * 3);
  const left: TreeSpec[] = Array.from({ length: nl }, (_, i): TreeSpec => {
    const t = i / (nl - 1);
    return {
      x: 22 + t * 440 + (r() - 0.5) * 30,
      trunkH: 8 + r() * 12,
      w: 70 + r() * 50,
      h: (62 + r() * 60) * (1.25 - 0.4 * t),
      seed: seed * 31 + i * 7 + 1,
    };
  }).toSorted((a, b) => b.x - a.x);

  const nr = 3 + Math.floor(r() * 3);
  const right: TreeSpec[] = Array.from({ length: nr }, (_, i): TreeSpec => {
    const t = i / (nr - 1);
    return {
      x: 1190 + t * 230 + (r() - 0.5) * 24,
      trunkH: 20 + r() * 6,
      w: 100 + r() * 30,
      h: (78 + r() * 24) * (0.9 + 0.5 * t),
      seed: seed * 37 + i * 11 + 3,
    };
  }).toSorted((a, b) => a.x - b.x);

  return {
    left,
    right,
    center: {
      x: 540 + r() * 130,
      trunkH: 28 + r() * 14,
      w: 130 + r() * 40,
      h: 95 + r() * 25,
      seed: seed * 41 + 5,
    },
    gap: [
      {
        x: 680 + r() * 40,
        trunkH: 14 + r() * 6,
        w: 42 + r() * 14,
        h: 38 + r() * 12,
        seed: seed * 43 + 7,
      },
      {
        x: 760 + r() * 60,
        trunkH: 14 + r() * 6,
        w: 42 + r() * 14,
        h: 36 + r() * 12,
        seed: seed * 47 + 9,
      },
    ],
    pineDx: (r() - 0.5) * 110,
  };
}

interface CloudSpec {
  cx: number;
  w: number;
  h: number;
  base: number;
  anim: 'bank' | 'right';
}

function layoutClouds(seed: number): CloudSpec[] {
  const r = mulberry32(seed);
  const rr = (a: number, b: number): number => a + r() * (b - a);
  const out: CloudSpec[] = [
    { cx: rr(240, 520), w: rr(420, 620), h: rr(84, 112), base: rr(108, 122), anim: 'bank' },
    { cx: rr(780, 980), w: rr(170, 280), h: rr(38, 58), base: rr(60, 90), anim: 'right' },
    { cx: rr(1060, 1300), w: rr(260, 400), h: rr(50, 72), base: rr(80, 98), anim: 'right' },
  ];
  if (r() < 0.6)
    out.push({ cx: rr(640, 900), w: rr(90, 140), h: rr(22, 32), base: rr(40, 58), anim: 'bank' });
  return out;
}

/* -------------------------------------------------------------------------- */
/*  Trees                                                                      */
/* -------------------------------------------------------------------------- */

/** Recursive forking branches; paths are bucketed by depth so each level is one element. */
function branches(
  x: number,
  y: number,
  ang: number,
  len: number,
  depth: number,
  level: number,
  r: () => number,
  out: string[],
): void {
  const x2 = x + Math.sin(ang) * len;
  const y2 = y - Math.cos(ang) * len;
  out[level] =
    (out[level] ?? '') +
    `M ${f1(x)} ${f1(y)} Q ${f1((x + x2) / 2 + (r() - 0.5) * len * 0.25)} ${f1((y + y2) / 2)} ${f1(x2)} ${f1(y2)} `;
  if (depth <= 0) return;
  const kids = depth > 1 && r() < 0.4 ? 3 : 2;
  for (let i = 0; i < kids; i++) {
    branches(
      x2,
      y2,
      ang + (i - (kids - 1) / 2) * (0.5 + r() * 0.4) + (r() - 0.5) * 0.2,
      len * (0.66 + r() * 0.15),
      depth - 1,
      level + 1,
      r,
      out,
    );
  }
}

interface Ctx {
  S: number;
  ts: number;
  amp: number;
  g4: string;
  g5: string;
  op: (v: number) => number;
}

function renderTree(t: TreeSpec, c: Ctx, key: string): React.JSX.Element {
  const r = mulberry32(t.seed);
  const w = t.w * c.ts;
  const h = t.h * c.ts;
  const trunkH = t.trunkH;
  const cy = c.S - trunkH - h * 0.38;
  const rx = w / 2;
  const ry = h / 2;

  const levels: string[] = [];
  const trunkW = Math.max(2.6, w * 0.05);
  branches(t.x, c.S + 2, (r() - 0.5) * 0.18, trunkH * 0.9 + h * 0.07, 2, 0, r, levels);

  const count = Math.round(4 + (w * h) / 2600);
  const blobs: { x: number; y: number; r: number; ph: number; k: number; tone: number }[] = [];
  for (let i = 0; i < count; i++) {
    const th = r() * Math.PI * 2;
    const rad = Math.sqrt(r()) * 0.78;
    const bx = t.x + Math.cos(th) * rad * rx;
    const by = Math.min(cy + Math.sin(th) * rad * ry, cy + ry * 0.62);
    blobs.push({
      x: bx,
      y: by,
      r: Math.min(w, h) * (0.22 + 0.14 * r()),
      ph: r() * 6,
      k: 7 + Math.floor(r() * 4),
      tone: ((bx - t.x) / rx) * 0.5 + ((by - cy) / ry) * 0.9,
    });
  }
  const sortedBlobs = blobs.toSorted((a, b) => a.y - b.y);

  let flicks = '';
  let curls = '';
  const blobEls = sortedBlobs.map((b) => {
    const pts = blobShape(b.x, b.y, b.r, b.r * 0.92, b.k, b.ph, c.amp);
    for (let j = 0; j < 5; j++) {
      const th = Math.PI * (1.05 + r() * 0.7);
      const px = b.x + Math.cos(th) * b.r * 0.96;
      const py = b.y + Math.sin(th) * b.r * 0.88;
      flicks += `M ${f1(px)} ${f1(py)} l ${f1(Math.cos(th) * 3.2)} ${f1(Math.sin(th) * 3.2)} `;
    }
    for (let j = 0; j < 3; j++) {
      const px = b.x + (r() * 0.2 + 0.0) * b.r + (r() - 0.2) * b.r * 0.7;
      const py = b.y + r() * b.r * 0.6;
      curls += `M ${f1(px)} ${f1(py)} q 2 -2.6 4.4 0 `;
    }
    return (
      <g key={`${f1(b.x)}-${f1(b.y)}-${f1(b.r)}`}>
        <path
          d={poly(pts)}
          fill={b.tone > 0.05 ? 'url(#cumulo-ho-foliage-dark)' : 'url(#cumulo-ho-foliage-mid)'}
          stroke={c.g4}
          strokeOpacity={c.op(0.4)}
          strokeWidth="0.6"
        />
        <path
          d={shadeArc(pts, b.x, b.y, b.r * 0.16, b.r * 0.1)}
          fill="url(#cumulo-ho-foliage-deep)"
        />
      </g>
    );
  });

  const levelPaths = levels.map((d, depthIndex) => ({
    d,
    strokeWidth: trunkW * Math.pow(0.62, depthIndex),
  }));

  return (
    <g key={key} className={interactiveTreeGroupStyle.className}>
      <ellipse
        cx={t.x + w * 0.2}
        cy={c.S + 6}
        rx={w * 0.5}
        ry={4.5}
        fill="url(#cumulo-ht-lawn-shade)"
      />
      <g stroke={c.g5} strokeOpacity={c.op(0.75)} strokeLinecap="round" fill="none">
        {levelPaths.map((levelItem) => (
          <path key={levelItem.strokeWidth} d={levelItem.d} strokeWidth={levelItem.strokeWidth} />
        ))}
      </g>
      {blobEls}
      <path
        d={flicks}
        stroke={c.g5}
        strokeOpacity={c.op(0.45)}
        strokeWidth="0.6"
        strokeLinecap="round"
      />
      <path
        d={curls}
        stroke={c.g4}
        strokeOpacity={c.op(0.5)}
        strokeWidth="0.55"
        strokeLinecap="round"
      />
    </g>
  );
}

function renderPine(c: Ctx, dx: number): React.JSX.Element {
  const S = c.S;
  const trunk = cubic([924, S + 3], [926, S - 22], [888, S - 48], [902, S - 92], 24);
  const trunkAt = (t: number): Pt =>
    trunk[Math.min(trunk.length - 1, Math.round(t * (trunk.length - 1)))] ?? [902, S - 92];

  const pads = [
    { cx: 905, cy: S - 96, rx: 50, ry: 15, from: 1, tone: 'dark' },
    { cx: 862, cy: S - 62, rx: 44, ry: 13, from: 0.7, tone: 'dark' },
    { cx: 944, cy: S - 58, rx: 46, ry: 13, from: 0.62, tone: 'mid' },
    { cx: 962, cy: S - 30, rx: 40, ry: 11, from: 0.4, tone: 'dark' },
  ];
  const r = mulberry32(404);

  const branchEls = pads.map((p) => {
    const o = trunkAt(p.from);
    const ctrl: Pt = [(o[0] + p.cx) / 2, Math.min(o[1], p.cy) - 6];
    return (
      <path
        key={`branch-${p.cx}-${p.cy}`}
        d={taperPoly(quad(o, ctrl, [p.cx, p.cy + 2], 10), 3.2, 1)}
        fill="url(#cumulo-ht-trunk)"
        stroke={c.g5}
        strokeOpacity={c.op(0.6)}
        strokeWidth="0.6"
      />
    );
  });

  const padEls = pads.toReversed().map((p, i) => {
    const pts = blobShape(p.cx, p.cy, p.rx, p.ry, 8, i * 1.3, c.amp * 0.9, 48);
    let needles = '';
    for (let j = 0; j < 34; j++) {
      const th = Math.PI * (1.02 + r() * 0.96);
      const px = p.cx + Math.cos(th) * p.rx * 0.97;
      const py = p.cy + Math.sin(th) * p.ry * 0.95;
      const l = 3 + r() * 3;
      needles += `M ${f1(px)} ${f1(py)} l ${f1(Math.cos(th) * l)} ${f1(Math.sin(th) * l - 1)} `;
    }
    return (
      <g key={`pad-${p.cx}-${p.cy}`}>
        <path
          d={poly(pts)}
          fill={p.tone === 'dark' ? 'url(#cumulo-ho-foliage-dark)' : 'url(#cumulo-ho-foliage-mid)'}
          stroke={c.g4}
          strokeOpacity={c.op(0.45)}
          strokeWidth="0.6"
        />
        <path
          d={shadeArc(pts, p.cx, p.cy, p.rx * 0.08, p.ry * 0.1, 0.55)}
          fill="url(#cumulo-ho-foliage-deep)"
        />
        <path
          d={needles}
          stroke={c.g5}
          strokeOpacity={c.op(0.55)}
          strokeWidth="0.55"
          strokeLinecap="round"
        />
      </g>
    );
  });

  return (
    <g transform={`translate(${f1(dx)} 0)`}>
      <g className={interactiveTreeGroupStyle.className}>
        <ellipse cx={950} cy={S + 6} rx={46} ry={4.5} fill="url(#cumulo-ht-lawn-shade)" />
        <path
          d={taperPoly(trunk, 10, 3.4)}
          fill="url(#cumulo-ht-trunk)"
          stroke={c.g5}
          strokeOpacity={c.op(0.65)}
          strokeWidth="0.7"
        />
        {branchEls}
        {padEls}
      </g>
    </g>
  );
}

/* -------------------------------------------------------------------------- */
/*  Easter egg: kick the ball at the birds, jump the divers                    */
/* -------------------------------------------------------------------------- */

const INITIAL_LIVES = 3;
const MAX_BIRDS = 6;
const MAX_BALLS = 6;
const BALLS_PER_MULTIKICK = 3;

const PLAYER_START_X = 520;
const PLAYER_EDGE_PADDING = 20;
/** Vertical offset below the shoreline so the footballer stands comfortably out on the open lawn. */
const PLAYER_GROUND_OFFSET_Y = 42;
const PLAYER_SHADOW_OFFSET_Y = 1.5;
const PLAYER_MOVE_SPEED = 2.8;
const PLAYER_JUMP_VELOCITY = -7.4;
const PLAYER_JUMP_GRAVITY = 0.45;
const PLAYER_KICK_POSE_FRAMES = 10;
const PLAYER_HIT_INVULNERABLE_FRAMES = 90;
const PLAYER_HIT_HALF_WIDTH = 11;
const PLAYER_HEIGHT = 32;
const PLAYER_CHEST_OFFSET_Y = 14;

const BALL_RADIUS = 4.2;
const BALL_REST_OFFSET_X = 16;
const BALL_LAUNCH_OFFSET_X = 8;
const BALL_LAUNCH_OFFSET_Y = 12;
const BALL_GRAVITY = 0.25;
const BALL_APEX_Y = 40;
const BALL_KICK_SPEED_X = 3.4;
const BALL_SPIN_PER_PX = 0.18;
const BALL_TRAIL_COUNT = 5;
const MULTIKICK_COOLDOWN_FRAMES = 18;
const PIERCE_SPEED_MULTIPLIER = 1.2;

const BALL_SLOTS = Array.from({ length: MAX_BALLS }, (_, slot) => slot);
const TRAIL_SLOTS = Array.from({ length: BALL_TRAIL_COUNT }, (_, slot) => slot);
const BIRD_SLOTS = Array.from({ length: MAX_BIRDS }, (_, slot) => slot);

const POWERUP_DURATION_FRAMES = 540;
const PICKUP_COOLDOWN_FRAMES = 300;
const PICKUP_SKY_SPAWN_FRAMES = 420;
const PICKUP_FALL_SPEED_Y = 1.15;
const PICKUP_GROUND_OFFSET_Y = 10;
const PICKUP_LIFETIME_FRAMES = 135;
const PICKUP_BLINK_FRAMES = 55;
const BEST_SCORE_STORAGE_KEY = 'cumulo-fuji-kawaguchiko-best-score';
const PICKUP_COLLECT_HALF_WIDTH = 16;
const PICKUP_BALL_COLLECT_RADIUS = 13;
const PICKUP_SWAY_AMPLITUDE_X = 12;
const PICKUP_EDGE_PADDING = 14;

const BIRD_DIVE_TRIGGER_RANGE_X = 170;
const BIRD_DIVE_SPEED = 3.6;
const BIRD_PULL_UP_CLEARANCE_Y = 6;
const BIRD_HIT_RADIUS = 12;
const BIRD_OFFSCREEN_MARGIN = 40;
const BIRD_SPAWN_OFFSET_X = 20;
const BIRD_POINTS_FLYING = 10;
const BIRD_POINTS_DIVING = 15;
const KNOCKED_OUT_GRAVITY = 0.28;
const KNOCKED_OUT_SPIN_DEG_PER_FRAME = 14;

const SWIPE_JUMP_THRESHOLD_PX = 28;
const MAX_FRAME_DELTA = 3;
const FRAME_MS = 16.667;
const RADIANS_TO_DEGREES = 180 / Math.PI;

// Wing frames in bird space (bird faces +x, shoulder at the origin)
const WING_UP =
  'M 1 -2 C 0 -8 -6 -14 -16 -16 C -13 -11 -12 -8 -10.5 -6 C -8.5 -7 -6.5 -5.5 -5 -4.5 C -3.5 -3.5 -1.5 -3 1 -2 Z';
const WING_MID =
  'M 1 -2 C -4 -5 -11 -6 -19 -5 C -15 -3 -13.5 -1.8 -12 -0.8 C -10 -1.8 -7.5 -1 -5.5 -0.4 C -3.5 0 -1.5 -0.5 1 -1 Z';
const WING_DOWN =
  'M 1 -1 C 0 4 -4 9 -14 10 C -11 6 -10.5 4 -9.5 2.5 C -7.5 3.2 -6 2 -4.5 1 C -3 0 -1.5 -0.3 1 -1 Z';
const WING_TUCK = 'M 1 -2 C -4 -3 -9 -2 -14 0 C -10 0.4 -8 0.8 -5 1.4 C -3 1 -1 0 1 -1 Z';
const WING_CYCLE = [WING_UP, WING_MID, WING_DOWN, WING_MID];

const BIRD_TORSO =
  'M -7 0 L -15 -2.6 L -12.5 0.2 L -15 3 L -7 2 Z M -8 1.2 C -7 -2.8 -1 -3.8 4 -3.3 C 7.5 -3 9 -1.6 9 0.2 C 8.5 2.8 4 4 -1 3.8 C -5 3.6 -7.5 3 -8 1.2 Z M 4.3 -2 a 2.7 2.7 0 1 0 5.4 0 a 2.7 2.7 0 1 0 -5.4 0 Z';
const BIRD_LIGHTS =
  'M -4 2.4 Q 1 4.4 6 2.4 Q 1 3.2 -4 2.4 Z M 7.3 -2.9 a 0.8 0.8 0 1 0 1.6 0 a 0.8 0.8 0 1 0 -1.6 0 Z';
const BIRD_BEAK = 'M 9.4 -2.6 L 13.8 -1.4 L 9.4 -0.5 Z';

const BALL_PENTAGON = poly(
  Array.from({ length: 5 }, (_, i): Pt => {
    const angle = -Math.PI / 2 + i * Math.PI * 0.4;
    return [Math.cos(angle) * 1.7, Math.sin(angle) * 1.7];
  }),
);
const BALL_SEAMS = Array.from({ length: 5 }, (_, i) => {
  const angle = -Math.PI / 2 + i * Math.PI * 0.4;
  return `M ${f1(Math.cos(angle) * 1.7)} ${f1(Math.sin(angle) * 1.7)} L ${f1(Math.cos(angle) * BALL_RADIUS * 0.95)} ${f1(Math.sin(angle) * BALL_RADIUS * 0.95)}`;
}).join(' ');

// Player poses, facing left (-x) with the feet at the origin (0, 0)
type PoseId = 'idle' | 'runStrideA' | 'runStrideB' | 'kick' | 'jump';

interface PlayerPose {
  legs: string;
  shoes: string;
  arms: string;
}

const POSE_IDS: readonly PoseId[] = ['idle', 'runStrideA', 'runStrideB', 'kick', 'jump'];

const PLAYER_POSES: Record<PoseId, PlayerPose> = {
  idle: {
    legs: 'M 1 -6.5 L 1.4 -0.8 M -1 -6.5 L -1.8 -0.8',
    shoes: 'M 2.4 -0.7 L -0.6 -0.7 M -1 -0.7 L -4 -0.7',
    arms: 'M 0 -19 L 2 -14.5 M -1 -19 L -2.5 -14.5',
  },
  runStrideA: {
    legs: 'M 1 -6.5 L -3 -4.5 L -4.5 -0.8 M -1 -6.5 L 3 -4 L 6 -6.5',
    shoes: 'M -3.2 -0.7 L -6.2 -0.7 M 5.2 -6.6 L 7.9 -7.6',
    arms: 'M -1 -19 L -5.5 -16 L -7 -18.5 M 0 -19 L 4.5 -16 L 6 -13.5',
  },
  runStrideB: {
    legs: 'M -1 -6.5 L -4.5 -4.5 L -6 -0.8 M 1 -6.5 L 4.5 -4 L 7 -6.5',
    shoes: 'M -4.7 -0.7 L -7.7 -0.7 M 6.2 -6.6 L 8.9 -7.6',
    arms: 'M 0 -19 L -4.5 -16 L -6 -18.5 M -1 -19 L 3.5 -16 L 5 -13.5',
  },
  // Support leg planted; kicking leg raises knee forward-up and swings lower leg forward to strike
  kick: {
    legs: 'M 1.2 -6.5 L 1.4 -0.8 M -1.4 -8.2 L -5.8 -6.8 L -9.2 -2.4',
    shoes: 'M 2.4 -0.7 L -0.6 -0.7 M -8.4 -2.6 L -11.1 -3',
    arms: 'M 0 -19 L 4.5 -17 L 7 -18.5 M -1 -19 L -4.8 -16 L -7 -17.5',
  },
  jump: {
    legs: 'M 1 -6.5 L -1 -3.5 L 1.2 -1.5 M -1 -6.5 L -4.5 -4 L -2.6 -2',
    shoes: 'M 2.2 -1.3 L -0.8 -1.3 M -1.8 -1.8 L -4.8 -1.8',
    arms: 'M 0 -19 L 3.5 -23 L 4 -26 M -1 -19 L -4.5 -22.5 L -5.5 -25',
  },
};

interface ShotProfile {
  speedScale: number;
  apexY: number;
  launchOffsetY: number;
}

const SINGLE_BALL_SHOT: readonly ShotProfile[] = [
  { speedScale: 1.0, apexY: BALL_APEX_Y, launchOffsetY: 0 },
];

const MULTI_BALL_SHOTS: readonly ShotProfile[] = [
  { speedScale: 0.78, apexY: 16, launchOffsetY: -3 },
  { speedScale: 1.0, apexY: 44, launchOffsetY: 0 },
  { speedScale: 1.28, apexY: 86, launchOffsetY: 2 },
];

type PowerupKind = 'multiball' | 'pierce' | 'shield';

const POWERUP_KINDS: readonly PowerupKind[] = ['multiball', 'pierce', 'shield'];
const POWERUP_DROP_POOL: readonly PowerupKind[] = [
  'multiball',
  'multiball',
  'pierce',
  'pierce',
  'shield',
];

const POWERUP_APPLIERS: Record<PowerupKind, (state: GameState) => void> = {
  multiball: (state) => {
    state.multiBallFrames = POWERUP_DURATION_FRAMES;
  },
  pierce: (state) => {
    state.pierceFrames = POWERUP_DURATION_FRAMES;
  },
  shield: (state) => {
    state.hasShield = true;
  },
};

interface VisibleXBounds {
  minX: number;
  maxX: number;
}

type BirdState = 'inactive' | 'flying' | 'diving' | 'knockedOut';

interface Bird {
  x: number;
  y: number;
  vx: number;
  vy: number;
  state: BirdState;
  isDiver: boolean;
  ageFrames: number;
  spinAngleDeg: number;
  flapPhase: number;
}

interface BallState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  active: boolean;
  piercing: boolean;
  spinRad: number;
  trail: { x: number; y: number }[];
}

type PickupState = 'inactive' | 'falling' | 'resting';

interface PowerupPickup {
  kind: PowerupKind;
  state: PickupState;
  baseX: number;
  x: number;
  y: number;
  ageFrames: number;
  remainingFrames: number;
}

interface GameState {
  playerX: number;
  playerVx: number;
  facing: 1 | -1;
  pointerTargetX: number | null;
  moveLeft: boolean;
  moveRight: boolean;
  kickTimerFrames: number;
  kickCooldownFrames: number;
  invulnerableFrames: number;
  /** Vertical jump offset above ground (negative is up). */
  jumpOffsetY: number;
  jumpVelocityY: number;
  activePoseId: PoseId;
  balls: BallState[];
  birds: Bird[];
  birdSpawnTimerFrames: number;
  pickup: PowerupPickup;
  pickupCooldownFrames: number;
  pickupSkyTimerFrames: number;
  droppedFirstPowerup: boolean;
  multiBallFrames: number;
  pierceFrames: number;
  hasShield: boolean;
  score: number;
  lives: number;
  isGameOver: boolean;
  elapsedFrames: number;
}

interface HudState {
  score: number;
  lives: number;
  isGameOver: boolean;
  bestScore: number;
  multiBallSec: number;
  pierceSec: number;
  hasShield: boolean;
}

const createEmptyBall = (): BallState => ({
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  active: false,
  piercing: false,
  spinRad: 0,
  trail: [],
});

const createEmptyBird = (): Bird => ({
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  state: 'inactive',
  isDiver: false,
  ageFrames: 0,
  spinAngleDeg: 0,
  flapPhase: 0,
});

const createInactivePickup = (): PowerupPickup => ({
  kind: 'multiball',
  state: 'inactive',
  baseX: 0,
  x: 0,
  y: 0,
  ageFrames: 0,
  remainingFrames: 0,
});

const createInitialGameState = (startX = PLAYER_START_X): GameState => ({
  playerX: startX,
  playerVx: 0,
  facing: -1,
  pointerTargetX: null,
  moveLeft: false,
  moveRight: false,
  kickTimerFrames: 0,
  kickCooldownFrames: 0,
  invulnerableFrames: 0,
  jumpOffsetY: 0,
  jumpVelocityY: 0,
  activePoseId: 'kick',
  balls: Array.from({ length: MAX_BALLS }, createEmptyBall),
  birds: Array.from({ length: MAX_BIRDS }, createEmptyBird),
  birdSpawnTimerFrames: 50,
  pickup: createInactivePickup(),
  pickupCooldownFrames: 0,
  pickupSkyTimerFrames: PICKUP_SKY_SPAWN_FRAMES,
  droppedFirstPowerup: false,
  multiBallFrames: 0,
  pierceFrames: 0,
  hasShield: false,
  score: 0,
  lives: INITIAL_LIVES,
  isGameOver: false,
  elapsedFrames: 0,
});

function createHudSnapshot(state: GameState, bestScore: number): HudState {
  return {
    score: state.score,
    lives: state.lives,
    isGameOver: state.isGameOver,
    bestScore,
    multiBallSec: state.multiBallFrames > 0 ? Math.ceil(state.multiBallFrames / 60) : 0,
    pierceSec: state.pierceFrames > 0 ? Math.ceil(state.pierceFrames / 60) : 0,
    hasShield: state.hasShield,
  };
}

function hudSnapshotIsEqual(a: HudState, b: HudState): boolean {
  return (
    a.score === b.score &&
    a.lives === b.lives &&
    a.isGameOver === b.isGameOver &&
    a.bestScore === b.bestScore &&
    a.multiBallSec === b.multiBallSec &&
    a.pierceSec === b.pierceSec &&
    a.hasShield === b.hasShield
  );
}

/**
 * Computes the visible `[minX, maxX]` slice inside the 1440x500 viewBox under
 * `preserveAspectRatio="xMidYMax slice"` so mobile viewports map pointer taps,
 * player boundaries, and spawns accurately to what is actually on screen.
 */
function measureVisibleXBounds(svgElement: SVGSVGElement | null): VisibleXBounds {
  if (!svgElement) return { minX: 0, maxX: SCENE_WIDTH };
  const rect = svgElement.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return { minX: 0, maxX: SCENE_WIDTH };
  const scale = Math.max(rect.width / SCENE_WIDTH, rect.height / SCENE_HEIGHT);
  const visibleWidth = Math.min(SCENE_WIDTH, rect.width / scale);
  const minX = (SCENE_WIDTH - visibleWidth) / 2;
  return { minX, maxX: SCENE_WIDTH - minX };
}

function clientToSvgX(svgElement: SVGSVGElement, clientX: number): number {
  const rect = svgElement.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return SCENE_WIDTH / 2;
  const scale = Math.max(rect.width / SCENE_WIDTH, rect.height / SCENE_HEIGHT);
  const centerOffsetPx = clientX - (rect.left + rect.width / 2);
  return SCENE_WIDTH / 2 + centerOffsetPx / scale;
}

function clampToVisibleX(x: number, bounds: VisibleXBounds, padding: number): number {
  const minAllowed = bounds.minX + padding;
  const maxAllowed = bounds.maxX - padding;
  if (minAllowed >= maxAllowed) return (bounds.minX + bounds.maxX) / 2;
  return Math.min(maxAllowed, Math.max(minAllowed, x));
}

function clampPlayerX(x: number, bounds: VisibleXBounds, extraLeftPadding = 0): number {
  const minAllowed = bounds.minX + PLAYER_EDGE_PADDING + extraLeftPadding;
  const maxAllowed = bounds.maxX - PLAYER_EDGE_PADDING;
  if (minAllowed >= maxAllowed) return (bounds.minX + bounds.maxX) / 2;
  return Math.min(maxAllowed, Math.max(minAllowed, x));
}

function countActiveBalls(balls: readonly BallState[]): number {
  let count = 0;
  for (const ball of balls) {
    if (ball.active) count += 1;
  }
  return count;
}

function canKickBall(state: GameState): boolean {
  if (state.isGameOver) return false;
  const activeCount = countActiveBalls(state.balls);
  if (state.multiBallFrames > 0) {
    return state.kickCooldownFrames <= 0 && activeCount <= MAX_BALLS - BALLS_PER_MULTIKICK;
  }
  return activeCount === 0;
}

function choosePlayerPose(state: GameState): PoseId {
  if (state.jumpOffsetY < 0) return 'jump';
  if (state.kickTimerFrames > 0) return 'kick';
  if (state.playerVx !== 0) {
    const strideFrame = Math.floor(state.elapsedFrames / 5) % 2;
    return strideFrame === 0 ? 'runStrideA' : 'runStrideB';
  }
  return 'idle';
}

function chooseBirdWingPath(bird: Bird): string {
  if (bird.state === 'diving') return WING_TUCK;
  if (bird.state === 'knockedOut') return WING_MID;
  const flapIndex = Math.floor((bird.ageFrames + bird.flapPhase) / 5) % WING_CYCLE.length;
  return WING_CYCLE[flapIndex] ?? WING_MID;
}

function chooseNextPowerupKind(state: GameState): PowerupKind {
  if (!state.droppedFirstPowerup) return 'multiball';
  const eligible = POWERUP_DROP_POOL.filter((kind) => kind !== 'shield' || !state.hasShield);
  return eligible[Math.floor(Math.random() * eligible.length)] ?? 'multiball';
}

function spawnPickup(state: GameState, x: number, y: number, bounds: VisibleXBounds): void {
  const clampedX = clampToVisibleX(x, bounds, PLAYER_EDGE_PADDING + PICKUP_EDGE_PADDING);
  state.pickup = {
    kind: chooseNextPowerupKind(state),
    state: 'falling',
    baseX: clampedX,
    x: clampedX,
    y: Math.max(24, y),
    ageFrames: 0,
    remainingFrames: PICKUP_LIFETIME_FRAMES,
  };
  state.droppedFirstPowerup = true;
}

function maybeDropPickupFromBird(
  state: GameState,
  x: number,
  y: number,
  bounds: VisibleXBounds,
): void {
  if (state.pickup.state !== 'inactive' || state.pickupCooldownFrames > 0) return;
  if (!state.droppedFirstPowerup || Math.random() < 0.28) {
    spawnPickup(state, x, y, bounds);
  }
}

function spawnBird(birds: Bird[], shorelineY: number, score: number, bounds: VisibleXBounds): void {
  const slot = birds.find((bird) => bird.state === 'inactive');
  if (!slot) return;

  const fromLeft = Math.random() < 0.5;
  const speed = Math.min(3.6, 1.2 + score * 0.02 + Math.random() * 1.1);
  const skyHeight = Math.max(40, shorelineY - 90 - 44);

  slot.x = fromLeft ? bounds.minX - BIRD_SPAWN_OFFSET_X : bounds.maxX + BIRD_SPAWN_OFFSET_X;
  slot.y = 44 + Math.random() * skyHeight;
  slot.vx = fromLeft ? speed : -speed;
  slot.vy = 0;
  slot.state = 'flying';
  slot.isDiver = score >= 10 && Math.random() < Math.min(0.5, 0.15 + score * 0.006);
  slot.ageFrames = 0;
  slot.spinAngleDeg = 0;
  slot.flapPhase = Math.random() * 6;
}

function stepPlayer(state: GameState, dt: number, bounds: VisibleXBounds): void {
  let moveDir = (state.moveRight ? 1 : 0) - (state.moveLeft ? 1 : 0);
  if (moveDir === 0 && state.pointerTargetX !== null) {
    const deltaX = state.pointerTargetX - state.playerX;
    if (Math.abs(deltaX) < 3) {
      state.pointerTargetX = null;
    } else {
      moveDir = Math.sign(deltaX);
    }
  }

  state.playerVx = moveDir * PLAYER_MOVE_SPEED;
  state.playerX = clampPlayerX(state.playerX + state.playerVx * dt, bounds);
  if (moveDir !== 0) {
    state.facing = moveDir > 0 ? 1 : -1;
  }

  state.kickTimerFrames = Math.max(0, state.kickTimerFrames - dt);
  state.kickCooldownFrames = Math.max(0, state.kickCooldownFrames - dt);
  state.invulnerableFrames = Math.max(0, state.invulnerableFrames - dt);
  state.multiBallFrames = Math.max(0, state.multiBallFrames - dt);
  state.pierceFrames = Math.max(0, state.pierceFrames - dt);
  state.pickupCooldownFrames = Math.max(0, state.pickupCooldownFrames - dt);

  if (state.jumpOffsetY < 0 || state.jumpVelocityY < 0) {
    state.jumpVelocityY += PLAYER_JUMP_GRAVITY * dt;
    state.jumpOffsetY += state.jumpVelocityY * dt;
    if (state.jumpOffsetY >= 0) {
      state.jumpOffsetY = 0;
      state.jumpVelocityY = 0;
    }
  }
}

function stepBalls(state: GameState, dt: number, groundY: number, bounds: VisibleXBounds): void {
  for (const ball of state.balls) {
    if (!ball.active) {
      ball.trail.length = 0;
      continue;
    }

    ball.vy += BALL_GRAVITY * dt;
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;
    ball.spinRad += ball.vx * BALL_SPIN_PER_PX * dt;

    ball.trail.push({ x: ball.x, y: ball.y });
    if (ball.trail.length > BALL_TRAIL_COUNT + 2) {
      ball.trail.shift();
    }

    const hitGround = ball.y > groundY - BALL_RADIUS && ball.vy > 0;
    const leftScreen = ball.x < bounds.minX - 10 || ball.x > bounds.maxX + 10;
    if (hitGround || leftScreen) {
      ball.active = false;
    }
  }
}

function stepPickup(state: GameState, dt: number, groundY: number, bounds: VisibleXBounds): void {
  const { pickup } = state;
  if (pickup.state === 'inactive') {
    if (state.pickupCooldownFrames <= 0) {
      state.pickupSkyTimerFrames -= dt;
      if (state.pickupSkyTimerFrames <= 0) {
        const span = Math.max(40, bounds.maxX - bounds.minX - 90);
        const dropX = bounds.minX + 45 + Math.random() * span;
        spawnPickup(state, dropX, 32, bounds);
        state.pickupSkyTimerFrames = PICKUP_SKY_SPAWN_FRAMES;
      }
    }
    return;
  }

  pickup.ageFrames += dt;
  const groundRestY = groundY - PICKUP_GROUND_OFFSET_Y;

  if (pickup.state === 'falling') {
    pickup.y += PICKUP_FALL_SPEED_Y * dt;
    const swayedX = pickup.baseX + Math.sin(pickup.ageFrames * 0.08) * PICKUP_SWAY_AMPLITUDE_X;
    pickup.x = clampToVisibleX(swayedX, bounds, PLAYER_EDGE_PADDING + PICKUP_EDGE_PADDING);
    if (pickup.y >= groundRestY) {
      pickup.y = groundRestY;
      pickup.state = 'resting';
      pickup.remainingFrames = PICKUP_LIFETIME_FRAMES;
    }
  } else {
    pickup.y = groundRestY;
    pickup.remainingFrames -= dt;
    if (pickup.remainingFrames <= 0) {
      pickup.state = 'inactive';
      state.pickupCooldownFrames = PICKUP_COOLDOWN_FRAMES;
      state.pickupSkyTimerFrames = PICKUP_SKY_SPAWN_FRAMES;
      return;
    }
  }

  const playerFeetY = groundY + state.jumpOffsetY;
  const caughtByPlayer =
    Math.abs(pickup.x - state.playerX) < PICKUP_COLLECT_HALF_WIDTH &&
    pickup.y >= playerFeetY - PLAYER_HEIGHT - 6 &&
    pickup.y <= playerFeetY + 4;
  const caughtByBall = state.balls.some(
    (ball) =>
      ball.active && Math.hypot(ball.x - pickup.x, ball.y - pickup.y) < PICKUP_BALL_COLLECT_RADIUS,
  );
  if (caughtByPlayer || caughtByBall) {
    POWERUP_APPLIERS[pickup.kind](state);
    pickup.state = 'inactive';
    state.pickupCooldownFrames = PICKUP_COOLDOWN_FRAMES;
    state.pickupSkyTimerFrames = PICKUP_SKY_SPAWN_FRAMES;
  }
}

function stepBirds(state: GameState, dt: number, groundY: number, bounds: VisibleXBounds): void {
  const playerFeetY = groundY + state.jumpOffsetY;

  for (const bird of state.birds) {
    if (bird.state === 'inactive') continue;
    bird.ageFrames += dt;

    if (bird.state === 'knockedOut') {
      bird.vy += KNOCKED_OUT_GRAVITY * dt;
      bird.x += bird.vx * 0.3 * dt;
      bird.y += bird.vy * dt;
      bird.spinAngleDeg += KNOCKED_OUT_SPIN_DEG_PER_FRAME * dt;
      if (bird.y > groundY + 6) {
        bird.state = 'inactive';
      }
      continue;
    }

    if (bird.state === 'flying') {
      bird.x += bird.vx * dt;
      bird.y += Math.sin((bird.ageFrames + bird.flapPhase) * 0.09) * 0.6 * dt;

      if (bird.isDiver && Math.abs(bird.x - state.playerX) < BIRD_DIVE_TRIGGER_RANGE_X) {
        const dx = state.playerX - bird.x;
        const dy = groundY - PLAYER_CHEST_OFFSET_Y - bird.y;
        const distance = Math.hypot(dx, dy) || 1;
        bird.vx = (dx / distance) * BIRD_DIVE_SPEED;
        bird.vy = (dy / distance) * BIRD_DIVE_SPEED;
        bird.state = 'diving';
      }
    } else {
      bird.x += bird.vx * dt;
      bird.y += bird.vy * dt;

      if (bird.y > groundY - BIRD_PULL_UP_CLEARANCE_Y) {
        bird.vy = -2.2;
        bird.vx = (Math.sign(bird.vx) || 1) * 2.4;
        bird.state = 'flying';
        bird.isDiver = false;
      }
    }

    const exitedViewport =
      bird.x < bounds.minX - BIRD_OFFSCREEN_MARGIN ||
      bird.x > bounds.maxX + BIRD_OFFSCREEN_MARGIN ||
      bird.y < -20;
    if (exitedViewport) {
      bird.state = 'inactive';
      continue;
    }

    let hitBall: BallState | undefined;
    for (const ball of state.balls) {
      if (!ball.active) continue;
      const hitRadius = ball.piercing ? BIRD_HIT_RADIUS + 2 : BIRD_HIT_RADIUS;
      if (Math.hypot(bird.x - ball.x, bird.y - ball.y) < hitRadius) {
        hitBall = ball;
        break;
      }
    }
    if (hitBall) {
      state.score += bird.state === 'diving' ? BIRD_POINTS_DIVING : BIRD_POINTS_FLYING;
      bird.state = 'knockedOut';
      bird.vy = -2;
      if (!hitBall.piercing) {
        hitBall.active = false;
      }
      maybeDropPickupFromBird(state, bird.x, bird.y, bounds);
      continue;
    }

    const hitPlayer =
      state.invulnerableFrames <= 0 &&
      Math.abs(bird.x - state.playerX) < PLAYER_HIT_HALF_WIDTH &&
      bird.y > playerFeetY - PLAYER_HEIGHT &&
      bird.y < playerFeetY + 2;
    if (hitPlayer) {
      bird.state = 'knockedOut';
      bird.vy = -3;
      state.invulnerableFrames = PLAYER_HIT_INVULNERABLE_FRAMES;
      if (state.hasShield) {
        state.hasShield = false;
      } else {
        state.lives -= 1;
        if (state.lives <= 0) {
          state.isGameOver = true;
        }
      }
    }
  }
}

interface BirdSlotElements {
  group: SVGGElement;
  wingNear: SVGPathElement | null;
  wingFar: SVGPathElement | null;
}

interface BallSlotElements {
  container: SVGGElement;
  bodyGroup: SVGGElement | null;
  spinGroup: SVGGElement | null;
  pierceRing: SVGCircleElement | null;
  shadow: SVGEllipseElement | null;
  trail: SVGCircleElement[];
}

interface GameSvgElements {
  player: SVGGElement | null;
  playerShadow: SVGEllipseElement | null;
  playerShield: SVGCircleElement | null;
  poses: Partial<Record<PoseId, SVGGElement>>;
  restingBall: SVGGElement | null;
  restingBallPierceRing: SVGCircleElement | null;
  ballSlots: BallSlotElements[];
  pickupGroup: SVGGElement | null;
  pickupShadow: SVGEllipseElement | null;
  pickupChute: SVGGElement | null;
  pickupIcons: Partial<Record<PowerupKind, SVGGElement>>;
  birds: BirdSlotElements[];
}

function querySvgElement<T extends SVGElement>(
  root: ParentNode,
  selector: string,
  ctor: abstract new () => T,
): T | null {
  const el = root.querySelector(selector);
  return el instanceof ctor ? el : null;
}

function collectGameElements(svg: SVGSVGElement | null): GameSvgElements | null {
  if (!svg) return null;

  const poses: Partial<Record<PoseId, SVGGElement>> = {};
  for (const poseId of POSE_IDS) {
    const poseGroup = querySvgElement(svg, `[data-game-pose="${poseId}"]`, SVGGElement);
    if (poseGroup) poses[poseId] = poseGroup;
  }

  const ballSlots: BallSlotElements[] = [];
  for (const slotEl of svg.querySelectorAll('[data-game-ball-slot]')) {
    if (slotEl instanceof SVGGElement) {
      const trail: SVGCircleElement[] = [];
      for (const trailEl of slotEl.querySelectorAll('[data-game-ball-trail]')) {
        if (trailEl instanceof SVGCircleElement) trail.push(trailEl);
      }
      ballSlots.push({
        container: slotEl,
        bodyGroup: querySvgElement(slotEl, '[data-game-ball-part="body"]', SVGGElement),
        spinGroup: querySvgElement(slotEl, '[data-game-ball-part="spin"]', SVGGElement),
        pierceRing: querySvgElement(
          slotEl,
          '[data-game-ball-part="pierce-ring"]',
          SVGCircleElement,
        ),
        shadow: querySvgElement(slotEl, '[data-game-ball-part="shadow"]', SVGEllipseElement),
        trail,
      });
    }
  }

  const pickupIcons: Partial<Record<PowerupKind, SVGGElement>> = {};
  for (const kind of POWERUP_KINDS) {
    const iconGroup = querySvgElement(svg, `[data-game-pickup-icon="${kind}"]`, SVGGElement);
    if (iconGroup) pickupIcons[kind] = iconGroup;
  }

  const birds: BirdSlotElements[] = [];
  for (const el of svg.querySelectorAll('[data-game-bird]')) {
    if (el instanceof SVGGElement) {
      birds.push({
        group: el,
        wingNear: querySvgElement(el, '[data-game-wing="near"]', SVGPathElement),
        wingFar: querySvgElement(el, '[data-game-wing="far"]', SVGPathElement),
      });
    }
  }

  return {
    player: querySvgElement(svg, '[data-game="player"]', SVGGElement),
    playerShadow: querySvgElement(svg, '[data-game="player-shadow"]', SVGEllipseElement),
    playerShield: querySvgElement(svg, '[data-game="player-shield"]', SVGCircleElement),
    poses,
    restingBall: querySvgElement(svg, '[data-game="resting-ball"]', SVGGElement),
    restingBallPierceRing: querySvgElement(
      svg,
      '[data-game="resting-ball-pierce"]',
      SVGCircleElement,
    ),
    ballSlots,
    pickupGroup: querySvgElement(svg, '[data-game="pickup"]', SVGGElement),
    pickupShadow: querySvgElement(svg, '[data-game="pickup-shadow"]', SVGEllipseElement),
    pickupChute: querySvgElement(svg, '[data-game="pickup-chute"]', SVGGElement),
    pickupIcons,
    birds,
  };
}

function renderGameToSvg(state: GameState, groundY: number, elements: GameSvgElements): void {
  const isAirborne = state.jumpOffsetY < 0;
  const playerScaleX = state.facing < 0 ? 1 : -1;

  if (elements.player) {
    const runBobY =
      state.playerVx !== 0 && !isAirborne
        ? -Math.abs(Math.sin(state.elapsedFrames * 0.4)) * 1.2
        : 0;
    elements.player.setAttribute(
      'transform',
      `translate(${f1(state.playerX)} ${f1(groundY + runBobY + state.jumpOffsetY)}) scale(${playerScaleX} 1)`,
    );
    const isBlinking =
      state.invulnerableFrames > 0 && Math.floor(state.elapsedFrames / 4) % 2 === 1;
    elements.player.setAttribute('opacity', isBlinking ? '0.35' : '1');
  }

  elements.playerShield?.setAttribute('display', state.hasShield ? 'inline' : 'none');

  const nextPose = choosePlayerPose(state);
  if (nextPose !== state.activePoseId) {
    state.activePoseId = nextPose;
    for (const poseId of POSE_IDS) {
      elements.poses[poseId]?.setAttribute('display', poseId === nextPose ? 'inline' : 'none');
    }
  }

  if (elements.playerShadow) {
    const shadowScale = 1 + state.jumpOffsetY / 120;
    elements.playerShadow.setAttribute(
      'transform',
      `translate(${f1(state.playerX)} ${f1(groundY + PLAYER_SHADOW_OFFSET_Y)}) scale(${f1(shadowScale)} 1)`,
    );
  }

  if (elements.restingBall) {
    if (canKickBall(state)) {
      const restingBallX = state.playerX + state.facing * BALL_REST_OFFSET_X;
      elements.restingBall.setAttribute('display', 'inline');
      elements.restingBall.setAttribute(
        'transform',
        `translate(${f1(restingBallX)} ${f1(groundY - BALL_RADIUS)})`,
      );
      elements.restingBallPierceRing?.setAttribute(
        'display',
        state.pierceFrames > 0 ? 'inline' : 'none',
      );
    } else {
      elements.restingBall.setAttribute('display', 'none');
    }
  }

  state.balls.forEach((ball, index) => {
    const slot = elements.ballSlots[index];
    if (!slot) return;

    if (!ball.active) {
      slot.container.setAttribute('display', 'none');
      return;
    }
    slot.container.setAttribute('display', 'inline');

    slot.bodyGroup?.setAttribute('transform', `translate(${f1(ball.x)} ${f1(ball.y)})`);
    slot.spinGroup?.setAttribute('transform', `rotate(${f1(ball.spinRad * RADIANS_TO_DEGREES)})`);
    slot.pierceRing?.setAttribute('display', ball.piercing ? 'inline' : 'none');

    if (slot.shadow) {
      const ballHeight = Math.max(0, groundY - ball.y);
      slot.shadow.setAttribute('cx', f1(ball.x));
      slot.shadow.setAttribute('cy', f1(groundY + PLAYER_SHADOW_OFFSET_Y));
      slot.shadow.setAttribute('rx', f1(Math.max(1.5, 5 - ballHeight / 50)));
    }

    slot.trail.forEach((trailDot, trailIdx) => {
      const point = ball.trail[ball.trail.length - 2 - trailIdx];
      if (!point) {
        trailDot.setAttribute('display', 'none');
        return;
      }
      trailDot.setAttribute('display', 'inline');
      trailDot.setAttribute('cx', f1(point.x));
      trailDot.setAttribute('cy', f1(point.y));
      trailDot.setAttribute('r', f1(BALL_RADIUS * (1 - trailIdx / (BALL_TRAIL_COUNT + 1))));
      trailDot.setAttribute(
        'fill-opacity',
        f1((ball.piercing ? 0.72 : 0.5) * (1 - trailIdx / BALL_TRAIL_COUNT)),
      );
    });
  });

  const { pickup } = state;
  if (elements.pickupGroup && elements.pickupShadow) {
    if (pickup.state === 'inactive') {
      elements.pickupGroup.setAttribute('display', 'none');
      elements.pickupShadow.setAttribute('display', 'none');
    } else {
      const isExpiring =
        pickup.state === 'resting' &&
        pickup.remainingFrames <= PICKUP_BLINK_FRAMES &&
        Math.floor(pickup.remainingFrames / 6) % 2 === 1;
      const bobY = pickup.state === 'resting' ? Math.sin(pickup.ageFrames * 0.14) * 1.5 : 0;
      const swayDeg = pickup.state === 'falling' ? Math.sin(pickup.ageFrames * 0.08) * 10 : 0;

      elements.pickupGroup.setAttribute('display', 'inline');
      elements.pickupGroup.setAttribute('opacity', isExpiring ? '0.3' : '1');
      elements.pickupGroup.setAttribute(
        'transform',
        `translate(${f1(pickup.x)} ${f1(pickup.y + bobY)}) rotate(${f1(swayDeg)})`,
      );
      elements.pickupChute?.setAttribute('display', pickup.state === 'falling' ? 'inline' : 'none');
      for (const kind of POWERUP_KINDS) {
        elements.pickupIcons[kind]?.setAttribute(
          'display',
          pickup.kind === kind ? 'inline' : 'none',
        );
      }

      const pickupHeight = Math.max(0, groundY - pickup.y);
      elements.pickupShadow.setAttribute('display', 'inline');
      elements.pickupShadow.setAttribute('cx', f1(pickup.x));
      elements.pickupShadow.setAttribute('cy', f1(groundY + PLAYER_SHADOW_OFFSET_Y));
      elements.pickupShadow.setAttribute('rx', f1(Math.max(2, 6.5 - pickupHeight / 45)));
    }
  }

  state.birds.forEach((bird, index) => {
    const slot = elements.birds[index];
    if (!slot) return;

    if (bird.state === 'inactive') {
      slot.group.setAttribute('display', 'none');
      return;
    }
    slot.group.setAttribute('display', 'inline');

    const scaleX = bird.vx < 0 ? -1 : 1;
    const tiltDeg =
      bird.state === 'diving'
        ? scaleX * (Math.atan2(bird.vy, Math.abs(bird.vx)) * RADIANS_TO_DEGREES)
        : bird.spinAngleDeg;

    slot.group.setAttribute(
      'transform',
      `translate(${f1(bird.x)} ${f1(bird.y)}) rotate(${f1(tiltDeg)}) scale(${scaleX} 1)`,
    );

    const wingPath = chooseBirdWingPath(bird);
    slot.wingNear?.setAttribute('d', wingPath);
    slot.wingFar?.setAttribute('d', wingPath);
  });
}

function resetSvgToIdlePose(groundY: number, elements: GameSvgElements | null): void {
  if (!elements) return;
  elements.player?.setAttribute(
    'transform',
    `translate(${PLAYER_START_X} ${f1(groundY)}) scale(1 1)`,
  );
  elements.player?.setAttribute('opacity', '1');
  elements.playerShield?.setAttribute('display', 'none');
  for (const poseId of POSE_IDS) {
    elements.poses[poseId]?.setAttribute('display', poseId === 'kick' ? 'inline' : 'none');
  }
  elements.playerShadow?.setAttribute(
    'transform',
    `translate(${PLAYER_START_X} ${f1(groundY + PLAYER_SHADOW_OFFSET_Y)}) scale(1 1)`,
  );
  elements.restingBall?.setAttribute('display', 'inline');
  elements.restingBall?.setAttribute(
    'transform',
    `translate(${PLAYER_START_X - BALL_REST_OFFSET_X} ${f1(groundY - BALL_RADIUS)})`,
  );
  elements.restingBallPierceRing?.setAttribute('display', 'none');
  elements.ballSlots.forEach((slot) => slot.container.setAttribute('display', 'none'));
  elements.pickupGroup?.setAttribute('display', 'none');
  elements.pickupShadow?.setAttribute('display', 'none');
  elements.birds.forEach((slot) => slot.group.setAttribute('display', 'none'));
}

function readSavedBestScore(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = window.localStorage.getItem(BEST_SCORE_STORAGE_KEY);
    if (!raw) return 0;
    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

function writeSavedBestScore(score: number): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(BEST_SCORE_STORAGE_KEY, String(Math.max(0, Math.floor(score))));
  } catch {
    // Ignore storage quota or privacy mode errors.
  }
}

function useParkGame(shorelineY: number) {
  const [playing, setPlaying] = useState(false);
  const [hud, setHud] = useState<HudState>({
    score: 0,
    lives: INITIAL_LIVES,
    isGameOver: false,
    bestScore: 0,
    multiBallSec: 0,
    pierceSec: 0,
    hasShield: false,
  });

  const shorelineYRef = useRef(shorelineY);
  useEffect(() => {
    shorelineYRef.current = shorelineY;
  }, [shorelineY]);

  const getGroundY = useCallback((): number => shorelineYRef.current + PLAYER_GROUND_OFFSET_Y, []);

  const gameStateRef = useRef<GameState>(createInitialGameState());
  const bestScoreRef = useRef(0);
  const hudSnapshotRef = useRef<HudState>(hud);
  const visibleBoundsRef = useRef<VisibleXBounds>({ minX: 0, maxX: SCENE_WIDTH });
  const touchGestureRef = useRef({ startClientY: 0, triggeredJump: false });
  const svgRef = useRef<SVGSVGElement | null>(null);

  const syncHud = useCallback((force = false): void => {
    const nextSnapshot = createHudSnapshot(gameStateRef.current, bestScoreRef.current);
    if (!force && hudSnapshotIsEqual(hudSnapshotRef.current, nextSnapshot)) return;
    hudSnapshotRef.current = nextSnapshot;
    setHud(nextSnapshot);
  }, []);

  useEffect(() => {
    const savedBest = readSavedBestScore();
    if (savedBest > bestScoreRef.current) {
      bestScoreRef.current = savedBest;
      syncHud(true);
    }
  }, [syncHud]);

  const restart = useCallback((): void => {
    const bounds = measureVisibleXBounds(svgRef.current);
    visibleBoundsRef.current = bounds;
    const keptPlayerX = clampPlayerX(gameStateRef.current.playerX, bounds);
    gameStateRef.current = createInitialGameState(keptPlayerX);
    syncHud(true);
  }, [syncHud]);

  const jump = useCallback((): void => {
    const state = gameStateRef.current;
    if (state.isGameOver || state.jumpOffsetY < 0 || state.jumpVelocityY < 0) return;
    state.jumpVelocityY = PLAYER_JUMP_VELOCITY;
  }, []);

  /** Kicks one ball (or a 3-ball spread fan while multiball is active) in the player's facing direction. */
  const kickBall = useCallback((): void => {
    const state = gameStateRef.current;
    if (!canKickBall(state)) return;

    const shots = state.multiBallFrames > 0 ? MULTI_BALL_SHOTS : SINGLE_BALL_SHOT;
    const speedMultiplier = state.pierceFrames > 0 ? PIERCE_SPEED_MULTIPLIER : 1;
    const groundY = getGroundY();

    for (const shot of shots) {
      const slot = state.balls.find((ball) => !ball.active);
      if (!slot) break;
      const launchY = groundY - BALL_LAUNCH_OFFSET_Y + shot.launchOffsetY + state.jumpOffsetY;
      const verticalDistanceToApex = Math.max(20, launchY - shot.apexY);
      const initialVy = -Math.sqrt(2 * BALL_GRAVITY * verticalDistanceToApex);

      slot.x = state.playerX + state.facing * BALL_LAUNCH_OFFSET_X;
      slot.y = launchY;
      slot.vx =
        (state.facing * BALL_KICK_SPEED_X * shot.speedScale + state.playerVx * 0.35) *
        speedMultiplier;
      slot.vy = initialVy;
      slot.active = true;
      slot.piercing = state.pierceFrames > 0;
      slot.spinRad = 0;
      slot.trail.length = 0;
    }

    if (state.multiBallFrames > 0) {
      state.kickCooldownFrames = MULTIKICK_COOLDOWN_FRAMES;
    }
    state.kickTimerFrames = PLAYER_KICK_POSE_FRAMES;
  }, [getGroundY]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<SVGSVGElement>): void => {
      if (!playing || !svgRef.current) return;
      const state = gameStateRef.current;
      if (state.isGameOver) {
        restart();
        return;
      }
      const targetX = clientToSvgX(svgRef.current, e.clientX);
      touchGestureRef.current = { startClientY: e.clientY, triggeredJump: false };
      state.pointerTargetX = targetX;
      state.facing = targetX < state.playerX ? -1 : 1;
      kickBall();
    },
    [playing, kickBall, restart],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>): void => {
      if (!playing || !svgRef.current || e.buttons === 0 || gameStateRef.current.isGameOver) return;
      const gesture = touchGestureRef.current;
      if (!gesture.triggeredJump && gesture.startClientY - e.clientY > SWIPE_JUMP_THRESHOLD_PX) {
        gesture.triggeredJump = true;
        jump();
      } else if (!gesture.triggeredJump) {
        gameStateRef.current.pointerTargetX = clientToSvgX(svgRef.current, e.clientX);
      }
    },
    [playing, jump],
  );

  useEffect(() => {
    if (!playing) return undefined;

    const svgElement = svgRef.current;
    const elements = collectGameElements(svgElement);
    const initialBounds = measureVisibleXBounds(svgElement);
    visibleBoundsRef.current = initialBounds;

    const initialPlayerX = clampPlayerX(PLAYER_START_X, initialBounds, BALL_REST_OFFSET_X);
    gameStateRef.current = createInitialGameState(initialPlayerX);
    syncHud(true);

    let resizeObserver: ResizeObserver | undefined;
    if (svgElement && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        visibleBoundsRef.current = measureVisibleXBounds(svgElement);
      });
      resizeObserver.observe(svgElement);
    }

    let rafId = 0;
    let lastTimestamp = performance.now();

    const tickFrame = (now: number): void => {
      const dt = Math.min(MAX_FRAME_DELTA, (now - lastTimestamp) / FRAME_MS);
      lastTimestamp = now;

      const state = gameStateRef.current;
      const groundY = getGroundY();
      const currentShorelineY = groundY - PLAYER_GROUND_OFFSET_Y;
      const bounds = visibleBoundsRef.current;

      if (!state.isGameOver) {
        state.elapsedFrames += dt;
        stepPlayer(state, dt, bounds);
        stepBalls(state, dt, groundY, bounds);
        stepPickup(state, dt, groundY, bounds);

        state.birdSpawnTimerFrames -= dt;
        if (state.birdSpawnTimerFrames <= 0) {
          spawnBird(state.birds, currentShorelineY, state.score, bounds);
          state.birdSpawnTimerFrames =
            Math.max(28, 95 - state.score * 0.8) * (0.7 + Math.random() * 0.7);
        }

        stepBirds(state, dt, groundY, bounds);
        if (state.score > bestScoreRef.current) {
          bestScoreRef.current = state.score;
          writeSavedBestScore(state.score);
        }
        syncHud();
      }

      if (elements) {
        renderGameToSvg(state, groundY, elements);
      }
      rafId = requestAnimationFrame(tickFrame);
    };

    rafId = requestAnimationFrame(tickFrame);

    const handleKey = (e: KeyboardEvent, isKeyDown: boolean): void => {
      if (
        e.target instanceof Element &&
        e.target.closest('input, textarea, select, [role="slider"]')
      ) {
        return;
      }

      const state = gameStateRef.current;
      const key = e.key;
      if (key === 'ArrowLeft' || key === 'a' || key === 'A') {
        state.moveLeft = isKeyDown;
        e.preventDefault();
      } else if (key === 'ArrowRight' || key === 'd' || key === 'D') {
        state.moveRight = isKeyDown;
        e.preventDefault();
      } else if (isKeyDown && (key === 'ArrowUp' || key === 'w' || key === 'W')) {
        e.preventDefault();
        if (state.isGameOver) restart();
        else jump();
      } else if (isKeyDown && key === ' ') {
        e.preventDefault();
        if (!e.repeat) {
          if (state.isGameOver) restart();
          else kickBall();
        }
      } else if (isKeyDown && key === 'Enter' && state.isGameOver) {
        restart();
      } else if (isKeyDown && key === 'Escape') {
        setPlaying(false);
      }
    };

    const onKeyDown = (e: KeyboardEvent): void => handleKey(e, true);
    const onKeyUp = (e: KeyboardEvent): void => handleKey(e, false);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver?.disconnect();
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      resetSvgToIdlePose(getGroundY(), elements);
    };
  }, [playing, getGroundY, kickBall, jump, restart, syncHud]);

  return useMemo(
    () => ({
      playing,
      setPlaying,
      restart,
      hud,
      svgRef,
      onPointerDown,
      onPointerMove,
    }),
    [playing, hud, restart, onPointerDown, onPointerMove],
  );
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

interface LakesideParkIllustrationProps {
  config: LandscapeConfig;
  /** Click the footballer to play. Set to false to disable the easter egg. */
  enableGame?: boolean;
}

export function LakesideParkIllustration({
  config,
  enableGame = true,
}: LakesideParkIllustrationProps): React.JSX.Element {
  const {
    bounciness,
    dotPitch,
    dotScale,
    inkOpacity,
    mountainScale,
    treeScale,
    cloudScale,
    lawnRatio,
    seed,
  } = config;

  const bg = vars.surface.bg.DEFAULT;
  const g3 = vars.grey['300'];
  const g4 = vars.grey['400'];
  const g5 = vars.grey['500'];
  const op = (v: number): number => clampOpacity(v * inkOpacity);

  const lakeTopY = 216 - (lawnRatio - 1) * 36;
  const S = lakeTopY + 20;
  const amp = Math.min(0.4, Math.max(0.03, 0.06 + Math.abs(bounciness) * 0.09));
  const rough = 0.6 + Math.abs(bounciness) * 0.3;
  const ts = treeScale / 1.2;
  const ctx: Ctx = { S, ts, amp, g4, g5, op };

  const { playing, setPlaying, restart, hud, svgRef, onPointerDown, onPointerMove } =
    useParkGame(S);
  const groundY = S + PLAYER_GROUND_OFFSET_Y;

  // Halftone geometry
  const pStd = dotPitch;
  const pDense = Math.max(2.5, dotPitch * 1.22);
  const pTrunk = Math.max(2.2, dotPitch * 1.02);
  const lawnH = Math.max(2.5, dotPitch * 0.72);
  const c1s = pStd * 0.65;
  const c2s = pStd * 0.95;
  const c1d = pDense * 0.25;
  const c2d = pDense * 0.75;
  const c1t = pTrunk * 0.25;
  const c2t = pTrunk * 0.75;

  type Dot = [number, number, number, string, number];
  const pat = (
    id: string,
    w: number,
    h: number,
    dots: Dot[],
    opaque = false,
  ): React.JSX.Element => (
    <pattern key={id} id={id} width={w} height={h} patternUnits="userSpaceOnUse">
      {opaque ? <rect width={w} height={h} fill={bg} /> : null}
      {dots.map(([dotX, dotY, rad, fill, opacity]) => (
        <circle
          key={`${dotX}-${dotY}-${rad}-${fill}-${opacity}`}
          cx={dotX}
          cy={dotY}
          r={rad * dotScale}
          fill={fill}
          fillOpacity={op(opacity)}
        />
      ))}
    </pattern>
  );

  // Seeded layout
  const rm = mulberry32(seed * 101 + 1);
  const shift = (rm() - 0.5) * 110;
  const farPts = makeRidge(
    jitterAnchors(FAR_ANCHORS, rm, shift),
    seed * 7 + 3,
    lakeTopY,
    mountainScale,
    rough,
  );
  const midPts = makeRidge(
    jitterAnchors(MID_ANCHORS, rm, shift),
    seed * 7 + 8,
    lakeTopY,
    mountainScale,
    rough,
  );
  const nearPts = makeRidge(
    jitterAnchors(NEAR_ANCHORS, rm, shift),
    seed * 7 + 15,
    lakeTopY,
    mountainScale,
    rough,
  );
  const farFill = ridgeFill(farPts, lakeTopY);
  const midFill = ridgeFill(midPts, lakeTopY);
  const nearFill = ridgeFill(nearPts, lakeTopY);

  const clouds = layoutClouds(seed * 101 + 2).map((spec, cloudIdx) => {
    const geo = makeCloud(seed * 13 + cloudIdx * 5 + 1, spec.cx, spec.w, spec.base, spec.h);
    const id = `cloud-${f1(spec.cx)}-${f1(spec.base)}-${spec.anim}`;
    return {
      id,
      cx: spec.cx,
      base: spec.base,
      anim: spec.anim,
      layers: geo.layers.map((ly, layerIdx) => ({
        clipId: `cumulo-cloud-clip-${id}-${layerIdx === 0 ? 'back' : 'front'}`,
        outline: ly.outline,
        creases: ly.creases,
        shade1: ly.shade1,
        shade2: ly.shade2,
      })),
    };
  });
  const renderCloud = (cl: (typeof clouds)[number]): React.JSX.Element => (
    <g
      key={cl.id}
      transform={`translate(${f1(cl.cx)} ${f1(cl.base)}) scale(${cloudScale}) translate(${f1(-cl.cx)} ${f1(-cl.base)})`}
    >
      {cl.layers.map((ly) => (
        <g key={ly.clipId}>
          <path d={ly.outline} fill="url(#cumulo-ho-cloud)" />
          <g clipPath={`url(#${ly.clipId})`}>
            <path d={ly.shade1} fill="url(#cumulo-ht-cloud-top)" />
            <path d={ly.shade2} fill="url(#cumulo-ht-mtn-near)" fillOpacity="0.7" />
          </g>
          <path
            d={ly.outline}
            stroke={g4}
            strokeOpacity={op(0.45)}
            strokeWidth="0.7"
            strokeLinejoin="round"
          />
          <path
            d={ly.creases}
            stroke={g4}
            strokeOpacity={op(0.5)}
            strokeWidth="0.6"
            strokeLinecap="round"
          />
        </g>
      ))}
    </g>
  );

  const trees = layoutTrees(seed * 101 + 3);

  // Lake ripples + glints
  const rr = mulberry32(61);
  const rippleRows: { y: number; strokeWidth: number; d: string }[] = [];
  for (let k = 0; k < 10; k++) {
    let d = '';
    const y = lakeTopY + 2 + k * 2.1;
    let x = rr() * 30;
    while (x < 1440) {
      const len = 5 + rr() * (14 + k * 4);
      d += `M ${f1(x)} ${f1(y)} h ${f1(len)} `;
      x += len + 6 + rr() * (22 - k);
    }
    rippleRows.push({ y, strokeWidth: 0.5 + k * 0.06, d });
  }
  let glints = '';
  for (let i = 0; i < 70; i++) {
    const x = rr() * 1440;
    const y = lakeTopY + 3 + rr() * 17;
    glints += `M ${f1(x)} ${f1(y)} h ${f1(6 + rr() * 26)} `;
  }

  // Far-shore town, one path
  const rt = mulberry32(seed * 101 + 4);
  let townD = '';
  const townStart = 900 + rt() * 230;
  for (let x = townStart; x < townStart + 140;) {
    const bw = 3 + rt() * 4;
    const bh = 3 + rt() * 5;
    townD += `M ${f1(x)} ${f1(lakeTopY)} v ${f1(-bh)} l ${f1(bw / 2)} -2.2 l ${f1(bw / 2)} 2.2 v ${f1(bh)} Z `;
    x += bw + 0.8 + rt() * 2.2;
  }
  const shoreTreeline = scallopBand(
    Array.from({ length: 293 }, (_, i): Pt => [-10 + i * 5, lakeTopY - 7]),
    lakeTopY,
    0,
    6,
    33,
  );

  // Lawn
  const nc = makeNoise(5);
  const contourPts: Pt[] = [];
  for (let x = 0; x <= 1440; x += 12) contourPts.push([x, S - 1.5 - fbm(nc, x / 90, 3) * 3.5]);
  const contour = polyline(contourPts);
  const lawnFill = `${contour} L ${SCENE_WIDTH} ${PARALLAX_BOTTOM_Y} L 0 ${PARALLAX_BOTTOM_Y} Z`;
  const bankShade = `${contour} L 1440 ${f1(S + 13)} C 1320 ${f1(S + 10)}, 1180 ${f1(S + 15)}, 1040 ${f1(S + 11)} C 880 ${f1(S + 8)}, 740 ${f1(S + 14)}, 580 ${f1(S + 10)} C 420 ${f1(S + 7)}, 220 ${f1(S + 14)}, 0 ${f1(S + 12)} Z`;

  const stripeTopY = S + 3;
  const stripeBottomY = PARALLAX_BOTTOM_Y;
  const stripeBottomWidth = 30 + ((stripeBottomY - stripeTopY) * (260 - 30)) / 161;
  const stripes = [0, 2, 4, 6, 8]
    .map((i) => {
      const t0 = 720 + (i - 5) * 30;
      const t1 = 720 + (i - 4) * 30;
      const b0 = 720 + (i - 5) * stripeBottomWidth;
      const b1 = 720 + (i - 4) * stripeBottomWidth;
      return `M ${f1(t0)} ${f1(stripeTopY)} L ${f1(t1)} ${f1(stripeTopY)} L ${f1(b1)} ${stripeBottomY} L ${f1(b0)} ${stripeBottomY} Z`;
    })
    .join(' ');

  const rg = mulberry32(77);
  let tufts = '';
  for (let i = 0; i < 420; i++) {
    const y = S + 8 + Math.pow(rg(), 1.35) * (535 - S - 8);
    const x = rg() * SCENE_WIDTH;
    const s = 0.7 + (y - S) / 85;
    for (let j = 0; j < 3; j++) {
      const h = (3 + rg() * 4) * s;
      const lean = (rg() - 0.5) * 3 * s;
      tufts += `M ${f1(x + (j - 1) * 1.6 * s)} ${f1(y)} q ${f1(lean / 2)} ${f1(-h * 0.6)} ${f1(lean)} ${f1(-h)} `;
    }
  }
  let reeds = '';
  for (let i = 0; i < 70; i++) {
    const x = rg() * SCENE_WIDTH;
    for (let j = 0; j < 4; j++) {
      const h = 4 + rg() * 8;
      reeds += `M ${f1(x + j * 1.3)} ${f1(S + 1.5)} q ${f1((rg() - 0.5) * 3)} ${f1(-h / 2)} ${f1((rg() - 0.5) * 4)} ${f1(-h)} `;
    }
  }

  const bench = (x: number): string =>
    `M ${x} ${f1(S - 3)} h 12 M ${x + 0.5} ${f1(S - 6)} h 11 M ${x + 1.5} ${f1(S - 3)} v 3.2 M ${x + 10.5} ${f1(S - 3)} v 3.2`;
  const swing = (x: number): string =>
    `M ${x} ${f1(S + 1)} L ${x + 5} ${f1(S - 14)} L ${x + 10} ${f1(S + 1)} M ${x + 5} ${f1(S - 14)} L ${x + 5} ${f1(S - 6)} M ${x + 1.8} ${f1(S - 5)} h 6.4`;

  const rw = mulberry32(seed * 101 + 5);
  let walkerBodies = '';
  let walkerHeads = '';
  const walkerCount = 6 + Math.floor(rw() * 5);
  const walkerStart = 960 + rw() * 160;
  for (let i = 0; i < walkerCount; i++) {
    const x = walkerStart + i * (10 + rw() * 14);
    const y = S + 7 + (i % 3) * 2.5;
    const h = 7 + (i % 2) * 1.5;
    walkerHeads += `M ${f1(x)} ${f1(y - h)} h 0.01 `;
    walkerBodies += `M ${f1(x)} ${f1(y - h + 1.3)} v ${f1(h * 0.45)} M ${f1(x - 0.6)} ${f1(y - h * 0.5)} l -0.6 ${f1(h * 0.5)} M ${f1(x + 0.6)} ${f1(y - h * 0.5)} l 0.6 ${f1(h * 0.5)} `;
  }

  // Front grass blades anchored along the bottom foreground with parallax bleed
  const rb = mulberry32(12);
  const frontTop = Math.max(S + 72, PARALLAX_BOTTOM_Y - 98);
  let blades = `M -10 ${PARALLAX_BOTTOM_Y} L -10 ${f1(frontTop)}`;
  for (let x = -10; x < 1450; x += 6) {
    const h = 5 + rb() * 16 * (rb() < 0.15 ? 1.8 : 1);
    const lean = (rb() - 0.4) * 6;
    blades += ` Q ${f1(x + 2)} ${f1(frontTop - h * 0.5)} ${f1(x + 3 + lean)} ${f1(frontTop - h)} Q ${f1(x + 4)} ${f1(frontTop - h * 0.4)} ${f1(x + 6)} ${f1(frontTop)}`;
  }
  blades += ` L 1450 ${PARALLAX_BOTTOM_Y} Z`;

  const crestStroke: React.SVGProps<SVGPathElement> = {
    stroke: g4,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    fill: 'none',
  };
  const startGame = enableGame && !playing ? () => setPlaying(true) : undefined;
  const footballCore = (
    <>
      <circle r={BALL_RADIUS} fill={bg} stroke={g5} strokeOpacity={op(1)} strokeWidth="1.1" />
      <path d={BALL_PENTAGON} fill={g5} />
      <path d={BALL_SEAMS} stroke={g5} strokeWidth="0.7" strokeLinecap="round" />
    </>
  );

  return (
    <Stack className={wrapStyle.className}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SCENE_WIDTH} ${SCENE_HEIGHT}`}
        fill="none"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
        className={mergeClasses(landscapeSvgStyle, playing && landscapeSvgPlayingStyle)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
      >
        <defs>
          {pat('cumulo-ht-cloud-top', pStd, pStd, [
            [c1s, c1s, 1.5, g3, 0.23],
            [c2s, c2s, 2, g3, 0.33],
          ])}
          {pat('cumulo-ht-cloud-base', pStd, pStd, [
            [c1s, c1s, 0.9, g3, 0.22],
            [c2s, c2s, 0.9, g3, 0.22],
          ])}
          {pat('cumulo-ht-mtn-far', pStd, pStd, [
            [c1s, c1s, 0.95, g4, 0.26],
            [c2s, c2s, 0.95, g4, 0.26],
          ])}
          {pat('cumulo-ht-mtn-mid', pStd, pStd, [
            [c1s, c1s, 1.15, g4, 0.36],
            [c2s, c2s, 1.15, g4, 0.36],
          ])}
          {pat('cumulo-ht-mtn-near', pDense, pDense, [
            [c1d, c1d, 1.15, g3, 0.46],
            [c2d, c2d, 1.15, g3, 0.46],
          ])}
          {pat('cumulo-ht-foliage-dark', pDense, pDense, [
            [c1d, c1d, 1.25, g5, 0.68],
            [c2d, c2d, 1.25, g3, 0.68],
          ])}
          {pat('cumulo-ht-foliage-mid', pStd, pStd, [
            [c1s, c1s, 1.2, g3, 0.54],
            [c2s, c2s, 1.2, g3, 0.54],
          ])}
          {pat('cumulo-ht-lawn', pStd, lawnH, [
            [c1s, lawnH * 0.25, 0.8, g3, 0.2],
            [c2s, lawnH * 0.75, 0.8, g3, 0.2],
          ])}
          {pat('cumulo-ht-lawn-shade', pDense, lawnH, [
            [c1d, lawnH * 0.25, 0.95, g5, 0.3],
            [c2d, lawnH * 0.75, 0.95, g5, 0.3],
          ])}
          {pat('cumulo-ht-trunk', pTrunk, pTrunk, [
            [c1t, c1t, 1.3, g5, 0.8],
            [c2t, c2t, 1.3, g5, 0.8],
          ])}

          {/* Opaque variants: background baked in, so a shape needs one element instead of two */}
          {pat(
            'cumulo-ho-cloud',
            pStd,
            pStd,
            [
              [c1s, c1s, 0.9, g3, 0.22],
              [c2s, c2s, 0.9, g3, 0.22],
            ],
            true,
          )}
          {pat(
            'cumulo-ho-foliage-mid',
            pStd,
            pStd,
            [
              [c1s, c1s, 1.2, g3, 0.54],
              [c2s, c2s, 1.2, g3, 0.54],
            ],
            true,
          )}
          {pat(
            'cumulo-ho-foliage-dark',
            pDense,
            pDense,
            [
              [c1d, c1d, 1.25, g5, 0.68],
              [c2d, c2d, 1.25, g3, 0.68],
            ],
            true,
          )}
          {pat(
            'cumulo-ho-foliage-deep',
            pDense,
            pDense,
            [
              [c1d, c1d, 1.6, g5, 0.85],
              [c2d, c2d, 1.6, g5, 0.85],
            ],
            true,
          )}

          <pattern id="cumulo-ht-water" width="6" height="2.6" patternUnits="userSpaceOnUse">
            <rect width="6" height="0.8" fill={g4} fillOpacity={op(0.5)} />
          </pattern>

          <linearGradient id="cumulo-sky-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#000" />
            <stop offset="1" stopColor="#fff" />
          </linearGradient>
          <mask id="cumulo-sky-mask">
            <rect x="0" y={lakeTopY - 130} width="1440" height="130" fill="url(#cumulo-sky-grad)" />
          </mask>

          <linearGradient id="cumulo-haze-far" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: bg, stopOpacity: 0 }} />
            <stop offset="1" style={{ stopColor: bg, stopOpacity: 0.8 }} />
          </linearGradient>
          <linearGradient id="cumulo-haze-mid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: bg, stopOpacity: 0 }} />
            <stop offset="1" style={{ stopColor: bg, stopOpacity: 0.4 }} />
          </linearGradient>
          <linearGradient id="cumulo-lake-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: bg, stopOpacity: 0.15 }} />
            <stop offset="1" style={{ stopColor: bg, stopOpacity: 0.95 }} />
          </linearGradient>

          <clipPath id="cumulo-lake-clip">
            <rect x="0" y={lakeTopY} width="1440" height={S - lakeTopY + 4} />
          </clipPath>
          {clouds.flatMap((cl) =>
            cl.layers.map((ly) => (
              <clipPath key={ly.clipId} id={ly.clipId}>
                <path d={ly.outline} />
              </clipPath>
            )),
          )}
        </defs>

        {/* 1. SKY */}
        <g className={parallaxSkyLayerStyle.className}>
          <rect
            x="0"
            y={lakeTopY - 130}
            width="1440"
            height="130"
            fill="url(#cumulo-ht-cloud-base)"
            mask="url(#cumulo-sky-mask)"
          />
          {cloudScale > 0.02 ? (
            <>
              <g className={cloudBankAnimStyle.className}>
                {clouds.map((cl) => (cl.anim === 'bank' ? renderCloud(cl) : null))}
              </g>
              <g className={cloudRightAnimStyle.className}>
                {clouds.map((cl) => (cl.anim === 'right' ? renderCloud(cl) : null))}
              </g>
            </>
          ) : null}
          <g stroke={g5} strokeOpacity={op(0.5)} strokeWidth="1" strokeLinecap="round">
            <path d="M 1212 40 q 3 -3.4 6 0 q 3 -3.4 6 0" />
            <path d="M 1236 52 q 2.4 -2.6 4.8 0 q 2.4 -2.6 4.8 0" />
          </g>
        </g>

        {/* 2. DISTANT MOUNTAINS */}
        <g className={parallaxFarMtnLayerStyle.className}>
          <path d={farFill} fill={bg} />
          <path d={farFill} fill="url(#cumulo-ht-mtn-far)" />
          <path
            d={ridgeHatch(farPts, lakeTopY, seed + 101, 0.7)}
            stroke={g4}
            strokeOpacity={op(0.28)}
            strokeWidth="0.5"
            strokeLinecap="round"
          />
          <path d={polyline(farPts)} {...crestStroke} strokeOpacity={op(0.4)} strokeWidth="0.75" />
          <rect x="0" y={lakeTopY - 170} width="1440" height="170" fill="url(#cumulo-haze-far)" />
        </g>

        {/* 3. MID/NEAR MOUNTAINS, TOWN & LAKE */}
        <g className={parallaxMidLakeLayerStyle.className}>
          <path d={midFill} fill={bg} />
          <path d={midFill} fill="url(#cumulo-ht-mtn-mid)" />
          <path
            d={scallopBand(midPts, lakeTopY, 0.62, 8, seed + 41)}
            fill="url(#cumulo-ht-foliage-mid)"
            fillOpacity="0.55"
          />
          <path
            d={ridgeHatch(midPts, lakeTopY, seed + 102, 0.9)}
            stroke={g4}
            strokeOpacity={op(0.38)}
            strokeWidth="0.55"
            strokeLinecap="round"
          />
          <path
            d={ridgeRavines(midPts, lakeTopY, seed + 55)}
            stroke={g4}
            strokeOpacity={op(0.4)}
            strokeWidth="0.6"
            strokeDasharray="6 3 2 3"
            strokeLinejoin="round"
          />
          <path d={polyline(midPts)} {...crestStroke} strokeOpacity={op(0.45)} strokeWidth="0.8" />
          <rect x="0" y={lakeTopY - 130} width="1440" height="130" fill="url(#cumulo-haze-mid)" />

          <path d={nearFill} fill={bg} />
          <path d={nearFill} fill="url(#cumulo-ht-mtn-near)" />
          <path
            d={scallopBand(nearPts, lakeTopY, 0.42, 10, seed + 77)}
            fill="url(#cumulo-ht-foliage-dark)"
            fillOpacity="0.6"
          />
          <path
            d={ridgeHatch(nearPts, lakeTopY, seed + 103, 0.9)}
            stroke={g5}
            strokeOpacity={op(0.35)}
            strokeWidth="0.55"
            strokeLinecap="round"
          />
          <path d={polyline(nearPts)} {...crestStroke} strokeOpacity={op(0.5)} strokeWidth="0.8" />

          <path d={shoreTreeline} fill="url(#cumulo-ht-foliage-dark)" fillOpacity="0.7" />
          <path
            d={townD}
            fill={g4}
            fillOpacity={op(0.42)}
            stroke={g5}
            strokeOpacity={op(0.35)}
            strokeWidth="0.45"
          />

          <rect x="0" y={lakeTopY} width="1440" height="120" fill={bg} />
          <line
            x1="0"
            y1={lakeTopY}
            x2="1440"
            y2={lakeTopY}
            stroke={g4}
            strokeOpacity={op(0.36)}
            strokeWidth="0.9"
          />

          <g clipPath="url(#cumulo-lake-clip)">
            <g transform={`translate(0 ${f1(2 * lakeTopY)}) scale(1 -1)`}>
              <path d={farFill} fill="url(#cumulo-ht-water)" opacity="0.5" />
              <path d={midFill} fill="url(#cumulo-ht-water)" opacity="0.8" />
              <path d={nearFill} fill="url(#cumulo-ht-water)" />
            </g>
            <rect
              x="0"
              y={lakeTopY}
              width="1440"
              height={S - lakeTopY + 4}
              fill="url(#cumulo-lake-fade)"
            />
          </g>

          <g className={lakeReflectionsAnimStyle.className}>
            {rippleRows.map((row) => (
              <path
                key={row.y}
                d={row.d}
                stroke={g4}
                strokeWidth={row.strokeWidth}
                strokeOpacity={op(0.55)}
              />
            ))}
            <path
              d={glints}
              stroke={bg}
              strokeWidth="1.1"
              strokeOpacity="0.9"
              strokeLinecap="round"
            />
          </g>
        </g>

        {/* 4. LAWN, SHORELINE, TREES & GAME */}
        <g className={parallaxLawnDepthLayerStyle.className}>
          <path d={lawnFill} fill={bg} />
          <path d={lawnFill} fill="url(#cumulo-ht-lawn)" />
          <path d={stripes} fill="url(#cumulo-ht-lawn-shade)" fillOpacity="0.5" />
          <path d={bankShade} fill="url(#cumulo-ht-lawn-shade)" />
          <path d={contour} stroke={g4} strokeOpacity={op(0.45)} strokeWidth="0.8" />
          <path
            d={reeds}
            stroke={g5}
            strokeOpacity={op(0.5)}
            strokeWidth="0.55"
            strokeLinecap="round"
          />

          <g
            stroke={g4}
            strokeOpacity={op(0.55)}
            strokeWidth="0.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={`${bench(518)} ${bench(718)} ${bench(1024)} ${swing(636)} ${swing(852)}`} />
          </g>
          <path
            d={walkerBodies}
            stroke={g4}
            strokeOpacity={op(0.85)}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d={walkerHeads}
            stroke={g5}
            strokeOpacity={op(0.85)}
            strokeWidth="2.3"
            strokeLinecap="round"
          />

          {trees.left.map((t) => renderTree(t, ctx, `l-${t.seed}`))}
          {renderTree(trees.center, ctx, 'center')}
          {trees.gap.map((t) => renderTree(t, ctx, `g-${t.seed}`))}
          {renderPine(ctx, trees.pineDx)}
          {trees.right.map((t) => renderTree(t, ctx, `r-${t.seed}`))}

          <path
            d={tufts}
            stroke={g5}
            strokeOpacity={op(0.38)}
            strokeWidth="0.7"
            strokeLinecap="round"
          />

          {/* The footballer. Click to play. */}
          <ellipse
            data-game="player-shadow"
            rx="8"
            ry="1.6"
            fill="url(#cumulo-ht-lawn-shade)"
            transform={`translate(${PLAYER_START_X} ${f1(groundY + PLAYER_SHADOW_OFFSET_Y)}) scale(1 1)`}
          />
          <g
            data-game="player"
            transform={`translate(${PLAYER_START_X} ${f1(groundY)}) scale(1 1)`}
            onClick={startGame}
            className={startGame ? interactivePlayerStyle.className : undefined}
          >
            <circle cx="-2" cy="-14" r="24" fill="transparent" />
            <circle
              data-game="player-shield"
              cx="0"
              cy="-14"
              r="17"
              fill="none"
              stroke={g5}
              strokeOpacity={op(0.65)}
              strokeWidth="1"
              strokeDasharray="3 2.5"
              display="none"
            />
            {POSE_IDS.map((poseId) => {
              const pose = PLAYER_POSES[poseId];
              return (
                <g
                  key={poseId}
                  data-game-pose={poseId}
                  display={poseId === 'kick' ? 'inline' : 'none'}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                >
                  <path d={pose.arms} stroke={g4} strokeOpacity={op(0.95)} strokeWidth="1.7" />
                  <path d={pose.legs} stroke={g4} strokeOpacity={op(0.95)} strokeWidth="2.5" />
                  <path d={pose.shoes} stroke={g5} strokeOpacity={op(0.95)} strokeWidth="2.8" />
                </g>
              );
            })}
            <path
              d="M -3.3 -11.5 L 3.3 -11.5 L 3.7 -6 L 0.5 -6 L 0 -7.6 L -0.5 -6 L -3.7 -6 Z"
              fill={bg}
              stroke={g5}
              strokeOpacity={op(0.9)}
              strokeWidth="0.6"
              strokeLinejoin="round"
            />
            <path
              d="M -3.8 -20.4 Q 0 -22.2 3.8 -20.4 L 3.4 -11 L -3.4 -11 Z"
              fill={g5}
              fillOpacity={op(0.9)}
              stroke={g5}
              strokeOpacity={op(0.95)}
              strokeWidth="0.7"
              strokeLinejoin="round"
            />
            <path
              d="M 3.4 -26 Q 7.5 -26 7 -21.5"
              stroke={g5}
              strokeOpacity={op(0.9)}
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <circle
              cx="0.6"
              cy="-24.2"
              r="3.3"
              fill={bg}
              stroke={g5}
              strokeOpacity={op(0.9)}
              strokeWidth="0.8"
            />
            <path
              d="M -2.9 -24.8 Q -2.4 -28.4 1 -28 Q 4.3 -27.6 3.9 -24.4 Q 2.2 -26.2 -2.9 -24.8 Z"
              fill={g5}
              fillOpacity={op(0.95)}
            />
            <circle cx="-1.6" cy="-23.8" r="0.5" fill={g5} />
          </g>

          {/* Resting ball at feet plus pooled in-flight balls for multiball kicks */}
          <g
            data-game="resting-ball"
            transform={`translate(${PLAYER_START_X - BALL_REST_OFFSET_X} ${f1(groundY - BALL_RADIUS)})`}
          >
            <circle r={BALL_RADIUS + 1.6} fill={bg} fillOpacity="0.65" />
            <circle
              data-game="resting-ball-pierce"
              r={BALL_RADIUS + 2.4}
              fill="none"
              stroke={g5}
              strokeOpacity={op(0.75)}
              strokeWidth="0.8"
              strokeDasharray="2 1.8"
              display="none"
            />
            {footballCore}
          </g>
          {BALL_SLOTS.map((slot) => (
            <g key={`ball-slot-${slot}`} data-game-ball-slot={slot} display="none">
              <ellipse
                data-game-ball-part="shadow"
                rx="4"
                ry="1.2"
                fill="url(#cumulo-ht-lawn-shade)"
              />
              {TRAIL_SLOTS.map((trailSlot) => (
                <circle
                  key={`ball-trail-${slot}-${trailSlot}`}
                  data-game-ball-trail={trailSlot}
                  r="0"
                  fill={g5}
                  display="none"
                />
              ))}
              <g data-game-ball-part="body">
                <circle r={BALL_RADIUS + 1.6} fill={bg} fillOpacity="0.65" />
                <circle
                  data-game-ball-part="pierce-ring"
                  r={BALL_RADIUS + 2.4}
                  fill="none"
                  stroke={g5}
                  strokeOpacity={op(0.8)}
                  strokeWidth="0.9"
                  strokeDasharray="2.2 1.6"
                  display="none"
                />
                <g data-game-ball-part="spin">{footballCore}</g>
              </g>
            </g>
          ))}

          {/* Falling parachute powerup pickup */}
          <ellipse
            data-game="pickup-shadow"
            rx="6"
            ry="1.6"
            fill="url(#cumulo-ht-lawn-shade)"
            display="none"
          />
          <g data-game="pickup" display="none">
            <g data-game="pickup-chute">
              <path
                d="M -9 -11 Q -9 -20 0 -20 Q 9 -20 9 -11 Q 4 -12.5 0 -11 Q -4 -12.5 -9 -11 Z"
                fill={bg}
                stroke={g5}
                strokeOpacity={op(0.85)}
                strokeWidth="0.8"
                strokeLinejoin="round"
              />
              <path
                d="M -8 -11 L -2 -5 M 0 -11.5 L 0 -6 M 8 -11 L 2 -5"
                stroke={g4}
                strokeOpacity={op(0.7)}
                strokeWidth="0.6"
              />
            </g>
            <circle r="8.5" fill={bg} fillOpacity="0.85" />
            <circle r="7" fill={bg} stroke={g5} strokeOpacity={op(0.95)} strokeWidth="1" />
            <circle
              r="5.4"
              fill="none"
              stroke={g4}
              strokeOpacity={op(0.45)}
              strokeWidth="0.6"
              strokeDasharray="1.8 1.4"
            />
            <g data-game-pickup-icon="multiball" display="none" fill={g5}>
              <circle cx="0" cy="-2.2" r="1.7" />
              <circle cx="-2.2" cy="1.7" r="1.7" />
              <circle cx="2.2" cy="1.7" r="1.7" />
            </g>
            <g
              data-game-pickup-icon="pierce"
              display="none"
              fill="none"
              stroke={g5}
              strokeWidth="1.35"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M -2.8 -2.3 L -0.1 0 L -2.8 2.3" />
              <path d="M 0.4 -2.3 L 3.1 0 L 0.4 2.3" />
            </g>
            <g data-game-pickup-icon="shield" display="none">
              <path
                d="M 0 -3.4 L 3.1 -2 V 0.4 C 3.1 2.2 1.6 3.3 0 3.9 C -1.6 3.3 -3.1 2.2 -3.1 0.4 V -2 Z"
                fill={bg}
                stroke={g5}
                strokeWidth="1.15"
                strokeLinejoin="round"
              />
            </g>
          </g>

          {/* Pooled birds for the game */}
          {BIRD_SLOTS.map((slot) => (
            <g key={`bird-${slot}`} data-game-bird={slot} display="none" strokeLinejoin="round">
              <path
                data-game-wing="far"
                d={WING_UP}
                transform="translate(2.5 -1)"
                fill={g3}
                stroke={g5}
                strokeWidth="0.6"
              />
              <path d={BIRD_TORSO} fill={g5} />
              <path d={BIRD_LIGHTS} fill={bg} />
              <path d={BIRD_BEAK} fill={g4} stroke={g5} strokeWidth="0.4" />
              <path data-game-wing="near" d={WING_UP} fill={g4} stroke={g5} strokeWidth="0.8" />
            </g>
          ))}
        </g>

        {/* 5. FRONT GRASS BLADES */}
        <g className={parallaxFrontGrassLayerStyle.className}>
          <path d={blades} fill={bg} />
          <path d={blades} fill="url(#cumulo-ht-lawn-shade)" />
          <path
            d={blades}
            stroke={g4}
            strokeOpacity={op(0.4)}
            strokeWidth="0.6"
            strokeLinejoin="round"
          />
        </g>
      </svg>

      {playing ? (
        <>
          <HStack justify="between" align="start" gap="sm" className={hudTopBarStyle.className}>
            <HStack gap="xs" align="center" wrap="wrap">
              <HStack gap="xs" align="center" className={hudStatsPillStyle.className}>
                <span>score {hud.score}</span>
                {hud.bestScore > 0 ? (
                  <span className={hudBestStyle.className}>best {hud.bestScore}</span>
                ) : null}
                <span aria-label={`${hud.lives} lives left`}>
                  {'♥'.repeat(Math.max(0, hud.lives))}
                  {'♡'.repeat(Math.max(0, INITIAL_LIVES - hud.lives))}
                </span>
              </HStack>

              {hud.multiBallSec > 0 || hud.pierceSec > 0 || hud.hasShield ? (
                <HStack gap="xs" align="center" className={hudPowerupPillStyle.className}>
                  {hud.multiBallSec > 0 ? <span>3× ball {hud.multiBallSec}s</span> : null}
                  {hud.pierceSec > 0 ? <span>pierce {hud.pierceSec}s</span> : null}
                  {hud.hasShield ? <span>shield</span> : null}
                </HStack>
              ) : null}
            </HStack>

            <button
              type="button"
              className={hudButtonStyle.className}
              onClick={() => setPlaying(false)}
            >
              quit
            </button>
          </HStack>

          <HStack justify="center" align="center" className={hudBottomWrapStyle.className}>
            {hud.isGameOver ? (
              <button type="button" className={hudGameOverButtonStyle.className} onClick={restart}>
                <span>game over · </span>
                <span className={desktopOnlyHintStyle.className}>enter or click to retry</span>
                <span className={touchOnlyHintStyle.className}>tap to retry</span>
              </button>
            ) : (
              <span className={hudHintPillStyle.className}>
                <span className={desktopOnlyHintStyle.className}>
                  ← → move · ↑ jump · space kick
                </span>
                <span className={touchOnlyHintStyle.className}>tap kick · swipe ↑ jump</span>
              </span>
            )}
          </HStack>
        </>
      ) : null}
    </Stack>
  );
}
