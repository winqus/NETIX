import { Inject, Injectable, Optional } from '@angular/core';
import { JWT_SERVICE_CONFIG } from './auth.constants';

export interface JwtServiceConfig {
  /**
   * The key to store the token in the storage. Default is 'access_token'.
   */
  tokenKey: string;
  /**
   * The storage to use. Default is window.sessionStorage.
   */
  storage: Storage;
}

@Injectable({ providedIn: 'root' })
export class JwtService {
  private readonly config: Required<JwtServiceConfig>;
  private readonly defaultConfig: JwtServiceConfig = {
    tokenKey: 'access_token',
    storage: window.sessionStorage,
  };
  constructor(@Optional() @Inject(JWT_SERVICE_CONFIG) config?: JwtServiceConfig) {
    this.config = { ...this.defaultConfig, ...config };
  }

  getToken(): string | null {
    return this.config.storage.getItem(this.config.tokenKey);
  }

  saveToken(token: string): void {
    this.config.storage.setItem(this.config.tokenKey, token);
  }

  clearToken(): void {
    this.config.storage.removeItem(this.config.tokenKey);
  }
}
