# Pioneiro Pro

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38B2AC?logo=tailwindcss&logoColor=white)
![CI](https://img.shields.io/badge/GitHub_Actions-CI-2088FF?logo=githubactions&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

Pioneiro Pro é uma aplicação web para organizar atividades, estudantes, visitas, lembretes, metas e histórico de acompanhamento em uma rotina mais clara, visual e produtiva.

O projeto foi desenvolvido como uma solução de apoio operacional, com foco em organização de dados, registro de progresso, visualização rápida de informações importantes e uma arquitetura preparada para evoluir para persistência em backend real.

## Visão de produto

Muitas rotinas de acompanhamento acabam ficando espalhadas entre papel, planilhas, mensagens e anotações soltas. O Pioneiro Pro centraliza essas informações em um painel único, reduzindo retrabalho e facilitando a consulta e o acompanhamento.

A proposta não é apenas registrar dados, mas transformar informações dispersas em uma experiência organizada, consultável e preparada para evoluir.

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
| UI/Ícones | Radix UI + Lucide React |
| Qualidade | ESLint + TypeScript check via JSConfig |
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

O projeto utiliza um client local em `src/api/pioneiroClient.js`. Essa camada isola o acesso aos dados e facilita a migração futura para uma API real sem exigir a reescrita da interface.

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

## Scripts

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o ambiente local |
| `npm test` | Executa o smoke test do projeto |
| `npm run build` | Gera o build de produção |
| `npm run preview` | Visualiza o build local |
| `npm run lint` | Executa análise de lint |
| `npm run lint:fix` | Corrige problemas automáticos de lint |
| `npm run typecheck` | Executa verificação de tipos/configuração |

## Qualidade e CI

A pipeline em `.github/workflows/ci.yml` executa, em pushes e pull requests para `main`:

1. instalação reproduzível com `npm ci`;
2. smoke tests;
3. lint;
4. typecheck;
5. build de produção;
6. build da imagem Docker.

Isso mantém uma verificação mínima automatizada antes de novas alterações entrarem na branch principal.

## Segurança

- Nenhum segredo ou credencial deve ser versionado.
- Dados reais não devem ser usados em commits públicos.
- A camada de dados local deve ser substituída por backend seguro em produção.
- Antes de publicar, o projeto deve passar por testes, lint, typecheck e build.

## Roadmap técnico

- [ ] Adicionar screenshots reais da interface
- [ ] Publicar versão demonstrativa
- [ ] Criar persistência em backend
- [ ] Adicionar autenticação real
- [ ] Criar exportação de relatórios
- [ ] Ampliar a cobertura de testes automatizados
- [ ] Preparar deploy em ambiente de produção
- [ ] Adicionar observabilidade e monitoramento

## Valor profissional

Este projeto demonstra desenvolvimento web aplicado a um problema real de organização operacional, além de práticas de qualidade como validação automatizada, CI e build em container.

## Licença

Distribuído sob a licença MIT. Consulte o arquivo `LICENSE`.

## Autor

Desenvolvido por Marcelo Gomes.
