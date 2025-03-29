const { ActivityType, Client, Collection, Events, GatewayIntentBits, MessageFlags, REST, Routes, version } = require("discord.js");
const { activityName, clientId, token } = require("./config.json")
const fs = require('node:fs');
const path = require('node:path');


class FireflyBot extends Client {
    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildPresences,
            ],
            presence: {
                activities: [{
                    type: ActivityType.Playing,
                    name: activityName
                }]
            }
        })
        this.commands = new Collection();

        this.once(Events.ClientReady, async () => {
            console.log(`Logged in as ${this.user.username}!`);
            console.log(`Nodejs version ${process.version}`);
            console.log(`Discord.js version ${version}`);
        });

        this.on(Events.InteractionCreate, async interaction => {
            if (!interaction.isChatInputCommand()) return;
        
            const command = this.commands.get(interaction.commandName);
        
            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
                } else {
                    await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
                }
            }
        });
    }

    async start() {
        await this.__addCommands()
        await this.__syncCommands()
        this.login(token)
    }

    async __addCommands() {        
        // Grab all the command folders from the commands directory you created earlier
        const foldersPath = path.join(__dirname, 'commands');
        const commandFolders = fs.readdirSync(foldersPath);

        for (const folder of commandFolders) {
            // Grab all the command files from the commands directory you created earlier
            const commandsPath = path.join(foldersPath, folder);
            const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
            // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
            for (const file of commandFiles) {
                const filePath = path.join(commandsPath, file);
                const command = require(filePath);
                if ('data' in command && 'execute' in command) {
                    this.commands.set(command.data.name, command);
                } else {
                    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
                }
            }
        }
    }

    async __syncCommands() {
        const rest = new REST().setToken(token);
        const commands = []
        this.commands.forEach(command => {
            commands.push(command.data.toJSON())    
        });
        try {
            console.log('Started refreshing application (/) commands.');
            await rest.put(
                Routes.applicationCommands(clientId),
                { body: commands },
            );
        } catch (error) {
            console.error(error);
        }
    }
}

module.exports = { FireflyBot };
