import { 
    Client,
    GatewayIntentBits,
    REST, Routes,
    ClientUser,
    EmbedBuilder,
    ButtonBuilder, ButtonStyle, ActionRowBuilder
} from "discord.js";
import { Database } from "../utils/database";
import { tabnews } from "../services/tabnews";

export class ClientBase extends Client {
    commands: Map<string, any>;
    database: Database;

    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
            ]
        });

        this.commands = new Map();
        this.database = new Database();
    }

    async registerCommands() {
        const rest = new REST().setToken(process.env.TOKEN as string);
        const commands = [...this.commands.values()].map((command) => command.data.toJSON());

        await rest.put(
            Routes.applicationCommands((this.user as ClientUser).id),
            { body: commands },
        );

        console.log("loaded global commands");    
    }

    listenTabNews() {
        tabnews(this.database, (content) => {
            this.distributeNews(content);
        });
    }

    distributeNews(content) {
        const configs: any = this.database.get("configs");
        if (!configs) return;
        for (const guildId of Object.keys(configs)) {
            const guildConfig = configs[guildId];
            if (!guildConfig.listen.includes(content.author)) continue;

            const guild = this.guilds.cache.get(guildId);
            if (!guild) continue;

            const channelIds = guildConfig.channel;
            if (!channelIds) continue;

            const roleId = guildConfig.role || null;

            this.sendNewsToGuild(content, channelIds, roleId);
        }
    }
    
    sendNewsToGuild(content, channelIds, roleId) {
        for (const channelId of channelIds) {
            const channel: any = this.channels.cache.get(channelId);
            if (!channel) continue;
            if (channel.type !== 0 && channel.type !== 5) {
                console.log(`Canal inválido (${channel.type})`);
                continue;
            }

            content.url = content.url ?? null;
            const LIMIT = 4093;
            let description = content.content;
            let extraField = null;
            if (description.length > LIMIT) {
                description = description.slice(0, LIMIT) + "...";
                extraField = {
                    name: "Conteúdo Extenso",
                    value: `Acesse o [site](${content.url}) para ver o conteúdo completo.`
                };
            }

            const embed = new EmbedBuilder()
                .setTitle(content.title)
                .setDescription(description)
                .setURL(content.url)
                .setImage(content.image)
                .setTimestamp(content.published_time)
                .setFooter({
                    text: `Por ${content.author}`,
                    iconURL: this.user.displayAvatarURL()
                })
                .setColor("#684f3f");

            if (extraField) {
                embed.addFields([extraField]);
            }

            const redirectUrl = new ButtonBuilder()
                .setLabel("Ver notícia")
                .setStyle(ButtonStyle.Link)
                .setURL(content.url);

            const fonteUrl = new ButtonBuilder()
                .setLabel("Fonte")
                .setStyle(ButtonStyle.Link)
                .setURL(content.source_url ?? content.url);

            const row = new ActionRowBuilder().addComponents(redirectUrl, fonteUrl);

            channel.send({ 
                embeds: [embed],
                components: [row],
                content: `Nova notícia de [${content.author}](https://www.tabnews.com.br/${content.author})! ` + (roleId ? ` <@&${roleId}>` : "")
            });
        }
    }
}
