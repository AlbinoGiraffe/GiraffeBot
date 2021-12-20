const ud = require('urban-dictionary');

function urban(message) {
	ud.define(message.content.replace(`${prefix}ud `, ''))
		.then((results) => {
			message.channel.send(
				`${results[0].word}: ${results[0].definition}\nExample: ${results[0].example}`,
			);
		})
		.catch((error) => {
			console.error(`define (promise) - error ${error.message}`);
		});
}

module.exports = {
	name: 'ud',
	execute(message) {
		urban(message).catch(console.error);
	},
};
