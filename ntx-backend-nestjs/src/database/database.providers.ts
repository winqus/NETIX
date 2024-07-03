import * as mongoose from 'mongoose';

export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: (): Promise<typeof mongoose> =>
      mongoose.connect(
        'mongodb://user_m1:pass_m1@127.0.0.1:27018?authMechanism=DEFAULT',
        { autoIndex: true },
      ),
  },
];
