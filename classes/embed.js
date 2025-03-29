const { EmbedBuilder } = require("discord.js");


class Embed extends EmbedBuilder {
    constructor(data) {
        super(data);
        this.setFooter({ text: "Coded by ThanhZ"})
    }
}

module.exports = { Embed }