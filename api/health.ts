import { nodeRuntime } from "./lib/runtime";

export const config = nodeRuntime;

export default function handler(): Response {
  return Response.json({ ok: true });
}
