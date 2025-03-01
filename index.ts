require("dotenv").config();
const { join } = require("path");
const { readdirSync } = require("fs");
const { ClientBase } = require("./src/structures/ClientBase");
const { PermissionsBitField } = require("discord.js");
const { tabnews } = require("./src/services/tabnews");
const client = new ClientBase();

readdirSync(join(__dirname, "src/commands")).forEach((dir) => {
    const commands = readdirSync(join(__dirname, "src/commands", dir))
        .filter((file) => file.endsWith(".js") || file.endsWith(".ts"));

    for (const file of commands) {
        const command = require(join(__dirname, "src/commands", dir, file));
        console.log(`Carregado comando: ${command.data.name} de ${file}`);
        client.commands.set(command.data.name, command);
    }

    console.log(`Loaded ${commands.length} commands from ${dir}`);
});

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
    client.registerCommands();

    client.user.setPresence({ activities: [{ name: '🦦 Esperando atualizações' }] });

    client.listenTabNews();
});

client.on("interactionCreate", async (interaction) => {
    if (interaction.isCommand()) {

        const command = client.commands.get(interaction.commandName);
        if (!command) return;

         try {
            await command.run(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
        }
    } else if(interaction.isButton()) {
        const guildId = interaction.guildId;
        const client = interaction.client;
        let guildConfig = client.database.get(`configs.${guildId}`);

        if (interaction.customId === 'resetConfig') {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
                return interaction.reply({ content: "⚠️ **Você não tem permissão para resetar a configuração.**", ephemeral: true });
            }

            if (!guildConfig || Object.keys(guildConfig).length === 0) {
                return interaction.reply({ content: "ℹ️ **Nenhuma configuração encontrada para resetar.**", ephemeral: true });
            }
            client.database.delete(`configs.${guildId}`);
            return interaction.reply({ content: "🔄 **Configuração resetada com sucesso.**", ephemeral: true });
        }

        if (interaction.customId === 'testConfig') {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
                return interaction.reply({ content: "⚠️ **Você não tem permissão para resetar a configuração.**", ephemeral: true });
            }

            if (!guildConfig || !guildConfig.channel) {
                return interaction.reply({ content: "⚠️ **Configuração incompleta.** Configure o canal e, se desejar, o cargo antes de enviar um teste.", ephemeral: true });
            }
            try {
                const description = 
                    "🐱 **Gatos Domésticos - Felis catus** 🐱\n\n" +
                    "Os gatos são mamíferos carnívoros conhecidos por sua **agilidade, independência e comportamento enigmático**.\n" +
                    "Com corpos flexíveis e **garras retráteis**, são excelentes caçadores e escaladores. 🐾\n" +
                    "Domésticados há cerca de **10 mil anos**, ajudaram no controle de roedores. \n\n" +
                    "Apesar de independentes, formam **fortes vínculos afetivos** com seus tutores,\n" +
                    "demonstrando carinho com **ronronares e \"amassar pãozinho\"**. 💕\n" +
                    "Costumam dormir de **12 a 16 horas por dia**. 😴\n\n" +
                    "Essas características tornam os gatos **companheiros ideais para a vida moderna!** 🏡✨";

                await client.sendNewsToChannelByGuild({
                    title: "Felis catus",
                    content: description,
                    url: "https://google.com",
                    image: "https://inaturalist-open-data.s3.amazonaws.com/photos/129658776/original.jpg",
                    published_time: new Date(),
                    type: "article",
                    modifier_time: new Date(),
                    source_url: "https://google.com",
                    author: "Bot",
                }, guildConfig.channel, guildConfig.role);
                return interaction.reply({ content: "✅ **Teste enviado com sucesso.**", ephemeral: true });
            } catch (error) {
                console.error("Erro ao enviar teste via botão:", error);
                return interaction.reply({ content: "❌ **Ocorreu um erro ao enviar o teste.**", ephemeral: true });
            }
        }
    }
});

client.on("messageCreate", (message) => {
    if (message.author.bot) return;
    if (message.content.startsWith(`<@!${client.user.id}>`) || message.content.startsWith(`<@${client.user.id}>`)) {
        message.reply("Olá! Não tenho um nome definido, mas você pode me chamar de bot capybara! 🦦") 
    }
})

client.login(process.env.TOKEN);
