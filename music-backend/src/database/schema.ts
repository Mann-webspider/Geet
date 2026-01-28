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

// PLAYLISTS TABLE
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
    playlistType: varchar("playlist_type", { length: 50 }).default("personal"),

    eventDate: timestamp("event_date", { withTimezone: false }),
    eventLocation: varchar("event_location", { length: 255 }),

    // versioning
    version: varchar("version", { length: 50 }).default("0"),
    lastModifiedBy: uuid("last_modified_by").references(() => users.id),
    lastModifiedAt: timestamp("last_modified_at", { withTimezone: false }),

    // stats
    totalDuration: varchar("total_duration", { length: 50 }).default("0"),
    trackCount: varchar("track_count", { length: 50 }).default("0"),
    followerCount: varchar("follower_count", { length: 50 }).default("0"),

    createdAt: timestamp("created_at", { withTimezone: false })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: false })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: false }),
  },
  (table) => ({
    creatorIdx: index("idx_playlists_creator").on(table.creatorId),
    collabIdx: index("idx_playlists_collaborative").on(table.isCollaborative),
    versionIdx: index("idx_playlists_version").on(table.id, table.version),
  })
);

export const playlistTracks = pgTable(
  "playlist_tracks",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    playlistId: uuid("playlist_id")
      .notNull()
      .references(() => playlists.id, { onDelete: "cascade" }),

    trackId: uuid("track_id").notNull(), // will reference tracks table later

    position: varchar("position", { length: 50 }).notNull(),
    oldPosition: varchar("old_position", { length: 50 }),

    addedByUserId: uuid("added_by_user_id")
      .notNull()
      .references(() => users.id),
    addedAt: timestamp("added_at", { withTimezone: false })
      .defaultNow()
      .notNull(),

    version: varchar("version", { length: 50 }).notNull(),
  },
  (table) => ({
    playlistIdx: index("idx_playlist_tracks_playlist").on(table.playlistId),
    trackIdx: index("idx_playlist_tracks_track").on(table.trackId),
    positionIdx: index("idx_playlist_tracks_position").on(
      table.playlistId,
      table.position
    ),
    uniquePosition: uniqueIndex("uq_playlist_position").on(
      table.playlistId,
      table.position
    ),
  })
);

export type Playlist = typeof playlists.$inferSelect;
export type PlaylistTrack = typeof playlistTracks.$inferSelect;


// TS types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
