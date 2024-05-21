CREATE TABLE departamento (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL
);

CREATE TABLE professor (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    departamento_id INTEGER REFERENCES departamento (id)
);

CREATE TABLE chefe_departamento (
    departamento_id INTEGER REFERENCES departamento (id),
    chefe_id INTEGER REFERENCES professor (id)
);

CREATE TABLE curso (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    departamento_id INTEGER REFERENCES departamento (id)
);

CREATE TABLE disciplina (
    id SERIAL PRIMARY KEY,
    codigo TEXT NOT NULL,
    nome TEXT NOT NULL,
    departamento_id INTEGER REFERENCES departamento (id),
    professor_id INTEGER REFERENCES professor (id)
);

CREATE TABLE matriz_curricular (
    curso_id INTEGER REFERENCES curso (id),
    disciplina_id INTEGER REFERENCES disciplina (id),
    semestre INTEGER NOT NULL
);

CREATE TABLE aluno (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    RA TEXT NOT NULL,
    curso_id INTEGER REFERENCES curso (id),
    semestre INTEGER NOT NULL
);

CREATE TABLE historico_aluno (
    aluno_id INTEGER REFERENCES aluno (id),
    disciplina_id INTEGER REFERENCES disciplina (id),
    semestre INTEGER NOT NULL,
    ano INTEGER NOT NULL,
    nota REAL NOT NULL
);

CREATE TABLE tcc (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    orientador_id INTEGER REFERENCES professor (id)
);

CREATE TABLE aluno_tcc (
    aluno_id INTEGER REFERENCES aluno (id),
    tcc_id INTEGER REFERENCES tcc (id)
);