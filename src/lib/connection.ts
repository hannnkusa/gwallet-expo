import { Cluster, clusterApiUrl, Connection, Commitment } from '@solana/web3.js';

// SEE CONNECTION PROVIDE FOR REFERENCE 
// TO CONNECT TO NON-LOCAL SOLANA CLUSTER

// export interface Network {
//   id: string;
//   name: string;
//   endpoint: Cluster;
// }

// const networks: Network[] = [
//   {id: 'devnet', name: 'Devnet', endpoint: 'devnet'},
//   {id: 'mainnet-beta', name: 'Mainnet Beta', endpoint: 'mainnet-beta'},
//   {id: 'testnet', name: 'Testnet', endpoint: 'testnet'},
// ];



export function getConnection(commitment: Commitment = 'singleGossip'): Connection {
  return new Connection('http://127.0.0.1:8899', commitment)
}