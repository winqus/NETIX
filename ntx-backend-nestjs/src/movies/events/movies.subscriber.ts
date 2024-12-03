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
        event: MovieEvent.Created,
        movieID: event.movieID,
        changes: {},
        userID: event.userID,
        username: event.username,
      });
      await this.auditLogRepo.createLog(log);
    } catch (error) {
      this.logger.error(`handleMovieCreatedEvent: ${error.message}`);
    }
  }

  @OnEvent(MovieEvent.Updated)
  async handleMovieUpdatedEvent(event: MovieUpdatedEvent) {
    try {
      this.logger.log(`Handling 'movie.updated' event for movie ${event.movieID}`);
      const log = await MovieAuditLog.create({
        event: MovieEvent.Updated,
        movieID: event.movieID,
        changes: event.changes,
        userID: event.userID,
        username: event.username,
      });
      await this.auditLogRepo.createLog(log);
    } catch (error) {
      this.logger.error(`handleMovieUpdatedEvent: ${error.message}`);
    }
  }

  @OnEvent(MovieEvent.Published)
  async handleMoviePublishedEvent(event: MoviePublishedEvent) {
    try {
      this.logger.log(`Handling 'movie.published' event for movie ${event.movieID}`);
      const log = await MovieAuditLog.create({
        event: MovieEvent.Published,
        movieID: event.movieID,
        changes: {},
        userID: event.userID,
        username: event.username,
      });
      await this.auditLogRepo.createLog(log);
    } catch (error) {
      this.logger.error(`handleMoviePublishedEvent: ${error.message}`);
    }
  }

  @OnEvent(MovieEvent.Unpublished)
  async handleMovieUnpublishedEvent(event: MovieUnpublishedEvent) {
    try {
      this.logger.log(`Handling 'movie.unpublished' event for movie ${event.movieID}`);
      const log = await MovieAuditLog.create({
        event: MovieEvent.Unpublished,
        movieID: event.movieID,
        changes: {},
        userID: event.userID,
        username: event.username,
      });
      await this.auditLogRepo.createLog(log);
    } catch (error) {
      this.logger.error(`handleMovieUnpublishedEvent: ${error.message}`);
    }
  }

  @OnEvent(MovieEvent.Deleted)
  async handleMovieDeletedEvent(event: MovieDeletedEvent) {
    try {
      this.logger.log(`Handling 'movie.deleted' event for movie ${event.movieID}`);
      const log = await MovieAuditLog.create({
        event: MovieEvent.Deleted,
        movieID: event.movieID,
        changes: {},
        userID: event.userID,
        username: event.username,
      });
      await this.auditLogRepo.createLog(log);
    } catch (error) {
      this.logger.error(`handleMovieDeletedEvent: ${error.message}`);
    }
  }

  @OnEvent(MovieEvent.PosterUpdated)
  async handleMoviePosterUpdatedEvent(event: MoviePosterUpdatedEvent) {
    try {
      this.logger.log(`Handling 'movie.posterUpdated' event for movie ${event.movieID}`);
      const log = await MovieAuditLog.create({
        event: MovieEvent.PosterUpdated,
        movieID: event.movieID,
        changes: { posterID: event.posterID },
        userID: event.userID,
        username: event.username,
      });
      await this.auditLogRepo.createLog(log);
    } catch (error) {
      this.logger.error(`handleMoviePosterUpdatedEvent: ${error.message}`);
    }
  }

  @OnEvent(MovieEvent.BackdropUpdated)
  async handleMovieBackdropUpdatedEvent(event: MovieBackdropUpdatedEvent) {
    try {
      this.logger.log(`Handling 'movie.backdropUpdated' event for movie ${event.movieID}`);
      const log = await MovieAuditLog.create({
        event: MovieEvent.BackdropUpdated,
        movieID: event.movieID,
        changes: { backdropID: event.backdropID },
        userID: event.userID,
        username: event.username,
      });
      await this.auditLogRepo.createLog(log);
    } catch (error) {
      this.logger.error(`handleMovieBackdropUpdatedEvent: ${error.message}`);
    }
  }

  @OnEvent(MovieEvent.VideoUpdated)
  async handleMovieVideoUpdatedEvent(event: MovieVideoUpdatedEvent) {
    try {
      this.logger.log(`Handling 'movie.videoUpdated' event for movie ${event.movieID}`);
      const log = await MovieAuditLog.create({
        event: MovieEvent.VideoUpdated,
        movieID: event.movieID,
        changes: { videoID: event.videoID },
        userID: event.userID,
        username: event.username,
      });
      await this.auditLogRepo.createLog(log);
    } catch (error) {
      this.logger.error(`handleMovieVideoUpdatedEvent: ${error.message}`);
    }
  }
}
