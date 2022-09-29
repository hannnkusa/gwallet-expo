import { TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js"
import { Schema } from "borsh"

import { AccountUtil, getAccount } from "./account"
import { getConnection } from "./connection"
import { JAGAD_ADDRESS, PAYMENT_PROGRAM_ID } from "./constant"
import { IxHeader, ProgramInstruction } from "./instruction"


type PaymentPayload = {
  amount: bigint,
  destination: string,
  note: string
}


export class Payment extends ProgramInstruction {
  amount: bigint
  destination: string
  note: string

  constructor(payload: PaymentPayload) {
    // validation
    if (payload.note.length > 50) {
      throw new Error('Note cannot exceed 50 characters.')
    }

    super()

    this.amount = payload.amount
    this.destination = payload.destination
    this.note = payload.note
  }

  getHeader(): Buffer {
    return Buffer.from(new Uint8Array([IxHeader.PAYMENT]))
  }

  getSchema(): Schema {
    return new Map([
      [Payment, {kind: 'struct', fields: [
        ['amount', 'u64'],
        ['destination', 'string'],
        ['note', 'string']
      ]}]
    ])
  }

  private async getInstruction(): Promise<TransactionInstruction> {
    const program_id = new PublicKey(PAYMENT_PROGRAM_ID)

    const account = getAccount()
    const sender_main_account = await account.getPublicKey()
    const user_gidr = await account.getGidrAddress()
    const jagad_gidr = await AccountUtil.getGidrFromPubkey(new PublicKey(JAGAD_ADDRESS))
    const destination_gidr = await AccountUtil.getGidrFromPubkey(new PublicKey(this.destination))

    const ix = new TransactionInstruction({
      programId: program_id,
      keys: [
        { pubkey: sender_main_account, isSigner: true, isWritable: true},  // sender main wallet for signer
        { pubkey: user_gidr, isSigner: false, isWritable: true}, // sender gidr token account
        { pubkey: destination_gidr, isSigner: false, isWritable: true},  // destination gidr token account
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false}, // token program
        { pubkey: jagad_gidr, isSigner: false, isWritable: true}, // Jagad account for receiving 
      ],

      data: Buffer.from(this.serialize())
    })


    return ix
  }


  async pay(pin: string) {
    const connection = getConnection()
    const account = getAccount()

    const tx = new Transaction().add(await this.getInstruction())
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
    tx.feePayer = await account.getPublicKey()

    // tx is signed in place, mofiying input parameters (tx)
    await account.signTransaction(tx, pin)
    const tx_sig = await connection.sendRawTransaction(tx.serialize())
    console.log(tx_sig)
  }
}