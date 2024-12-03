import { InjectionToken } from '@angular/core';
import { JwtServiceConfig } from './jwt.service';

export const JWT_SERVICE_CONFIG = new InjectionToken<JwtServiceConfig>('JwtServiceConfigToken');
