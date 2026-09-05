/*
  Warnings:

  - You are about to drop the `TimeOff` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TimeOffUnit" AS ENUM ('DAYS', 'HOURS');

-- CreateEnum
CREATE TYPE "TimeOffStatus" AS ENUM ('PENDING', 'APPROVED', 'REFUSED');

-- CreateEnum
CREATE TYPE "SalaryRuleCategory" AS ENUM ('BASIC', 'ALLOWANCE', 'DEDUCTION', 'GROSS', 'NET');

-- CreateEnum
CREATE TYPE "ComputationType" AS ENUM ('FIXED', 'PERCENTAGE');

-- DropForeignKey
ALTER TABLE "TimeOff" DROP CONSTRAINT "TimeOff_employeeId_fkey";

-- AlterTable
ALTER TABLE "SalaryStructure" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;

-- DropTable
DROP TABLE "TimeOff";

-- CreateTable
CREATE TABLE "SalaryRule" (
    "id" SERIAL NOT NULL,
    "structureId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "category" "SalaryRuleCategory" NOT NULL,
    "sequence" INTEGER NOT NULL,
    "computationType" "ComputationType" NOT NULL,
    "value" DECIMAL(12,2) NOT NULL,
    "percentageOfCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalaryRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeOffType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "unit" "TimeOffUnit" NOT NULL DEFAULT 'DAYS',
    "requiresAllocation" BOOLEAN NOT NULL DEFAULT true,
    "affectsPayroll" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimeOffType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeOffAllocation" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "timeOffTypeId" INTEGER NOT NULL,
    "allocated" DECIMAL(6,2) NOT NULL,
    "taken" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "validFrom" DATE NOT NULL,
    "validTo" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimeOffAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeOffRequest" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "timeOffTypeId" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "duration" DECIMAL(6,2) NOT NULL,
    "status" "TimeOffStatus" NOT NULL DEFAULT 'PENDING',
    "approvedById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimeOffRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SalaryRule_structureId_code_key" ON "SalaryRule"("structureId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "SalaryRule_structureId_sequence_key" ON "SalaryRule"("structureId", "sequence");

-- CreateIndex
CREATE UNIQUE INDEX "TimeOffType_name_key" ON "TimeOffType"("name");

-- CreateIndex
CREATE INDEX "TimeOffAllocation_employeeId_timeOffTypeId_idx" ON "TimeOffAllocation"("employeeId", "timeOffTypeId");

-- CreateIndex
CREATE INDEX "TimeOffRequest_employeeId_status_idx" ON "TimeOffRequest"("employeeId", "status");

-- AddForeignKey
ALTER TABLE "SalaryRule" ADD CONSTRAINT "SalaryRule_structureId_fkey" FOREIGN KEY ("structureId") REFERENCES "SalaryStructure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeOffAllocation" ADD CONSTRAINT "TimeOffAllocation_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeOffAllocation" ADD CONSTRAINT "TimeOffAllocation_timeOffTypeId_fkey" FOREIGN KEY ("timeOffTypeId") REFERENCES "TimeOffType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeOffRequest" ADD CONSTRAINT "TimeOffRequest_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeOffRequest" ADD CONSTRAINT "TimeOffRequest_timeOffTypeId_fkey" FOREIGN KEY ("timeOffTypeId") REFERENCES "TimeOffType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeOffRequest" ADD CONSTRAINT "TimeOffRequest_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
