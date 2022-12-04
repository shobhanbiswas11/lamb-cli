import fs from "fs/promises";
import path from "path";

interface Metadata {
  functions: {
    name: string;
    arn: string;
    region: string;
    entryFile: string;
  }[];
}

class Config {
  private constructor() {}

  private static _instance: Config;
  static get instance() {
    if (!this._instance) this._instance = new Config();
    return this._instance;
  }

  get packageJson() {
    return (async () => {
      return JSON.parse(
        await fs.readFile(path.resolve(__dirname, "..", "package.json"), {
          encoding: "utf-8",
        })
      );
    })();
  }
  get cliName() {
    return (async () => {
      return (await this.packageJson).name as string;
    })();
  }

  get cliVersion() {
    return (async () => {
      return (await this.packageJson).version as string;
    })();
  }

  get description() {
    return (async () => {
      return (await this.packageJson).description as string;
    })();
  }

  get workingPath() {
    return process.cwd();
  }

  private configFilename = "lamb-cli.config.json";

  get metadataPath() {
    return path.resolve(this.workingPath, this.configFilename);
  }

  private get metadataContent() {
    return JSON.stringify({
      functions: [],
    });
  }

  get metadata(): Promise<Metadata> {
    return (async () => {
      try {
        await fs.access(this.metadataPath);
      } catch (error) {
        await fs.writeFile(this.metadataPath, this.metadataContent);
      }
      return JSON.parse(
        await fs.readFile(this.metadataPath, { encoding: "utf-8" })
      );
    })();
  }

  async updateMetadata(updater: (mt: Metadata) => Metadata) {
    return fs.writeFile(
      this.metadataPath,
      JSON.stringify(updater(await this.metadata))
    );
  }
}
export const config = Config.instance;
