import { LoadOptions, load } from 'js-yaml';
import { set, isPlainObject } from 'lodash';
import { readFileSync, promises } from 'fs';

const { readFile } = promises;
export type EnvVarResolver = (key: string) => any;
export type EnvVariables = Record<string, any> | EnvVarResolver;

export interface readYamlOptions {
  jsYaml?: LoadOptions,
};

function replaceEnvVarRefsWithDefaults(val: string, customEnv?: EnvVariables) {
  const foundValue = val.replace(/\$\{(\w+)\}/g, (substring, envVarName) => {
    let envVarValue = undefined;
    if (typeof customEnv === 'function') {

      envVarValue = customEnv(envVarName) || process.env[envVarName];
    } else {
      const mergedValues = customEnv ? {
        ...process.env,
        ...customEnv
      } : process.env;

      envVarValue = mergedValues[envVarName];
    }

    if (envVarValue !== undefined) {
      return envVarValue;
    }
    throw new Error(
      `Unknown environment variable referenced in config: ${envVarName}. Specify environment variable or use defaults syntax.`
    );
  });
  return foundValue.replace(
    /(.*)\${(\w+):(.*)}(.*)/g,
    (match: string, prefix, envVarName, defValue, postfix) => {
      const envValue = process.env[envVarName];
      if (envValue !== undefined) {
        return `${prefix}${envValue.trim()}${postfix}`;
      } else {
        if (prefix || postfix) {
          return transformIfJSON(`${prefix}${transformIfJSON(defValue)}${postfix}`);
        } else {
          return transformIfJSON(defValue);
        }
      }
    }
  );
}

function transformIfJSON(val: string) {
  try {
    return JSON.parse(val);
  } catch (e) {
    return val;
  }
}

function processYaml(
  target: Record<string, any>,
  value: any,
  key?: string,
  envVariables?: EnvVariables,
): Record<string, any> {
  if ((isPlainObject(value) || Array.isArray(value)) && Object.keys(value).length > 0) {
    for (const [subKey, subVal] of Object.entries(value)) {
      processYaml(target, subVal, key ? `${key}.${subKey}` : subKey, envVariables);
    }
  } else if (key !== undefined) {
    set(target, key, typeof value === 'string' ? replaceEnvVarRefsWithDefaults(value, envVariables) : value);
  }

  return target;
}


/**
 * Replace env refs in yaml to values
 * @param {string | string[]} filePath path to yaml file
 * @param {{ jsyaml: LoadOptions }} options options
 * @param {Object<*>} customEnv custom environment object
 * @param {BufferEncoding | undefined} encoding file encoding
 * @returns {Record<string, any>}
 */
export const readYamlEnvSync = <T extends Record<string, any>>(filePath: string | string[], customEnv?: EnvVariables, options?: readYamlOptions, encoding = 'utf-8'): T => {
  let replacedYaml = {};
  if (Array.isArray(filePath)) {
    for (const file of filePath) {
      const yaml = load(readFileSync(file, encoding as BufferEncoding), options?.jsYaml);
      if (yaml) {
        replacedYaml = processYaml(replacedYaml, yaml, undefined, customEnv);
      }
    }
  } else {
    const yaml = load(readFileSync(filePath, encoding as BufferEncoding));
    if (yaml) {
      replacedYaml = processYaml(replacedYaml, yaml, undefined, customEnv);
    }
  }
  return replacedYaml as T;
};

/**
 * Replace env refs in yaml to values async
 * @param {string | string[]} filePath path to yaml file
 * @param {{ jsyaml: LoadOptions }} options options
 * @param {Record<string, any> | EnvVarResolver} customEnv custom environment object
 * @param {BufferEncoding | undefined} encoding file encoding
 * @returns {Promise<Record<string, any>>}
 */
export const readYamlEnv = async <T extends Record<string, any>>(filePath: string | string[], customEnv?: EnvVariables, options?: readYamlOptions, encoding = 'utf-8'): Promise<T> => {
  let replacedYaml = {};
  if (Array.isArray(filePath)) {
    for (const file of filePath) {
      const _file = await readFile(file, encoding as BufferEncoding);
      const yaml = load(_file, options?.jsYaml);
      if (yaml) {
        replacedYaml = processYaml(replacedYaml, yaml, undefined, customEnv);
      }
    }
  } else {
    const _file = await readFile(filePath, encoding as BufferEncoding);
    const yaml = load(_file, options?.jsYaml);
    if (yaml) {
      replacedYaml = processYaml(replacedYaml, yaml, undefined, customEnv);
    }
  }

  return replacedYaml as T;
};
