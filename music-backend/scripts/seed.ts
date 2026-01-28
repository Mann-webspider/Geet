import { db } from "../src/config/db";
import { users, playlists, tracks } from "../src/database/schema";
import { hashPassword } from "../src/modules/auth/password.util.";
import { sql } from "drizzle-orm";

async function clearAll() {
  await db.execute(sql`TRUNCATE TABLE ${playlists} RESTART IDENTITY CASCADE`);
  await db.execute(sql`TRUNCATE TABLE ${tracks} RESTART IDENTITY CASCADE`);
  await db.execute(sql`TRUNCATE TABLE ${users} RESTART IDENTITY CASCADE`);
}

async function seed() {
  await clearAll();

  const passwordHash = await hashPassword("password123");

  const [user] = await db
    .insert(users)
    .values({
      email: "demo@example.com",
      username: "Demo User",
      passwordHash,
    })
    .returning();

  await db.insert(playlists).values([
    {
      creatorId: user.id,
      name: "Daily Mix",
      description: "Auto-generated mix",
      isCollaborative: false,
      isPublic: false,
      trackCount: 0,
      totalDuration: 0,
    },
    {
      creatorId: user.id,
      name: "Party Hits",
      description: "Upbeat tracks for parties",
      isCollaborative: true,
      isPublic: true,
      trackCount: 0,
      totalDuration: 0,
    },
  ]);

  // Seed demo tracks
  await db.insert(tracks).values([
    {
      title: "Blinding Lights",
      artist: "The Weeknd",
      album: "After Hours",
      duration: 200,
      fileUrl: "https://example.com/tracks/blinding-lights.mp3",
      coverArtUrl: "https://example.com/covers/after-hours.jpg",
      genre: "Pop",
      releaseYear: 2020,
      isExplicit: false,
    },
    {
      title: "Levitating",
      artist: "Dua Lipa",
      album: "Future Nostalgia",
      duration: 203,
      fileUrl: "https://example.com/tracks/levitating.mp3",
      coverArtUrl: "https://example.com/covers/future-nostalgia.jpg",
      genre: "Pop",
      releaseYear: 2020,
      isExplicit: false,
    },
    {
      title: "good 4 u",
      artist: "Olivia Rodrigo",
      album: "SOUR",
      duration: 178,
      fileUrl: "https://example.com/tracks/good-4-u.mp3",
      coverArtUrl: "https://example.com/covers/sour.jpg",
      genre: "Pop Rock",
      releaseYear: 2021,
      isExplicit: false,
    },
    {
      title: "Stay",
      artist: "The Kid LAROI & Justin Bieber",
      album: "Stay",
      duration: 141,
      fileUrl: "https://example.com/tracks/stay.mp3",
      coverArtUrl: "https://example.com/covers/stay.jpg",
      genre: "Pop",
      releaseYear: 2021,
      isExplicit: false,
    },
    {
      title: "Heat Waves",
      artist: "Glass Animals",
      album: "Dreamland",
      duration: 238,
      fileUrl: "https://example.com/tracks/heat-waves.mp3",
      coverArtUrl: "https://example.com/covers/dreamland.jpg",
      genre: "Alternative",
      releaseYear: 2020,
      isExplicit: false,
    },
  ]);

  console.log("Seed completed:");
  console.log("- User:", user.email);
  console.log("- Playlists: 2");
  console.log("- Tracks: 5");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
