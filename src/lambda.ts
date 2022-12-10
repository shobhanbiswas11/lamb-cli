import {
  CreateFunctionCommand,
  DeleteFunctionCommand,
  LambdaClient,
  LambdaClientConfig,
  Runtime,
} from "@aws-sdk/client-lambda";
import { v4 } from "uuid";
import { createLambdaExecutionRole, deleteRole } from "./role";

async function timeOut(milSec: number) {
  return new Promise((res) => {
    setTimeout(res, milSec);
  });
}

class LambdaExecution {
  protected client;
  constructor(protected config: LambdaClientConfig) {
    this.client = new LambdaClient(config);
  }
}

export class CreateExecution extends LambdaExecution {
  async execute({
    name,
    unit8ArrayBuffer,
  }: {
    name: string;
    unit8ArrayBuffer: Uint8Array;
  }) {
    const { arn: RoleArn, name: RoleName } = await createLambdaExecutionRole({
      RoleName: `${name}-role-${v4()}`,
      region: this.config.region,
      credentials: this.config.credentials,
    });

    await timeOut(10000);

    const command = new CreateFunctionCommand({
      FunctionName: name,
      Role: RoleArn,
      Runtime: Runtime.nodejs16x,
      Handler: `index.handler`,
      Code: {
        ZipFile: unit8ArrayBuffer,
      },
    });

    try {
      const { FunctionArn } = await this.client.send(command);
      return {
        FunctionArn,
        RoleArn,
        RoleName,
      };
    } catch (error) {
      if (RoleName) {
        await deleteRole({
          RoleName,
          region: this.config.region,
          credentials: this.config.credentials,
        });
      }
      throw error;
    }
  }
}

export class DeleteExecution extends LambdaExecution {
  async execute({
    FunctionArn,
    RoleName,
  }: {
    FunctionArn: string;
    RoleName: string;
  }) {
    await this.client.send(
      new DeleteFunctionCommand({
        FunctionName: FunctionArn,
      })
    );
    await deleteRole({
      RoleName,
    });
  }
}
