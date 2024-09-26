/*
  Warnings:

  - The primary key for the `News` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id_` on the `News` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "News" DROP CONSTRAINT "News_pkey",
DROP COLUMN "id_",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "News_pkey" PRIMARY KEY ("id");
