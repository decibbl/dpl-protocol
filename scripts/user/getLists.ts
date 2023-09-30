import { Workspace, connection } from "..";
import { initializeKeypair } from "../initializeKeypair";

export const getLists = async () => {
  try {
    const authority = await initializeKeypair(connection, "user1");
    const workspace = new Workspace(authority);
    const lists = await workspace.program.account.list.all();
    console.log(JSON.stringify(lists, null, 2));
  } catch (error) {
    console.log(error);
  }
};

getLists();
