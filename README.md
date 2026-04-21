# Front-end do Cicatrizando 

Aplicativo mobile focado na saúde para o acompanhamento da evolução de feridas 
complexas através de fotos. O sistema possui duas visões principais: 
**Especialista** e **Paciente**. 

Construído utilizando **Next.js** (com exportação estática) empacotado para 
Android nativo através do **Capacitor**.

## Estrutura de Pastas

Utilizamos uma arquitetura baseada em funcionalidades (feature-based) para 
manter o código escalável e modular, separando as regras de negócio por domínio.

```text
src/ (ou raiz do projeto)
├── app/                      # Roteamento do Next.js (App Router)
│   ├── page.tsx              # Rota inicial
│   ├── (auth)/               # Grupo de rotas de autenticação
│   │   └── login/            # Tela de login
│   ├── (onboarding)/         # Fluxo de integração de novos usuários
│   │   ├── role-selection/   # Seleção de perfil (Paciente ou Especialista)
│   │   └── register-specialist/ # Cadastro de especialista
│   ├── (patient)/            # Rotas exclusivas do paciente
│   │   └── timeline/         # Linha do tempo de feridas
│   └── (specialist)/         # Rotas exclusivas do especialista
│       ├── dashboard/        # Painel do especialista
│       └── register-patient/ # Cadastro de paciente
├── components/               # Componentes de UI genéricos e reutilizáveis (Botões, Modais, Inputs)
├── features/                 # Lógica de negócio isolada por domínio
│   └── auth/                 # Regras, hooks e componentes de autenticação (Google Login)
├── hooks/                    # Hooks globais (ex: conectividade, permissões)
├── lib/                      # Configurações de bibliotecas externas (Axios, utilitários)
└── store/                    # Gerenciamento de estado global da interface (Zustand)
```

### Autenticação

Para a autenticação via Google dentro do ambiente nativo (Capacitor WebView),
optamos por utilizar o pacote `@capgo/capacitor-social-login`. Ele permite
a obtenção de um código de autorização offline de forma nativa.

O nosso projeto já possui um backend robusto em Django, que atua como a nossa
única fonte da verdade (Source of Truth) para o banco de dados e regras de
negócio.

#### Fluxo da Autenticação

1. O aplicativo chama a interface nativa do Google no Android via `@capgo/capacitor-social-login`.
2. O Google retorna um `serverAuthCode` (modo offline).
3. O Next.js envia o `serverAuthCode` para a nossa API em Django.
4. O Django valida o código junto ao Google e retorna os tokens JWT de acesso, além dos dados do usuário (perfil e status de cadastro).

## Instalação

Para executar o projeto em um novo ambiente, siga os passos abaixo:

### Variáveis de Ambiente
Antes de iniciar, certifique-se de configurar as variáveis de ambiente necessárias. Crie um arquivo `.env.local` na raiz do projeto (você pode se basear em um arquivo `.env.example` se existir):
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

### Web
Para rodar a aplicação localmente no navegador (ambiente de desenvolvimento padrão do Next.js):

```bash
# Instalar todas as dependências
npm install

# Iniciar o servidor de desenvolvimento na porta 3000
npm run dev
```

### Mobile (Capacitor)
Como o projeto é empacotado para Android, você precisará gerar o build estático e sincronizar com o projeto nativo:

```bash
# 1. Gerar o build de exportação estática do Next.js (pasta 'out')
npm run build

# 2. Sincronizar os arquivos web com o projeto Android
npx cap sync android

# 3. Abrir o projeto no Android Studio para rodar no emulador ou dispositivo físico
npx cap open android
```
