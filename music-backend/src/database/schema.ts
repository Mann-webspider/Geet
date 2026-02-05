// src/database/schema.ts
import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  index,
  uniqueIndex,
  integer,
  jsonb
} from "drizzle-orm/pg-core";

// USERS TABLE
export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    username: varchar("username", { length: 100 }).notNull(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),

    isPremium: boolean("is_premium").default(false),
    isVerified: boolean("is_verified").default(false),
    isAdmin: boolean("is_admin").default(false),
    isBanned: boolean("is_banned").default(false), // NEW

    lastActiveAt: timestamp("last_active_at"), // NEW

    createdAt: timestamp("created_at", { withTimezone: false })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: false })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: false }),
  },
  (table) => ({
    emailIdx: uniqueIndex("idx_users_email").on(table.email),
    usernameIdx: uniqueIndex("idx_users_username").on(table.username),
    verifiedIdx: index("idx_users_verified").on(table.isVerified),
    adminIdx: index("idx_users_admin").on(table.isAdmin),
    bannedIdx: index("idx_users_banned").on(table.isBanned), // NEW
  })
);



export const playlists = pgTable(
  "playlists",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),

    creatorId: uuid("creator_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    isCollaborative: boolean("is_collaborative").default(false),
    isPublic: boolean("is_public").default(false),

    coverArtUrl: varchar("cover_art_url", { length: 512 }),

    trackCount: integer("track_count").default(0).notNull(),
    totalDuration: integer("total_duration").default(0).notNull(), // seconds

    // in database/schema.ts (playlist table)
isEditorial: boolean("is_editorial").default(false).notNull(),
editorialType: varchar("editorial_type", { length: 50 }), // "home_curated" | "trending" | null
visibleOnHome: boolean("visible_on_home").default(false).notNull(),
priority: integer("priority").default(0).notNull(),


    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    creatorIdx: index("idx_playlists_creator").on(table.creatorId),
    publicIdx: index("idx_playlists_public").on(table.isPublic),
  })
);

export const tracks = pgTable(
  "tracks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    
    title: varchar("title", { length: 255 }).notNull(),
    artist: varchar("artist", { length: 255 }).notNull(),
    album: varchar("album", { length: 255 }),
    
    duration: integer("duration").notNull(), // seconds
    
    fileUrl: varchar("file_url", { length: 512 }).notNull(), // S3/CDN URL
    coverArtUrl: varchar("cover_art_url", { length: 512 }),
    
    genre: varchar("genre", { length: 100 }),
    releaseYear: integer("release_year"),
    
    isExplicit: boolean("is_explicit").default(false),
    
    playCount: integer("play_count").default(0).notNull(),
    
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    titleIdx: index("idx_tracks_title").on(table.title),
    artistIdx: index("idx_tracks_artist").on(table.artist),
    genreIdx: index("idx_tracks_genre").on(table.genre),
  })
);

export const playlistTracks = pgTable(
  "playlist_tracks",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    playlistId: uuid("playlist_id")
      .notNull()
      .references(() => playlists.id, { onDelete: "cascade" }),

    trackId: uuid("track_id")
      .notNull()
      .references(() => tracks.id, { onDelete: "cascade" }),

    position: integer("position").notNull(), // simpler than varchar for now

    addedByUserId: uuid("added_by_user_id")
      .notNull()
      .references(() => users.id),

    addedAt: timestamp("added_at").defaultNow().notNull(),
  },
  (table) => ({
    playlistIdx: index("idx_playlist_tracks_playlist").on(table.playlistId),
    trackIdx: index("idx_playlist_tracks_track").on(table.trackId),
    positionIdx: index("idx_playlist_tracks_position").on(
      table.playlistId,
      table.position
    ),
    uniquePosition: index("uq_playlist_position").on(
      table.playlistId,
      table.position
    ),
  })
);
export const listenHistory = pgTable(
  "listen_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    trackId: uuid("track_id")
      .notNull()
      .references(() => tracks.id, { onDelete: "cascade" }),

    playlistId: uuid("playlist_id").references(() => playlists.id, {
      onDelete: "set null",
    }),

    // How much of the track was played (0-100%)
    completionPercentage: integer("completion_percentage").default(0),

    // Total seconds listened in this session
    duration: integer("duration").default(0),

    listenedAt: timestamp("listened_at").defaultNow().notNull(),

    // Device/platform info (optional)
    platform: varchar("platform", { length: 50 }), // e.g., "mobile", "web"
    deviceId: varchar("device_id", { length: 255 }),
  },
  (table) => ({
    userIdx: index("idx_listen_history_user").on(table.userId),
    trackIdx: index("idx_listen_history_track").on(table.trackId),
    listenedAtIdx: index("idx_listen_history_listened_at").on(
      table.listenedAt
    ),
    userTrackIdx: index("idx_listen_history_user_track").on(
      table.userId,
      table.trackId
    ),
  })
);

export const ingestionJobs = pgTable(
  "ingestion_jobs",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    sourceType: varchar("source_type", { length: 50 }).notNull(),
    sourceInput: text("source_input").notNull(),

    status: varchar("status", { length: 50 }).default("pending").notNull(),

    extractedTitle: varchar("extracted_title", { length: 255 }),
    extractedArtist: varchar("extracted_artist", { length: 255 }),
    extractedDuration: integer("extracted_duration"),
    extractedThumbnail: varchar("extracted_thumbnail", { length: 512 }),

    trackId: uuid("track_id").references(() => tracks.id, { onDelete: "set null" }),

    // NEW
    errorCode: varchar("error_code", { length: 80 }),
    errorMessage: text("error_message"),
    debugLog: text("debug_log"),

    retryCount: integer("retry_count").default(0).notNull(),

    requestedByAdminId: uuid("requested_by_admin_id")
      .notNull()
      .references(() => users.id),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
  },
  (table) => ({
    statusIdx: index("idx_ingestion_jobs_status").on(table.status),
    createdAtIdx: index("idx_ingestion_jobs_created_at").on(table.createdAt),
    requestedByIdx: index("idx_ingestion_jobs_requested_by").on(table.requestedByAdminId),
  })
);
export const playbackEvents = pgTable(
  "playback_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    trackId: uuid("track_id")
      .notNull()
      .references(() => tracks.id, { onDelete: "cascade" }),

    // optional context, keep flexible
    source: varchar("source", { length: 30 }).default("unknown").notNull(),

    startedAt: timestamp("started_at").defaultNow().notNull(),
  },
  (t) => ({
    userStartedIdx: index("idx_playback_events_user_started").on(t.userId, t.startedAt),
    trackIdx: index("idx_playback_events_track").on(t.trackId),
  })
);

// -----------------------------
// MUSIC REQUESTS + NOTIFICATIONS
// -----------------------------

export const musicRequests = pgTable(
  "music_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    songTitle: varchar("song_title", { length: 255 }).notNull(),
    artistName: varchar("artist_name", { length: 255 }).notNull(),
    albumName: varchar("album_name", { length: 255 }),

    notes: text("notes"),
    priority: varchar("priority", { length: 20 }).default("normal").notNull(), // "low" | "normal" | "high"

    // Your terms (not the PDF ones)
    status: varchar("status", { length: 30 }).default("submitted").notNull(),
    // submitted | in_review | in_progress | completed | rejected

    adminNote: text("admin_note"),

    resolvedTrackId: uuid("resolved_track_id").references(() => tracks.id, {
      onDelete: "set null",
    }),

    resolvedAt: timestamp("resolved_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    userCreatedIdx: index("idx_music_requests_user_created").on(t.userId, t.createdAt),
    statusCreatedIdx: index("idx_music_requests_status_created").on(t.status, t.createdAt),
  })
);

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    type: varchar("type", { length: 80 }).notNull(), // e.g. "music_request_status"
    title: varchar("title", { length: 200 }).notNull(),
    message: text("message").notNull(),

    // store extra metadata for the mobile app (requestId, trackId, etc.)
    data: jsonb("data").$type<Record<string, any>>().default({}).notNull(),

    isRead: boolean("is_read").default(false).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    readAt: timestamp("read_at"),
  },
  (t) => ({
    userReadIdx: index("idx_notifications_user_read").on(t.userId, t.isRead, t.createdAt),
    userCreatedIdx: index("idx_notifications_user_created").on(t.userId, t.createdAt),
  })
);

// Types
export type MusicRequest = typeof musicRequests.$inferSelect;
export type NewMusicRequest = typeof musicRequests.$inferInsert;

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;


export type PlaybackEvent = typeof playbackEvents.$inferSelect;
export type NewPlaybackEvent = typeof playbackEvents.$inferInsert;

export type IngestionJob = typeof ingestionJobs.$inferSelect;
export type NewIngestionJob = typeof ingestionJobs.$inferInsert;
export type ListenHistory = typeof listenHistory.$inferSelect;
export type NewListenHistory = typeof listenHistory.$inferInsert;


export type PlaylistTrack = typeof playlistTracks.$inferSelect;
export type NewPlaylistTrack = typeof playlistTracks.$inferInsert;


export type Track = typeof tracks.$inferSelect;
export type NewTrack = typeof tracks.$inferInsert;

export type Playlist = typeof playlists.$inferSelect;
export type NewPlaylist = typeof playlists.$inferInsert;


// TS types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
