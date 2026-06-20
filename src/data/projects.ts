export type Project = {
  name: string;
  description: string;
  href?: string;
  private?: boolean;
  tools: string[];
};

// ordered reverse chronologically
export const projects: Project[] = [
  {
    name: "skiplist",
    href: "https://github.com/garrettladley/skiplist",
    description: "An implementation of skiplists in Go",
    tools: ["Go"],
  },
  {
    name: "pkgsite-mcp",
    href: "https://github.com/garrettladley/pkgsite-mcp",
    description: "MCP server for pkg.go.dev",
    tools: ["Go"],
  },
  {
    name: "intern",
    private: true,
    description: "Sandboxed background agents running your infrastructure",
    tools: ["Go"],
  },
  {
    name: "thoop",
    href: "https://github.com/garrettladley/thoop",
    description: "Local-first TUI & MCP for your WHOOP data",
    tools: ["Go"],
  },
  {
    name: "peli",
    href: "https://github.com/garrettladley/peli",
    description: "Beli-style restaurant ranking TUI",
    tools: ["Go"],
  },
  {
    name: "smerkle",
    href: "https://github.com/garrettladley/smerkle",
    description: "Exploring merkle trees",
    tools: ["Go"],
  },
  {
    name: "strumbra",
    href: "https://github.com/garrettladley/strumbra",
    description: "Umbra strings",
    tools: ["Go"],
  },
  {
    name: "repo_reaper",
    href: "https://github.com/garrettladley/repo_reaper",
    description: "Information retrieval CLI for code search",
    tools: ["Rust"],
  },
];
