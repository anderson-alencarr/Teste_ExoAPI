import { generateCriaDbSql } from '@/lib/sql-generator';

export type CodeStage = 'etapa1' | 'etapa2';

export interface ExoFileTemplate {
  id: string;
  path: string;
  folder: string;
  fileName: string;
  language: 'sql' | 'csharp' | 'json' | 'xml';
  role: string;
  hasStageToggle?: boolean;
  getCode: (stage: CodeStage) => string;
}

export const CRIA_DB_SQL = generateCriaDbSql();

export const EXO_FILE_TEMPLATES: ExoFileTemplate[] = [
  {
    id: 'cria-db',
    path: 'cria-db.sql',
    folder: 'Banco de Dados (SSMS)',
    fileName: 'cria-db.sql',
    language: 'sql',
    role: 'Script SQL Server para criar o banco ExoApi e as tabelas Projetos e Usuarios com os registros iniciais.',
    getCode: () => CRIA_DB_SQL,
  },
  {
    id: 'exo-context',
    path: 'Contexts/ExoContext.cs',
    folder: 'Contexts',
    fileName: 'ExoContext.cs',
    language: 'csharp',
    role: 'Cuida das tratativas de conexão com o banco de dados SQL Server via Entity Framework Core.',
    hasStageToggle: true,
    getCode: (stage) => `using Exo.WebApi.Models;
using Microsoft.EntityFrameworkCore;
using System.Data.SqlClient;
using Microsoft.Data.SqlClient;

namespace Exo.WebApi.Contexts
{
    public class ExoContext : DbContext
    {
        public ExoContext()
        {
        }

        public ExoContext(DbContextOptions<ExoContext> options) : base(options)
        {
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                // Essa string de conexão depende da SUA máquina.
                optionsBuilder.UseSqlServer(
                    "Server=localhost\\\\SQLEXPRESS;Database=ExoApi;Trusted_Connection=True;TrustServerCertificate=True;"
                );

                // Exemplo 1 de string de conexão (usuário sa):
                // Server=localhost;Database=ExoApi;User Id=sa;Password=admin;TrustServerCertificate=True;

                // Exemplo 2 de string de conexão (Autenticação do Windows):
                // Server=localhost\\\\SQLEXPRESS;Database=ExoApi;Trusted_Connection=True;
            }
        }

        public DbSet<Projeto> Projetos { get; set; }${
          stage === 'etapa2'
            ? '\n        public DbSet<Usuario> Usuarios { get; set; }'
            : ''
        }
    }
}
`,
  },
  {
    id: 'projeto-model',
    path: 'Models/Projeto.cs',
    folder: 'Models',
    fileName: 'Projeto.cs',
    language: 'csharp',
    role: 'Modelo do sistema contendo os atributos da entidade Projeto mapeados para a tabela Projetos.',
    getCode: () => `using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Exo.WebApi.Models
{
    public class Projeto
    {
        public int Id { get; set; }
        public string NomeDoProjeto { get; set; }
        public string Area { get; set; }
        public bool Status { get; set; }
    }
}
`,
  },
  {
    id: 'usuario-model',
    path: 'Models/Usuario.cs',
    folder: 'Models',
    fileName: 'Usuario.cs',
    language: 'csharp',
    role: 'Modelo do sistema contendo os atributos Id, Email e Senha da entidade Usuario.',
    getCode: () => `namespace Exo.WebApi.Models
{
    public class Usuario
    {
        public int Id { get; set; }
        public string Email { get; set; }
        public string Senha { get; set; }
    }
}
`,
  },
  {
    id: 'projeto-repository',
    path: 'Repositories/ProjetoRepository.cs',
    folder: 'Repositories',
    fileName: 'ProjetoRepository.cs',
    language: 'csharp',
    role: 'Camada Repository responsável direta pela manipulação dos projetos no banco via ExoContext.',
    hasStageToggle: true,
    getCode: (stage) =>
      stage === 'etapa1'
        ? `using Exo.WebApi.Contexts;
using Exo.WebApi.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Exo.WebApi.Repositories
{
    public class ProjetoRepository
    {
        private readonly ExoContext _context;

        public ProjetoRepository(ExoContext context)
        {
            _context = context;
        }

        public List<Projeto> Listar()
        {
            return _context.Projetos.ToList();
        }
    }
}
`
        : `using Exo.WebApi.Contexts;
using Exo.WebApi.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Exo.WebApi.Repositories
{
    public class ProjetoRepository
    {
        private readonly ExoContext _context;

        public ProjetoRepository(ExoContext context)
        {
            _context = context;
        }

        public List<Projeto> Listar()
        {
            return _context.Projetos.ToList();
        }

        public Projeto BuscarPorId(int id)
        {
            return _context.Projetos.Find(id);
        }

        public void Cadastrar(Projeto projeto)
        {
            _context.Projetos.Add(projeto);
            _context.SaveChanges();
        }

        public void Atualizar(int id, Projeto projeto)
        {
            Projeto projetoBuscado = _context.Projetos.Find(id);

            if (projetoBuscado != null)
            {
                projetoBuscado.NomeDoProjeto = projeto.NomeDoProjeto;
                projetoBuscado.Area = projeto.Area;
                projetoBuscado.Status = projeto.Status;

                _context.Projetos.Update(projetoBuscado);
                _context.SaveChanges();
            }
        }

        public void Deletar(int id)
        {
            Projeto projetoBuscado = _context.Projetos.Find(id);

            if (projetoBuscado != null)
            {
                _context.Projetos.Remove(projetoBuscado);
                _context.SaveChanges();
            }
        }
    }
}
`,
  },
  {
    id: 'usuario-repository',
    path: 'Repositories/UsuarioRepository.cs',
    folder: 'Repositories',
    fileName: 'UsuarioRepository.cs',
    language: 'csharp',
    role: 'Camada Repository responsável pelo método Login() e pelas operações CRUD da entidade Usuario.',
    getCode: () => `using Exo.WebApi.Contexts;
using Exo.WebApi.Models;
using System.Collections.Generic;
using System.Linq;

namespace Exo.WebApi.Repositories
{
    public class UsuarioRepository
    {
        private readonly ExoContext _context;

        public UsuarioRepository(ExoContext context)
        {
            _context = context;
        }

        public Usuario Login(string email, string senha)
        {
            return _context.Usuarios.FirstOrDefault(
                u => u.Email == email && u.Senha == senha
            );
        }

        public List<Usuario> Listar()
        {
            return _context.Usuarios.ToList();
        }

        public void Cadastrar(Usuario usuario)
        {
            _context.Usuarios.Add(usuario);
            _context.SaveChanges();
        }

        public Usuario BuscaPorId(int id)
        {
            return _context.Usuarios.Find(id);
        }

        public void Atualizar(int id, Usuario usuario)
        {
            Usuario usuarioBuscado = _context.Usuarios.Find(id);

            if (usuarioBuscado != null)
            {
                usuarioBuscado.Email = usuario.Email;
                usuarioBuscado.Senha = usuario.Senha;

                _context.Usuarios.Update(usuarioBuscado);
                _context.SaveChanges();
            }
        }

        public void Deletar(int id)
        {
            Usuario usuarioBuscado = _context.Usuarios.Find(id);

            if (usuarioBuscado != null)
            {
                _context.Usuarios.Remove(usuarioBuscado);
                _context.SaveChanges();
            }
        }
    }
}
`,
  },
  {
    id: 'projetos-controller',
    path: 'Controllers/ProjetosController.cs',
    folder: 'Controllers',
    fileName: 'ProjetosController.cs',
    language: 'csharp',
    role: 'Controlador da API responsável por expor as rotas HTTP em api/projetos.',
    hasStageToggle: true,
    getCode: (stage) =>
      stage === 'etapa1'
        ? `using Exo.WebApi.Models;
using Exo.WebApi.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;

namespace Exo.WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProjetosController : ControllerBase
    {
        private readonly ProjetoRepository _projetoRepository;

        public ProjetosController(ProjetoRepository projetoRepository)
        {
            _projetoRepository = projetoRepository;
        }

        [HttpGet]
        public IActionResult Listar()
        {
            return Ok(_projetoRepository.Listar());
        }
    }
}
`
        : `using Exo.WebApi.Models;
using Exo.WebApi.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;

namespace Exo.WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProjetosController : ControllerBase
    {
        private readonly ProjetoRepository _projetoRepository;

        public ProjetosController(ProjetoRepository projetoRepository)
        {
            _projetoRepository = projetoRepository;
        }

        [HttpGet]
        public IActionResult Listar()
        {
            return Ok(_projetoRepository.Listar());
        }

        [HttpGet("{id}")]
        public IActionResult BuscarPorId(int id)
        {
            Projeto projeto = _projetoRepository.BuscarPorId(id);
            if (projeto == null)
            {
                return NotFound();
            }
            return Ok(projeto);
        }

        [HttpPost]
        public IActionResult Cadastrar(Projeto projeto)
        {
            _projetoRepository.Cadastrar(projeto);
            return StatusCode(201, projeto);
        }

        [HttpPut("{id}")]
        public IActionResult Atualizar(int id, Projeto projeto)
        {
            Projeto projetoBuscado = _projetoRepository.BuscarPorId(id);
            if (projetoBuscado == null)
            {
                return NotFound();
            }

            _projetoRepository.Atualizar(id, projeto);
            return StatusCode(204);
        }

        [HttpDelete("{id}")]
        public IActionResult Deletar(int id)
        {
            Projeto projetoBuscado = _projetoRepository.BuscarPorId(id);
            if (projetoBuscado == null)
            {
                return NotFound();
            }

            _projetoRepository.Deletar(id);
            return StatusCode(204);
        }
    }
}
`,
  },
  {
    id: 'usuarios-controller',
    path: 'Controllers/UsuariosController.cs',
    folder: 'Controllers',
    fileName: 'UsuariosController.cs',
    language: 'csharp',
    role: 'Controlador da API com CRUD de usuários, método POST de Login com geração de JWT e proteção [Authorize] em PUT e DELETE.',
    hasStageToggle: true,
    getCode: (stage) =>
      stage === 'etapa1'
        ? `using Exo.WebApi.Models;
using Exo.WebApi.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;

namespace Exo.WebApi.Controllers
{
    [Produces("application/json")]
    [Route("api/[controller]")]
    [ApiController]
    public class UsuariosController : ControllerBase
    {
        private readonly UsuarioRepository _usuarioRepository;

        public UsuariosController(UsuarioRepository usuarioRepository)
        {
            _usuarioRepository = usuarioRepository;
        }

        // get -> /api/usuarios
        [HttpGet]
        public IActionResult Listar()
        {
            return Ok(_usuarioRepository.Listar());
        }

        // post -> /api/usuarios
        [HttpPost]
        public IActionResult Cadastrar(Usuario usuario)
        {
            _usuarioRepository.Cadastrar(usuario);
            return StatusCode(201);
        }

        // get -> /api/usuarios/{id}
        [HttpGet("{id}")]
        public IActionResult BuscarPorId(int id)
        {
            Usuario usuario = _usuarioRepository.BuscaPorId(id);
            if (usuario == null)
            {
                return NotFound();
            }
            return Ok(usuario);
        }

        // put -> /api/usuarios/{id}
        [HttpPut("{id}")]
        public IActionResult Atualizar(int id, Usuario usuario)
        {
            _usuarioRepository.Atualizar(id, usuario);
            return StatusCode(204);
        }

        // delete -> /api/usuarios/{id}
        [HttpDelete("{id}")]
        public IActionResult Deletar(int id)
        {
            try
            {
                _usuarioRepository.Deletar(id);
                return StatusCode(204);
            }
            catch (Exception e)
            {
                return BadRequest();
            }
        }
    }
}
`
        : `using Exo.WebApi.Models;
using Exo.WebApi.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace Exo.WebApi.Controllers
{
    [Produces("application/json")]
    [Route("api/[controller]")]
    [ApiController]
    public class UsuariosController : ControllerBase
    {
        private readonly UsuarioRepository _usuarioRepository;

        public UsuariosController(UsuarioRepository usuarioRepository)
        {
            _usuarioRepository = usuarioRepository;
        }

        // get -> /api/usuarios
        [HttpGet]
        public IActionResult Listar()
        {
            return Ok(_usuarioRepository.Listar());
        }

        // Novo código POST para auxiliar o método de Login com Token JWT.
        [HttpPost]
        public IActionResult Post(Usuario usuario)
        {
            Usuario usuarioBuscado = _usuarioRepository.Login(
                usuario.Email,
                usuario.Senha
            );

            if (usuarioBuscado == null)
            {
                return NotFound("E-mail ou senha inválidos!");
            }

            // Define os dados que serão fornecidos no token - Payload.
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Email, usuarioBuscado.Email),
                new Claim(JwtRegisteredClaimNames.Jti, usuarioBuscado.Id.ToString()),
            };

            // Define a chave de acesso ao token (preferencialmente via variável de ambiente EXO_JWT_SECRET).
            var secret = Environment.GetEnvironmentVariable("EXO_JWT_SECRET")
                ?? "exoapi-chave-autenticacao";
            var key = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(secret));

            // Define as credenciais do token.
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // Gera o token com expiração de 30 minutos.
            var token = new JwtSecurityToken(
                issuer: "exoapi.webapi",
                audience: "exoapi.webapi",
                claims: claims,
                expires: DateTime.Now.AddMinutes(30),
                signingCredentials: creds
            );

            return Ok(
                new { token = new JwtSecurityTokenHandler().WriteToken(token) }
            );
        }

        // get -> /api/usuarios/{id}
        [HttpGet("{id}")] // Faz a busca pelo ID.
        public IActionResult BuscarPorId(int id)
        {
            Usuario usuario = _usuarioRepository.BuscaPorId(id);
            if (usuario == null)
            {
                return NotFound();
            }
            return Ok(usuario);
        }

        // put -> /api/usuarios/{id}
        // Atualiza (requer token Bearer).
        [Authorize]
        [HttpPut("{id}")]
        public IActionResult Atualizar(int id, Usuario usuario)
        {
            _usuarioRepository.Atualizar(id, usuario);
            return StatusCode(204);
        }

        // delete -> /api/usuarios/{id}
        // Remove (requer token Bearer).
        [Authorize]
        [HttpDelete("{id}")]
        public IActionResult Deletar(int id)
        {
            try
            {
                _usuarioRepository.Deletar(id);
                return StatusCode(204);
            }
            catch (Exception e)
            {
                return BadRequest();
            }
        }
    }
}
`,
  },
  {
    id: 'program-cs',
    path: 'Program.cs',
    folder: 'Raiz do Projeto',
    fileName: 'Program.cs',
    language: 'csharp',
    role: 'Configura Swagger, CORS, autenticação JwtBearer, injeção de dependência e pipeline de autorização.',
    hasStageToggle: true,
    getCode: (stage) =>
      stage === 'etapa1'
        ? `using Exo.WebApi.Contexts;
using Exo.WebApi.Repositories;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddScoped<ExoContext, ExoContext>();
builder.Services.AddControllers();
builder.Services.AddTransient<ProjetoRepository, ProjetoRepository>();

var app = builder.Build();

app.UseRouting();

app.UseEndpoints(endpoints =>
{
    endpoints.MapControllers();
});

app.Run();
`
        : `using Exo.WebApi.Contexts;
using Exo.WebApi.Repositories;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddScoped<ExoContext, ExoContext>();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configura política de CORS para origens autorizadas.
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        policy
            .WithOrigins("http://localhost:3000", "http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// Forma de autenticação JWT Bearer.
var jwtSecret = Environment.GetEnvironmentVariable("EXO_JWT_SECRET")
    ?? "exoapi-chave-autenticacao";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = "JwtBearer";
    options.DefaultChallengeScheme = "JwtBearer";
})
.AddJwtBearer("JwtBearer", options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        IssuerSigningKey = new SymmetricSecurityKey(
            System.Text.Encoding.UTF8.GetBytes(jwtSecret)
        ),
        ClockSkew = TimeSpan.FromMinutes(30),
        ValidIssuer = "exoapi.webapi",
        ValidAudience = "exoapi.webapi"
    };
});

builder.Services.AddTransient<ProjetoRepository, ProjetoRepository>();
builder.Services.AddTransient<UsuarioRepository, UsuarioRepository>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseRouting();

// Habilita CORS antes de autenticação e autorização.
app.UseCors("CorsPolicy");

// Habilita a autenticação.
app.UseAuthentication();

// Habilita a autorização.
app.UseAuthorization();

app.UseEndpoints(endpoints =>
{
    endpoints.MapControllers();
});

app.Run();
`,
  },
  {
    id: 'csproj',
    path: 'Exo.WebApi.csproj',
    folder: 'Raiz do Projeto',
    fileName: 'Exo.WebApi.csproj',
    language: 'xml',
    role: 'Arquivo de definição do projeto .NET com referências ao Entity Framework Core, SQL Server e JwtBearer.',
    getCode: () => `<Project Sdk="Microsoft.NET.Sdk.Web">

  <PropertyGroup>
    <TargetFramework>net7.0</TargetFramework>
    <Nullable>disable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="6.0.0" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="7.0.2" />
    <PackageReference Include="Microsoft.Data.SqlClient" Version="5.1.0" />
    <PackageReference Include="System.Data.SqlClient" Version="4.8.5" />
  </ItemGroup>

</Project>
`,
  },
  {
    id: 'launch-settings',
    path: 'Properties/launchSettings.json',
    folder: 'Properties',
    fileName: 'launchSettings.json',
    language: 'json',
    role: 'Define a URL e portas locais exibidas no terminal ao executar dotnet run.',
    getCode: () => `{
  "profiles": {
    "Exo.WebApi": {
      "commandName": "Project",
      "dotnetRunMessages": true,
      "launchBrowser": false,
      "applicationUrl": "http://localhost:5000;https://localhost:5001",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    }
  }
}
`,
  },
];
