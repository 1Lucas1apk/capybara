import { 
    SlashCommandBuilder, 
    EmbedBuilder 
} from 'discord.js';
import path from 'path';

const packageJson = require(path.join("../../../package.json"));

function formatUptime(seconds) {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${d}d ${h}h ${m}m ${s}s`;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('botinfo')
        .setDescription('Exibe informações gerais do bot'),
    async run(interaction) {
        const nodeVersion = process.version;
        const discordVersion = require('discord.js').version;
        const memoryUsage = process.memoryUsage();
        const heapUsedMB = (memoryUsage.heapUsed / 1024 / 1024).toFixed(2);
        const rssMB = (memoryUsage.rss / 1024 / 1024).toFixed(2);
        const uptime = formatUptime(process.uptime());

        const allConfigs = interaction.client.database.get("configs") || {};
        let globalUserSet = new Set();
        Object.values(allConfigs).forEach(config => {
            if ((config as any).users) {
                Object.keys((config as any).users).forEach(user => {
                    globalUserSet.add(user);
                });
            }
        });
        const globalUserCount = globalUserSet.size;

        const serverCount = interaction.client.guilds.cache.size;

        const commandCount = interaction.client.commands ? interaction.client.commands.size : "N/A";

        const dependencies = packageJson.dependencies;
        const dependenciesList = Object.entries(dependencies)
            .map(([dep, version]) => `${dep}: ${version}`)
            .join('\n');

        const embed = new EmbedBuilder()
            .setTitle("🤖 Bot Info Geral")
            .setDescription("Confira informações detalhadas sobre o bot.")
            .addFields(
                { name: "👑 Criador", value: "1Lucas1apk (Lucas Morais Rodrigues)", inline: true },
                { name: "🔖 Versão do Bot", value: packageJson.version || "N/A", inline: true },
                { name: "🟢 Node.js", value: nodeVersion, inline: true },
                { name: "📦 discord.js", value: discordVersion, inline: true },
                { name: "🧠 Memória (Heap)", value: `${heapUsedMB} MB`, inline: true },
                { name: "🔍 Memória (RSS)", value: `${rssMB} MB`, inline: true },
                { name: "⏱️ Uptime", value: uptime, inline: true },
                { name: "🗄️ Servidores", value: `${serverCount}`, inline: true },
                { name: "💬 Comandos", value: `${commandCount}`, inline: true },
                { name: "🎧 Ouvindo Perfis Globais", value: `${globalUserCount}`, inline: true },
                { name: "📚 Dependências", value: `\`\`\`\n${dependenciesList}\n\`\`\`` }
            )
            .setColor("#684f3f")
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
};
