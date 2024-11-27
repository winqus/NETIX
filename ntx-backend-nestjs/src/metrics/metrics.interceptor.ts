import { CallHandler, ExecutionContext, Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram } from 'prom-client';
import { Observable, tap } from 'rxjs';

@Injectable()
export class MetricsInterceptor {
  private readonly requestDuration: Histogram<string>;

  constructor(
    @InjectMetric('request_counter') public counter: Counter<string>,
    @InjectMetric('http_request_duration_ms') private readonly duration: Histogram<string>,
  ) {
    this.requestDuration =
      duration ||
      new Histogram({
        name: 'http_request_duration_ms',
        help: 'Duration of HTTP requests in ms',
        labelNames: ['method', 'route', 'code'],
        buckets: [0.1, 5, 15, 50, 100, 200, 300, 400, 500, 1000],
      });
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method = req.method;
    const route = req.route?.path || req.url;
    const code = req.client._httpMessage.statusCode;

    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;

        this.counter.labels(method, route).inc();
        this.requestDuration.labels(method, route, code).observe(duration);
      }),
    );
  }
}
