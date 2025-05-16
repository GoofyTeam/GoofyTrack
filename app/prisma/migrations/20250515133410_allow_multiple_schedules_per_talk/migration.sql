-- DropIndex
DROP INDEX "schedules_talk_id_unique";

-- CreateIndex
CREATE INDEX "talk_id" ON "schedules"("talk_id");
