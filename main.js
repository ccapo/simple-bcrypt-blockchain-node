'strict mode';

const Blockchain = require('./lib/blockchain').Blockchain;
const NROUNDS = 17; // (Generate+Validate) 16 => 10 s, 17 => 20 s, 18 => 40 s, 19 => 80 s

let bc = new Blockchain(NROUNDS);

let firstData = {id: Math.floor(1000.0 * Math.random()), text: 'I think therefore I am'};

(async () => {
  try {
    let firstBlock = await bc.generateNewBlock(null, firstData);
    console.log(firstBlock);
    let status = await bc.addGenesisBlock(firstBlock);
    let newData = {id: Math.floor(1000.0 * Math.random()), text: 'Cogito Ergo Sum'};
    let newBlock = await bc.generateNewBlock(firstBlock.hash, newData);
    console.log(newBlock);
    status = await bc.addNewBlock(newBlock);
    console.log(`addNewBlock: ${status}`);
  } catch (err) {
    console.log(`Error: ${err.message}`);
  }
})();
