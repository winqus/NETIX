import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AuditLog } from '../entities/movie.event.entity';
import { AuditLogRepository } from '../movies.events.repository';
import {
  MovieBackdropUpdatedEvent,
  MovieCreatedEvent,
  MovieDeletedEvent,
  MoviePosterUpdatedEvent,
  MoviePublishedEvent,
  MovieUnpublishedEvent,
  MovieUpdatedEvent,
  MovieVideoUpdatedEvent,
} from './movies.events';

@Injectable()
export class MovieEventSubscriber {
  private readonly logger = new Logger(MovieEventSubscriber.name);

  constructor(private readonly auditLogRepo: AuditLogRepository) {}

  @OnEvent('movie.created')
  async handleMovieCreatedEvent(event: MovieCreatedEvent) {
    this.logger.log(`Handling 'movie.created' event for movie ${event.id}`);
    const log = await AuditLog.create({
      event: 'movie.created',
      movieId: event.id,
      changes: {},
    });
    await this.auditLogRepo.createLog(log);
  }

  @OnEvent('movie.updated')
  async handleMovieUpdatedEvent(event: MovieUpdatedEvent) {
    this.logger.log(`Handling 'movie.updated' event for movie ${event.id}`);
    const log = await AuditLog.create({
      event: 'movie.updated',
      movieId: event.id,
      changes: event.changes,
    });
    await this.auditLogRepo.createLog(log);
  }

  @OnEvent('movie.published')
  async handleMoviePublishedEvent(event: MoviePublishedEvent) {
    this.logger.log(`Handling 'movie.published' event for movie ${event.id}`);
    const log = await AuditLog.create({
      event: 'movie.published',
      movieId: event.id,
      changes: {},
    });
    await this.auditLogRepo.createLog(log);
  }

  @OnEvent('movie.unpublished')
  async handleMovieUnpublishedEvent(event: MovieUnpublishedEvent) {
    this.logger.log(`Handling 'movie.unpublished' event for movie ${event.id}`);
    const log = await AuditLog.create({
      event: 'movie.unpublished',
      movieId: event.id,
      changes: {},
    });
    await this.auditLogRepo.createLog(log);
  }

  @OnEvent('movie.deleted')
  async handleMovieDeletedEvent(event: MovieDeletedEvent) {
    this.logger.log(`Handling 'movie.deleted' event for movie ${event.id}`);
    const log = await AuditLog.create({
      event: 'movie.deleted',
      movieId: event.id,
      changes: {},
    });
    await this.auditLogRepo.createLog(log);
  }

  @OnEvent('movie.posterUpdated')
  async handleMoviePosterUpdatedEvent(event: MoviePosterUpdatedEvent) {
    this.logger.log(`Handling 'movie.posterUpdated' event for movie ${event.id}`);
    const log = await AuditLog.create({
      event: 'movie.posterUpdated',
      movieId: event.id,
      changes: { posterID: event.posterID },
    });
    await this.auditLogRepo.createLog(log);
  }

  @OnEvent('movie.backdropUpdated')
  async handleMovieBackdropUpdatedEvent(event: MovieBackdropUpdatedEvent) {
    this.logger.log(`Handling 'movie.backdropUpdated' event for movie ${event.id}`);
    const log = await AuditLog.create({
      event: 'movie.backdropUpdated',
      movieId: event.id,
      changes: { backdropID: event.backdropID },
    });
    await this.auditLogRepo.createLog(log);
  }

  @OnEvent('movie.videoUpdated')
  async handleMovieVideoUpdatedEvent(event: MovieVideoUpdatedEvent) {
    this.logger.log(`Handling 'movie.videoUpdated' event for movie ${event.id}`);
    const log = await AuditLog.create({
      event: 'movie.videoUpdated',
      movieId: event.id,
      changes: { videoID: event.videoID },
    });
    await this.auditLogRepo.createLog(log);
  }
}
