import { resolve } from 'path';
import { readYamlEnv } from './read-yaml-config';

const getFixtureFile = (name: string) => resolve(__dirname, '__fixtures__', name);

test('reads single yaml from file system and parses to json', async () => {
  const config = readYamlEnv(getFixtureFile('config.yml'));

  expect(config).toMatchSnapshot();
});

test('returns a deep object from flat yaml file', async () => {
  const config = readYamlEnv(getFixtureFile('flat_config.yml'));

  expect(config).toMatchSnapshot();
});

test('merges two yaml config files', () => {
  const config = readYamlEnv([getFixtureFile('config.yml'), getFixtureFile('flat_config.yml')]);
  expect(config).toMatchSnapshot();
});

test('should inject an environment variable value when setting a value with ${ENV_VAR}', async () => {
  process.env.ENV_VAR_MY = 'Some value 1';
  process.env.ENV_VAR_YOUR = 'Another Value 2';

  const config = readYamlEnv(getFixtureFile('config-env.yml'));

  delete process.env.ENV_VAR_MY;
  delete process.env.ENV_VAR_YOUR;

  expect(config).toMatchSnapshot();
});

test('should read config with defaults env values', () => {
  const config = readYamlEnv(getFixtureFile('config-env-defaults.yaml'));

  expect(config).toMatchSnapshot();
})

test('fail when environment variable is not specified', async () => {
  expect(() => {
    readYamlEnv([getFixtureFile('/config-env.yml')]);
  }).toThrow();
});
