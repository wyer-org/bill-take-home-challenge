-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserGroup" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,

    CONSTRAINT "UserGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupRole" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroupRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "module" "Module" NOT NULL,
    "action" "Action" NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Group_teamId_idx" ON "Group"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "Group_teamId_name_key" ON "Group"("teamId", "name");

-- CreateIndex
CREATE INDEX "UserGroup_userId_idx" ON "UserGroup"("userId");

-- CreateIndex
CREATE INDEX "UserGroup_groupId_idx" ON "UserGroup"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "UserGroup_userId_groupId_key" ON "UserGroup"("userId", "groupId");

-- CreateIndex
CREATE INDEX "GroupRole_groupId_idx" ON "GroupRole"("groupId");

-- CreateIndex
CREATE INDEX "GroupRole_roleId_idx" ON "GroupRole"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "GroupRole_groupId_roleId_key" ON "GroupRole"("groupId", "roleId");

-- CreateIndex
CREATE INDEX "RolePermission_module_action_idx" ON "RolePermission"("module", "action");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_roleId_module_action_key" ON "RolePermission"("roleId", "module", "action");

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGroup" ADD CONSTRAINT "UserGroup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGroup" ADD CONSTRAINT "UserGroup_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupRole" ADD CONSTRAINT "GroupRole_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupRole" ADD CONSTRAINT "GroupRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
