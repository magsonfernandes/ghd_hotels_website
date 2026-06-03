import { nodeRuntime } from "./lib/runtime.js";

export const config = nodeRuntime;

export default function handler(): Response {
  return Response.json({ ok: true });
}
