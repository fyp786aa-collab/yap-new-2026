import { z } from "zod";

export const videoSchema = z.object({
  video_uploaded: z.literal(true, "Please upload your video"),
});

export type VideoInput = z.infer<typeof videoSchema>;
