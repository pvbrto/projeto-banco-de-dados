# Projeto Banco de Dados - FEI

Este projeto cria e popula um banco de dados de uma universidade utilizando PostgreSQL. O banco de dados contém tabelas para departamentos, professores, cursos, disciplinas, alunos, histórico de alunos, TCCs e a associação de alunos aos TCCs.

## Pré-requisitos

- Docker
- Docker Compose
- Node.js (versão 14 ou superior)
- npm (versão 6 ou superior)

## Instruções para Configuração e Execução

### 1. Clonar o Repositório

Primeiro, clone este repositório para sua máquina local:

```sh
git clone https://github.com/pvbrto/projeto-banco-de-dados.git
cd projeto-banco-de-dados
```
## 2. Configurar o Docker

Certifique-se de que o Docker e o Docker Compose estejam instalados e configurados corretamente em sua máquina.

## 3. Executar o Docker Compose

Para iniciar os serviços do banco de dados PostgreSQL, execute o seguinte comando:

```sh
docker-compose up -d
```

Este comando irá:

- Baixar a imagem do PostgreSQL
- Iniciar um contêiner PostgreSQL com as configurações especificadas no arquivo docker-compose.yml

## 4. Instalar Dependências do Node.js

Instale as dependências do projeto Node.js:

```sh
npm install
```

## 5. Executar o Script de População do Banco de Dados

Após o contêiner do PostgreSQL estar em execução e as dependências instaladas, execute o script para criar e popular o banco de dados:

```sh
npm run exec
```

Este comando irá:

- Conectar ao banco de dados PostgreSQL
- Criar as tabelas necessárias
- Popular as tabelas com dados fictícios

## Consultas de Demonstração

O script npm run exec também executa várias consultas de exemplo para demonstrar o funcionamento do banco de dados. As consultas incluem:

- Histórico de alunos
- Histórico de disciplinas por professor
- Lista de alunos formados
- Lista de professores chefes de departamento
- Alunos e TCCs

## Resetar Dados do Banco

Quando o script é executado, cria as tabelasm, popula os dados e apresenta as consultas. Caso o script seja executado novamente, a base de dados não irá mudar, para observar valores diferentes realize:

```sh
docker-compose down
```
novamente:

```sh
docker-compose up -d
```
e por fim:

```sh
npm run exec
```
  
## Estrutura do Projeto
- docker-compose.yml: Arquivo de configuração do Docker Compose para o PostgreSQL.
- index.js: Script principal para criação, população e consulta do banco de dados.
- package.json: Arquivo de configuração do npm com dependências e scripts.

## Problemas Comuns
- Certifique-se de que o contêiner do PostgreSQL está em execução antes de executar npm run exec.
- Verifique se as portas necessárias estão livres (5432 para PostgreSQL por padrão).
- Verifique as configurações de conexão no arquivo index.js para garantir que correspondem às configurações do contêiner PostgreSQL.

## Diagrama MER

![DiagramaCompleto](/Images/DiagramaCompleto.jpg)
![MER Aluno](/Images/MER_Aluno.jpg)
![MER Curso](/Images/MER_Curso.jpg.jpg)
![MER Departamento](/Images/MER_Departamento.jpg.jpg)
![MER Disciplina](/Images/MER_Disciplina.jpg.jpg)
![MER Professor](/Images/MER_Professor.jpg)
![MER TCC](/Images/MER_TCC.jpg)


