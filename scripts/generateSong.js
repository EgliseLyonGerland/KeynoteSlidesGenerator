const { exec } = require('child_process');
const fs = require('fs');
const inquirer = require('inquirer');
const reduce = require('lodash/reduce');
const kebabCase = require('lodash/kebabCase');
const deburr = require('lodash/deburr');

const rootPath = `${__dirname}/..`;

const questions = [
  {
    name: 'title',
    type: 'string',
    message: 'Title',
  },
  {
    name: 'authors',
    type: 'string',
    message: 'Authors (separated by comma)',
  },
  {
    name: 'copyright',
    type: 'string',
    message: 'Copyright',
  },
  {
    name: 'collection',
    type: 'string',
    message: 'Collections (separated by comma)',
  },
  {
    name: 'transaltion',
    type: 'string',
    message: 'Translation',
  },
];

function getPath(id) {
  return `${rootPath}/src/songs/${id}.song`;
}

async function resolveId(title) {
  const id = kebabCase(deburr(title));
  const path = getPath(id);

  return new Promise(resolve => {
    if (!fs.existsSync(path)) {
      resolve(id);
      return;
    }

    inquirer
      .prompt([
        {
          name: 'newId',
          type: 'string',
          message: `\`${id}\` already exists. Please another one`,
          default: `${id}2`,
        },
      ])
      .then(({ newId }) => {
        resolve(resolveId(newId));
      });
  });
}

(async function main() {
  const answers = await inquirer.prompt(questions);

  const { title } = answers;

  const id = await resolveId(title);
  const filePath = getPath(id);

  const header = reduce(
    answers,
    (acc, curr, key) => {
      if (curr) {
        return [...acc, `${key}: ${curr}`];
      }

      return acc;
    },
    [],
  ).join('\n');

  const body = `
${header}
---

[verse]

  `.trim();

  fs.writeFileSync(filePath, body);

  exec(`code ${filePath}`);
})();
