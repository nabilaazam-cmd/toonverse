# Toonverse

Toonverse is a web app for creating and reading webcomics. Creators draw comic panels in the browser, and readers read the published episodes.

This is our Final Year Project. **FYP 1 builds the frontend only** (the React app in `client/`). The backend, the database and the setup steps for them are added in FYP 2.

## What you need

| Tool | Version | Check with |
|---|---|---|
| [Node.js](https://nodejs.org/en/download) | **v24.22.3** (npm 11.19.1 comes with it) | `node -v` and `npm -v` |
| [Git](https://git-scm.com/downloads) | any recent version | `git --version` |

Use exactly Node.js v24.22.3. The whole team uses this version, so the project behaves the same on every computer.

## Set up the project

1. Get the code:

   ```
   git clone https://github.com/nabilaazam-cmd/toonverse.git
   cd toonverse
   ```

2. Install everything. Run this once, in the `toonverse` folder:

   ```
   npm install
   ```

   The project uses npm workspaces, so this one command installs the packages for `client/` too. Do not run `npm install` inside `client/`.

3. Start the app:

   ```
   npm run dev -w client
   ```

4. Open http://localhost:5173 in your browser. You should see the "Toonverse" home page. Press `Ctrl+C` in the terminal to stop the app.

The app always uses port 5173. If that port is busy, it stops with an error instead of picking another port. Close the other program using the port, then try again.

No `.env` file is needed in FYP 1.

## Useful commands

Run these in the `toonverse` folder.

| Command | What it does |
|---|---|
| `npm run dev -w client` | Starts the app at http://localhost:5173. It reloads when you save a file. |
| `npm run lint` | Checks the client code for mistakes with ESLint. |
| `npm run format` | Formats the client code with Prettier. |
| `npm run format:check` | Checks the client code is formatted, without changing any file. |
| `npm run build -w client` | Builds the app for release into `client/dist/`. |
| `npm run preview -w client` | Serves the built app from `client/dist/`, to check the build. Run the build first. |

Run `npm run lint` and `npm run format:check` before opening a pull request. Both should pass.

## Project layout

| Folder | What it holds |
|---|---|
| `client/` | The React frontend (Vite, Tailwind CSS, React Router). |
| `server/` | The backend. Empty in FYP 1: see [server/README.md](server/README.md). |
| `docs/` | Project documents: decisions, data model, API contract, AI policy, wireframes, the plan and the task files. |

## Settings

The frontend has one setting, `VITE_API_URL`, explained in [client/.env.example](client/.env.example). Leave it empty in development.

In development, the app sends every `/api` request to `http://localhost:5000`. There is no backend in FYP 1, so those requests fail with error 502. That is expected.

## Coming in FYP 2

These setup steps are added to this guide in FYP 2:

- MongoDB and the test database
- the `.env` file for the server
- starting the server
- running the tests

## More information

- Project decisions, including the Node.js version: [docs/decisions.md](docs/decisions.md)
- Task files and how tasks are run: [docs/tasks/README.md](docs/tasks/README.md)
