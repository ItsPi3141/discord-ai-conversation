require("./server.js");

let uniqueId = Math.random().toString(36).slice(2);
let delay = 8000;

function reset() {
	uniqueId = Math.random().toString(36).slice(2);
}

function sendWebhook(url, msg) {
	return new Promise((resolve) => {
		try {
			fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					content: msg,
				}),
			}).then(() => resolve());
		} catch (err) {
			console.log(err);
			resolve();
		}
	});
}

function getAiResponse(user, msg) {
	return new Promise((resolve) => {
		try {
			fetch(process.env.API_ENDPOINT, {
				headers: {
					accept: "text/plain",
					"accept-language": "en-US,en;q=0.9",
					"content-type": "application/json",
				},
				body: JSON.stringify({
					UserId: user,
					ConversationId: `${user}-${uniqueId}`,
					UserInput: msg,
				}),
				method: "POST",
			})
				.then((res) => res.json())
				.then((json) => {
					if (json.message) {
						resolve("...");
						delay = 20000;
						setTimeout(() => {
							delay = 8000;
						}, 60000);
					} else {
						resolve(json.response);
					}
				});
		} catch (err) {
			console.log(err);
			resolve("...");
		}
	});
}

function bot1(reply) {
	getAiResponse(process.env.BOT1_NAME, reply)
		.then((res) => {
			sendWebhook(process.env.BOT1_WEBHOOK, res)
				.then(() => {
					setTimeout(() => {
						bot2(res);
					}, delay);
				})
				.catch((err) => {
					console.log(err);
					bot2("...");
				});
		})
		.catch((err) => {
			console.log(err);
			bot2("...");
		});
}

function bot2(reply) {
	getAiResponse(process.env.BOT2_NAME, reply)
		.then((res) => {
			sendWebhook(process.env.BOT2_WEBHOOK, res)
				.then(() => {
					setTimeout(() => {
						bot1(res);
					}, delay);
				})
				.catch((err) => {
					console.log(err);
					bot1("...");
				});
		})
		.catch((err) => {
			console.log(err);
			bot1("...");
		});
}

bot1("hello");

module.exports = {
	reset,
};
