import {
  createFromIdls,
  numberTypeNode,
  publicKeySeed,
  RenderJavaScriptVisitor,
  stringConstantSeed,
  UpdateAccountsVisitor,
  variableSeed,
} from "@metaplex-foundation/kinobi";

// Instantiate Kinobi.
const kinobi = createFromIdls(["./target/idl/dpl_protocol.json"]);

kinobi.update(
  new UpdateAccountsVisitor({
    platform: {
      seeds: [
        stringConstantSeed("platform"),
        stringConstantSeed("domain"),
        publicKeySeed("authority"),
      ],
    },
    artist: {
      seeds: [stringConstantSeed("artist"), publicKeySeed("authority")],
    },
    collection: {
      seeds: [
        stringConstantSeed("collection"),
        publicKeySeed("authority"),
        publicKeySeed("mint"),
      ],
    },
    artwork: {
      seeds: [
        stringConstantSeed("artwork"),
        publicKeySeed("authority"),
        publicKeySeed("mint"),
      ],
    },
    user: {
      seeds: [stringConstantSeed("user"), publicKeySeed("authority")],
    },
    list: {
      seeds: [
        stringConstantSeed("list"),
        publicKeySeed("authority"),
        variableSeed("listing_starts_at", numberTypeNode("i64", "le")),
      ],
    },
  })
);

// Render JavaScript.
kinobi.accept(
  new RenderJavaScriptVisitor("./target/generated", {
    prettierOptions: {
      semi: true,
      singleQuote: false,
      trailingComma: "es5",
      useTabs: false,
      tabWidth: 2,
      arrowParens: "always",
      printWidth: 80,
      parser: "typescript",
    },
  })
);
