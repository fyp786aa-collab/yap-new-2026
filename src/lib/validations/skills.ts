import { z } from "zod";

const ratingSchema = z.coerce
  .number()
  .min(1, "Rating is required")
  .max(5, "Rating max is 5");

export const skillsSchema = z.object({
  communication: ratingSchema,
  team_collaboration: ratingSchema,
  problem_solving: ratingSchema,
  adaptability: ratingSchema,
  leadership: ratingSchema,
  report_writing: ratingSchema,
  microsoft_office: ratingSchema,
  research_documentation: ratingSchema,
  community_engagement: ratingSchema,
  additional_skills: z.string().optional().default(""),
});

export type SkillsInput = z.input<typeof skillsSchema>;
