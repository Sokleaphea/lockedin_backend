const axios = require('axios');

const options = {
  method: 'GET',
  url: 'https://project-gutenberg-free-books-api1.p.rapidapi.com/subjects',
  headers: {
    'x-rapidapi-key': process.env.RAPIDAPI_KEY,
    'x-rapidapi-host': process.env.RAPIDAPI_HOST
  }
};

async function fetchData() {
	try {
		const response = await axios.request(options);
		console.log(response.data);
	} catch (error) {
		console.error(error);
	}
}

fetchData();