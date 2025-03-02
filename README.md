# Bot do Discord - Gerenciador de Notícias

Este é um bot para Discord desenvolvido com [discord.js](https://discord.js.org/) que permite gerenciar configurações de notícias no servidor. As notícias são obtidas do site [Tabnews](https://tabnews.com.br/), e os administradores podem configurar canais e cargos específicos para o envio dessas notícias, além de outras funcionalidades úteis.

## Funcionalidades

- **Configurar Canal de Notícias**: Defina um ou mais canais onde as notícias serão enviadas.
- **Configurar Cargo para Menção**: Especifique um cargo que será mencionado nas notícias enviadas.
- **Resetar Configurações**: Restaure as configurações do bot para os padrões iniciais.
- **Visualizar Configurações Atuais**: Exiba as configurações atuais do bot no servidor.
- **Testar Configuração Atual**: Envie uma notícia de teste para verificar as configurações.
- **Adicionar Usuário para Atualizações**: Adicione usuários específicos para receber atualizações de postagens.
- **Remover Usuário das Atualizações**: Remove um usuário das atualizações de postagens.
- **Listar Usuários Seguidos**: Exibe a lista de usuários cujas postagens são monitoradas.

## Adicionar o Bot ao Seu Servidor

Para adicionar o bot ao seu servidor do Discord, utilize o seguinte link:

[Adicionar Bot ao Servidor](https://discord.com/oauth2/authorize?client_id=1345417218514751598)

## Comandos Disponíveis

1. **/config channel**
   - *Descrição*: Configura o canal para envio de notícias.
   - *Uso*: `/config channel` e selecione o canal desejado.

2. **/config role**
   - *Descrição*: Configura o cargo que será mencionado nas notícias.
   - *Uso*: `/config role` e selecione o cargo desejado.

3. **/config reset**
   - *Descrição*: Reseta todas as configurações do bot.
   - *Uso*: `/config reset`

4. **/config panel**
   - *Descrição*: Exibe as configurações atuais do bot.
   - *Uso*: `/config panel`

5. **/config test**
   - *Descrição*: Envia uma notícia de teste para os canais configurados.
   - *Uso*: `/config test`

6. **/config adduser**
   - *Descrição*: Adiciona um usuário para receber atualizações das postagens dele.
   - *Uso*: `/config adduser` e forneça o nome de usuário desejado.

7. **/config removeuser**
   - *Descrição*: Remove um usuário das atualizações de postagens.
   - *Uso*: `/config removeuser` e forneça o nome de usuário desejado.

## Pré-requisitos

- Node.js versão 22 ou superior.
- Pacote [ts-node](https://typestrong.org/ts-node/) instalado globalmente ou como dependência de desenvolvimento.
- Pacote [discord.js](https://discord.js.org/) instalado.

## Instalação

1. Clone este repositório:

   ```bash
   git clone (https://github.com/1Lucas1apk/capybara.git
   ```

2. Navegue até o diretório do projeto:

   ```bash
   cd capybara
   ```

3. Instale as dependências:

   ```bash
   npm install
   ```

4. Configure o arquivo `.env` com o token do seu bot:

   ```
   TOKEN=seu_token_aqui
   ```

5. Inicie o bot utilizando `ts-node`:

   ```bash
   ts-node src/index.ts
   ```

   *Nota*: Certifique-se de que o arquivo de entrada do seu projeto está corretamente especificado no comando acima.


Ao clicar no link, você será redirecionado para a página de autorização do Discord. Siga os passos abaixo:

1. **Selecione um Servidor**: Escolha o servidor ao qual deseja adicionar o bot.
2. **Defina as Permissões**: Revise e ajuste as permissões que o bot terá no servidor.
3. **Autorize o Bot**: Clique em "Autorizar" para concluir o processo.

Para mais detalhes sobre como adicionar bots ao Discord, consulte este guia.

## Licença

Este projeto está licenciado sob a Apache License 2.0. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## Agradecimentos

As notícias são obtidas do site [Tabnews](https://tabnews.com.br/).

