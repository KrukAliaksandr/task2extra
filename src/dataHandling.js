const fs = require('fs');
const got = require('got');

const uri = 'https://swapi.co/api/people';

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
          console.log(`started`);
          if (!(property in charatcter)) {
            charatcterComparsionResult = false;
          } else {
            let areAnyMatchesFound = false;
            charatcter[property].forEach((itemInCharacterProperty) => {
              searchFiltersObject[property].forEach((itemInSearchObjProperty) => {
                console.log(`${itemInSearchObjProperty}
                  ${itemInCharacterProperty}`);
                if (itemInCharacterProperty.includes(itemInSearchObjProperty)) areAnyMatchesFound = true;
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
  for (let complexProperty of complexProperties) {
    if (complexProperty in consoleArgs) {
      searchParams[complexProperty] = consoleArgs[complexProperty].split(',');
      console.log(consoleArgs[complexProperty]);
      console.log(searchParams[complexProperty]);
    }
  }
  Object.keys(searchParams
  ).forEach(key => {
    if (typeof searchParams[key] === 'undefined') {
      delete searchParams[key];
    }
  });
  console.log(`TESTOBJ${JSON.stringify(searchParams)}`);
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
const processTheResults = async (pageCount, consoleArgs) => {
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
  addObesePropertyForObj,
  addObeseProperty,
  fetchBodyOfRequest,
  sortParams,
  filterRecords,
  getPeopleCount,
  getPage,
  createAndWriteFile
};
