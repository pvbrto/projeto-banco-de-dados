import pgp from "pg-promise";

const connection = pgp()(`postgres://user:password@localhost:5432/universidade`);

async function create (query) {
    try {
        await connection.query(query)
    } catch (err) {
        console.log(err)
    }
}

// Criar tabela DEPARTAMENTO
await create(`CREATE TABLE departamento (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL
);`);

// Criar tabela PROFESSOR
await create(`CREATE TABLE professor (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    departamento_id INTEGER REFERENCES departamento (id)
);`);

// Criar tabela CHEFE_DEPARTAMENTO para relacionar PROFESSORES chefes de departamentos
await create(`CREATE TABLE chefe_departamento (
    departamento_id INTEGER REFERENCES departamento (id),
    chefe_id INTEGER REFERENCES professor (id)
);`);

// Criar tabela CURSO
await create(`CREATE TABLE curso (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    departamento_id INTEGER REFERENCES departamento (id)
);`);

// Criar tabela DISCIPLINA
await create(`CREATE TABLE disciplina (
    id SERIAL PRIMARY KEY,
    codigo TEXT NOT NULL,
    nome TEXT NOT NULL,
    departamento_id INTEGER REFERENCES departamento (id),
    professor_id INTEGER REFERENCES professor (id)
);`);

// Criar tabela MATRIZ_CURRICULAR para relacionar disciplinas de cursos
await create(`CREATE TABLE matriz_curricular (
    curso_id INTEGER REFERENCES curso (id),
    disciplina_id INTEGER REFERENCES disciplina (id),
    semestre INTEGER NOT NULL
);`);

// Criar tabela ALUNO
await create(`CREATE TABLE aluno (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    RA TEXT NOT NULL,
    curso_id INTEGER REFERENCES curso (id),
    semestre INTEGER NOT NULL
);`);

// Criar tabela HISTORICO_ALUNO para relacionar alunos com disciplinas
await create(`CREATE TABLE historico_aluno (
    aluno_id INTEGER REFERENCES aluno (id),
    disciplina_id INTEGER REFERENCES disciplina (id),
    semestre INTEGER NOT NULL,
    ano INTEGER NOT NULL,
    nota REAL NOT NULL
);`);

// Criar tabela TCC
await create(`CREATE TABLE tcc (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    orientador_id INTEGER REFERENCES professor (id)
);`);

// Criar tabela ALUNO_TCC para relacionar alunos com seus TCCs
await create(`CREATE TABLE aluno_tcc (
    aluno_id INTEGER REFERENCES aluno (id),
    tcc_id INTEGER REFERENCES tcc (id)
);`);

await connection.$pool.end();