module.exports = {
	cleanInput: function (input) {
		return input.replace('@everyone', '@\u200beveryone');
	},
};
