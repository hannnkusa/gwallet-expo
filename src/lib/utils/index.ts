import { PublicKey } from "@solana/web3.js";
import { getConnection } from "../connection";

/**
 * Find token meta account for user for a specific mint  
 * @param walletAddress 
 * @param tokenMintAddress 
 * @returns 
 */
 export async function findTokenAddress(
  walletAddress: PublicKey,
  tokenMintAddress: PublicKey
): Promise<PublicKey> {

  const connection = getConnection()
  const response = await connection.getParsedTokenAccountsByOwner(
    walletAddress,
    { mint: tokenMintAddress }
  );

  const tokenAddrs = response.value;
  if (tokenAddrs.length === 0) {
    throw new Error('User does not have token account of associated mint.');
  } else if (tokenAddrs.length > 1){
    throw new Error('User must not have token account of the same mint more than 1.')
  }

  return tokenAddrs[0].pubkey;
}