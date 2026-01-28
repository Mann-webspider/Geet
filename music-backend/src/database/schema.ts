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

export type PlaylistTrack = typeof playlistTracks.$inferSelect;
export type NewPlaylistTrack = typeof playlistTracks.$inferInsert;


export type Track = typeof tracks.$inferSelect;
export type NewTrack = typeof tracks.$inferInsert;

export type Playlist = typeof playlists.$inferSelect;
export type NewPlaylist = typeof playlists.$inferInsert;


// TS types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
