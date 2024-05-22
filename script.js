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

var tablesToPopulate = []


async function populateDepartamento() {
    const departmentCount = await connection.one(`
    SELECT COUNT(*) FROM departamento;
`);

if (parseInt(departmentCount.count) === 0) {
  await create(`INSERT INTO departamento (nome) VALUES
    ('Engenharia Elétrica'),
    ('Ciências da Computação');`);
}

console.log("Populando tabela DEPARTAMENTO com sucesso!");
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

async function populateHistoricoAluno() {
    // Pegue a quantidade de alunos existentes
    const alunos = await connection.many(`
          SELECT id, nome, RA, curso_id, semestre FROM aluno
      `);
  
    if (alunos.length === 0) {
      console.log("Não há alunos para processar.");
      return;
    }
  
    // Processa todos os alunos
    for (const aluno of alunos) {
      // Insere disciplinas de todos os semestres até o semestre atual do aluno
      for (let semestre = 1; semestre <= aluno.semestre; semestre++) {
        const disciplinas = await connection.many(`
                SELECT disciplina_id FROM matriz_curricular WHERE curso_id = ${aluno.curso_id} AND semestre = ${semestre}
            `);
        for (const disciplina of disciplinas) {
          const ano = 2022 + Math.floor((semestre - 1) / 2);
          const nota = (Math.random() * 10).toFixed(1); // Nota entre 0 e 10 com um decimal
          await create(`
                    INSERT INTO historico_aluno (aluno_id, disciplina_id, semestre, ano, nota)
                    VALUES (${aluno.id}, ${disciplina.disciplina_id}, ${semestre}, ${ano}, ${nota});
                `);
        }
      }
    }
  
    console.log("Populando tabela HISTORICO_ALUNO com sucesso!");
  }
  
  async function populateTCC() {
    const tccNames = {
      engenharia_eletrica: [
        "Otimização de Sistemas Elétricos de Potência",
        "Desenvolvimento de Fontes de Energia Renovável",
        "Automação de Processos Industriais"
      ],
      ciencia_computacao: [
        "Algoritmos de Aprendizado de Máquina",
        "Sistemas Distribuídos e Computação em Nuvem",
        "Segurança da Informação e Criptografia"
      ]
    };
  
    // Função para obter um nome aleatório de TCC
    function getRandomName(names) {
      const index = Math.floor(Math.random() * names.length);
      return names.splice(index, 1)[0];
    }
  
    // Inserindo TCCs do curso 1 (Engenharia Elétrica)
    let nomeTCC = getRandomName(tccNames.engenharia_eletrica);
    await create(`
      INSERT INTO tcc (nome, orientador_id)
      VALUES ('${nomeTCC}', ${Math.floor(Math.random() * 3 + 1)});
    `);
  
    // Inserindo TCCs do curso 2 (Ciência da Computação)
    for (let i = 0; i < 2; i++) {
      nomeTCC = getRandomName(tccNames.ciencia_computacao);
      await create(`
        INSERT INTO tcc (nome, orientador_id)
        VALUES ('${nomeTCC}', ${Math.floor(Math.random() * 3 + 4)});
      `);
    }
  
    console.log("TCCs inseridos com sucesso!");
  
  }

  async function populateAlunoTCC() {
  
    // Selecionar até 3 alunos do curso 1 (Engenharia Elétrica) que estejam no semestre 4 ou superior
    const alunosCurso1 = await connection.many(`
      SELECT id FROM aluno WHERE curso_id = 1 AND semestre >= 4 LIMIT 3
    `);
  
    // Selecionar até 6 alunos do curso 2 (Ciência da Computação) que estejam no semestre 4 ou superior
    const alunosCurso2 = await connection.many(`
      SELECT id FROM aluno WHERE curso_id = 2 AND semestre >= 4 LIMIT 6
    `);
  
    // Obter os IDs dos TCCs
    const tccs = await connection.many(`
      SELECT id FROM tcc
    `);
  
    // Verificar se há TCCs suficientes
    if (tccs.length < 3) {
      console.log("Não há TCCs suficientes para associar aos alunos.");
      return;
    }
  
    // Associar alunos do curso 1 ao primeiro TCC
    const tccCurso1 = tccs[0].id;
    for (const aluno of alunosCurso1) {
      await create(`
        INSERT INTO aluno_tcc (aluno_id, tcc_id)
        VALUES (${aluno.id}, ${tccCurso1})
      `);
    }
  
    // Associar alunos do curso 2 aos três últimos TCCs
    const tccCurso2_1 = tccs[1].id;
    const tccCurso2_2 = tccs[2].id;
  

  
    // Distribuir os alunos do curso 2 entre os TCCs
    const grupo1 = alunosCurso2.slice(0, 3);
    const grupo2 = alunosCurso2.slice(3, 6);
  
    for (const aluno of grupo1) {
      await create(`
        INSERT INTO aluno_tcc (aluno_id, tcc_id)
        VALUES (${aluno.id}, ${tccCurso2_1})
      `);
    }
  
    for (const aluno of grupo2) {
      await create(`
        INSERT INTO aluno_tcc (aluno_id, tcc_id)
        VALUES (${aluno.id}, ${tccCurso2_2})
      `);
    }
  
    console.log("Associação dos alunos aos TCCs feita com sucesso!");
  }
  
if (!(await tableExists("departamento"))) {
  await create(`CREATE TABLE departamento (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL
    );`);

    tablesToPopulate.push("departamento");
}

if (!(await tableExists("professor"))) {
  await create(`CREATE TABLE professor (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL,
        departamento_id INTEGER REFERENCES departamento (id)
    );`);

    tablesToPopulate.push("professor");
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

    tablesToPopulate.push("curso");
}

if (!(await tableExists("disciplina"))) {
  await create(`CREATE TABLE disciplina (
        id SERIAL PRIMARY KEY,
        codigo TEXT NOT NULL,
        nome TEXT NOT NULL,
        departamento_id INTEGER REFERENCES departamento (id),
        professor_id INTEGER REFERENCES professor (id)
    );`);

    tablesToPopulate.push("disciplina");
}

if (!(await tableExists("matriz_curricular"))) {
  await create(`CREATE TABLE matriz_curricular (
        curso_id INTEGER REFERENCES curso (id),
        disciplina_id INTEGER REFERENCES disciplina (id),
        semestre INTEGER NOT NULL
    );`);

    tablesToPopulate.push("matriz_curricular");
}

if (!(await tableExists("aluno"))) {
  await create(`CREATE TABLE aluno (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL,
        RA TEXT NOT NULL,
        curso_id INTEGER REFERENCES curso (id),
        semestre INTEGER NOT NULL
    );`);

    tablesToPopulate.push("aluno");
}

if (!(await tableExists("historico_aluno"))) {
  await create(`CREATE TABLE historico_aluno (
        aluno_id INTEGER REFERENCES aluno (id),
        disciplina_id INTEGER REFERENCES disciplina (id),
        semestre INTEGER NOT NULL,
        ano INTEGER NOT NULL,
        nota REAL NOT NULL
    );`);

    tablesToPopulate.push("historico_aluno");
}

if (!(await tableExists("tcc"))) {
  await create(`CREATE TABLE tcc (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL,
        orientador_id INTEGER REFERENCES professor (id)
    );`);

    tablesToPopulate.push("tcc");
}

if (!(await tableExists("aluno_tcc"))) {
  await create(`CREATE TABLE aluno_tcc (
        aluno_id INTEGER REFERENCES aluno (id),
        tcc_id INTEGER REFERENCES tcc (id)
    );`);

    tablesToPopulate.push("aluno_tcc");
}

console.log("Tabelas criadas com sucesso!");


// await populateDepartamento();

// await populateProfessor(2);

// await populateCursos();

// await populateDisciplinas();

// await populateMatrizCurricular();

// await populateAlunos();

// await populateHistoricoAluno();

// await populateTCC();

// await populateAlunoTCC();

for (const tableName of tablesToPopulate) {
    switch (tableName) {
      case "departamento":
        await populateDepartamento();
        break;
      case "professor":
        await populateProfessor(2);
        break;
      case "chefe_departamento":
        await populateChefeDepartamento();
        break;
      case "curso":
        await populateCursos();
        break;
      case "disciplina":
        await populateDisciplinas();
        break;
      case "matriz_curricular":
        await populateMatrizCurricular();
        break;
      case "aluno":
        await populateAlunos();
        break;
      case "historico_aluno":
        await populateHistoricoAluno();
        break;
      case "tcc":
        await populateTCC();
        break;
      case "aluno_tcc":
        await populateAlunoTCC();
        break;
      default:
        break;
    }
  }

await connection.$pool.end();
