# Pioneiro Pro

[![CI](https://github.com/M4rc3low/pioneiro-pro-app/actions/workflows/ci.yml/badge.svg)](https://github.com/M4rc3low/pioneiro-pro-app/actions/workflows/ci.yml)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38B2AC?logo=tailwindcss&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

Aplicação web para organizar **atividades, estudantes, visitas, lembretes, metas e histórico de acompanhamento** em uma rotina mais clara, visual e produtiva.

O projeto foi desenvolvido como uma solução de apoio operacional, com foco em organização de dados, registro de progresso e visualização rápida de informações importantes.

## Visão de produto

Muitas rotinas de acompanhamento acabam espalhadas entre papel, planilhas, mensagens e anotações. O Pioneiro Pro centraliza essas informações em um painel único, reduzindo retrabalho e facilitando a consulta do histórico.

A proposta não é apenas registrar dados, mas transformar informações dispersas em uma experiência organizada e preparada para evoluir.

## Principais capacidades

- Cadastro e acompanhamento de estudantes
- Registro de atividades e tempo dedicado
- Organização de visitas agendadas
- Controle de lembretes e notas rápidas
- Checklist de objetivos por estudante
- Painel com indicadores de acompanhamento
- Configurações personalizadas da rotina
- Interface responsiva para desktop e mobile
- Base local preparada para futura integração com backend

## Stack técnica

| Camada | Tecnologia |
| --- | --- |
| Frontend | React 18 |
| Build | Vite 6 |
| Estilização | Tailwind CSS |
| Roteamento | React Router |
| Estado/dados | Client local + localStorage |
| Data fetching | TanStack Query |
| Gráficos | Recharts |
| UI/Icons | Radix UI + Lucide React |
| Qualidade | Smoke test + ESLint + build Vite |
| Container | Docker |
| CI | GitHub Actions |

## Arquitetura

```text
src/
├── api/                 # Client local da aplicação
├── components/          # Componentes reutilizáveis
├── hooks/               # Hooks de apoio
├── lib/                 # Contextos, utilitários e helpers
├── pages/               # Páginas principais
└── main.jsx             # Entrada da aplicação
```

O projeto utiliza um client local em `src/api/pioneiroClient.js`. Essa camada isola o acesso aos dados e permite evoluir para uma API real sem reescrever toda a interface.

## Como executar localmente

```bash
git clone https://github.com/M4rc3low/pioneiro-pro-app.git
cd pioneiro-pro-app
npm install
npm run dev
```

Build de produção:

```bash
npm run build
npm run preview
```

### Docker

```bash
docker build -t pioneiro-pro-app .
docker run --rm -p 8080:80 pioneiro-pro-app
```

## Scripts e validações

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o ambiente local |
| `npm test` | Executa smoke test estrutural |
| `npm run lint` | Executa análise de lint |
| `npm run build` | Gera build de produção |
| `npm run preview` | Visualiza o build local |

A pipeline de CI executa automaticamente **smoke test, lint, build da aplicação e build da imagem Docker** em pushes e pull requests para `main`.

> O projeto é atualmente JavaScript/JSX. A checagem estática completa de tipos não é tratada como gate obrigatório enquanto os componentes não tiverem tipagem explícita suficiente. A evolução para TypeScript/JSDoc fica registrada como melhoria técnica, sem deixar a CI artificialmente vermelha.

## Qualidade e segurança

- Nenhum segredo ou credencial deve ser versionado.
- Dados reais não devem ser usados em commits públicos.
- Antes de integrar alterações, execute `npm test`, `npm run lint` e `npm run build`.
- A camada de dados local deve ser substituída por backend seguro em uma implantação com múltiplos usuários.

## Roadmap técnico

- [ ] Adicionar screenshots reais da interface
- [ ] Publicar versão demonstrativa
- [ ] Criar persistência em backend
- [ ] Adicionar autenticação real
- [ ] Criar exportação de relatórios
- [ ] Evoluir a cobertura de testes automatizados
- [ ] Migrar módulos críticos para TypeScript ou adicionar tipagem JSDoc consistente
- [ ] Adicionar observabilidade e monitoramento

## Valor profissional

Este projeto demonstra desenvolvimento web aplicado a um problema real de organização e produtividade, junto com práticas de engenharia como **testes estruturais, lint, CI e containerização**.

## Autor

Desenvolvido por Marcelo Gomes.
