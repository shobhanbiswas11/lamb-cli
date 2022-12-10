import { access, readFile, writeFile } from "fs/promises";
import { config } from "./config";

const add = async (fnMt: {
  name: string;
  arn: string;
  region: string;
  entryFile: string;
}) => {
  await config.updateMetadata((m) => {
    m.functions.push(fnMt);
    return m;
  });
};

const get = async (name: string) => {
  const mt = await config.metadata;
  return mt.functions.find((f) => f.name === name);
};

export const functions = {
  add,
  get,
};

export interface IFunctionMetadata {
  name: string;
  arn: string;
  region: string;
  entryFile: string;
  roleName?: string;
}

interface MetadataFile {
  functions: IFunctionMetadata[];
}

export class Metadata {
  private constructor(private config: { filePath: string }) {}

  private get fileContent() {
    return (async () => {
      return JSON.parse(
        await readFile(this.config.filePath, { encoding: "utf-8" })
      ) as MetadataFile;
    })();
  }

  private async saveFileContent(
    arg: (fileContent: MetadataFile) => MetadataFile | MetadataFile
  ) {
    let newMt: MetadataFile;
    if (typeof arg === "function") {
      const mt = await this.fileContent;
      newMt = arg(mt);
    } else newMt = arg;
    await writeFile(this.config.filePath, JSON.stringify(newMt));
  }

  async addFunction(fnMt: IFunctionMetadata) {
    await this.saveFileContent((mt) => {
      mt.functions.push(fnMt);
      return mt;
    });
  }

  async removeFunction(name: string) {
    await this.saveFileContent((mt) => {
      mt.functions = mt.functions.filter((f) => f.name !== name);
      return mt;
    });
  }

  async getFunctions() {
    return (await this.fileContent).functions;
  }

  static async init({ filePath }: { filePath: string }) {
    try {
      await access(filePath);
    } catch (error) {
      await writeFile(
        filePath,
        JSON.stringify({
          functions: [],
        })
      );
    }
    return new Metadata({ filePath });
  }
}
