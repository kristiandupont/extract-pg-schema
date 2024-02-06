#!/usr/bin/env node
import { createInterface } from "node:readline";
import util from "node:util";

import { ConnectionConfig } from "pg";

import extractSchemas from "../extractSchemas";

if (util.parseArgs === undefined) {
  console.error(
    "Unsupported Node.js version. Please use Node.js >= v18.3.0 or >= v16.17.0.",
  );
  process.exit(1);
}

async function main(args: string[]) {
  const parsedArgs = parseArgs(args);

  if (parsedArgs.help) {
    showHelp();
    return;
  }

  const { connectionConfig, includePatterns, excludePatterns } = parsedArgs;

  // Prompt for password if not given in environment variable PGPASSWORD
  // eslint-disable-next-line no-process-env
  const password = process.env.PGPASSWORD ?? (await promptPassword());

  const schemaFilter = createSchemaFilter(includePatterns, excludePatterns);

  const allSchemas = await extractSchemas({ ...connectionConfig, password });
  // Filter schemas after extracting them all, because we don't know
  // which schemas exist until we've extracted them.
  const schemas = Object.fromEntries(
    Object.entries(allSchemas).filter(([schemaName]) =>
      schemaFilter(schemaName),
    ),
  );

  // eslint-disable-next-line no-console
  console.log(JSON.stringify(schemas, null, 2));
}

type ParsedArgs =
  | { help: true }
  | {
      help: false;
      connectionConfig: ConnectionConfig;
      includePatterns: string[];
      excludePatterns: string[];
    };

export function parseArgs(args: string[]): ParsedArgs {
  const { values, positionals } = util.parseArgs({
    args,
    options: {
      help: { type: "boolean" },
      host: { type: "string", short: "h" },
      port: { type: "string", short: "p" },
      username: { type: "string", short: "U" },
      dbname: { type: "string", short: "d" },
      schema: { type: "string", short: "n", multiple: true },
      "exclude-schema": { type: "string", short: "N", multiple: true },
    },
    allowPositionals: true,
  });

  if (values.help) {
    return { help: true };
  }

  return {
    help: false,
    connectionConfig: {
      host: values.host,
      port: values.port === undefined ? undefined : Number(values.port),
      user: values.username,
      database: values.dbname ?? positionals[0],
    },
    includePatterns: values.schema ?? [],
    excludePatterns: values["exclude-schema"] ?? [],
  };
}

function showHelp() {
  console.error(
    `Usage: ${process.argv[1]} [options] [DBNAME]

Extract all schemas from a PostgreSQL database and print them as JSON.

Options:
    --help                      show this help
    -h, --host=HOSTNAME         database server host or socket directory
    -p, --port=PORT             database server port
    -U, --username=USERNAME     database user name
    -d, --dbname=DBNAME         database name to connect to
    -n, --schema=SCHEMA         include schema regular expression (may be given multiple times)
    -N, --exclude-schema=SCHEMA exclude schema regular expression (may be given multiple times)
`,
  );
}

function promptPassword(): Promise<string> {
  return new Promise((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: undefined, // Don't echo the password
      terminal: true,
    });

    process.stderr.write("Password: ");
    rl.question("", (password) => {
      rl.close();
      process.stderr.write("\n");
      resolve(password);
    });
  });
}

export function createSchemaFilter(
  includePatterns: string[],
  excludePatterns: string[],
): (schemaName: string) => boolean {
  const includeRegexes = includePatterns.map((pattern) => new RegExp(pattern));
  const excludeRegexes = excludePatterns.map((pattern) => new RegExp(pattern));

  function isIncluded(schemaName: string) {
    if (includePatterns.length === 0) {
      return true; // Empty include list means include everything
    }
    return includeRegexes.some((pattern) => exactMatch(pattern, schemaName));
  }

  function isExcluded(schemaName: string) {
    if (excludePatterns.length === 0) {
      return false; // Empty exclude list means exclude nothing
    }
    return excludeRegexes.some((pattern) => exactMatch(pattern, schemaName));
  }

  return (schemaName) => isIncluded(schemaName) && !isExcluded(schemaName);
}

function exactMatch(pattern: RegExp, schemaName: string) {
  const m = pattern.exec(schemaName);
  return m !== null && m[0] === schemaName;
}

main(process.argv.slice(2)).catch((error) => {
  console.error(`Error: ${error.message ?? error}`);
  process.exit(1);
});
