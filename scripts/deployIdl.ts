import { execSync } from "child_process";
import idl from "../target/idl/dpl_protocol.json";

export const deployIdl = async () => {
  try {
    execSync(
      `anchor idl init --filepath target/idl/dpl_protocol.json ${idl.metadata.address}`,
      { stdio: "inherit" }
    );
  } catch (error) {
    console.log(error);
  }
};

deployIdl();
