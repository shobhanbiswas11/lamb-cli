import AdmZip from "adm-zip";
import esBuild from "esbuild";

export async function createZipBuffer({
  entry,
  config = {},
}: {
  entry: string;
  config?: any;
}) {
  const { outputFiles, errors } = await esBuild.build({
    entryPoints: [entry],
    bundle: true,
    write: false,
    platform: "node",
    ...config,
  });

  if (errors.length > 0) {
    console.log(errors);
    throw new Error("Something went wrong in the build phase");
  }
  const zip = new AdmZip();
  zip.addFile(
    config.outfile || "index.js",
    Buffer.from(outputFiles[0].contents)
  );

  return zip.toBuffer();
}
