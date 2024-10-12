/*
  Warnings:

  - A unique constraint covering the columns `[user_id,name]` on the table `boxes` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `boxes_user_id_name_key` ON `boxes`(`user_id`, `name`);
