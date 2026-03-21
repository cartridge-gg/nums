import { atom } from "jotai";
import type * as torii from "@dojoengine/torii-wasm";

export const toriiClientAtom = atom<torii.ToriiClient | null>(null);
