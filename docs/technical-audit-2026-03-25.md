# Auditoria técnica — Clean Architecture Boilerplate

Data: 2026-03-25

## Escopo analisado

- package.json
- .eslintrc.js, .prettierrc, .editorconfig, .eslintignore
- vitest.config.ts, vitest.config.e2e.ts
- lint-staged.config.js
- commitlint.config.ts
- .husky/pre-commit, .husky/commit-msg
- workflows de CI em `.github/workflows/*.yml`

---

## 1) Diagnóstico atual por categoria

### 1.1 Linting e formatação

**Estado atual**
- ESLint legado (`.eslintrc.js`) com `@typescript-eslint` + `plugin:prettier/recommended`.
- Prettier separado em `.prettierrc`.
- EditorConfig presente, porém com opções essenciais comentadas (`end_of_line`, `trim_trailing_whitespace`, `insert_final_newline`).
- `lint-staged` executa `eslint --fix`, depois `eslint` novamente e por fim `prettier --write` para os mesmos arquivos.

**Leitura técnica**
- Há **dupla execução de ESLint** no pre-commit sem ganho real.
- A estratégia `eslint-plugin-prettier` + `prettier --write` gera custo extra e conflito de responsabilidade (lint x format).
- Config não está no padrão moderno (ESLint Flat Config), o que dificulta evolução.

### 1.2 Testes

**Estado atual**
- Projeto usa Vitest para unit e e2e (configs separados).
- Não há Jest instalado.
- Não há Testing Library no repositório.
- `lint-staged` roda `vitest run` para `*.spec.ts` staged.

**Leitura técnica**
- Stack está relativamente limpa (Vitest-only), mas o pre-commit pode ficar lento ao rodar testes em cada commit.
- E2E depende de infraestrutura (Postgres/Redis), configurada apenas no workflow e não no hook local.
- Cobertura existe via script (`test:cov`), porém não há gate mínimo em CI.

### 1.3 Git hooks e qualidade do commit

**Estado atual**
- Husky com `pre-commit` e `commit-msg`.
- `pre-commit` chama `pnpm lint-staged --concurrent false`.
- Projeto usa lockfile npm (`package-lock.json`), mas hook força pnpm.
- Commitlint configurado corretamente no hook de `commit-msg`.
- Commitizen presente (script `commit`), junto de um `commit:ai` (oco).

**Leitura técnica**
- Existe **inconsistência de gerenciador de pacote** (npm no CI/scripts vs pnpm no hook).
- `validate` script está quebrado (`pnpm lint && && ...`), sinal de baixa confiabilidade operacional.
- Commitizen + Commitlint + fluxo manual pode virar fricção sem elevar qualidade proporcional.

### 1.4 Versionamento e release

**Estado atual**
- Script `release` chama `semantic-release`.
- Não foi encontrado `.releaserc`/config explícita de branches/plugins.
- Não há workflow de release dedicado no GitHub Actions.

**Leitura técnica**
- Sem configuração explícita, o release fica dependente de defaults implícitos.
- Risco de falha ou comportamento inesperado em branch strategy, changelog e publicação.
- Pipeline atual reduz erro humano parcialmente, mas não é auditável o suficiente.

### 1.5 DX / CI-CD

**Estado atual**
- Quatro workflows separados (lint, typecheck, unit, e2e), cada um com sua matriz.
- Mistura de versões/actions antigas (`actions/checkout@v2`, `setup-node@v2/v3`).
- Node versions inconsistentes entre workflows (16/18/20 vs 18/20).

**Leitura técnica**
- Há redundância de setup/cache/instalação e custo de manutenção.
- Pipeline mais lento que o necessário.
- Falta padronização de runtime e política de falha rápida.

---

## 2) Problemas encontrados (priorizados)

### P0 (corrigir imediatamente)
1. Inconsistência npm/pnpm no hook de pre-commit.
2. Script `validate` inválido por erro de sintaxe (`&& &&`).
3. Ausência de configuração explícita do Semantic Release.

### P1 (alto impacto)
4. Dupla execução de ESLint no lint-staged.
5. Execução de teste no pre-commit em staged files (custo alto em ciclos rápidos).
6. CI fragmentado e com versões/actions defasadas.

### P2 (médio impacto)
7. EditorConfig incompleto para padronização cross-OS.
8. ESLint legado (não flat config).
9. `eslint-plugin-prettier` adiciona overhead (pode ser removido em favor de execução separada).

---

## 3) Melhorias recomendadas

### 3.1 Lint/format
- Migrar para `eslint.config.js` (Flat Config).
- Remover `eslint-plugin-prettier` e manter:
  - ESLint para semântica/qualidade;
  - Prettier para formatação (execução separada).
- Simplificar lint-staged para:
  - `eslint --fix` (uma vez)
  - `prettier --write`
- Ativar no EditorConfig:
  - `end_of_line = lf`
  - `trim_trailing_whitespace = true`
  - `insert_final_newline = true`

### 3.2 Testes
- Manter **apenas Vitest** (já está nessa direção).
- Remover qualquer referência futura a Jest, salvo necessidade real.
- No pre-commit: não executar suite de testes completa; mover para pre-push ou CI.
- Em CI: adicionar gate de cobertura mínima (ex.: 80% linhas globais, ajustável por módulo).
- Para e2e: rodar apenas em PR para `main` e push em `main` (evitar custo em branches não críticas).

### 3.3 Commits e hooks
- Corrigir gerenciador único (recomendado: npm se lockfile é npm).
- Manter commitlint no `commit-msg`.
- Commitizen pode ser opcional (não obrigatório). Melhor expor `npm run commit` para quem quiser.
- Corrigir e fortalecer `validate` para execução local e CI:
  - `npm run lint && npm run check-types && npm run test`

### 3.4 Release
- Criar `.releaserc` explícito com:
  - `branches: ["main"]`
  - plugins de analyzeCommits, notes, changelog, github/npm (conforme estratégia)
- Criar workflow `release.yml` com permissões e secrets explícitos.
- Adotar dry-run em PR para validar convenção de commits.

### 3.5 CI/CD
- Consolidar em 1 workflow principal com jobs (`lint`, `typecheck`, `unit`, `e2e`).
- Usar actions atualizadas (`checkout@v4`, `setup-node@v4`).
- Padronizar Node 20 (ou 20 + 22 se roadmap exigir).
- Introduzir `concurrency` por branch para cancelar runs obsoletos.

---

## 4) Integração com IA (ESSENCIAL)

### 4.1 Linting e formatação
- **Pode ser substituído por IA?** Parcialmente.
- **Recomendação**:
  - Não remover Prettier (determinístico, barato, confiável).
  - Usar IA para sugerir refactors e correções semânticas pós-lint.
- **Integração prática**:
  - Bot de PR com sugestões de code smell e complexidade ciclomática.
  - Agente de autofix em PR comentando diff sugerido.

### 4.2 Testes
- **Pode ser substituído por IA?** Parcialmente.
- **Recomendação**:
  - IA para gerar casos de teste faltantes e mocks automaticamente.
  - Execução/veredito continua com Vitest em CI.
- **Integração prática**:
  - Workflow que detecta arquivos alterados e pede ao agente gerar/atualizar specs.
  - Bot para sugerir testes de regressão com base em stacktrace de falhas.

### 4.3 Commits / convenção semântica
- **Pode ser substituído por IA?** Parcialmente a totalmente (dependendo de governança).
- **Recomendação**:
  - IA gerar mensagem Conventional Commit via diff.
  - Commitlint permanece como rede de segurança (ao menos no cenário conservador/híbrido).
- **Integração prática**:
  - CLI IA (`commit:ai`) integrada ao `git diff --staged`.
  - Em PR, bot valida se título segue conventional pattern.

### 4.4 Release
- **Pode ser substituído por IA?** Não recomendado (núcleo), parcial (assistência).
- **Recomendação**:
  - Semantic Release continua canônico.
  - IA apenas para enriquecer release notes e highlights.

### 4.5 Ferramentas sugeridas
- IDE: Cursor/Copilot para geração de testes e refactors assistidos.
- CLI: agentes tipo Codex para automação de manutenção.
- CI: GitHub Action com bot de revisão IA (comentário em PR + patch opcional).
- Governança: branch protection + required checks continuam obrigatórios.

---

## 5) Arquitetura ideal sugerida

### Base deterministic-first
1. ESLint (flat) + Prettier + EditorConfig estrito.
2. Vitest único (unit + e2e) com cobertura mínima.
3. Husky mínimo: `pre-commit` (lint-staged leve) + `commit-msg` (commitlint).
4. Semantic Release com config explícita + workflow dedicado.
5. CI unificada com cache adequado e matrizes reduzidas.

### AI augmentation layer
1. Agente de PR para:
   - review semântico
   - sugestão de testes
   - proposta de commit message
2. Agente de correção automática opcional (com aprovação humana).
3. Relatório de risco por PR (arquivos críticos alterados, falta de testes, breaking risk).

---

## 6) Plano de migração (passo a passo)

### Fase 1 — Higiene operacional (1-2 dias)
1. Corrigir `validate`.
2. Alinhar npm/pnpm (escolher um só).
3. Simplificar lint-staged (remover comandos duplicados).
4. Normalizar EditorConfig.

### Fase 2 — CI e release (2-3 dias)
5. Consolidar workflows e atualizar actions.
6. Definir versão Node padrão.
7. Criar `.releaserc` + `release.yml`.
8. Adicionar gate de cobertura.

### Fase 3 — IA assistiva (3-5 dias)
9. Adicionar bot de PR com review IA.
10. Adicionar geração assistida de testes para arquivos alterados.
11. Adicionar sugestão automática de commit semântico.

### Fase 4 — otimização contínua
12. Medir lead time, tempo de CI, taxa de rollback e flaky tests.
13. Ajustar políticas (onde IA aprova/sugere, onde humano decide).

---

## 7) Stack final recomendada

### Recomendação principal (híbrida)
- Qualidade: ESLint Flat + Prettier + EditorConfig estrito.
- Testes: Vitest only + coverage gate + testes e2e por gatilho inteligente.
- Commits: Commitlint + IA para geração de mensagem.
- Release: Semantic Release explícito com workflow dedicado.
- IA: PR review bot + gerador de testes + assistente de changelog.

### 3 cenários

#### 🟢 Conservador
- Mantém todas as ferramentas atuais.
- Corrige inconsistências, remove duplicidade, atualiza CI/release.
- IA apenas como copiloto no editor.

#### 🟡 Híbrido (recomendado)
- Ferramental determinístico continua como base.
- IA entra em review, testes e sugestão de commits.
- Melhor equilíbrio entre confiabilidade e produtividade.

#### 🔴 Agressivo
- Reduz validações locais (menos hooks), confia mais em agentes IA + CI.
- Commitizen/parte do lint manual pode sair.
- Maior velocidade, porém maior risco de variabilidade e governança.

---

## Conclusão executiva

O repositório já tem bons fundamentos (Vitest, Husky, commitlint), mas sofre com inconsistências operacionais, duplicidades no pre-commit, CI fragmentada e release sem contrato explícito. A melhor relação risco/retorno é uma estratégia **híbrida**: manter base determinística forte e usar IA para acelerar revisão, testes e mensagens semânticas, sem transferir decisões críticas de qualidade para modelos generativos.
