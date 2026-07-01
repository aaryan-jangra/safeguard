import app from "./app";
import { logger } from "./lib/logger";

const port = Number(process.env["PORT"] ?? 3000);
const host = "0.0.0.0"; // bind to all interfaces so phone/dashboard on the LAN can reach it

app.listen(port, host, (err?: Error) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }
  logger.info({ port, host }, "Server listening");
}); 