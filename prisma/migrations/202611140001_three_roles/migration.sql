-- Retain historical users and records while retiring operator logins.
UPDATE "User"
SET "role" = 'ADMIN', "locked" = TRUE
WHERE "role" IN ('KOPERASI', 'FASILITATOR');

UPDATE "Assignment" AS a
SET "facilitatorId" = 'admin-demo'
WHERE a."facilitatorId" = 'fasilitator-demo'
  AND EXISTS (SELECT 1 FROM "User" WHERE "id" = 'admin-demo')
  AND NOT EXISTS (
    SELECT 1 FROM "Assignment" AS other
    WHERE other."facilitatorId" = 'admin-demo'
      AND other."fisherId" = a."fisherId"
  );

ALTER TYPE "Role" RENAME TO "Role_legacy";
CREATE TYPE "Role" AS ENUM ('INVESTOR', 'NELAYAN', 'ADMIN');
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role" USING "role"::text::"Role";
DROP TYPE "Role_legacy";
