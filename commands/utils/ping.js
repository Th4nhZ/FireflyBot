const { SlashCommandBuilder } = require("discord.js");
const { Embed } = require("../../classes/embed.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with Pong!"),
    async execute(interaction) {
        const embed = new Embed()
            .setTitle("Pong!")
            .setDescription("Bot latency: " + interaction.client.ws.ping + "ms")
        await interaction.reply({ embeds: [embed] });
    }
}