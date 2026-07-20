PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

-- Favorite gains an ownerId so anonymous and authenticated owners share one model.
-- Existing rows are preserved and derive ownerId from their required legacy userId.
CREATE TABLE "new_Favorite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT NOT NULL,
    "userId" TEXT,
    "readingId" TEXT,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Favorite_readingId_fkey" FOREIGN KEY ("readingId") REFERENCES "TarotReading" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT OR IGNORE INTO "new_Favorite" ("id", "ownerId", "userId", "readingId", "targetType", "targetId", "createdAt")
SELECT "id", "userId", "userId", CASE WHEN "targetType" = 'reading' THEN "targetId" ELSE NULL END, "targetType", "targetId", "createdAt"
FROM "Favorite";

-- Backfill legacy tarot favorites without deleting or rewriting legacy columns.
INSERT OR IGNORE INTO "new_Favorite" ("id", "ownerId", "userId", "readingId", "targetType", "targetId", "createdAt")
SELECT 'legacy_favorite_' || "id", "ownerId", "userId", "id", 'reading', "id", "createdAt"
FROM "TarotReading"
WHERE "favorite" = true;

DROP TABLE "Favorite";
ALTER TABLE "new_Favorite" RENAME TO "Favorite";
CREATE INDEX "Favorite_userId_idx" ON "Favorite"("userId");
CREATE INDEX "Favorite_readingId_idx" ON "Favorite"("readingId");
CREATE INDEX "Favorite_ownerId_targetType_idx" ON "Favorite"("ownerId", "targetType");
CREATE UNIQUE INDEX "Favorite_ownerId_targetType_targetId_key" ON "Favorite"("ownerId", "targetType", "targetId");

-- Reading notes are one normalized current note per reading. If historical rows
-- already exist, keep the most recently updated row; otherwise backfill legacy text.
CREATE TABLE "new_ReadingNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "readingId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ReadingNote_readingId_fkey" FOREIGN KEY ("readingId") REFERENCES "TarotReading" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT OR IGNORE INTO "new_ReadingNote" ("id", "readingId", "content", "createdAt", "updatedAt")
SELECT n."id", n."readingId", n."content", n."createdAt", n."updatedAt"
FROM "ReadingNote" n
WHERE n."id" = (
    SELECT n2."id"
    FROM "ReadingNote" n2
    WHERE n2."readingId" = n."readingId"
    ORDER BY n2."updatedAt" DESC, n2."id" DESC
    LIMIT 1
);
INSERT OR IGNORE INTO "new_ReadingNote" ("id", "readingId", "content", "createdAt", "updatedAt")
SELECT 'legacy_note_' || "id", "id", "note", "createdAt", "updatedAt"
FROM "TarotReading"
WHERE length(trim("note")) > 0;

DROP TABLE "ReadingNote";
ALTER TABLE "new_ReadingNote" RENAME TO "ReadingNote";
CREATE UNIQUE INDEX "ReadingNote_readingId_key" ON "ReadingNote"("readingId");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
