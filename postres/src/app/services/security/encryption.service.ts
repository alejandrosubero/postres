import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {

  /**
   * ⚠️ IMPORTANTE:
   * En producción, NO hardcodear estas claves.
   * Usa environment variables o backend seguro.
   */
  private readonly SECRET_KEY = CryptoJS.enc.Utf8.parse('12345678901234567890123456789012'); // 32 bytes = AES-256
  private readonly IV = CryptoJS.enc.Utf8.parse('1234567890123456'); // 16 bytes

  constructor() {}

  /**
   * Encripta un texto usando AES-256-CBC
   */
  encrypt(plainText: string): string {
    if (!plainText) {
      throw new Error('El texto a encriptar es requerido');
    }

    const encrypted = CryptoJS.AES.encrypt(plainText, this.SECRET_KEY, {
      iv: this.IV,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    // Retorna Base64
    return encrypted.toString();
  }

  /**
   * Desencripta un texto AES
   */
  decrypt(cipherText: string): string {
    if (!cipherText) {
      throw new Error('El texto a desencriptar es requerido');
    }

    const bytes = CryptoJS.AES.decrypt(cipherText, this.SECRET_KEY, {
      iv: this.IV,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    if (!decrypted) {
      throw new Error('No se pudo desencriptar. Clave o datos inválidos');
    }

    return decrypted;
  }
}