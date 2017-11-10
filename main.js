'strict mode';

const Blockchain = require('./lib/blockchain').Blockchain;
const NROUNDS = 13;

let bc = new Blockchain(NROUNDS);

let firstData = {id: Math.floor(1000.0 * Math.random()), text: 'I think therefore I am'};
bc.generateNewBlock(null, firstData).then(firstBlock => {
  console.log(firstBlock);
  return bc.addGenesisBlock(firstBlock).then(status => {
    console.log(`addGenesisBlock: ${status}`);
    let newData = {id: Math.floor(1000.0 * Math.random()), text: 'Cogito Ergo Sum'};
    return bc.generateNewBlock(firstBlock.hash, newData);
  }).then(newBlock => {
    console.log(newBlock);
    return bc.addNewBlock(newBlock).then(status => {
      console.log(`addNewBlock: ${status}`);
      return status;
    });
  });
}).catch(err => {
  console.log(`Error: ${err.message}`);
});
