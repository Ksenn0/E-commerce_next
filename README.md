# E-commerce de Perfumaria - Roze Magazine

Projeto de e-commerce completo para uma loja local de perfumes em Picos - PI, desenvolvido com tecnologias modernas do ecossistema Next.js.

## 🎯 Sobre o Projeto

Loja virtual completa para venda de perfumes com entrega local. O sistema permite cadastro de clientes, gerenciamento de produtos via painel admin, carrinho de compras e finalização do pedido diretamente pelo WhatsApp com dados do cliente preenchidos automaticamente.

### Principais Funcionalidades

- **Catálogo de produtos** com filtro por categorias
- **Carrinho de compras** completo com atualização em tempo real
- **Sistema de autenticação** completo (cadastro + login)
- **Perfil do cliente** com endereço, telefone e dados para entrega
- **Painel administrativo** protegido (adicionar, editar e excluir produtos com upload de imagens)
- **Integração com WhatsApp** - botão que monta mensagem completa com dados do cliente + itens do carrinho
- **Design responsivo** e elegante com tema personalizado
- **Deploy automático** no Vercel

## 🛠️ Tecnologias Utilizadas

- **Framework**: Next.js 15 (App Router)
- **Estilização**: Tailwind CSS v4
- **Banco de Dados**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **Storage de imagens**: Supabase Storage
- **Linguagem**: JavaScript (com possibilidade de migração para TypeScript)
- **Deploy**: Vercel
- **Ícones e UI**: React Icons + Tailwind

## 📋 Funcionalidades Detalhadas

### Para Clientes
- Cadastro em duas etapas (email/senha + preenchimento de perfil)
- Visualização de produtos com filtro por categoria
- Carrinho de compras dinâmico
- Finalização do pedido via WhatsApp com dados pré-preenchidos (nome, telefone, endereço completo)

### Para Administradores
- Painel protegido (/admin)
- Adição, edição e exclusão de produtos
- Upload de imagens diretamente para o Supabase Storage
- Gerenciamento de categorias

### Segurança
- Row Level Security (RLS) ativado em todas as tabelas
- Restrição de escrita apenas para admins específicos via UUID
- Políticas de leitura pública para produtos e categorias

## 🚀 Como Rodar Localmente

1. Clone o repositório:
   ```bash
   git clone https://github.com/Ksenn0/E-commerce_next.git
   cd E-commerce_next
2. Instale as dependências:
   ```bash
   npm install
3. Crie o arquivo .env.local na raiz e adicione suas credenciais:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
   NEXT_PUBLIC_WHATSAPP_NUMBER=5589999999999   # número da loja
4. Rode o projeto:
   ```bash
   npm run dev
Acesse: http://localhost:3000

5. 📁 Estrutura de Pastas
   ```bash
   src/
   ├── app/
   │   ├── admin/           # Painel administrativo
   │   ├── carrinho/        # Carrinho de compras
   │   ├── cadastro/        # Cadastro em duas etapas
   │   ├── perfil/          # Perfil do usuário
   │   └── layout.js        # Layout global + metadata
   ├── context/             # Contexto do carrinho
   ├── lib/                 # Configurações do Supabase (client e server)
   ├── utils/               # Funções auxiliares (formatPrice, etc.)
   └── public/              # Imagens estáticas e favicon

🔒 Segurança Implementada

Políticas RLS restritas por auth.uid() para ações administrativas
Apenas admins específicos podem criar, editar e excluir produtos
Upload de imagens seguro no Supabase Storage
Variáveis de ambiente configuradas corretamente no Vercel

```markdown
## 🚀 Deploy

Projeto configurado com deploy automático no Vercel via integração com GitHub.

**Link do Projeto Online:** [https://seu-link-vercel.vercel.app](https://seu-link-vercel.vercel.app)

## 📄 Licença

Este projeto foi desenvolvido para fins educacionais e de portfólio.  
Uso comercial apenas com autorização da proprietária da loja "Roze Magazine".

---

Feito por [Ksenn0](https://github.com/Ksenn0)

## Tecnologias em Destaque

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
