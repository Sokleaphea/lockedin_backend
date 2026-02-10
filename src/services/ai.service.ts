import { groq } from "../config/groq";

export async function breakDownTask(task: string): Promise<any> {
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

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.3,
    max_tokens: 500,
  });

  const content = completion.choices[0]?.message?.content;

  if (!content) {
    throw new Error("Empty AI response");
  }

  try {
    return JSON.parse(content);
  } catch (error) {
    // Some model responses include extra text; extract the JSON array if possible.
    const start = content.indexOf("[");
    const end = content.lastIndexOf("]");

    if (start !== -1 && end !== -1 && end > start) {
      const sliced = content.slice(start, end + 1);
      return JSON.parse(sliced);
    }

    throw error;
  }
}
