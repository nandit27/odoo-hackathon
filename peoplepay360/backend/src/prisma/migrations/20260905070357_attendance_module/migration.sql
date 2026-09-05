/*
  Warnings:

  - The `status` column on the `Attendance` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `checkIn` on table `Attendance` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('NORMAL', 'LATE', 'ABSENT', 'MANUAL_EDIT');

-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "workedHours" DECIMAL(5,2),
ALTER COLUMN "checkIn" SET NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "AttendanceStatus" NOT NULL DEFAULT 'NORMAL';

-- CreateIndex
CREATE INDEX "Attendance_employeeId_date_idx" ON "Attendance"("employeeId", "date");
