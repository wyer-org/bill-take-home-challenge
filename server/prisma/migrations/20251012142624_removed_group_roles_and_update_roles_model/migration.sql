/*
  Warnings:

  - You are about to drop the `GroupRole` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name,groupId]` on the table `Role` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."GroupRole" DROP CONSTRAINT "GroupRole_groupId_fkey";

-- DropForeignKey
ALTER TABLE "public"."GroupRole" DROP CONSTRAINT "GroupRole_roleId_fkey";

-- DropIndex
DROP INDEX "public"."Role_name_key";

-- AlterTable
ALTER TABLE "Role" ADD COLUMN     "groupId" TEXT;

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "groupId" DROP DEFAULT;

-- DropTable
DROP TABLE "public"."GroupRole";

-- CreateIndex
CREATE INDEX "Role_groupId_idx" ON "Role"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_groupId_key" ON "Role"("name", "groupId");

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
