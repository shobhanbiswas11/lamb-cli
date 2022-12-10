/**
 * Features
 *
 * create a file in the specified folder
 * directory should be there
 *
 * Bundle the code from entry file
 */

import { fs, vol } from "memfs";
import { LambdaLocal } from "../lambda-local";
import Bundler from "../lib/bundler";
import ZipMaker from "../lib/zip";

jest.mock("../lib/zip.ts");
jest.mock("../lib/bundler.ts");

jest.mock("fs/promises", () => fs.promises);

describe("Test for lambda local artifacts", () => {
  beforeAll(() => {
    vol.reset();
    (Bundler as jest.Mock).mockClear();
    (ZipMaker as jest.Mock).mockClear();
  });
  test("Should create an entry file", async () => {
    const c = new LambdaLocal({ projectRoot: "/" });
    await c.createEntryFile({
      filename: "test",
      typescript: true,
    });
    await c.createEntryFile({
      filename: "test",
      typescript: false,
    });

    expect(vol.toJSON()["/test.ts"]).toBeDefined();
    expect(vol.toJSON()["/test.js"]).toBeDefined();
  });

  test("Should get the unit8arraybuffer of the zip", async () => {
    const bundleToBuffer = jest.spyOn(Bundler.prototype, "bundleToBuffer");
    const createFromBufferMock = jest
      .spyOn(ZipMaker.prototype, "createFromBuffer")
      .mockReturnValue(Buffer.from("Hello"));

    const lambdaLocal = new LambdaLocal({
      projectRoot: "/",
    });
    const resUnit8Array = await lambdaLocal.getZipUnit8Array(
      "/my-lambda.js",
      "index.js"
    );

    expect(bundleToBuffer).toHaveBeenCalledWith({
      entryFile: "/my-lambda.js",
      bundlerConfig: undefined,
    });
    expect(createFromBufferMock.mock.calls[0][0].fileName).toBe("index.js");
    expect(Buffer.from(resUnit8Array).toString()).toBe("Hello");
  });
});
