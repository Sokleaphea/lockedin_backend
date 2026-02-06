import { replicate } from "../config/replicate";

export async function breakDownTask(task: string): Promise<string> {
  const prompt = `
You are a project management assistant.

Break down the following task into clear, ordered, actionable subtasks.
Return ONLY valid JSON in this format:

[
  { "step": 1, "title": "", "description": "" }
]

Task:
"${task}"
`;

  const output = await replicate.run(
    "meta/meta-llama-3-8b-instruct",
    {
      input: {
        prompt,
        max_tokens: 400,
        temperature: 0.3,
      },
    }
  );

  return Array.isArray(output) ? output.join("") : String(output);
}
