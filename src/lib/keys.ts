/**
 * This module define all key used for AsyncStorage.
 * All keys must be listed here. Never hard-code
 * in other module.
 * 
 * Reason: since AsyncStorage is global, we must
 * prevent any key duplication.
 */
export const iv = '@iv';
export const secret_key_encrypted = '@sk/encrypted'
export const secret_key_interstate = '@sk/interstate'
export const public_key = '@wallet/address'
export const stored_password = '@wallet/hashed_password'
export const app_state = '@app/state'


export default {
  iv,
  secret_key_encrypted,
  secret_key_interstate,
  public_key,
  stored_password,
  app_state,
}