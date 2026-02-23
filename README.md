# self

## Setup

```sh
mise install        # installs Node from .tool-versions
corepack enable     # activates pnpm shim (reads version from packageManager in package.json)
pnpm install
```

> **Note:** Run `corepack enable` once after installing Node. Corepack ships with Node and manages the pnpm version specified in `package.json`'s `packageManager` field — no need to install pnpm separately.
