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

Continuando a documentação técnica completa:

---

### 6.10 Páginas de Listagem de Veículos

**6.10.1 VeiculosAtividade - `src/pages/VeiculosAtividade.js`**

**Responsabilidade:**
- Wrapper para VehicleList com parâmetros específicos de veículos ativos

**Código Completo:**
```javascript
import React from 'react';
import { VehicleList } from '../components/VehicleList';

export const VeiculosAtividade = () => {
  return (
    <VehicleList
      status="EM_ATIVIDADE"
      title="Veículos em Atividade"
      endpoint="/em-atividade"
      dataTestId="veiculos-atividade-page"
    />
  );
};
```

**Props Passadas:**
- `status`: String usada para identificação (não usada internamente atualmente)
- `title`: Exibido no cabeçalho da página
- `endpoint`: Concatenado com `/api/vehicles` para formar URL completa
- `dataTestId`: Atributo data-testid do container principal

**Chamada de API Resultante:**
```
GET https://frota-veiculos.preview.emergentagent.com/api/vehicles/em-atividade
```

**Filtro Aplicado no Backend:**
```python
{"status": "EM_ATIVIDADE"}
```

---

**6.10.2 VeiculosManutencao - `src/pages/VeiculosManutencao.js`**

**Código Completo:**
```javascript
import React from 'react';
import { VehicleList } from '../components/VehicleList';

export const VeiculosManutencao = () => {
  return (
    <VehicleList
      status="EM_MANUTENCAO"
      title="Veículos em Manutenção"
      endpoint="/em-manutencao"
      dataTestId="veiculos-manutencao-page"
    />
  );
};
```

**Chamada de API:**
```
GET /api/vehicles/em-manutencao
```

**Filtro Backend:**
```python
{"status": "EM_MANUTENCAO"}
```

---

**6.10.3 VeiculosInativos - `src/pages/VeiculosInativos.js`**

**Código Completo:**
```javascript
import React from 'react';
import { VehicleList } from '../components/VehicleList';

export const VeiculosInativos = () => {
  return (
    <VehicleList
      status="INATIVO"
      title="Veículos Inativos"
      endpoint="/inativos"
      dataTestId="veiculos-inativos-page"
    />
  );
};
```

**Chamada de API:**
```
GET /api/vehicles/inativos
```

**Filtro Backend:**
```python
{"status": "INATIVO"}
```

---

### 6.11 Página de Gerenciamento de Usuários - `src/pages/Usuarios.js`

**Responsabilidade:**
- Listar todos os usuários do sistema
- Permitir criação de novos usuários (ADMIN)
- Permitir exclusão de usuários (ADMIN)
- Exibir brasão PMTF no cabeçalho da tabela

**Props:** Nenhuma

**Estados:**
```javascript
const [users, setUsers] = useState([]);
const [loading, setLoading] = useState(true);
const [dialogOpen, setDialogOpen] = useState(false);
const [formData, setFormData] = useState({
  email: '',
  password: '',
  name: '',
  role: 'PADRÃO'
});
```

**Hooks:**
- `useState()`: Gerenciar estados
- `useNavigate()`: Voltar para dashboard
- `useEffect()`: Carregar usuários ao montar

**fetchUsers:**
```javascript
const fetchUsers = async () => {
  setLoading(true);
  try {
    const { data } = await axios.get(`${BACKEND_URL}/api/users`, {
      withCredentials: true
    });
    setUsers(data);
  } catch (error) {
    toast.error('Erro ao carregar usuários');
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchUsers();
}, []);
```

**handleCreateUser:**
```javascript
const handleCreateUser = async (e) => {
  e.preventDefault();
  try {
    await axios.post(`${BACKEND_URL}/api/users`, formData, {
      withCredentials: true
    });
    toast.success('Usuário criado com sucesso!');
    setDialogOpen(false);
    setFormData({ email: '', password: '', name: '', role: 'PADRÃO' });
    fetchUsers();
  } catch (error) {
    toast.error(error.response?.data?.detail || 'Erro ao criar usuário');
  }
};
```

**handleDeleteUser:**
```javascript
const handleDeleteUser = async (userId) => {
  if (!window.confirm('Tem certeza que deseja deletar este usuário?')) return;

  try {
    await axios.delete(`${BACKEND_URL}/api/users/${userId}`, {
      withCredentials: true
    });
    toast.success('Usuário deletado com sucesso!');
    fetchUsers();
  } catch (error) {
    toast.error('Erro ao deletar usuário');
  }
};
```

**Layout da Página:**
```
┌─ Botão Voltar ──────────────────────────────────────┐
│                                                      │
│ Gerenciar Usuários              [+ Novo Usuário]    │
│ X usuário(s) cadastrado(s)                          │
│                                                      │
├─ CABEÇALHO COM BRASÃO ─────────────────────────────┤
│ [Logo] Frota de Veículos PMTF                       │
│        Gerenciamento de Usuários do Sistema         │
│                                                      │
├─ TABELA ───────────────────────────────────────────┤
│ Nome | Email | Perfil | Data Cadastro | Ações      │
│ Admin| admin | ADMIN  | 05/04/2026   | [Delete]   │
│ User | user  | PADRÃO | 05/04/2026   | [Delete]   │
└──────────────────────────────────────────────────────┘
```

**Colunas da Tabela:**
1. **Nome** - `user.name` (font-medium)
2. **Email** - `user.email`
3. **Perfil** - Badge colorido:
   - ADMIN: azul (`bg-blue-100 text-blue-800`)
   - PADRÃO: cinza (`bg-slate-100 text-slate-800`)
4. **Data de Cadastro** - Formatada em pt-BR
5. **Ações** - Botão deletar (ícone lixeira vermelho)

**Modal de Criação:**
```
Título: Criar Novo Usuário

[Nome Completo: _______________]

[Email: _______________]

[Senha: _______________]

[Perfil: [dropdown: PADRÃO/ADMIN]]

[Criar Usuário] [Cancelar]
```

**Campos do Modal:**
```javascript
<form onSubmit={handleCreateUser} className="space-y-4">
  <div>
    <Label htmlFor="name">Nome Completo</Label>
    <Input
      id="name"
      value={formData.name}
      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      required
      data-testid="new-user-name-input"
    />
  </div>

  <div>
    <Label htmlFor="email">Email</Label>
    <Input
      id="email"
      type="email"
      value={formData.email}
      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      required
      data-testid="new-user-email-input"
    />
  </div>

  <div>
    <Label htmlFor="password">Senha</Label>
    <Input
      id="password"
      type="password"
      value={formData.password}
      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
      required
      data-testid="new-user-password-input"
    />
  </div>

  <div>
    <Label htmlFor="role">Perfil</Label>
    <Select
      value={formData.role}
      onValueChange={(value) => setFormData({ ...formData, role: value })}
    >
      <SelectTrigger data-testid="new-user-role-select">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="PADRÃO">PADRÃO</SelectItem>
        <SelectItem value="ADMIN">ADMIN</SelectItem>
      </SelectContent>
    </Select>
  </div>

  <div className="flex gap-2 pt-4">
    <Button type="submit" data-testid="submit-user-button">
      Criar Usuário
    </Button>
    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
      Cancelar
    </Button>
  </div>
</form>
```

**Validações:**
- Nome: obrigatório
- Email: obrigatório + validação HTML5 type="email"
- Senha: obrigatório
- Role: padrão "PADRÃO"

**Feedback:**
- Sucesso criação: Toast verde
- Sucesso exclusão: Toast verde
- Erro: Toast vermelho com mensagem da API
- Confirmação de exclusão: `window.confirm()`

**Data-testid:**
- `usuarios-page`
- `back-button`
- `create-user-button`
- `user-row-{email}`
- `delete-user-button-{email}`
- `create-user-dialog`
- `new-user-name-input`, `new-user-email-input`, `new-user-password-input`, `new-user-role-select`
- `submit-user-button`

---

### 6.12 Sistema de Estilos e Design

**6.12.1 Arquitetura de Estilos**

O sistema usa uma abordagem **utility-first** com TailwindCSS, complementada por:
- Componentes estilizados (Shadcn/UI)
- CSS Variables para tematização
- Classes customizadas mínimas

**Estrutura:**
```
index.css (global)
  ├─ @import Google Fonts
  ├─ @tailwind base, components, utilities
  ├─ CSS Variables (:root)
  └─ Utilitários customizados

App.css (mínimo)
  └─ Reset básico

Componentes
  └─ Classes Tailwind inline
```

---

**6.12.2 Configuração TailwindCSS - `tailwind.config.js`**

**Código Completo:**
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

**Recursos Configurados:**
- **Dark mode:** Via classe `.dark` (não usado atualmente)
- **Content paths:** Escaneia todos arquivos .js/.jsx em src/
- **Container:** Centralizado, padding 2rem, max-width 1400px
- **Cores extendidas:** Todas baseadas em CSS variables
- **Border radius:** Variável `--radius` (0.375rem = 6px)
- **Animações:** Accordion (Radix UI)
- **Plugin:** tailwindcss-animate para animações adicionais

---

**6.12.3 CSS Variables - `src/index.css`**

**Código Completo da Seção de Variáveis:**
```css
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

body {
    margin: 0;
    font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
        'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
        sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

code {
    font-family:
        source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace;
}

@layer base {
    :root {
        --background: 210 40% 98%;           /* #f8fafc - Cinza muito claro */
        --foreground: 222 47% 11%;           /* #0f172a - Azul muito escuro */
        --card: 0 0% 100%;                   /* #ffffff - Branco */
        --card-foreground: 222 47% 11%;      /* #0f172a */
        --popover: 0 0% 100%;                /* #ffffff */
        --popover-foreground: 222 47% 11%;   /* #0f172a */
        --primary: 221 83% 32%;              /* #1e3a8a - Azul governo */
        --primary-foreground: 0 0% 100%;     /* #ffffff */
        --secondary: 210 40% 96.1%;          /* #f1f5f9 - Cinza claro */
        --secondary-foreground: 215 25% 27%; /* #1e293b - Azul escuro */
        --muted: 210 40% 96.1%;              /* #f1f5f9 */
        --muted-foreground: 215 16% 47%;     /* #64748b - Cinza médio */
        --accent: 221 90% 93%;               /* #e0e7ff - Azul claro */
        --accent-foreground: 221 83% 32%;    /* #1e3a8a */
        --destructive: 0 84% 60%;            /* #ef4444 - Vermelho */
        --destructive-foreground: 0 0% 100%; /* #ffffff */
        --border: 214 32% 91%;               /* #e2e8f0 - Cinza borda */
        --input: 214 32% 91%;                /* #e2e8f0 */
        --ring: 221 83% 32%;                 /* #1e3a8a - Focus ring */
        --radius: 0.375rem;                  /* 6px - Border radius padrão */
    }
    
    .dark {
        --background: 0 0% 3.9%;
        --foreground: 0 0% 98%;
        --card: 0 0% 3.9%;
        --card-foreground: 0 0% 98%;
        --popover: 0 0% 3.9%;
        --popover-foreground: 0 0% 98%;
        --primary: 0 0% 98%;
        --primary-foreground: 0 0% 9%;
        --secondary: 0 0% 14.9%;
        --secondary-foreground: 0 0% 98%;
        --muted: 0 0% 14.9%;
        --muted-foreground: 0 0% 63.9%;
        --accent: 0 0% 14.9%;
        --accent-foreground: 0 0% 98%;
        --destructive: 0 62.8% 30.6%;
        --destructive-foreground: 0 0% 98%;
        --border: 0 0% 14.9%;
        --input: 0 0% 14.9%;
        --ring: 0 0% 83.1%;
        --chart-1: 220 70% 50%;
        --chart-2: 160 60% 45%;
        --chart-3: 30 80% 55%;
        --chart-4: 280 65% 60%;
        --chart-5: 340 75% 55%;
    }
}

@layer base {
    * {
        @apply border-border;
    }
    body {
        @apply bg-background text-foreground;
    }
    h1, h2, h3, h4, h5, h6 {
        font-family: 'Outfit', sans-serif;
    }
}
```

**Paleta de Cores (valores HSL convertidos):**

| Variável | HSL | HEX Aproximado | Uso |
|----------|-----|----------------|-----|
| `--background` | 210 40% 98% | #f8fafc | Fundo da página |
| `--foreground` | 222 47% 11% | #0f172a | Texto principal |
| `--primary` | 221 83% 32% | #1e3a8a | Azul governo (sidebar, botões) |
| `--card` | 0 0% 100% | #ffffff | Cards e containers |
| `--border` | 214 32% 91% | #e2e8f0 | Bordas |
| `--destructive` | 0 84% 60% | #ef4444 | Vermelho (delete, erro) |
| `--muted` | 210 40% 96.1% | #f1f5f9 | Backgrounds secundários |

**Nota:** Dark mode definido mas não usado. Sistema é light-only.

---

**6.12.4 Tipografia**

**Fontes Carregadas:**
```css
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap');
```

**Hierarquia Tipográfica:**

| Elemento | Fonte | Peso | Tamanho Classes | Uso |
|----------|-------|------|----------------|-----|
| H1, H2, H3, H4, H5, H6 | Outfit | 300-700 | text-3xl a text-5xl | Títulos de página |
| Body, P | IBM Plex Sans | 300-700 | text-base | Corpo de texto |
| Code | Monospace | - | - | Não usado |

**Aplicação:**
```css
body {
  font-family: 'IBM Plex Sans', sans-serif;
}

h1, h2, h3, h4, h5, h6 {
  font-family: 'Outfit', sans-serif;
}
```

**Classes Tailwind de Tamanho:**
- `text-3xl`: 1.875rem (30px) - H1 mobile
- `text-4xl`: 2.25rem (36px) - H1 tablet
- `text-5xl`: 3rem (48px) - H1 desktop
- `text-2xl`: 1.5rem (24px) - H2
- `text-xl`: 1.25rem (20px) - H3
- `text-lg`: 1.125rem (18px) - H4
- `text-base`: 1rem (16px) - Body
- `text-sm`: 0.875rem (14px) - Small
- `text-xs`: 0.75rem (12px) - Extra small

---

**6.12.5 Responsividade**

**Breakpoints (Tailwind padrão):**
```javascript
{
  'sm': '640px',   // tablet portrait
  'md': '768px',   // tablet landscape
  'lg': '1024px',  // desktop pequeno
  'xl': '1280px',  // desktop médio
  '2xl': '1536px'  // desktop grande
}
```

**Estratégia Mobile-First:**
- Classes sem prefixo: aplicam em todos os tamanhos
- Classes com prefixo (md:, lg:): aplicam daquele breakpoint em diante

**Exemplos de Uso:**
```javascript
// Sidebar: oculta mobile, visível desktop
className="hidden lg:block"

// Grid: 1 col mobile, 2 tablet, 3 desktop
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"

// Texto: pequeno mobile, médio desktop
className="text-sm lg:text-base"

// Padding: menor mobile, maior desktop
className="p-4 lg:p-8"
```

**Sidebar Mobile:**
- Transform: `translate-x-0` (aberto) ou `-translate-x-full` (fechado)
- Overlay: `fixed inset-0 bg-black/50 z-40 lg:hidden`
- Toggle button: Visível apenas `lg:hidden`

**Tabelas:**
- Container: `overflow-x-auto` (scroll horizontal em mobile)
- Colunas: largura fixa ou min-width para evitar quebra

---

**6.12.6 Badges de Status**

**Definição:**
```javascript
const statusColors = {
  EM_ATIVIDADE: 'bg-green-100 text-green-800 border-green-200',
  EM_MANUTENCAO: 'bg-amber-100 text-amber-800 border-amber-200',
  INATIVO: 'bg-slate-100 text-slate-800 border-slate-200'
};

const statusLabels = {
  EM_ATIVIDADE: 'Em Atividade',
  EM_MANUTENCAO: 'Em Manutenção',
  INATIVO: 'Inativo'
};
```

**Renderização:**
```javascript
<span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${statusColors[vehicle.status]}`}>
  {statusLabels[vehicle.status]}
</span>
```

**Cores:**
- **Verde** (#10b981): Ativo
- **Âmbar** (#f59e0b): Manutenção
- **Cinza** (#64748b): Inativo

---

**6.12.7 Componentes Shadcn/UI**

**Localização:** `/app/frontend/src/components/ui/`

**Componentes Usados (com finalidade):**

| Componente | Arquivo | Uso no Sistema |
|------------|---------|----------------|
| Button | button.jsx | Todos os botões (primário, secundário, ghost, outline) |
| Input | input.jsx | Todos os inputs de texto |
| Label | label.jsx | Labels de formulários |
| Select | select.jsx | Dropdowns (Status, Role) |
| Dialog | dialog.jsx | Modais (edição, histórico, criação) |
| Table | table.jsx | Todas as tabelas de listagem |
| Sonner | sonner.tsx | Sistema de notificações toast |

**Componentes Instalados mas Não Usados:**
- Accordion, Alert Dialog, Avatar, Checkbox, Collapsible
- Context Menu, Dropdown Menu, Hover Card, Menubar
- Navigation Menu, Popover, Progress, Radio Group
- Scroll Area, Separator, Slider, Switch, Tabs
- Toggle, Toggle Group, Tooltip

**Padrão de Customização:**
Todos os componentes aceitam `className` para override de estilos:
```javascript
<Button className="w-full bg-custom-color">Texto</Button>
```

**Variants do Button:**
```javascript
// Definidos em button.jsx
const buttonVariants = cva(
  "base-classes...",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "border border-input",
        secondary: "bg-secondary text-secondary-foreground",
        ghost: "hover:bg-accent",
        link: "text-primary underline-offset-4"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
```

---

**6.12.8 Animações e Transições**

**Transições Padrão:**
```javascript
className="transition-all duration-200 ease-in-out"
```

**Hover Effects:**
```javascript
// Cards
className="hover:shadow-md hover:-translate-y-1"

// Botões
className="hover:bg-primary/90"

// Nav items
className="hover:bg-primary-foreground/10"
```

**Loading Spinner:**
```javascript
<div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
```

**Animações Disponíveis (Tailwind):**
- `animate-spin`: Rotação contínua (spinner)
- `animate-pulse`: Pulsação (não usado)
- `animate-bounce`: Pulo (não usado)
- `animate-accordion-down`: Accordion abrir (Radix)
- `animate-accordion-up`: Accordion fechar (Radix)

---

**6.12.9 Layout e Spacing**

**Container Padrão:**
```javascript
className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
```

**Padding de Página:**
```javascript
className="p-6 lg:p-8"
```

**Gap entre Elementos:**
- `gap-2`: 0.5rem (8px) - botões adjacentes
- `gap-4`: 1rem (16px) - elementos de formulário
- `gap-6`: 1.5rem (24px) - grid de cards
- `gap-8`: 2rem (32px) - seções

**Margin:**
- `mb-4`: Bottom 1rem (16px)
- `mb-6`: Bottom 1.5rem (24px)
- `mt-2`: Top 0.5rem (8px)

---

**6.12.10 Acessibilidade (a11y)**

**Data-testid:**
- Todos os elementos interativos têm `data-testid`
- Padrão: `{ação}-{elemento}` ou `{página}-{elemento}`
- Exemplos: `login-submit-button`, `nav-dashboard`, `vehicle-row-{placa}`

**ARIA Labels:**
- Componentes Shadcn/UI já incluem ARIA apropriado
- Dialogs têm `role="dialog"` e `aria-labelledby`
- Inputs têm labels associados via `htmlFor`

**Foco:**
- Ring de foco: `focus:ring-2 focus:ring-primary focus:ring-offset-2`
- Visível em todos os elementos interativos

**Contraste:**
- Cores atendem WCAG AA (4.5:1 para texto normal)
- Azul governo (#1e3a8a) em branco: contraste 8.59:1 ✅

---

## 7. BACKEND DETALHADO

### 7.1 Estrutura Geral do Backend

**Arquivo Único:** `/app/backend/server.py` (536 linhas)

**Organização Interna:**
```python
# 1. Imports e Setup (linhas 1-24)
# 2. Funções de Autenticação (linhas 25-82)
# 3. Criação da App FastAPI (linhas 83-86)
# 4. Modelos Pydantic (linhas 87-162)
# 5. Rotas de Autenticação (linhas 163-246)
# 6. Rotas de Usuários (linhas 247-290)
# 7. Rotas de Veículos (linhas 291-389)
# 8. Configuração CORS (linhas 390-402)
# 9. Logging (linhas 403-407)
# 10. Startup Event (seed de dados) (linhas 408-530)
# 11. Shutdown Event (linhas 531-536)
```

**Decisão de Arquitetura:**
- **Monolítico:** Tudo em um arquivo para simplicidade inicial
- **Refatoração Recomendada:** Dividir em módulos ao escalar:
  ```
  backend/
  ├── main.py              # App e CORS
  ├── config.py            # Configurações
  ├── database.py          # Conexão MongoDB
  ├── models/
  │   ├── user.py
  │   └── vehicle.py
  ├── schemas/
  │   ├── user.py
  │   └── vehicle.py
  ├── routers/
  │   ├── auth.py
  │   ├── users.py
  │   └── vehicles.py
  ├── services/
  │   ├── auth_service.py
  │   └── vehicle_service.py
  └── utils/
      ├── security.py
      └── validators.py
  ```

---

### 7.2 Imports e Inicialização

**Código:**
```python
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import secrets

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_ALGORITHM = "HS256"
```

**Análise:**
- **load_dotenv():** DEVE ser chamado antes de acessar `os.environ`
- **Path(__file__).parent:** Obtém diretório do script
- **AsyncIOMotorClient:** Cliente MongoDB assíncrono
- **db:** Instância do banco (global)
- **JWT_ALGORITHM:** HS256 (HMAC SHA-256)

---

### 7.3 Funções de Autenticação

**7.3.1 get_jwt_secret()**
```python
def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]
```
- Retorna chave secreta do .env
- Usada para assinar e verificar JWTs

**7.3.2 hash_password()**
```python
def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")
```
- Gera salt aleatório
- Faz hash com bcrypt
- Retorna string (não bytes)
- **Segurança:** bcrypt é resistente a brute force (lento por design)

**7.3.3 verify_password()**
```python
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
```
- Compara senha plain com hash
- Retorna boolean
- Timing-safe (protege contra timing attacks)

**7.3.4 create_access_token()**
```python
def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=15),
        "type": "access"
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)
```
- **sub (subject):** ID do usuário
- **email:** Email (para conveniência)
- **exp (expiration):** 15 minutos
- **type:** "access" (diferencia de refresh)
- **Retorno:** String JWT

**7.3.5 create_refresh_token()**
```python
def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "refresh"
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)
```
- **exp:** 7 dias (mais longo que access)
- **type:** "refresh"
- **Nota:** Endpoint de refresh não está implementado (mas função existe)

**7.3.6 get_current_user() - Dependency**
```python
async def get_current_user(request: Request) -> dict:
    # 1. Tentar pegar token do cookie
    token = request.cookies.get("access_token")
    
    # 2. Fallback: Authorization header
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    
    # 3. Se não tem token, erro 401
    if not token:
        raise HTTPException(status_code=401, detail="Não autenticado")
    
    try:
        # 4. Decodificar JWT
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        
        # 5. Verificar tipo
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Tipo de token inválido")
        
        # 6. Buscar usuário no banco
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="Usuário não encontrado")
        
        # 7. Preparar resposta (sem senha)
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")
```

**Fluxo de Autenticação:**
1. Extrai token de cookie (preferencial) ou header
2. Se não tem token → 401 Não autenticado
3. Decodifica JWT com chave secreta
4. Valida tipo = "access"
5. Busca usuário no MongoDB por ID do payload
6. Se usuário não existe → 401
7. Remove password_hash do objeto
8. Retorna usuário

**7.3.7 require_admin() - Dependency**
```python
async def require_admin(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "ADMIN":
        raise HTTPException(status_code=403, detail="Acesso negado. Apenas administradores.")
    return current_user
```
- **Depends:** Chama `get_current_user()` primeiro
- Verifica se `role == "ADMIN"`
- Se não → 403 Forbidden
- Se sim → retorna usuário (para uso na rota)

---

### 7.4 Modelos Pydantic (Schemas)

**7.4.1 Modelos de Usuário**

**UserRegister:**
```python
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str = "PADRÃO"
```
- **Usado em:** POST /api/auth/register, POST /api/users
- **Validação automática:** Email válido, campos obrigatórios
- **Default role:** "PADRÃO"

**UserLogin:**
```python
class UserLogin(BaseModel):
    email: EmailStr
    password: str
```
- **Usado em:** POST /api/auth/login
- **Validação:** Email válido

**UserResponse:**
```python
class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    created_at: str
```
- **Usado em:** Response de login, register, listagem
- **Não inclui:** password_hash

**7.4.2 Modelos de Veículo**

**VehicleCreate:**
```python
class VehicleCreate(BaseModel):
    placa: str
    marca: str
    modelo: str
    ano_fabricacao: int
    chassi: str
    status: str = "EM_ATIVIDADE"
    lotacao_atual: str
    departamento: str
```
- **Usado em:** POST /api/vehicles
- **Default status:** EM_ATIVIDADE
- **Todos obrigatórios** exceto status (tem default)

**VehicleUpdate:**
```python
class VehicleUpdate(BaseModel):
    placa: Optional[str] = None
    marca: Optional[str] = None
    modelo: Optional[str] = None
    ano_fabricacao: Optional[int] = None
    chassi: Optional[str] = None
    status: Optional[str] = None
    lotacao_atual: Optional[str] = None
    departamento: Optional[str] = None
```
- **Usado em:** PUT /api/vehicles/{id}
- **Todos opcionais:** Permite atualização parcial
- **Lógica:** Apenas campos fornecidos são atualizados

**VehicleResponse:**
```python
class VehicleResponse(BaseModel):
    id: str
    placa: str
    marca: str
    modelo: str
    ano_fabricacao: int
    chassi: str
    status: str
    lotacao_atual: str
    departamento: str
    created_at: str
    updated_at: str
```
- **Usado em:** Response de GET, POST, PUT
- **Inclui:** Timestamps

**7.4.3 Modelos de Histórico**

**LocationHistoryCreate:**
```python
class LocationHistoryCreate(BaseModel):
    local: str
    departamento: str
    data_inicio: str
    data_fim: Optional[str] = None
```
- **Usado internamente** ao criar/atualizar veículo
- **data_fim:** None para lotação atual

**LocationHistoryResponse:**
```python
class LocationHistoryResponse(BaseModel):
    id: str
    vehicle_id: str
    local: str
    departamento: str
    data_inicio: str
    data_fim: Optional[str] = None
```
- **Usado em:** GET /api/vehicles/{id}/historico

---

### 7.5 Rotas de Autenticação (API REST)

**7.5.1 POST /api/auth/register**

**Rota Completa:**
```python
@api_router.post("/auth/register")
async def register(user_data: UserRegister, response: Response):
    # 1. Normalizar email para lowercase
    email_lower = user_data.email.lower()
    
    # 2. Verificar se email já existe
    existing = await db.users.find_one({"email": email_lower})
    if existing:
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    
    # 3. Fazer hash da senha
    hashed = hash_password(user_data.password)
    
    # 4. Criar documento do usuário
    user_doc = {
        "email": email_lower,
        "password_hash": hashed,
        "name": user_data.name,
        "role": user_data.role,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    # 5. Inserir no MongoDB
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    
    # 6. Criar tokens JWT
    access_token = create_access_token(user_id, email_lower)
    refresh_token = create_refresh_token(user_id)
    
    # 7. Definir cookies httpOnly
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,  # True em produção com HTTPS
        samesite="lax",
        max_age=900,  # 15 minutos
        path="/"
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=604800,  # 7 dias
        path="/"
    )
    
    # 8. Retornar dados do usuário (sem senha)
    return {
        "id": user_id,
        "email": email_lower,
        "name": user_data.name,
        "role": user_data.role,
        "created_at": user_doc["created_at"]
    }
```

**Detalhes:**
- **Método:** POST
- **Autenticação:** Não requerida
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "senha123",
    "name": "Nome Completo",
    "role": "PADRÃO"
  }
  ```
- **Response 200:**
  ```json
  {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "Nome Completo",
    "role": "PADRÃO",
    "created_at": "2026-04-05T23:00:00.000000+00:00"
  }
  ```
  + Cookies: `access_token`, `refresh_token`
- **Response 400:** Email já cadastrado
- **Response 422:** Validação falhou (email inválido, campos faltando)

**Segurança:**
- Email case-insensitive (converte lowercase)
- Senha hasheada com bcrypt
- Token em httpOnly cookie (não acessível por JavaScript)
- SameSite=lax (proteção CSRF)

---

**7.5.2 POST /api/auth/login**

**Rota Completa:**
```python
@api_router.post("/auth/login")
async def login(credentials: UserLogin, response: Response):
    # 1. Normalizar email
    email_lower = credentials.email.lower()
    
    # 2. Buscar usuário no banco
    user = await db.users.find_one({"email": email_lower})
    if not user:
        raise HTTPException(status_code=401, detail="Email ou senha incorretos")
    
    # 3. Verificar senha
    if not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Email ou senha incorretos")
    
    # 4. Criar tokens
    user_id = str(user["_id"])
    access_token = create_access_token(user_id, email_lower)
    refresh_token = create_refresh_token(user_id)
    
    # 5. Definir cookies
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=900, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    
    # 6. Retornar usuário
    return {
        "id": user_id,
        "email": user["email"],
        "name": user["name"],
        "role": user["role"],
        "created_at": user["created_at"]
    }
```

**Detalhes:**
- **Método:** POST
- **Autenticação:** Não requerida
- **Body:**
  ```json
  {
    "email": "admin@pmtf.gov.br",
    "password": "admin123"
  }
  ```
- **Response 200:** Igual ao register (usuário + cookies)
- **Response 401:** Email ou senha incorretos (mensagem genérica por segurança)
- **Response 422:** Validação falhou

**Segurança:**
- Mensagem genérica de erro (não revela se email existe)
- Timing attack: bcrypt.checkpw é timing-safe
- **Falta:** Rate limiting, brute force protection

---

**7.5.3 POST /api/auth/logout**

**Rota Completa:**
```python
@api_router.post("/auth/logout")
async def logout(response: Response, current_user: dict = Depends(get_current_user)):
    response.delete_cookie(key="access_token", path="/")
    response.delete_cookie(key="refresh_token", path="/")
    return {"message": "Logout realizado com sucesso"}
```

**Detalhes:**
- **Método:** POST
- **Autenticação:** Requerida (Depends get_current_user)
- **Body:** Vazio
- **Response 200:**
  ```json
  {"message": "Logout realizado com sucesso"}
  ```
- **Response 401:** Token inválido/expirado

**Comportamento:**
- Deleta cookies do navegador
- **Nota:** Token JWT ainda válido até expirar (stateless)
- **Melhoria:** Lista negra de tokens para invalidação imediata

---

**7.5.4 GET /api/auth/me**

**Rota Completa:**
```python
@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user
```

**Detalhes:**
- **Método:** GET
- **Autenticação:** Requerida
- **Body:** Nenhum
- **Response 200:**
  ```json
  {
    "id": "507f1f77bcf86cd799439011",
    "email": "admin@pmtf.gov.br",
    "name": "Administrador PMTF",
    "role": "ADMIN",
    "created_at": "2026-04-05T20:00:00.000000+00:00"
  }
  ```
- **Response 401:** Não autenticado

**Uso:**
- Frontend chama ao carregar app (AuthContext)
- Verifica se sessão ainda válida
- Obtém dados do usuário atual

---

### 7.6 Rotas de Usuários (Gerenciamento)

**7.6.1 GET /api/users**

**Rota Completa:**
```python
@api_router.get("/users")
async def get_users(current_user: dict = Depends(require_admin)):
    users = await db.users.find({}, {"password_hash": 0}).to_list(1000)
    for user in users:
        user["id"] = str(user.pop("_id"))
    return users
```

**Detalhes:**
- **Método:** GET
- **Autenticação:** ADMIN only
- **Query Params:** Nenhum
- **Response 200:**
  ```json
  [
    {
      "id": "507f1f77bcf86cd799439011",
      "email": "admin@pmtf.gov.br",
      "name": "Administrador PMTF",
      "role": "ADMIN",
      "created_at": "2026-04-05T20:00:00.000000+00:00"
    },
    ...
  ]
  ```
- **Response 403:** Não é ADMIN

**Query MongoDB:**
```python
db.users.find({}, {"password_hash": 0})
```
- Busca todos documentos
- Exclui campo `password_hash` da resposta
- Limite 1000 (proteção)

**Transformação:**
```python
user["id"] = str(user.pop("_id"))
```
- Remove `_id` (ObjectId não é JSON serializable)
- Adiciona `id` (string)

---

**7.6.2 POST /api/users**

**Rota Completa:**
```python
@api_router.post("/users")
async def create_user(user_data: UserRegister, current_user: dict = Depends(require_admin)):
    # 1. Normalizar email
    email_lower = user_data.email.lower()
    
    # 2. Verificar duplicata
    existing = await db.users.find_one({"email": email_lower})
    if existing:
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    
    # 3. Hash senha
    hashed = hash_password(user_data.password)
    
    # 4. Criar documento
    user_doc = {
        "email": email_lower,
        "password_hash": hashed,
        "name": user_data.name,
        "role": user_data.role,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    # 5. Inserir
    result = await db.users.insert_one(user_doc)
    
    # 6. Retornar
    return {
        "id": str(result.inserted_id),
        "email": email_lower,
        "name": user_data.name,
        "role": user_data.role,
        "created_at": user_doc["created_at"]
    }
```

**Diferença de /auth/register:**
- Requer autenticação ADMIN
- Não define cookies (não faz login)
- Apenas cria usuário

---

**7.6.3 DELETE /api/users/{user_id}**

**Rota Completa:**
```python
@api_router.delete("/users/{user_id}")
async def delete_user(user_id: str, current_user: dict = Depends(require_admin)):
    result = await db.users.delete_one({"_id": ObjectId(user_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return {"message": "Usuário deletado com sucesso"}
```

**Detalhes:**
- **Método:** DELETE
- **Autenticação:** ADMIN only
- **Path Param:** `user_id` (string ObjectId)
- **Response 200:**
  ```json
  {"message": "Usuário deletado com sucesso"}
  ```
- **Response 404:** Usuário não existe
- **Response 403:** Não é ADMIN

**Observação:**
- **Falta:** Impedir deletar a si próprio
- **Falta:** Verificar se usuário tem dados relacionados

Continuando a documentação técnica completa:

---

### 7.7 Rotas de Veículos

**7.7.1 POST /api/vehicles**

**Rota Completa:**
```python
@api_router.post("/vehicles")
async def create_vehicle(vehicle_data: VehicleCreate, current_user: dict = Depends(require_admin)):
    # 1. Converter Pydantic model para dict
    vehicle_doc = vehicle_data.model_dump()
    
    # 2. Adicionar timestamps
    vehicle_doc["created_at"] = datetime.now(timezone.utc).isoformat()
    vehicle_doc["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    # 3. Inserir veículo no MongoDB
    result = await db.vehicles.insert_one(vehicle_doc)
    
    # 4. Criar entrada inicial no histórico
    history_doc = {
        "vehicle_id": str(result.inserted_id),
        "local": vehicle_data.lotacao_atual,
        "departamento": vehicle_data.departamento,
        "data_inicio": datetime.now(timezone.utc).isoformat(),
        "data_fim": None  # Lotação atual (sem data fim)
    }
    await db.location_history.insert_one(history_doc)
    
    # 5. Preparar resposta
    vehicle_doc["id"] = str(result.inserted_id)
    vehicle_doc.pop("_id", None)
    
    return vehicle_doc
```

**Detalhes:**
- **Método:** POST
- **Autenticação:** ADMIN only
- **Body:**
  ```json
  {
    "placa": "ABC-1234",
    "marca": "Toyota",
    "modelo": "Hilux",
    "ano_fabricacao": 2020,
    "chassi": "9BWZZZ377VT004251",
    "status": "EM_ATIVIDADE",
    "lotacao_atual": "Secretaria de Saúde",
    "departamento": "Departamento de Vigilância Sanitária"
  }
  ```
- **Response 201:**
  ```json
  {
    "id": "507f1f77bcf86cd799439011",
    "placa": "ABC-1234",
    "marca": "Toyota",
    "modelo": "Hilux",
    "ano_fabricacao": 2020,
    "chassi": "9BWZZZ377VT004251",
    "status": "EM_ATIVIDADE",
    "lotacao_atual": "Secretaria de Saúde",
    "departamento": "Departamento de Vigilância Sanitária",
    "created_at": "2026-04-05T23:00:00.000000+00:00",
    "updated_at": "2026-04-05T23:00:00.000000+00:00"
  }
  ```
- **Response 403:** Não é ADMIN
- **Response 422:** Validação falhou

**Regras de Negócio:**
1. Timestamps UTC automáticos
2. Histórico criado automaticamente na primeira lotação
3. `data_fim = None` indica lotação atual

**Validações Pydantic:**
- `placa`, `marca`, `modelo`, `chassi`, `lotacao_atual`, `departamento`: strings obrigatórias
- `ano_fabricacao`: inteiro obrigatório
- `status`: string com default "EM_ATIVIDADE"

---

**7.7.2 GET /api/vehicles**

**Rota Completa:**
```python
@api_router.get("/vehicles")
async def get_all_vehicles(
    current_user: dict = Depends(get_current_user),
    placa: Optional[str] = None,
    marca: Optional[str] = None
):
    # 1. Construir query dinâmica
    query = {}
    if placa:
        query["placa"] = {"$regex": placa, "$options": "i"}  # Case-insensitive
    if marca:
        query["marca"] = {"$regex": marca, "$options": "i"}
    
    # 2. Buscar veículos
    vehicles = await db.vehicles.find(query).to_list(1000)
    
    # 3. Transformar ObjectId em string
    for vehicle in vehicles:
        vehicle["id"] = str(vehicle.pop("_id"))
    
    return vehicles
```

**Detalhes:**
- **Método:** GET
- **Autenticação:** Qualquer usuário autenticado
- **Query Params:**
  - `placa` (opcional): Filtro parcial case-insensitive
  - `marca` (opcional): Filtro parcial case-insensitive
- **Exemplos:**
  - `GET /api/vehicles` → Todos
  - `GET /api/vehicles?placa=ABC` → Placas contendo "ABC"
  - `GET /api/vehicles?marca=toyota` → Marca contendo "toyota"
  - `GET /api/vehicles?placa=ABC&marca=ford` → Ambos filtros

**Query MongoDB com Filtros:**
```python
# Placa = "ABC"
{"placa": {"$regex": "ABC", "$options": "i"}}

# Marca = "toyota"
{"marca": {"$regex": "toyota", "$options": "i"}}

# Ambos
{
  "placa": {"$regex": "ABC", "$options": "i"},
  "marca": {"$regex": "toyota", "$options": "i"}
}
```

**Regex Flags:**
- `$options: "i"` → Case-insensitive
- Permite busca parcial (substring match)

**Limite:**
- `to_list(1000)` → Máximo 1000 veículos
- Proteção contra queries muito grandes

---

**7.7.3 GET /api/vehicles/em-atividade**

**Rota Completa:**
```python
@api_router.get("/vehicles/em-atividade")
async def get_active_vehicles(
    current_user: dict = Depends(get_current_user),
    placa: Optional[str] = None,
    marca: Optional[str] = None
):
    query = {"status": "EM_ATIVIDADE"}
    if placa:
        query["placa"] = {"$regex": placa, "$options": "i"}
    if marca:
        query["marca"] = {"$regex": marca, "$options": "i"}
    
    vehicles = await db.vehicles.find(query).to_list(1000)
    for vehicle in vehicles:
        vehicle["id"] = str(vehicle.pop("_id"))
    return vehicles
```

**Diferença da rota anterior:**
- Adiciona filtro fixo: `"status": "EM_ATIVIDADE"`
- Aceita mesmos query params (placa, marca)

---

**7.7.4 GET /api/vehicles/em-manutencao**

**Rota Completa:**
```python
@api_router.get("/vehicles/em-manutencao")
async def get_maintenance_vehicles(
    current_user: dict = Depends(get_current_user),
    placa: Optional[str] = None,
    marca: Optional[str] = None
):
    query = {"status": "EM_MANUTENCAO"}
    if placa:
        query["placa"] = {"$regex": placa, "$options": "i"}
    if marca:
        query["marca"] = {"$regex": marca, "$options": "i"}
    
    vehicles = await db.vehicles.find(query).to_list(1000)
    for vehicle in vehicles:
        vehicle["id"] = str(vehicle.pop("_id"))
    return vehicles
```

**Filtro fixo:** `"status": "EM_MANUTENCAO"`

---

**7.7.5 GET /api/vehicles/inativos**

**Rota Completa:**
```python
@api_router.get("/vehicles/inativos")
async def get_inactive_vehicles(
    current_user: dict = Depends(get_current_user),
    placa: Optional[str] = None,
    marca: Optional[str] = None
):
    query = {"status": "INATIVO"}
    if placa:
        query["placa"] = {"$regex": placa, "$options": "i"}
    if marca:
        query["marca"] = {"$regex": marca, "$options": "i"}
    
    vehicles = await db.vehicles.find(query).to_list(1000)
    for vehicle in vehicles:
        vehicle["id"] = str(vehicle.pop("_id"))
    return vehicles
```

**Filtro fixo:** `"status": "INATIVO"`

---

**7.7.6 PUT /api/vehicles/{vehicle_id}**

**Rota Completa:**
```python
@api_router.put("/vehicles/{vehicle_id}")
async def update_vehicle(vehicle_id: str, vehicle_data: VehicleUpdate, current_user: dict = Depends(require_admin)):
    # 1. Filtrar apenas campos fornecidos (não None)
    update_data = {k: v for k, v in vehicle_data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="Nenhum dado para atualizar")
    
    # 2. Adicionar timestamp de atualização
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    # 3. Se lotação ou departamento mudaram
    if "lotacao_atual" in update_data or "departamento" in update_data:
        # 3a. Buscar veículo atual
        current_vehicle = await db.vehicles.find_one({"_id": ObjectId(vehicle_id)})
        if not current_vehicle:
            raise HTTPException(status_code=404, detail="Veículo não encontrado")
        
        # 3b. Determinar nova lotação/departamento
        new_lotacao = update_data.get("lotacao_atual", current_vehicle.get("lotacao_atual"))
        new_departamento = update_data.get("departamento", current_vehicle.get("departamento"))
        
        # 3c. Finalizar lotação anterior (definir data_fim)
        await db.location_history.update_many(
            {"vehicle_id": vehicle_id, "data_fim": None},
            {"$set": {"data_fim": datetime.now(timezone.utc).isoformat()}}
        )
        
        # 3d. Criar nova entrada de histórico
        history_doc = {
            "vehicle_id": vehicle_id,
            "local": new_lotacao,
            "departamento": new_departamento,
            "data_inicio": datetime.now(timezone.utc).isoformat(),
            "data_fim": None
        }
        await db.location_history.insert_one(history_doc)
    
    # 4. Atualizar veículo
    result = await db.vehicles.update_one(
        {"_id": ObjectId(vehicle_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Veículo não encontrado")
    
    # 5. Retornar veículo atualizado
    updated_vehicle = await db.vehicles.find_one({"_id": ObjectId(vehicle_id)})
    updated_vehicle["id"] = str(updated_vehicle.pop("_id"))
    return updated_vehicle
```

**Detalhes:**
- **Método:** PUT
- **Autenticação:** ADMIN only
- **Path Param:** `vehicle_id` (string ObjectId)
- **Body:** Todos campos opcionais
  ```json
  {
    "status": "EM_MANUTENCAO",
    "lotacao_atual": "Oficina Municipal",
    "departamento": "Setor de Manutenção"
  }
  ```
- **Response 200:** Veículo atualizado completo
- **Response 400:** Nenhum campo fornecido
- **Response 404:** Veículo não existe
- **Response 403:** Não é ADMIN

**Lógica de Histórico:**
1. Se `lotacao_atual` OU `departamento` mudaram:
2. Busca veículo atual para pegar valores antigos (se campo não fornecido)
3. Finaliza lotações anteriores (define `data_fim = agora`)
4. Cria nova entrada com `data_fim = None` (lotação atual)

**Exemplo de Atualização Parcial:**
```json
// Body
{"status": "EM_MANUTENCAO"}

// update_data
{
  "status": "EM_MANUTENCAO",
  "updated_at": "2026-04-05T23:30:00.000000+00:00"
}

// MongoDB $set
db.vehicles.update_one(
  {"_id": ObjectId("...")},
  {"$set": {"status": "EM_MANUTENCAO", "updated_at": "..."}}
)
```

---

**7.7.7 DELETE /api/vehicles/{vehicle_id}**

**Rota Completa:**
```python
@api_router.delete("/vehicles/{vehicle_id}")
async def delete_vehicle(vehicle_id: str, current_user: dict = Depends(require_admin)):
    # 1. Deletar veículo
    result = await db.vehicles.delete_one({"_id": ObjectId(vehicle_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Veículo não encontrado")
    
    # 2. Deletar histórico relacionado
    await db.location_history.delete_many({"vehicle_id": vehicle_id})
    
    return {"message": "Veículo deletado com sucesso"}
```

**Detalhes:**
- **Método:** DELETE
- **Autenticação:** ADMIN only
- **Path Param:** `vehicle_id`
- **Response 200:**
  ```json
  {"message": "Veículo deletado com sucesso"}
  ```
- **Response 404:** Veículo não existe
- **Response 403:** Não é ADMIN

**Cascata:**
- Deleta veículo
- Deleta TODO histórico de lotação relacionado
- **Nota:** Operação irreversível (sem soft delete)

---

**7.7.8 GET /api/vehicles/{vehicle_id}/historico**

**Rota Completa:**
```python
@api_router.get("/vehicles/{vehicle_id}/historico")
async def get_vehicle_history(vehicle_id: str, current_user: dict = Depends(get_current_user)):
    # 1. Buscar histórico ordenado por data (mais recente primeiro)
    history = await db.location_history.find(
        {"vehicle_id": vehicle_id}
    ).sort("data_inicio", -1).to_list(1000)
    
    # 2. Transformar _id em id
    for entry in history:
        entry["id"] = str(entry.pop("_id"))
    
    return history
```

**Detalhes:**
- **Método:** GET
- **Autenticação:** Qualquer usuário autenticado
- **Path Param:** `vehicle_id`
- **Response 200:**
  ```json
  [
    {
      "id": "507f1f77bcf86cd799439012",
      "vehicle_id": "507f1f77bcf86cd799439011",
      "local": "Secretaria de Saúde",
      "departamento": "Departamento de Vigilância Sanitária",
      "data_inicio": "2026-04-05T23:00:00.000000+00:00",
      "data_fim": null
    },
    {
      "id": "507f1f77bcf86cd799439013",
      "vehicle_id": "507f1f77bcf86cd799439011",
      "local": "Secretaria de Obras",
      "departamento": "Departamento de Infraestrutura",
      "data_inicio": "2026-01-15T10:00:00.000000+00:00",
      "data_fim": "2026-04-05T23:00:00.000000+00:00"
    }
  ]
  ```
- **Ordenação:** `data_inicio` descendente (mais recente primeiro)

**Interpretação:**
- `data_fim = null` → Lotação ATUAL
- `data_fim != null` → Lotação PASSADA

---

### 7.8 Configuração CORS

**Código Completo:**
```python
# Lê CORS_ORIGINS do .env
cors_origins = os.environ.get('CORS_ORIGINS', '*')

# Se wildcard, permite todos
if cors_origins == '*':
    allow_origins = ['*']
else:
    # Se lista separada por vírgula, divide
    allow_origins = cors_origins.split(',')

# Adiciona middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,  # Permite cookies
    allow_origins=allow_origins,
    allow_methods=["*"],     # Todos métodos HTTP
    allow_headers=["*"],     # Todos headers
)
```

**Análise:**
- **allow_credentials=True:** ESSENCIAL para cookies funcionarem
- **allow_origins:** Lista de origens permitidas
  - Desenvolvimento: `['*']` (todos)
  - Produção: `['https://frota.pmtf.gov.br']`
- **allow_methods:** `["*"]` permite GET, POST, PUT, DELETE, OPTIONS
- **allow_headers:** `["*"]` permite Authorization, Content-Type, etc.

**Importante:**
- Se `allow_credentials=True`, não pode usar `allow_origins=['*']` em produção
- Deve especificar origens exatas: `['https://domain.com']`
- Browsers fazem preflight (OPTIONS) automaticamente

**Variável de Ambiente:**
```env
# Desenvolvimento
CORS_ORIGINS="*"

# Produção - origem única
CORS_ORIGINS="https://frota.pmtf.gov.br"

# Produção - múltiplas origens
CORS_ORIGINS="https://frota.pmtf.gov.br,https://admin.pmtf.gov.br"
```

---

### 7.9 Logging

**Configuração:**
```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
```

**Uso:**
```python
logger.info(f"Admin user criado: {admin_email}")
logger.info(f"Veículo de teste criado: {vehicle['placa']}")
```

**Níveis:**
- INFO: Eventos normais
- WARNING: Avisos (não usado)
- ERROR: Erros (não usado explicitamente)

**Output:**
```
2026-04-05 23:00:00,123 - __main__ - INFO - Admin user criado: admin@pmtf.gov.br
2026-04-05 23:00:05,456 - __main__ - INFO - Veículo de teste criado: ABC-1234
```

**Melhoria Recomendada:**
- Logging estruturado (JSON)
- Diferentes níveis por ambiente
- Logs de erro com stack trace
- Logs de acesso (integrar com Uvicorn)

---

### 7.10 Startup Event (Seed de Dados)

**Código Completo:**
```python
@app.on_event("startup")
async def startup_event():
    # 1. Criar índices
    await db.users.create_index("email", unique=True)
    await db.vehicles.create_index("placa")
    await db.location_history.create_index("vehicle_id")
    
    # 2. Seed de admin user (idempotente)
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@pmtf.gov.br")
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    
    if existing is None:
        # Admin não existe, criar
        hashed = hash_password(admin_password)
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hashed,
            "name": "Administrador PMTF",
            "role": "ADMIN",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        logger.info(f"Admin user criado: {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        # Admin existe mas senha diferente, atualizar
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}}
        )
        logger.info("Senha do admin atualizada")
    
    # 3. Seed de usuário padrão
    test_user_email = "usuario@pmtf.gov.br"
    test_user_password = "usuario123"
    test_user = await db.users.find_one({"email": test_user_email})
    
    if test_user is None:
        hashed = hash_password(test_user_password)
        await db.users.insert_one({
            "email": test_user_email,
            "password_hash": hashed,
            "name": "Usuário Padrão",
            "role": "PADRÃO",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        logger.info(f"Usuário de teste criado: {test_user_email}")
    
    # 4. Seed de veículos de teste
    test_vehicles = [
        {
            "placa": "ABC-1234",
            "marca": "Chevrolet",
            "modelo": "S10",
            "ano_fabricacao": 2020,
            "chassi": "9BWZZZ377VT004251",
            "status": "EM_ATIVIDADE",
            "lotacao_atual": "Secretaria de Saúde",
            "departamento": "Departamento de Vigilância Sanitária",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        # ... outros 3 veículos
    ]
    
    for vehicle in test_vehicles:
        existing_vehicle = await db.vehicles.find_one({"placa": vehicle["placa"]})
        if existing_vehicle is None:
            # Veículo não existe, criar
            result = await db.vehicles.insert_one(vehicle)
            await db.location_history.insert_one({
                "vehicle_id": str(result.inserted_id),
                "local": vehicle["lotacao_atual"],
                "departamento": vehicle["departamento"],
                "data_inicio": datetime.now(timezone.utc).isoformat(),
                "data_fim": None
            })
            logger.info(f"Veículo de teste criado: {vehicle['placa']}")
        else:
            # Veículo existe, apenas garantir que tem departamento
            await db.vehicles.update_one(
                {"placa": vehicle["placa"]},
                {"$set": {"departamento": vehicle["departamento"]}}
            )
    
    # 5. Criar arquivo de credenciais para testes
    os.makedirs('/app/memory', exist_ok=True)
    with open('/app/memory/test_credentials.md', 'w') as f:
        f.write("# Credenciais de Teste - Frota de Veículos PMTF\n\n")
        f.write("## Usuário Administrador\n")
        f.write(f"- Email: {admin_email}\n")
        f.write(f"- Senha: {admin_password}\n")
        f.write(f"- Role: ADMIN\n\n")
        f.write("## Usuário Padrão\n")
        f.write(f"- Email: {test_user_email}\n")
        f.write(f"- Senha: {test_user_password}\n")
        f.write(f"- Role: PADRÃO\n\n")
```

**Comportamento:**
1. **Índices:** Criados se não existirem (idempotente)
2. **Admin:** Criado se não existe, senha atualizada se mudou
3. **Usuário Padrão:** Criado se não existe
4. **Veículos:** Criados se não existem (baseado em placa única)
5. **Credenciais:** Arquivo sempre recriado

**Idempotência:**
- Pode rodar múltiplas vezes sem duplicar dados
- Usa `find_one()` para checar existência antes de criar

---

### 7.11 Shutdown Event

**Código:**
```python
@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
```

**Propósito:**
- Fecha conexão MongoDB gracefully
- Evita conexões pendentes

---

### 7.12 Tratamento de Erros

**Estratégia Atual:**
- **HTTPException:** Erros de negócio (401, 403, 404, 400)
- **Pydantic ValidationError:** Automático (422)
- **MongoDB Errors:** Não tratados (500)
- **Unexpected Errors:** Não tratados (500)

**Exemplo de Erro:**
```python
raise HTTPException(status_code=404, detail="Veículo não encontrado")
```

**Response:**
```json
{
  "detail": "Veículo não encontrado"
}
```

**Códigos HTTP Usados:**
- **200:** Sucesso
- **201:** Criado (não usado explicitamente, FastAPI retorna 200)
- **400:** Bad Request (email duplicado, nenhum dado para atualizar)
- **401:** Unauthorized (não autenticado, token inválido/expirado)
- **403:** Forbidden (não é admin)
- **404:** Not Found (usuário/veículo não encontrado)
- **422:** Unprocessable Entity (validação Pydantic falhou)
- **500:** Internal Server Error (erros não tratados)

**Melhorias Recomendadas:**
1. **Global Exception Handler:**
```python
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail}
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=422,
        content={"error": "Dados inválidos", "details": exc.errors()}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unhandled error: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "Erro interno do servidor"}
    )
```

2. **Erros MongoDB:**
```python
from pymongo.errors import DuplicateKeyError

try:
    await db.users.insert_one(user_doc)
except DuplicateKeyError:
    raise HTTPException(status_code=400, detail="Email já cadastrado")
```

---

## 8. BANCO DE DADOS E MODELO DE DADOS

### 8.1 Sistema de Banco de Dados

**MongoDB 7.0+**
- NoSQL orientado a documentos
- Schema-less (flexível)
- Suporte a índices
- Queries assíncronas via Motor

**Connection String:**
```
mongodb://localhost:27017
```

**Database Name:**
```
test_database  (dev)
pmtf_frota     (prod recomendado)
```

---

### 8.2 Collections (Tabelas)

**8.2.1 Collection: `users`**

**Propósito:**
- Armazenar usuários do sistema
- Autenticação e autorização

**Estrutura do Documento:**
```javascript
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "email": "admin@pmtf.gov.br",           // String, lowercase, unique
  "password_hash": "$2b$12$...",           // String, bcrypt hash
  "name": "Administrador PMTF",            // String
  "role": "ADMIN",                         // String, enum: "ADMIN" | "PADRÃO"
  "created_at": "2026-04-05T23:00:00.000000+00:00"  // ISO 8601 string
}
```

**Campos:**

| Campo | Tipo | Obrigatório | Validação | Default | Descrição |
|-------|------|-------------|-----------|---------|-----------|
| `_id` | ObjectId | Sim (auto) | - | Auto-gerado | ID único MongoDB |
| `email` | String | Sim | EmailStr, unique | - | Email do usuário (lowercase) |
| `password_hash` | String | Sim | - | - | Hash bcrypt da senha |
| `name` | String | Sim | - | - | Nome completo |
| `role` | String | Sim | "ADMIN" ou "PADRÃO" | "PADRÃO" | Perfil de acesso |
| `created_at` | String | Sim | ISO 8601 | - | Data/hora de criação |

**Índices:**
```javascript
db.users.createIndex({ "email": 1 }, { unique: true })
```

**Regras:**
- Email único (índice garante)
- Password nunca retornado em queries (projeção `{"password_hash": 0}`)
- Role case-sensitive

**Valores Permitidos - Role:**
- `"ADMIN"`: Acesso completo
- `"PADRÃO"`: Somente leitura

---

**8.2.2 Collection: `vehicles`**

**Propósito:**
- Armazenar veículos da frota municipal
- Informações completas e status atual

**Estrutura do Documento:**
```javascript
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "placa": "ABC-1234",                     // String, identificador principal
  "marca": "Toyota",                       // String
  "modelo": "Hilux",                       // String
  "ano_fabricacao": 2020,                  // Integer
  "chassi": "9BWZZZ377VT004251",          // String, identificador único
  "status": "EM_ATIVIDADE",               // String, enum
  "lotacao_atual": "Secretaria de Saúde", // String
  "departamento": "Departamento de Vigilância Sanitária",  // String
  "created_at": "2026-04-05T23:00:00.000000+00:00",       // ISO 8601
  "updated_at": "2026-04-05T23:00:00.000000+00:00"        // ISO 8601
}
```

**Campos:**

| Campo | Tipo | Obrigatório | Validação | Default | Descrição |
|-------|------|-------------|-----------|---------|-----------|
| `_id` | ObjectId | Sim (auto) | - | Auto | ID único |
| `placa` | String | Sim | - | - | Placa do veículo |
| `marca` | String | Sim | - | - | Fabricante |
| `modelo` | String | Sim | - | - | Modelo |
| `ano_fabricacao` | Integer | Sim | - | - | Ano de fabricação |
| `chassi` | String | Sim | - | - | Número do chassi |
| `status` | String | Sim | Enum | "EM_ATIVIDADE" | Status atual |
| `lotacao_atual` | String | Sim | - | - | Secretaria/órgão atual |
| `departamento` | String | Sim | - | - | Departamento/setor |
| `created_at` | String | Sim | ISO 8601 | - | Data de cadastro |
| `updated_at` | String | Sim | ISO 8601 | - | Última atualização |

**Índices:**
```javascript
db.vehicles.createIndex({ "placa": 1 })
```

**Valores Permitidos - Status:**
- `"EM_ATIVIDADE"`: Veículo operacional
- `"EM_MANUTENCAO"`: Veículo em manutenção
- `"INATIVO"`: Veículo fora de operação

**Regras de Negócio:**
- Placa não tem índice único (permite duplicatas históricas - não ideal)
- Status deve ser um dos 3 valores acima
- `updated_at` atualizado automaticamente em edições
- Lotação e departamento sempre em sincronia

**Observação:**
- **Falta:** Índice único em placa (recomendado)
- **Falta:** Validação de formato de placa (AAA-1234)
- **Falta:** Validação de ano (1900-2100)

---

**8.2.3 Collection: `location_history`**

**Propósito:**
- Rastrear histórico de lotações de veículos
- Timeline completa de movimentações

**Estrutura do Documento:**
```javascript
{
  "_id": ObjectId("507f1f77bcf86cd799439012"),
  "vehicle_id": "507f1f77bcf86cd799439011",  // String (ObjectId convertido)
  "local": "Secretaria de Saúde",            // String
  "departamento": "Departamento de Vigilância Sanitária",  // String
  "data_inicio": "2026-04-05T23:00:00.000000+00:00",      // ISO 8601
  "data_fim": null                           // ISO 8601 ou null
}
```

**Campos:**

| Campo | Tipo | Obrigatório | Validação | Default | Descrição |
|-------|------|-------------|-----------|---------|-----------|
| `_id` | ObjectId | Sim (auto) | - | Auto | ID único |
| `vehicle_id` | String | Sim | - | - | ID do veículo (referência) |
| `local` | String | Sim | - | - | Lotação/secretaria |
| `departamento` | String | Sim | - | - | Departamento/setor |
| `data_inicio` | String | Sim | ISO 8601 | - | Início da lotação |
| `data_fim` | String ou Null | Não | ISO 8601 | null | Fim da lotação (null = atual) |

**Índices:**
```javascript
db.location_history.createIndex({ "vehicle_id": 1 })
```

**Interpretação:**
- `data_fim = null`: Lotação ATUAL (ativa)
- `data_fim != null`: Lotação PASSADA (finalizada)

**Query Exemplo:**
```javascript
// Buscar lotação atual de um veículo
db.location_history.find({
  "vehicle_id": "507f...",
  "data_fim": null
})

// Buscar histórico completo ordenado
db.location_history.find({
  "vehicle_id": "507f..."
}).sort({ "data_inicio": -1 })
```

**Regras de Negócio:**
1. Cada veículo pode ter APENAS UMA lotação com `data_fim = null`
2. Ao mudar lotação:
   - Finaliza lotação anterior (define `data_fim`)
   - Cria nova com `data_fim = null`
3. Ao deletar veículo, deleta todo histórico

**Observação:**
- **Falta:** Foreign key constraint (MongoDB não suporta nativamente)
- **Falta:** Validação `data_fim > data_inicio`
- **Falta:** Garantia de apenas 1 lotação ativa por veículo (índice parcial)

**Índice Parcial Recomendado:**
```javascript
db.location_history.createIndex(
  { "vehicle_id": 1 },
  { 
    unique: true,
    partialFilterExpression: { "data_fim": null }
  }
)
```
Isso garante que cada veículo tenha APENAS 1 lotação ativa.

---

### 8.3 Diagrama de Relacionamentos

```
┌─────────────────────┐
│      users          │
├─────────────────────┤
│ _id (PK)            │
│ email (UNIQUE)      │
│ password_hash       │
│ name                │
│ role                │
│ created_at          │
└─────────────────────┘
         │
         │ (Nenhuma relação direta)
         │
┌─────────────────────┐          ┌──────────────────────────┐
│     vehicles        │ 1      * │   location_history       │
├─────────────────────┤──────────├──────────────────────────┤
│ _id (PK)            │          │ _id (PK)                 │
│ placa               │          │ vehicle_id (FK*)         │
│ marca               │          │ local                    │
│ modelo              │          │ departamento             │
│ ano_fabricacao      │          │ data_inicio              │
│ chassi              │          │ data_fim (nullable)      │
│ status              │          └──────────────────────────┘
│ lotacao_atual       │
│ departamento        │
│ created_at          │
│ updated_at          │
└─────────────────────┘

* FK = Pseudo Foreign Key (não enforced)
```

**Relacionamentos:**
- **users ↔ vehicles:** Nenhum relacionamento direto
  - Usuários não "possuem" veículos
  - Relacionamento apenas via autenticação (quem pode editar)
  
- **vehicles ↔ location_history:** 1 para N
  - 1 veículo tem N entradas de histórico
  - `vehicle_id` referencia `vehicles._id` (como string)
  - Cascata de delete manual (não automática)

**Integridade Referencial:**
- MongoDB não suporta foreign keys nativamente
- Implementado via lógica de aplicação:
  ```python
  # Ao deletar veículo
  await db.location_history.delete_many({"vehicle_id": vehicle_id})
  ```

---

### 8.4 Migrations e Seeds

**Migrations:**
- **Não existem** formalmente (MongoDB é schema-less)
- Mudanças de schema via:
  1. Atualização de código
  2. Scripts de migração manuais (se necessário)

**Seeds:**
- Implementados em `startup_event()`
- Executam automaticamente ao iniciar servidor
- Idempotentes (seguros para re-executar)

**Dados Seedados:**
1. **Admin User:**
   - Email: `admin@pmtf.gov.br`
   - Senha: `admin123`
   - Role: ADMIN

2. **Usuário Padrão:**
   - Email: `usuario@pmtf.gov.br`
   - Senha: `usuario123`
   - Role: PADRÃO

3. **4 Veículos de Teste:**
   - ABC-1234 (Chevrolet S10) - EM_ATIVIDADE
   - DEF-5678 (Fiat Toro) - EM_MANUTENCAO
   - GHI-9012 (Toyota Hilux) - EM_ATIVIDADE
   - JKL-3456 (VW Amarok) - INATIVO

4. **Histórico Inicial:**
   - 1 entrada por veículo com `data_fim = null`

**Script de Limpeza (se necessário):**
```python
# Para resetar banco em dev
async def reset_database():
    await db.users.delete_many({})
    await db.vehicles.delete_many({})
    await db.location_history.delete_many({})
    # Re-executar startup_event() manualmente
```

---

### 8.5 Queries Comuns

**8.5.1 Listar usuários (sem senha):**
```python
users = await db.users.find({}, {"password_hash": 0}).to_list(1000)
```

**8.5.2 Buscar usuário por email:**
```python
user = await db.users.find_one({"email": "admin@pmtf.gov.br"})
```

**8.5.3 Buscar veículos por status:**
```python
vehicles = await db.vehicles.find({"status": "EM_ATIVIDADE"}).to_list(1000)
```

**8.5.4 Buscar veículo por placa (parcial, case-insensitive):**
```python
vehicles = await db.vehicles.find({
    "placa": {"$regex": "ABC", "$options": "i"}
}).to_list(1000)
```

**8.5.5 Atualizar status de veículo:**
```python
await db.vehicles.update_one(
    {"_id": ObjectId(vehicle_id)},
    {"$set": {"status": "EM_MANUTENCAO", "updated_at": datetime.now(timezone.utc).isoformat()}}
)
```

**8.5.6 Finalizar lotações anteriores:**
```python
await db.location_history.update_many(
    {"vehicle_id": vehicle_id, "data_fim": None},
    {"$set": {"data_fim": datetime.now(timezone.utc).isoformat()}}
)
```

**8.5.7 Buscar histórico de veículo ordenado:**
```python
history = await db.location_history.find(
    {"vehicle_id": vehicle_id}
).sort("data_inicio", -1).to_list(1000)
```

**8.5.8 Contar veículos por status:**
```python
count = await db.vehicles.count_documents({"status": "EM_ATIVIDADE"})
```

**8.5.9 Deletar veículo e histórico (cascata manual):**
```python
await db.vehicles.delete_one({"_id": ObjectId(vehicle_id)})
await db.location_history.delete_many({"vehicle_id": vehicle_id})
```

---

## 9. AUTENTICAÇÃO E AUTORIZAÇÃO

### 9.1 Mecanismo de Autenticação

**Tipo:** JWT (JSON Web Token) baseado em cookies

**Fluxo Completo:**

```
1. LOGIN
   ┌─────────┐                 ┌──────────┐                ┌──────────┐
   │ Browser │                 │  Backend │                │ MongoDB  │
   └────┬────┘                 └─────┬────┘                └─────┬────┘
        │                            │                           │
        │ POST /api/auth/login       │                           │
        │ {email, password}          │                           │
        ├───────────────────────────>│                           │
        │                            │ find_one({email})         │
        │                            ├──────────────────────────>│
        │                            │<──────────────────────────┤
        │                            │ user document             │
        │                            │                           │
        │                            │ verify_password()         │
        │                            │ (bcrypt.checkpw)          │
        │                            │                           │
        │                            │ create_access_token()     │
        │                            │ create_refresh_token()    │
        │                            │                           │
        │ Set-Cookie: access_token   │                           │
        │ Set-Cookie: refresh_token  │                           │
        │ {user_data}                │                           │
        │<───────────────────────────┤                           │
        │                            │                           │

2. REQUISIÇÃO AUTENTICADA
   ┌─────────┐                 ┌──────────┐                ┌──────────┐
   │ Browser │                 │  Backend │                │ MongoDB  │
   └────┬────┘                 └─────┬────┘                └─────┬────┘
        │                            │                           │
        │ GET /api/vehicles          │                           │
        │ Cookie: access_token=...   │                           │
        ├───────────────────────────>│                           │
        │                            │ get_current_user()        │
        │                            │ jwt.decode(token)         │
        │                            │                           │
        │                            │ find_one({_id})           │
        │                            ├──────────────────────────>│
        │                            │<──────────────────────────┤
        │                            │ user document             │
        │                            │                           │
        │                            │ find(vehicles)            │
        │                            ├──────────────────────────>│
        │                            │<──────────────────────────┤
        │                            │ vehicles list             │
        │                            │                           │
        │ 200 OK                     │                           │
        │ [vehicles]                 │                           │
        │<───────────────────────────┤                           │

3. LOGOUT
   ┌─────────┐                 ┌──────────┐
   │ Browser │                 │  Backend │
   └────┬────┘                 └─────┬────┘
        │                            │
        │ POST /api/auth/logout      │
        ├───────────────────────────>│
        │                            │ delete_cookie()
        │                            │ delete_cookie()
        │                            │
        │ Set-Cookie: (deleted)      │
        │ 200 OK                     │
        │<───────────────────────────┤
```

---

### 9.2 Estrutura do JWT

**Access Token Payload:**
```json
{
  "sub": "507f1f77bcf86cd799439011",  // user_id
  "email": "admin@pmtf.gov.br",
  "exp": 1743894900,                   // Unix timestamp (15min future)
  "type": "access"
}
```

**Refresh Token Payload:**
```json
{
  "sub": "507f1f77bcf86cd799439011",
  "exp": 1744499700,                   // Unix timestamp (7 days future)
  "type": "refresh"
}
```

**Algoritmo:** HS256 (HMAC SHA-256)
**Chave:** Definida em `JWT_SECRET` (.env)

---

### 9.3 Armazenamento de Token

**Cookies httpOnly:**
```python
response.set_cookie(
    key="access_token",
    value=access_token,
    httponly=True,      # Não acessível via JavaScript
    secure=False,       # True em produção (HTTPS only)
    samesite="lax",     # Proteção CSRF
    max_age=900,        # 15 minutos em segundos
    path="/"            # Disponível em todas as rotas
)
```

**Atributos:**
- **httpOnly:** JavaScript não pode ler (proteção XSS)
- **secure:** Apenas HTTPS (deve ser True em produção)
- **samesite:** `lax` ou `strict` (proteção CSRF)
- **max_age:** Tempo de vida em segundos
- **path:** Rotas onde cookie é enviado

**Comparação com localStorage:**

| Aspecto | Cookie httpOnly | localStorage |
|---------|----------------|--------------|
| Segurança XSS | ✅ Protegido | ❌ Vulnerável |
| Segurança CSRF | ⚠️ Necessita SameSite | ✅ Não afetado |
| Envio Automático | ✅ Sim | ❌ Não (manual) |
| Tamanho Limite | ~4KB | ~5-10MB |
| Acesso JS | ❌ Não | ✅ Sim |
| Melhor para | Autenticação | Dados públicos |

**Decisão do Projeto:**
- Cookies httpOnly escolhidos por segurança
- Trade-off: vulnerável a CSRF (mitigado com SameSite)

---

### 9.4 Verificação de Autenticação

**get_current_user() - Dependency Injection:**

```python
async def get_current_user(request: Request) -> dict:
    # 1. Extrair token
    token = request.cookies.get("access_token")
    if not token:
        # Fallback para Authorization header
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    
    if not token:
        raise HTTPException(status_code=401, detail="Não autenticado")
    
    # 2. Decodificar e validar JWT
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Tipo de token inválido")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")
    
    # 3. Buscar usuário no banco
    user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
    if not user:
        raise HTTPException(status_code=401, detail="Usuário não encontrado")
    
    # 4. Preparar resposta (sem senha)
    user["_id"] = str(user["_id"])
    user.pop("password_hash", None)
    return user
```

**Uso em Rotas:**
```python
@api_router.get("/vehicles")
async def get_vehicles(current_user: dict = Depends(get_current_user)):
    # current_user já está autenticado e validado
    vehicles = await db.vehicles.find({}).to_list(1000)
    return vehicles
```

---

### 9.5 Autorização por Role

**require_admin() - Dependency Injection:**

```python
async def require_admin(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "ADMIN":
        raise HTTPException(status_code=403, detail="Acesso negado. Apenas administradores.")
    return current_user
```

**Uso:**
```python
@api_router.post("/vehicles")
async def create_vehicle(vehicle_data: VehicleCreate, current_user: dict = Depends(require_admin)):
    # Só ADMIN chega aqui
    # ...
```

**Fluxo:**
1. `require_admin` chama `get_current_user` (via Depends)
2. Se usuário não autenticado → 401 (antes de checar role)
3. Se autenticado mas role != "ADMIN" → 403
4. Se ADMIN → continua para função da rota

---

### 9.6 Matriz de Permissões

| Endpoint | Anônimo | PADRÃO | ADMIN |
|----------|---------|--------|-------|
| POST /api/auth/register | ✅ | ✅ | ✅ |
| POST /api/auth/login | ✅ | ✅ | ✅ |
| POST /api/auth/logout | ❌ | ✅ | ✅ |
| GET /api/auth/me | ❌ | ✅ | ✅ |
| GET /api/users | ❌ | ❌ | ✅ |
| POST /api/users | ❌ | ❌ | ✅ |
| DELETE /api/users/{id} | ❌ | ❌ | ✅ |
| GET /api/vehicles | ❌ | ✅ | ✅ |
| GET /api/vehicles/em-* | ❌ | ✅ | ✅ |
| POST /api/vehicles | ❌ | ❌ | ✅ |
| PUT /api/vehicles/{id} | ❌ | ❌ | ✅ |
| DELETE /api/vehicles/{id} | ❌ | ❌ | ✅ |
| GET /api/vehicles/{id}/historico | ❌ | ✅ | ✅ |

**Legendas:**
- ✅ Permitido
- ❌ Negado (401 ou 403)

---

### 9.7 Refresh Token (Não Implementado)

**Função Existe Mas Endpoint Não:**
```python
def create_refresh_token(user_id: str) -> str:
    # Função existe e token é criado
    ...

# MAS: Endpoint /api/auth/refresh NÃO EXISTE
```

**Implementação Recomendada:**
```python
@api_router.post("/auth/refresh")
async def refresh_access_token(request: Request, response: Response):
    # 1. Ler refresh_token do cookie
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token não encontrado")
    
    # 2. Validar refresh token
    try:
        payload = jwt.decode(refresh_token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Token inválido")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")
    
    # 3. Buscar usuário
    user_id = payload["sub"]
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=401, detail="Usuário não encontrado")
    
    # 4. Criar novo access token
    new_access_token = create_access_token(user_id, user["email"])
    
    # 5. Definir cookie
    response.set_cookie(
        key="access_token",
        value=new_access_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=900,
        path="/"
    )
    
    return {"message": "Token renovado com sucesso"}
```

**Frontend (uso recomendado):**
```javascript
// Interceptor Axios para auto-refresh
axios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Tentar refresh
      try {
        await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        // Retry request original
        return axios(error.config);
      } catch (refreshError) {
        // Refresh falhou, redirecionar para login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

---

### 9.8 Reproduzir Fora do Emergent

**Requisitos:**
1. FastAPI com dependências (PyJWT, bcrypt)
2. MongoDB rodando
3. Variáveis de ambiente configuradas
4. Frontend com axios e withCredentials

**Código Portável:**
- Todo código de auth já está portável
- Não há dependências específicas do Emergent

**Checklist de Migração:**
1. ✅ Copiar funções de auth (hash_password, create_token, etc.)
2. ✅ Copiar dependencies (get_current_user, require_admin)
3. ✅ Copiar rotas de auth
4. ✅ Configurar CORS com allow_credentials=True
5. ✅ Configurar JWT_SECRET forte
6. ✅ Habilitar HTTPS em produção (secure=True em cookies)
7. ✅ Implementar rate limiting (opcional mas recomendado)
8. ✅ Implementar endpoint de refresh (recomendado)

**Melhorias de Segurança:**
1. **Rate Limiting:**
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@api_router.post("/auth/login")
@limiter.limit("5/minute")  # Máximo 5 tentativas por minuto
async def login(...):
    ...
```

2. **Brute Force Protection:**
```python
# Armazenar tentativas em Redis/MongoDB
login_attempts = {}  # {email: count}

if email in login_attempts and login_attempts[email] > 5:
    raise HTTPException(status_code=429, detail="Muitas tentativas. Tente novamente em 15 minutos.")
```

3. **Token Blacklist (para logout imediato):**
```python
# Collection: token_blacklist
await db.token_blacklist.insert_one({
    "token": access_token,
    "exp": datetime.now(timezone.utc) + timedelta(minutes=15)
})

# Verificar em get_current_user
blacklisted = await db.token_blacklist.find_one({"token": token})
if blacklisted:
    raise HTTPException(status_code=401, detail="Token revogado")
```

Continuando a documentação técnica completa:

---

## 10. REGRAS DE NEGÓCIO

### 10.1 Regras de Usuários

**RN-USR-001: Cadastro de Usuário**
- Email deve ser único no sistema (índice MongoDB garante)
- Email convertido para lowercase antes de salvar
- Senha hasheada com bcrypt (salt gerado automaticamente)
- Role padrão é "PADRÃO" se não especificado
- created_at definido automaticamente como UTC ISO 8601

**RN-USR-002: Validação de Email**
- Deve ser um email válido (Pydantic EmailStr valida)
- Case-insensitive (admin@test.com = ADMIN@test.com)
- Não pode ser vazio ou nulo

**RN-USR-003: Senha**
- Mínimo: não há validação explícita (falha do sistema)
- Hash: bcrypt com salt automático
- Armazenamento: apenas hash, nunca plaintext
- Verificação: timing-safe com bcrypt.checkpw

**RN-USR-004: Roles**
- Apenas dois roles permitidos: "ADMIN" e "PADRÃO"
- Case-sensitive (deve ser exatamente como definido)
- Role não pode ser alterado após criação (falta endpoint de update)
- Admin pode criar usuários de qualquer role

**RN-USR-005: Exclusão de Usuário**
- Apenas ADMIN pode deletar usuários
- Não há verificação se usuário está deletando a si próprio (vulnerabilidade)
- Não há verificação de dados relacionados
- Exclusão é permanente (sem soft delete)

**RN-USR-006: Admin Seed**
- Admin padrão criado automaticamente no startup
- Se admin existe mas senha mudou no .env, atualiza senha
- Email do admin vem de ADMIN_EMAIL (.env)
- Senha do admin vem de ADMIN_PASSWORD (.env)

---

### 10.2 Regras de Veículos

**RN-VEH-001: Cadastro de Veículo**
- Todos os campos obrigatórios: placa, marca, modelo, ano_fabricacao, chassi, lotacao_atual, departamento
- Status padrão: "EM_ATIVIDADE" se não especificado
- created_at e updated_at definidos automaticamente (UTC ISO 8601)
- Histórico inicial criado automaticamente com data_fim = null

**RN-VEH-002: Status Válidos**
- "EM_ATIVIDADE": Veículo operacional
- "EM_MANUTENCAO": Veículo em manutenção
- "INATIVO": Veículo fora de operação
- Qualquer outro valor não é validado (falha - deveria retornar erro)

**RN-VEH-003: Placa**
- Armazenada como fornecida (sem normalização)
- Sem validação de formato (deveria validar AAA-1234 ou similar)
- Sem índice único (permite duplicatas - problema potencial)
- Case-sensitive em armazenamento (ABC-1234 ≠ abc-1234)
- Busca case-insensitive via regex

**RN-VEH-004: Ano de Fabricação**
- Deve ser número inteiro
- Sem validação de range (aceita 0, 9999, números negativos - problema)
- Deveria validar: 1900 <= ano <= ano_atual + 1

**RN-VEH-005: Edição de Veículo**
- Apenas ADMIN pode editar
- Atualização parcial permitida (campos opcionais)
- updated_at atualizado automaticamente
- Se lotacao_atual OU departamento mudarem:
  - Finaliza lotação anterior (define data_fim)
  - Cria nova entrada de histórico
  - Mesmo se apenas um campo mudar, cria nova entrada com ambos

**RN-VEH-006: Lotação e Departamento**
- Sempre armazenados juntos
- Mudança em um implica atualização do histórico
- Lotação atual no veículo deve sempre bater com última entrada de histórico (data_fim = null)
- Se alterar apenas departamento sem lotacao_atual, usa lotacao_atual existente do veículo

**RN-VEH-007: Exclusão de Veículo**
- Apenas ADMIN pode deletar
- Cascata manual: deleta todo histórico de lotação
- Exclusão permanente (sem soft delete)
- Sem confirmação adicional (apenas no frontend com window.confirm)

**RN-VEH-008: Listagem e Filtros**
- Todos usuários autenticados podem listar
- Filtros por placa e marca: case-insensitive, substring match
- Limite de 1000 veículos por query (proteção)
- Ordenação: não especificada (ordem de inserção do MongoDB)

---

### 10.3 Regras de Histórico de Lotação

**RN-HIST-001: Criação de Histórico**
- Criado automaticamente ao cadastrar veículo
- Criado automaticamente ao editar lotacao_atual ou departamento
- data_inicio sempre definido como agora (UTC)
- data_fim sempre null para lotação atual

**RN-HIST-002: Lotação Atual**
- Cada veículo pode ter APENAS UMA entrada com data_fim = null
- Esta entrada representa a lotação atual
- Ao mudar lotação, antiga é finalizada (data_fim definido)

**RN-HIST-003: Finalização de Lotação**
- Ao editar lotacao_atual ou departamento:
- Busca todas entradas com data_fim = null para o veículo
- Define data_fim = agora (UTC)
- Permite múltiplas finalizações simultâneas (problema: deveria ser única)

**RN-HIST-004: Ordem Cronológica**
- Histórico retornado ordenado por data_inicio DESC (mais recente primeiro)
- Permite visualizar timeline completa

**RN-HIST-005: Exclusão de Histórico**
- Apenas deletado quando veículo é deletado (cascata manual)
- Não há endpoint para deletar entrada individual
- Não há endpoint para editar histórico

**RN-HIST-006: Validações Ausentes**
- Não valida data_fim > data_inicio
- Não valida sobreposição de períodos
- Não garante que apenas 1 lotação está ativa (deveria ter índice parcial único)

---

### 10.4 Regras de Autenticação

**RN-AUTH-001: Login**
- Email case-insensitive
- Verificação timing-safe da senha (bcrypt)
- Mensagem de erro genérica (não revela se email existe)
- Gera access_token (15min) e refresh_token (7 dias)
- Tokens armazenados em cookies httpOnly

**RN-AUTH-002: Registro**
- Email deve ser único
- Senha hasheada antes de salvar
- Usuário automaticamente logado após registro
- Tokens criados e retornados

**RN-AUTH-003: Logout**
- Deleta cookies access_token e refresh_token
- Token JWT continua válido até expirar (stateless)
- Não há invalidação imediata do token

**RN-AUTH-004: Verificação de Sessão**
- GET /api/auth/me verifica se token ainda válido
- Token expirado → 401
- Token válido mas usuário deletado → 401
- Retorna dados do usuário (sem senha)

**RN-AUTH-005: Expiração de Token**
- Access token: 15 minutos
- Refresh token: 7 dias (não usado atualmente)
- Após expiração, usuário deve fazer login novamente

**RN-AUTH-006: Cookies**
- httpOnly: true (proteção XSS)
- secure: false em dev, true em prod
- samesite: lax (proteção CSRF parcial)
- path: / (disponível em todas rotas)

---

### 10.5 Regras de Autorização

**RN-AUTHZ-001: Acesso Público**
- Apenas /api/auth/register e /api/auth/login são públicos
- Todas outras rotas exigem autenticação

**RN-AUTHZ-002: Role PADRÃO**
- Pode visualizar todos veículos (todas listagens)
- Pode visualizar histórico de lotação
- Pode fazer logout
- NÃO pode criar, editar ou deletar veículos
- NÃO pode gerenciar usuários
- NÃO pode acessar /api/users

**RN-AUTHZ-003: Role ADMIN**
- Todas permissões de PADRÃO +
- Pode criar, editar e deletar veículos
- Pode criar e deletar usuários
- Pode listar todos usuários

**RN-AUTHZ-004: Proteção de Rotas**
- Dependency Injection: Depends(get_current_user)
- Admin-only: Depends(require_admin)
- Usuário não autenticado → 401 Unauthorized
- Usuário autenticado mas sem permissão → 403 Forbidden

---

### 10.6 Regras de Validação

**RN-VAL-001: Validação Pydantic**
- Automática em todos endpoints
- Campos obrigatórios: erro 422 se ausentes
- Tipos incorretos: erro 422
- Email inválido: erro 422

**RN-VAL-002: Validação de Duplicatas**
- Email de usuário: verificado manualmente antes de insert
- Placa de veículo: NÃO verificado (permite duplicatas - problema)

**RN-VAL-003: Validação de Existência**
- Ao editar/deletar: verifica se registro existe
- Se não existe: erro 404

**RN-VAL-004: Validação de ObjectId**
- MongoDB valida automaticamente
- ObjectId inválido causa exception (não tratada - erro 500)
- Deveria retornar 400 Bad Request

---

### 10.7 Regras de Timestamps

**RN-TIME-001: Formato**
- Sempre UTC
- Sempre ISO 8601: "2026-04-05T23:00:00.000000+00:00"
- Gerado com: datetime.now(timezone.utc).isoformat()

**RN-TIME-002: created_at**
- Definido apenas na criação
- Nunca atualizado
- Presente em: users, vehicles
- Não presente em: location_history (tem data_inicio)

**RN-TIME-003: updated_at**
- Definido na criação (igual a created_at)
- Atualizado em TODA edição
- Presente em: vehicles
- Não presente em: users (problema - deveria ter)

**RN-TIME-004: data_inicio e data_fim**
- data_inicio: sempre definido na criação da entrada
- data_fim: null para lotação atual, UTC ISO quando finalizada
- Interpretação: data_fim = null → ativo

---

### 10.8 Regras de Integridade

**RN-INT-001: Integridade Referencial**
- MongoDB não suporta foreign keys
- Implementada manualmente:
  - Ao deletar veículo: deleta histórico
  - Ao editar lotação: finaliza anteriores
- Risco: dados órfãos se lógica falhar

**RN-INT-002: Unicidade**
- Email de usuário: garantido por índice unique
- Placa de veículo: NÃO garantido (problema)
- ID (_id): garantido pelo MongoDB (ObjectId)

**RN-INT-003: Consistência de Lotação**
- Lotação atual no veículo DEVE bater com histórico (data_fim = null)
- Verificação: não implementada (confiança na lógica)
- Risco: inconsistência se edição falhar parcialmente

---

### 10.9 Regras de Segurança

**RN-SEC-001: Hash de Senha**
- Algoritmo: bcrypt
- Salt: gerado automaticamente (único por senha)
- Custo: padrão (12 rounds - inferido)
- Nunca retornar senha em responses

**RN-SEC-002: JWT**
- Algoritmo: HS256 (HMAC SHA-256)
- Chave: JWT_SECRET do .env (deve ser forte)
- Payload: não criptografado (apenas assinado)
- Não incluir dados sensíveis no payload

**RN-SEC-003: CORS**
- allow_credentials: true (necessário para cookies)
- allow_origins: * em dev, específico em prod
- allow_methods e allow_headers: * (permissivo)

**RN-SEC-004: Cookies**
- httpOnly: proteção XSS
- secure: apenas em HTTPS (prod)
- samesite: lax (proteção CSRF parcial)

**RN-SEC-005: Rate Limiting**
- NÃO implementado (vulnerabilidade)
- Deveria limitar tentativas de login
- Deveria limitar requisições por IP

---

### 10.10 Regras Ausentes (Melhorias Necessárias)

**RN-MISS-001: Soft Delete**
- Não implementado
- Exclusões são permanentes
- Deveria ter campo "deleted_at" e filtrar em queries

**RN-MISS-002: Auditoria**
- Não rastreia quem criou/editou/deletou
- Deveria ter campos: created_by, updated_by, deleted_by

**RN-MISS-003: Paginação**
- Limite fixo de 1000 registros
- Sem suporte a offset/limit
- Sem metadados (total, página atual, etc.)

**RN-MISS-004: Ordenação**
- Não permite customização
- Usa ordem natural do MongoDB

**RN-MISS-005: Validação de Formato**
- Placa: sem validação de formato
- Chassi: sem validação
- Ano: sem range validation

**RN-MISS-006: Campos de Texto**
- Sem sanitização de HTML
- Sem limite de tamanho (MongoDB limita 16MB por documento)

---

## 11. INTEGRAÇÕES EXTERNAS

### 11.1 Integrações Usadas

**NENHUMA integração externa está implementada.**

O sistema é completamente standalone:
- Sem serviços de email
- Sem serviços de SMS
- Sem storage externo (S3, etc.)
- Sem analytics
- Sem mapas
- Sem consulta de CEP
- Sem APIs governamentais
- Sem webhooks

---

### 11.2 Integrações Recomendadas para Produção

**11.2.1 Email (Notificações)**

**Propósito:**
- Recuperação de senha
- Confirmação de cadastro
- Notificações de mudanças

**Provedores Sugeridos:**
- **SendGrid:** API REST, template engine
- **Resend:** Moderno, bom DX
- **AWS SES:** Econômico para alto volume

**Implementação Exemplo (SendGrid):**
```python
import sendgrid
from sendgrid.helpers.mail import Mail

sg = sendgrid.SendGridAPIClient(api_key=os.environ.get('SENDGRID_API_KEY'))

async def send_password_reset_email(email: str, token: str):
    message = Mail(
        from_email='noreply@pmtf.gov.br',
        to_emails=email,
        subject='Recuperação de Senha - Frota PMTF',
        html_content=f'<p>Clique no link para resetar: <a href="https://frota.pmtf.gov.br/reset?token={token}">Resetar Senha</a></p>'
    )
    response = sg.send(message)
    return response.status_code
```

**Substituição:**
- Biblioteca: `sendgrid` ou `resend`
- Endpoint novo: POST /api/auth/forgot-password
- Armazenar tokens de reset em collection separada

---

**11.2.2 Storage de Arquivos (Fotos de Veículos)**

**Propósito:**
- Upload de fotos de veículos
- Documentos (manual, seguro, etc.)
- Armazenamento escalável

**Provedores Sugeridos:**
- **AWS S3:** Padrão da indústria
- **Cloudflare R2:** Sem custo de egress
- **Supabase Storage:** Open source, fácil

**Implementação Exemplo (AWS S3):**
```python
import boto3
from fastapi import UploadFile

s3_client = boto3.client(
    's3',
    aws_access_key_id=os.environ.get('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS_KEY'),
    region_name=os.environ.get('AWS_REGION')
)

@api_router.post("/vehicles/{vehicle_id}/photo")
async def upload_vehicle_photo(
    vehicle_id: str,
    file: UploadFile,
    current_user: dict = Depends(require_admin)
):
    # 1. Validar tipo de arquivo
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="Apenas imagens são permitidas")
    
    # 2. Gerar nome único
    file_key = f"vehicles/{vehicle_id}/{file.filename}"
    
    # 3. Upload para S3
    s3_client.upload_fileobj(
        file.file,
        os.environ.get('S3_BUCKET'),
        file_key,
        ExtraArgs={'ContentType': file.content_type}
    )
    
    # 4. Gerar URL pública
    photo_url = f"https://{os.environ.get('S3_BUCKET')}.s3.amazonaws.com/{file_key}"
    
    # 5. Salvar URL no veículo
    await db.vehicles.update_one(
        {"_id": ObjectId(vehicle_id)},
        {"$set": {"photo_url": photo_url}}
    )
    
    return {"photo_url": photo_url}
```

**Substituição:**
- Biblioteca: `boto3` (S3) ou `supabase` (Supabase)
- Adicionar campo `photo_url` em vehicles
- Frontend: input type="file" + FormData

---

**11.2.3 PDF Avançado (Backend)**

**Situação Atual:**
- PDF gerado no frontend (jsPDF)
- Limitações: apenas dados tabulares

**Propósito:**
- PDFs complexos (relatórios com gráficos)
- Templates profissionais
- Assinatura digital

**Provedores Sugeridos:**
- **ReportLab:** Python library
- **WeasyPrint:** HTML to PDF
- **Puppeteer/Playwright:** Headless browser

**Implementação Exemplo (WeasyPrint):**
```python
from weasyprint import HTML
from fastapi.responses import StreamingResponse
import io

@api_router.get("/vehicles/em-atividade/pdf")
async def export_active_vehicles_pdf(current_user: dict = Depends(get_current_user)):
    # 1. Buscar veículos
    vehicles = await db.vehicles.find({"status": "EM_ATIVIDADE"}).to_list(1000)
    
    # 2. Gerar HTML
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial; }}
            table {{ border-collapse: collapse; width: 100%; }}
            th, td {{ border: 1px solid black; padding: 8px; }}
        </style>
    </head>
    <body>
        <h1>Veículos em Atividade - PMTF</h1>
        <table>
            <tr><th>Placa</th><th>Marca</th><th>Modelo</th></tr>
            {''.join([f'<tr><td>{v["placa"]}</td><td>{v["marca"]}</td><td>{v["modelo"]}</td></tr>' for v in vehicles])}
        </table>
    </body>
    </html>
    """
    
    # 3. Converter para PDF
    pdf_bytes = HTML(string=html_content).write_pdf()
    
    # 4. Retornar como stream
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type='application/pdf',
        headers={'Content-Disposition': 'attachment; filename=veiculos-atividade.pdf'}
    )
```

**Substituição:**
- Biblioteca: `weasyprint` ou `reportlab`
- Melhor controle de layout
- Suporte a gráficos

---

**11.2.4 Notificações em Tempo Real**

**Propósito:**
- Notificar mudanças de status
- Alertas de manutenção vencida
- Comunicação entre usuários

**Provedores Sugeridos:**
- **Pusher:** Managed WebSockets
- **Ably:** Real-time messaging
- **Socket.io:** Self-hosted

**Implementação Exemplo (WebSockets nativo):**
```python
from fastapi import WebSocket
from typing import List

# Armazenar conexões ativas
active_connections: List[WebSocket] = []

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    try:
        while True:
            data = await websocket.receive_text()
    except:
        active_connections.remove(websocket)

async def broadcast_vehicle_update(vehicle_id: str, action: str):
    message = {"type": "vehicle_update", "vehicle_id": vehicle_id, "action": action}
    for connection in active_connections:
        await connection.send_json(message)

# Chamar em update_vehicle
@api_router.put("/vehicles/{vehicle_id}")
async def update_vehicle(...):
    # ... lógica de update
    await broadcast_vehicle_update(vehicle_id, "updated")
    return updated_vehicle
```

**Frontend:**
```javascript
const ws = new WebSocket('wss://frota.pmtf.gov.br/ws');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'vehicle_update') {
    // Atualizar UI
    fetchVehicles();
  }
};
```

---

**11.2.5 Logs e Monitoramento**

**Propósito:**
- Rastreamento de erros
- Performance monitoring
- Analytics

**Provedores Sugeridos:**
- **Sentry:** Error tracking
- **LogRocket:** Session replay
- **DataDog:** APM completo

**Implementação Exemplo (Sentry):**
```python
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_sdk.init(
    dsn=os.environ.get('SENTRY_DSN'),
    integrations=[FastApiIntegration()],
    traces_sample_rate=1.0,
)

# Erros são automaticamente capturados
# Ou capturar manualmente:
try:
    risky_operation()
except Exception as e:
    sentry_sdk.capture_exception(e)
```

---

## 12. FLUXOS COMPLETOS DO SISTEMA

### 12.1 Fluxo de Login

**Eventos e Componentes:**

```
1. USUÁRIO ACESSA /login
   └─> Componente: Login.js
   └─> Estado inicial: email='', password='', error='', loading=false

2. USUÁRIO PREENCHE FORMULÁRIO
   └─> onChange: setEmail(value), setPassword(value)

3. USUÁRIO CLICA "ENTRAR"
   └─> Evento: onSubmit
   └─> Previne default (preventDefault)
   └─> setError('') - limpa erros anteriores
   └─> setLoading(true) - botão vira "Entrando..."

4. FRONTEND CHAMA API
   └─> AuthContext.login(email, password)
   └─> axios.post(BACKEND_URL + '/api/auth/login', {email, password}, {withCredentials: true})
   
5. BACKEND RECEBE REQUEST
   └─> Rota: POST /api/auth/login
   └─> Valida body com Pydantic (UserLogin)
   └─> Se inválido → 422 Unprocessable Entity
   
6. BACKEND BUSCA USUÁRIO
   └─> email_lower = credentials.email.lower()
   └─> user = await db.users.find_one({"email": email_lower})
   └─> Se não encontrado → HTTPException 401 "Email ou senha incorretos"
   
7. BACKEND VERIFICA SENHA
   └─> verify_password(plain, hash)
   └─> bcrypt.checkpw(senha.encode(), hash.encode())
   └─> Se falso → HTTPException 401 "Email ou senha incorretos"
   
8. BACKEND CRIA TOKENS
   └─> user_id = str(user["_id"])
   └─> access_token = create_access_token(user_id, email)
       └─> Payload: {sub, email, exp: 15min, type: "access"}
       └─> jwt.encode(payload, JWT_SECRET, HS256)
   └─> refresh_token = create_refresh_token(user_id)
       └─> Payload: {sub, exp: 7days, type: "refresh"}
       
9. BACKEND DEFINE COOKIES
   └─> response.set_cookie("access_token", value, httponly, samesite, maxage=900)
   └─> response.set_cookie("refresh_token", value, httponly, samesite, maxage=604800)
   
10. BACKEND RETORNA RESPONSE
    └─> 200 OK
    └─> Body: {id, email, name, role, created_at}
    └─> Headers: Set-Cookie (2x)
    
11. FRONTEND RECEBE RESPONSE
    └─> data = response.data
    └─> setUser(data) - AuthContext atualiza estado
    └─> setLoading(false)
    └─> navigate('/dashboard') - React Router redireciona
    
12. NAVEGAÇÃO PARA DASHBOARD
    └─> BrowserRouter muda URL
    └─> Route "/dashboard" ativa
    └─> ProtectedRoute wrapper:
        └─> useAuth() → user agora é objeto (não false)
        └─> Renderiza DashboardLayout
    └─> Dashboard.js renderiza cards
    
13. COOKIES PERSISTEM
    └─> Armazenados no navegador
    └─> Enviados automaticamente em requisições subsequentes
```

**Tratamento de Erro:**
```
SE ERRO NA ETAPA 4-10:
└─> catch (err)
└─> error = formatApiErrorDetail(err.response?.data?.detail)
└─> setError(error)
└─> setLoading(false)
└─> Erro exibido em vermelho acima do formulário
└─> Usuário permanece em /login
```

**Dados Trafegados:**

**Request:**
```http
POST /api/auth/login HTTP/1.1
Host: frota-veiculos.preview.emergentagent.com
Content-Type: application/json
Cookie: (nenhum - primeiro login)

{
  "email": "admin@pmtf.gov.br",
  "password": "admin123"
}
```

**Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json
Set-Cookie: access_token=eyJ...; HttpOnly; Path=/; SameSite=lax; Max-Age=900
Set-Cookie: refresh_token=eyJ...; HttpOnly; Path=/; SameSite=lax; Max-Age=604800

{
  "id": "507f1f77bcf86cd799439011",
  "email": "admin@pmtf.gov.br",
  "name": "Administrador PMTF",
  "role": "ADMIN",
  "created_at": "2026-04-05T20:00:00.000000+00:00"
}
```

---

### 12.2 Fluxo de Cadastro de Veículo

**Passo a Passo Completo:**

```
1. ADMIN NAVEGA PARA /dashboard/cadastrar-veiculo
   └─> ProtectedRoute verifica:
       └─> user existe? Se não → redirect /login
       └─> user.role === "ADMIN"? Se não → redirect /dashboard
   └─> CadastrarVeiculo.js renderiza

2. ESTADO INICIAL DO FORMULÁRIO
   └─> formData = {
       placa: '', marca: '', modelo: '', ano_fabricacao: '',
       chassi: '', status: 'EM_ATIVIDADE', lotacao_atual: '', departamento: ''
   }
   └─> loading = false

3. USUÁRIO PREENCHE CAMPOS
   └─> onChange em cada input:
       └─> handleChange(e):
           └─> setFormData({...formData, [e.target.name]: e.target.value})
   └─> Select de status:
       └─> handleStatusChange(value):
           └─> setFormData({...formData, status: value})

4. USUÁRIO CLICA "CADASTRAR VEÍCULO"
   └─> onSubmit evento
   └─> e.preventDefault()
   └─> setLoading(true)

5. VALIDAÇÃO HTML5
   └─> Navegador valida campos obrigatórios (required)
   └─> Se vazio → mostra mensagem nativa do browser
   └─> ano_fabricacao: type="number" → valida que é número

6. FRONTEND ENVIA REQUEST
   └─> axios.post(
       BACKEND_URL + '/api/vehicles',
       {...formData, ano_fabricacao: parseInt(formData.ano_fabricacao)},
       {withCredentials: true}
   )
   └─> Cookie access_token enviado automaticamente

7. BACKEND RECEBE REQUEST
   └─> Rota: POST /api/vehicles
   └─> Dependency: current_user = Depends(require_admin)
       └─> Extrai token do cookie
       └─> Decodifica JWT
       └─> Busca usuário no banco
       └─> Verifica role === "ADMIN"
       └─> Se não ADMIN → 403 Forbidden
   
8. VALIDAÇÃO PYDANTIC
   └─> VehicleCreate valida body
   └─> Campos obrigatórios presentes?
   └─> Tipos corretos (int, str)?
   └─> Se falha → 422 Unprocessable Entity

9. BACKEND CRIA DOCUMENTO DO VEÍCULO
   └─> vehicle_doc = vehicle_data.model_dump()
   └─> vehicle_doc["created_at"] = datetime.now(timezone.utc).isoformat()
   └─> vehicle_doc["updated_at"] = datetime.now(timezone.utc).isoformat()

10. BACKEND INSERE NO MONGODB
    └─> result = await db.vehicles.insert_one(vehicle_doc)
    └─> vehicle_id = str(result.inserted_id)

11. BACKEND CRIA HISTÓRICO INICIAL
    └─> history_doc = {
        "vehicle_id": vehicle_id,
        "local": vehicle_data.lotacao_atual,
        "departamento": vehicle_data.departamento,
        "data_inicio": datetime.now(timezone.utc).isoformat(),
        "data_fim": None
    }
    └─> await db.location_history.insert_one(history_doc)

12. BACKEND PREPARA RESPOSTA
    └─> vehicle_doc["id"] = vehicle_id
    └─> vehicle_doc.pop("_id", None)
    └─> return vehicle_doc

13. BACKEND RETORNA 200 OK
    └─> Body: veículo completo com id, timestamps

14. FRONTEND RECEBE RESPOSTA
    └─> toast.success('Veículo cadastrado com sucesso!')
    └─> navigate('/dashboard/veiculos-atividade')

15. NAVEGAÇÃO PARA LISTAGEM
    └─> VeiculosAtividade.js monta
    └─> useEffect chama fetchVehicles()
    └─> GET /api/vehicles/em-atividade
    └─> Novo veículo aparece na lista
```

**Tratamento de Erro:**
```
SE ERRO:
└─> catch (error)
└─> toast.error(error.response?.data?.detail || 'Erro ao cadastrar veículo')
└─> setLoading(false)
└─> Usuário permanece no formulário
└─> Dados preenchidos mantidos (não limpa formData)
```

**Request/Response:**

**Request:**
```http
POST /api/vehicles HTTP/1.1
Host: frota-veiculos.preview.emergentagent.com
Content-Type: application/json
Cookie: access_token=eyJ...

{
  "placa": "MNO-7890",
  "marca": "Ford",
  "modelo": "Ranger",
  "ano_fabricacao": 2022,
  "chassi": "9BWZZZ377VT004255",
  "status": "EM_ATIVIDADE",
  "lotacao_atual": "Secretaria de Educação",
  "departamento": "Departamento de Transporte Escolar"
}
```

**Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": "507f1f77bcf86cd799439014",
  "placa": "MNO-7890",
  "marca": "Ford",
  "modelo": "Ranger",
  "ano_fabricacao": 2022,
  "chassi": "9BWZZZ377VT004255",
  "status": "EM_ATIVIDADE",
  "lotacao_atual": "Secretaria de Educação",
  "departamento": "Departamento de Transporte Escolar",
  "created_at": "2026-04-05T23:35:00.000000+00:00",
  "updated_at": "2026-04-05T23:35:00.000000+00:00"
}
```

---

### 12.3 Fluxo de Listagem com Filtros

```
1. USUÁRIO NAVEGA PARA /dashboard/veiculos-atividade
   └─> VeiculosAtividade.js renderiza
   └─> Passa props para VehicleList:
       status="EM_ATIVIDADE"
       title="Veículos em Atividade"
       endpoint="/em-atividade"

2. VehicleList MONTA
   └─> Estado inicial:
       vehicles=[], loading=true, searchPlaca='', searchMarca=''
   └─> useEffect(() => fetchVehicles(), [searchPlaca, searchMarca])
       └─> Executa fetchVehicles() na montagem

3. BUSCA INICIAL (SEM FILTROS)
   └─> fetchVehicles()
   └─> setLoading(true)
   └─> params = new URLSearchParams()
   └─> searchPlaca e searchMarca vazios → sem params
   └─> axios.get(BACKEND_URL + '/api/vehicles/em-atividade', {withCredentials: true})

4. BACKEND PROCESSA
   └─> Rota: GET /api/vehicles/em-atividade
   └─> Dependency: get_current_user (qualquer usuário autenticado)
   └─> query = {"status": "EM_ATIVIDADE"}
   └─> placa e marca params vazios → não adiciona ao query
   └─> vehicles = await db.vehicles.find(query).to_list(1000)
   └─> Transforma _id em id
   └─> return vehicles

5. FRONTEND RECEBE DADOS
   └─> setVehicles(data)
   └─> setLoading(false)
   └─> Renderiza tabela com todos veículos

6. USUÁRIO DIGITA NO FILTRO DE PLACA
   └─> Input: value={searchPlaca}, onChange={(e) => setSearchPlaca(e.target.value)}
   └─> Digita "ABC"
   └─> setSearchPlaca("ABC")

7. RE-RENDER E RE-FETCH
   └─> searchPlaca mudou → useEffect detecta
   └─> fetchVehicles() executa novamente
   └─> params.append('placa', 'ABC')
   └─> URL: /api/vehicles/em-atividade?placa=ABC

8. BACKEND FILTRA
   └─> placa = "ABC"
   └─> query["placa"] = {"$regex": "ABC", "$options": "i"}
   └─> query final: {"status": "EM_ATIVIDADE", "placa": {"$regex": "ABC", "$options": "i"}}
   └─> MongoDB busca: case-insensitive, substring match

9. FRONTEND ATUALIZA LISTA
   └─> setVehicles(filtered_data)
   └─> Tabela re-renderiza com apenas veículos filtrados

10. USUÁRIO CLICA "LIMPAR FILTROS"
    └─> onClick={() => { setSearchPlaca(''); setSearchMarca(''); }}
    └─> Ambos estados resetados
    └─> useEffect re-executa
    └─> Busca sem filtros novamente
```

**Debounce Implícito:**
- Não há debounce implementado
- Cada keystroke causa re-fetch
- **Melhoria:** Adicionar debounce de 300ms

**Implementação Debounce Recomendada:**
```javascript
import { useEffect, useState } from 'react';

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Uso em VehicleList
const debouncedPlaca = useDebounce(searchPlaca, 300);
const debouncedMarca = useDebounce(searchMarca, 300);

useEffect(() => {
  fetchVehicles();
}, [debouncedPlaca, debouncedMarca]);
```

---

### 12.4 Fluxo de Edição de Veículo

```
1. ADMIN CLICA ÍCONE DE EDITAR
   └─> onClick={() => handleEdit(vehicle)}
   └─> handleEdit:
       └─> setEditingVehicle({...vehicle}) - cópia do veículo
       └─> setEditDialogOpen(true)

2. MODAL DE EDIÇÃO ABRE
   └─> Dialog com DialogContent
   └─> Formulário pré-preenchido com editingVehicle
   └─> Campos editáveis: placa, marca, modelo, status, lotacao_atual, departamento

3. USUÁRIO ALTERA CAMPOS
   └─> onChange={(e) => setEditingVehicle({...editingVehicle, [campo]: e.target.value})}
   └─> Ex: Muda status para "EM_MANUTENCAO"
   └─> Ex: Muda lotacao_atual para "Oficina Municipal"

4. USUÁRIO CLICA "SALVAR ALTERAÇÕES"
   └─> onClick={handleUpdateVehicle}
   └─> axios.put(
       BACKEND_URL + '/api/vehicles/' + editingVehicle.id,
       editingVehicle,
       {withCredentials: true}
   )

5. BACKEND RECEBE
   └─> Rota: PUT /api/vehicles/{vehicle_id}
   └─> Dependency: require_admin
   └─> Body: editingVehicle completo (todos campos)

6. BACKEND FILTRA CAMPOS ALTERADOS
   └─> update_data = {k: v for k, v in vehicle_data.model_dump().items() if v is not None}
   └─> Nota: Pydantic VehicleUpdate tem todos campos Optional
   └─> Frontend envia todos campos (não apenas alterados)
   └─> Todos serão incluídos em update_data

7. BACKEND ADICIONA updated_at
   └─> update_data["updated_at"] = datetime.now(timezone.utc).isoformat()

8. BACKEND VERIFICA MUDANÇA DE LOTAÇÃO
   └─> if "lotacao_atual" in update_data or "departamento" in update_data:
   └─> current_vehicle = await db.vehicles.find_one({"_id": ObjectId(vehicle_id)})
   └─> new_lotacao = update_data.get("lotacao_atual", current_vehicle.get("lotacao_atual"))
   └─> new_departamento = update_data.get("departamento", current_vehicle.get("departamento"))

9. BACKEND FINALIZA LOTAÇÃO ANTERIOR
   └─> await db.location_history.update_many(
       {"vehicle_id": vehicle_id, "data_fim": None},
       {"$set": {"data_fim": datetime.now(timezone.utc).isoformat()}}
   )

10. BACKEND CRIA NOVA ENTRADA DE HISTÓRICO
    └─> history_doc = {
        "vehicle_id": vehicle_id,
        "local": new_lotacao,
        "departamento": new_departamento,
        "data_inicio": datetime.now(timezone.utc).isoformat(),
        "data_fim": None
    }
    └─> await db.location_history.insert_one(history_doc)

11. BACKEND ATUALIZA VEÍCULO
    └─> result = await db.vehicles.update_one(
        {"_id": ObjectId(vehicle_id)},
        {"$set": update_data}
    )
    └─> Se matched_count == 0 → 404

12. BACKEND BUSCA VEÍCULO ATUALIZADO
    └─> updated_vehicle = await db.vehicles.find_one({"_id": ObjectId(vehicle_id)})
    └─> Transforma _id em id
    └─> return updated_vehicle

13. FRONTEND RECEBE RESPOSTA
    └─> toast.success('Veículo atualizado com sucesso!')
    └─> setEditDialogOpen(false) - fecha modal
    └─> fetchVehicles() - re-busca lista completa

14. LISTA ATUALIZA
    └─> Veículo editado aparece com novos dados
    └─> Se status mudou, pode sair da lista atual (ex: era ativo, virou manutenção)
```

**Observação Importante:**
- Frontend envia TODOS campos, não apenas alterados
- Backend poderia otimizar comparando valores antigos vs novos
- Histórico é criado mesmo se lotação não mudou (bug potencial)

---

### 12.5 Fluxo de Visualização de Histórico

```
1. USUÁRIO CLICA ÍCONE DE HISTÓRICO
   └─> onClick={() => handleViewHistory(vehicle)}

2. FRONTEND BUSCA HISTÓRICO
   └─> setSelectedVehicle(vehicle)
   └─> axios.get(
       BACKEND_URL + '/api/vehicles/' + vehicle.id + '/historico',
       {withCredentials: true}
   )

3. BACKEND PROCESSA
   └─> Rota: GET /api/vehicles/{vehicle_id}/historico
   └─> Dependency: get_current_user (qualquer autenticado)
   └─> history = await db.location_history.find({"vehicle_id": vehicle_id})
       .sort("data_inicio", -1)  # Descendente (mais recente primeiro)
       .to_list(1000)
   └─> Transforma _id em id
   └─> return history

4. FRONTEND RECEBE HISTÓRICO
   └─> setSelectedVehicleHistory(data)
   └─> setHistoryDialogOpen(true)

5. MODAL DE HISTÓRICO RENDERIZA
   └─> DialogTitle: "Histórico de Lotação - {vehicle.placa}"
   └─> Tabela com colunas:
       - Lotação
       - Sublotação/Departamento
       - Data Início (formatada pt-BR)
       - Data Fim (formatada pt-BR ou "-")
       - Status (badge Atual/Finalizado)

6. RENDERIZAÇÃO DE CADA ENTRADA
   └─> history.map((entry) => (
       <TableRow>
         <TableCell>{entry.local}</TableCell>
         <TableCell>{entry.departamento || '-'}</TableCell>
         <TableCell>{new Date(entry.data_inicio).toLocaleDateString('pt-BR')}</TableCell>
         <TableCell>
           {entry.data_fim 
             ? new Date(entry.data_fim).toLocaleDateString('pt-BR')
             : '-'}
         </TableCell>
         <TableCell>
           {!entry.data_fim ? (
             <Badge green>Atual</Badge>
           ) : (
             <Badge gray>Finalizado</Badge>
           )}
         </TableCell>
       </TableRow>
   ))

7. USUÁRIO VISUALIZA TIMELINE
   └─> Primeira linha: Lotação atual (data_fim = null, badge verde "Atual")
   └─> Demais linhas: Lotações passadas (data_fim preenchido, badge cinza "Finalizado")
   └─> Ordem cronológica inversa (mais recente no topo)
```

**Exemplo de Dados:**
```json
[
  {
    "id": "...",
    "vehicle_id": "507f...",
    "local": "Secretaria de Saúde",
    "departamento": "Depto Vigilância",
    "data_inicio": "2026-04-05T23:00:00.000000+00:00",
    "data_fim": null  // ATUAL
  },
  {
    "id": "...",
    "vehicle_id": "507f...",
    "local": "Secretaria de Obras",
    "departamento": "Depto Infraestrutura",
    "data_inicio": "2026-01-15T10:00:00.000000+00:00",
    "data_fim": "2026-04-05T23:00:00.000000+00:00"  // PASSADO
  }
]
```

---

### 12.6 Fluxo de Exportação PDF

```
1. USUÁRIO CLICA "EXPORTAR PDF"
   └─> onClick={handleExportPDF}

2. FUNÇÃO INICIA
   └─> const doc = new jsPDF();

3. TENTA CARREGAR LOGO
   └─> const img = new Image();
   └─> img.src = 'https://...brasao-pmtf-610x768.png'
   └─> img.crossOrigin = 'anonymous'

4. LOGO CARREGA (img.onload)
   └─> doc.addImage(img, 'PNG', 14, 10, 15, 18)  // x, y, width, height
   └─> doc.setFontSize(16)
   └─> doc.setFont('helvetica', 'bold')
   └─> doc.text('Frota de Veículos PMTF', 35, 18)
   └─> doc.setFontSize(12)
   └─> doc.text(title, 35, 25)  // "Veículos em Atividade"
   └─> doc.setFontSize(10)
   └─> doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 14, 35)

5. MONTA DADOS DA TABELA
   └─> const tableData = vehicles.map((v) => [
       v.placa,
       v.marca,
       v.modelo,
       v.ano_fabricacao,
       statusLabels[v.status],
       v.lotacao_atual,
       v.departamento || '-'
   ])

6. ADICIONA TABELA AO PDF
   └─> doc.autoTable({
       startY: 40,
       head: [['Placa', 'Marca', 'Modelo', 'Ano', 'Status', 'Lotação', 'Sublotação/Depto']],
       body: tableData,
       theme: 'grid',
       headStyles: { fillColor: [30, 58, 138] },  // Azul governo
       margin: { top: 40 },
       styles: { fontSize: 8 }
   })

7. SALVA PDF
   └─> doc.save(`${title.toLowerCase().replace(/\s+/g, '-')}.pdf`)
   └─> Exemplo: "veiculos-em-atividade.pdf"

8. NAVEGADOR BAIXA ARQUIVO
   └─> Download inicia automaticamente
   └─> Arquivo salvo na pasta Downloads
```

**Fallback (se logo não carregar):**
```javascript
img.onerror = () => {
  // Gera PDF sem logo
  // Mesmo código mas sem doc.addImage()
}
```

**Estrutura do PDF Gerado:**
```
┌────────────────────────────────────────┐
│ [Logo]  Frota de Veículos PMTF         │
│         Veículos em Atividade          │
│         Data: 05/04/2026               │
├────────────────────────────────────────┤
│ Tabela:                                │
│ Placa | Marca | Modelo | ... | Depto  │
│ ABC   | Ford  | Ranger | ... | Transp │
│ DEF   | Fiat  | Toro   | ... | Manutenção│
│ ...                                    │
└────────────────────────────────────────┘
```

---

### 12.7 Fluxo de Logout

```
1. USUÁRIO CLICA "SAIR"
   └─> Botão na sidebar (DashboardLayout)
   └─> onClick={handleLogout}

2. FUNÇÃO LOGOUT
   └─> const handleLogout = async () => {
       await logout();  // AuthContext
       navigate('/login');
   }

3. AUTHCONTEXT.LOGOUT
   └─> axios.post(
       BACKEND_URL + '/api/auth/logout',
       {},
       {withCredentials: true}
   )

4. BACKEND PROCESSA
   └─> Rota: POST /api/auth/logout
   └─> Dependency: get_current_user (verifica autenticação)
   └─> response.delete_cookie(key="access_token", path="/")
   └─> response.delete_cookie(key="refresh_token", path="/")
   └─> return {"message": "Logout realizado com sucesso"}

5. FRONTEND RECEBE RESPOSTA
   └─> Cookies deletados do navegador
   └─> setUser(false) - AuthContext atualiza estado

6. NAVEGAÇÃO PARA LOGIN
   └─> navigate('/login')
   └─> Rota muda para /login
   └─> Login.js renderiza

7. TENTATIVA DE ACESSAR ROTA PROTEGIDA
   └─> Se usuário tentar acessar /dashboard diretamente
   └─> ProtectedRoute verifica: user === false
   └─> Redirect para /login
```

Continuando a documentação técnica completa:

---

## 13. ESTADO DA APLICAÇÃO

### 13.1 Gerenciamento de Estado - Visão Geral

**Arquitetura de Estado:**
```
┌─────────────────────────────────────────────────────┐
│ ESTADO GLOBAL (React Context API)                   │
├─────────────────────────────────────────────────────┤
│ AuthContext:                                         │
│ - user: null | false | UserObject                   │
│ - loading: boolean                                   │
│ - login(), logout(), register(), checkAuth()        │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ ESTADO LOCAL (useState em cada componente)          │
├─────────────────────────────────────────────────────┤
│ Login:                                               │
│ - email, password, error, loading                   │
│                                                      │
│ CadastrarVeiculo:                                    │
│ - formData, loading                                  │
│                                                      │
│ VehicleList:                                         │
│ - vehicles, loading, editingVehicle,                │
│   editDialogOpen, historyDialogOpen,                │
│   selectedVehicleHistory, selectedVehicle,          │
│   searchPlaca, searchMarca                          │
│                                                      │
│ Usuarios:                                            │
│ - users, loading, dialogOpen, formData              │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ ESTADO DERIVADO (computed values)                   │
├─────────────────────────────────────────────────────┤
│ - isAdmin = user?.role === "ADMIN"                  │
│ - filteredMenuItems = menuItems.filter(...)         │
│ - tableData = vehicles.map(...)                     │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ ESTADO NA URL (React Router)                        │
├─────────────────────────────────────────────────────┤
│ - Rota atual: /dashboard/veiculos-atividade         │
│ - Path params: vehicle_id em edição                 │
│ - Query params: NÃO USADO (deveria usar para filtros)│
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ ESTADO NO SERVIDOR (Backend)                        │
├─────────────────────────────────────────────────────┤
│ - MongoDB (fonte da verdade)                        │
│ - Cookies httpOnly (tokens JWT)                     │
└─────────────────────────────────────────────────────┘
```

---

### 13.2 Estado Global - AuthContext

**Localização:** Estado centralizado para autenticação

**Provider:**
```javascript
<AuthProvider>
  <BrowserRouter>
    <Routes>...</Routes>
  </BrowserRouter>
</AuthProvider>
```

**Estado Gerenciado:**
```javascript
const [user, setUser] = useState(null);     // null = checking, false = logged out, object = logged in
const [loading, setLoading] = useState(true); // true = checking auth
```

**Ciclo de Vida do Estado `user`:**
```
1. INITIAL STATE (app carrega)
   user = null, loading = true
   └─> ProtectedRoute mostra spinner

2. CHECKING AUTH (useEffect executa)
   checkAuth() chamado
   └─> GET /api/auth/me
   
3a. SE AUTENTICADO
    user = {id, email, name, role}, loading = false
    └─> ProtectedRoute renderiza conteúdo
    
3b. SE NÃO AUTENTICADO
    user = false, loading = false
    └─> ProtectedRoute redireciona /login

4. APÓS LOGIN
   login() chamado
   └─> POST /api/auth/login
   └─> user = response.data, loading = false
   
5. APÓS LOGOUT
   logout() chamado
   └─> POST /api/auth/logout
   └─> user = false
```

**Métodos Expostos:**
```javascript
{
  user,        // Estado
  loading,     // Estado
  login,       // async (email, password) => Promise<UserData>
  register,    // async (email, password, name, role) => Promise<UserData>
  logout,      // async () => Promise<void>
  checkAuth    // async () => Promise<void>
}
```

**Consumo:**
```javascript
const { user, loading, login, logout } = useAuth();

// Verificar se admin
const isAdmin = user?.role === 'ADMIN';

// Exibir nome
{user && <p>Olá, {user.name}</p>}
```

---

### 13.3 Estado Local - Componentes

**13.3.1 Login.js**
```javascript
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [error, setError] = useState('');
const [loading, setLoading] = useState(false);
```
- **Sincronizado com:** Inputs do formulário
- **Resetado quando:** Nunca (componente desmonta após login)
- **Persistido:** Não

---

**13.3.2 CadastrarVeiculo.js**
```javascript
const [loading, setLoading] = useState(false);
const [formData, setFormData] = useState({
  placa: '', marca: '', modelo: '', ano_fabricacao: '',
  chassi: '', status: 'EM_ATIVIDADE', lotacao_atual: '', departamento: ''
});
```
- **Sincronizado com:** Inputs do formulário
- **Resetado quando:** Nunca (usuário redirecionado após sucesso)
- **Validado:** HTML5 validation (required, type="number")
- **Persistido:** Não (dados perdidos ao sair da página)

**Melhoria Recomendada:**
```javascript
// Salvar draft no localStorage
useEffect(() => {
  localStorage.setItem('vehicleDraft', JSON.stringify(formData));
}, [formData]);

// Restaurar ao montar
useEffect(() => {
  const draft = localStorage.getItem('vehicleDraft');
  if (draft) {
    setFormData(JSON.parse(draft));
  }
}, []);
```

---

**13.3.3 VehicleList.js (Componente Mais Complexo)**

**Estados:**
```javascript
const [vehicles, setVehicles] = useState([]);                    // Lista de veículos
const [loading, setLoading] = useState(true);                    // Loading inicial
const [editingVehicle, setEditingVehicle] = useState(null);     // Veículo sendo editado
const [editDialogOpen, setEditDialogOpen] = useState(false);    // Modal edição aberto?
const [historyDialogOpen, setHistoryDialogOpen] = useState(false); // Modal histórico aberto?
const [selectedVehicleHistory, setSelectedVehicleHistory] = useState([]); // Histórico do veículo
const [selectedVehicle, setSelectedVehicle] = useState(null);   // Veículo do histórico
const [searchPlaca, setSearchPlaca] = useState('');             // Filtro placa
const [searchMarca, setSearchMarca] = useState('');             // Filtro marca
```

**Dependências entre Estados:**
```
searchPlaca/searchMarca (user input)
          ↓
    useEffect dispara
          ↓
    fetchVehicles()
          ↓
    setVehicles(data)
          ↓
    Tabela re-renderiza
```

**Estado Derivado:**
```javascript
const printRef = useRef(); // Não é estado, mas ref para impressão
const isAdmin = user?.role === 'ADMIN'; // Derivado de AuthContext
```

**Fluxo de Edição:**
```
1. handleEdit(vehicle)
   └─> setEditingVehicle({...vehicle})  // Cópia
   └─> setEditDialogOpen(true)

2. Usuário edita campos
   └─> setEditingVehicle({...editingVehicle, [campo]: valor})

3. handleUpdateVehicle()
   └─> PUT /api/vehicles
   └─> setEditDialogOpen(false)
   └─> fetchVehicles() // Re-busca lista
```

**Invalidação de Cache:**
- Após criar: redirect para listagem (auto-fetch)
- Após editar: `fetchVehicles()` chamado manualmente
- Após deletar: `fetchVehicles()` chamado manualmente
- **Estratégia:** Re-fetch completo (sem optimistic update)

---

### 13.4 Estado na URL

**Atual:** Apenas rota, sem query params ou state

**Rotas:**
- `/login`
- `/dashboard`
- `/dashboard/cadastrar-veiculo`
- `/dashboard/veiculos-atividade`
- `/dashboard/veiculos-manutencao`
- `/dashboard/veiculos-inativos`
- `/dashboard/usuarios`

**Não Usado:**
- Query params para filtros (deveria usar)
- Path params para edição (usa modal)
- State no navigate (React Router location.state)

**Melhoria Recomendada:**
```javascript
// Filtros na URL
const [searchParams, setSearchParams] = useSearchParams();

// Ler filtros da URL
const placa = searchParams.get('placa') || '';
const marca = searchParams.get('marca') || '';

// Atualizar URL quando filtros mudam
useEffect(() => {
  const params = {};
  if (placa) params.placa = placa;
  if (marca) params.marca = marca;
  setSearchParams(params);
}, [placa, marca]);

// Benefício: URLs compartilháveis
// https://frota.pmtf.gov.br/dashboard/veiculos-atividade?placa=ABC
```

---

### 13.5 Sincronização com Backend

**Estratégia:** Fetch on Demand + Manual Re-fetch

**Não Há:**
- Polling (re-buscar a cada X segundos)
- WebSockets (updates em tempo real)
- Server-Sent Events
- Cache local (Service Worker, IndexedDB)
- Optimistic updates

**Há:**
- Fetch ao montar componente (`useEffect`)
- Re-fetch após mutações (create, update, delete)
- Re-fetch ao mudar filtros

**Exemplo de Re-fetch Manual:**
```javascript
// Após deletar
const handleDelete = async (vehicleId) => {
  await axios.delete(`/api/vehicles/${vehicleId}`);
  fetchVehicles(); // Re-busca lista completa
};
```

**Problema:**
- Se outro usuário criar/editar veículo, não atualiza automaticamente
- Usuário precisa dar refresh manual na página

**Solução Recomendada:**
```javascript
// Polling simples (a cada 30s)
useEffect(() => {
  const interval = setInterval(() => {
    fetchVehicles();
  }, 30000);
  return () => clearInterval(interval);
}, []);

// Ou WebSocket para updates em tempo real
```

---

### 13.6 Persistência

**Persistido no Backend (MongoDB):**
- users
- vehicles
- location_history

**Persistido no Browser (Cookies):**
- access_token (15min)
- refresh_token (7 dias)

**Não Persistido (perdido ao reload):**
- Estado de formulários
- Filtros de busca
- Estado de modais (aberto/fechado)
- Posição de scroll

**Persistência Recomendada:**
```javascript
// sessionStorage para filtros (perdido ao fechar tab)
useEffect(() => {
  sessionStorage.setItem('vehicleFilters', JSON.stringify({placa, marca}));
}, [placa, marca]);

// Restaurar ao montar
useEffect(() => {
  const saved = sessionStorage.getItem('vehicleFilters');
  if (saved) {
    const {placa, marca} = JSON.parse(saved);
    setSearchPlaca(placa || '');
    setSearchMarca(marca || '');
  }
}, []);
```

---

### 13.7 Migração de Estado para Fora do Emergent

**Totalmente Portável:**
- AuthContext usa apenas React nativo
- useState/useEffect padrão
- Axios configurável (apenas URL muda)

**Passos de Migração:**
1. ✅ Copiar `src/contexts/AuthContext.js`
2. ✅ Atualizar `REACT_APP_BACKEND_URL` no .env
3. ✅ Manter estrutura de components
4. ✅ Nenhuma mudança de código necessária

**Opcional - Migrar para Biblioteca de Estado:**

**Zustand (recomendado para simplicidade):**
```javascript
// store/authStore.js
import create from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  loading: true,
  login: async (email, password) => {
    const { data } = await axios.post('/api/auth/login', {email, password});
    set({ user: data });
  },
  logout: async () => {
    await axios.post('/api/auth/logout');
    set({ user: false });
  },
  checkAuth: async () => {
    try {
      const { data } = await axios.get('/api/auth/me');
      set({ user: data, loading: false });
    } catch {
      set({ user: false, loading: false });
    }
  }
}));

// Uso
const { user, login, logout } = useAuthStore();
```

**React Query (recomendado para cache):**
```javascript
// hooks/useAuth.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useAuth = () => {
  const queryClient = useQueryClient();
  
  const { data: user, isLoading } = useQuery({
    queryKey: ['auth'],
    queryFn: async () => {
      const { data } = await axios.get('/api/auth/me');
      return data;
    },
    retry: false
  });
  
  const loginMutation = useMutation({
    mutationFn: async ({email, password}) => {
      const { data } = await axios.post('/api/auth/login', {email, password});
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['auth'], data);
    }
  });
  
  return { user, isLoading, login: loginMutation.mutate };
};
```

---

## 14. CONTRATOS DE DADOS

### 14.1 Tipos/Interfaces - Backend (Pydantic Models)

**14.1.1 User Models**

**UserRegister (Input):**
```python
{
  "email": "user@example.com",      # EmailStr - validado
  "password": "senha123",            # str - min length não validado
  "name": "Nome Completo",           # str
  "role": "PADRÃO"                   # str - default "PADRÃO"
}
```

**UserLogin (Input):**
```python
{
  "email": "user@example.com",      # EmailStr
  "password": "senha123"             # str
}
```

**UserResponse (Output):**
```python
{
  "id": "507f1f77bcf86cd799439011", # str (ObjectId convertido)
  "email": "user@example.com",       # str
  "name": "Nome Completo",           # str
  "role": "ADMIN",                   # str - "ADMIN" | "PADRÃO"
  "created_at": "2026-04-05T23:00:00.000000+00:00"  # str ISO 8601
}
```

---

**14.1.2 Vehicle Models**

**VehicleCreate (Input):**
```python
{
  "placa": "ABC-1234",               # str
  "marca": "Toyota",                 # str
  "modelo": "Hilux",                 # str
  "ano_fabricacao": 2020,            # int
  "chassi": "9BWZZZ377VT004251",    # str
  "status": "EM_ATIVIDADE",          # str - default "EM_ATIVIDADE"
  "lotacao_atual": "Secretaria de Saúde",  # str
  "departamento": "Departamento de Vigilância"  # str
}
```

**VehicleUpdate (Input):**
```python
{
  "placa": "ABC-1234",               # Optional[str]
  "marca": "Toyota",                 # Optional[str]
  "modelo": "Hilux",                 # Optional[str]
  "ano_fabricacao": 2020,            # Optional[int]
  "chassi": "9BWZZZ377VT004251",    # Optional[str]
  "status": "EM_MANUTENCAO",         # Optional[str]
  "lotacao_atual": "Oficina",        # Optional[str]
  "departamento": "Manutenção"       # Optional[str]
}
# Todos campos opcionais - permite atualização parcial
```

**VehicleResponse (Output):**
```python
{
  "id": "507f1f77bcf86cd799439011",
  "placa": "ABC-1234",
  "marca": "Toyota",
  "modelo": "Hilux",
  "ano_fabricacao": 2020,
  "chassi": "9BWZZZ377VT004251",
  "status": "EM_ATIVIDADE",
  "lotacao_atual": "Secretaria de Saúde",
  "departamento": "Departamento de Vigilância",
  "created_at": "2026-04-05T23:00:00.000000+00:00",
  "updated_at": "2026-04-05T23:00:00.000000+00:00"
}
```

---

**14.1.3 Location History Models**

**LocationHistoryResponse (Output):**
```python
{
  "id": "507f1f77bcf86cd799439012",
  "vehicle_id": "507f1f77bcf86cd799439011",
  "local": "Secretaria de Saúde",
  "departamento": "Departamento de Vigilância",
  "data_inicio": "2026-04-05T23:00:00.000000+00:00",
  "data_fim": null  # null = lotação atual, string = lotação passada
}
```

---

### 14.2 Enums e Constantes

**Status de Veículo (não enforçado, apenas convenção):**
```python
VEHICLE_STATUS = {
  "EM_ATIVIDADE": "Em Atividade",
  "EM_MANUTENCAO": "Em Manutenção",
  "INATIVO": "Inativo"
}
```

**Roles de Usuário (não enforçado):**
```python
USER_ROLES = {
  "ADMIN": "Administrador",
  "PADRÃO": "Usuário Padrão"
}
```

**Melhoria Recomendada (usar Enum):**
```python
from enum import Enum

class VehicleStatus(str, Enum):
    EM_ATIVIDADE = "EM_ATIVIDADE"
    EM_MANUTENCAO = "EM_MANUTENCAO"
    INATIVO = "INATIVO"

class UserRole(str, Enum):
    ADMIN = "ADMIN"
    PADRAO = "PADRÃO"

# Uso em Pydantic
class VehicleCreate(BaseModel):
    status: VehicleStatus = VehicleStatus.EM_ATIVIDADE
    # Valida automaticamente, só aceita valores do enum
```

---

### 14.3 Exemplos Reais de Request/Response

**14.3.1 Login - POST /api/auth/login**

**Request:**
```http
POST /api/auth/login HTTP/1.1
Host: frota-veiculos.preview.emergentagent.com
Content-Type: application/json

{
  "email": "admin@pmtf.gov.br",
  "password": "admin123"
}
```

**Response (Success - 200):**
```http
HTTP/1.1 200 OK
Content-Type: application/json
Set-Cookie: access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Path=/; SameSite=lax; Max-Age=900
Set-Cookie: refresh_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Path=/; SameSite=lax; Max-Age=604800

{
  "id": "507f1f77bcf86cd799439011",
  "email": "admin@pmtf.gov.br",
  "name": "Administrador PMTF",
  "role": "ADMIN",
  "created_at": "2026-04-05T20:00:00.000000+00:00"
}
```

**Response (Error - 401):**
```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "detail": "Email ou senha incorretos"
}
```

**Response (Error - 422):**
```http
HTTP/1.1 422 Unprocessable Entity
Content-Type: application/json

{
  "detail": [
    {
      "type": "missing",
      "loc": ["body", "email"],
      "msg": "Field required",
      "input": {"password": "senha123"}
    }
  ]
}
```

---

**14.3.2 Criar Veículo - POST /api/vehicles**

**Request:**
```http
POST /api/vehicles HTTP/1.1
Host: frota-veiculos.preview.emergentagent.com
Content-Type: application/json
Cookie: access_token=eyJ...

{
  "placa": "MNO-7890",
  "marca": "Ford",
  "modelo": "Ranger",
  "ano_fabricacao": 2022,
  "chassi": "9BWZZZ377VT004255",
  "status": "EM_ATIVIDADE",
  "lotacao_atual": "Secretaria de Educação",
  "departamento": "Departamento de Transporte Escolar"
}
```

**Response (Success - 200):**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": "507f1f77bcf86cd799439015",
  "placa": "MNO-7890",
  "marca": "Ford",
  "modelo": "Ranger",
  "ano_fabricacao": 2022,
  "chassi": "9BWZZZ377VT004255",
  "status": "EM_ATIVIDADE",
  "lotacao_atual": "Secretaria de Educação",
  "departamento": "Departamento de Transporte Escolar",
  "created_at": "2026-04-05T23:35:15.123456+00:00",
  "updated_at": "2026-04-05T23:35:15.123456+00:00"
}
```

**Response (Error - 403 Forbidden - não é admin):**
```http
HTTP/1.1 403 Forbidden
Content-Type: application/json

{
  "detail": "Acesso negado. Apenas administradores."
}
```

---

**14.3.3 Listar Veículos com Filtros - GET /api/vehicles/em-atividade**

**Request:**
```http
GET /api/vehicles/em-atividade?placa=ABC&marca=ford HTTP/1.1
Host: frota-veiculos.preview.emergentagent.com
Cookie: access_token=eyJ...
```

**Response (Success - 200):**
```http
HTTP/1.1 200 OK
Content-Type: application/json

[
  {
    "id": "507f1f77bcf86cd799439011",
    "placa": "ABC-1234",
    "marca": "Ford",
    "modelo": "Ranger",
    "ano_fabricacao": 2020,
    "chassi": "9BWZZZ377VT004251",
    "status": "EM_ATIVIDADE",
    "lotacao_atual": "Secretaria de Saúde",
    "departamento": "Departamento de Vigilância Sanitária",
    "created_at": "2026-04-05T23:00:00.000000+00:00",
    "updated_at": "2026-04-05T23:00:00.000000+00:00"
  }
]
```

**Response (Empty - 200):**
```http
HTTP/1.1 200 OK
Content-Type: application/json

[]
```

---

**14.3.4 Histórico de Veículo - GET /api/vehicles/{id}/historico**

**Request:**
```http
GET /api/vehicles/507f1f77bcf86cd799439011/historico HTTP/1.1
Host: frota-veiculos.preview.emergentagent.com
Cookie: access_token=eyJ...
```

**Response (Success - 200):**
```http
HTTP/1.1 200 OK
Content-Type: application/json

[
  {
    "id": "507f1f77bcf86cd799439013",
    "vehicle_id": "507f1f77bcf86cd799439011",
    "local": "Secretaria de Saúde",
    "departamento": "Departamento de Vigilância Sanitária",
    "data_inicio": "2026-04-05T23:00:00.000000+00:00",
    "data_fim": null
  },
  {
    "id": "507f1f77bcf86cd799439012",
    "vehicle_id": "507f1f77bcf86cd799439011",
    "local": "Secretaria de Obras",
    "departamento": "Departamento de Infraestrutura",
    "data_inicio": "2026-01-15T10:00:00.000000+00:00",
    "data_fim": "2026-04-05T23:00:00.000000+00:00"
  }
]
```

---

### 14.4 Convenções de Nomenclatura

**Backend (Python):**
- **snake_case:** Variáveis, funções, campos (`user_id`, `created_at`)
- **PascalCase:** Classes, Modelos Pydantic (`UserRegister`, `VehicleCreate`)
- **UPPER_CASE:** Constantes (`JWT_SECRET`, `JWT_ALGORITHM`)

**Frontend (JavaScript):**
- **camelCase:** Variáveis, funções, props (`formData`, `handleSubmit`)
- **PascalCase:** Componentes React (`Login`, `VehicleList`)
- **UPPER_SNAKE_CASE:** Constantes (`BACKEND_URL`)

**MongoDB:**
- **snake_case:** Campos de documento (`password_hash`, `data_inicio`)
- **_id:** Sempre `_id` (convenção MongoDB)

**HTTP:**
- **kebab-case:** URLs (`/veiculos-atividade`)
- **snake_case:** Query params (`?placa=ABC&marca=ford`)
- **snake_case:** JSON keys no response (backend Python)

---

### 14.5 TypeScript Definitions (Recomendado para Migração)

**Arquivo:** `src/types/index.ts`

```typescript
// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'PADRÃO';
  created_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  role?: 'ADMIN' | 'PADRÃO';
}

// Vehicle Types
export type VehicleStatus = 'EM_ATIVIDADE' | 'EM_MANUTENCAO' | 'INATIVO';

export interface Vehicle {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  ano_fabricacao: number;
  chassi: string;
  status: VehicleStatus;
  lotacao_atual: string;
  departamento: string;
  created_at: string;
  updated_at: string;
}

export interface VehicleCreate {
  placa: string;
  marca: string;
  modelo: string;
  ano_fabricacao: number;
  chassi: string;
  status?: VehicleStatus;
  lotacao_atual: string;
  departamento: string;
}

export interface VehicleUpdate extends Partial<VehicleCreate> {}

// Location History Types
export interface LocationHistory {
  id: string;
  vehicle_id: string;
  local: string;
  departamento: string;
  data_inicio: string;
  data_fim: string | null;
}

// Auth Context Types
export interface AuthContextType {
  user: User | false | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, name: string, role?: string) => Promise<User>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

// API Response Types
export interface ApiError {
  detail: string | object[];
}
```

**Uso:**
```typescript
import { User, Vehicle, AuthContextType } from './types';

const [user, setUser] = useState<User | false | null>(null);
const [vehicles, setVehicles] = useState<Vehicle[]>([]);
```

---

## 15. VALIDAÇÕES E TRATAMENTO DE ERRO

### 15.1 Validações de Formulário (Frontend)

**Estratégia Atual:** HTML5 validation nativa

**Validações Implementadas:**

**Login:**
```javascript
<Input
  type="email"    // Valida formato de email
  required        // Campo obrigatório
/>
<Input
  type="password" // Mascara input
  required        // Campo obrigatório
/>
```

**Cadastro de Veículo:**
```javascript
<Input name="placa" required />
<Input name="marca" required />
<Input name="modelo" required />
<Input name="ano_fabricacao" type="number" required />
<Input name="chassi" required />
<Input name="lotacao_atual" required />
<Input name="departamento" required />
```

**Limitações:**
- Sem validação de formato de placa (deveria ser AAA-1234)
- Sem validação de range de ano (aceita 0, 9999)
- Sem validação de tamanho mínimo/máximo
- Mensagens de erro nativas do browser (não customizáveis)

---

**Validação Recomendada (React Hook Form + Zod):**

**Instalação:**
```bash
yarn add react-hook-form @hookform/resolvers zod
```

**Schema Zod:**
```typescript
import { z } from 'zod';

const vehicleSchema = z.object({
  placa: z.string()
    .regex(/^[A-Z]{3}-\d{4}$/, 'Formato inválido. Use AAA-1234'),
  marca: z.string().min(2, 'Mínimo 2 caracteres'),
  modelo: z.string().min(2, 'Mínimo 2 caracteres'),
  ano_fabricacao: z.number()
    .int()
    .min(1900, 'Ano inválido')
    .max(new Date().getFullYear() + 1, 'Ano futuro inválido'),
  chassi: z.string()
    .length(17, 'Chassi deve ter 17 caracteres'),
  status: z.enum(['EM_ATIVIDADE', 'EM_MANUTENCAO', 'INATIVO']),
  lotacao_atual: z.string().min(3, 'Mínimo 3 caracteres'),
  departamento: z.string().min(3, 'Mínimo 3 caracteres')
});
```

**Uso:**
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(vehicleSchema)
});

const onSubmit = async (data) => {
  // data já validado
  await axios.post('/api/vehicles', data);
};

// No JSX
<form onSubmit={handleSubmit(onSubmit)}>
  <Input {...register('placa')} />
  {errors.placa && <span className="text-red-500">{errors.placa.message}</span>}
</form>
```

---

### 15.2 Validações de API (Backend)

**Estratégia:** Pydantic automático

**Validações Aplicadas:**

**EmailStr:**
```python
email: EmailStr
# Valida formato de email automaticamente
# Requer biblioteca email-validator
```

**Tipos:**
```python
ano_fabricacao: int  # Valida que é inteiro
placa: str           # Valida que é string
```

**Campos Obrigatórios:**
```python
class VehicleCreate(BaseModel):
    placa: str  # Obrigatório (sem Optional)
    marca: str  # Obrigatório
```

**Valores Default:**
```python
role: str = "PADRÃO"  # Se não fornecido, usa default
status: str = "EM_ATIVIDADE"
```

**Limitações:**
- Sem validação de range (ano, tamanho de string)
- Sem validação de formato (placa, chassi)
- Sem validação de enum (status, role aceita qualquer string)

---

**Validação Aprimorada (Pydantic v2):**

```python
from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Literal
from datetime import datetime

class VehicleCreate(BaseModel):
    placa: str = Field(
        ...,
        pattern=r'^[A-Z]{3}-\d{4}$',
        description="Formato: AAA-1234"
    )
    marca: str = Field(..., min_length=2, max_length=50)
    modelo: str = Field(..., min_length=2, max_length=50)
    ano_fabricacao: int = Field(..., ge=1900, le=datetime.now().year + 1)
    chassi: str = Field(..., min_length=17, max_length=17)
    status: Literal['EM_ATIVIDADE', 'EM_MANUTENCAO', 'INATIVO'] = 'EM_ATIVIDADE'
    lotacao_atual: str = Field(..., min_length=3, max_length=200)
    departamento: str = Field(..., min_length=3, max_length=200)
    
    @field_validator('placa')
    @classmethod
    def placa_uppercase(cls, v: str) -> str:
        return v.upper()
    
    @field_validator('chassi')
    @classmethod
    def chassi_alphanumeric(cls, v: str) -> str:
        if not v.isalnum():
            raise ValueError('Chassi deve ser alfanumérico')
        return v.upper()
```

---

### 15.3 Mensagens de Erro

**Frontend - Formato:**
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

**Casos Tratados:**
1. `detail` é string: retorna direto
2. `detail` é array (Pydantic validation errors): junta mensagens
3. `detail` é objeto com `.msg`: retorna `.msg`
4. `detail` é null/undefined: mensagem genérica
5. Outro: converte para string

**Exibição:**
```javascript
// Toast (notificações)
toast.error('Veículo não encontrado');
toast.success('Veículo cadastrado com sucesso!');

// Inline (formulário de login)
{error && (
  <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md">
    {error}
  </div>
)}
```

---

**Backend - Mensagens:**

**Erros de Negócio (HTTPException):**
```python
raise HTTPException(status_code=404, detail="Veículo não encontrado")
raise HTTPException(status_code=400, detail="Email já cadastrado")
raise HTTPException(status_code=401, detail="Email ou senha incorretos")
raise HTTPException(status_code=403, detail="Acesso negado. Apenas administradores.")
```

**Erros de Validação (Pydantic):**
```json
{
  "detail": [
    {
      "type": "missing",
      "loc": ["body", "email"],
      "msg": "Field required",
      "input": {...}
    }
  ]
}
```

**Mensagens em Português:**
- Todas mensagens de HTTPException em português
- Mensagens Pydantic em inglês (padrão da biblioteca)
- **Melhoria:** Customizar mensagens Pydantic para português

---

### 15.4 Estratégias de Recuperação de Erro

**Erros de Rede (Frontend):**
```javascript
try {
  await axios.post(...);
} catch (error) {
  if (error.code === 'ECONNABORTED') {
    // Timeout
    toast.error('Tempo esgotado. Tente novamente.');
  } else if (!error.response) {
    // Sem conexão
    toast.error('Sem conexão com servidor. Verifique sua internet.');
  } else {
    // Erro HTTP
    toast.error(formatApiErrorDetail(error.response?.data?.detail));
  }
}
```

**Token Expirado:**
```javascript
// Situação atual: Usuário precisa fazer login novamente
// Melhoria: Implementar refresh token automático

axios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401 && error.config && !error.config.__isRetryRequest) {
      error.config.__isRetryRequest = true;
      try {
        await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        return axios(error.config);
      } catch {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

**Erros de Validação:**
```javascript
// Situação atual: Toast genérico
// Melhoria: Mostrar erros campo a campo

if (error.response?.status === 422) {
  const validationErrors = error.response.data.detail;
  validationErrors.forEach(err => {
    const field = err.loc[err.loc.length - 1];
    toast.error(`${field}: ${err.msg}`);
  });
}
```

---

**Retry Automático (Recomendado):**
```javascript
import axios from 'axios';
import axiosRetry from 'axios-retry';

axiosRetry(axios, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    // Retry em erros de rede ou 5xx
    return axiosRetry.isNetworkError(error) || 
           (error.response?.status >= 500 && error.response?.status < 600);
  }
});
```

---

### 15.5 Logging de Erros

**Frontend (Recomendado):**
```javascript
// Sentry ou similar
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  integrations: [new BrowserTracing()],
  tracesSampleRate: 1.0,
});

// Captura automática de erros não tratados
// Ou manual:
try {
  riskyOperation();
} catch (error) {
  Sentry.captureException(error);
  toast.error('Erro inesperado. Nossa equipe foi notificada.');
}
```

**Backend:**
```python
import logging

logger = logging.getLogger(__name__)

try:
    risky_operation()
except Exception as e:
    logger.error(f"Erro ao processar: {str(e)}", exc_info=True)
    raise HTTPException(status_code=500, detail="Erro interno")
```

---

## 16. RESPONSIVIDADE, UX E COMPORTAMENTO VISUAL

### 16.1 Breakpoints

**Tailwind Padrão:**
```javascript
{
  'sm': '640px',   // @media (min-width: 640px)
  'md': '768px',   // @media (min-width: 768px)
  'lg': '1024px',  // @media (min-width: 1024px)
  'xl': '1280px',  // @media (min-width: 1280px)
  '2xl': '1536px'  // @media (min-width: 1536px)
}
```

**Estratégia:** Mobile-first

**Aplicação:**
```
Mobile (<640px):     Base styles (sem prefixo)
Tablet (640-1023px): sm: e md: prefixes
Desktop (1024px+):   lg:, xl:, 2xl: prefixes
```

---

### 16.2 Comportamento por Dispositivo

**16.2.1 Sidebar (DashboardLayout)**

**Mobile (<lg):**
```javascript
className="fixed lg:static inset-y-0 left-0 z-50 w-64
           transform -translate-x-full lg:translate-x-0
           transition-transform duration-200"
```
- Posição fixa, fora da tela (translate-x-full)
- Overlay escuro ao abrir
- Menu hamburger no header
- Fecha ao clicar em link ou overlay

**Desktop (>=lg):**
- Posição static (fluxo normal)
- Sempre visível
- Sem overlay
- Sem botão hamburger

---

**16.2.2 Tabelas**

**Mobile:**
```javascript
<div className="overflow-x-auto">
  <Table>...</Table>
</div>
```
- Scroll horizontal
- Larguras de coluna fixas ou min-width
- Todas colunas visíveis (não esconde)

**Melhoria Recomendada - Cards em Mobile:**
```javascript
// Versão responsiva melhor
const isMobile = useMediaQuery('(max-width: 768px)');

{isMobile ? (
  // Cards
  <div className="space-y-4">
    {vehicles.map(v => (
      <div key={v.id} className="bg-card p-4 rounded border">
        <h3 className="font-bold">{v.placa}</h3>
        <p>{v.marca} {v.modelo}</p>
        <Badge>{v.status}</Badge>
      </div>
    ))}
  </div>
) : (
  // Tabela
  <Table>...</Table>
)}
```

---

**16.2.3 Formulários**

**Mobile:**
```javascript
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <Input /> {/* Full width em mobile */}
  <Input /> {/* Full width em mobile */}
</div>
```
- 1 coluna
- Inputs full-width
- Botões full-width

**Tablet/Desktop:**
- 2 colunas
- Inputs com largura fixa
- Botões inline

---

**16.2.4 Modal/Dialog**

**Mobile:**
```javascript
<DialogContent className="max-w-[95vw] md:max-w-3xl">
  {/* Conteúdo */}
</DialogContent>
```
- 95% da largura da tela
- Padding reduzido
- Scroll vertical se necessário

**Desktop:**
- Largura fixa (max-w-3xl = 768px)
- Centralizado
- Padding normal

---

### 16.3 Estados Visuais

**16.3.1 Loading States**

**Spinner Global (ProtectedRoute):**
```javascript
<div className="flex items-center justify-center min-h-screen">
  <div className="text-center">
    <div className="inline-block h-12 w-12 animate-spin rounded-full 
                    border-4 border-solid border-primary border-r-transparent"></div>
    <p className="mt-4 text-muted-foreground">Carregando...</p>
  </div>
</div>
```

**Spinner em Lista (VehicleList):**
```javascript
{loading ? (
  <div className="flex justify-center min-h-[400px] items-center">
    <Spinner />
  </div>
) : (
  <Table>...</Table>
)}
```

**Botão Loading:**
```javascript
<Button disabled={loading}>
  {loading ? 'Entrando...' : 'Entrar'}
</Button>
```

---

**16.3.2 Empty States**

**Lista Vazia:**
```javascript
{vehicles.length === 0 ? (
  <TableRow>
    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
      Nenhum veículo encontrado
    </TableCell>
  </TableRow>
) : (
  vehicles.map(...)
)}
```

**Melhoria Recomendada:**
```javascript
{vehicles.length === 0 && (
  <div className="text-center py-12">
    <Car className="mx-auto h-12 w-12 text-muted-foreground" />
    <h3 className="mt-4 text-lg font-medium">Nenhum veículo encontrado</h3>
    <p className="mt-2 text-sm text-muted-foreground">
      {searchPlaca || searchMarca 
        ? 'Tente ajustar os filtros de busca'
        : 'Cadastre o primeiro veículo para começar'}
    </p>
    {isAdmin && !searchPlaca && !searchMarca && (
      <Button onClick={() => navigate('/dashboard/cadastrar-veiculo')} className="mt-4">
        Cadastrar Veículo
      </Button>
    )}
  </div>
)}
```

---

**16.3.3 Toasts (Notificações)**

**Biblioteca:** Sonner

**Posicionamento:** top-right

**Tipos:**
```javascript
import { toast } from 'sonner';

toast.success('Veículo cadastrado com sucesso!');
toast.error('Erro ao carregar veículos');
toast.info('Informação importante');
toast.warning('Atenção: dados não salvos');
```

**Características:**
- Auto-dismiss após 4s (padrão Sonner)
- Empilhamento vertical
- Animação de entrada/saída
- Cores automáticas por tipo (richColors prop)

---

**16.3.4 Confirmações**

**Deletar (window.confirm nativo):**
```javascript
if (!window.confirm('Tem certeza que deseja deletar este veículo?')) return;
```

**Melhoria Recomendada (Alert Dialog):**
```javascript
import { AlertDialog, AlertDialogAction, AlertDialogCancel, 
         AlertDialogContent, AlertDialogDescription, 
         AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } 
from './ui/alert-dialog';

const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
const [vehicleToDelete, setVehicleToDelete] = useState(null);

<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
      <AlertDialogDescription>
        Tem certeza que deseja deletar o veículo {vehicleToDelete?.placa}? 
        Esta ação não pode ser desfeita.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancelar</AlertDialogCancel>
      <AlertDialogAction onClick={() => confirmDelete()}>
        Deletar
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

### 16.4 Micro-interações

**Hover States:**
```javascript
// Cards do dashboard
className="hover:shadow-md hover:-translate-y-1 transition-all duration-200"

// Botões
className="hover:bg-primary/90 transition-colors"

// Nav items
className="hover:bg-primary-foreground/10 transition-all"
```

**Active States:**
```javascript
// NavLink ativo
className={({ isActive }) =>
  isActive 
    ? 'bg-primary-foreground text-primary font-medium'
    : 'text-primary-foreground/90'
}
```

**Focus States:**
```javascript
// Inputs (via Shadcn/UI)
className="focus:ring-2 focus:ring-primary focus:ring-offset-2"
```

**Disabled States:**
```javascript
<Button disabled={loading}>
  {/* Automaticamente: opacity reduzida, cursor not-allowed */}
</Button>
```

---

### 16.5 Acessibilidade

**Boas Práticas Implementadas:**

1. **Semantic HTML:**
```javascript
<header>, <nav>, <main>, <aside>, <footer>
<h1>, <h2>, <h3> (hierarquia correta)
<button>, <a>, <input>, <label>
```

2. **Labels para Inputs:**
```javascript
<Label htmlFor="email">Email</Label>
<Input id="email" />
```

3. **ARIA via Shadcn/UI:**
```javascript
// Dialog
role="dialog"
aria-labelledby="dialog-title"
aria-describedby="dialog-description"

// Button
aria-label="Fechar menu"
aria-expanded={sidebarOpen}
```

4. **data-testid:**
```javascript
data-testid="login-submit-button"
data-testid="vehicle-row-ABC-1234"
```

5. **Focus Trap em Modais:**
- Shadcn Dialog implementa automaticamente
- Tab navega apenas dentro do modal
- Esc fecha modal

---

**Melhorias Necessárias:**

1. **Skip Navigation:**
```javascript
<a href="#main-content" className="sr-only focus:not-sr-only">
  Pular para conteúdo principal
</a>
<main id="main-content">...</main>
```

2. **Live Regions para Toasts:**
```javascript
<div role="status" aria-live="polite" aria-atomic="true">
  {/* Toast messages */}
</div>
```

3. **Announce Filter Results:**
```javascript
<div role="status" aria-live="polite" className="sr-only">
  {vehicles.length} veículos encontrados
</div>
```

4. **Keyboard Shortcuts:**
```javascript
useEffect(() => {
  const handleKeyPress = (e) => {
    if (e.ctrlKey && e.key === 'k') {
      // Abrir busca
      searchInputRef.current?.focus();
    }
  };
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
```


Action: Olá! Revisando o progresso do projeto, vejo que:

**Situação atual:**
- O sistema FROTA DE VEÍCULOS PMTF está 100% funcional (autenticação, CRUD de veículos, filtros, exportação PDF, histórico de lotação)
- A documentação técnica está em andamento — Seções 1 a 16 já foram entregues

**Próximo passo imediato:**
🔴 Completar a documentação técnica — Seções **17 (Segurança)**, **18 (Deploy e Infraestrutura)**, **19 (Passo a passo de migração)**, **20 (Código e trechos concretos)** e **21 (Checklist final para reconstrução)**

**Tarefas futuras (backlog):**
- 🟡 P1: Validação de placa (formato AAA-1234) e prevenção de duplicatas
- 🟡 P1: Rate limiting/proteção contra brute-force no login
- 🟢 P2: Implementar soft delete para veículos e usuários
- 🟢 P2: Refatoração do `server.py` em módulos separados

Confirma que devo continuar gerando as seções 17 a 21 da documentação? Ou prefere priorizar outra tarefa?
Observation: Question has been sent to the user. Waiting for response
