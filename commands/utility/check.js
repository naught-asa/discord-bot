const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const data = require('../../data.js');

// JSONパス
const filePath = path.join(__dirname, '../../lastCheck.json');

// 読み込み
function loadData() {
	if (!fs.existsSync(filePath)) return {};
	return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

// 保存
function saveData(json) {
	fs.writeFileSync(filePath, JSON.stringify(json, null, 2));
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('check')
		.setDescription('構造物の寿命を確認します')
		.addStringOption(option =>
			option.setName('code')
				.setDescription('例: CEN / ISL / VAL / ALL')
				.setRequired(true)
		),

	async execute(interaction) {
		const code = interaction.options.getString('code').toUpperCase();
		const now = new Date();

		const format = (date) =>
			date.toLocaleDateString('ja-JP', { timeZone: 'Asia/Tokyo' });

		// JSON読み込み
		const lastCheck = loadData();

		// =====================
		// 🔥 ALL（更新なし）
		// =====================
		if (code === 'ALL') {
			let message = `📅Day : ${format(now)}\n\n`;

			for (const map in data) {
				const limitDays = data[map];
				const last = lastCheck[map];

				if (!limitDays) {
					message += `🗺${map} : 未設定\n\n`;
					continue;
				}

				if (!last) {
					message += `🗺${map} : 未記録\n\n`;
					continue;
				}

				const expire = new Date(last);
				expire.setDate(expire.getDate() + limitDays);

				message +=
					`🗺${map}\n` +
					`⏳ ${format(expire)}\n\n`;
			}

			return interaction.reply(message);
		}

		// =====================
		// 🔥 個別MAP（更新あり）
		// =====================
		const limitDays = data[code];

		if (!limitDays) {
			return interaction.reply(`❌ ${code} は未設定です`);
		}

		// 👉 保存（ISO文字列）
		lastCheck[code] = now.toISOString();
		saveData(lastCheck);

		const expire = new Date(now);
		expire.setDate(expire.getDate() + limitDays);

		return interaction.reply(
			`📅Day : ${format(now)}\n` +
			`🗺Map : ${code}\n` +
			`📅Limit : ${limitDays}日\n` +
			`⏳Decay : ${format(expire)}`
		);
	},
};
