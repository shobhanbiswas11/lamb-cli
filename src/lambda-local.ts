import fs from "fs/promises";
import path from "path";
import Bundler from "./lib/bundler";
import ZipMaker from "./lib/zip";

export class LambdaLocal {
  constructor(private config: { projectRoot: string }) {}
  async createEntryFile({
    dir = "",
    filename,
    typescript,
  }: {
    dir?: string;
    filename: string;
    typescript: boolean;
  }) {
    const ext = typescript ? "ts" : "js";

    const filePath = path.resolve(
      this.config.projectRoot,
      dir,
      `${filename}.${ext}`
    );

    await fs.writeFile(filePath, "//This is the entry file for your lambda");

    return filePath;
  }

  async getZipUnit8Array({
    entryFile,
    handlerFileName = "index.js",
  }: {
    entryFile: string;
    handlerFileName?: string;
  }) {
    const bundler = new Bundler();
    const zipMaker = new ZipMaker();

    const buffer = await bundler.bundleToBuffer({
      entryFile,
    });

    const zipBuff = zipMaker.createFromBuffer({
      buffer,
      fileName: handlerFileName,
    });

    return Uint8Array.from(zipBuff);
  }
}
