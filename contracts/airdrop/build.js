#!/usr/bin/env node

import fs from "fs";

const main = () => {
  const eligible = fs.readFileSync("./eligible.txt").toString();
  const controllers = JSON.parse(
    fs.readFileSync("./allControllers.json").toString()
  );

  const names = eligible.split("\n").map((i) => {
    const start = i.indexOf('"');
    const end = i.indexOf('"', 1);

    return i.substring(start + 1, end);
  });

  const data = names.flatMap((name) => {
    const controller = controllers.find((i) => i.username === name);
    if (!controller) {
      console.warn("controller not found", name);
      return [];
    }

    return [[controller.address, [5_000]]];
  });

  const merkle = {
    name: "Test Nums Airdrop",
    description: "Test Nums Airdrop",
    network: "STARKNET",
    claim_contract: "0x03f43caceaf40a832740cad5a3919b05f2996df28d1e1f423b54a243a47f5380",
    entrypoint: "claim_from_forwarder",
    salt: "0x0",
    snapshot: data,
  };

  fs.writeFileSync("./merkle.json", JSON.stringify(merkle, null, 2));
};

main();

// 

// ✅ Merkle Drop Created Successfully
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🏢 Details:
//   • ID: cmfprax1k000v01by20zd56sd
//   • Name: Test Nums Airdrop
//   • Description: Test Nums Airdrop

// 🔗 Contract Details:
//   • Network: STARKNET
//   • Claim Contract: 0x3f43caceaf40a832740cad5a3919b05f2996df28d1e1f423b54a243a47f5380
//   • Entrypoint: claim_from_forwarder
//   • Salt: 0x0

// 🌳 Merkle Details:
//   • Root: 0x4cd3ae33ab222e939439a7eda4b6bbe4d179faae14f61c418f2e8677ce013c5
//   • Entries: 4650
//   • Created: 2025-09-18T18:40:58.568398Z
