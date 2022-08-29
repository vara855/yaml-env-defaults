<h1>Welcome to yaml-env-defaults 👋</h1>
<p>
  <img alt="Version" src="https://img.shields.io/badge/version-2.0.1-blue.svg?cacheSeconds=2592000" />
  <a href="#" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
  </a>
</p>

> Read yaml file with environment variables substitution

This is an wrapper under [js-yaml](https://www.npmjs.com/package/js-yaml) library which can render environment variables values with defaults support in yml file. (like Java Spring application.yaml). 

## Install module for Node.js

```sh
npm install yaml-env-defaults

# or

yarn add yaml-evn-defaults
```

## Usage

### Import

```js
// ES
import { readYamlEnvSync, readYamlEnv } from 'yaml-env-defaults';

// require
const { readYamlEnvSync, readYamlEnv } = require('yaml-env-defaults');
```

### Reading yaml

```js
import { readYamlEnvSync, readYamlEnv } from 'yaml-env-defaults';

// Read one yaml file synchronysly
const config = readYamlEnvSync('../path/to/yaml-file.yml');

// Read many yaml files synchronysly
const joinedYamls = readYamlEnvSync(['first.yml', 'second.yml', 'third.yaml']);

// Read yaml files with custom properties provider fn
const propertiesMap = {
  ENV_VAR_NAME: 'My value',
  USERS_COUNT: 4
};

const getProperty = (key) => {
  // without default value will be throwed error in case of missing 
  return propertiesMap[key] || 'Default value';
}

const config = readYamlEnvSync('../path/to/yaml-file.yml', getProperty);

// Custom properties for js-yaml
const config = readYamlEnvSync('../path/to/yaml-file.yml', undefined, {
  jsYaml: {
    onWarning: (yaml, e) => {
    }
    //...
  }
})

  // the same for readYamlEnv as async 
  (async () => {
    // Read one yaml file asynchronysly
    const config = await readYamlEnv('../path/to/yaml-file.yml');
  });
//or
readYamlEnv('../path/to/yaml-file.yml').then(config => config);

```

## Example

config-env.yml
```yaml
foo: 1
bar: 'text-${ENV_VAR_MY}-text-${ENV_VAR_YOUR}-text'

someFoo:
  someBar: ['${ENV_VAR_MY}', '${ENV_VAR_YOUR}']
  yaml-array:
    - ${ENV_VAR_MY}
    - second

someStrange: Thats/${ENV_VAR_MY}/${NAMESPACE:cloud-or-not}/${ENV_VAR_YOUR}

escapedValue:
  value: \$\{ENV_VAR_MY\}
```

JS output
```js
process.env.ENV_VAR_MY = 'Some value 2';
process.env.ENV_VAR_YOUR = 'Another Value';

const config = readYamlEnvSync(path.resolve(__dirname, 'config-env.yml'));
// Object {
//   "bar": "text-Some value 2-text-Another Value-text",
//   "escapedValue": Object {
//     "value": "\\\\$\\\\{ENV_VAR_MY\\\\}",
//   },
//   "foo": 1,
//   "someFoo": Object {
//     "someBar": Array [
//       "Some value 2",
//       "Another Value",
//     ],
//     "yaml-array": Array [
//       "Some value 2",
//       "second",
//     ],
//   },
//   "someStrange": "Thats/Some value 2/cloud-or-not/Another Value",
// }
```

More examples you can find in `./src/__fixtures__/` and `./src/__snapshots/` from tests snapshot results.

## Tests coverage report
```
---------------------|---------|----------|---------|---------|-------------------
File                 | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
---------------------|---------|----------|---------|---------|-------------------
All files            |   98.46 |    83.02 |     100 |   98.11 |                   
 read-yaml-config.ts |   98.46 |    83.02 |     100 |   98.11 | 40                
---------------------|---------|----------|---------|---------|-------------------
```

## Used Dependencies: 

- js-yaml@4.1.0
- lodash@4.17.21

## Author

👤 **Valerii Nosikov**

* Github: [@vara855](https://github.com/vara855)

## Show your support

Give a ⭐️ if this project helped you!

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
