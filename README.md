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
│   ├── (auth)/               # Telas de login e onboarding
│   ├── (patient)/            # Rotas exclusivas do paciente (ex: timeline, câmera)
│   └── (specialist)/         # Rotas exclusivas do especialista (ex: dashboard, pacientes)
├── components/               # Componentes de UI genéricos e reutilizáveis (Botões, Modais, Inputs)
├── features/                 # Lógica de negócio isolada por domínio
│   ├── auth/                 # Regras, hooks e componentes de autenticação (Google Login)
│   ├── wounds/               # Fluxo de captura de fotos, timeline e upload
│   └── users/                # Listagem e gestão de perfis
├── hooks/                    # Hooks globais (ex: conectividade, permissões)
├── lib/                      # Configurações de bibliotecas externas (Axios, utilitários)
└── store/                    # Gerenciamento de estado global da interface (Zustand)
```

### Autenticação

Para a autenticação via Google dentro do ambiente nativo (Capacitor WebView),
optamos por utilizar o pacote `@capacitor-firebase/authentication`, que é
amplamente mantido e compatível com as versões mais recentes do Capacitor.

O nosso projeto já possui um backend robusto em Django, que atua como a nossa
única fonte da verdade (Source of Truth) para o banco de dados e regras de
negócio.

#### Fluxo da Autenticação

1. O aplicativo Capacitor chama a interface nativa do Google no Android via Firebase.
2. O Firebase retorna as informações do usuário autenticado.
3. Next.js manda token para o Django, que verifica o login.
