const axios = require('axios');
const cheerio = require('cheerio');
const url = 'https://registrar.ucsc.edu/enrollment/majors-list.html';

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
				m: $(ele).children('td:nth-child(1)').text().replaceAll('\n', ''),
				c: $(ele).children('td:nth-child(2)').text().replaceAll('\n', ''),
			},
		});
	});

	data.forEach((element, i) => {
		if (element.major.m == '' || element.major.c == '') {
			data.splice(i, 1);
		}
	});

	data.forEach((element, i) => {
		console.log(`'${element.major.m}' - '${element.major.c}' - ${i}`);
	});
};
