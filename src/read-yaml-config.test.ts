import { resolve } from 'path';
import { readYamlEnv, readYamlEnvSync } from './read-yaml-config';

const getFixtureFile = (name: string) => resolve(__dirname, '__fixtures__', name);

describe('readYamlEnvSync()', () => {

  test('should not fail if specified incorrect encoding', () => {
    const result = readYamlEnvSync(getFixtureFile('config.yml'), undefined, undefined, 'base64');
    expect(result).toMatchSnapshot();
  });

  test('reads single yaml from file system and parses to json', () => {
    const config = readYamlEnvSync(getFixtureFile('config.yml'));

    expect(config).toMatchSnapshot();
  });

  test('should throw exceptions on incorrect file path', () => {
    expect(() => readYamlEnvSync(getFixtureFile('missed-file.yml'))).toThrowError(/no such file or directory/);
  });

  test('returns a deep object from flat yaml file', () => {
    const config = readYamlEnvSync(getFixtureFile('flat_config.yml'));

    expect(config).toMatchSnapshot();
  });

  test('merges two yaml config files', () => {
    const config = readYamlEnvSync([getFixtureFile('config.yml'), getFixtureFile('flat_config.yml')]);
    expect(config).toMatchSnapshot();
  });

  test('should inject an environment variable value when setting a value with ${ENV_VAR}', () => {
    process.env.ENV_VAR_MY = 'Some value 1';
    process.env.ENV_VAR_YOUR = 'Another Value 2';

    const config = readYamlEnvSync(getFixtureFile('config-env.yml'));

    delete process.env.ENV_VAR_MY;
    delete process.env.ENV_VAR_YOUR;

    expect(config).toMatchSnapshot();
  });

  test('should read config with defaults env values', () => {
    const config = readYamlEnvSync(getFixtureFile('config-env-defaults.yaml'));

    expect(config).toMatchSnapshot();
  });

  test('fail when environment variable is not specified', () => {
    expect(() => {
      readYamlEnvSync([getFixtureFile('/config-env.yml')]);
    }).toThrow();
  });

  describe('.readYamlEnvSync() with custom env object', () => {

    test('should read config with customEnvs instead of process.env values', () => {
      const config = readYamlEnvSync([getFixtureFile('./config-env.yml')], {
        ENV_VAR_YOUR: 'Another Value',
        ENV_VAR_MY: 'Some value 2'
      });

      expect(config).toMatchSnapshot();
    });

    test('should replace to custom env value instead of process.env value', () => {
      process.env.ENV_VAR_MY = 'PROCESS_ENV';
      const config = readYamlEnvSync([getFixtureFile('./config-env.yml')], {
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
      readYamlEnvSync([getFixtureFile('./config-env.yml')], customEnv);

      expect(copy).toEqual(JSON.stringify(customEnv));
    });
  });
});

describe('.readYamlEnv() async', () => {

  test('should not fail if specified incorrect encoding', async () => {
    const result = await readYamlEnv(getFixtureFile('config.yml'), undefined, undefined, 'base64');
    expect(result).toMatchSnapshot();
  });

  test('reads single yaml from file system and parses to json', async () => {
    const config = await readYamlEnv(getFixtureFile('config.yml'));

    expect(config).toMatchSnapshot();
  });


  test('should throw exceptions on incorrect file path', async () => {
    await expect(async () => readYamlEnv(getFixtureFile('missed-file.yml')))
      .rejects
      .toThrowError(/no such file or directory/);
  });

  test('returns a deep object from flat yaml file', async () => {
    const config = await readYamlEnv(getFixtureFile('flat_config.yml'));

    expect(config).toMatchSnapshot();
  });

  test('merges two yaml config files', async () => {
    const config = await readYamlEnv([getFixtureFile('config.yml'), getFixtureFile('flat_config.yml')]);
    expect(config).toMatchSnapshot();
  });

  test('should inject an environment variable value when setting a value with ${ENV_VAR}', async () => {
    process.env.ENV_VAR_MY = 'Some value 1';
    process.env.ENV_VAR_YOUR = 'Another Value 2';

    const config = await readYamlEnv(getFixtureFile('config-env.yml'));

    delete process.env.ENV_VAR_MY;
    delete process.env.ENV_VAR_YOUR;

    expect(config).toMatchSnapshot();
  });

  test('should read config with defaults env values', async () => {
    const config = await readYamlEnv(getFixtureFile('config-env-defaults.yaml'));

    expect(config).toMatchSnapshot();
  });

  test('fail when environment variable is not specified', async () => {
    await expect(async () => {
      await readYamlEnv([getFixtureFile('/config-env.yml')]);
    }).rejects.toThrow();
  });

  describe('readYamlEnv() with custom env object', () => {
    test('should read config with customEnvs when process.env is empty', async () => {
      const config = await readYamlEnv([getFixtureFile('./config-env.yml')], {
        ENV_VAR_YOUR: 'Another Value',
        ENV_VAR_MY: 'Some value 2'
      });

      expect(config).toMatchSnapshot();
    });

    test('should replace to custom env value instead of process.env value', async () => {
      process.env.ENV_VAR_MY = 'PROCESS_ENV';
      const config = await readYamlEnv([getFixtureFile('./config-env.yml')], {
        ENV_VAR_YOUR: 'Another Value',
        ENV_VAR_MY: 'CUSTOM_ENV'
      });

      expect(config.someStrange).toMatch(/CUSTOM_ENV/);

      expect(config).toMatchSnapshot();
    });

    describe('readYamlEnv() with custom env function resolver', () => {

      test('should replace env from function', async () => {
        const config = await readYamlEnv([getFixtureFile('./config-env.yml')], () => 'FUNCTION_VALUE');

        expect(config.someStrange).toMatch(/FUNCTION_VALUE/);
      });

      test('should not throw error when function return null', async () => {
        await expect(async () => readYamlEnv([getFixtureFile('./config-env.yml')], () => null))
          .rejects.toThrowError(/Unknown environment variable /);
      });
    });
  });
});


test('should parse simple yaml', () => {
  process.env.TEST = 'my var';
  expect(
    readYamlEnvSync(getFixtureFile('./simple.yaml'))
  ).toStrictEqual({
    test: 'my var'
  });
});

test('couple defaults in one yaml field', () => {
  expect(readYamlEnvSync(getFixtureFile('./couple-defaults.yaml')))
    .toStrictEqual({
      mysql: {
        url: 'mysql://root:password@localhost:3306/feedback_1'
      }
    });
});

test('should correctly parse config2.yml', () => {
  process.env.ENV_VAR_YOUR = 'config2.yml';
  process.env.ENV_VAR_MY = 'config2.yml value';
  expect(readYamlEnvSync(getFixtureFile('config2.yml'))).toMatchSnapshot();
});