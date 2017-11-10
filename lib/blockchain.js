'strict mode';

const bcrypt = require('bcrypt');
const NROUNDS = 19;

/**
 * Blockchain class
 */
class Blockchain {
  constructor(nrounds = NROUNDS) {
    this.nrounds = nrounds;
    this.blockchain = [];
  }
  
  getLatestBlock() {
    return new Promise((resolve, reject) => {
      if (this.blockchain.length > 0) {
        resolve(this.blockchain[this.blockchain.length - 1]);
      } else {
        reject(new Error('Blockchain is empty'));
      }
    });
  };
  
  calculateHash(previousHash, data, timestamp = null) {
    return new Promise((resolve, reject) => {
      timestamp = timestamp || new Date().toISOString();
      let dataSafe = JSON.stringify(data);
      let payload = `${dataSafe}_${previousHash}_${timestamp}`;
      //console.log(`Payload: ${payload}`);
      return bcrypt.hash(payload, this.nrounds).then(hash => {
        resolve({
          hash: hash,
          timestamp: timestamp
        });
      }).catch(err => {
        reject(err);
      });
    });
  }
  
  validateHashForBlock(block) {
    return new Promise((resolve, reject) => {
      if (block && block.hasOwnProperty('previousHash') && block.hasOwnProperty('data') && block.hasOwnProperty('timestamp')) {
        let dataSafe = JSON.stringify(block.data);
        let payload = `${dataSafe}_${block.previousHash}_${block.timestamp}`;
        return bcrypt.compare(payload, block.hash).then(status => {
          resolve(status);
        }).catch(err => {
          reject(err);
        });
      } else {
        reject(new Error('Block is null or undefined'));
      }
    });
  }
  
  generateNewBlock(previousHash, data) {
    return new Promise((resolve, reject) => {
      return this.calculateHash(previousHash, data).then(result => {
        resolve({
          previousHash: previousHash,
          timestamp: result.timestamp,
          data: data,
          hash: result.hash
        });
      }).catch(err => {
        reject(err);
      });
    });
  }
  
  validateNewBlock(previousBlock, newBlock) {
    return new Promise((resolve, reject) => {
      // Confirm if hash of previous block matches previousHash of new block
      if (previousBlock.hash === newBlock.previousHash) {
        // Validate hash of new block matches its payload
        return this.validateHashForBlock(newBlock).then(status => {
          resolve(status);
        }).catch(err => {
          reject(err);
        });
      } else {
        reject(new Error('Invalid previous hash for new block'));
      }
    });
  }
  
  addNewBlock(newBlock) {
    return new Promise((resolve, reject) => {
      return this.getLatestBlock().then(latestBlock => {
        return this.validateNewBlock(latestBlock, newBlock);
      }).then(status => {
        if (status === true) {
          this.blockchain.push(newBlock);
        }
        resolve(status);
      }).catch(err => {
        reject(err);
      });
    });
  }
  
  addGenesisBlock(newBlock) {
    return new Promise((resolve, reject) => {
      this.blockchain = [];
      this.blockchain.push(newBlock);
      resolve(true);
    });
  }
}

module.exports.Blockchain = Blockchain;
