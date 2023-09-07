const Cleverbot = require('./clev.js');
const config = require('../config.json');
const key = config.cbKey;

const clev = Cleverbot.init(key);

async function main() {
	let csStr =
		'MXYxCTh2MQlBdldZQzFYTE9BRTUJMUZ2MTY5NDEyNDI0NQk2NHZoaS4JNjRpSG93IGFyZSB5b3UgdGhpcyBmaW5lIGRheT8J';

	// if (csStr !== undefined) {
	// } else {
	// }
	const r = await Cleverbot.query(clev, 'hi', csStr);
	console.log(r.cs);
}

main().catch();

// clev.then((c) => {
// 	c.query('hi')
// 		.then((r) => {
// 			console.log(r.output);
// 		})
// 		.catch((e) => console.log(e));
// });
