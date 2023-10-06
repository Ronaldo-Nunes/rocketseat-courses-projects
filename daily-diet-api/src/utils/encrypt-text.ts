import { pbkdf2Sync } from 'crypto'

export function encryptText(text: string, salt: string): string {
  return pbkdf2Sync(text, salt, 1000, 64, 'sha256').toString('hex')
}
