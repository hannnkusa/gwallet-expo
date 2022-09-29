import { Keypair, PublicKey, Transaction } from "@solana/web3.js";
import AsyncStorage from '@react-native-async-storage/async-storage';
// @ts-ignore
import bip39 from 'react-native-bip39'
import Aes from 'react-native-aes-crypto'

import { getConnection } from "./connection";
import { GIDR_MINT } from "./constant";
import { findTokenAddress } from "./utils";
import keys from './keys'


type AccountInfo = {
  recovery_phrase: string
  address: string
}


class Account {

  /**
   * Todo function:
   * 1. change password
   * 2. change pin
   * 3. recovery (check if this works)
   */

  /**
   * Login when user input password.
   * Save interstate into memory.
   * @param password 
   */
  async login(password: string): Promise<void> {
    // only allow login with password if device already stored
    // hashed password from account creation. If not,
    // do not allow user to login, because there's no data
    // to compare to.

    // if there's no saved hashed_pass, user must import recovery
    // phrase to setup wallet.
    const stored_pass = await AsyncStorage.getItem(keys.stored_password)
    if (stored_pass === null) {
      throw new Error('Login is not available.')
    }

    // hash the password
    const hashed_pass = await this.hash(password)

    // checked the saved hashed_pass in this device
    // if match, allow login. If doesn't match,
    // do not allow login.

    // if login successful, fill in the secret key interstate
    const encrypted_sk = await AsyncStorage.getItem(keys.secret_key_encrypted)
    if (encrypted_sk === null) {
      throw new Error('Login is unsuccessful.')
    }

    const interstate = await this.decrypt(encrypted_sk, hashed_pass)
    await AsyncStorage.setItem(keys.secret_key_interstate, interstate)
    await AsyncStorage.setItem(keys.app_state, 'logged_in')
  }


  /**
   * Clear all the locally saved data.
   * Call this EVERY TIME user app is ouf of focus.
   */
  async logout(): Promise<void>{
    await AsyncStorage.removeItem(keys.secret_key_interstate)
    await AsyncStorage.setItem(keys.app_state, 'logged_out')
  }


  /**
   * Generate new account keypair.
   * Use the password and PIN code to encrypt secret key
   * and then save it to a keypair/json locally.
   * @param password
   * @param pin
   * @return secret recovery phrase
   */
  async createNewAccount(password: string, pin: string): Promise<AccountInfo> {
    // CHECK if there's stored secret key in the device. If there is,
    // cannot create new account.

    // TODO
    // validate password, must include upper case, lower case, number, and symbol
    // validate pin, must be number, must be length of 6

    // produce seed
    let mnemonic: string
    if (process.env.NODE_ENV === 'development') {
      // allow consistent address for development purpose
      mnemonic = 'access essay field advance recipe angry very bubble below run marble among'
    } else {
      // randomized in production
      mnemonic = await bip39.generateMnemonic() as string
    }
    const seed_buffer = bip39.mnemonicToSeed(mnemonic)
    const seed = new Uint8Array(seed_buffer)

    // generate account, use bip39, creating single wallet
    // bip44, HD wallet is not supported yet
    const keypair = Keypair.fromSeed(seed.slice(0, 32))

    // use pin to encrypt private key into interstate
    const iv = await this.getIv()
    const hashed_pin = await this.hash(pin)
    const interstate = await Aes.encrypt(keypair.secretKey.toString(), hashed_pin, iv, 'aes-256-cbc')

    // use password to encrypt the interstate
    const hashed_pass = await this.hash(password)
    const encrypted = await Aes.encrypt(interstate, hashed_pass, iv, 'aes-256-cbc')

    // save all account information in the device
    await AsyncStorage.setItem(keys.secret_key_encrypted, encrypted)
    await AsyncStorage.setItem(keys.public_key, keypair.publicKey.toBase58())
    await AsyncStorage.setItem(keys.iv, iv)
    await AsyncStorage.setItem(keys.stored_password, hashed_pass)
    await this.login(password)

    return {
      recovery_phrase: mnemonic,
      address: keypair.publicKey.toBase58()
    }
  }


  /**
   * Similar to creating new account.
   * Re-write instead of applying DRY for readability.
   * @param mnemonic 
   * @param password 
   * @param pin 
   */
  async recoverAccount(mnemonic: string, password: string, pin: string) {
    const seed_buffer = bip39.mnemonicToSeed(mnemonic)
    const seed = new Uint8Array(seed_buffer)
    const keypair = Keypair.fromSeed(seed.slice(0, 32))

    const iv = await this.getIv()

    // double encryption using pin and password
    const hashed_pin = await this.hash(pin)
    const interstate = await Aes.encrypt(keypair.secretKey.toString(), hashed_pin, iv, 'aes-256-cbc')

    const hashed_pass = await this.hash(password)
    const encrypted = await Aes.encrypt(interstate, hashed_pass, iv, 'aes-256-cbc')

    // save all account information in the device
    await AsyncStorage.setItem(keys.secret_key_encrypted, encrypted)
    await AsyncStorage.setItem(keys.public_key, keypair.publicKey.toBase58())
    await AsyncStorage.setItem(keys.iv, iv)
    await AsyncStorage.setItem(keys.stored_password, hashed_pass)
    await this.login(password)

    return {
      address: keypair.publicKey.toBase58()
    }
  }


  /**
   * Get initialization vector for encryption.
   * If there's is an IV in the app, use existing IV.
   * This ensure encrypt and decrypt operation use the same IV.
   */
  private async getIv(): Promise<string>{
    const key = keys.iv
    const stored_iv = await AsyncStorage.getItem(key)

    if (stored_iv !== null) {
      return stored_iv
    } else {
      const iv = await Aes.randomKey(16)
      return iv
    }
  }


  private async hash(message: string): Promise<string> {
    const hashed = await Aes.pbkdf2(message, 'salt', 5000, 256)
    return hashed
  }


  /**
   * Decrypt a message using key, producing string
   * @param message 
   * @param key 
   * @returns 
   */
  private async decrypt(message: string, key: string): Promise<string> {
    const iv = await this.getIv()
    return await Aes.decrypt(message, key, iv, 'aes-256-cbc')
  }


  async getPublicKey(): Promise<PublicKey> {
    const public_key = await AsyncStorage.getItem(keys.public_key)
    if (public_key === null){
      throw new Error('Public key is undefined')
    }
    return new PublicKey(public_key)
  }

  async getGidrAddress(): Promise<PublicKey> {
    const pubkey = await this.getPublicKey()
    return await AccountUtil.getGidrFromPubkey(pubkey)
  }

  /**
   * TODO
   * Get encrypted interstate private key stored in
   * session.
   */
  private async getInterstate(): Promise<string> {
    const interstate = await AsyncStorage.getItem(keys.secret_key_interstate)
    if (interstate === null) {
      throw new Error('Login data is missing')
    }
    return interstate
  }


  async getKeypair(pin: string): Promise<Keypair> {
    // check: if there's no interstate, then throw error. user must login first
    // to unlock interstate
    const interstate = await this.getInterstate()
    const key = await this.hash(pin) 
    const sk_string = await this.decrypt(interstate, key)

    // convert string into uint8array
    const arr_number: Array<number> = JSON.parse('[' + sk_string + ']')
    const secret_key = new Uint8Array(arr_number)

    return Keypair.fromSecretKey(secret_key)
  }


  /**
   * Receive a transaction, return signed transaction
   */
  async signTransaction(tx: Transaction, pin: string): Promise<Transaction> {
    const keypair = await this.getKeypair(pin)
    tx.sign(keypair)
    return tx
  }


  async getBalance() {
    const gidr_account = await this.getGidrAddress()
    const connection = getConnection()
    return await connection.getTokenAccountBalance(gidr_account)
  }
}


export class AccountUtil {
  static async getGidrFromPubkey(address: PublicKey): Promise<PublicKey> {
    return await findTokenAddress(
      address,
      new PublicKey(GIDR_MINT)
    )
  }
}


let account: Account
export function getAccount(): Account {
  if (account === undefined) {
    account = new Account()
  }

  return account
}
