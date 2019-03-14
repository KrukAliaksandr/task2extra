
const todo = require('yargs');
const filename = `request`;
const { processTheResults, getPeopleCount, createAndWriteFile } = require('./dataHandling');

const uriForPageCount = `https://swapi.co/api/people`;

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
  createAndWriteFile(filename, results);
}).help()
  .demandCommand(1, 'You need at least one command before moving on')
  .argv;
