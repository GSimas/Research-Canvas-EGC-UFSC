# Publicação do Research Canvas EGC

Este pacote contém a versão funcional atual da aplicação. O projeto utiliza React, TypeScript, Vinext, Vite e o adaptador de runtime do Cloudflare. Por isso, a publicação mais direta e com menos alterações é no Cloudflare Workers.

## Recomendação: Cloudflare Workers

### Pré-requisitos

- Node.js 22 ou superior;
- uma conta Cloudflare;
- acesso ao painel DNS do domínio `gustavosimas.com` na Hostinger;
- Git opcional, mas recomendado para manter histórico e automatizar futuras atualizações.

### 1. Executar e validar localmente

Descompacte o projeto, abra um terminal na pasta e execute:

```bash
npm ci
npm run dev
```

Abra a URL local exibida no terminal. Para executar todas as validações:

```bash
npm test
```

### 2. Fazer o primeiro deploy

No terminal, autentique a máquina na Cloudflare:

```bash
npx wrangler login
```

Depois publique:

```bash
npm run deploy:cloudflare
```

O build gera automaticamente a configuração final do Worker. Ao concluir, o Wrangler mostrará uma URL `*.workers.dev`. Abra essa URL e teste criação de projeto, autosave, Canvas e exportações.

### 3. Usar `researchcanvas.gustavosimas.com`

Um Custom Domain de Cloudflare Workers exige que `gustavosimas.com` seja uma zona DNS ativa na Cloudflare.

1. No painel Cloudflare, escolha **Add a domain** e informe `gustavosimas.com`.
2. Revise os registros DNS importados. Preserve especialmente registros do site atual, e-mail, MX, TXT, SPF, DKIM e DMARC.
3. A Cloudflare fornecerá dois nameservers.
4. Na Hostinger, abra **Domains → gustavosimas.com → DNS / Nameservers** e substitua somente os nameservers pelos fornecidos pela Cloudflare.
5. Aguarde a zona aparecer como ativa na Cloudflare. O domínio continua registrado e renovado na Hostinger; apenas a gestão DNS passa à Cloudflare.
6. Na Cloudflare, abra **Workers & Pages → seu Worker → Settings → Domains & Routes**.
7. Escolha **Add → Custom Domain**.
8. Informe `researchcanvas.gustavosimas.com` e confirme.

A Cloudflare criará o registro DNS necessário e emitirá o certificado HTTPS automaticamente.

### 4. Atualizações futuras

Depois de alterar e testar o código:

```bash
npm test
npm run deploy:cloudflare
```

Para automação, coloque o projeto em um repositório GitHub e conecte-o ao Workers Builds. Configure `npm ci && npm run build` como build e `npx wrangler deploy` como deploy.

## Alternativa: Hostinger Web App

A Hostinger permite aplicações Node.js em planos compatíveis, normalmente Business ou Cloud, e aceita GitHub ou ZIP. O fluxo geral é:

1. Em hPanel, acesse **Websites → Add Website → Deploy Web App/Node.js Web App**.
2. Escolha GitHub para deploy contínuo ou faça upload deste ZIP.
3. Selecione Node.js 22.
4. Configure o build.
5. Após o deploy no domínio temporário, escolha **Connect domain** e informe `researchcanvas.gustavosimas.com`.
6. Confirme os registros DNS solicitados; a Hostinger instala o SSL automaticamente.

### Configuração exata no hPanel

Para este pacote, escolha o framework **Other/Outro** quando o Vinext não for detectado corretamente e preencha:

- **Node.js:** 22;
- **preset:** `Other/Outro`;
- **branch:** `main`;
- **diretório raiz:** `./`;
- **gerenciador de pacotes:** `npm`;
- **comando de build:** `npm run build`;
- **diretório de saída:** `dist/standalone`;
- **arquivo de entrada:** `server.js`;
- **comando de inicialização**, se o painel solicitar: `npm run start:hostinger`.

O hPanel instala as dependências automaticamente. O arquivo `.npmrc` mantém
as dependências de desenvolvimento disponíveis porque Vinext, Vite e seus
plugins são necessários durante o build. Não configure manualmente
`NODE_ENV=production` para a etapa de instalação/build.

O servidor standalone utiliza automaticamente a variável `PORT` fornecida pela Hostinger e escuta em `0.0.0.0`.

### Observação importante sobre a Hostinger

O comando `npm run build` gera o servidor Node standalone em
`dist/standalone`. A verificação local adicional pode ser executada com
`npm run verify:hostinger`. Não use `dist`, `.next` ou `dist/client` como
diretório de saída no hPanel.

Se a prioridade é concentrar hospedagem e DNS na Hostinger, use os campos acima. O build standalone foi preparado especificamente para esse fluxo.

## Persistência e privacidade

O MVP salva projetos no IndexedDB do navegador. Publicar a aplicação não envia os projetos para um servidor. Consequências:

- cada navegador/dispositivo possui seus próprios projetos;
- limpar os dados do navegador pode apagar o conteúdo;
- use regularmente o backup JSON individual ou em lote;
- para contas, sincronização e colaboração será necessário um backend em uma versão futura.

## Links oficiais

- Cloudflare Workers e Vite: https://developers.cloudflare.com/workers/vite-plugin/
- Domínios personalizados no Workers: https://developers.cloudflare.com/workers/configuration/routing/custom-domains/
- Deploy Node.js na Hostinger: https://www.hostinger.com/tutorials/deploy-node-js-application
- Conectar domínio a uma aplicação Node.js na Hostinger: https://www.hostinger.com/support/how-to-connect-a-custom-domain-to-a-node-js-application/
