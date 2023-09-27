import { Workspace, connection } from "..";
import { initializeKeypair } from "../initializeKeypair";

export const getUsers = async () => {
  try {
    const authority = await initializeKeypair(connection, "user1");
    const workspace = new Workspace(authority);
    const users = await workspace.program.account.user.all();
    console.log(JSON.stringify(users, null, 2));
  } catch (error) {
    console.log(error);
  }
};

getUsers();
