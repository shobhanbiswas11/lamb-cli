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
