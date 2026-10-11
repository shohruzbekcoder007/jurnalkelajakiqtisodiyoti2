/**
 * Seeds MongoDB from the JSON snapshots in <repo>/seed captured from the
 * original site's WordPress REST API (fintech.tsue.uz/wp-json/wp/v2/...).
 *
 *   npm run seed            -> wipes posts/pages/categories, re-imports
 *   npm run seed -- --keep  -> upsert only, keeps comments/submissions
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import { connectDB } from '../config/db.js';
import Post from '../models/Post.js';
import Page from '../models/Page.js';
import Category from '../models/Category.js';
import User from '../models/User.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const SEED_DIR = path.join(__dirname, '..', '..', '..', 'seed');
const KEEP = process.argv.includes('--keep');

const readJson = (file) => JSON.parse(fs.readFileSync(path.join(SEED_DIR, file), 'utf8'));

function decodeEntities(str = '') {
  return String(str)
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/&laquo;/g, '«')
    .replace(/&raquo;/g, '»')
    .replace(/&#8217;/g, '’');
}

function cleanExcerpt(html = '') {
  return decodeEntities(
    String(html)
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
  ).trim();
}

// Rewrite absolute links back to the original host so they stay inside this app
function rewriteLinks(html = '') {
  return String(html)
    .replace(/https?:\/\/fintech\.tsue\.uz\/\?cat=(\d+)/g, '/?cat=$1')
    .replace(/https?:\/\/fintech\.tsue\.uz\/\?p=(\d+)/g, '/?p=$1')
    .replace(/https?:\/\/fintech\.tsue\.uz\/category\//g, '/category/')
    .replace(/https?:\/\/fintech\.tsue\.uz\//g, '/');
}

async function run() {
  await connectDB(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fintech_tsue');

  if (!KEEP) {
    await Promise.all([Post.deleteMany({}), Page.deleteMany({}), Category.deleteMany({})]);
    console.log('[seed] cleared posts / pages / categories');
  }

  /* ------------------------------ categories ------------------------------ */
  const rawCats = readJson('categories.json');
  const catByWpId = new Map();
  for (const c of rawCats) {
    const doc = await Category.findOneAndUpdate(
      { slug: c.slug },
      {
        wpId: c.id,
        name: decodeEntities(c.name),
        slug: c.slug,
        description: decodeEntities(c.description || ''),
        parent: c.parent || 0,
        count: 0
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    catByWpId.set(c.id, doc._id);
  }
  console.log(`[seed] categories: ${catByWpId.size}`);

  /* -------------------------------- posts -------------------------------- */
  const postFiles = fs
    .readdirSync(SEED_DIR)
    .filter((f) => /^posts_\d+\.json$/.test(f))
    .sort();

  let postCount = 0;
  for (const file of postFiles) {
    const rows = readJson(file);
    const ops = rows
      .filter((p) => p.status === 'publish')
      .map((p) => ({
        updateOne: {
          filter: { slug: p.slug },
          update: {
            $set: {
              wpId: p.id,
              title: decodeEntities(p.title?.rendered || ''),
              slug: p.slug,
              content: rewriteLinks(p.content?.rendered || ''),
              excerpt: cleanExcerpt(p.excerpt?.rendered || ''),
              date: new Date(p.date),
              modified: new Date(p.date),
              status: 'publish',
              author: 'fintex-admin',
              categories: (p.categories || [])
                .map((id) => catByWpId.get(id))
                .filter(Boolean)
            }
          },
          upsert: true
        }
      }));
    if (ops.length) {
      const r = await Post.bulkWrite(ops, { ordered: false });
      postCount += ops.length;
      console.log(`[seed] ${file}: ${ops.length} posts (upserted ${r.upsertedCount})`);
    }
  }

  /* -------------------------------- pages -------------------------------- */
  // Menu order mirrors the original header navigation, left to right
  const MENU_ORDER = {
    arxiv: 1,
    'axbarot-xati': 2,
    'sample-page': 3,
    'jurnal-haqida': 4,
    'jurnal-manzili': 5,
    'maqola-chop-etish-tartibi': 6,
    'maqola-yuborish': 7,
    ruknlar: 8,
    'tahrir-kengashi': 9
  };

  const rawPages = readJson('pages.json');
  for (const p of rawPages) {
    await Page.findOneAndUpdate(
      { slug: p.slug },
      {
        wpId: p.id,
        title: decodeEntities(p.title?.rendered || ''),
        slug: p.slug,
        content: rewriteLinks(p.content?.rendered || ''),
        date: new Date(p.date),
        menuOrder: MENU_ORDER[p.slug] ?? 99,
        showInMenu: true,
        status: 'publish'
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
  console.log(`[seed] pages: ${rawPages.length}`);

  /* --------------------------- category counters -------------------------- */
  const counts = await Post.aggregate([
    { $match: { status: 'publish' } },
    { $unwind: '$categories' },
    { $group: { _id: '$categories', n: { $sum: 1 } } }
  ]);
  await Category.updateMany({}, { count: 0 });
  for (const c of counts) {
    await Category.updateOne({ _id: c._id }, { count: c.n });
  }

  /* ------------------------------ admin user ------------------------------ */
  const username = process.env.ADMIN_USERNAME || 'fintex-admin';
  const existing = await User.findOne({ username });
  if (!existing) {
    await User.create({
      username,
      email: process.env.ADMIN_EMAIL || 'admin@fintech.local',
      password: process.env.ADMIN_PASSWORD || 'admin12345',
      displayName: username,
      role: 'admin'
    });
    console.log(`[seed] admin user created: ${username}`);
  } else {
    console.log(`[seed] admin user already exists: ${username}`);
  }

  console.log(`[seed] done. posts=${postCount} pages=${rawPages.length} categories=${catByWpId.size}`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});
