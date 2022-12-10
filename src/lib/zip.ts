import AdmZip from "adm-zip";
export default class ZipMaker {
  createFromBuffer({
    buffer,
    fileName,
  }: {
    buffer: Buffer;
    fileName: string;
  }): Buffer {
    const zip = new AdmZip();
    zip.addFile(fileName, buffer);

    return zip.toBuffer();
  }
}
