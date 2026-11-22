export function buildInsomniaCollectionJson(baseUrl: string): string {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const now = Date.now();

  const collection = {
    _type: 'export',
    __export_format: 4,
    __export_date: new Date().toISOString(),
    __export_source: 'exoapi-workbench',
    resources: [
      {
        _id: 'wrk_exoapi',
        parentId: null,
        modified: now,
        created: now,
        name: 'ExoApi — Projetos CRUD',
        description: 'Coleção de testes da Web API ExoApi (SENAI Atividade 3)',
        scope: 'collection',
        _type: 'workspace',
      },
      {
        _id: 'env_exoapi_base',
        parentId: 'wrk_exoapi',
        modified: now,
        created: now,
        name: 'Base Environment',
        data: {
          base_url: cleanBase,
          dotnet_url: 'http://localhost:5000',
        },
        _type: 'environment',
      },
      {
        _id: 'req_listar',
        parentId: 'wrk_exoapi',
        modified: now,
        created: now,
        url: '{{ _.base_url }}/api/projetos',
        name: 'GET Listar Projetos',
        description: 'Lista todos os projetos cadastrados (Listar)',
        method: 'GET',
        body: {},
        parameters: [],
        headers: [],
        _type: 'request',
      },
      {
        _id: 'req_buscar_id',
        parentId: 'wrk_exoapi',
        modified: now,
        created: now,
        url: '{{ _.base_url }}/api/projetos/1',
        name: 'GET Buscar Projeto por Id',
        description: 'Busca um projeto pelo Id (BuscarPorId)',
        method: 'GET',
        body: {},
        parameters: [],
        headers: [],
        _type: 'request',
      },
      {
        _id: 'req_cadastrar',
        parentId: 'wrk_exoapi',
        modified: now,
        created: now,
        url: '{{ _.base_url }}/api/projetos',
        name: 'POST Cadastrar Projeto',
        description: 'Adiciona um novo projeto (Cadastrar)',
        method: 'POST',
        body: {
          mimeType: 'application/json',
          text: JSON.stringify(
            {
              nomeDoProjeto: 'Projeto F — Plataforma Mobile',
              area: 'Desenvolvimento Mobile',
              status: true,
            },
            null,
            2
          ),
        },
        parameters: [],
        headers: [{ name: 'Content-Type', value: 'application/json' }],
        _type: 'request',
      },
      {
        _id: 'req_atualizar',
        parentId: 'wrk_exoapi',
        modified: now,
        created: now,
        url: '{{ _.base_url }}/api/projetos/1',
        name: 'PUT Atualizar Projeto',
        description: 'Atualiza um projeto existente pelo Id (Atualizar)',
        method: 'PUT',
        body: {
          mimeType: 'application/json',
          text: JSON.stringify(
            {
              nomeDoProjeto: 'Projeto A — Obra Residencial Atualizada',
              area: 'Construção Civil',
              status: true,
            },
            null,
            2
          ),
        },
        parameters: [],
        headers: [{ name: 'Content-Type', value: 'application/json' }],
        _type: 'request',
      },
      {
        _id: 'req_deletar',
        parentId: 'wrk_exoapi',
        modified: now,
        created: now,
        url: '{{ _.base_url }}/api/projetos/1',
        name: 'DELETE Remover Projeto',
        description: 'Remove um projeto pelo Id (Deletar)',
        method: 'DELETE',
        body: {},
        parameters: [],
        headers: [],
        _type: 'request',
      },
    ],
  };

  return JSON.stringify(collection, null, 2);
}

export function buildPostmanCollectionJson(baseUrl: string): string {
  const cleanBase = baseUrl.replace(/\/+$/, '');

  const collection = {
    info: {
      name: 'ExoApi — Projetos CRUD',
      description:
        'Coleção Postman v2.1 para testar os endpoints GET, POST, PUT e DELETE de Exo.WebApi.',
      schema:
        'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    variable: [
      { key: 'base_url', value: cleanBase, type: 'string' },
      { key: 'dotnet_url', value: 'http://localhost:5000', type: 'string' },
    ],
    item: [
      {
        name: 'GET Listar Projetos',
        request: {
          method: 'GET',
          header: [],
          url: {
            raw: '{{base_url}}/api/projetos',
            host: ['{{base_url}}'],
            path: ['api', 'projetos'],
          },
        },
      },
      {
        name: 'GET Buscar Projeto por Id',
        request: {
          method: 'GET',
          header: [],
          url: {
            raw: '{{base_url}}/api/projetos/1',
            host: ['{{base_url}}'],
            path: ['api', 'projetos', '1'],
          },
        },
      },
      {
        name: 'POST Cadastrar Projeto',
        request: {
          method: 'POST',
          header: [{ key: 'Content-Type', value: 'application/json' }],
          body: {
            mode: 'raw',
            raw: JSON.stringify(
              {
                nomeDoProjeto: 'Projeto F — Plataforma Mobile',
                area: 'Desenvolvimento Mobile',
                status: true,
              },
              null,
              2
            ),
          },
          url: {
            raw: '{{base_url}}/api/projetos',
            host: ['{{base_url}}'],
            path: ['api', 'projetos'],
          },
        },
      },
      {
        name: 'PUT Atualizar Projeto',
        request: {
          method: 'PUT',
          header: [{ key: 'Content-Type', value: 'application/json' }],
          body: {
            mode: 'raw',
            raw: JSON.stringify(
              {
                nomeDoProjeto: 'Projeto A — Obra Residencial Atualizada',
                area: 'Construção Civil',
                status: true,
              },
              null,
              2
            ),
          },
          url: {
            raw: '{{base_url}}/api/projetos/1',
            host: ['{{base_url}}'],
            path: ['api', 'projetos', '1'],
          },
        },
      },
      {
        name: 'DELETE Remover Projeto',
        request: {
          method: 'DELETE',
          header: [],
          url: {
            raw: '{{base_url}}/api/projetos/1',
            host: ['{{base_url}}'],
            path: ['api', 'projetos', '1'],
          },
        },
      },
    ],
  };

  return JSON.stringify(collection, null, 2);
}
