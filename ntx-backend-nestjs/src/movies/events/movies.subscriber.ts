import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MovieAuditLog } from '../entities/movie-audit-log.entity';
import { MovieAuditLogsRepository } from '../movie-audit-logs.repository';
import {
  MovieBackdropUpdatedEvent,
  MovieCreatedEvent,
  MovieDeletedEvent,
  MovieEvent,
  MoviePosterUpdatedEvent,
  MoviePublishedEvent,
  MovieUnpublishedEvent,
  MovieUpdatedEvent,
  MovieVideoUpdatedEvent,
} from './movies.events';

@Injectable()
export class MovieEventSubscriber {
  private readonly logger = new Logger(MovieEventSubscriber.name);

  constructor(private readonly auditLogRepo: MovieAuditLogsRepository) {}

  @OnEvent(MovieEvent.Created)
  async handleMovieCreatedEvent(event: MovieCreatedEvent) {
    try {
      const log = await MovieAuditLog.create({
        event: 'movie.created',
        movieId: event.id,
        changes: {},
      });
      await this.auditLogRepo.createLog(log);
    } catch (error) {
      this.logger.error(`handleMovieCreatedEvent: ${error.message}`);
    }
  }

  @OnEvent('movie.updated')
  async handleMovieUpdatedEvent(event: MovieUpdatedEvent) {
    try {
      this.logger.log(`Handling 'movie.updated' event for movie ${event.id}`);
      const log = await MovieAuditLog.create({
        event: 'movie.updated',
        movieId: event.id,
        changes: event.changes,
      });
      await this.auditLogRepo.createLog(log);
    } catch (error) {
      this.logger.error(`handleMovieUpdatedEvent: ${error.message}`);
    }
  }

  @OnEvent('movie.published')
  async handleMoviePublishedEvent(event: MoviePublishedEvent) {
    try {
      this.logger.log(`Handling 'movie.published' event for movie ${event.id}`);
      const log = await MovieAuditLog.create({
        event: 'movie.published',
        movieId: event.id,
        changes: {},
      });
      await this.auditLogRepo.createLog(log);
    } catch (error) {
      this.logger.error(`handleMoviePublishedEvent: ${error.message}`);
    }
  }

  @OnEvent('movie.unpublished')
  async handleMovieUnpublishedEvent(event: MovieUnpublishedEvent) {
    try {
      this.logger.log(`Handling 'movie.unpublished' event for movie ${event.id}`);
      const log = await MovieAuditLog.create({
        event: 'movie.unpublished',
        movieId: event.id,
        changes: {},
      });
      await this.auditLogRepo.createLog(log);
    } catch (error) {
      this.logger.error(`handleMovieUnpublishedEvent: ${error.message}`);
    }
  }

  @OnEvent('movie.deleted')
  async handleMovieDeletedEvent(event: MovieDeletedEvent) {
    try {
      this.logger.log(`Handling 'movie.deleted' event for movie ${event.id}`);
      const log = await MovieAuditLog.create({
        event: 'movie.deleted',
        movieId: event.id,
        changes: {},
      });
      await this.auditLogRepo.createLog(log);
    } catch (error) {
      this.logger.error(`handleMovieDeletedEvent: ${error.message}`);
    }
  }

  @OnEvent('movie.posterUpdated')
  async handleMoviePosterUpdatedEvent(event: MoviePosterUpdatedEvent) {
    try {
      this.logger.log(`Handling 'movie.posterUpdated' event for movie ${event.id}`);
      const log = await MovieAuditLog.create({
        event: 'movie.posterUpdated',
        movieId: event.id,
        changes: { posterID: event.posterID },
      });
      await this.auditLogRepo.createLog(log);
    } catch (error) {
      this.logger.error(`handleMoviePosterUpdatedEvent: ${error.message}`);
    }
  }

  @OnEvent('movie.backdropUpdated')
  async handleMovieBackdropUpdatedEvent(event: MovieBackdropUpdatedEvent) {
    try {
      this.logger.log(`Handling 'movie.backdropUpdated' event for movie ${event.id}`);
      const log = await MovieAuditLog.create({
        event: 'movie.backdropUpdated',
        movieId: event.id,
        changes: { backdropID: event.backdropID },
      });
      await this.auditLogRepo.createLog(log);
    } catch (error) {
      this.logger.error(`handleMovieBackdropUpdatedEvent: ${error.message}`);
    }
  }

  @OnEvent('movie.videoUpdated')
  async handleMovieVideoUpdatedEvent(event: MovieVideoUpdatedEvent) {
    try {
      this.logger.log(`Handling 'movie.videoUpdated' event for movie ${event.id}`);
      const log = await MovieAuditLog.create({
        event: 'movie.videoUpdated',
        movieId: event.id,
        changes: { videoID: event.videoID },
      });
      await this.auditLogRepo.createLog(log);
    } catch (error) {
      this.logger.error(`handleMovieVideoUpdatedEvent: ${error.message}`);
    }
  }
}
