/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import { Serializer, scalarEnum } from "@metaplex-foundation/umi/serializers";

export enum Action {
  Update,
  Remove,
}

export type ActionArgs = Action;

export function getActionSerializer(): Serializer<ActionArgs, Action> {
  return scalarEnum<Action>(Action, { description: "Action" }) as Serializer<
    ActionArgs,
    Action
  >;
}
