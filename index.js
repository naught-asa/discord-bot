const { Client, GatewayIntentBits, Collection } = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");

const client = new Client({
	intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();

// コマンド読み込み
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		client.commands.set(command.data.name, command);
	}
}

client.on("ready", () => {
	console.log(`${client.user.tag} でログインしています。`);
});

// ここが重要
client.on("interactionCreate", async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);
	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: "エラーが発生しました", ephemeral: true });
	}
});

// デバッグ用
console.log("GITHUB EDIT CHECK");
console.log("TOKEN =", process.env.TOKEN);

// ログイン
client.login(process.env.TOKEN);
