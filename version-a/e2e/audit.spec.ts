/**
 * Accessibility audit (docs/AUDIT.md). Each test asserts a criterion and also writes the raw data
 * it measured to test-results/audit/*.json so the audit document can quote real numbers.
 */
import AxeBuilder from '@axe-core/playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { VIEWPORTS, hasHorizontalScroll } from './helpers';

const OUT = join(__dirname, '..', 'test-results', 'audit');
mkdirSync(OUT, { recursive: true });
const save = (name: string, data: unknown) =>
  writeFileSync(join(OUT, `${name}.json`), JSON.stringify(data, null, 2));

const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];
// Real browser zoom on a 1280×1024 screen: 400% → 320×256 CSS px, 200% → 640×512 (WCAG 1.4.10).
const ZOOM_400 = { width: 320, height: 256 };
const ZOOM_200 = { width: 640, height: 512 };

async function axe(page: Page) {
  const { violations, passes, incomplete } = await new AxeBuilder({ page })
    .withTags(AXE_TAGS)
    .analyze();
  return {
    violations: violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      nodes: v.nodes.map((n) => n.target.join(' ')),
    })),
    passes: passes.length,
    incomplete: incomplete.map((i) => ({ id: i.id, nodes: i.nodes.length })),
  };
}

test.describe('axe-core: WCAG 2.0/2.1/2.2 A+AA + best practices', () => {
  const states: Array<{
    name: string;
    viewport: { width: number; height: number };
    act?: (p: Page) => Promise<void>;
  }> = [
    { name: 'page-375', viewport: VIEWPORTS.mobile },
    { name: 'page-768', viewport: VIEWPORTS.tablet },
    { name: 'page-1280', viewport: VIEWPORTS.desktop },
    { name: 'page-320-zoom400', viewport: ZOOM_400 },
    {
      name: 'mobile-menu-open',
      viewport: VIEWPORTS.mobile,
      act: (p) => p.getByRole('button', { name: 'Apri il menu' }).click(),
    },
    {
      name: 'empty-state',
      viewport: VIEWPORTS.desktop,
      act: (p) => p.getByRole('searchbox', { name: 'Cerca nel catalogo' }).fill('zzz'),
    },
    {
      name: 'details-dialog',
      viewport: VIEWPORTS.desktop,
      act: async (p) => {
        await p.getByRole('button', { name: /^Scopri di più: NEURA-Q/ }).click();
        await p.getByRole('dialog').waitFor();
      },
    },
    {
      name: 'form-errors',
      viewport: VIEWPORTS.desktop,
      act: async (p) => {
        await p.getByRole('button', { name: 'Invia messaggio' }).click();
        await p.locator('#contatti [role="alert"]').waitFor();
      },
    },
  ];

  for (const state of states) {
    test(state.name, async ({ page }) => {
      await page.setViewportSize(state.viewport);
      await page.goto('/');
      if (state.act) await state.act(page);
      const result = await axe(page);
      save(`axe-${state.name}`, result);
      expect(result.violations).toEqual([]);
    });
  }
});

test('structure: one h1, no skipped heading levels, labelled landmarks', async ({ page }) => {
  await page.goto('/');
  const data = await page.evaluate(() => {
    const visible = (el: Element) => {
      const s = getComputedStyle(el);
      return s.display !== 'none' && s.visibility !== 'hidden';
    };
    const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')]
      .filter((h) => visible(h) || h.classList.contains('sr-only'))
      .filter((h) => !h.closest('[hidden], dialog:not([open])'))
      .map((h) => ({
        level: Number(h.tagName[1]),
        text: h.textContent?.trim().replace(/\s+/g, ' '),
      }));
    const landmarks = [
      ...document.querySelectorAll(
        'header,nav,main,footer,aside,section[aria-labelledby],search,[role="search"]',
      ),
    ]
      .filter((el) => !el.closest('[hidden]') && visible(el))
      .map((el) => {
        const labelledby = el.getAttribute('aria-labelledby');
        const name =
          el.getAttribute('aria-label') ??
          (labelledby ? document.getElementById(labelledby)?.textContent?.trim() : null) ??
          null;
        return { tag: el.tagName.toLowerCase(), name };
      });
    return { headings, landmarks };
  });
  save('structure', data);

  expect(data.headings.filter((h) => h.level === 1)).toHaveLength(1);
  for (let i = 1; i < data.headings.length; i += 1) {
    const jump = data.headings[i]!.level - data.headings[i - 1]!.level;
    expect(jump, `skip before "${data.headings[i]!.text}"`).toBeLessThanOrEqual(1);
  }
  const navs = data.landmarks.filter((l) => l.tag === 'nav');
  for (const nav of navs) expect(nav.name, 'every <nav> is labelled').toBeTruthy();
});

test('images: every <img> has a meaningful alt; every inline <svg> is hidden or named', async ({
  page,
}) => {
  await page.goto('/');
  const data = await page.evaluate(() => ({
    imgs: [...document.querySelectorAll('img')].map((i) => ({
      alt: i.getAttribute('alt'),
      src: i.currentSrc || i.src,
    })),
    unlabeledSvgs: [...document.querySelectorAll('svg')].filter(
      (s) =>
        s.getAttribute('aria-hidden') !== 'true' &&
        !s.getAttribute('aria-label') &&
        !s.querySelector('title'),
    ).length,
  }));
  save('images', data);
  for (const img of data.imgs) {
    expect(img.alt?.length ?? 0, img.src).toBeGreaterThan(20);
  }
  expect(data.unlabeledSvgs).toBe(0);
});

/**
 * Tabs through the whole page. For every stop records: accessible label, whether a focus
 * indicator is drawn (outline or ring), whether the sticky header hides it (WCAG 2.2 2.4.11)
 * and its size (WCAG 2.2 2.5.8 ≥ 24px; project target ≥ 44px).
 */
async function walkTabOrder(page: Page, maxStops = 120) {
  const stops: Array<Record<string, unknown>> = [];
  for (let i = 0; i < maxStops; i += 1) {
    await page.keyboard.press('Tab');
    // Focus scrolling may be smooth (scroll-behavior): measure once the position is stable.
    await page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          let last = -1;
          let stable = 0;
          const tick = () => {
            const y = window.scrollY;
            stable = y === last ? stable + 1 : 0;
            last = y;
            if (stable >= 3) resolve();
            else requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }),
    );
    const info = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body) return null;
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      // 2.4.11 Focus Not Obscured (Minimum): hit-test a few points inside the element; it is
      // obscured only if author content (e.g. the sticky header) covers ALL of them.
      const inset = 3;
      const points: Array<[number, number]> = [
        [r.left + r.width / 2, r.top + r.height / 2],
        [r.left + inset, r.top + inset],
        [r.right - inset, r.bottom - inset],
      ];
      const owns = (hit: Element | null) =>
        !!hit && (hit === el || el.contains(hit) || hit.contains(el));
      // Points outside the viewport are not "obscured by author content" (2.4.11): a tall control
      // such as the textarea may extend below the fold while its focused part is visible.
      const inView = points.filter(
        ([x, y]) => x >= 0 && y >= 0 && x < innerWidth && y < innerHeight,
      );
      const visiblePoints = inView.filter(([x, y]) => owns(document.elementFromPoint(x, y))).length;
      const outline = s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) >= 2;
      const ring = s.boxShadow !== 'none' && s.boxShadow.includes('0px 0px 0px');
      return {
        tag: el.tagName.toLowerCase(),
        label: (
          el.getAttribute('aria-label') ??
          el.textContent ??
          (el as HTMLInputElement).placeholder ??
          ''
        )
          .trim()
          .replace(/\s+/g, ' ')
          .slice(0, 60),
        focusVisible: el.matches(':focus-visible'),
        indicator: outline || ring,
        obscuredByHeader: inView.length > 0 && visiblePoints === 0,
        partiallyObscured: visiblePoints > 0 && visiblePoints < inView.length,
        width: Math.round(r.width),
        height: Math.round(r.height),
        inViewport: r.bottom > 0 && r.top < window.innerHeight,
      };
    });
    if (!info) break; // focus left the document (end of the tab sequence): no trap
    stops.push(info);
  }
  return stops;
}

for (const [name, viewport] of [
  ['1280', VIEWPORTS.desktop],
  ['375', VIEWPORTS.mobile],
  ['320x256-zoom400', ZOOM_400],
] as const) {
  test(`keyboard: full tab order at ${name}px — visible, not obscured, no trap`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    const stops = await walkTabOrder(page);
    save(`tab-order-${name}`, stops);

    expect(stops.length).toBeGreaterThan(20);
    expect(stops.length, 'tab sequence must end (no keyboard trap)').toBeLessThan(120);
    for (const s of stops) {
      expect(s.focusVisible && s.indicator, `focus indicator on "${s.label}"`).toBe(true);
      expect(s.obscuredByHeader, `"${s.label}" hidden under the sticky header`).toBe(false);
      // Stricter than 2.4.11 (AA allows partial): the focused control must be fully visible.
      expect(s.partiallyObscured, `"${s.label}" partially out of view`).toBe(false);
      expect(s.inViewport, `"${s.label}" scrolled into view`).toBe(true);
      expect(
        Math.min(s.width as number, s.height as number),
        `target size of "${s.label}"`,
      ).toBeGreaterThanOrEqual(24);
    }
  });
}

test('target size: interactive elements ≥ 44×44 px (project goal; WCAG 2.2 AA needs 24)', async ({
  page,
}) => {
  await page.setViewportSize(VIEWPORTS.mobile);
  await page.goto('/');
  const small = await page.evaluate(() =>
    [
      ...document.querySelectorAll<HTMLElement>(
        'a[href], button, input, textarea, select, [tabindex="0"]',
      ),
    ]
      .filter(
        (el) =>
          el.offsetParent !== null &&
          !el.closest('[hidden]') &&
          !el.classList.contains('-translate-y-24'),
      )
      .map((el) => {
        const r = el.getBoundingClientRect();
        return {
          label: (el.getAttribute('aria-label') ?? el.textContent ?? '').trim().slice(0, 40),
          w: Math.round(r.width),
          h: Math.round(r.height),
        };
      })
      .filter((t) => t.h < 44 || t.w < 44),
  );
  save('target-size-375', small);
  expect(small).toEqual([]);
});

for (const [name, viewport] of [
  ['200', ZOOM_200],
  ['400', ZOOM_400],
] as const) {
  test(`reflow: zoom ${name}% (${viewport.width}px) keeps all content without horizontal scroll`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    expect(await hasHorizontalScroll(page)).toBe(false);
    for (const locator of [
      page.getByRole('heading', { level: 1 }),
      page.getByRole('searchbox', { name: 'Cerca nel catalogo' }),
      page.getByRole('group', { name: 'Filtra per categoria' }),
      page.getByRole('article').first(),
      page.getByRole('textbox', { name: /^Messaggio/ }),
      page.getByRole('contentinfo'),
    ]) {
      await locator.scrollIntoViewIfNeeded();
      await expect(locator).toBeVisible();
      const box = (await locator.boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
    }
    await page.screenshot({ path: join(OUT, `zoom-${name}.png`), fullPage: true });
  });
}

test('sticky header only where there is room: static at 400% zoom, sticky on desktop', async ({
  page,
}) => {
  const headerTopAfterScroll = async () => {
    await page.evaluate(() => window.scrollTo({ top: 1500, behavior: 'instant' }));
    return (await page.getByRole('banner').boundingBox())!.y;
  };
  await page.setViewportSize(ZOOM_400);
  await page.goto('/');
  const zoomTop = await headerTopAfterScroll();
  await page.setViewportSize(VIEWPORTS.desktop);
  await page.goto('/');
  const desktopTop = await headerTopAfterScroll();
  save('sticky-header', { zoom400HeaderY: zoomTop, desktopHeaderY: desktopTop });
  expect(zoomTop).toBeLessThan(-100); // scrolled away with the page
  expect(desktopTop).toBe(0); // still pinned
});

test('text spacing (WCAG 1.4.12): no clipped text or horizontal scroll', async ({ page }) => {
  await page.setViewportSize(VIEWPORTS.mobile);
  await page.goto('/');
  await page.addStyleTag({
    content:
      '* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }',
  });
  expect(await hasHorizontalScroll(page)).toBe(false);
  const clipped = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>('button, a, h1, h2, h3, p, label, dt, dd')]
      .filter((el) => el.offsetParent !== null && !el.closest('.sr-only, [aria-hidden="true"]'))
      .filter((el) => {
        const s = getComputedStyle(el);
        const clips =
          s.overflow === 'hidden' || s.overflowX === 'hidden' || s.textOverflow === 'ellipsis';
        return (
          clips && (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1)
        );
      })
      .map((el) => el.textContent?.trim().slice(0, 40)),
  );
  save('text-spacing', clipped);
  expect(clipped).toEqual([]);
});

test('reduced motion: no transforms on hover, transitions/animations collapse to ~1ms', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize(VIEWPORTS.desktop);
  await page.goto('/');
  const card = page.getByRole('article').first();
  await card.scrollIntoViewIfNeeded();
  await card.hover();
  await page.waitForTimeout(300);
  const data = await card.evaluate((el) => {
    const s = getComputedStyle(el);
    const img = el.querySelector('img')!;
    return {
      cardTranslate: s.translate,
      cardTransition: s.transitionDuration,
      imgTransform: getComputedStyle(img).transform,
      htmlScroll: getComputedStyle(document.documentElement).scrollBehavior,
    };
  });
  save('reduced-motion', data);
  expect(data.cardTranslate === 'none' || data.cardTranslate === '0px').toBe(true);
  expect(data.imgTransform).toBe('none');
  expect(data.cardTransition.split(',').every((d) => parseFloat(d) <= 0.001)).toBe(true);
  expect(data.htmlScroll).toBe('auto');
});

test('live regions: result counter (polite) and form errors (alert)', async ({ page }) => {
  await page.goto('/');
  const counter = page.locator('#catalogo [role="status"][aria-live="polite"]');
  await expect(counter).toHaveText('12 prodotti trovati');
  await page.getByRole('searchbox', { name: 'Cerca nel catalogo' }).pressSequentially('lexia');
  await expect(counter).toHaveText('1 prodotto trovato');

  await page.getByRole('button', { name: 'Invia messaggio' }).click();
  await expect(page.locator('#contatti [role="alert"]')).toHaveText(/Il modulo contiene 3 errori/);
  await expect(page.getByRole('textbox', { name: /^Nome/ })).toHaveAccessibleDescription(
    'Inserisci il tuo nome.',
  );
});

/**
 * axe reports text on the hero gradient as "incomplete" (it cannot resolve a gradient background).
 * Measure it: hide the hero text, screenshot the real pixels behind each text element and compute
 * the contrast against the lightest background pixel (worst case for light text).
 */
test('contrast on the hero gradient (sampled pixels, worst case)', async ({ page }) => {
  const results: Array<{ el: string; ratio: number; min: number }> = [];
  for (const viewport of [VIEWPORTS.mobile, VIEWPORTS.desktop]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    const targets = [
      { sel: '#hero-title', min: 3, name: 'h1 (large text)' },
      { sel: 'section.on-dark p.text-accent-subtle', min: 4.5, name: 'eyebrow' },
      { sel: 'section.on-dark p.text-primary-subtle', min: 4.5, name: 'lead' },
      { sel: 'section.on-dark dt', min: 4.5, name: 'stat labels' },
      { sel: 'section.on-dark dd', min: 3, name: 'stat values (large)' },
      { sel: 'section.on-dark a[class*="border-white"]', min: 4.5, name: 'outline CTA text' },
    ];
    const boxes = [];
    for (const t of targets) {
      const loc = page.locator(t.sel);
      for (let i = 0; i < (await loc.count()); i += 1) {
        const el = loc.nth(i);
        const color = await el.evaluate((n) => getComputedStyle(n).color);
        boxes.push({ ...t, box: (await el.boundingBox())!, color });
      }
    }
    await page.addStyleTag({
      content:
        // Hide text, icons and borders: only the real background behind the glyphs is sampled.
        'section.on-dark * { color: transparent !important; border-color: transparent !important; } section.on-dark svg { visibility: hidden; }',
    });
    const shot = (await page.screenshot({ fullPage: true })).toString('base64');
    const measured = await page.evaluate(
      async ({ shot, boxes }) => {
        const img = new Image();
        img.src = `data:image/png;base64,${shot}`;
        await img.decode();
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        const lum = (r: number, g: number, b: number) => {
          const f = (c: number) =>
            (c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
          return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
        };
        const sy = window.scrollY;
        return boxes.map((b) => {
          const data = ctx.getImageData(
            Math.round(b.box.x),
            Math.round(b.box.y + sy),
            Math.max(1, Math.round(b.box.width)),
            Math.max(1, Math.round(b.box.height)),
          ).data;
          let maxL = 0;
          for (let i = 0; i < data.length; i += 4)
            maxL = Math.max(maxL, lum(data[i]!, data[i + 1]!, data[i + 2]!));
          const [r, g, bl] = b.color.match(/\d+/g)!.map(Number) as [number, number, number];
          const fg = lum(r, g, bl);
          return {
            el: b.name,
            ratio:
              Math.round(((Math.max(fg, maxL) + 0.05) / (Math.min(fg, maxL) + 0.05)) * 100) / 100,
            min: b.min,
          };
        });
      },
      { shot, boxes },
    );
    results.push(...measured.map((m) => ({ ...m, el: `${viewport.width}px ${m.el}` })));
  }
  save('hero-contrast', results);
  for (const r of results) expect(r.ratio, r.el).toBeGreaterThanOrEqual(r.min);
});
