import { Workspace, connection } from "..";
import { initializeKeypair } from "../initializeKeypair";

export const getArtists = async () => {
  try {
    const authority = await initializeKeypair(connection, "artist1");
    const workspace = new Workspace(authority);
    const artists = await workspace.program.account.artist.all();
    console.log(JSON.stringify(artists, null, 2));
  } catch (error) {
    console.log(error);
  }
};

getArtists();
