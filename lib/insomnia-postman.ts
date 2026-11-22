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
        name: 'ExoApi — Projetos & Usuários CRUD',
        description:
          'Coleção completa de testes da Web API ExoApi (Projetos e Usuários)',
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
        _id: 'fld_projetos',
        parentId: 'wrk_exoapi',
        modified: now,
        created: now,
        name: 'Projetos',
        _type: 'request_group',
      },
      {
        _id: 'fld_usuarios',
        parentId: 'wrk_exoapi',
        modified: now,
        created: now,
        name: 'Usuarios',
        _type: 'request_group',
      },
      {
        _id: 'req_listar_projetos',
        parentId: 'fld_projetos',
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
        _id: 'req_buscar_projeto_id',
        parentId: 'fld_projetos',
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
        _id: 'req_cadastrar_projeto',
        parentId: 'fld_projetos',
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
        _id: 'req_atualizar_projeto',
        parentId: 'fld_projetos',
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
        _id: 'req_deletar_projeto',
        parentId: 'fld_projetos',
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
      {
        _id: 'req_listar_usuarios',
        parentId: 'fld_usuarios',
        modified: now,
        created: now,
        url: '{{ _.base_url }}/api/usuarios',
        name: 'GET Listar Usuários',
        description: 'Lista todos os usuários cadastrados (Listar)',
        method: 'GET',
        body: {},
        parameters: [],
        headers: [],
        _type: 'request',
      },
      {
        _id: 'req_buscar_usuario_id',
        parentId: 'fld_usuarios',
        modified: now,
        created: now,
        url: '{{ _.base_url }}/api/usuarios/1',
        name: 'GET Buscar Usuário por Id',
        description: 'Busca um usuário pelo Id (BuscarPorId)',
        method: 'GET',
        body: {},
        parameters: [],
        headers: [],
        _type: 'request',
      },
      {
        _id: 'req_cadastrar_usuario',
        parentId: 'fld_usuarios',
        modified: now,
        created: now,
        url: '{{ _.base_url }}/api/usuarios',
        name: 'POST Cadastrar Usuário',
        description: 'Insere um novo usuário (Cadastrar)',
        method: 'POST',
        body: {
          mimeType: 'application/json',
          text: JSON.stringify(
            {
              email: 'email_tres@sp.br',
              senha: '1234',
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
        _id: 'req_atualizar_usuario',
        parentId: 'fld_usuarios',
        modified: now,
        created: now,
        url: '{{ _.base_url }}/api/usuarios/3',
        name: 'PUT Atualizar Usuário',
        description: 'Atualiza um usuário pelo Id (Atualizar)',
        method: 'PUT',
        body: {
          mimeType: 'application/json',
          text: JSON.stringify(
            {
              email: 'email_quatro@sp.br',
              senha: '4321',
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
        _id: 'req_deletar_usuario',
        parentId: 'fld_usuarios',
        modified: now,
        created: now,
        url: '{{ _.base_url }}/api/usuarios/3',
        name: 'DELETE Remover Usuário',
        description: 'Remove um usuário pelo Id (Deletar)',
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
      name: 'ExoApi — Projetos & Usuários CRUD',
      description:
        'Coleção Postman v2.1 para testar os endpoints GET, POST, PUT e DELETE de /api/projetos e /api/usuarios.',
      schema:
        'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    variable: [
      { key: 'base_url', value: cleanBase, type: 'string' },
      { key: 'dotnet_url', value: 'http://localhost:5000', type: 'string' },
    ],
    item: [
      {
        name: 'Projetos',
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
      },
      {
        name: 'Usuarios',
        item: [
          {
            name: 'GET Listar Usuários',
            request: {
              method: 'GET',
              header: [],
              url: {
                raw: '{{base_url}}/api/usuarios',
                host: ['{{base_url}}'],
                path: ['api', 'usuarios'],
              },
            },
          },
          {
            name: 'GET Buscar Usuário por Id',
            request: {
              method: 'GET',
              header: [],
              url: {
                raw: '{{base_url}}/api/usuarios/1',
                host: ['{{base_url}}'],
                path: ['api', 'usuarios', '1'],
              },
            },
          },
          {
            name: 'POST Cadastrar Usuário',
            request: {
              method: 'POST',
              header: [{ key: 'Content-Type', value: 'application/json' }],
              body: {
                mode: 'raw',
                raw: JSON.stringify(
                  {
                    email: 'email_tres@sp.br',
                    senha: '1234',
                  },
                  null,
                  2
                ),
              },
              url: {
                raw: '{{base_url}}/api/usuarios',
                host: ['{{base_url}}'],
                path: ['api', 'usuarios'],
              },
            },
          },
          {
            name: 'PUT Atualizar Usuário',
            request: {
              method: 'PUT',
              header: [{ key: 'Content-Type', value: 'application/json' }],
              body: {
                mode: 'raw',
                raw: JSON.stringify(
                  {
                    email: 'email_quatro@sp.br',
                    senha: '4321',
                  },
                  null,
                  2
                ),
              },
              url: {
                raw: '{{base_url}}/api/usuarios/3',
                host: ['{{base_url}}'],
                path: ['api', 'usuarios', '3'],
              },
            },
          },
          {
            name: 'DELETE Remover Usuário',
            request: {
              method: 'DELETE',
              header: [],
              url: {
                raw: '{{base_url}}/api/usuarios/3',
                host: ['{{base_url}}'],
                path: ['api', 'usuarios', '3'],
              },
            },
          },
        ],
      },
    ],
  };

  return JSON.stringify(collection, null, 2);
}
