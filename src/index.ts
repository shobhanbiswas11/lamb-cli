#!/usr/bin/env node

/**
 * CLI Tool
 *
 * lamb-cli init
 * lamb-cli push
 * lamb-cli create
 * lamb-cli delete
 *
 *
 */

import { Command } from "commander";
import inquirer from "inquirer";
import path from "path";
import { config } from "./config";
import { logError } from "./log";
import { functions } from "./metadata";
import { push } from "./push";
import { createZipBuffer } from "./zip";

(async () => {
  const program = new Command();

  program
    .name(await config.cliName)
    .description(await config.description)
    .version(await config.cliVersion);

  program
    .command("push")
    .description("Will bundle and push the code to server")
    .action(async () => {
      const choices = (await config.metadata).functions;
      if (choices.length === 0) {
        logError(
          `No function found. Consider adding one with ${config.cliName} add`
        );
        return;
      }

      const { fnName } = await inquirer.prompt([
        {
          message: "Which function do you wanna push",
          type: "list",
          name: "fnName",
          choices: choices,
        },
      ]);

      const fn = await functions.get(fnName);
      if (!fn) {
        logError("No Function found");
        return;
      }

      await push({
        region: fn.region,
        functionArn: fn.arn,
        zipBuffer: await createZipBuffer({
          entry: path.resolve(config.workingPath, fn.entryFile),
        }),
      });
      console.log("Done");
    });

  program
    .command("init")
    .description("Initialize the configuration file")
    .action(async () => {
      await config.metadata;
    });

  program
    .command("add")
    .description("Add lambda function details")
    .action(async () => {
      const answers = await inquirer.prompt([
        {
          message: "Function Name? (Only used in your local project)",
          type: "input",
          name: "name",
          validate: async (name) => {
            if (await functions.get(name)) return "Name is taken";
            return true;
          },
        },
        {
          message: "Function ARN",
          type: "input",
          name: "arn",
        },
        {
          message: "Function Region",
          type: "input",
          name: "region",
        },
        {
          message: "Entry file path",
          type: "input",
          name: "entryFile",
        },
      ]);

      await functions.add(answers);
    });

  program.parse();
})();
