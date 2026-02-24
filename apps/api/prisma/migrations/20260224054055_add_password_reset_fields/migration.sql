-- AlterTable
ALTER TABLE "users" ADD COLUMN     "resetOtp" TEXT,
ADD COLUMN     "resetOtpAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "resetOtpExpiresAt" TIMESTAMP(3);
