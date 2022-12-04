import {
  LambdaClient,
  UpdateFunctionCodeCommand,
} from "@aws-sdk/client-lambda";

export async function push({
  region,
  functionArn,
  zipBuffer,
  credentials,
}: {
  zipBuffer: Buffer;
  region: string;
  functionArn: string;
  credentials?: {
    accessKeyId: string;
    secretAccessKey: string;
  };
}) {
  const client = new LambdaClient({
    region,
    credentials,
  });
  const command = new UpdateFunctionCodeCommand({
    FunctionName: functionArn,
    ZipFile: Uint8Array.from(zipBuffer),
  });
  return client.send(command);
}
