import { setupWorker } from "msw/browser";
import { handlers as wsHandlers } from "#/mocks/handlers.ws";
import { handlers } from "./handlers";

export const worker = setupWorker(...handlers, ...wsHandlers);
