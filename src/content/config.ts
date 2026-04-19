import { defineCollection, z } from "astro:content";

const pwnTypeSchema = z.enum([
	"stack",
	"heap",
	"fmt",
	"uaf",
	"race",
	"sandbox",
	"integer",
	"other",
]);

const pwnStatusSchema = z.enum(["pending", "local", "remote", "archived"]);

const postsCollection = defineCollection({
	schema: z.object({
		title: z.string(),
		published: z.date(),
		updated: z.date().optional(),
		draft: z.boolean().optional().default(false),
		description: z.string().optional().default(""),
		image: z.string().optional().default(""),
		tags: z.array(z.string()).optional().default([]),
		category: z.string().optional().nullable().default(""),
		lang: z.string().optional().default(""),
		type: pwnTypeSchema,
		difficulty: z.number().int().min(1).max(5),
		status: pwnStatusSchema,
		libc: z.string().optional().default(""),

		/* For internal use */
		prevTitle: z.string().default(""),
		prevSlug: z.string().default(""),
		nextTitle: z.string().default(""),
		nextSlug: z.string().default(""),
	}),
});
const specCollection = defineCollection({
	schema: z.object({}),
});
export const collections = {
	posts: postsCollection,
	spec: specCollection,
};
