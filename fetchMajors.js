const axios = require('axios');
const cheerio = require('cheerio');
const url = 'https://registrar.ucsc.edu/enrollment/majors-list.html';
const config = require('./config.json');
const Sequelize = require('sequelize');

const db = new Sequelize('sqlite', config.dbUser, config.dbPass, {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});

db.majors = db.define('Major', {
	major: {
		type: Sequelize.STRING,
		unique: true,
	},
	code: Sequelize.STRING,
});

db.majors.sync({ force: true });

axios
	.get(url)
	.then((response) => {
		getData(response.data);
	})
	.catch(console.error);

const getData = (html) => {
	const data = [];
	const $ = cheerio.load(html);

	$(`table tbody tr`).each((i, ele) => {
		data.push({
			major: {
				m: $(ele)
					.children('td:nth-child(1)')
					.text()
					.replaceAll('\n', '')
					.replaceAll(/ B\..\.+/g, ''),
				c: $(ele)
					.children('td:nth-child(2)')
					.text()
					.replaceAll('\n', '')
					.replace(/B.$/, ''),
			},
		});
	});

	data.forEach((element, i) => {
		if (element.major.m == '' || element.major.m == 'Combined Majors') {
			data.splice(i, 1);
		}
		if (element.major.c == '') {
			data.splice(i, 1);
		}
	});

	data.forEach((element, i) => {
		console.log(`'${element.major.m}' - '${element.major.c}' - ${i}`);
		try {
			db.majors
				.create({
					major: element.major.m,
					code: element.major.c,
				})
				.catch((e) =>
					console.log(`${element.major.m} - ${element.major.c} - ${e.name}`),
				);
		} catch (e) {
			console.log(e.name);
		}
	});
};
