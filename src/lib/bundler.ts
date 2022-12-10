import esBuild from "esbuild";

export default class Bundler {
  async bundleToBuffer({
    entryFile,
    bundlerConfig,
  }: {
    entryFile: string;
    bundlerConfig?: any;
  }): Promise<Buffer> {
    const { outputFiles, errors } = await esBuild.build({
      entryPoints: [entryFile],
      bundle: true,
      write: false,
      minify: true,
      platform: "node",
      ...bundlerConfig,
    });

    if (errors.length > 0) {
      console.log(errors);
      throw new Error("Something went wrong in the build phase");
    }
    return Buffer.from(outputFiles[0].contents);
  }
}
