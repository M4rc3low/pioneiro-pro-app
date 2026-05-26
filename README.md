# Pioneiro Pro

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38B2AC?logo=tailwindcss&logoColor=white)
![Status](https://img.shields.io/badge/status-active-brightgreen)
![License](https://img.shields.io/badge/license-private-lightgrey)

Pioneiro Pro e uma aplicacao web para organizar atividades, estudantes, visitas, lembretes, metas e historico de acompanhamento em uma rotina mais clara, visual e produtiva.

O projeto foi desenvolvido como uma solucao de apoio operacional, com foco em organizacao de dados, registro de progresso, visualizacao rapida de informacoes importantes e evolucao futura para persistencia em backend real.

## Visao de produto

Muitas rotinas de acompanhamento acabam ficando espalhadas entre papel, planilhas, mensagens e anotacoes soltas. O Pioneiro Pro centraliza essas informacoes em um painel unico, reduzindo retrabalho e facilitando a tomada de decisao.

A proposta nao e apenas registrar dados, mas transformar informacoes dispersas em uma experiencia organizada, consultavel e preparada para evoluir.

## Principais capacidades

- Cadastro e acompanhamento de estudantes
- Registro de atividades e tempo dedicado
- Organizacao de visitas agendadas
- Controle de lembretes e notas rapidas
- Checklist de objetivos por estudante
- Painel com indicadores de acompanhamento
- Configuracoes personalizadas da rotina
- Interface responsiva para desktop e mobile
- Base local preparada para futura integracao com backend

## Stack tecnica

| Camada | Tecnologia |
| --- | --- |
| Frontend | React 18 |
| Build | Vite |
| Estilizacao | Tailwind CSS |
| Roteamento | React Router |
| Estado/dados | Local client + localStorage |
| Data fetching | TanStack Query |
| Graficos | Recharts |
| UI/Icons | Radix UI + Lucide React |
| Qualidade | ESLint + TypeScript check via JSConfig |

## Arquitetura

```txt
src/
├── api/                 # Client local da aplicacao
├── components/          # Componentes reutilizaveis
├── hooks/               # Hooks de apoio
├── lib/                 # Contextos, utilitarios e helpers
├── pages/               # Paginas principais
└── main.jsx             # Entrada da aplicacao
```

O projeto utiliza um client local em `src/api/pioneiroClient.js`. Essa camada isola o acesso aos dados e permite evoluir para uma API real sem reescrever toda a interface.

## Como executar localmente

```bash
git clone https://github.com/M4rc3low/pioneiro-pro-app.git
cd pioneiro-pro-app
npm install
npm run dev
```

Build de producao:

```bash
npm run build
npm run preview
```

## Scripts

| Comando | Descricao |
| --- | --- |
| `npm run dev` | Inicia o ambiente local |
| `npm run build` | Gera build de producao |
| `npm run preview` | Visualiza o build local |
| `npm run lint` | Executa analise de lint |
| `npm run lint:fix` | Corrige problemas automaticos de lint |
| `npm run typecheck` | Executa verificacao de tipos/configuracao |

## Qualidade e seguranca

- Nenhum segredo ou credencial deve ser versionado.
- Dados reais nao devem ser usados em commits publicos.
- A camada de dados local deve ser substituida por backend seguro em producao.
- Antes de publicar, executar `npm run build`, `npm run lint` e `npm run typecheck`.

## Roadmap tecnico

- [ ] Adicionar screenshots reais da interface
- [ ] Publicar versao demonstrativa
- [ ] Criar persistencia em backend
- [ ] Adicionar autenticacao real
- [ ] Criar exportacao de relatorios
- [ ] Implementar testes automatizados
- [ ] Preparar deploy em ambiente de producao
- [ ] Adicionar observabilidade e monitoramento

## Valor profissional

Este projeto demonstra desenvolvimento web aplicado a um problema real: organizacao operacional, acompanhamento de dados, produtividade e construcao de uma interface util para rotina pratica.

## Autor

Desenvolvido por Marcelo Gomes.
