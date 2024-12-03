import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import * as jwksClient from 'jwks-rsa';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthentikJwtPayloadMapper } from '../mappings/authentik-jwt-payload.mapper';

export interface JwtStrategyConfig {
  issuerURL: string;
  jwksURL: string;
  clientID: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: JwtStrategyConfig) {
    super({
      secretOrKeyProvider: jwksClient.passportJwtSecret({
        cache: true,
        rateLimit: false,
        jwksUri: config.jwksURL,
      }),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience: config.clientID,
      issuer: config.issuerURL,
      passReqToCallback: true,
    });
  }

  validate(_request: any, jwt_payload: any, done_callback: any) {
    if (jwt_payload != null) {
      const user = AuthentikJwtPayloadMapper.payload2User(jwt_payload);
      jwt_payload['user'] = user;

      return user;
    }

    return done_callback(null, jwt_payload);
  }
}
