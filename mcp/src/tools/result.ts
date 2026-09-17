type ToolResult = {
  content: { type: "text"; text: string }[];
  isError?: boolean;
};

export const text = (...lines: string[]): ToolResult => ({
  content: [{ type: "text", text: lines.join("\n") }],
});

export const failure = (message: string): ToolResult => ({
  content: [{ type: "text", text: message }],
  isError: true,
});
