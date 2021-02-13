import { safeLoad } from 'js-yaml';
import { set, isPlainObject } from 'lodash';
import { readFileSync } from 'fs';

type EnvVariables = Record<string, any>;

function replaceEnvVarRefsWithDefaults(val: string, customEnv?: EnvVariables) {
  const foundValue = val.replace(/\$\{(\w+)\}/g, (substring, envVarName) => {
    const mergedValues = customEnv ? {
      ...process.env,
      ...customEnv
    } : process.env;

    const envVarValue = mergedValues[envVarName];
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
 * @param {Object<*>} customEnv custom environment object
 * @returns {Record<string, any>}
 */
export const readYamlEnv = (filePath: string | string[], customEnv?: Record<string, any>): Record<string, any> => {
  let replacedYaml = {};
  if (Array.isArray(filePath)) {
    for (const file of filePath) {
      const yaml = safeLoad(readFileSync(file, 'utf-8'));
      if (yaml) {
        replacedYaml = processYaml(replacedYaml, yaml, undefined, customEnv);
      }
    }
  } else {
    const yaml = safeLoad(readFileSync(filePath, 'utf-8'));
    if (yaml) {
      replacedYaml = processYaml(replacedYaml, yaml, undefined, customEnv);
    }
  }
  return replacedYaml;
};
