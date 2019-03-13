const fs = require('fs');
const uri = 'https://swapi.co/api/people';
const uriForPageCount = `https://swapi.co/api/people`;
const todo = require('yargs');
const pathToFile = `request3`;
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
  return yargs.options({
    'films': {
      alias: 'fl',
      describe: `List of films,in which character is shown`,
      conflicts: 'phone',
      array: false
    },
    'species': {
      alias: 'l',
      describe: `List of species`,
      conflicts: 'phone',
      array: false
    },
    'vehicles': {
      alias: 'l',
      describe: `List of the vehicles, in controling of which the character was involved`,
      conflicts: 'phone',
      array: false
    },
    'starships': {
      alias: 'l',
      describe: `List of starships, in controling of which the character was involved`,
      conflicts: 'phone',
      array: false
    },
    'obese': {
      alias: 'o',
      describe: 'Defines if the character is obese,formula is weight(kilo)/height(meeter)^2>=25',
      demandOption: false
    },
    'name': {
      alias: 'n',
      describe: 'Name of the character',
      demandOption: false
    },
    'height': {
      alias: 'h',
      describe: 'Height of the character',
      demandOption: false
    },
    'mass': {
      alias: 'm',
      describe: 'Mass of the character',
      demandOption: false
    },
    'hair_color': {
      alias: 'h',
      describe: 'Hair color of the character',
      demandOption: false
    },
    'eye_color': {
      alias: 'e',
      describe: 'Eye color of the character',
      demandOption: false
    },
    'skin_color': {
      alias: 's',
      describe: 'Skin color of the character',
      demandOption: false
    },
    'birth_year': {
      alias: 'b',
      describe: 'Birth of the character',
      demandOption: false
    },
    'gender': {
      alias: 'g',
      describe: 'Gender of the character',
      demandOption: false
    },
    'homeworld': {
      alias: 'w',
      describe: 'homeworld of the character',
      demandOption: false
    },
    'created': {
      alias: 'c',
      describe: 'Data of the last file modification',
      demandOption: false
    },
    'edited': {
      alias: 'e',
      describe: 'Data of the last file modification',
      demandOption: false
    },
    'url': {
      alias: 'u',
      describe: 'Url of file',
      demandOption: false
    }
  });
},
async function (argv) {
  const peopleCount = await getPeopleCount(uriForPageCount);
  const results = await processTheResults(peopleCount, argv);
  createAndWriteFile(pathToFile, results);
}).help()
  .demandCommand(1, 'You need at least one command before moving on')
  .argv;

const filterRecords = (searchFiltersObject, jsonArray, filterParameter = 'includeMatches') => {
  console.log(jsonArray);
  const resultsArray = jsonArray.filter(charatcter => {
    let charatcterComparsionResult = true;
    // can keys get props from protoype chain?/parent objects?
    for (let property in searchFiltersObject) {
      switch (property) {
        case 'name':
        case 'height':
        case 'mass':
        case 'hair_color':
        case 'eye_color':
        case 'skin_color':
        case 'birth_year':
        case 'gender':
        case 'homeworld':
        case 'created':
        case 'edited':
        case 'url':
          if (!(charatcter[property].includes(searchFiltersObject[property]))) charatcterComparsionResult = false;
          break;
        case 'films':
        case 'species':
        case 'vehicles':
        case 'starships':
          if (!(`${property}` in charatcter)) {
            charatcterComparsionResult = false;
          } else {
            let areAnyMatchesFound = false;
            charatcter[property].forEach((itemInCharacterProperty) => {
              searchFiltersObject[property].forEach((itemInSearchObjProperty) => {
                if (itemInSearchObjProperty.includes(itemInCharacterProperty)) areAnyMatchesFound = true;
              });
            });
            if (areAnyMatchesFound === false) charatcterComparsionResult = false;
          }
          break;
        case 'obese':
          if (charatcter.obese !== searchFiltersObject.obese) charatcterComparsionResult = false;
      }
    }
    // if 'exclude matches' key is set, matching records will be deleted to perform removeRecordsFromFile func
    return (filterParameter === 'excludeMatches') ? (!charatcterComparsionResult) : (charatcterComparsionResult);
  });
  return resultsArray;
};

const sortParams = (consoleArgs) => {
  const complexProperties = ['films', 'species', 'vehicles', 'starships'];
  const searchParams = {
    name: consoleArgs.name,
    birth_year: consoleArgs.birth_year,
    eye_color: consoleArgs.eye_color,
    gender: consoleArgs.species,
    hair_color: consoleArgs.type,
    height: consoleArgs.gender,
    mass: consoleArgs.mass,
    obese: consoleArgs.obese,
    skin_color: consoleArgs.skin_color
  };
  for (let complexProperty in complexProperties) {
    if (complexProperty in consoleArgs) {
      searchParams[complexProperty] = consoleArgs[complexProperty].split(',');
    }
  }
  Object.keys(searchParams
  ).forEach(key => {
    if (typeof searchParams[key] === 'undefined') {
      delete searchParams[key];
    }
  });
  return searchParams;
};

const fetchBodyOfRequest = async (requestResults) => {
  const newArray = requestResults.map((singleRequestResult, requestIndex) => {
    return singleRequestResult.body;
  });
  return newArray;
};

// add object,for which the property will be added
const addObeseProperty = async (requestResults) => {
  requestResults.forEach((singleRequestResult) => {
    singleRequestResult = addObesePropertyForObj(singleRequestResult);
  });
  return requestResults;
};

const addObesePropertyForObj = async (characterObj) => {
  if (characterObj.mass === 'unknown' || characterObj.height === 'unknown') {
    characterObj.obese = 'unknown';
  } else {
    characterObj.obese = (characterObj.mass.replace(',', '') / Math.pow((characterObj.height / 100), 2) >= 25);
    console.log((characterObj.mass / Math.pow((characterObj.height / 100), 2)));
  }
  return characterObj;
};

// optimize
const processTheResults = async function (pageCount, consoleArgs) {
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
  let results = await Promise.all(arrayOfPromises);
  results = await fetchBodyOfRequest(results);
  results = await addObeseProperty(results);
  results = filterRecords(sortParams(consoleArgs), results);
  return results;
};

module.exports = {
  processTheResults,
  getPage,
  sortParams
};
