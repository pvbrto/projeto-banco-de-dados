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

-- Query - Select 01
SELECT a.nome AS nome_aluno
    , a.ra AS ra_aluno
    , d.codigo AS codigo_disciplina
    , d.nome AS nome_disciplina
    , ha.semestre
    , ha.ano 
    , ha.nota
FROM historico_aluno ha 
INNER JOIN disciplina d 
    ON d.id = ha.disciplina_id 
INNER JOIN aluno a 
    ON a.id = ha.aluno_id 
ORDER BY a.id, ha.semestre;

-- Query - Select 02
SELECT DISTINCT d.codigo AS codigo_disciplina
    , d.nome AS nome_disciplina
    , p.nome AS nome_professor
    , ha.semestre 
    , ha.ano
FROM historico_aluno ha 
INNER JOIN disciplina d 
    ON d.id = ha.disciplina_id 
INNER JOIN professor p 
    ON p.id = d.professor_id 
ORDER BY ha.ano, ha.semestre;

-- Query - Select 03
WITH aluno_disciplinas AS (
    SELECT aluno_id, disciplina_id
    FROM historico_aluno
    WHERE nota >= 5
),
total_matriz_disciplinas AS (
    SELECT COUNT(*) AS total_disciplinas
    FROM matriz_curricular 
    GROUP BY curso_id
),
aluno_completou_disciplinas AS (
    SELECT aluno_id, COUNT(*) AS disciplinas_completadas
    FROM aluno_disciplinas
    WHERE disciplina_id IN (SELECT disciplina_id FROM matriz_curricular)
    GROUP BY aluno_id
)
SELECT DISTINCT a.id
    , a.nome AS nome_aluno
    , MAX(ha.ano) AS ano_formacao
FROM aluno a
INNER JOIN aluno_completou_disciplinas acd
    ON a.id = acd.aluno_id
INNER JOIN total_matriz_disciplinas tmd
    ON acd.disciplinas_completadas = tmd.total_disciplinas
INNER JOIN historico_aluno ha
ON ha.aluno_id = a.id
GROUP BY a.id
ORDER BY a.id;

-- Query - Select 04
SELECT p.id
    , p.nome AS nome_professor
    , d.id AS departamento_id
    , d.nome AS nome_departamento
FROM chefe_departamento cd
INNER JOIN professor p
    ON p.id = cd.chefe_id
INNER JOIN departamento d
    ON d.id = cd.departamento_id;

-- Query - Select 05
SELECT a.nome AS nome_aluno
    , a.ra AS ra_aluno
    , a.curso_id
    , a.semestre 
    , t.nome AS nome_tcc
    , p.nome AS orientador
FROM aluno_tcc at2
INNER JOIN aluno a
    ON a.id = at2.aluno_id
INNER JOIN tcc t
    ON t.id = at2.tcc_id
INNER JOIN professor p
    ON p.id = t.orientador_id;