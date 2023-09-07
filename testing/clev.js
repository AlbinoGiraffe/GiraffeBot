module.exports = {
	init: async function (apikey) {
		console.log('Init Cleverbot API Wrapper');
		const Cleverbot = (await import('@faurinfox/cleverbot')).default;
		return new Cleverbot({ key: apikey });
	},
	query: async function (clev, input, csStr) {
		if (clev === undefined) {
			console.log('Cleverbot unavailable!');
			return;
		}

		const r = await clev.then((c) => c);
		if (csStr !== undefined) {
			return await r.query(input, { cs: csStr });
		} else {
			return await r.query(input);
		}

		// clev.then((c) => {
		// 	c.query(input)
		// 		.then((r) => {
		// 			console.log(r.output);
		// 			return r;
		// 		})
		// 		.catch((e) => console.log(e));
		// });
	},

	// // Hardcoded input just because this is an example
	// const inputMsg = 'Hi there!';
	// // Use this variable to keep track of cs, in order to carry on a conversation
	// let csStr = undefined;
	// // If using within a function, that function should be a async one
	// async function example() {
	// 	// Check if csStr is undefined or not
	// 	if (csStr !== undefined) {
	// 		// It is not, so continue and pass it to the query
	// 		// This is also demonstrating how to use this with async function and await
	// 		try {
	// 			// As of v1.1.0, the same object we use to pass cs(Str), can also be
	// 			// used to set Cleverbot tweaks you wish to use.
	// 			// Below is an example of doing just that:
	// 			/*
	// 				let CbTweaks = {wackiness: 70, talkativeness: 50, attentiveness: 50};
	// 				let reply = await CB.query(inputMsg, {cs: csStr, ...CbTweaks});
	// 				*/
	// 			// However, as of v1.2.0, the function approach is preferred.
	// 			// while the object approach introduced in v1.1.0
	// 			// is still supported, it is now discouraged as the new function one is preferred.
	// 			CB.setTweak('wackiness', 70);
	// 			CB.setTweak('talkativeness', 90);
	// 			CB.setTweak('attentiveness', 90);
	// 			// Alternatively, there is also
	// 			// CB.setWackiness(70). Both do the same thing. Similar functions also exist for the other two tweaks.
	// 			let reply = await CB.query(inputMsg, { cs: csStr });
	// 			// CB.query used above will return a JSON with the reply received from Cleverbot API, as well as an added 'URL' property should you need to know the URL that was called to receive that response
	// 			// We do not need the entire JSON, only the reply, thus use .output
	// 			console.log('Reply: ' + reply.output);
	// 			// If you need the URL that was called, you would get it as such:
	// 			// console.log(reply.URL);
	// 		} catch (error) {
	// 			// We'll just log the error if one happens
	// 			console.error(error);
	// 		}
	// 	} else if (csStr === undefined) {
	// 		// csStr is undefined, therefore we don't have conversation to continue
	// 		// This part is essentially the same as async/await above, but using a then() instead. As such, i will not comment it specifically.
	// 		CB.query(inputMsg)
	// 			.then(function (response) {
	// 				console.log(response.output);
	// 				// console.log(response.URL);
	// 				csStr = response.cs;
	// 				// We run the function again here so that the change to csStr is registered, and the first if statement can therefore run. Again, this is for demonstration purposes.
	// 				example();
	// 			})
	// 			.catch((e) => {
	// 				console.error(e);
	// 			});
	// 	}
	// }
	// example();
};
