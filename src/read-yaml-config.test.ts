import { resolve } from 'path';
import { readYamlEnv } from './read-yaml-config';

const getFixtureFile = (name: string) => resolve(__dirname, '__fixtures__', name);

describe('read yaml config with env replacing', () => {
  test('reads single yaml from file system and parses to json', () => {
    const config = readYamlEnv(getFixtureFile('config.yml'));

    expect(config).toMatchSnapshot();
  });

  test('returns a deep object from flat yaml file', () => {
    const config = readYamlEnv(getFixtureFile('flat_config.yml'));

    expect(config).toMatchSnapshot();
  });

  test('merges two yaml config files', () => {
    const config = readYamlEnv([getFixtureFile('config.yml'), getFixtureFile('flat_config.yml')]);
    expect(config).toMatchSnapshot();
  });

  test('should inject an environment variable value when setting a value with ${ENV_VAR}', () => {
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
  });

  test('fail when environment variable is not specified', () => {
    expect(() => {
      readYamlEnv([getFixtureFile('/config-env.yml')]);
    }).toThrow();
  });

  describe('.readYamlEnv() with custom env object', () => {

    test('should read config with customEnvs when process.env is empty', () => {
      const config = readYamlEnv([getFixtureFile('./config-env.yml')], {
        ENV_VAR_YOUR: 'Another Value',
        ENV_VAR_MY: 'Some value 2'
      });

      expect(config).toMatchSnapshot();
    });

    test('should replace to custom env value instead of process.env value', () => {
      process.env.ENV_VAR_MY = 'PROCESS_ENV';
      const config = readYamlEnv([getFixtureFile('./config-env.yml')], {
        ENV_VAR_YOUR: 'Another Value',
        ENV_VAR_MY: 'CUSTOM_ENV'
      });

      expect(config.someStrange).toMatch(/CUSTOM_ENV/);

      expect(config).toMatchSnapshot();
    });

    test('should not mutate customEnv', () => {
      const customEnv = {
        ENV_VAR_YOUR: 'Another Value',
        ENV_VAR_MY: 'CUSTOM_ENV'
      };
      const copy = JSON.stringify(customEnv);
      readYamlEnv([getFixtureFile('./config-env.yml')], customEnv);

      expect(copy).toEqual(JSON.stringify(customEnv));
    });
  });
});

