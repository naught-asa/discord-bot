const { SlashCommandBuilder } = require('discord.js');
const data = require('../../data.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('check')
		.setDescription('構造物の寿命を確認します')
		.addStringOption(option =>
			option.setName('code')
				.setDescription('例: CEN / ISL / VAL')
				.setRequired(true)
		),

	async execute(interaction) {
		const code = interaction.options.getString('code').toUpperCase();

		const limitDays = data[code];

		if (!limitDays) {
			return interaction.reply(`❌ ${code} は未登録です`);
		}

		const now = new Date();
		const expire = new Date(now);
		expire.setDate(now.getDate() + limitDays);

		return interaction.reply(
		  `📅Day : ${now.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}\n` +
		  `📅Limit : ${limitDays}日\n` +
		  `🗺Map : ${code}\n` +
		  `⏳Auto : ${expire.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}`
		);
	},
};
