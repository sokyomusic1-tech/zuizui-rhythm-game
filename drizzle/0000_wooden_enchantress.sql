CREATE TYPE "public"."difficulty" AS ENUM('easy', 'normal', 'hard');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "scores" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "scores_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"username" varchar(50) NOT NULL,
	"score" integer NOT NULL,
	"songId" varchar(50) NOT NULL,
	"difficulty" "difficulty" NOT NULL,
	"perfect" integer DEFAULT 0 NOT NULL,
	"good" integer DEFAULT 0 NOT NULL,
	"miss" integer DEFAULT 0 NOT NULL,
	"maxCombo" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" "role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
