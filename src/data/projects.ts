type ProjectBase = {
  name: string;
  description: string;
  tools: string[];
};

export type Project = ProjectBase &
  (
    | { visibility: "private" }
    | { visibility: "closed-source"; url: string }
    | { visibility: "open-source"; repo: string }
  );

export function projectHref(project: Project): string | undefined {
  switch (project.visibility) {
    case "private":
      return undefined;
    case "closed-source":
      return project.url;
    case "open-source":
      return project.repo;
    default:
      return project satisfies never;
  }
}

// ordered reverse chronologically
export const projects: Project[] = [
  {
    name: "isthetdown",
    visibility: "closed-source",
    url: "https://isthetdown.com",
    description: "Unofficial T status page",
    tools: ["TypeScript"],
  },
  {
    name: "ku",
    visibility: "open-source",
    repo: "https://github.com/garrettladley/ku",
    description: "A Sudoku engine and TUI",
    tools: ["Rust"],
  },
  {
    name: "skiplist",
    visibility: "open-source",
    repo: "https://github.com/garrettladley/skiplist",
    description: "An implementation of a skiplist",
    tools: ["Go"],
  },
  {
    name: "pkgsite-mcp",
    visibility: "open-source",
    repo: "https://github.com/garrettladley/pkgsite-mcp",
    description: "MCP server for pkg.go.dev",
    tools: ["Go"],
  },
  {
    name: "intern",
    visibility: "private",
    description: "Sandboxed background agents running your infrastructure",
    tools: ["Go"],
  },
  {
    name: "thoop",
    visibility: "open-source",
    repo: "https://github.com/garrettladley/thoop",
    description: "Local-first TUI & MCP for your WHOOP data",
    tools: ["Go"],
  },
  {
    name: "peli",
    visibility: "open-source",
    repo: "https://github.com/garrettladley/peli",
    description: "Beli-style restaurant ranking TUI",
    tools: ["Go"],
  },
  {
    name: "smerkle",
    visibility: "open-source",
    repo: "https://github.com/garrettladley/smerkle",
    description: "Exploring merkle trees",
    tools: ["Go"],
  },
  {
    name: "strumbra",
    visibility: "open-source",
    repo: "https://github.com/garrettladley/strumbra",
    description: "Umbra strings",
    tools: ["Go"],
  },
  {
    name: "repo_reaper",
    visibility: "open-source",
    repo: "https://github.com/garrettladley/repo_reaper",
    description: "Information retrieval CLI for code search",
    tools: ["Rust"],
  },
];
