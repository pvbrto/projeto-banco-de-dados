import pgp from "pg-promise";
import {
  geradorNome,
  geradorNomeFeminino,
  geradorNomeMasculino,
} from "gerador-nome";

const connection = pgp()(
  `postgres://user:password@localhost:5432/universidade`
);

async function create(query) {
  try {
    await connection.query(query);
  } catch (err) {
    console.log(err);
  }
}

async function tableExists(tableName) {
  const query = `
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
        );
    `;
  const result = await connection.one(query, [tableName]);
  return result.exists;
}

async function populateProfessor(departmentCount) {
  for (let i = 1; i <= departmentCount; i++) {
    const professorCount = await connection.one(
      `
            SELECT COUNT(*) FROM professor 
        `,
      [i]
    );

    if (parseInt(professorCount.count) < 6) {
      for (let j = 0; j < 3; j++) {
        await create(
          `INSERT INTO professor (nome, departamento_id) VALUES ('${geradorNome()}', ${i});`
        );
      }
    }
  }

  const professores = await connection.many(`
        SELECT id, nome, departamento_id FROM professor
    `);
  for (let i = 0; i < departmentCount; i++) {
    const professor = professores[i * 3 + Math.floor(Math.random() * 3)];
    await create(
      `INSERT INTO chefe_departamento (departamento_id, chefe_id) VALUES (${
        i + 1
      }, ${professor.id});`
    );
  }

  console.log("Populando tabela PROFESSOR com sucesso!");
}

async function populateCursos() {
  const cursos = [
    { nome: "Engenharia Elétrica", departamento_id: 1 },
    { nome: "Ciências da Computação", departamento_id: 2 },
  ];

  for (const curso of cursos) {
    await create(`
            INSERT INTO curso (nome, departamento_id) 
            VALUES ('${curso.nome}', ${curso.departamento_id});
        `);
  }

  console.log("Populando tabela CURSO com sucesso!");
}

async function populateDisciplinas() {
  const disciplinas = [
    {
      codigo: "EE101",
      nome: "Introdução à Engenharia Elétrica",
      departamento_id: 1,
      professor_id: 1,
    },
    {
      codigo: "EE102",
      nome: "Sistemas Digitais",
      departamento_id: 1,
      professor_id: 2,
    },
    {
      codigo: "EE103",
      nome: "Sistemas Embarcados",
      departamento_id: 1,
      professor_id: 3,
    },
    {
      codigo: "EE104",
      nome: "Sistemas Operacionais",
      departamento_id: 1,
      professor_id: 2,
    },
    {
      codigo: "EE105",
      nome: "Eletromagnetismo",
      departamento_id: 1,
      professor_id: 3,
    },
    {
      codigo: "CC101",
      nome: "Introdução à Ciência da Computação",
      departamento_id: 2,
      professor_id: 4,
    },
    {
      codigo: "CC102",
      nome: "Banco de Dados",
      departamento_id: 2,
      professor_id: 5,
    },
    {
      codigo: "CC103",
      nome: "Programação de Computadores",
      departamento_id: 2,
      professor_id: 6,
    },
    {
      codigo: "CC104",
      nome: "Estrutura de Dados",
      departamento_id: 2,
      professor_id: 5,
    },
    {
      codigo: "CC105",
      nome: "Programação Orientada a Objetos",
      departamento_id: 2,
      professor_id: 6,
    },
  ];
  for (const disciplina of disciplinas) {
    await create(`
            INSERT INTO disciplina (codigo, nome, departamento_id, professor_id) 
            VALUES ('${disciplina.codigo}', '${disciplina.nome}', ${disciplina.departamento_id}, ${disciplina.professor_id});
        `);
  }

  console.log("Populando tabela DISCIPLINA com sucesso!");
}

async function populateMatrizCurricular() {
  const matrizCurricular = [
    { curso_id: 1, disciplina_id: 1, semestre: 1 },
    { curso_id: 1, disciplina_id: 2, semestre: 2 },
    { curso_id: 1, disciplina_id: 3, semestre: 3 },
    { curso_id: 1, disciplina_id: 4, semestre: 4 },
    { curso_id: 1, disciplina_id: 5, semestre: 5 },
    { curso_id: 2, disciplina_id: 6, semestre: 1 },
    { curso_id: 2, disciplina_id: 7, semestre: 2 },
    { curso_id: 2, disciplina_id: 8, semestre: 3 },
    { curso_id: 2, disciplina_id: 9, semestre: 4 },
    { curso_id: 2, disciplina_id: 10, semestre: 5 },
  ];
  for (const mat of matrizCurricular) {
    await create(`
            INSERT INTO matriz_curricular (curso_id, disciplina_id, semestre)
            VALUES (${mat.curso_id}, ${mat.disciplina_id}, ${mat.semestre});
        `);
  }

  console.log("Populando tabela MATRIZ_CURRICULAR com sucesso!");
}

async function populateAlunos() {
  for (let i = 0; i < 20; i++) {
    const parte1 = "2" + Math.floor(Math.random() * 3 + 2);
    const parte2 = ("0000" + Math.floor(Math.random() * 10000)).slice(-4);
    const ra = parte1 + parte2;

    const curso = Math.floor(Math.random() * 2) + 1;
    const semestre = Math.floor(Math.random() * 5) + 1;
    await create(`
            INSERT INTO aluno (nome, RA, curso_id, semestre)
            VALUES ('${geradorNome()}', '${ra}', ${curso}, ${semestre});
        `);
  }
  console.log("Populando tabela ALUNO com sucesso!");
}

if (!(await tableExists("departamento"))) {
  await create(`CREATE TABLE departamento (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL
    );`);
}

if (!(await tableExists("professor"))) {
  await create(`CREATE TABLE professor (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL,
        departamento_id INTEGER REFERENCES departamento (id)
    );`);
}

if (!(await tableExists("chefe_departamento"))) {
  await create(`CREATE TABLE chefe_departamento (
        departamento_id INTEGER REFERENCES departamento (id),
        chefe_id INTEGER REFERENCES professor (id)
    );`);
}

if (!(await tableExists("curso"))) {
  await create(`CREATE TABLE curso (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL,
        departamento_id INTEGER REFERENCES departamento (id)
    );`);
}

if (!(await tableExists("disciplina"))) {
  await create(`CREATE TABLE disciplina (
        id SERIAL PRIMARY KEY,
        codigo TEXT NOT NULL,
        nome TEXT NOT NULL,
        departamento_id INTEGER REFERENCES departamento (id),
        professor_id INTEGER REFERENCES professor (id)
    );`);
}

if (!(await tableExists("matriz_curricular"))) {
  await create(`CREATE TABLE matriz_curricular (
        curso_id INTEGER REFERENCES curso (id),
        disciplina_id INTEGER REFERENCES disciplina (id),
        semestre INTEGER NOT NULL
    );`);
}

if (!(await tableExists("aluno"))) {
  await create(`CREATE TABLE aluno (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL,
        RA TEXT NOT NULL,
        curso_id INTEGER REFERENCES curso (id),
        semestre INTEGER NOT NULL
    );`);
}

if (!(await tableExists("historico_aluno"))) {
  await create(`CREATE TABLE historico_aluno (
        aluno_id INTEGER REFERENCES aluno (id),
        disciplina_id INTEGER REFERENCES disciplina (id),
        semestre INTEGER NOT NULL,
        ano INTEGER NOT NULL,
        nota REAL NOT NULL
    );`);
}

if (!(await tableExists("tcc"))) {
  await create(`CREATE TABLE tcc (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL,
        orientador_id INTEGER REFERENCES professor (id)
    );`);
}

if (!(await tableExists("aluno_tcc"))) {
  await create(`CREATE TABLE aluno_tcc (
        aluno_id INTEGER REFERENCES aluno (id),
        tcc_id INTEGER REFERENCES tcc (id)
    );`);
}

console.log("Tabelas criadas com sucesso!");

// Insert initial data into departamento
const departmentCount = await connection.one(`
    SELECT COUNT(*) FROM departamento;
`);

if (parseInt(departmentCount.count) === 0) {
  await create(`INSERT INTO departamento (nome) VALUES
    ('Engenharia Elétrica'),
    ('Ciências da Computação');`);
}

await populateProfessor(2);

await populateCursos();

await populateDisciplinas();

await populateMatrizCurricular();

await populateAlunos();

await connection.$pool.end();
