import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import pg from 'pg';
import { createClient } from '@supabase/supabase-js';

const { Client } = pg;
const bucketName = process.env.SUPABASE_COURSE_MATERIALS_BUCKET || 'traderlab-course-materials';
const sourceDirectory = path.resolve(process.cwd(), '..', '..', '.runtime', 'content-material-import');
const videoUrls = [
  'https://www.youtube.com/watch?v=y3n33n7-kqs',
  'https://www.youtube.com/watch?v=XlLf3Hkwdrw',
  'https://www.youtube.com/watch?v=FzEXB-82ajY',
  'https://www.youtube.com/watch?v=N9UV_8WaXU4',
  'https://www.youtube.com/watch?v=JCTl1_N4AIs',
  'https://www.youtube.com/watch?v=yLE6JLE-iZA',
  'https://www.youtube.com/watch?v=V3ECuDlgrp0',
];

const assetDefinitions = [
  { key: 'apostila', filename: 'Mentoria TDS - Apostila Parte I.pdf', mimeType: 'application/pdf' },
  { key: 'candle', filename: 'TDS_Indicador_CandleCareca.ntsl', mimeType: 'text/plain' },
  { key: 'gatilho', filename: 'TDS_Indicador_GatilhoIgnicao.ntsl', mimeType: 'text/plain' },
];

// Intentional spread: include empty lessons and examples with one, two, and three materials.
const materialAssignments = new Map([
  [1, ['apostila']],
  [4, ['apostila']],
  [5, ['candle', 'gatilho']],
  [6, ['apostila', 'candle', 'gatilho']],
  [7, ['apostila']],
  [8, ['apostila', 'gatilho']],
]);

function required(value, name) {
  if (!value) throw new Error(`Missing required configuration: ${name}`);
  return value;
}

function objectPath(bytes, filename) {
  const digest = createHash('sha256').update(bytes).digest('hex');
  return `seed-assets/mentoria-tds/${digest}/${encodeURIComponent(filename)}`;
}

const supabase = createClient(
  required(process.env.SUPABASE_URL, 'SUPABASE_URL'),
  required(process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY, 'SUPABASE_SECRET_KEY'),
);
const bucketResult = await supabase.storage.getBucket(bucketName);
if (bucketResult.error) throw bucketResult.error;
if (bucketResult.data.public) throw new Error(`Bucket ${bucketName} must remain private`);

const assets = new Map();
for (const definition of assetDefinitions) {
  const localPath = path.join(sourceDirectory, definition.filename);
  const bytes = await readFile(localPath);
  const info = await stat(localPath);
  if (info.size !== bytes.length) throw new Error(`File size changed while reading: ${definition.filename}`);
  if (definition.mimeType === 'application/pdf' && bytes.subarray(0, 5).toString() !== '%PDF-') {
    throw new Error('The supplied apostille does not have a PDF signature');
  }

  const storagePath = objectPath(bytes, definition.filename);
  const folder = storagePath.slice(0, storagePath.lastIndexOf('/'));
  const objectName = storagePath.slice(storagePath.lastIndexOf('/') + 1);
  const listed = await supabase.storage.from(bucketName).list(folder, { search: definition.filename, limit: 100 });
  if (listed.error) throw listed.error;
  if (!listed.data.some((entry) => entry.name === objectName || decodeURIComponent(entry.name) === definition.filename)) {
    const uploaded = await supabase.storage.from(bucketName).upload(storagePath, bytes, {
      contentType: definition.mimeType,
      cacheControl: '3600',
      upsert: false,
    });
    if (uploaded.error && uploaded.error.statusCode !== '409' && uploaded.error.code !== 'KeyAlreadyExists') {
      throw uploaded.error;
    }
  }
  assets.set(definition.key, {
    name: definition.filename,
    storagePath,
    mimeType: definition.mimeType,
    sizeBytes: bytes.length,
  });
}

const db = new Client({ connectionString: required(process.env.DIRECT_URL, 'DIRECT_URL') });
await db.connect();
try {
  await db.query('BEGIN');
  const { rows: lessons } = await db.query(`
    SELECT cc.id AS content_id, cc.title, cc.video_url, cc.status
    FROM course_contents cc
    JOIN course_modules cm ON cm.id = cc.module_id
    JOIN courses c ON c.id = cm.course_id
    WHERE cc.kind = 'LESSON'
    ORDER BY cc.id
    FOR UPDATE OF cc
  `);
  if (lessons.length !== 9) throw new Error(`Expected 9 lessons, found ${lessons.length}`);
  if (lessons.some((lesson) => lesson.status !== 'PUBLISHED')) {
    throw new Error('Every example lesson must remain published for this population');
  }
  if (lessons.some((lesson) => lesson.video_url && !videoUrls.includes(lesson.video_url))) {
    throw new Error('At least one lesson already has a different video URL; refusing to overwrite it');
  }

  for (let index = 0; index < lessons.length; index += 1) {
    const lesson = lessons[index];
    const videoUrl = videoUrls[index % videoUrls.length];
    await db.query('UPDATE course_contents SET video_url = $1, updated_at = NOW() WHERE id = $2', [videoUrl, lesson.content_id]);
    const assignments = materialAssignments.get(lesson.content_id) ?? [];
    for (let position = 0; position < assignments.length; position += 1) {
      const asset = assets.get(assignments[position]);
      await db.query(`
        INSERT INTO course_materials (content_id, name, storage_path, mime_type, size_bytes, position)
        SELECT $1, $2, $3, $4, $5, $6
        WHERE NOT EXISTS (
          SELECT 1 FROM course_materials WHERE content_id = $1 AND storage_path = $3::varchar
        )
      `, [lesson.content_id, asset.name, asset.storagePath, asset.mimeType, asset.sizeBytes, position]);
    }
  }
  await db.query('COMMIT');
} catch (error) {
  await db.query('ROLLBACK');
  throw error;
} finally {
  await db.end();
}

const verifyDb = new Client({ connectionString: process.env.DIRECT_URL });
await verifyDb.connect();
try {
  const { rows } = await verifyDb.query(`
    SELECT cc.id AS content_id, cc.title, cc.video_url,
      COALESCE(json_agg(json_build_object('name', mat.name, 'mimeType', mat.mime_type)
        ORDER BY mat.position) FILTER (WHERE mat.id IS NOT NULL), '[]'::json) AS materials
    FROM course_contents cc
    JOIN course_modules cm ON cm.id = cc.module_id
    JOIN courses c ON c.id = cm.course_id
    LEFT JOIN course_materials mat ON mat.content_id = cc.id
    WHERE cc.kind = 'LESSON'
    GROUP BY cc.id
    ORDER BY cc.id
  `);
  const counts = rows.reduce((acc, lesson) => {
    const count = lesson.materials.length;
    acc[count] = (acc[count] ?? 0) + 1;
    return acc;
  }, {});
  if (rows.length !== 9 || rows.some((lesson) => !lesson.video_url)) throw new Error('Post-write verification failed');
  for (const expected of [0, 1, 2, 3]) {
    if (!counts[expected]) throw new Error(`No lessons found with ${expected} materials`);
  }
  console.log(JSON.stringify({
    bucket: bucketName,
    lessons: rows.map((lesson) => ({
      id: lesson.content_id,
      title: lesson.title,
      videoUrl: lesson.video_url,
      materials: lesson.materials,
    })),
    materialCountDistribution: counts,
  }, null, 2));
} finally {
  await verifyDb.end();
}
