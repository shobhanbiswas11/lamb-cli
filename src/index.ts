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
import { v4 } from "uuid";
import { config } from "./config";
import { CreateExecution, DeleteExecution } from "./lambda";
import { LambdaLocal } from "./lambda-local";
import { logError } from "./log";
import { functions, Metadata } from "./metadata";
import { push } from "./push";
import { createZipBuffer } from "./zip";

(async () => {
  const program = new Command();
  const metadata = await Metadata.init({
    filePath: path.resolve(process.cwd(), "lamb-cli.config.json"),
  });

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

  program
    .command("create")
    .description(
      "Creates a lambda function in the server and gives you the boilerplate code"
    )
    .action(async () => {
      const answers = await inquirer.prompt([
        {
          type: "input",
          message: "Function Name: ",
          name: "name",
        },
        {
          type: "confirm",
          message: "Wanna use typescript? ",
          name: "useTypescript",
        },
        {
          type: "input",
          message: "Function Region: ",
          name: "region",
        },
        {
          type: "confirm",
          message: "Do you want put entryFile in a folder? ",
          name: "hasFolderPath",
        },
        {
          type: "input",
          message: "Mention the folder path: ",
          name: "folderPath",
          when: (answers) => answers.hasFolderPath,
        },
      ]);

      const { region, name, folderPath = "", useTypescript } = answers;
      const createExecution = new CreateExecution({
        region: answers.region,
      });
      const lambdaLocal = new LambdaLocal({
        projectRoot: process.cwd(),
      });

      const srcFile = await lambdaLocal.createEntryFile({
        filename: name,
        typescript: useTypescript,
        dir: folderPath,
      });

      const { FunctionArn, RoleName } = await createExecution.execute({
        name,
        unit8ArrayBuffer: await lambdaLocal.getZipUnit8Array(
          srcFile,
          `${name}-${v4()}`
        ),
      });

      await metadata.addFunction({
        arn: FunctionArn!,
        entryFile: srcFile,
        name,
        region,
        roleName: RoleName,
      });
    });

  program
    .command("delete")
    .description("To delete the function created by the cli")
    .action(async () => {
      const fns = await metadata.getFunctions();
      if (fns.length === 0) {
        logError("No function created by the cli");
        return;
      }

      const { fnName } = await inquirer.prompt([
        {
          type: "list",
          message: "Choose the function: ",
          name: "fnName",
          choices: fns.map((f) => f.name),
        },
      ]);
      const fn = fns.find((f) => f.name === fnName)!;

      await new DeleteExecution({
        region: fn.region,
      }).execute({
        FunctionArn: fn.arn,
        RoleName: fn.roleName!,
      });

      await metadata.removeFunction(fnName);
    });

  program.parse();
})();
