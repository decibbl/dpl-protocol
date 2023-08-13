import { Workspace, connection } from "..";
import { initializeKeypair } from "../initializeKeypair";

export const getPlatforms = async () => {
  try {
    const authority = await initializeKeypair(connection, "platform1");
    const workspace = new Workspace(authority);
    const platforms = await workspace.program.account.platform.all();
    console.log(JSON.stringify(platforms, null, 2));
  } catch (error) {
    console.log(error);
  }
};

getPlatforms();
