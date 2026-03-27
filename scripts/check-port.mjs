/**
 * Pre-dev script: fail fast if the Vite dev port is already in use.
 */
import { createServer } from "net";

const PORT = parseInt(process.env.PORT || "5173", 10);

const server = createServer();

server.once("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `\n  Port ${PORT} is already in use.\n` +
        `  Kill the process using it or set a different PORT:\n\n` +
        `    PORT=5174 npm run dev\n`
    );
    process.exit(1);
  }
  throw err;
});

server.once("listening", () => {
  server.close(() => {
    // Port is free — proceed
  });
});

server.listen(PORT, "127.0.0.1");
