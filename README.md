# DOCUMENTAÇÃO TÉCNICA COMPLETA - SISTEMA DE FROTA DE VEÍCULOS PMTF

## 1. VISÃO GERAL DO PRODUTO

### 1.1 Objetivo do Sistema
O Sistema de Frota de Veículos PMTF é uma aplicação web de gerenciamento de frota municipal desenvolvida para a Prefeitura Municipal de Teixeira de Freitas (PMTF). O sistema permite o controle completo do ciclo de vida de veículos municipais, desde o cadastro até a movimentação entre secretarias e departamentos.

### 1.2 Problema que Resolve
Antes deste sistema, a gestão da frota municipal era manual e descentralizada, causando:
- Dificuldade em rastrear localização atual de veículos
- Perda de histórico de movimentações
- Impossibilidade de gerar relatórios consolidados
- Falta de controle sobre status de veículos (ativos, manutenção, inativos)
- Ausência de rastreabilidade de lotação por departamento

O sistema centraliza todas essas informações em uma plataforma única, permitindo controle total da frota municipal.

### 1.3 Tipos de Usuários

**ADMINISTRADOR (ADMIN)**
- Acesso completo a todas as funcionalidades
- Pode cadastrar, editar e deletar veículos
- Pode criar e gerenciar usuários
- Pode alterar status e lotação de veículos
- Pode exportar e imprimir relatórios
- Tem acesso a todas as telas do sistema

**PADRÃO**
- Acesso somente leitura aos veículos
- Pode visualizar listagens por status
- Pode visualizar histórico de lotação
- Pode exportar e imprimir relatórios
- NÃO pode criar, editar ou deletar dados
- NÃO tem acesso à tela de gerenciamento de usuários
- NÃO tem acesso à tela de cadastro de veículos

### 1.4 Fluxo Principal de Uso Ponta a Ponta

**Fluxo do Administrador:**
1. Acessa a URL do sistema
2. É redirecionado para `/login`
3. Insere email: `admin@pmtf.gov.br` e senha: `admin123`
4. Sistema valida credenciais no backend via POST `/api/auth/login`
5. Backend cria JWT token e armazena em cookie httpOnly
6. Frontend armazena dados do usuário no AuthContext
7. Usuário é redirecionado para `/dashboard`
8. Dashboard exibe 5 cards: Cadastrar Veículo, Veículos em Atividade, Veículos em Manutenção, Veículos Inativos, Gerenciar Usuários
9. Clica em "Cadastrar Veículo"
10. Preenche formulário com: placa, marca, modelo, ano, chassi, status, lotação atual, sublotação/departamento
11. Clica em "Cadastrar Veículo"
12. Frontend valida campos obrigatórios
13. Envia POST `/api/vehicles` com dados
14. Backend valida autenticação e role ADMIN
15. Backend insere veículo no MongoDB
16. Backend cria entrada inicial no histórico de lotação
17. Backend retorna veículo criado
18. Frontend exibe toast de sucesso
19. Frontend redireciona para listagem de veículos em atividade
20. Listagem busca veículos via GET `/api/vehicles/em-atividade`
21. Exibe tabela com todos os veículos em atividade
22. Administrador pode filtrar por placa ou marca
23. Pode clicar no ícone de histórico para ver movimentações
24. Pode clicar em editar para alterar dados
25. Pode clicar em deletar para remover veículo
26. Pode exportar para PDF ou imprimir
27. Clica em "Sair" para fazer logout
28. Sistema limpa cookies e redireciona para login

**Fluxo do Usuário Padrão:**
1. Acessa sistema e faz login com credenciais de usuário padrão
2. Dashboard exibe apenas 3 cards: Veículos em Atividade, Veículos em Manutenção, Veículos Inativos
3. Pode navegar entre listagens
4. Pode aplicar filtros de busca
5. Pode visualizar histórico de lotação (somente leitura)
6. Pode exportar PDF e imprimir
7. NÃO vê botões de editar/deletar
8. Não tem acesso a telas de cadastro ou gerenciamento

### 1.5 Telas, Páginas, Rotas e Estados

**ROTA: `/login` - Página de Login**
- **Componente:** `Login.js`
- **Estado:** Não autenticado
- **Layout:** Split screen - metade esquerda com brasão e imagem de fundo, metade direita com formulário
- **Elementos:** Logo PMTF, título do sistema, campos email e senha, botão "Entrar"
- **Comportamento:** Ao submeter, chama API de login, armazena token em cookie, redireciona para `/dashboard`
- **Tratamento de erro:** Exibe mensagem em vermelho acima do formulário

**ROTA: `/dashboard` - Dashboard Principal**
- **Componente:** `Dashboard.js` dentro do layout `DashboardLayout.js`
- **Estado:** Autenticado
- **Layout:** Sidebar azul à esquerda, conteúdo principal à direita
- **Elementos:** Cards clicáveis com ícones e títulos
- **Cards Admin:** Cadastrar Veículo, Veículos em Atividade, Veículos em Manutenção, Veículos Inativos, Gerenciar Usuários
- **Cards Padrão:** Veículos em Atividade, Veículos em Manutenção, Veículos Inativos
- **Comportamento:** Cards são clicáveis e navegam para respectivas rotas

**ROTA: `/dashboard/cadastrar-veiculo` - Cadastro de Veículo**
- **Componente:** `CadastrarVeiculo.js`
- **Estado:** Autenticado como ADMIN (protegido)
- **Elementos:** Formulário com 8 campos obrigatórios
  - Placa (texto)
  - Marca (texto)
  - Modelo (texto)
  - Ano de Fabricação (número)
  - Número do Chassi (texto)
  - Status (select: Em Atividade, Em Manutenção, Inativo)
  - Lotação Atual (texto)
  - Sublotação/Departamento (texto)
- **Botões:** "Cadastrar Veículo", "Cancelar"
- **Comportamento:** Ao submeter, valida campos, envia POST, exibe toast, redireciona

**ROTA: `/dashboard/veiculos-atividade` - Listagem de Veículos em Atividade**
- **Componente:** `VeiculosAtividade.js` que usa `VehicleList.js`
- **Estado:** Autenticado
- **Elementos:**
  - Cabeçalho com título, contador de veículos, botões "Exportar PDF" e "Imprimir"
  - Seção de filtros com 2 inputs (placa, marca) e botão "Limpar Filtros"
  - Tabela com colunas: Placa, Marca, Modelo, Ano, Status, Lotação, Sublotação/Depto, Ações
  - Ações: Histórico (todos), Editar (admin), Deletar (admin)
- **Comportamento:**
  - Filtros fazem debounce e chamam API com query params
  - Exportar PDF gera jsPDF com logo e dados
  - Histórico abre modal com timeline de movimentações
  - Editar abre modal com formulário
  - Deletar exige confirmação

**ROTA: `/dashboard/veiculos-manutencao` - Listagem de Veículos em Manutenção**
- **Componente:** `VeiculosManutencao.js` que usa `VehicleList.js`
- **Estado:** Autenticado
- **Comportamento:** Idêntico à listagem de atividade, mas filtra status EM_MANUTENCAO

**ROTA: `/dashboard/veiculos-inativos` - Listagem de Veículos Inativos**
- **Componente:** `VeiculosInativos.js` que usa `VehicleList.js`
- **Estado:** Autenticado
- **Comportamento:** Idêntico à listagem de atividade, mas filtra status INATIVO

**ROTA: `/dashboard/usuarios` - Gerenciamento de Usuários**
- **Componente:** `Usuarios.js`
- **Estado:** Autenticado como ADMIN (protegido)
- **Elementos:**
  - Cabeçalho com logo PMTF, título e botão "Novo Usuário"
  - Tabela com colunas: Nome, Email, Perfil, Data de Cadastro, Ações
  - Ações: Deletar (com confirmação)
- **Modal de Criação:**
  - Nome Completo
  - Email
  - Senha
  - Perfil (select: ADMIN, PADRÃO)
  - Botões: "Criar Usuário", "Cancelar"
- **Comportamento:** Lista usuários, permite criar novos, deletar existentes

**ROTA: `/` - Root**
- **Comportamento:** Redireciona automaticamente para `/dashboard`

**ROTA: `*` - 404**
- **Comportamento:** Redireciona automaticamente para `/dashboard`

---

## 2. ARQUITETURA GERAL

### 2.1 Tipo de Aplicação
**SPA (Single Page Application)** - React com React Router para navegação client-side.

### 2.2 Arquitetura Completa

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTE                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  React SPA (port 3000 - desenvolvimento)              │  │
│  │  - React Router para navegação                         │  │
│  │  - Axios para requisições HTTP                         │  │
│  │  - AuthContext para estado global de autenticação     │  │
│  │  - Shadcn/UI para componentes                          │  │
│  │  - TailwindCSS para estilização                        │  │
│  │  - jsPDF para geração de PDFs                          │  │
│  │  - react-to-print para impressão                       │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTPS
                      (withCredentials: true)
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND API                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  FastAPI (port 8001)                                   │  │
│  │  - Uvicorn ASGI server                                 │  │
│  │  - CORS configurado                                    │  │
│  │  - JWT auth com cookies httpOnly                       │  │
│  │  - Pydantic para validação                             │  │
│  │  - Motor (async MongoDB driver)                        │  │
│  │  - bcrypt para hash de senhas                          │  │
│  │  - PyJWT para tokens                                   │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    BANCO DE DADOS                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  MongoDB (localhost:27017 em dev)                      │  │
│  │  - Database: test_database                             │  │
│  │  - Collections: users, vehicles, location_history      │  │
│  │  - Índices: email (unique), placa, vehicle_id          │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Componentes da Arquitetura

**FRONTEND:**
- **Framework:** React 19.0.0
- **Build Tool:** Create React App com CRACO
- **Bundler:** Webpack (via CRA)
- **Roteamento:** React Router DOM 7.5.1
- **Estado Global:** Context API (AuthContext)
- **Estado Local:** useState, useEffect hooks
- **Requisições:** Axios 1.8.4
- **UI Library:** Shadcn/UI (componentes Radix UI)
- **Estilização:** TailwindCSS 3.4.17
- **Fontes:** Google Fonts (Outfit, IBM Plex Sans)
- **Ícones:** lucide-react 0.507.0
- **Validação:** Zod 3.24.4 + React Hook Form 7.56.2
- **Notificações:** Sonner 2.0.3
- **PDF:** jsPDF 4.2.1 + jspdf-autotable 5.0.7
- **Impressão:** react-to-print 3.3.0

**BACKEND:**
- **Framework:** FastAPI 0.110.1
- **Server:** Uvicorn 0.25.0 (ASGI)
- **MongoDB Driver:** Motor 3.3.1 (async)
- **Autenticação:** PyJWT 2.12.1
- **Hash de Senha:** bcrypt 4.1.3
- **Validação:** Pydantic 2.6.4
- **CORS:** FastAPI CORSMiddleware
- **Variáveis de Ambiente:** python-dotenv 1.0.1

**BANCO DE DADOS:**
- **Sistema:** MongoDB (NoSQL, orientado a documentos)
- **Driver:** Motor (async Python)
- **Collections:** 3 coleções principais
- **Índices:** Configurados para otimização de queries

### 2.4 Dependências do Emergent

**Dependências Diretas do Emergent:**

1. **Variável de Ambiente REACT_APP_BACKEND_URL**
   - Gerada automaticamente pelo Emergent
   - Formato: `https://<app-name>.preview.emergentagent.com`
   - **Substituição:** Definir manualmente para URL do backend em produção

2. **Variável WDS_SOCKET_PORT**
   - Usada para WebSocket do hot reload do Webpack
   - **Substituição:** Remover ou ajustar para 443 se usar proxy

3. **Supervisor para gerenciamento de processos**
   - Emergent usa supervisord para rodar backend e frontend
   - **Substituição:** PM2, systemd, Docker Compose ou Kubernetes

4. **Estrutura de diretórios `/app`**
   - Emergent monta projeto em `/app`
   - **Substituição:** Qualquer estrutura funciona

5. **MongoDB no localhost**
   - Emergent provisiona MongoDB local
   - **Substituição:** MongoDB Atlas, AWS DocumentDB, ou instância própria

6. **Auto-geração de .env**
   - Emergent atualiza automaticamente valores durante deploy
   - **Substituição:** Gerenciar manualmente ou usar CI/CD para injetar

**Dependências Inferidas (não explícitas):**

1. **Rede/DNS**
   - Ingress do Kubernetes redireciona rotas `/api` para backend
   - **Substituição:** Nginx, Traefik ou API Gateway

2. **SSL/TLS**
   - Gerenciado pelo Emergent
   - **Substituição:** Let's Encrypt, Cloudflare ou certificado próprio

3. **Logs**
   - Armazenados em `/var/log/supervisor/`
   - **Substituição:** Winston, Pino, ELK Stack ou CloudWatch

4. **Hot Reload**
   - Funcionamento automático no Emergent
   - **Substituição:** Configurar Webpack Dev Server ou Vite

### 2.5 Como Substituir Fora do Emergent

**Alternativa 1: Docker Compose (Desenvolvimento/Staging)**
```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
  
  backend:
    build: ./backend
    ports:
      - "8001:8001"
    environment:
      - MONGO_URL=mongodb://mongodb:27017
      - DB_NAME=pmtf_frota
      - JWT_SECRET=${JWT_SECRET}
      - ADMIN_EMAIL=${ADMIN_EMAIL}
      - ADMIN_PASSWORD=${ADMIN_PASSWORD}
      - CORS_ORIGINS=http://localhost:3000
    depends_on:
      - mongodb
  
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_BACKEND_URL=http://localhost:8001
    depends_on:
      - backend

volumes:
  mongo_data:
```

**Alternativa 2: Kubernetes (Produção)**
- Deployment para backend (replicas: 2+)
- Deployment para frontend (replicas: 2+)
- StatefulSet para MongoDB ou usar MongoDB Atlas
- Service para comunicação interna
- Ingress para roteamento externo
- ConfigMap para variáveis não-sensíveis
- Secret para credenciais

**Alternativa 3: Serverless/PaaS**
- Frontend: Vercel, Netlify, Cloudflare Pages
- Backend: Heroku, Railway, Render, Google Cloud Run
- Banco: MongoDB Atlas, AWS DocumentDB

---

## 3. STACK E TECNOLOGIAS

### 3.1 Frontend - Linguagem e Runtime

**JavaScript (ES2020+)**
- Linguagem principal do frontend
- Usa features modernas: async/await, destructuring, optional chaining, nullish coalescing
- Transpilado por Babel (via CRA) para compatibilidade com navegadores antigos

**Node.js (inferido: v18+)**
- Runtime para executar build tools
- Gerenciador de pacotes: Yarn 1.22.22

### 3.2 Frontend - Framework e Bibliotecas

**React 19.0.0**
- Biblioteca principal para UI
- **Papel:** Renderização de componentes, gerenciamento de estado local, lifecycle
- **Hooks usados:** useState, useEffect, useContext, useRef, useNavigate
- **Features usadas:** Function components, Context API, Error boundaries (inferido)

**React Router DOM 7.5.1**
- Biblioteca de roteamento client-side
- **Papel:** Navegação SPA, rotas protegidas, redirecionamentos
- **Hooks usados:** useNavigate, useParams (não usado mas disponível)
- **Componentes usados:** BrowserRouter, Routes, Route, Navigate, NavLink

**React Scripts 5.0.1**
- Wrapper do Create React App
- **Papel:** Configuração de build, dev server, testes
- **Features:** Webpack, Babel, ESLint, Jest, hot reload

**CRACO (Create React App Configuration Override) 7.1.0**
- Customização de configurações CRA sem eject
- **Papel:** Permitir customizações do Webpack/Babel
- **Usado para:** Provavelmente aliases de import (@/)

### 3.3 Frontend - UI e Estilização

**TailwindCSS 3.4.17**
- Framework CSS utility-first
- **Papel:** Estilização de todos os componentes
- **Configuração:** `tailwind.config.js` com cores customizadas
- **Plugins:** tailwindcss-animate 1.0.7

**PostCSS 8.4.49**
- Processador de CSS
- **Papel:** Processar TailwindCSS e autoprefixer
- **Configuração:** `postcss.config.js`

**Autoprefixer 10.4.20**
- Plugin PostCSS para vendor prefixes
- **Papel:** Compatibilidade cross-browser

**Shadcn/UI (via Radix UI)**
- Collection de componentes React
- **Componentes usados:**
  - Button, Input, Label, Select, Dialog, Table, Tabs, Toast
  - Accordion, Alert Dialog, Avatar, Checkbox, Dropdown Menu
  - Hover Card, Menubar, Navigation Menu, Popover, Progress
  - Radio Group, Scroll Area, Separator, Slider, Switch, Tooltip
- **Papel:** Componentes acessíveis, estilizáveis e composáveis
- **Localização:** `/app/frontend/src/components/ui/`

**Lucide React 0.507.0**
- Biblioteca de ícones
- **Papel:** Todos os ícones do sistema
- **Ícones usados:** LayoutDashboard, Car, Activity, Wrench, XCircle, Users, LogOut, Menu, X, ArrowLeft, Edit, Trash2, History, FileDown, Printer, UserPlus

**Google Fonts (via CDN)**
- Fontes customizadas
- **Fontes usadas:**
  - **Outfit:** Títulos e headings (weights: 300-700)
  - **IBM Plex Sans:** Corpo de texto (weights: 300-700)
- **Carregamento:** `@import` no `index.css`

### 3.4 Frontend - Gerenciamento de Estado

**Context API (nativo React)**
- **AuthContext** (`/app/frontend/src/contexts/AuthContext.js`)
- **Papel:** Estado global de autenticação
- **Estado gerenciado:**
  - `user`: objeto do usuário logado ou `false` (não autenticado) ou `null` (checando)
  - `loading`: boolean indicando se está verificando autenticação
- **Métodos expostos:**
  - `login(email, password)`: Faz login
  - `register(email, password, name, role)`: Registra novo usuário
  - `logout()`: Faz logout
  - `checkAuth()`: Verifica autenticação atual

**Estado Local (useState)**
- Cada componente gerencia seu próprio estado
- **Exemplos:**
  - Formulários: estado dos inputs
  - Modais: estado aberto/fechado
  - Listas: estado de loading, dados, filtros
  - Erros: mensagens de erro

**Não usa:** Redux, Zustand, Jotai, Recoil ou qualquer biblioteca de estado global

### 3.5 Frontend - Requisições HTTP

**Axios 1.8.4**
- Cliente HTTP
- **Papel:** Todas as requisições para o backend
- **Configuração:**
  - Base URL: `process.env.REACT_APP_BACKEND_URL`
  - withCredentials: true (envia cookies)
  - Interceptors: não configurados (tratamento manual de erros)
- **Padrão de uso:**
```javascript
const { data } = await axios.get(
  `${BACKEND_URL}/api/endpoint`,
  { withCredentials: true }
);
```

### 3.6 Frontend - Validação de Formulários

**React Hook Form 7.56.2**
- Biblioteca para gerenciamento de formulários
- **Papel:** Validação, estado de formulário, submissão
- **Usado em:** Formulários de cadastro (inferido, pois está instalado)
- **Nota:** Formulários atuais usam validação HTML5 nativa, mas RHF está disponível

**Zod 3.24.4**
- Schema validation library
- **Papel:** Validação de schemas TypeScript-first
- **Integração:** @hookform/resolvers 5.0.1 para integrar com RHF
- **Nota:** Instalado mas não usado explicitamente no código atual

**Validação Nativa HTML5**
- Atributos `required` nos inputs
- Type validation (email, number)
- Pattern validation (via atributos HTML)

### 3.7 Frontend - Geração de Relatórios

**jsPDF 4.2.1**
- Biblioteca para geração de PDFs client-side
- **Papel:** Exportar listagens para PDF
- **Features usadas:**
  - Adição de imagens (logo PMTF)
  - Texto com diferentes tamanhos e fontes
  - Tabelas via jspdf-autotable

**jsPDF-AutoTable 5.0.7**
- Plugin jsPDF para tabelas
- **Papel:** Gerar tabelas formatadas no PDF
- **Configuração usada:**
  - Theme: 'grid'
  - headStyles: cor azul do sistema
  - Fonte reduzida (8pt) para caber mais dados

### 3.8 Frontend - Impressão

**react-to-print 3.3.0**
- Hook para impressão de componentes React
- **Papel:** Imprimir listagens
- **Uso:** `useReactToPrint()` aponta para ref do elemento a imprimir
- **Comportamento:** Abre dialog de impressão do navegador com preview

### 3.9 Frontend - Notificações

**Sonner 2.0.3**
- Biblioteca de toast notifications
- **Papel:** Feedback visual de ações (sucesso, erro, info)
- **Posicionamento:** top-right
- **Recursos:** richColors (cores automáticas por tipo)
- **Uso:**
```javascript
import { toast } from 'sonner';
toast.success('Veículo cadastrado com sucesso!');
toast.error('Erro ao carregar veículos');
```

### 3.10 Frontend - Utilitários

**clsx 2.1.1**
- Utilitário para concatenação de classes CSS
- **Papel:** Combinar classes condicionalmente
- **Uso:** `clsx('base-class', condition && 'conditional-class')`

**tailwind-merge 3.2.0**
- Mescla classes TailwindCSS inteligentemente
- **Papel:** Evitar conflitos de classes Tailwind
- **Wrapper:** Função `cn()` combina clsx + twMerge

**class-variance-authority 0.7.1**
- Criar variants de componentes
- **Papel:** Sistema de variantes para componentes UI
- **Usado em:** Componentes Shadcn (Button, Input, etc.)

**date-fns 4.1.0**
- Biblioteca de manipulação de datas
- **Papel:** Formatação de datas em português
- **Uso:** Formatação de datas no histórico e relatórios
- **Funções usadas:** `format()`, `parse()`, `toLocaleDateString()`

### 3.11 Backend - Linguagem e Runtime

**Python 3.11**
- Linguagem principal do backend
- Features modernas: type hints, async/await, dataclasses

### 3.12 Backend - Framework Web

**FastAPI 0.110.1**
- Framework web assíncrono
- **Papel:** API REST, roteamento, validação automática
- **Features usadas:**
  - Rotas com decorators (@api_router.get, @api_router.post)
  - Dependency injection (Depends)
  - Automatic OpenAPI docs (não usado mas disponível em /docs)
  - Pydantic integration para validação
  - Request/Response models

**Uvicorn 0.25.0**
- ASGI server
- **Papel:** Servir aplicação FastAPI
- **Configuração:**
  - Host: 0.0.0.0
  - Port: 8001
  - Reload: true (desenvolvimento)
  - Workers: 1 (desenvolvimento)

**Starlette**
- Framework base do FastAPI
- **Papel:** ASGI toolkit, CORS middleware
- **Middleware usado:** CORSMiddleware

### 3.13 Backend - Banco de Dados

**Motor 3.3.1**
- Driver MongoDB assíncrono para Python
- **Papel:** Todas as operações de banco
- **Cliente:** `AsyncIOMotorClient`
- **Operações usadas:**
  - `find()`, `find_one()`, `insert_one()`, `insert_many()`
  - `update_one()`, `update_many()`, `delete_one()`, `delete_many()`
  - `create_index()`
  - `to_list()`, `sort()`

**PyMongo 4.5.0**
- Driver MongoDB síncrono (dependência do Motor)
- **Papel:** Base para Motor, tipos BSON
- **Tipos usados:** `ObjectId`

### 3.14 Backend - Autenticação e Segurança

**PyJWT 2.12.1**
- JSON Web Tokens para Python
- **Papel:** Criar e validar JWT tokens
- **Algoritmo:** HS256
- **Claims usados:**
  - `sub`: user_id
  - `email`: email do usuário
  - `exp`: timestamp de expiração
  - `type`: "access" ou "refresh"

**bcrypt 4.1.3**
- Hashing de senhas
- **Papel:** Hash e verificação de senhas
- **Funções usadas:**
  - `gensalt()`: Gera salt
  - `hashpw()`: Faz hash da senha
  - `checkpw()`: Verifica senha

**python-jose 3.3.0**
- Biblioteca JWT alternativa (instalada mas não usada)
- PyJWT é usado no lugar

### 3.15 Backend - Validação

**Pydantic 2.6.4**
- Validação de dados com type hints
- **Papel:** Request/response validation
- **Modelos usados:**
  - `BaseModel`: Classe base
  - `EmailStr`: Validação de email
  - `Field`: Metadados de campos
  - `ConfigDict`: Configuração de modelos

**email-validator 2.2.0**
- Validação de email
- **Papel:** Usado pelo Pydantic para EmailStr

### 3.16 Backend - Utilitários

**python-dotenv 1.0.1**
- Carregamento de variáveis de ambiente
- **Papel:** Ler arquivo `.env`
- **Uso:** `load_dotenv()` no início do `server.py`

**python-multipart 0.0.9**
- Parser de multipart/form-data
- **Papel:** Upload de arquivos (não usado atualmente, mas disponível)

**requests 2.31.0**
- Cliente HTTP
- **Papel:** Não usado diretamente no código (dependência de outras libs)

### 3.17 Dependências de Desenvolvimento

**ESLint 9.23.0**
- Linter JavaScript
- **Configuração:** Regras padrão + React
- **Plugins:**
  - eslint-plugin-react 7.37.4
  - eslint-plugin-react-hooks 5.2.0
  - eslint-plugin-jsx-a11y 6.10.2
  - eslint-plugin-import 2.31.0

**Babel**
- Transpilador JavaScript (via CRA)
- **Plugin customizado:**
  - @babel/plugin-proposal-private-property-in-object 7.21.11

**Python Development Tools:**
- pytest 8.0.0: Testes unitários
- black 24.1.1: Formatador de código
- isort 5.13.2: Organizador de imports
- flake8 7.0.0: Linter Python
- mypy 1.8.0: Type checker
- **Nota:** Ferramentas instaladas mas não configuradas

### 3.18 Tecnologias Inferidas (não explicitamente instaladas)

**Webpack**
- Bundler (via Create React App)
- **Papel:** Bundle de código, tree shaking, code splitting
- **Configuração:** Oculta pelo CRA (ou customizada via CRACO)

**Babel**
- Transpilador (via CRA)
- **Papel:** Converter JSX e ES6+ para ES5

**CSS Loader / Style Loader**
- Loaders do Webpack (via CRA)
- **Papel:** Processar CSS/TailwindCSS

---

## 4. ESTRUTURA DE ARQUIVOS E PASTAS

### 4.1 Árvore Completa de Diretórios

```
/app/
├── backend/
│   ├── .env                          # Variáveis de ambiente do backend
│   ├── requirements.txt              # Dependências Python
│   └── server.py                     # Aplicação FastAPI principal
│
├── frontend/
│   ├── .env                          # Variáveis de ambiente do frontend
│   ├── package.json                  # Dependências Node.js
│   ├── yarn.lock                     # Lock file do Yarn
│   ├── tailwind.config.js            # Configuração TailwindCSS
│   ├── postcss.config.js             # Configuração PostCSS
│   ├── craco.config.js               # Configuração CRACO (inferido)
│   ├── public/
│   │   ├── index.html                # HTML template
│   │   ├── manifest.json             # PWA manifest
│   │   ├── robots.txt                # SEO robots
│   │   └── favicon.ico               # Ícone do site
│   │
│   └── src/
│       ├── index.js                  # Entry point
│       ├── App.js                    # Componente raiz com rotas
│       ├── App.css                   # Estilos globais mínimos
│       ├── index.css                 # Estilos Tailwind + fontes
│       │
│       ├── components/
│       │   ├── ProtectedRoute.js     # HOC para rotas protegidas
│       │   ├── DashboardLayout.js    # Layout com sidebar
│       │   ├── VehicleList.js        # Componente reutilizável de listagem
│       │   │
│       │   └── ui/                   # Componentes Shadcn/UI
│       │       ├── accordion.jsx
│       │       ├── alert-dialog.jsx
│       │       ├── aspect-ratio.jsx
│       │       ├── avatar.jsx
│       │       ├── button.jsx        # Usado em todo sistema
│       │       ├── checkbox.jsx
│       │       ├── collapsible.jsx
│       │       ├── context-menu.jsx
│       │       ├── dialog.jsx        # Usado para modais
│       │       ├── dropdown-menu.jsx
│       │       ├── hover-card.jsx
│       │       ├── input.jsx         # Usado em formulários
│       │       ├── label.jsx         # Usado em formulários
│       │       ├── menubar.jsx
│       │       ├── navigation-menu.jsx
│       │       ├── popover.jsx
│       │       ├── progress.jsx
│       │       ├── radio-group.jsx
│       │       ├── scroll-area.jsx
│       │       ├── select.jsx        # Usado para dropdowns
│       │       ├── separator.jsx
│       │       ├── slider.jsx
│       │       ├── sonner.tsx        # Toast notifications
│       │       ├── switch.jsx
│       │       ├── table.jsx         # Usado em todas listagens
│       │       ├── tabs.jsx
│       │       ├── toggle.jsx
│       │       ├── toggle-group.jsx
│       │       └── tooltip.jsx
│       │
│       ├── contexts/
│       │   └── AuthContext.js        # Context de autenticação
│       │
│       ├── pages/
│       │   ├── Login.js              # Página de login
│       │   ├── Dashboard.js          # Dashboard principal
│       │   ├── CadastrarVeiculo.js   # Formulário de cadastro
│       │   ├── VeiculosAtividade.js  # Lista veículos ativos
│       │   ├── VeiculosManutencao.js # Lista veículos manutenção
│       │   ├── VeiculosInativos.js   # Lista veículos inativos
│       │   └── Usuarios.js           # Gerenciamento de usuários
│       │
│       └── hooks/
│           └── use-toast.js          # Hook para toast (Sonner)
│
├── memory/
│   └── test_credentials.md           # Credenciais de teste (gerado)
│
├── design_guidelines.json             # Guidelines de design (gerado)
├── test_reports/
│   └── iteration_1.json              # Relatório de testes (gerado)
│
├── scripts/                          # Scripts utilitários (vazio)
├── tests/                            # Testes (não implementados)
├── .gitignore                        # Arquivos ignorados pelo Git
└── README.md                         # Documentação do projeto
```

### 4.2 Propósito de Cada Pasta

**`/app/backend/`**
- Contém toda a aplicação FastAPI
- Arquitetura monolítica em arquivo único
- `.env`: Configurações sensíveis
- `requirements.txt`: Dependências Python
- `server.py`: Único arquivo Python com toda lógica

**`/app/frontend/`**
- Aplicação React completa
- Estrutura padrão CRA (Create React App)

**`/app/frontend/public/`**
- Assets estáticos servidos diretamente
- Não processados pelo Webpack
- `index.html`: Template HTML com `<div id="root">`

**`/app/frontend/src/`**
- Código-fonte React
- Processado pelo Webpack

**`/app/frontend/src/components/`**
- Componentes React reutilizáveis
- `ui/`: Componentes de design system

**`/app/frontend/src/contexts/`**
- React Contexts para estado global
- Apenas AuthContext implementado

**`/app/frontend/src/pages/`**
- Componentes de página (rotas)
- Cada arquivo = uma rota

**`/app/frontend/src/hooks/`**
- Custom React hooks
- `use-toast.js`: Hook do Sonner

**`/app/memory/`**
- Diretório para arquivos temporários
- Criado em runtime
- `test_credentials.md`: Documentação de credenciais para testes

**`/app/test_reports/`**
- Relatórios de testes automatizados
- Gerados pelo testing agent

### 4.3 Principais Arquivos e Seus Propósitos

**ESSENCIAIS PARA PORTAR:**

**Backend:**
1. **`server.py`** (533 linhas)
   - ÚNICO arquivo Python
   - Contém tudo: models, routes, auth, startup
   - Deve ser refatorado em módulos ao portar

2. **`requirements.txt`**
   - Lista todas dependências Python
   - Versões específicas

3. **`.env`**
   - Variáveis de ambiente
   - NÃO commitar no Git

**Frontend:**
1. **`package.json`**
   - Metadados do projeto
   - Scripts: start, build, test
   - Dependências exatas

2. **`src/index.js`** (entry point)
   - Renderiza App em `#root`
   - Importa estilos globais

3. **`src/App.js`**
   - Componente raiz
   - Define todas as rotas
   - Wrappe com AuthProvider e Toaster

4. **`src/index.css`**
   - Imports do Tailwind
   - Import de fontes Google
   - CSS variables customizadas
   - Estilos base

5. **`src/contexts/AuthContext.js`**
   - Estado global de autenticação
   - Funções login, logout, checkAuth

6. **`src/components/ProtectedRoute.js`**
   - HOC para proteção de rotas
   - Verifica autenticação e role

7. **`src/components/DashboardLayout.js`**
   - Layout padrão do sistema
   - Sidebar, header, menu
   - Outlet para páginas

8. **`src/components/VehicleList.js`** (562 linhas)
   - Componente genérico de listagem
   - Reutilizado em 3 páginas
   - Contém toda lógica de tabela, filtros, histórico, edição, exclusão, PDF, impressão

9. **`src/pages/*.js`** (7 arquivos)
   - Cada arquivo = uma página
   - Componentes funcionais simples

10. **`src/components/ui/*.jsx`** (~30 arquivos)
    - Design system completo
    - Copiar toda pasta ao portar

11. **`tailwind.config.js`**
    - Configuração de cores, spacing, plugins
    - Essencial para manter design

12. **`postcss.config.js`**
    - Processamento de CSS
    - Tailwind + autoprefixer

### 4.4 Arquivos de Configuração

**`package.json`** - Metadados e scripts:
```json
{
  "scripts": {
    "start": "craco start",
    "build": "craco build",
    "test": "craco test"
  }
}
```

**`tailwind.config.js`** - Cores customizadas:
- Cores do tema: primary, secondary, muted, accent, destructive
- Fontes: Outfit, IBM Plex Sans
- Plugins: tailwindcss-animate

**`postcss.config.js`** - Processadores:
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**`.env` files:**
- Backend: MONGO_URL, DB_NAME, JWT_SECRET, credenciais admin, CORS
- Frontend: REACT_APP_BACKEND_URL, WDS_SOCKET_PORT

### 4.5 Arquivos Gerados (Não Portar)

- `node_modules/`: Dependências Node (recriar com `yarn install`)
- `build/`: Build de produção (recriar com `yarn build`)
- `__pycache__/`: Cache Python (recriar automaticamente)
- `.pytest_cache/`: Cache pytest
- `test_reports/`: Relatórios temporários
- `memory/`: Arquivos temporários

---

## 5. CONFIGURAÇÃO DO AMBIENTE

### 5.1 Variáveis de Ambiente - Backend

**Arquivo:** `/app/backend/.env`

```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="test_database"
CORS_ORIGINS="*"
JWT_SECRET="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2"
ADMIN_EMAIL="admin@pmtf.gov.br"
ADMIN_PASSWORD="admin123"
FRONTEND_URL="https://frota-veiculos.preview.emergentagent.com"
```

**Descrição de Cada Variável:**

| Variável | Obrigatória | Descrição | Exemplo Desenvolvimento | Exemplo Produção |
|----------|-------------|-----------|------------------------|------------------|
| `MONGO_URL` | ✅ Sim | Connection string MongoDB | `mongodb://localhost:27017` | `mongodb+srv://user:pass@cluster.mongodb.net` |
| `DB_NAME` | ✅ Sim | Nome do banco de dados | `test_database` | `pmtf_frota_producao` |
| `CORS_ORIGINS` | ✅ Sim | Origens permitidas no CORS | `*` (todos) ou `http://localhost:3000` | `https://frota.pmtf.gov.br` |
| `JWT_SECRET` | ✅ Sim | Chave secreta para assinar JWT | String aleatória 64+ chars | String aleatória criptograficamente segura |
| `ADMIN_EMAIL` | ✅ Sim | Email do admin padrão (seed) | `admin@pmtf.gov.br` | `admin@pmtf.gov.br` |
| `ADMIN_PASSWORD` | ✅ Sim | Senha do admin padrão (seed) | `admin123` | Senha forte complexa |
| `FRONTEND_URL` | ❌ Não* | URL do frontend (não mais usada) | `http://localhost:3000` | `https://frota.pmtf.gov.br` |

*`FRONTEND_URL` não é mais usada no código após correção de CORS, mas pode ser útil para outros propósitos.

### 5.2 Variáveis de Ambiente - Frontend

**Arquivo:** `/app/frontend/.env`

```env
REACT_APP_BACKEND_URL=https://frota-veiculos.preview.emergentagent.com
WDS_SOCKET_PORT=443
ENABLE_HEALTH_CHECK=false
```

**Descrição de Cada Variável:**

| Variável | Obrigatória | Descrição | Exemplo Desenvolvimento | Exemplo Produção |
|----------|-------------|-----------|------------------------|------------------|
| `REACT_APP_BACKEND_URL` | ✅ Sim | URL da API backend | `http://localhost:8001` | `https://api.frota.pmtf.gov.br` ou `https://frota.pmtf.gov.br` se mesmo domínio |
| `WDS_SOCKET_PORT` | ❌ Não | Porta WebSocket do dev server | `443` ou não definir | Não necessária em produção |
| `ENABLE_HEALTH_CHECK` | ❌ Não | Flag interna do Emergent | `false` | Remover em produção |

**IMPORTANTE:** No Create React App, apenas variáveis com prefixo `REACT_APP_` são expostas ao bundle frontend. Outras são ignoradas.

### 5.3 Como Gerar Valores Seguros

**JWT_SECRET (64+ caracteres aleatórios):**
```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Python
python -c "import secrets; print(secrets.token_hex(32))"

# OpenSSL
openssl rand -hex 32
```

**Senha de Admin:**
- Mínimo 12 caracteres
- Letras maiúsculas, minúsculas, números, símbolos
- Usar gerenciador de senhas
- Nunca `admin123` em produção

### 5.4 Configuração Local (Desenvolvimento)

**Pré-requisitos:**
- Node.js 18+
- Python 3.11+
- MongoDB 7.0+ (ou Docker)
- Yarn 1.22+

**Passo a Passo:**

1. **Clonar/Copiar Código:**
```bash
git clone <repo> pmtf-frota
cd pmtf-frota
```

2. **Iniciar MongoDB (Option A: Local):**
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

**Iniciar MongoDB (Option B: Docker):**
```bash
docker run -d -p 27017:27017 --name mongo mongo:7
```

3. **Configurar Backend:**
```bash
cd backend

# Criar virtualenv
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate     # Windows

# Instalar dependências
pip install -r requirements.txt

# Criar .env
cat > .env << 'EOF'
MONGO_URL="mongodb://localhost:27017"
DB_NAME="pmtf_frota_dev"
CORS_ORIGINS="http://localhost:3000"
JWT_SECRET="dev-secret-change-in-production-a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
ADMIN_EMAIL="admin@pmtf.gov.br"
ADMIN_PASSWORD="admin123"
EOF

# Iniciar servidor
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

4. **Configurar Frontend (novo terminal):**
```bash
cd frontend

# Instalar dependências
yarn install

# Criar .env
cat > .env << 'EOF'
REACT_APP_BACKEND_URL=http://localhost:8001
EOF

# Iniciar dev server
yarn start
```

5. **Acessar Aplicação:**
- Frontend: http://localhost:3000
- Backend: http://localhost:8001
- Docs API: http://localhost:8001/docs (FastAPI auto-generated)

6. **Login Inicial:**
- Email: `admin@pmtf.gov.br`
- Senha: `admin123`

### 5.5 Build de Produção

**Backend:**
```bash
# Backend não precisa build, é interpretado
# Apenas garantir que requirements.txt está atualizado
pip freeze > requirements.txt
```

**Frontend:**
```bash
cd frontend
yarn build

# Resultado em: build/
# - build/index.html
# - build/static/js/*.js (bundled)
# - build/static/css/*.css (processed)
```

**Servir Build:**
```bash
# Opção 1: serve (npm package)
npx serve -s build -p 3000

# Opção 2: Python
python -m http.server 3000 --directory build

# Opção 3: Nginx (configurar proxy reverso)
```

### 5.6 Produção - Deploy Manual

**Estrutura de Diretórios em Produção:**
```
/opt/pmtf-frota/
├── backend/
│   ├── venv/
│   ├── .env
│   ├── requirements.txt
│   └── server.py
├── frontend/
│   └── build/
└── logs/
```

**Comando de Produção - Backend:**
```bash
# Com Gunicorn (mais robusto)
gunicorn server:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8001 \
  --access-logfile logs/access.log \
  --error-logfile logs/error.log \
  --daemon

# Ou com Uvicorn direto
uvicorn server:app --host 0.0.0.0 --port 8001 --workers 4
```

**Frontend em Produção:**
- Servir `build/` com Nginx, Apache ou CDN
- Configurar regras de rewrite para SPA (todas rotas → index.html)

**Exemplo Nginx:**
```nginx
server {
    listen 80;
    server_name frota.pmtf.gov.br;
    
    # Frontend
    location / {
        root /opt/pmtf-frota/frontend/build;
        try_files $uri /index.html;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 5.7 Variáveis de Ambiente por Ambiente

**Desenvolvimento:**
- MongoDB local
- CORS aberto (*)
- Logs verbose
- JWT_SECRET simples (não produção)
- Hot reload ativado

**Staging:**
- MongoDB dedicado (ou Atlas)
- CORS restrito ao domínio staging
- Logs moderados
- JWT_SECRET forte
- Sem hot reload

**Produção:**
- MongoDB replicado (Alta disponibilidade)
- CORS restrito ao domínio produção
- Logs estruturados (JSON)
- JWT_SECRET rotacionado
- Monitoramento ativo
- Backup automatizado

---

## 6. FRONTEND DETALHADO

Devido ao tamanho massivo desta seção, vou detalhar cada componente/página de forma extremamente completa.

### 6.1 Entry Point - `src/index.js`

**Responsabilidade:** 
- Entry point da aplicação React
- Renderiza componente raiz no DOM

**Código:**
```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**Dependências:**
- React 19 createRoot API
- StrictMode para avisos de desenvolvimento
- Monta em `<div id="root">` do `public/index.html`

---

### 6.2 Componente Raiz - `src/App.js`

**Responsabilidade:**
- Configurar roteamento da aplicação
- Envolver com providers (Auth, Toast)
- Definir estrutura de rotas e proteções

**Props:** Nenhuma

**Estados:** Nenhum (estado em contexts)

**Estrutura:**
```javascript
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './components/DashboardLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { CadastrarVeiculo } from './pages/CadastrarVeiculo';
import { VeiculosAtividade } from './pages/VeiculosAtividade';
import { VeiculosManutencao } from './pages/VeiculosManutencao';
import { VeiculosInativos } from './pages/VeiculosInativos';
import { Usuarios } from './pages/Usuarios';
import { Toaster } from './components/ui/sonner';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rota pública */}
          <Route path="/login" element={<Login />} />
          
          {/* Rotas protegidas com layout */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Rota index */}
            <Route index element={<Dashboard />} />
            
            {/* Rota apenas ADMIN */}
            <Route
              path="cadastrar-veiculo"
              element={
                <ProtectedRoute adminOnly>
                  <CadastrarVeiculo />
                </ProtectedRoute>
              }
            />
            
            {/* Rotas acessíveis a todos autenticados */}
            <Route path="veiculos-atividade" element={<VeiculosAtividade />} />
            <Route path="veiculos-manutencao" element={<VeiculosManutencao />} />
            <Route path="veiculos-inativos" element={<VeiculosInativos />} />
            
            {/* Rota apenas ADMIN */}
            <Route
              path="usuarios"
              element={
                <ProtectedRoute adminOnly>
                  <Usuarios />
                </ProtectedRoute>
              }
            />
          </Route>
          
          {/* Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}

export default App;
```

**Rotas Definidas:**
1. `/login` - Pública, não protegida
2. `/dashboard` - Protegida, com layout, Outlet para subrotas
3. `/dashboard/cadastrar-veiculo` - Protegida + adminOnly
4. `/dashboard/veiculos-atividade` - Protegida
5. `/dashboard/veiculos-manutencao` - Protegida
6. `/dashboard/veiculos-inativos` - Protegida
7. `/dashboard/usuarios` - Protegida + adminOnly
8. `/` - Redirect para `/dashboard`
9. `*` (404) - Redirect para `/dashboard`

**Providers:**
- `AuthProvider`: Estado global de autenticação
- `BrowserRouter`: Roteamento baseado em URL
- `Toaster`: Sistema de notificações

**Navegação:**
- Hash routing: NÃO (usa BrowserRouter, history mode)
- Lazy loading: NÃO (imports estáticos)
- Code splitting: Apenas o default do CRA (chunks por rotas)

---

### 6.3 Context - `src/contexts/AuthContext.js`

**Responsabilidade:**
- Gerenciar estado global de autenticação
- Prover funções de login, logout, registro
- Verificar autenticação ao carregar app
- Armazenar dados do usuário logado

**Estados Internos:**
```javascript
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);
```

**Estados Possíveis do `user`:**
- `null`: Checando autenticação (initial state)
- `false`: Não autenticado
- `{...}`: Objeto do usuário autenticado

**Valor Exposto pelo Context:**
```javascript
{
  user,        // null | false | UserObject
  loading,     // boolean
  login,       // (email, password) => Promise
  register,    // (email, password, name, role) => Promise
  logout,      // () => Promise
  checkAuth    // () => Promise (usado internamente)
}
```

**Código Completo:**
```javascript
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data } = await axios.get(`${BACKEND_URL}/api/auth/me`, {
        withCredentials: true
      });
      setUser(data);
    } catch (error) {
      setUser(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { data } = await axios.post(
      `${BACKEND_URL}/api/auth/login`,
      { email, password },
      { withCredentials: true }
    );
    setUser(data);
    return data;
  };

  const register = async (email, password, name, role) => {
    const { data } = await axios.post(
      `${BACKEND_URL}/api/auth/register`,
      { email, password, name, role },
      { withCredentials: true }
    );
    setUser(data);
    return data;
  };

  const logout = async () => {
    await axios.post(
      `${BACKEND_URL}/api/auth/logout`,
      {},
      { withCredentials: true }
    );
    setUser(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
```

**Fluxo de Autenticação:**
1. App inicia → AuthProvider monta
2. `useEffect` chama `checkAuth()`
3. `checkAuth()` faz GET `/api/auth/me`
4. Se sucesso (200): `setUser(data)` - usuário autenticado
5. Se erro (401): `setUser(false)` - não autenticado
6. `setLoading(false)` - parou de checar

**Persistência:**
- JWT armazenado em **cookie httpOnly** (gerenciado pelo backend)
- Frontend não acessa o token diretamente
- Cookie enviado automaticamente com `withCredentials: true`

**Tratamento de Erro:**
- Erros em `login()` e `register()` são propagados para o componente
- Componente deve capturar com try/catch e exibir mensagem

---

### 6.4 HOC - `src/components/ProtectedRoute.js`

**Responsabilidade:**
- Proteger rotas que exigem autenticação
- Opcionalmente exigir role ADMIN
- Exibir loading enquanto checa autenticação
- Redirecionar para login se não autenticado
- Redirecionar para dashboard se não for admin

**Props:**
```javascript
{
  children: ReactNode,     // Componente a renderizar se autenticado
  adminOnly: boolean       // Se true, exige role ADMIN (default: false)
}
```

**Estados:** Nenhum (usa AuthContext)

**Código Completo:**
```javascript
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
```

**Lógica de Renderização:**
1. Se `loading === true`: Exibe spinner
2. Se `user === false` (ou null): Redirect `/login`
3. Se `adminOnly === true` E `user.role !== 'ADMIN'`: Redirect `/dashboard`
4. Senão: Renderiza `children`

**Uso:**
```javascript
// Rota protegida simples
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />

// Rota protegida só ADMIN
<Route path="/usuarios" element={
  <ProtectedRoute adminOnly>
    <Usuarios />
  </ProtectedRoute>
} />
```

---

### 6.5 Layout - `src/components/DashboardLayout.js`

**Responsabilidade:**
- Layout padrão para todas as páginas do dashboard
- Sidebar com navegação
- Header mobile com menu hamburger
- Área de conteúdo (Outlet)
- Botão de logout
- Filtrar menu items por role

**Props:** Nenhuma (recebe children via Outlet)

**Estados:**
```javascript
const [sidebarOpen, setSidebarOpen] = useState(false);
```

**Hooks Usados:**
- `useAuth()`: Pegar dados do usuário
- `useNavigate()`: Navegação programática
- `useState()`: Estado do menu mobile

**Estrutura Visual:**
```
┌─────────────────────────────────────────────┐
│ ┌────────┐ ┌──────────────────────────────┐│
│ │        │ │                              ││
│ │        │ │                              ││
│ │ SIDEBAR│ │     MAIN CONTENT             ││
│ │        │ │     (Outlet)                 ││
│ │        │ │                              ││
│ └────────┘ └──────────────────────────────┘│
└─────────────────────────────────────────────┘
```

**Código Completo (simplificado para visualização):**

```javascript
import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import {
  LayoutDashboard, Car, Activity, Wrench, XCircle, Users, LogOut, Menu, X
} from 'lucide-react';

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, adminOnly: false },
    { path: '/dashboard/cadastrar-veiculo', label: 'Cadastrar Veículo', icon: Car, adminOnly: true },
    { path: '/dashboard/veiculos-atividade', label: 'Veículos em Atividade', icon: Activity, adminOnly: false },
    { path: '/dashboard/veiculos-manutencao', label: 'Veículos em Manutenção', icon: Wrench, adminOnly: false },
    { path: '/dashboard/veiculos-inativos', label: 'Veículos Inativos', icon: XCircle, adminOnly: false },
    { path: '/dashboard/usuarios', label: 'Usuários', icon: Users, adminOnly: true }
  ];

  const filteredMenuItems = menuItems.filter(
    (item) => !item.adminOnly || user?.role === 'ADMIN'
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar Desktop/Mobile */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-primary text-primary-foreground transform transition-transform duration-200 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="p-6 border-b border-primary-foreground/10">
            <div className="flex items-center gap-3">
              <img
                src="https://www.teixeiradefreitas.ba.gov.br/wp-content/uploads/2022/05/brasao-pmtf-610x768.png"
                alt="Brasão PMTF"
                className="w-10 h-12 object-contain"
              />
              <div>
                <h1 className="text-lg font-bold leading-tight">Frota de Veículos</h1>
                <p className="text-xs text-primary-foreground/80">PMTF</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-foreground text-primary font-medium'
                        : 'text-primary-foreground/90 hover:bg-primary-foreground/10'
                    }`
                  }
                  data-testid={`nav-${item.path.split('/').pop()}`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* User Info + Logout */}
          <div className="p-4 border-t border-primary-foreground/10">
            <div className="mb-3">
              <p className="text-sm font-medium text-primary-foreground">{user?.name}</p>
              <p className="text-xs text-primary-foreground/70">{user?.email}</p>
              <p className="text-xs text-primary-foreground/60 mt-1">
                Perfil: {user?.role}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="w-full bg-transparent border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
              data-testid="logout-button"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Mobile */}
        <header className="bg-card border-b border-border px-6 py-4 lg:hidden">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-foreground">Frota de Veículos PMTF</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              data-testid="mobile-menu-button"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
```

**Comportamento Responsivo:**
- **Desktop (lg+):** Sidebar fixa visível
- **Mobile/Tablet (<lg):** Sidebar oculta, abre ao clicar menu hamburger
- **Overlay:** Ao abrir sidebar mobile, overlay escuro fecha ao clicar

**Navegação Ativa:**
- `NavLink` aplica classe `isActive` automaticamente
- Item ativo: fundo branco, texto azul
- Item inativo: texto branco, hover azul claro

**Filtro de Menu por Role:**
```javascript
const filteredMenuItems = menuItems.filter(
  (item) => !item.adminOnly || user?.role === 'ADMIN'
);
```
- Remove items com `adminOnly: true` se usuário não for ADMIN

**Data-testid:**
- `nav-dashboard`, `nav-cadastrar-veiculo`, `nav-veiculos-atividade`, etc.
- `logout-button`
- `mobile-menu-button`

---

Devido ao limite de resposta, vou continuar com as páginas principais em blocos separados. Aqui está a continuação:

---

### 6.6 Página Login - `src/pages/Login.js`

**Responsabilidade:**
- Formulário de autenticação
- Validação de email/senha
- Chamada de API de login
- Redirecionamento após sucesso
- Exibição de erros

**Props:** Nenhuma

**Estados:**
```javascript
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [error, setError] = useState('');
const [loading, setLoading] = useState(false);
```

**Hooks:**
- `useState()`: Gerenciar estados
- `useAuth()`: Função login do context
- `useNavigate()`: Redirecionar após login

**Validações:**
- Email: type="email" (validação HTML5)
- Senha: required
- Campos obrigatórios: atributo `required`

**Tratamento de Erro:**
```javascript
const formatApiErrorDetail = (detail) => {
  if (detail == null) return 'Algo deu errado. Tente novamente.';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail))
    return detail
      .map((e) => (e && typeof e.msg === 'string' ? e.msg : JSON.stringify(e)))
      .filter(Boolean)
      .join(' ');
  if (detail && typeof detail.msg === 'string') return detail.msg;
  return String(detail);
};
```

**Código do handleSubmit:**
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    await login(email, password);
    navigate('/dashboard');
  } catch (err) {
    setError(formatApiErrorDetail(err.response?.data?.detail) || err.message);
  } finally {
    setLoading(false);
  }
};
```

**Layout Visual:**
```
┌─────────────────────────────────────────────────────┐
│ ┌──────────────────┐ ┌─────────────────────────────┐│
│ │                  │ │                             ││
│ │   Imagem Fundo   │ │      FORMULÁRIO LOGIN       ││
│ │   + Logo PMTF    │ │                             ││
│ │   + Título       │ │   Email: [_______________]  ││
│ │                  │ │   Senha: [_______________]  ││
│ │                  │ │                             ││
│ │                  │ │   [    Entrar    ]          ││
│ │                  │ │                             ││
│ └──────────────────┘ └─────────────────────────────┘│
└─────────────────────────────────────────────────────┘
   50% esquerda           50% direita
```

**Design:**
- Esquerda: Imagem de fundo corporativa + overlay azul + logo + título
- Direita: Card branco com formulário
- Mobile: Apenas direita, logo no topo

**Data-testid:**
- `login-email-input`
- `login-password-input`
- `login-submit-button`
- `login-error` (quando há erro)

**Fluxo:**
1. Usuário preenche email/senha
2. Clica "Entrar"
3. `handleSubmit` previne default
4. Limpa erro anterior
5. `setLoading(true)` → botão vira "Entrando..."
6. Chama `login(email, password)` do AuthContext
7. Se sucesso: navega para `/dashboard`
8. Se erro: exibe mensagem formatada
9. `setLoading(false)`

---

### 6.7 Página Dashboard - `src/pages/Dashboard.js`

**Responsabilidade:**
- Exibir cards de navegação
- Filtrar cards por role (admin vs padrão)
- Navegar para telas específicas ao clicar

**Props:** Nenhuma

**Estados:** Nenhum

**Hooks:**
- `useAuth()`: Pegar dados do usuário
- `useNavigate()`: Navegação ao clicar cards

**Cards Admin (5 cards):**
1. Cadastrar Veículo → `/dashboard/cadastrar-veiculo`
2. Veículos em Atividade → `/dashboard/veiculos-atividade`
3. Veículos em Manutenção → `/dashboard/veiculos-manutencao`
4. Veículos Inativos → `/dashboard/veiculos-inativos`
5. Gerenciar Usuários → `/dashboard/usuarios`

**Cards Padrão (3 cards):**
1. Veículos em Atividade
2. Veículos em Manutenção
3. Veículos Inativos

**Código dos Cards:**
```javascript
const cards = [
  {
    title: 'Veículos em Atividade',
    icon: Activity,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    path: '/dashboard/veiculos-atividade'
  },
  // ... outros cards
];

if (user?.role === 'ADMIN') {
  cards.unshift({
    title: 'Cadastrar Veículo',
    icon: Car,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    path: '/dashboard/cadastrar-veiculo'
  });
  cards.push({
    title: 'Gerenciar Usuários',
    icon: Users,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    path: '/dashboard/usuarios'
  });
}
```

**Renderização dos Cards:**
```javascript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {cards.map((card, index) => {
    const Icon = card.icon;
    return (
      <div
        key={index}
        onClick={() => navigate(card.path)}
        className="bg-card border border-border rounded-md p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-1"
        data-testid={`dashboard-card-${index}`}
      >
        <div className="flex items-start gap-4">
          <div className={`${card.bgColor} ${card.color} p-3 rounded-md`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-slate-800">{card.title}</h3>
            <p className="text-sm text-slate-500 mt-1">Clique para acessar</p>
          </div>
        </div>
      </div>
    );
  })}
</div>
```

**Comportamento Hover:**
- Sombra aumenta
- Card levanta 1px (`-translate-y-1`)
- Transição suave 200ms

**Responsividade:**
- Mobile: 1 coluna
- Tablet: 2 colunas
- Desktop: 3 colunas

---

### 6.8 Página Cadastro Veículo - `src/pages/CadastrarVeiculo.js`

**Responsabilidade:**
- Formulário de cadastro de novo veículo
- Validação de campos obrigatórios
- Envio para API
- Redirecionamento após sucesso
- Exibição de feedback (toast)

**Props:** Nenhuma

**Estados:**
```javascript
const [loading, setLoading] = useState(false);
const [formData, setFormData] = useState({
  placa: '',
  marca: '',
  modelo: '',
  ano_fabricacao: '',
  chassi: '',
  status: 'EM_ATIVIDADE',
  lotacao_atual: '',
  departamento: ''
});
```

**Campos do Formulário:**
1. **Placa** - Input text, obrigatório
2. **Marca** - Input text, obrigatório
3. **Modelo** - Input text, obrigatório
4. **Ano de Fabricação** - Input number, obrigatório
5. **Número do Chassi** - Input text, obrigatório
6. **Status** - Select (Em Atividade, Em Manutenção, Inativo)
7. **Lotação Atual** - Input text, obrigatório
8. **Sublotação/Departamento** - Input text, obrigatório

**HandleChange:**
```javascript
const handleChange = (e) => {
  setFormData({ ...formData, [e.target.name]: e.target.value });
};

const handleStatusChange = (value) => {
  setFormData({ ...formData, status: value });
};
```

**HandleSubmit:**
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    await axios.post(
      `${BACKEND_URL}/api/vehicles`,
      { ...formData, ano_fabricacao: parseInt(formData.ano_fabricacao) },
      { withCredentials: true }
    );
    toast.success('Veículo cadastrado com sucesso!');
    navigate('/dashboard/veiculos-atividade');
  } catch (error) {
    toast.error(error.response?.data?.detail || 'Erro ao cadastrar veículo');
  } finally {
    setLoading(false);
  }
};
```

**Layout:**
```
Botão Voltar

Título: Cadastrar Veículo
Subtítulo: Adicione um novo veículo à frota

┌───────────────────────────────────────────┐
│ [Placa*]        [Marca*]                  │
│                                           │
│ [Modelo*]       [Ano de Fabricação*]     │
│                                           │
│ [Número do Chassi*]                       │
│                                           │
│ [Status*]                                 │
│                                           │
│ [Lotação Atual*]                          │
│                                           │
│ [Sublotação / Departamento*]              │
│                                           │
│ [Cadastrar Veículo]  [Cancelar]           │
└───────────────────────────────────────────┘
```

**Validações:**
- Campos obrigatórios: HTML5 `required`
- Ano: type="number"
- Validação backend: Pydantic no FastAPI

**Feedback:**
- Sucesso: Toast verde "Veículo cadastrado com sucesso!"
- Erro: Toast vermelho com mensagem da API
- Loading: Botão vira "Cadastrando..."

**Data-testid:**
- `placa-input`, `marca-input`, `modelo-input`, `ano-input`
- `chassi-input`, `status-select`, `lotacao-input`, `departamento-input`
- `submit-vehicle-button`, `cancel-button`
- `back-to-dashboard-button`

---

### 6.9 Componente Reutilizável - `src/components/VehicleList.js`

**Responsabilidade:**
- Componente genérico de listagem de veículos
- Reutilizado em 3 páginas (Atividade, Manutenção, Inativos)
- Filtros de busca por placa e marca
- Tabela com todos os dados
- Ações: visualizar histórico, editar, deletar
- Exportação PDF e impressão
- Modal de edição
- Modal de histórico

**Props:**
```javascript
{
  status: string,          // "EM_ATIVIDADE" | "EM_MANUTENCAO" | "INATIVO"
  title: string,           // "Veículos em Atividade" etc
  endpoint: string,        // "/em-atividade" etc
  dataTestId: string       // "veiculos-atividade-page" etc
}
```

**Estados:**
```javascript
const [vehicles, setVehicles] = useState([]);
const [loading, setLoading] = useState(true);
const [editingVehicle, setEditingVehicle] = useState(null);
const [editDialogOpen, setEditDialogOpen] = useState(false);
const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
const [selectedVehicleHistory, setSelectedVehicleHistory] = useState([]);
const [selectedVehicle, setSelectedVehicle] = useState(null);
const [searchPlaca, setSearchPlaca] = useState('');
const [searchMarca, setSearchMarca] = useState('');
```

**useEffect para Fetch:**
```javascript
useEffect(() => {
  fetchVehicles();
}, [searchPlaca, searchMarca]);
```
- Re-fetcha quando filtros mudam (debounce implícito via React)

**fetchVehicles:**
```javascript
const fetchVehicles = async () => {
  setLoading(true);
  try {
    const params = new URLSearchParams();
    if (searchPlaca) params.append('placa', searchPlaca);
    if (searchMarca) params.append('marca', searchMarca);
    
    const { data } = await axios.get(
      `${BACKEND_URL}/api/vehicles${endpoint}${params.toString() ? '?' + params.toString() : ''}`,
      { withCredentials: true }
    );
    setVehicles(data);
  } catch (error) {
    toast.error('Erro ao carregar veículos');
  } finally {
    setLoading(false);
  }
};
```

**handleEdit:**
```javascript
const handleEdit = (vehicle) => {
  setEditingVehicle({ ...vehicle });
  setEditDialogOpen(true);
};
```

**handleUpdateVehicle:**
```javascript
const handleUpdateVehicle = async () => {
  try {
    await axios.put(
      `${BACKEND_URL}/api/vehicles/${editingVehicle.id}`,
      editingVehicle,
      { withCredentials: true }
    );
    toast.success('Veículo atualizado com sucesso!');
    setEditDialogOpen(false);
    fetchVehicles();
  } catch (error) {
    toast.error('Erro ao atualizar veículo');
  }
};
```

**handleDelete:**
```javascript
const handleDelete = async (vehicleId) => {
  if (!window.confirm('Tem certeza que deseja deletar este veículo?')) return;

  try {
    await axios.delete(`${BACKEND_URL}/api/vehicles/${vehicleId}`, {
      withCredentials: true
    });
    toast.success('Veículo deletado com sucesso!');
    fetchVehicles();
  } catch (error) {
    toast.error('Erro ao deletar veículo');
  }
};
```

**handleViewHistory:**
```javascript
const handleViewHistory = async (vehicle) => {
  setSelectedVehicle(vehicle);
  try {
    const { data } = await axios.get(
      `${BACKEND_URL}/api/vehicles/${vehicle.id}/historico`,
      { withCredentials: true }
    );
    setSelectedVehicleHistory(data);
    setHistoryDialogOpen(true);
  } catch (error) {
    toast.error('Erro ao carregar histórico');
  }
};
```

**handleExportPDF (simplificado):**
```javascript
const handleExportPDF = () => {
  const doc = new jsPDF();

  // Tentar carregar logo
  const img = new Image();
  img.src = 'https://www.teixeiradefreitas.ba.gov.br/wp-content/uploads/2022/05/brasao-pmtf-610x768.png';
  img.crossOrigin = 'anonymous';

  img.onload = () => {
    // Adicionar logo
    doc.addImage(img, 'PNG', 14, 10, 15, 18);
    
    // Título
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Frota de Veículos PMTF', 35, 18);
    
    // Subtítulo
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(title, 35, 25);
    
    // Data
    doc.setFontSize(10);
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 14, 35);
    
    // Tabela
    const tableData = vehicles.map((v) => [
      v.placa,
      v.marca,
      v.modelo,
      v.ano_fabricacao,
      statusLabels[v.status],
      v.lotacao_atual,
      v.departamento || '-'
    ]);

    doc.autoTable({
      startY: 40,
      head: [['Placa', 'Marca', 'Modelo', 'Ano', 'Status', 'Lotação', 'Sublotação/Depto']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [30, 58, 138] },
      margin: { top: 40 },
      styles: { fontSize: 8 }
    });

    doc.save(`${title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
  };

  img.onerror = () => {
    // Fallback: gerar PDF sem logo
    // (código similar ao acima, sem addImage)
  };
};
```

**handlePrint:**
```javascript
const printRef = useRef();

const handlePrint = useReactToPrint({
  content: () => printRef.current
});
```

**Layout da Página:**
```
┌─ Botão Voltar ──────────────────────────────────────┐
│                                                      │
│ Título                      [Exportar PDF] [Imprimir]│
│ X veículo(s) encontrado(s)                          │
│                                                      │
├─ FILTROS ──────────────────────────────────────────┤
│ Filtrar por Placa  Filtrar por Marca  [Limpar]     │
│                                                      │
├─ TABELA ───────────────────────────────────────────┤
│ Placa | Marca | Modelo | Ano | Status | ...        │
│ ABC   | Ford  | Ranger | 2022| Ativo  | ...        │
│ ...                                                  │
└──────────────────────────────────────────────────────┘
```

**Tabela - Colunas:**
1. Placa (bold)
2. Marca
3. Modelo
4. Ano
5. Status (badge colorido)
6. Lotação
7. Sublotação/Depto (cinza)
8. Ações (histórico sempre, editar/deletar só admin)

**Modal de Edição:**
```
Título: Editar Veículo

[Placa: _______________]

[Marca: __] [Modelo: __]

[Status: dropdown]

[Lotação Atual: _______________]

[Sublotação/Departamento: _______________]

[Salvar Alterações] [Cancelar]
```

**Modal de Histórico:**
```
Título: Histórico de Lotação - ABC-1234

┌────────────────────────────────────────────────┐
│ Lotação | Depto | Início | Fim | Status        │
│ Sec.    | Dept. | 01/01  |  -  | Atual (verde) │
│ Saúde   | Vig.  | 20/24  |     |               │
└────────────────────────────────────────────────┘
```

**Responsividade:**
- Tabela: scroll horizontal em mobile
- Filtros: stack vertical em mobile
- Botões: full width em mobile

**Tratamento de Estados:**
- Loading: Spinner centralizado
- Empty state: "Nenhum veículo encontrado"
- Erro: Toast de erro

**Data-testid (principais):**
- `back-button`
- `export-pdf-button`, `print-button`
- `filter-placa-input`, `filter-marca-input`, `clear-filters-button`
- `vehicle-row-{placa}`
- `history-button-{placa}`, `edit-button-{placa}`, `delete-button-{placa}`
- `edit-vehicle-dialog`, `history-dialog`

---

Continuarei com as páginas restantes e seções seguintes em mensagens subsequentes devido ao limite de caracteres. A documentação está seguindo o formato solicitado com todos os detalhes técnicos.

Gostaria que eu continue com:
- 6.10 Páginas de Listagem (VeiculosAtividade, etc.)
- 6.11 Página de Usuários
- 6.12 Sistema de Estilos e Design
- E depois as seções 7-21?
