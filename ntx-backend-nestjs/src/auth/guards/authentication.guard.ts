import { CanActivate, ExecutionContext, Inject, Injectable, Logger } from '@nestjs/common';
import { AUTHN_GUARD_STRATEGY_TOKEN } from '../auth.constants';
import { User } from '../user.entity';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private readonly logger = new Logger(AuthenticationGuard.name);
  private readonly guardStrategy: CanActivate;

  constructor(@Inject(AUTHN_GUARD_STRATEGY_TOKEN) guardStrategy: CanActivate) {
    this.guardStrategy = guardStrategy;
  }

  public async canActivate(context: ExecutionContext) {
    try {
      const canActivate = await this.guardStrategy.canActivate(context);
      if (!canActivate) {
        this.logger.warn(`Unauthenticated access request`);

        return false;
      }

      const user = context.switchToHttp().getRequest().user as User;
      this.logger.verbose(`Authenticated user '${user.id}'`);

      return true;
    } catch (error) {
      this.logger.error(`Error during authentication: ${error.message}`);
    }

    return false;
  }
}
