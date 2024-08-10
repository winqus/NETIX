import { Document, FilterQuery, Model, UpdateQuery } from 'mongoose';

export abstract class EntityRepository<T> {
  constructor(protected readonly entityModel: Model<T & Document>) {}

  public async exists(entityFilterQuery: FilterQuery<T>): Promise<boolean> {
    const entity = await this.entityModel.findOne(entityFilterQuery).exec();

    return entity != null;
  }

  public async findByUUID(uuid: string): Promise<T | null> {
    return this.entityModel.findOne({ uuid }, { _id: 0, __v: 0 }).exec();
  }

  public async findOne(entityFilterQuery: FilterQuery<T>, projection?: Record<string, unknown>): Promise<T | null> {
    return this.entityModel
      .findOne(entityFilterQuery, {
        _id: 0,
        __v: 0,
        ...projection,
      })
      .exec();
  }

  public async find(entityFilterQuery: FilterQuery<T>): Promise<T[] | null> {
    return this.entityModel.find(entityFilterQuery);
  }

  public async create(createEntityData: unknown): Promise<T> {
    const entity = new this.entityModel(createEntityData);

    const savedEntity = (await entity.save()).toObject({
      versionKey: false,
      transform: (_doc, ret, _options) => {
        delete ret._id;

        return ret;
      },
    });

    return savedEntity;
  }

  public async findOneAndUpdate(
    entityFilterQuery: FilterQuery<T>,
    updateEntityData: UpdateQuery<unknown>,
  ): Promise<T | null> {
    return this.entityModel.findOneAndUpdate(entityFilterQuery, updateEntityData, {
      new: true,
    });
  }

  public async deleteOne(entityFilterQuery: FilterQuery<T>): Promise<boolean> {
    const deleteResult = await this.entityModel.deleteOne(entityFilterQuery);

    return deleteResult.deletedCount === 1;
  }

  public async deleteMany(entityFilterQuery: FilterQuery<T>): Promise<boolean> {
    const deleteResult = await this.entityModel.deleteMany(entityFilterQuery);

    return deleteResult.deletedCount >= 1;
  }
}
