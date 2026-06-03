/** Vercel serverless: Node runtime (nodemailer requires Node, not Edge). */
export const nodeRuntime = {
  runtime: "nodejs" as const,
  maxDuration: 30,
};
