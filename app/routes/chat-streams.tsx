import { json, type LoaderFunction } from "@remix-run/node";

const openAiURL = "https://api.openai.com/v1/chat/completions";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const message = url.searchParams.get("message");
  if (!message) return json(null, { status: 400 });
  const options = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_SECRET}`,
    },
    method: "post",
    body: JSON.stringify({
      stream: true,
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
    }),
  };
  const result = await fetch(openAiURL, options);
  return new Response(result.body);
};
