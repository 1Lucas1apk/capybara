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
            this.sendNewsToChannel(content);
        });
    }

    sendNewsToChannel(content) {
        const guilds: any = this.database.get("configs")
        if (!guilds) return;

        for (const guildId of Object.keys(guilds)) {
            const guild = this.guilds.cache.get(guildId);
            if (!guild) continue;

            let channelIds = guilds[guildId].channel;
            if (!channelIds) continue;

            let roleId = guilds[guildId].role;
            if (!roleId) roleId = null;

            this.sendNewsToChannelByGuild(content, channelIds, roleId);
        }
    }
    
    sendNewsToChannelByGuild(content, channelIds, roleId) {
        console.log(channelIds)
        for (const channelId of channelIds) {
            const channel: any = this.channels.cache.get(channelId);
            if (!channel) continue;
            if (channel.type !== 0 && channel.type !== 5) {
                console.log("Canal não é de texto ou notícias: " + channel.type);
                continue;
            } 
            
            content.url == undefined ? content.url = null : content.url;

            const embed = new EmbedBuilder()
                .setTitle(content.title)
                .setDescription(content.content)
                .setURL(content.url)
                .setImage(content.image)
                .setTimestamp(content.published_time)
                .setFooter({
                    text: `Por ${content.author}`,
                    iconURL: this.user.displayAvatarURL()
                })
                .setColor("#684f3f");

            const redirectUrl = new ButtonBuilder()
                .setLabel("Ver notícia")
                .setStyle(ButtonStyle.Link)
                .setURL(content.url);
            
            const fonteUrl = new ButtonBuilder()
                .setLabel("Fonte")
                .setStyle(ButtonStyle.Link)
                .setURL(content.source_url ?? content.url);
            
            const row =  new ActionRowBuilder()
                .addComponents(redirectUrl, fonteUrl);

            channel.send({ 
                embeds: [embed],
                components: [row],
                content: `Nova notícia de ${content.author} no ar! ` + (roleId ? ` <@&${roleId}>` : "")
             });
        }
    }  
}