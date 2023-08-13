import { Workspace, connection } from "..";
import { initializeKeypair } from "../initializeKeypair";

export const getCollections = async () => {
  try {
    const authority = await initializeKeypair(connection, "artist1");
    const workspace = new Workspace(authority);
    const artists = await workspace.program.account.collection.all();
    console.log(JSON.stringify(artists, null, 2));
  } catch (error) {
    console.log(error);
  }
};

getCollections();
