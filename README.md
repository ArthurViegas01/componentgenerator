# UI Component Generator

Gere componentes React + Tailwind CSS a partir de descrições em linguagem natural,
com preview ao vivo, editor Monaco integrado, biblioteca de componentes e sistema
de temas.

> **Status:** scaffold completo — fluxo principal (prompt → IA → preview → editor →
> galeria) funcional. Auth, dashboard analytics e features extras (A11y check,
> Storybook export, Figma plugin, voice input) estão como stubs prontos para
> serem implementados.

## Stack

| Camada       | Tecnologia                          |
| ------------ | ----------------------------------- |
| Framework    | Next.js 14 (App Router)             |
| Linguagem    | TypeScript                          |
| UI           | React 18, Tailwind CSS, Framer Motion |
| Estado       | Zustand (com persistência localStorage) |
| Editor       | Monaco Editor (`@monaco-editor/react`)  |
| IA           | **Groq (grátis)** · Ollama (local) · Claude · OpenAI |
| Formatter    | Prettier                            |
| Hospedagem   | Vercel                              |

## Setup (grátis, sem cartão)

```bash
# 1. Instalar dependências
npm install

# 2. Configurar o provider (Groq é o padrão e é gratuito)
cp .env.example .env.local
# abra .env.local e cole sua GROQ_API_KEY

# 3. Rodar em desenvolvimento
npm run dev
# http://localhost:3000
```

### Como obter uma chave Groq (grátis, ~2 minutos)

1. Acesse https://console.groq.com/keys (login com GitHub ou Google — não
   pede cartão de crédito).
2. Clique em **Create API Key**, dê um nome qualquer e copie o valor.
3. Cole em `GROQ_API_KEY` no seu `.env.local`.

O tier gratuito da Groq dá ~30 requisições/minuto no `llama-3.3-70b-versatile`
— mais que suficiente para desenvolvimento. A Groq é conhecida por ser *muito*
rápida (inferência em LPU), então o streaming fica quase instantâneo.

### Alternativa: Ollama (100% local, offline)

Se preferir rodar tudo na sua máquina sem depender de API externa:

```bash
# 1. Instale o Ollama: https://ollama.com
# 2. Baixe um modelo bom em código (~4.7 GB)
ollama pull qwen2.5-coder:7b
# 3. Deixe o Ollama rodando em background
ollama serve
# 4. No seu .env.local:
AI_PROVIDER=ollama
```

Requer uns 8 GB de RAM livres. Com GPU fica fluido; na CPU pura demora
alguns segundos por resposta.

### Outras opções (pagas)

- **Anthropic Claude** — `AI_PROVIDER=anthropic` + `ANTHROPIC_API_KEY`
- **OpenAI GPT-4** — `AI_PROVIDER=openai` + `OPENAI_API_KEY`

## Estrutura

```
app/
├── layout.tsx                # Root layout com providers
├── page.tsx                  # Home / landing
├── globals.css               # Tailwind + variáveis de tema
├── generator/
│   ├── layout.tsx
│   ├── page.tsx              # IDE-like layout: prompt | editor | preview
│   └── components/
│       ├── PromptInput.tsx
│       ├── CodeEditor.tsx
│       ├── ComponentPreview.tsx
│       ├── ComponentGallery.tsx
│       └── ThemeSelector.tsx
├── api/
│   ├── generate/route.ts     # POST → streaming Claude/GPT
│   ├── save/route.ts         # POST → salva componente
│   ├── history/route.ts      # GET  → histórico
│   └── themes/route.ts       # GET  → temas disponíveis
├── auth/
│   ├── signin/page.tsx       # stub
│   └── signup/page.tsx       # stub
└── dashboard/
    ├── page.tsx
    └── components/
        ├── SavedComponents.tsx
        ├── Stats.tsx
        └── RecentActivity.tsx
lib/
├── ai/{prompts,validators}.ts
├── hooks/{useComponentHistory,useTheme,useCodeEditor}.ts
├── store/{componentStore,themeStore,editorStore}.ts
└── utils/{formatCode,extractProps,generateFileName,cn}.ts
components/ui/                # primitives shadcn-style (Button, Card, ...)
```

## Fluxo de uso

1. Abra `/generator`
2. Descreva o componente que quer gerar (ex.: *"Card com imagem, título,
   descrição e botão. Hover anima o card subindo levemente."*)
3. Clique em **Gerar** — o código aparece em streaming no editor
4. Veja o resultado no painel **Preview** (com toggle mobile/tablet/desktop)
5. Ajuste o código se quiser — o preview atualiza em tempo real
6. Clique em **Salvar** para mandar pra biblioteca, ou **Copiar/Download**

## Exemplos de prompts bons

- *"Botão primário com ícone à esquerda, estados hover/disabled, variante outline"*
- *"Pricing card com 3 tiers (Free, Pro, Enterprise), badge de 'most popular' no Pro"*
- *"Form de login com email/senha, validação visual, loading state no submit"*
- *"Notification toast que desliza pela direita, com 4 variantes (success/error/warning/info)"*
- *"Sidebar collapsible com nested items, ícones lucide, indicador de item ativo"*

## Roadmap

- [x] Streaming de código
- [x] Preview em iframe sandbox
- [x] Editor Monaco com formatação Prettier
- [x] Galeria local (Zustand persist)
- [x] Sistema de temas (10+ paletas)
- [ ] Auth (NextAuth + GitHub OAuth)
- [ ] Persistência server-side (Prisma + Postgres)
- [ ] Geração de variações em batch
- [ ] Refine via chat ("torne esse botão mais arredondado")
- [ ] A11y check automático (axe-core)
- [ ] Export para Storybook
- [ ] Public showcase
- [ ] Voice input
- [ ] Screenshot → componente (reverso)

## Contribuindo

PRs bem-vindos. Convenções:

- Tipagem estrita (`npm run type-check` deve passar)
- Tailwind para todo o styling (sem CSS-in-JS)
- Componentes pequenos e reutilizáveis
- Mensagens de commit em inglês, no formato `feat: ...`, `fix: ...`, `chore: ...`

## Licença

MIT
