import { serialize, Schema } from "borsh";


export enum IxHeader {
  // WARNING: allowed value is 0 - 255
  PAYMENT = 0
}


export abstract class ProgramInstruction {

  protected abstract getHeader(): Buffer;
  protected abstract getSchema(): Schema;

  protected getMessage(): Uint8Array {
    const buffer = serialize(this.getSchema(), this);
    return buffer;
  }

  protected serialize(): Uint8Array {
    const header = Buffer.from(this.getHeader())
    const message = Buffer.from(this.getMessage())

    const result = Buffer.concat([header, message])
    return result
  }
}




