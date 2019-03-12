const rp = require('request-promise-native');
const fs = require('fs');
const uri = 'https://swapi.co/api/people';
const uriForPageCount = `https://swapi.co/api/people`;
const isResultAJsonOjbect = true;
const todo = require('yargs');
const pathToFile = `request1`;
const got = require('got');

const createAndWriteFile = (path, contents) => {
  if (!fs.existsSync(`./Data/${path}.json`)) {
    console.log(`file ${path} does not exist. Created new file with same name`);
  }
  fs.writeFileSync(`./Data/${path}.json`, JSON.stringify(contents, null, '\t'), 'utf8');
};

// got returns a promise itself
const getPage = async (uri) => {
  return new Promise(resolve => {
    resolve(got(uri, {
      json: true
    }));
  });
};

const getPeopleCount = async (uri) => {
  const result = await getPage(uri);
  return result.body.count++;
};

// eslint-disable-next-line no-unused-expressions
todo.command('Request', 'https://swapi.co/api/people/ ', function (yargs) {
  return yargs.options({});
},
async function (argv) {
  const peopleCount = await getPeopleCount(uriForPageCount);
  const results = await processTheResults(peopleCount);
  createAndWriteFile('request3', results);
}).help()
  .demandCommand(1, 'You need at least one command before moving on')
  .argv;

const sortParams = function (consoleArgs) {
  const searchParams = {
    name: consoleArgs.name,
    birth_year: consoleArgs.birth_year,
    eye_color: consoleArgs.eye_color,
    gender: consoleArgs.species,
    hair_color: consoleArgs.type,
    height: consoleArgs.gender,
    mass: consoleArgs.origin,
    skin_color: consoleArgs.location
  };

  Object.keys(searchParams
  ).forEach(key => {
    if (typeof searchParams[key] === 'undefined') {
      delete searchParams[key];
    }
  });
  return searchParams;
};

const fetchPeopleBase = async (requestResults) => {
  const newArray = [];
  requestResults.forEach((singleRequestResult, requestIndex) => {
    newArray[requestIndex] = singleRequestResult.body;
  });
  return newArray;
};

const addObeseProperty = async (requestResults) => {
  requestResults.forEach((singleRequestResult, requestIndex) => {
    if (singleRequestResult.mass === 'unknown' || singleRequestResult.height === 'unknown') {
      singleRequestResult.obese = 'unknown';
    } else {
      singleRequestResult.obese = (singleRequestResult.mass / Math.pow((singleRequestResult.height / 10), 2) >= 25);
    }
  });
  return requestResults;
};

const processTheResults = async function (pageCount) {
  const arrayOfPromises = [];
  let pageNumberCounter = 1;
  while (pageNumberCounter <= pageCount) {
    if (pageNumberCounter === 17) {
      pageNumberCounter++;
      continue;
    } else {
      await arrayOfPromises.push(getPage(`${uri}/${pageNumberCounter}/`));
      pageNumberCounter++;
    }
  }
  const results = await Promise.all(await arrayOfPromises);
  const reqResultBodies = await fetchPeopleBase(results);
  const resultsWithNewProperty = addObeseProperty(reqResultBodies);
  return resultsWithNewProperty;
};

module.exports = {
  processTheResults,
  getPage,
  sortParams
};
