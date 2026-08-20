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
4. Configure a instalação e o build.
5. Após o deploy no domínio temporário, escolha **Connect domain** e informe `researchcanvas.gustavosimas.com`.
6. Confirme os registros DNS solicitados; a Hostinger instala o SSL automaticamente.

### Observação importante sobre a Hostinger

Esta versão está configurada para o runtime Cloudflare Workers. A Hostinger executa um servidor Node tradicional. Portanto, o ZIP não deve ser tratado como um deploy Node garantidamente direto na Hostinger: antes, é recomendável criar uma variante de build `standalone`/Nitro, validar porta e comando de inicialização e testar todas as exportações no runtime Node.

Se a prioridade é publicar agora com o mínimo de risco, use Cloudflare Workers. Se a prioridade é concentrar hospedagem e DNS na Hostinger, faça primeiro essa pequena adaptação de runtime e então use o fluxo de Web App da Hostinger.

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
