# ExoApi Workbench — API REST de Projetos e Código .NET / SSMS

Uma bancada de desenvolvimento em Português para testar em tempo real no navegador a API `ExoApi` (CRUD completo em `/api/projetos` com banco pré-populado equivalente ao `cria-db.sql`) e exportar os arquivos completos em C# (.NET 6/7) e SQL Server (SSMS) prontos para entrega da atividade.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> As decisões abaixo foram confirmadas na etapa de alinhamento e orientam toda a construção da aplicação:

- **Formato da Solução**: Bancada interativa em Next.js com API REST executável no navegador, combinada com visualizador, cópia rápida e download dos arquivos C# (`.NET Web API`) e SQL (`cria-db.sql`).
- **Escopo de Endpoints**: CRUD completo da entidade `Projeto` — começando pelo método `Listar` (`GET /api/projetos`) e estendendo para `BuscarPorId` (`GET /api/projetos/{id}`), `Cadastrar` (`POST /api/projetos`), `Atualizar` (`PUT /api/projetos/{id}`) e `Deletar` (`DELETE /api/projetos/{id}`).
- **Persistência para Testes**: Banco de dados em servidor interno já pré-populado com os registros iniciais equivalentes ao script `cria-db.sql`, permitindo testes imediatos sem configuração externa, além de ação para restaurar o estado inicial a qualquer momento.
- **Idioma e Direção Visual**: Interface totalmente em Português (PT-BR) com estética clara e técnica de bancada de desenvolvimento (*clean light developer workbench*).

---

### 1. Overview & Core Concept

- **O que faz**: Entrega simultaneamente dois pilares no navegador:
  1. **API Real e Testável**: Rotas HTTP reais (`/api/projetos` e `/api/projetos/{id}`) conectadas a um repositório pré-populado no servidor, acessíveis tanto pela interface interativa quanto diretamente pela barra de endereço do navegador (simulando com fidelidade o `dotnet run` + `/api/projetos`).
  2. **Arquivos C# e SQL Prontos para o VSCode e SSMS**: Acesso organizado aos códigos completos do projeto `Exo.WebApi` (`ExoContext`, `Projeto`, `ProjetoRepository`, `ProjetosController`, configuração de injeção de dependência em `Program` e script `cria-db.sql`), com suporte a alternância entre a etapa inicial (`GET Listar`) e a etapa completa (`CRUD`) e download imediato.
- **Público-alvo**: Estudantes e desenvolvedores realizando a Atividade 3 da `ExoApi` que precisam validar o comportamento dos endpoints no navegador e consolidar a estrutura `.NET` + SQL Server.
- **Valor Principal**: Elimina barreiras de ambiente local ao permitir testar imediatamente cada verbo HTTP e inspecionar o JSON retornado, ao mesmo tempo que fornece o código exato estruturado para o Visual Studio Code e o SQL Server Management Studio.

---

### 2. User Experience & Visual Design

- **Fluxos Principais do Usuário**:
  1. **Testador da API (Início Padrão)**: O usuário visualiza os endpoints disponíveis na barra lateral ou seletor de operações, escolhe `GET /api/projetos` (ou `GET /id`, `POST`, `PUT`, `DELETE`), ajusta parâmetros ou corpo JSON e clica em **Executar Requisição**. O painel exibe o status HTTP real, cabeçalhos, tempo de resposta e JSON formatado, além de um botão para abrir `/api/projetos` diretamente em rota nativa do navegador.
  2. **Explorador da Tabela Projetos (Visão SSMS)**: Exibe os registros atuais em uma tabela densa (`Id`, `NomeDoProjeto`, `Area`, `Status`), com busca instantânea, filtro segmentado (`Todos`, `Ativos`, `Inativos`), formulário para cadastrar/editar projetos e exclusão com confirmação, refletindo em tempo real todas as alterações feitas via API.
  3. **Código C# & SQL (SSMS e VSCode)**: Árvore fiel à estrutura do projeto `Exo.WebApi` (`Contexts`, `Models`, `Repositories`, `Controllers`, `Program`, `cria-db.sql`). O usuário pode alternar entre a versão base da atividade (apenas `Listar`) e a versão estendida (CRUD completo), copiar arquivos individualmente ou baixar os scripts `.sql` e `.cs`.
  4. **Guia da Atividade**: Checklist interativo com os passos no SSMS (`cria-db.sql`) e comandos do terminal (`dotnet --version`, `dotnet restore`, `dotnet build`, `dotnet run`).

- **Identidade Visual e Tema**:
  - **Direção Estética**: Bancada técnica clara (*Clean Light Developer Workbench*), inspirada em consoles de documentação e ferramentas de engenharia modernas — foco absoluto em legibilidade de código, payloads JSON e dados tabulares.
  - **Paleta de Cores (Disciplina 60-30-10)**:
    - *60% Superfície Principal*: Branco puro e cinza frio muito claro para o canvas principal e área de leitura.
    - *30% Superfícies Estruturais*: Navegação lateral e cabeçalhos em ardósia neutra suave com bordas finas (`1px`) de baixo contraste.
    - *10% Acento e Estados*: Azul cobalto (`#2563EB`) reservado a ações primárias e seleção ativa; verde (`#16A34A`), âmbar (`#D97706`) e carmesim (`#DC2626`) usados estritamente com rótulo textual explícito para códigos HTTP e status dos projetos.
  - **Tipografia e Alinhamento Tabular**:
    - Títulos e estrutura em `Plus Jakarta Sans`, textos e controles em `DM Sans`, e código/JSON/IDs numéricos em `JetBrains Mono` com `tabular-nums` para alinhamento vertical impecável em tabelas e logs de resposta.
  - **Restrições Visuais e Ergonomia**:
    - Cabeçalho único com exatamente 3 zonas (título da bancada, navegação direta entre seções e botão primário para restaurar dados iniciais), controles sempre em linha única, ausência de pílulas decorativas em metadados estáticos e zero aninhamento desnecessário de cartões.

- **Feedback Interativo e Estados**:
  - Transições rápidas ($\le 200\text{ms}$) nas trocas de aba e respostas de formulário.
  - Estados explícitos de carregamento (*skeleton* na tabela durante requisições), estado vazio orientando o usuário a cadastrar o primeiro projeto ou restaurar o banco, e tratamento claro de erros de validação (ex.: `400 Bad Request` quando `NomeDoProjeto` ou `Area` estão vazios e `404 Not Found` para IDs inexistentes).

---

### 3. Key Product Decisions & Trade-Offs

- **Decisão 1: Endpoints REST reais via Route Handlers em vez de resposta mockada no cliente**
  - *Abordagem Escolhida*: Implementar rotas reais no servidor Next.js (`/api/projetos` e `/api/projetos/[id]`) acessadas via `fetch` pelo testador e acessíveis diretamente na URL do navegador.
  - *Por quê*: Garante que o usuário possa literalmente digitar ou abrir `/api/projetos` no navegador e enxergar o JSON puro retornado pelo servidor, reproduzindo fielmente a etapa de teste descrita no roteiro da atividade.
  - *Alternativa Descartada*: Simulação puramente em estado React no navegador, que impediria acessar a URL da API diretamente.

- **Decisão 2: Banco pré-populado em servidor com reinicialização controlada**
  - *Abordagem Escolhida*: Camada de dados no servidor pré-carregada com os projetos iniciais do esquema `ExoApi` (`Id`, `NomeDoProjeto`, `Area`, `Status`), com suporte a persistência temporária durante a sessão de testes e botão de restauração (`Restaurar Banco`).
  - *Por quê*: Funciona imediatamente após o carregamento sem exigir credenciais externas ou instalação local do SQL Server, mantendo o comportamento determinístico para testar `POST`, `PUT` e `DELETE`.
  - *Alternativa Descartada*: Exigir provisionamento de banco externo em nuvem antes dos primeiros testes.

- **Decisão 3: Modo duplo nos arquivos C# (Etapa `GET Listar` vs. Etapa `CRUD Completo`)**
  - *Abordagem Escolhida*: Permitir alternar nos arquivos `ProjetoRepository` e `ProjetosController` entre o código exato dos slides iniciais (somente `Listar`) e o código completo com `BuscarPorId`, `Cadastrar`, `Atualizar` e `Deletar`, além de incluir o registro de `ExoContext` e `ProjetoRepository` no `Program.cs` (essencial para evitar erro de injeção de dependência no .NET 6/7).
  - *Por quê*: Atende tanto à primeira parte da atividade quanto às "demais implementações" solicitadas no enunciado, evitando armadilhas comuns de execução no `dotnet run`.

---

### 4. Technical Architecture & Data Strategy *(Referência Técnica)*

- **Diagrama de Arquitetura e Fluxo de Dados**:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                         Navegador (Client UI)                           │
│                                                                         │
│  ┌───────────────┐  ┌──────────────────┐  ┌──────────────────────────┐  │
│  │ Testador API  │  │ Tabela Projetos  │  │ Explorador C# / cria-db  │  │
│  │ (HTTP Runner) │  │ (CRUD + Filtros) │  │ (Etapa 1 & CRUD + Export)│  │
│  └───────┬───────┘  └────────┬─────────┘  └──────────────────────────┘  │
└──────────┼───────────────────┼──────────────────────────────────────────┘
           │ fetch / navegador │ fetch (GET, POST, PUT, DELETE)
           ▼                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                  Camada de API REST (Next.js Server)                    │
│                                                                         │
│   GET /api/projetos          ──► Lista todos os projetos                │
│   POST /api/projetos         ──► Valida e cria novo projeto (201)       │
│   GET /api/projetos/[id]     ──► Busca projeto por Id (200 / 404)       │
│   PUT /api/projetos/[id]     ──► Atualiza campos do projeto (200 / 404) │
│   DELETE /api/projetos/[id]  ──► Remove projeto por Id (200 / 404)      │
│   POST /api/projetos/reset   ──► Restaura seed equivalente a cria-db    │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│               Repositório de Projetos Pré-Populado (Seed)               │
│   Entidade: Projeto { Id: number, NomeDoProjeto: string,                │
│                       Area: string, Status: boolean }                   │
└─────────────────────────────────────────────────────────────────────────┘
```

- **Modelo de Dados (`Projeto`)**:
  - Espelha 1-para-1 a modelagem do `Projeto.cs` e da tabela `Projetos` do SQL Server:
    - `Id` (`int`, chave primária `IDENTITY(1,1)` auto-incrementada)
    - `NomeDoProjeto` (`string` / `VARCHAR(150)`, obrigatório)
    - `Area` (`string` / `VARCHAR(150)`, obrigatório)
    - `Status` (`boolean` / `BIT`, obrigatório: `true` para ativo / concluído, `false` para inativo / pendente)

- **Mapeamento de Interações e Transições de Estado**:
  - **Execução no Testador API**: Selecionar método/rota preenche URL e exemplo de payload JSON; enviar valida a sintaxe JSON no cliente antes do disparo, atualiza o painel de resposta (código HTTP, tempo em ms, cabeçalhos, corpo JSON) e sincroniza automaticamente a lista na aba *Tabela Projetos*.
  - **Operações na Tabela Projetos**: Criar ou editar abre painel/modal controlado com validação de campos obrigatórios; excluir solicita confirmação inline ou modal; filtrar por texto ou status atua de forma instantânea sobre os dados carregados; restaurar banco dispara `POST /api/projetos/reset` e recarrega o estado inicial.
  - **Exportação C# / SQL**: Seleção de arquivo na árvore do projeto `Exo.WebApi` exibe código formatado, alternância entre código da Etapa 1 (`Listar`) e Etapa 2 (`CRUD`), cópia para área de transferência com feedback visual e download direto do arquivo selecionado ou do pacote SQL.
