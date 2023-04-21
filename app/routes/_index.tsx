import type { V2_MetaFunction } from "@remix-run/node";
import { type ChangeEvent, useState } from "react";
import { createParser } from "eventsource-parser";

export const meta: V2_MetaFunction = () => {
  return [{ title: "Preguntale al chat-gpt" }];
};

export default function Index() {
  const [prompt, set] = useState("");
  // const fetcher = useFetcher();
  const [text, setText] = useState("");

  const handleSearch = (evnt: ChangeEvent<HTMLTextAreaElement>) => {
    set(evnt.target.value);
  };

  const handleSubmit = async (evnt) => {
    evnt.preventDefault();
    setText("");
    // fetcher.load("/chat-streams?message=" + prompt);
    const response = await fetch("/chat-streams?message=" + prompt);
    const decoder = new TextDecoder();
    const reader = response.body?.getReader();
    const parser = createParser((event) => {
      if (event.type === "event") {
        const data = JSON.parse(event.data);
        data.choices
          .filter(({ delta }) => !!delta.content)
          .forEach(({ delta: { content } }) => {
            setText((t) => t + content);
          });
      }
    });
    while (true) {
      const { value, done } = await reader?.read();
      const text = decoder.decode(value);
      if (done || text.includes("[DONE]")) break;
      parser.feed(text);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        flexDirection: "column",
        padding: "0 16px",
        backgroundColor: "#323232",
        color: "white",
        gap: 16,
      }}
    >
      <div
        style={{
          minHeight: 400,
          border: "2px solid",
          width: "100%",
          borderRadius: 9,
          padding: 16,
          boxSizing: "border-box",
          fontSize: 24,
        }}
      >
        {text}
      </div>
      <div style={{ display: "flex", alignItems: "stretch" }}>
        <textarea
          value={prompt}
          onChange={handleSearch}
          placeholder="Pregunta a chat-gpt"
          style={{ width: "500px", height: 50, fontSize: 18 }}
        ></textarea>
        <form style={{}} onSubmit={handleSubmit}>
          <button style={{ minHeight: "100%" }} type="submit">
            Consultar
          </button>
        </form>
      </div>
    </div>
  );
}
