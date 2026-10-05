import pg from 'pg';

const { Client } = pg;
const testerEmail = 'victorsilvestre@gmail.com';
const db = new Client({ connectionString: process.env.DIRECT_URL });

const examples = [
  {
    title: 'Fundamentos do Day Trade',
    description:
      'Conheça a rotina do day trader, os principais conceitos do mercado e como se preparar antes de operar.',
    modules: [
      {
        title: 'Primeiros passos no mercado',
        description: 'Conceitos essenciais para começar com clareza.',
        contents: [
          {
            title: 'Como funciona o mercado futuro',
            description: 'Uma visão geral dos contratos e participantes.',
            body: 'O mercado futuro permite negociar contratos padronizados com vencimento. Antes de operar, entenda o ativo, o tamanho do contrato, os horários de negociação e os custos envolvidos. Use esta aula como ponto de partida para estudar o ambiente em que suas ordens serão executadas.',
          },
          {
            title: 'Preparação antes do pregão',
            description: 'Monte uma rotina simples de preparação.',
            body: 'Antes do pregão, confira sua conexão, a plataforma e o calendário econômico. Defina os cenários que pretende acompanhar e escreva os limites de risco do dia. Se as condições planejadas não aparecerem, ficar de fora também é uma decisão válida.',
          },
        ],
      },
      {
        title: 'Plataforma e ordens',
        description: 'Entenda os elementos básicos da execução.',
        contents: [
          {
            title: 'Tipos de ordem',
            description: 'Diferenças entre ordens a mercado e limitadas.',
            body: 'Ordens a mercado priorizam a execução disponível; ordens limitadas definem um preço máximo de compra ou mínimo de venda, sem garantir execução. Treine em ambiente simulado e confirme quantidade, ativo e direção antes de enviar qualquer ordem.',
          },
        ],
      },
    ],
  },
  {
    title: 'Leitura de Mercado e Price Action',
    description:
      'Aprenda a observar contexto, estrutura de preços e regiões importantes sem depender de sinais isolados.',
    modules: [
      {
        title: 'Contexto e estrutura',
        description: 'Organize a leitura do gráfico antes de pensar em entradas.',
        contents: [
          {
            title: 'Tendência, consolidação e contexto',
            description: 'Identifique a condição atual do mercado.',
            body: 'Observe a sequência de topos e fundos e compare a movimentação recente com um período maior. Uma tendência pode perder força e uma consolidação pode se expandir; nenhuma leitura elimina a incerteza. Registre o contexto e quais fatos fariam você mudar de ideia.',
          },
          {
            title: 'Regiões de suporte e resistência',
            description: 'Marque zonas de interesse sem tratá-las como certezas.',
            body: 'Suportes e resistências são regiões em que o preço já encontrou interesse comprador ou vendedor. Marque faixas coerentes com o contexto e observe a reação quando o preço se aproxima. Uma região pode ser rompida; planeje também essa possibilidade.',
          },
        ],
      },
      {
        title: 'Leitura durante o pregão',
        description: 'Acompanhe a mudança do cenário e registre suas observações.',
        contents: [
          {
            title: 'Leitura de candles e volatilidade',
            description: 'Relacione o movimento do candle ao contexto.',
            body: 'Um candle representa a variação do preço em um intervalo, mas não explica sozinho quem está no controle. Compare corpo, sombras, volume disponível e localização no gráfico. Em momentos de maior volatilidade, reduza a velocidade da decisão e confira seu limite de risco.',
          },
        ],
      },
    ],
  },
  {
    title: 'Gestão de Risco para Traders',
    description:
      'Estruture limites operacionais, dimensionamento de posição e revisão de resultados para proteger seu capital.',
    modules: [
      {
        title: 'Limites e planejamento',
        description: 'Transforme risco em regras claras antes de operar.',
        contents: [
          {
            title: 'Defina seu limite de perda',
            description: 'Estabeleça limites diários e por operação.',
            body: 'Determine previamente quanto aceita arriscar por operação e no conjunto do dia, considerando sua realidade financeira. Ao atingir o limite, encerre as operações e faça a revisão depois. Limites não garantem resultado, mas ajudam a impedir que uma sequência emocional aumente a exposição.',
          },
          {
            title: 'Dimensionamento de posição',
            description: 'Relacione quantidade, distância de stop e risco máximo.',
            body: 'O tamanho da posição deve ser compatível com a distância entre entrada e ponto de invalidação e com o valor máximo que você decidiu arriscar. Se o cálculo exigir uma posição acima do seu limite, reduza a quantidade ou não opere. Confira também custos e possíveis diferenças de execução.',
          },
        ],
      },
      {
        title: 'Registro e revisão',
        description: 'Use o histórico para aprender sem alterar regras no impulso.',
        contents: [
          {
            title: 'Diário de operações',
            description: 'Registre contexto, plano e execução.',
            body: 'Anote o cenário observado, a regra que justificou a operação, o risco planejado e o que aconteceu na execução. Separe a qualidade da decisão do resultado isolado. Revise grupos de operações em vez de mudar seu método por causa de um único trade.',
          },
        ],
      },
    ],
  },
];

async function upsertCourse(studentId, course) {
  const now = new Date();
  const existing = await db.query('SELECT id FROM courses WHERE title = $1 LIMIT 1', [course.title]);
  if (existing.rowCount) {
    const id = existing.rows[0].id;
    await db.query(
      `UPDATE courses SET created_by_id = $2, description = $3, status = 'PUBLISHED',
       published_at = $4, updated_at = $4 WHERE id = $1`,
      [id, studentId, course.description, now],
    );
    return id;
  }

  const inserted = await db.query(
    `INSERT INTO courses (created_by_id, title, description, status, published_at, created_at, updated_at)
     VALUES ($1, $2, $3, 'PUBLISHED', $4, $4, $4) RETURNING id`,
    [studentId, course.title, course.description, now],
  );
  return inserted.rows[0].id;
}

async function upsertModule(courseId, module, position, now) {
  const existing = await db.query(
    'SELECT id FROM course_modules WHERE course_id = $1 AND title = $2 LIMIT 1',
    [courseId, module.title],
  );
  if (existing.rowCount) {
    const id = existing.rows[0].id;
    await db.query(
      `UPDATE course_modules SET description = $2, position = $3, status = 'PUBLISHED', updated_at = $4
       WHERE id = $1`,
      [id, module.description, position, now],
    );
    return id;
  }

  const inserted = await db.query(
    `INSERT INTO course_modules (course_id, title, description, position, status, created_at, updated_at)
     VALUES ($1, $2, $3, $4, 'PUBLISHED', $5, $5) RETURNING id`,
    [courseId, module.title, module.description, position, now],
  );
  return inserted.rows[0].id;
}

async function upsertContent(moduleId, content, position, now) {
  const existing = await db.query(
    'SELECT id FROM course_contents WHERE module_id = $1 AND title = $2 LIMIT 1',
    [moduleId, content.title],
  );
  if (existing.rowCount) {
    await db.query(
      `UPDATE course_contents SET description = $2, kind = 'LESSON', body = $3, position = $4,
       status = 'PUBLISHED', published_at = $5, updated_at = $5 WHERE id = $1`,
      [existing.rows[0].id, content.description, content.body, position, now],
    );
    return;
  }

  await db.query(
    `INSERT INTO course_contents (module_id, title, description, kind, body, position, status, published_at, created_at, updated_at)
     VALUES ($1, $2, $3, 'LESSON', $4, $5, 'PUBLISHED', $6, $6, $6)`,
    [moduleId, content.title, content.description, content.body, position, now],
  );
}

async function upsertCourseContentAndEnrollment(studentId, course) {
  const now = new Date();
  const courseId = await upsertCourse(studentId, course);

  for (const [modulePosition, module] of course.modules.entries()) {
    const moduleId = await upsertModule(courseId, module, modulePosition, now);

    for (const [contentPosition, content] of module.contents.entries()) {
      await upsertContent(moduleId, content, contentPosition, now);
    }
  }

  await db.query(
    `INSERT INTO enrollments (student_id, course_id, source, status, granted_at, created_at, updated_at)
     VALUES ($1, $2, 'MANUAL', 'ACTIVE', $3, $3, $3)
     ON CONFLICT (student_id, course_id) DO UPDATE SET source = 'MANUAL', status = 'ACTIVE', updated_at = EXCLUDED.updated_at`,
    [studentId, courseId, now],
  );
}

try {
  await db.connect();
  await db.query('BEGIN');

  const result = await db.query(
    `SELECT p.id, p.role
     FROM auth.users AS u
     JOIN public.user_profiles AS p ON p.id = u.id
     WHERE lower(u.email) = lower($1)
     LIMIT 1`,
    [testerEmail],
  );
  if (result.rowCount !== 1 || result.rows[0].role !== 'STUDENT') {
    throw new Error(`The student profile for ${testerEmail} was not found.`);
  }

  for (const course of examples) {
    await upsertCourseContentAndEnrollment(result.rows[0].id, course);
  }
  await db.query('COMMIT');
  console.log(`Seeded ${examples.length} published courses and active enrollments for ${testerEmail}.`);
} catch (error) {
  await db.query('ROLLBACK').catch(() => undefined);
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await db.end();
}
