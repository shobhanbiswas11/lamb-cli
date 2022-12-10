import {
  CreateRoleCommand,
  DeleteRoleCommand,
  DeleteRolePolicyCommand,
  IAMClient,
  IAMClientConfig,
  PutRolePolicyCommand,
} from "@aws-sdk/client-iam";

export async function createLambdaExecutionRole({
  RoleName,
  ...rest
}: { RoleName: string } & IAMClientConfig) {
  const createRoleCommand = new CreateRoleCommand({
    AssumeRolePolicyDocument: JSON.stringify({
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: { Service: "lambda.amazonaws.com" },
          Action: "sts:AssumeRole",
        },
      ],
    }),
    RoleName,
  });

  const createInlinePolicyCommand = new PutRolePolicyCommand({
    PolicyDocument: JSON.stringify({
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Action: "logs:CreateLogGroup",
          Resource: "*",
        },
        {
          Effect: "Allow",
          Action: ["logs:CreateLogStream", "logs:PutLogEvents"],
          Resource: "*",
        },
      ],
    }),
    PolicyName: `policy@${RoleName}`,
    RoleName,
  });

  const client = new IAMClient(rest);
  const response = await client.send(createRoleCommand);
  await client.send(createInlinePolicyCommand);

  return {
    arn: response.Role?.Arn,
    name: response.Role?.RoleName,
  };
}

export async function deleteRole({
  RoleName,
  ...rest
}: { RoleName: string } & IAMClientConfig) {
  const client = new IAMClient(rest);

  await client.send(
    new DeleteRolePolicyCommand({
      PolicyName: `policy@${RoleName}`,
      RoleName,
    })
  );

  return client.send(
    new DeleteRoleCommand({
      RoleName,
    })
  );
}
