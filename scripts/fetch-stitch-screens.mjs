import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { stitch } from '@google/stitch-sdk';

const API_KEY = process.env.STITCH_API_KEY || process.env.GOOGLE_STITCH_API_KEY;
const PROJECT_ID = '2316060760309761603';
const OUT_DIR = join(process.cwd(), 'stitch-designs');

const SCREENS = [
  { slug: 'restaurant-detail', id: '01d232146aca479eab5f3f395f1242bc', title: 'FoodRevolut - Restaurant Detail' },
  { slug: 'restaurant-live-orders', id: '172e773b957a464798ed8a0be217f3da', title: 'Restaurant Dashboard - Live Orders' },
  { slug: 'admin-global-overview', id: '3d7234c0e79a4e058b6ad74416dffb43', title: 'Admin Panel - Global Overview' },
  { slug: 'home-feed', id: '6a6ad8b69f474d70aa111fd3d49a6c9a', title: 'FoodRevolut - Home Feed' },
  { slug: 'live-order-tracking', id: '6ec11e59dea442288cceb754734b8c1d', title: 'FoodRevolut - Live Order Tracking' },
  { slug: 'landing-page', id: '74aa778ba6914465ba51b0809ca1f5c3', title: 'FoodRevolut - Landing Page' },
  { slug: 'admin-restaurant-mgmt', id: '99766b46890c4b0fadfb1662b8e84821', title: 'Admin Panel - Restaurant Management' },
  { slug: 'checkout-page', id: 'ac1683db5432467da9bedd0de55dbd49', title: 'FoodRevolut - Checkout Page' },
  { slug: 'design-system', id: 'asset-stub-assets-a1e9e8e95ed74e0486e3b263008bbd24-1778770401111', title: 'Design System' },
  { slug: 'user-profile', id: 'cdd5646a67d846ca92040ff25f640c3b', title: 'FoodRevolut - User Profile' },
  { slug: 'restaurant-menu-mgmt', id: 'd06c16ee920648708c9e2d0f6ee74ff0', title: 'Restaurant Dashboard - Menu Management' },
  { slug: 'login-signup', id: 'da9442bef5354d8d9aadcbcab9090bd8', title: 'FoodRevolut - Login & Signup' },
  { slug: 'admin-delivery-fleet', id: 'e64bf418c1d34ff182b2ce722623dda4', title: 'Admin Panel - Delivery Fleet Management' },
  { slug: 'restaurant-overview', id: 'e918eba2110f46a4a99507ea4b9d7f44', title: 'Restaurant Dashboard - Overview' },
  { slug: 'brand-mark', id: 'fdb54d57110144f490b8789f23a741b8', title: 'FoodRevolut Brand Mark' },
];

async function download(url, destPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed ${res.status}: ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(destPath, buf);
  return destPath;
}

async function main() {
  if (!API_KEY) {
    console.error('Missing STITCH_API_KEY or GOOGLE_STITCH_API_KEY');
    process.exit(1);
  }

  process.env.STITCH_API_KEY = API_KEY;
  await mkdir(OUT_DIR, { recursive: true });

  const project = stitch.project(PROJECT_ID);
  const manifest = { projectId: PROJECT_ID, fetchedAt: new Date().toISOString(), screens: [] };

  for (const entry of SCREENS) {
    const row = { ...entry, htmlUrl: null, imageUrl: null, htmlFile: null, imageFile: null, error: null };
    try {
      const screen = await project.getScreen(entry.id);
      const htmlUrl = await screen.getHtml();
      const imageUrl = await screen.getImage();
      row.htmlUrl = htmlUrl;
      row.imageUrl = imageUrl;

      const dir = join(OUT_DIR, entry.slug);
      await mkdir(dir, { recursive: true });

      if (htmlUrl) {
        row.htmlFile = `stitch-designs/${entry.slug}/screen.html`;
        await download(htmlUrl, join(process.cwd(), row.htmlFile));
      }
      if (imageUrl) {
        const ext = imageUrl.includes('.png') ? 'png' : 'jpg';
        row.imageFile = `stitch-designs/${entry.slug}/screen.${ext}`;
        await download(imageUrl, join(process.cwd(), row.imageFile));
      }
      console.log(`OK: ${entry.title}`);
    } catch (e) {
      row.error = e?.message || String(e);
      console.error(`FAIL: ${entry.title} — ${row.error}`);
    }
    manifest.screens.push(row);
  }

  await writeFile(join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`\nDone. Manifest: stitch-designs/manifest.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
