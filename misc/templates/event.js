const color = require('colors/safe');

module.exports = (client, interaction) => {
	interaction.reply('done').catch((e) => console.log(color.red(e)));
	return;
};
