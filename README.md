# @beastjs/env-gen

Convert config objects in a TypeScript file into `.env` variables.

> Requires [Bun](https://bun.sh) — the CLI runs your `.ts` file directly.

## Usage

```sh
bunx @beastjs/env-gen ./firebase.ts
# or install globally
bun add -g @beastjs/env-gen
env-gen ./firebase.ts
env-gen ./firebase.ts >> .env    # append to a .env file
```

### Options

| Flag             | Description                                                  |
| ---------------- | ------------------------------------------------------------ |
| `--prefix=<str>` | Prefix for every variable. Default `PUBLIC_`; `--prefix=` for none |
| `-h, --help`     | Show help                                                    |
| `-v, --version`  | Show version                                                 |

## Example

**Input** (`firebase.ts`)

```ts
// example firebase config credentials
const firebaseConfig = {
  apiKey: 'adkfj',
  authDomain: 'adjfad',
  projectId: 'ioiuero',
  storageBucket: 'ijsmxnm',
  messagingSenderId: '0384905',
  appId: '8:9582340'
}
```

**Output**

```zsh

# FIREBASE
PUBLIC_FIREBASE_API_KEY="adkfj"
PUBLIC_FIREBASE_AUTH_DOMAIN="adjfad"
PUBLIC_FIREBASE_PROJECT_ID="ioiuero"
PUBLIC_FIREBASE_STORAGE_BUCKET="ijsmxnm"
PUBLIC_FIREBASE_MESSAGING_SENDER_ID="0384905"
PUBLIC_FIREBASE_APP_ID="8:9582340"
```

## How it works

- Every top-level `const` / `let` / `var name = { ... }` is picked up (exported or not).
- The file is executed, so computed values resolve to their real values. Any other code in the file runs too.
- The group name is the variable name with a trailing `Config`, `Configuration`, `Credentials`, `Options` or `Settings` removed (`firebaseConfig` → `FIREBASE`).
- Keys are converted to `SCREAMING_SNAKE_CASE`; nested objects are flattened (`{ db: { host } }` → `..._DB_HOST`).
- Multiple objects in one file produce multiple `# GROUP` blocks.

## License

MIT
