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
  
  async getLatestBlock() {
		if (this.blockchain.length > 0) {
      return this.blockchain[this.blockchain.length - 1];
    } else {
      throw new Error('Blockchain is empty');
    }
  };
  
  async calculateHash(previousHash, data, timestamp = null) {
    timestamp = timestamp || new Date().toISOString();
    let dataSafe = JSON.stringify(data);
    let payload = `${dataSafe}_${previousHash}_${timestamp}`;
    //console.log(`Payload: ${payload}`);
    let hash = await bcrypt.hash(payload, this.nrounds);

    return {
      hash: hash,
      timestamp: timestamp
    };
  }
  
  async validateHashForBlock(block) {
    if (block && block.hasOwnProperty('previousHash') && block.hasOwnProperty('data') && block.hasOwnProperty('timestamp')) {
      let dataSafe = JSON.stringify(block.data);
      let payload = `${dataSafe}_${block.previousHash}_${block.timestamp}`;
      let status = await bcrypt.compare(payload, block.hash);
			return status;
    } else {
      throw new Error('Block is null or undefined');
    }
  }
  
  async generateNewBlock(previousHash, data) {
    let result = await this.calculateHash(previousHash, data);
    return {
      previousHash: previousHash,
      timestamp: result.timestamp,
      data: data,
      hash: result.hash
    };
  }
  
  async validateNewBlock(previousBlock, newBlock) {
    // Confirm if hash of previous block matches previousHash of new block
    if (previousBlock.hash === newBlock.previousHash) {
      // Validate hash of new block matches its payload
      let status = await this.validateHashForBlock(newBlock);
			return status;
    } else {
      throw new Error('Invalid previous hash for new block');
    }
  }
  
  async addNewBlock(newBlock) {
		let latestBlock = await this.getLatestBlock();
    let status = await this.validateNewBlock(latestBlock, newBlock);
    if (status === true) {
      this.blockchain.push(newBlock);
    }
    return status;
  }
  
  async addGenesisBlock(newBlock) {
    // Validate hash of genesis block matches its payload
    let status = await this.validateHashForBlock(newBlock);
    if (status === true) {
      this.blockchain = [];
      this.blockchain.push(newBlock);
    }
    return status;
  }
}

module.exports.Blockchain = Blockchain;
