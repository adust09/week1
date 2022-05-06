const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const { groth16, plonk } = require("snarkjs");

function unstringifyBigInts(o) {
  if (typeof o == "string" && /^[0-9]+$/.test(o)) {
    return BigInt(o);
  } else if (typeof o == "string" && /^0x[0-9a-fA-F]+$/.test(o)) {
    return BigInt(o);
  } else if (Array.isArray(o)) {
    return o.map(unstringifyBigInts);
  } else if (typeof o == "object") {
    if (o === null) return null;
    const res = {};
    const keys = Object.keys(o);
    keys.forEach((k) => {
      res[k] = unstringifyBigInts(o[k]);
    });
    return res;
  } else {
    return o;
  }
}

describe("HelloWorld", function () {
  let Verifier;
  let verifier;

  beforeEach(async function () {
    Verifier = await ethers.getContractFactory("HelloWorldVerifier");
    verifier = await Verifier.deploy();
    await verifier.deployed();
  });

  it("Should return true for correct proof", async function () {
    //[assignment] Add comments to explain what each line is doing
    //テストデータとして、a,bを用意する
    //パブリックなインプットとして、プルーフを作成する
    //wasmとzkeyは検証用に用意する
    // publicSignals;-input
    const { proof, publicSignals } = await groth16.fullProve(
      { a: "1", b: "2" },
      "contracts/circuits/HelloWorld/HelloWorld_js/HelloWorld.wasm",
      "contracts/circuits/HelloWorld/circuit_final.zkey"
    );

    // console.log("1x2 =", publicSignals[0]);

    //publicSignalsとploofについて、BigIntsの文字列化を解除する
    const editedPublicSignals = unstringifyBigInts(publicSignals);
    const editedProof = unstringifyBigInts(proof);
    // これらをgroth16検証コントラクトのコールデータとして渡す
    const calldata = await groth16.exportSolidityCallData(
      editedProof,
      editedPublicSignals
    );

    //calldataをstringa型配列のコマンドライン引数として生成する
    const argv = calldata
      .replace(/["[\]\s]/g, "")
      .split(",")
      .map((x) => BigInt(x).toString());

    //a~cは検証側でproofを生成するために、Inputは最終的にproofと比較するために使用される
    // 配列のデータ構造は使用する楕円曲線の生成元g1,g2に由来している
    const a = [argv[0], argv[1]];
    const b = [
      [argv[2], argv[3]],
      [argv[4], argv[5]],
    ];
    const c = [argv[6], argv[7]];
    const Input = argv.slice(8);

    //最終的に、HelloWorldVerifier.verifyProofを呼び出す
    expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
  });

  it("Should return false for invalid proof", async function () {
    let a = [0, 0];
    let b = [
      [0, 0],
      [0, 0],
    ];
    let c = [0, 0];
    let d = [0];
    expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
  });
});

describe("Multiplier3 with Groth16", function () {
  beforeEach(async function () {
    //[assignment] insert your script here
    Verifier = await ethers.getContractFactory("Multiplier3Verifier");
    verifier = await Verifier.deploy();
    await verifier.deployed();
  });

  it("Should return true for correct proof", async function () {
    //[assignment] insert your script here
    const { proof, publicSignals } = await groth16.fullProve(
      { a: "1", b: "2", c: "3" },
      "contracts/circuits/Multiplier3/Multiplier3_js/Multiplier3.wasm",
      "contracts/circuits/Multiplier3/circuit_final.zkey"
    );

    // console.log("1x2 =", publicSignals[0]);

    const editedPublicSignals = unstringifyBigInts(publicSignals);
    const editedProof = unstringifyBigInts(proof);
    const calldata = await groth16.exportSolidityCallData(
      editedProof,
      editedPublicSignals
    );

    const argv = calldata
      .replace(/["[\]\s]/g, "")
      .split(",")
      .map((x) => BigInt(x).toString());

    const a = [argv[0], argv[1]];
    const b = [
      [argv[2], argv[3]],
      [argv[4], argv[5]],
    ];
    const c = [argv[6], argv[7]];
    const Input = argv.slice(8);

    expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
  });

  it("Should return false for invalid proof", async function () {
    //[assignment] insert your script here
    let a = [0, 0];
    let b = [
      [0, 0],
      [0, 0],
    ];
    let c = [0, 0];
    let d = [0, 0];
    expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
  });
});

describe("Multiplier3 with PLONK", function () {
  beforeEach(async function () {
    //[assignment] insert your script here
    Verifier = await ethers.getContractFactory("PlonkVerifier");
    verifier = await Verifier.deploy();
    await verifier.deployed();
  });

  it("Should return true for correct proof", async function () {
    //[assignment] insert your script here
    const { proof, publicSignals } = await plonk.fullProve(
      { a: "1", b: "2", c: "3" },
      "contracts/circuits/_plonkMultiplier3/Multiplier3_js/Multiplier3.wasm",
      "contracts/circuits/_plonkMultiplier3/circuit_plonk.zkey"
    );

    //publicSignalsとploofについて、BigIntsの文字列化を解除する
    const editedPublicSignals = unstringifyBigInts(publicSignals);
    const editedProof = unstringifyBigInts(proof);
    // これらをgroth16検証コントラクトのコールデータとして渡す
    //"0x.."が返ってくる
    const text = await plonk.exportSolidityCallData(
      editedProof,
      editedPublicSignals
    );

    let calldata = text.split(",");
    let a = calldata[1] + "," + calldata[2];

    // console.log("1x2 =", publicSignals[0]);
    // console.log("text=", text);
    // console.log("=================================");
    // console.log("calldata=", calldata);
    // console.log("=================================");
    // console.log("calldata[0]=", calldata[0]);
    // console.log("=================================");
    // console.log("calldata[1]=", calldata[1]);
    // console.log("=================================");
    // console.log("calldata[2]=", calldata[2]);
    // console.log("=================================");
    // console.log("calldata[1] + calldata[2]", calldata[1] + "," + calldata[2]);
    // //parseがうまくいってないのが原因
    // console.log("a=", a);
    // console.log("=================================");
    // console.log("JSON.parse(a))", JSON.parse(a));

    expect(await verifier.verifyProof(calldata[0], JSON.parse(a))).to.be.true;
  });

  it("Should return false for invalid proof", async function () {
    //[assignment] insert your script here
    let a = "0x00";
    let b = ["0"];
    expect(await verifier.verifyProof(a, b)).to.be.false;
  });
});
