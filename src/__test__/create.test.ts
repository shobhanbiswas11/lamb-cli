import { createLambdaExecutionRole } from "../role";

describe("Test for Function creation", () => {
  test.skip("Should create the lambda role properly", async () => {
    await createLambdaExecutionRole({
      RoleName: "from-file",
    });
  });
});
