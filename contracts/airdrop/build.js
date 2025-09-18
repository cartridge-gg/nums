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
    name: "Nums Airdrop",
    description: "Nums Airdrop",
    network: "STARKNET",
    contract: "0x123",
    entrypoint: "claim_from_forwarder",
    salt: "0x0",
    data,
  };

  fs.writeFileSync("./merkle.json", JSON.stringify(merkle, null, 2));
};

main();
