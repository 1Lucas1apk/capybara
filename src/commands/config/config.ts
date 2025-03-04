import { 
    EmbedBuilder, 
    SlashCommandBuilder, 
    PermissionsBitField, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle 
} from 'discord.js';
import { config } from 'dotenv';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('config')
        .setDescription('Configurações do bot')
        .addSubcommand(subcommand =>
            subcommand
                .setName('channel')
                .setDescription('📺 Configurar o canal para enviar notícias. Ex: /config channel #noticias')
                .addChannelOption(option =>
                    option
                        .setName('channel')
                        .setDescription('Selecione o canal de notícias')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('role')
                .setDescription('📣 Configurar o cargo para menção de notícias. Ex: /config role @Notícias')
                .addRoleOption(option =>
                    option
                        .setName('role')
                        .setDescription('Selecione o cargo para menção')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("reset")
                .setDescription("🔄 Resetar a configuração. Ex: /config reset")
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("panel")
                .setDescription("📝 Ver a configuração atual.")
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("test")
                .setDescription("🚀 Testar a configuração atual")
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("adduser")
                .setDescription("👤 Adicionar um usuário para receber atualizações. Ex: /config adduser username")
                .addStringOption(option =>
                    option
                        .setName("username")
                        .setDescription("Informe o username do usuário")
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("removeuser")
                .setDescription("👤 Remover um usuário da lista de atualizações. Ex: /config removeuser username")
                .addStringOption(option =>
                    option
                        .setName("username")
                        .setDescription("Informe o username do usuário")
                        .setRequired(true)
                )
        ),
    async run(interaction) {
        if (!interaction.isCommand()) return;
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            return interaction.reply("🚫 **Você não tem permissão para executar este comando. Uso restrito a managers.**");
        }

        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guildId;
        let guildConfig = interaction.client.database.get(`configs.${guildId}`) || {};

        if (subcommand === "channel") {
            const channel = interaction.options.getChannel("channel");
            if (channel.type !== 0 && channel.type !== 5) {
                return interaction.reply("❌ **Canal inválido!** Apenas canais de texto ou notícias são permitidos.");
            }
            if ("nsfw" in channel && channel.nsfw) {
                return interaction.reply("🚫 **Canal NSFW não é permitido para notícias.**");
            }
            if (!interaction.guild.members.me.permissionsIn(channel).has(PermissionsBitField.Flags.SendMessages)) {
                return interaction.reply("⚠️ **Eu não tenho permissão para enviar mensagens nesse canal.**");
            }

            const channelId = channel.id;
            if (guildConfig.channel && guildConfig.channel.includes(channelId)) {
                return interaction.reply("ℹ️ **Este canal já está configurado para receber notícias.**");
            }

            guildConfig.channel = guildConfig.channel ? [...guildConfig.channel, channelId] : [channelId];
            interaction.client.database.set(`configs.${guildId}`, guildConfig);
            return interaction.reply(`✅ **Canal de notícias configurado para <#${channelId}>.**\nDica: Para adicionar mais canais, utilize o comando novamente.`);
        }

        if (subcommand === "role") {
            const role = interaction.options.getRole("role");
            if (!role) return interaction.reply("❌ **Cargo não encontrado.**");
            const roleId = role.id;

            if (roleId === interaction.guild.id) {
                return interaction.reply("🚫 **Você não pode selecionar o cargo @everyone.**");
            }
            if (role.managed) {
                return interaction.reply("🚫 **Você não pode selecionar um cargo gerenciado por uma integração.**");
            }
            if (role.position >= interaction.member.roles.highest.position) {
                return interaction.reply("🚫 **Você não pode selecionar um cargo que esteja acima ou igual ao seu cargo mais alto.**");
            }
            const botMember = interaction.guild.members.me;
            if (role.position >= botMember.roles.highest.position) {
                return interaction.reply("🚫 **Eu não posso configurar esse cargo, pois ele está acima do meu cargo mais alto.**");
            }
            if (!interaction.guild.roles.cache.has(roleId)) {
                return interaction.reply("❌ **Cargo não encontrado no servidor.**");
            }

            guildConfig.role = roleId;
            interaction.client.database.set(`configs.${guildId}`, guildConfig);
            return interaction.reply(`✅ **Cargo de notícias configurado para <@&${roleId}>.**`);
        }

        if (subcommand === "reset") {
            if (!guildConfig || Object.keys(guildConfig).length === 0) {
                return interaction.reply("ℹ️ **Nenhuma configuração encontrada para resetar.**\nDica: Utilize os comandos de 'channel' e 'role' para configurar novamente.");
            }
            interaction.client.database.delete(`configs.${guildId}`);
            return interaction.reply("🔄 **Configuração resetada com sucesso.**\nDica: Configure novamente usando os comandos /config channel e /config role.");
        }

        if (subcommand === "panel") {
            let usernames = guildConfig.listen
            let userCount = usernames.length

            const embed = new EmbedBuilder()
                .setTitle("🔧 Configurações do Bot")
                .setDescription("Confira as configurações atuais do bot e veja as dicas de uso:")
                .addFields([
                    { 
                        name: "📺 Canais", 
                        value: guildConfig.channel && guildConfig.channel.length 
                            ? guildConfig.channel.map((id) => `<#${id}>`).join(", ") 
                            : "Nenhum canal configurado", 
                        inline: false 
                    },
                    { 
                        name: "📣 Cargo", 
                        value: guildConfig.role 
                            ? `<@&${guildConfig.role}>` 
                            : "Nenhum cargo configurado", 
                        inline: false 
                    },
                    {
                        name: "👤 Usuários",
                        value: `**${userCount}** usuários cadastrados para receber atualizações: \´${usernames.join(", ")}\´`,
                        inline: false
                    },
                    { 
                        name: "💡 Dica", 
                        value: "Utilize `/config test` para enviar uma mensagem de teste e confirmar as configurações.", 
                        inline: false 
                    },
                ])
                .setColor("#684f3f")
                .setTimestamp();

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('resetConfig')
                        .setLabel('Resetar Configuração')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('testConfig')
                        .setLabel('Testar Configuração')
                        .setStyle(ButtonStyle.Primary)
                );

            return interaction.reply({ embeds: [embed], components: [row] });
        }

        if (subcommand === "test") {
            if (!guildConfig.channel) {
                return interaction.reply("⚠️ **Configuração incompleta.** Configure o canal e, se desejar, o cargo antes de enviar um teste.\nDica: Use `/config channel` para definir um canal.");
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

                await interaction.client.sendNewsToGuild({
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
                return interaction.reply("✅ **Teste enviado com sucesso.**\nDica: Verifique o canal configurado para conferir a mensagem.");
            } catch (error) {
                console.error("Erro ao enviar teste:", error);
                return interaction.reply("❌ **Ocorreu um erro ao enviar o teste.**\nDica: Verifique os logs e as permissões do canal.");
            }
        }

        if (subcommand === "adduser") {
            const username = interaction.options.getString("username");
            if (!username) return interaction.reply("❌ **Username inválido.**\nDica: Informe corretamente o username do usuário.");
            
            let profiles = interaction.client.database.get(`configs.${guildId}.listen`) || [];
            if (profiles.includes(username)) {
                return interaction.reply("ℹ️ **Este usuário já está cadastrado para receber atualizações.**");
            }
            
            profiles.push(username)
            interaction.client.database.set(`configs.${guildId}.listen`, profiles);
            return interaction.reply(`✅ **Usuário ${username} adicionado com sucesso.**\nDica: Utilize esse comando para acompanhar as atualizações do usuário.`);
        }
        if (subcommand === "removeuser") {
            const username = interaction.options.getString("username");
            if (!username) return interaction.reply("❌ **Username inválido.**\nDica: Informe corretamente o username do usuário.");
            
            let profiles = interaction.client.database.get(`configs.${guildId}.listen`) || [];
            if (!profiles.includes(profiles)) {
                return interaction.reply("ℹ️ **Este usuário não está cadastrado para receber atualizações.**");
            }

            profiles = profiles.filter(profile => profile !== username) || [];
            interaction.client.database.set(`configs.${guildId}.listen`, profiles);
            return interaction.reply(`✅ **Usuário ${username} removido com sucesso.**\nDica: Utilize esse comando para acompanhar as atualizações do usuário.`);
        }
    }
};
