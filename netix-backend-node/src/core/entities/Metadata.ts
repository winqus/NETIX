import { Result } from '../logic/Result';
import { MetadataState } from '../states/MetadataState';
import Entity from './Entity';
import UniqueEntityID from './UniqueEntityID';

interface MetadataProps {
  title?: string;
  originallyPublishedAt?: Date;
  state?: MetadataState;
}

export default class Metadata extends Entity<MetadataProps> {
  get state(): MetadataState {
    return this.props.state || MetadataState.PENDING;
  }

  get ready(): boolean {
    return this.state === MetadataState.READY;
  }

  get title(): string {
    if (!this.ready) {
      throw new Error('Cannot access title of a metadata that is not ready');
    }

    return this.props.title || 'No title';
  }

  get originallyPublishedAt(): Date {
    if (!this.ready) {
      throw new Error('Cannot access originallyPublishedAt of a metadata that is not ready');
    }

    return this.props.originallyPublishedAt || new Date();
  }

  private constructor(props: MetadataProps, uuid?: UniqueEntityID, createdAt?: Date, updatedAt?: Date) {
    super(props, uuid, createdAt, updatedAt);
  }

  public static create(props: MetadataProps, uuid?: UniqueEntityID, createdAt?: Date, updatedAt?: Date): Result<Metadata> {
    if (props.state && Object.values(MetadataState).includes(props.state) && props.state === MetadataState.READY) {
      if (props.title == null) {
        return Result.fail('Title is required');
      }

      if (props.originallyPublishedAt == null) {
        return Result.fail('Originally published at is required');
      }
    }

    if (props.state == null) {
      props.state = MetadataState.PENDING;
    }

    const metadata = new Metadata(props as MetadataProps, uuid, createdAt, updatedAt);

    return Result.ok(metadata);
  }
}
