const { Client, Events, GatewayIntentBits } = require("discord.js");
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Listen for the 'ready' event to know when the bot has successfully connected
client.once(Events.ClientReady, c => {
	console.log(`Discord bot ready! Logged in as ${c.user.tag}`);
    //sendOnlineMessage();
});

/*const sendOnlineMessage = async () => {
    client.guilds.cache.forEach((guild) => {
        const channel = guild.channels.cache.find((channel) => channel.name === "home");
        if (channel) {
            channel.send(`I'm alive yo!`);
        }
    });
};*/

client.sendMessage = async (channelId, message) => {
    const channel = client.channels.cache.find((channel) => channel.id === channelId);

    if (channel) {
        channel.send(message);
    }
};


client.login(process.env.DISCORD_BOT_TOKEN);



module.exports = client;
