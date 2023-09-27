import {
  createFromIdls,
  RenderJavaScriptVisitor,
} from "@metaplex-foundation/kinobi";

// Instantiate Kinobi.
const kinobi = createFromIdls(["./target/idl/dpl_protocol.json"]);

// Render JavaScript.
kinobi.accept(new RenderJavaScriptVisitor("./sdk"));
