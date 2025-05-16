/*
  Warnings:

  - Made the column `talk_id` on table `schedules` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "schedules" ALTER COLUMN "talk_id" SET NOT NULL;
