import { Observable } from 'rxjs';
import { User } from './user.entity';

export interface LoginOptions {
  returnTo?: string;
}

export abstract class AuthService {
  public abstract isReady(timeoutMs?: number): Observable<boolean>;
  public abstract get user(): Observable<User | null>;
  public abstract get type(): string;
  public abstract login(options?: LoginOptions): Observable<void>;
  public abstract logout(): Observable<void>;

  public static getType(): string {
    throw new Error('Derived classes must implement getType()');
  }
}
