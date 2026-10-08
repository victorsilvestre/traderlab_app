import { randomBytes } from 'node:crypto';
import pg from 'pg';
import { createClient } from '@supabase/supabase-js';

const { Client } = pg;
const seedMarker = 'admin-student-catalog-v1';
const emailDomain = 'example.test';
const users = [
  { name: 'Ana Beatriz Souza', email: `ana.souza@${emailDomain}`, phone: '(11) 99812-3041' },
  { name: 'Bruno Henrique Costa', email: `bruno.costa@${emailDomain}`, phone: '(21) 99134-7280' },
  { name: 'Camila Rodrigues Lima', email: `camila.lima@${emailDomain}`, phone: '(31) 98872-1605' },
  { name: 'Diego Martins Ferreira', email: `diego.ferreira@${emailDomain}`, phone: '(41) 99903-5412' },
  { name: 'Eduardo Nunes Rocha', email: `eduardo.rocha@${emailDomain}`, phone: '(51) 99621-8037' },
  { name: 'Fernanda Alves Ribeiro', email: `fernanda.ribeiro@${emailDomain}`, phone: '(61) 99248-7310' },
  { name: 'Gabriel Carvalho Santos', email: `gabriel.santos@${emailDomain}`, phone: '(71) 98735-4261' },
  { name: 'Helena Oliveira Barros', email: `helena.barros@${emailDomain}`, phone: '(81) 99407-2158' },
  { name: 'Isabela Mendes Azevedo', email: `isabela.azevedo@${emailDomain}`, phone: '(19) 99752-6384' },
  { name: 'João Pedro Moreira', email: `joao.moreira@${emailDomain}`, phone: '(27) 99841-5076' },
  { name: 'Larissa Teixeira Campos', email: `larissa.campos@${emailDomain}`, phone: '(48) 99176-3045' },
  { name: 'Marcelo Vieira Duarte', email: `marcelo.duarte@${emailDomain}`, phone: '(85) 99368-1427' },
].map((user, index) => ({ ...user, index: index + 1 }));

const validationCourseTitles = [
  'Fundamentos do Day Trade',
  'Leitura de Mercado e Price Action',
  'Gestão de Risco na Prática',
];
const legacyDemoCourses = [
  {
    title: '[Demonstração] Fundamentos do Day Trade',
    module: 'Primeiros passos',
    moduleDescription: 'Conteúdo demonstrativo para validação do ambiente.',
    lessons: [
      { title: 'Conhecendo o mercado', description: 'Uma aula de exemplo para validar o acesso ao curso.', body: 'Este conteúdo é fictício e foi criado pelo seed de demonstração do TraderLab.' },
      { title: 'Preparando a rotina', description: 'Uma segunda aula de exemplo.', body: 'Use esta aula apenas para validar a navegação e o registro de progresso.' },
    ],
  },
  {
    title: '[Demonstração] Leitura de Mercado',
    module: 'Contexto e estrutura',
    moduleDescription: 'Conteúdo demonstrativo para validação do ambiente.',
    lessons: [
      { title: 'Observando o contexto', description: 'Uma aula de exemplo para validar o acesso ao curso.', body: 'Este conteúdo é fictício e foi criado pelo seed de demonstração do TraderLab.' },
      { title: 'Identificando regiões', description: 'Uma segunda aula de exemplo.', body: 'Use esta aula apenas para validar a navegação e o registro de progresso.' },
    ],
  },
  {
    title: '[Demonstração] Gestão de Risco',
    module: 'Planejamento e limites',
    moduleDescription: 'Conteúdo demonstrativo para validação do ambiente.',
    lessons: [
      { title: 'Definindo limites', description: 'Uma aula de exemplo para validar o acesso ao curso.', body: 'Este conteúdo é fictício e foi criado pelo seed de demonstração do TraderLab.' },
      { title: 'Revisando as operações', description: 'Uma segunda aula de exemplo.', body: 'Use esta aula apenas para validar a navegação e o registro de progresso.' },
    ],
  },
];
const legacyCourseDescription = 'Curso de demonstração para validar listagens, matrículas e acesso.';

const enrollmentMatrix = [
  [], [], [],
  [0], [1], [2],
  [0, 1], [0, 2], [1, 2],
  [0, 1, 2], [0, 1, 2], [0, 1, 2],
];

function isApplyRequested() {
  const args = new Set(process.argv.slice(2));
  for (const argument of args) {
    if (argument !== '--apply' && argument !== '--target' && argument !== 'development') {
      throw new Error(`Argumento não reconhecido: ${argument}`);
    }
  }
  const apply = args.has('--apply');
  const targetDevelopment = args.has('--target') && args.has('development');
  if (apply !== targetDevelopment) {
    throw new Error('Para gravar, informe os dois argumentos: --apply --target development.');
  }
  return apply;
}

function requireEnvironment() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseSecret =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  const databaseUrl = process.env.DIRECT_URL;
  if (!supabaseUrl || !supabaseSecret || !databaseUrl) {
    throw new Error('SUPABASE_URL, uma chave secreta Supabase e DIRECT_URL são necessários.');
  }
  return { supabaseUrl, supabaseSecret, databaseUrl };
}

async function listAuthUsers(adminClient) {
  const result = new Map();
  for (let page = 1; ; page += 1) {
    const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    for (const user of data.users) {
      if (user.email) result.set(user.email.toLowerCase(), user);
    }
    if (data.users.length < 1000) return result;
  }
}

async function ensureAuthIdentities(adminClient, authUsers, createdIdentities, modifiedIdentities) {
  const credentials = [];
  const identities = [];
  const seededByIndex = new Map();
  for (const user of authUsers.values()) {
    if (user.user_metadata?.traderlab_demo_seed !== seedMarker) continue;
    const legacyIndex = user.email?.match(/^demo\.aluno\.(\d{2})@example\.test$/)?.[1];
    const index = Number(user.user_metadata.traderlab_demo_seed_index ?? legacyIndex);
    if (Number.isInteger(index) && index >= 1 && index <= users.length) {
      if (seededByIndex.has(index)) throw new Error(`Há mais de uma identidade marcada para o aluno ${index}.`);
      seededByIndex.set(index, user);
    }
  }

  for (const profile of users) {
    const existing = authUsers.get(profile.email) ?? seededByIndex.get(profile.index);
    if (existing) {
      if (
        existing.user_metadata?.traderlab_demo_seed !== seedMarker ||
        (existing.user_metadata?.traderlab_demo_seed_index !== undefined &&
          Number(existing.user_metadata.traderlab_demo_seed_index) !== profile.index)
      ) {
        throw new Error(`O e-mail reservado ${profile.email} já existe sem o marcador de demonstração.`);
      }
      modifiedIdentities.push({
        id: existing.id,
        email: existing.email,
        emailConfirmed: Boolean(existing.email_confirmed_at),
        userMetadata: existing.user_metadata,
      });
      const { data, error } = await adminClient.auth.admin.updateUserById(existing.id, {
        email: profile.email,
        email_confirm: true,
        user_metadata: {
          ...existing.user_metadata,
          name: profile.name,
          phone: profile.phone,
          traderlab_demo_seed: seedMarker,
          traderlab_demo_seed_index: profile.index,
        },
      });
      if (error || !data.user) throw error ?? new Error(`Não foi possível atualizar ${profile.email}.`);
      authUsers.delete(existing.email?.toLowerCase() ?? '');
      authUsers.set(profile.email, data.user);
      seededByIndex.set(profile.index, data.user);
      identities.push({ ...profile, id: data.user.id, isNew: false });
      continue;
    }

    const password = randomBytes(24).toString('base64url');
    const { data, error } = await adminClient.auth.admin.createUser({
      email: profile.email,
      password,
      email_confirm: true,
      user_metadata: {
        name: profile.name,
        phone: profile.phone,
        traderlab_demo_seed: seedMarker,
        traderlab_demo_seed_index: profile.index,
      },
    });
    if (error || !data.user) {
      throw error ?? new Error(`Não foi possível criar ${profile.email}.`);
    }
    createdIdentities.push(data.user.id);
    authUsers.set(profile.email, data.user);
    identities.push({ ...profile, id: data.user.id, isNew: true });
    credentials.push({ email: profile.email, password });
  }
  return { identities, credentials };
}

async function getAdministratorId(database) {
  const result = await database.query(
    `SELECT id FROM user_profiles WHERE role = 'ADMINISTRATOR' ORDER BY created_at, id LIMIT 1`,
  );
  if (result.rowCount !== 1) {
    throw new Error('Não há perfil administrador para atribuir a criação dos cursos demonstrativos.');
  }
  return result.rows[0].id;
}

async function ensureProfile(database, identity) {
  const existing = await database.query(
    'SELECT name, email, phone, role::text AS role FROM user_profiles WHERE id = $1',
    [identity.id],
  );
  if (existing.rowCount) {
    const profile = existing.rows[0];
    if (profile.role !== 'STUDENT') {
      throw new Error(`O perfil ligado a ${identity.email} existe com dados divergentes; nada foi sobrescrito.`);
    }
    if (profile.name !== identity.name || profile.email !== identity.email || profile.phone !== identity.phone) {
      await database.query(
        `UPDATE user_profiles SET name = $2, email = $3, phone = $4, updated_at = NOW()
         WHERE id = $1 AND role = 'STUDENT'`,
        [identity.id, identity.name, identity.email, identity.phone],
      );
    }
    return;
  }
  await database.query(
    `INSERT INTO user_profiles (id, name, email, phone, role, created_at, updated_at)
     VALUES ($1, $2, $3, $4, 'STUDENT', NOW(), NOW())`,
    [identity.id, identity.name, identity.email, identity.phone],
  );
}

async function getValidationCourseIds(database) {
  const result = await database.query(
    `SELECT id, title, status::text AS status FROM courses WHERE title = ANY($1::text[])`,
    [validationCourseTitles],
  );
  const coursesByTitle = new Map(result.rows.map((course) => [course.title, course]));
  for (const title of validationCourseTitles) {
    const course = coursesByTitle.get(title);
    if (!course || course.status !== 'PUBLISHED') {
      throw new Error(`O curso de validação publicado “${title}” não foi encontrado.`);
    }
  }
  if (result.rowCount !== validationCourseTitles.length) {
    throw new Error('Há títulos duplicados nos cursos de validação; nada foi alterado.');
  }
  return validationCourseTitles.map((title) => coursesByTitle.get(title).id);
}

async function removeSeededDemoCourses(database, administratorId, studentIds) {
  let removed = 0;
  for (const seededCourse of legacyDemoCourses) {
    const result = await database.query(
      `SELECT id, created_by_id, description, status::text AS status, cover_image_path, cover_image_url
       FROM courses WHERE title = $1`,
      [seededCourse.title],
    );
    if (result.rowCount === 0) continue;
    if (result.rowCount !== 1) throw new Error(`Há cursos duplicados com o título ${seededCourse.title}.`);
    const course = result.rows[0];
    if (
      course.created_by_id !== administratorId ||
      course.description !== legacyCourseDescription ||
      course.status !== 'PUBLISHED'
    ) {
      throw new Error(`O curso ${seededCourse.title} não corresponde ao seed original; ele foi preservado.`);
    }
    if (course.cover_image_path || course.cover_image_url) {
      throw new Error(`O curso ${seededCourse.title} tem uma capa e será preservado.`);
    }

    const contents = await database.query(
      `SELECT module.id AS module_id, module.title AS module_title,
              module.description AS module_description, module.image_path AS module_image,
              content.title AS lesson_title, content.description AS lesson_description,
              content.body AS lesson_body, content.kind::text AS lesson_kind,
              content.status::text AS lesson_status, content.image_path AS lesson_image,
              (SELECT count(*)::int FROM course_materials material WHERE material.content_id = content.id) AS materials
       FROM course_modules module
       LEFT JOIN course_contents content ON content.module_id = module.id
       WHERE module.course_id = $1
       ORDER BY content.position, content.id`,
      [course.id],
    );
    const moduleRows = new Map(contents.rows.map((row) => [row.module_id, row]));
    const actualLessons = contents.rows.filter((row) => row.lesson_title);
    if (
      moduleRows.size !== 1 ||
      contents.rows[0]?.module_title !== seededCourse.module ||
      contents.rows[0]?.module_description !== seededCourse.moduleDescription ||
      contents.rows[0]?.module_image ||
      actualLessons.length !== seededCourse.lessons.length ||
      seededCourse.lessons.some((expected) => {
        const actual = actualLessons.find((lesson) => lesson.lesson_title === expected.title);
        return !actual ||
          actual.lesson_description !== expected.description ||
          actual.lesson_body !== expected.body ||
          actual.lesson_kind !== 'LESSON' ||
          actual.lesson_status !== 'PUBLISHED' ||
          actual.lesson_image ||
          actual.materials > 0;
      })
    ) {
      throw new Error(`O conteúdo de ${seededCourse.title} foi alterado e será preservado.`);
    }

    const dependentData = await database.query(
      `SELECT
         (SELECT count(*)::int FROM notifications WHERE course_id = $1) AS notifications,
         (SELECT count(*)::int FROM content_progress progress
          JOIN course_contents content ON content.id = progress.content_id
          JOIN course_modules module ON module.id = content.module_id
          WHERE module.course_id = $1) AS progress,
         (SELECT count(*)::int FROM enrollments WHERE course_id = $1) AS all_enrollments,
         (SELECT count(*)::int FROM enrollments
          WHERE course_id = $1 AND student_id = ANY($2::uuid[])) AS seeded_enrollments`,
      [course.id, studentIds],
    );
    const dependencies = dependentData.rows[0];
    if (
      dependencies.notifications > 0 ||
      dependencies.progress > 0 ||
      dependencies.all_enrollments !== dependencies.seeded_enrollments
    ) {
      throw new Error(`O curso ${seededCourse.title} tem dados associados além do seed e será preservado.`);
    }

    await database.query('DELETE FROM courses WHERE id = $1', [course.id]);
    removed += 1;
  }
  return removed;
}

async function ensureEnrollment(database, identity, courseId, now) {
  await database.query(
    `INSERT INTO enrollments (student_id, course_id, source, status, granted_at, created_at, updated_at)
     VALUES ($1, $2, 'MANUAL', 'ACTIVE', $3, $3, $3)
     ON CONFLICT (student_id, course_id) DO NOTHING`,
    [identity.id, courseId, now],
  );
  const result = await database.query(
    `SELECT source::text AS source, status::text AS status
     FROM enrollments WHERE student_id = $1 AND course_id = $2`,
    [identity.id, courseId],
  );
  if (result.rows[0]?.source !== 'MANUAL' || result.rows[0]?.status !== 'ACTIVE') {
    throw new Error(`A matrícula de demonstração de ${identity.email} existe com dados divergentes.`);
  }
}

async function run() {
  const apply = isApplyRequested();
  if (!apply) {
    console.log('Simulação: atualizar 12 perfis fictícios, usar 3 cursos de validação existentes, manter 18 matrículas ativas e remover com verificações os 3 cursos duplicados do seed anterior.');
    console.log('Para gravar na base de desenvolvimento: pnpm --filter @traderlab/api db:seed:demo -- --apply --target development');
    return;
  }

  const { supabaseUrl, supabaseSecret, databaseUrl } = requireEnvironment();
  const authAdmin = createClient(supabaseUrl, supabaseSecret, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const database = new Client({ connectionString: databaseUrl });
  const createdIdentities = [];
  const modifiedIdentities = [];
  let transactionOpen = false;
  let databaseCommitted = false;

  try {
    const authUsers = await listAuthUsers(authAdmin);
    const { identities, credentials } = await ensureAuthIdentities(
      authAdmin,
      authUsers,
      createdIdentities,
      modifiedIdentities,
    );
    await database.connect();
    await database.query('BEGIN');
    transactionOpen = true;
    const administratorId = await getAdministratorId(database);
    for (const identity of identities) await ensureProfile(database, identity);
    const courseIds = await getValidationCourseIds(database);
    const now = new Date();
    for (const [index, identity] of identities.entries()) {
      for (const courseIndex of enrollmentMatrix[index]) {
        await ensureEnrollment(database, identity, courseIds[courseIndex], now);
      }
    }
    const removedCourses = await removeSeededDemoCourses(
      database,
      administratorId,
      identities.map(({ id }) => id),
    );

    const verification = await database.query(
      `SELECT count(DISTINCT profile.id)::int AS users,
              count(DISTINCT course.id)::int AS courses,
              count(enrollment.id)::int AS enrollments
       FROM user_profiles AS profile
       CROSS JOIN courses AS course
       LEFT JOIN enrollments AS enrollment
         ON enrollment.student_id = profile.id
        AND enrollment.course_id = course.id
        AND enrollment.status = 'ACTIVE'
       WHERE profile.email = ANY($1::text[])
         AND course.id = ANY($2::int[])`,
      [identities.map(({ email }) => email), courseIds],
    );
    const distribution = await database.query(
      `SELECT active_courses, count(*)::int AS students
       FROM (
         SELECT profile.id, count(enrollment.id)::int AS active_courses
         FROM user_profiles AS profile
         LEFT JOIN enrollments AS enrollment
           ON enrollment.student_id = profile.id
          AND enrollment.course_id = ANY($2::int[])
          AND enrollment.status = 'ACTIVE'
         WHERE profile.email = ANY($1::text[])
         GROUP BY profile.id
       ) AS per_student
       GROUP BY active_courses
       ORDER BY active_courses`,
      [identities.map(({ email }) => email), courseIds],
    );
    const expectedDistribution = ['0:3', '1:3', '2:3', '3:3'];
    const actualDistribution = distribution.rows.map(({ active_courses, students }) => `${active_courses}:${students}`);
    if (actualDistribution.join(',') !== expectedDistribution.join(',')) {
      throw new Error(`A distribuição das matrículas divergiu do esperado: ${actualDistribution.join(', ')}.`);
    }
    await database.query('COMMIT');
    transactionOpen = false;
    databaseCommitted = true;

    console.log(`Concluído: ${verification.rows[0].users} usuários, ${verification.rows[0].courses} cursos de validação reutilizados e ${verification.rows[0].enrollments} matrículas ativas.`);
    console.log(`${removedCourses} curso(s) duplicado(s) com tag foram removidos sem dependências externas ao seed.`);
    console.log(`Matrículas ativas por usuário: ${actualDistribution.map((value) => {
      const [coursesPerStudent, studentCount] = value.split(':');
      return `${coursesPerStudent} curso(s) = ${studentCount} aluno(s)`;
    }).join('; ')}.`);
    if (credentials.length) {
      console.log('Credenciais geradas nesta execução (as senhas não serão exibidas novamente):');
      for (const credential of credentials) {
        console.log(`${credential.email}\t${credential.password}`);
      }
    }
    console.log('As contas usam e-mails reservados example.test; nenhum e-mail foi enviado.');
  } catch (error) {
    if (transactionOpen) await database.query('ROLLBACK').catch(() => undefined);
    if (!databaseCommitted) {
      for (const identity of modifiedIdentities.reverse()) {
        await authAdmin.auth.admin.updateUserById(identity.id, {
          email: identity.email,
          email_confirm: identity.emailConfirmed,
          user_metadata: identity.userMetadata,
        }).catch(() => undefined);
      }
      for (const userId of createdIdentities) {
        await authAdmin.auth.admin.deleteUser(userId).catch(() => undefined);
      }
    }
    throw error;
  } finally {
    if (database) await database.end().catch(() => undefined);
  }
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
