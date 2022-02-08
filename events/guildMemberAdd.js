const color = require('colors/safe');

module.exports = (client, member) => {
	console.log(`${member.user.tag} joined ${member.guild.name}`);

	if (member.id == '891026295448805396') {
		const r = 'Racist, homophobic and overall an idiotic horrible person';
		member.ban({ reason: r }).then(
			member.guild.channels.fetch('544711586854731776').then((c) => {
				c.send(`${member} banned for: ${r}`);
			}),
		);
	}
};
