/*
  Warnings:

  - You are about to drop the column `action` on the `RolePermission` table. All the data in the column will be lost.
  - You are about to drop the column `module` on the `RolePermission` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[roleId,permissionId]` on the table `RolePermission` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `permissionId` to the `RolePermission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `RolePermission` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."RolePermission_module_action_idx";

-- DropIndex
DROP INDEX "public"."RolePermission_roleId_module_action_key";

-- AlterTable
ALTER TABLE "RolePermission" DROP COLUMN "action",
DROP COLUMN "module",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "permissionId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "module" "Module" NOT NULL,
    "action" "Action" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Permission_module_action_key" ON "Permission"("module", "action");

-- CreateIndex
CREATE INDEX "RolePermission_roleId_idx" ON "RolePermission"("roleId");

-- CreateIndex
CREATE INDEX "RolePermission_permissionId_idx" ON "RolePermission"("permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_roleId_permissionId_key" ON "RolePermission"("roleId", "permissionId");

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
