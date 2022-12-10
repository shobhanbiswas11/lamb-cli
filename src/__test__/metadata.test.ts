import { fs, vol } from "memfs";
import { Metadata } from "../metadata";
jest.mock("fs/promises", () => fs.promises);

function createTestFnMeta(name = "test-fn") {
  return {
    name,
    arn: "test-arn",
    entryFile: "entry/file.ts",
    region: "ap-south-1",
    roleName: "test-role",
  };
}

describe("Test for metadata-file", () => {
  beforeEach(async () => {
    vol.reset();
  });

  test("Should Add the function details properly", async () => {
    const metadata = await Metadata.init({ filePath: "/metadata.json" });
    await metadata.addFunction(createTestFnMeta("test-fnn"));
    const { functions } = JSON.parse(
      fs.readFileSync("/metadata.json", { encoding: "utf-8" }) as any
    );

    expect(functions[0]?.name).toBe("test-fnn");
  });

  test("Should Delete the function details properly", async () => {
    const metadata = await Metadata.init({ filePath: "/metadata.json" });
    await metadata.addFunction(createTestFnMeta("fn-1"));
    await metadata.addFunction(createTestFnMeta("fn-2"));

    await metadata.removeFunction("fn-2");
    const { functions } = JSON.parse(
      fs.readFileSync("/metadata.json", { encoding: "utf-8" }) as any
    );

    expect(functions.length).toBe(1);
  });

  test("Should list the functions", async () => {
    const metadata = await Metadata.init({ filePath: "/metadata.json" });
    await metadata.addFunction(createTestFnMeta("fn-1"));
    await metadata.addFunction(createTestFnMeta("fn-2"));
    const functions = await metadata.getFunctions();
    expect(functions.length).toBe(2);
  });
});
