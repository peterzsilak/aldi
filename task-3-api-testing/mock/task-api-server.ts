import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";
import { type NormalisedTaskPayload, TaskStore, validateTaskPayload } from "@mock/task-store";
import type { ApiErrorBody, Task } from "@test-types/task";

export interface MockTaskApi {
    /** Base URL of the running mock, e.g. `http://127.0.0.1:53124`. */
    baseURL: string;
    store: TaskStore;
    close: () => Promise<void>;
}

const TASKS_COLLECTION = /^\/tasks\/?$/u;
const TASKS_ITEM = /^\/tasks\/([^/]+)\/?$/u;

/**
 * Starts an in-process mock of the task management REST API on a random free port.
 *
 * Implemented endpoints:
 * - `POST   /tasks`      → 201 Created, 400 Bad Request
 * - `GET    /tasks`      → 200 OK
 * - `GET    /tasks/{id}` → 200 OK, 404 Not Found
 * - `PUT    /tasks/{id}` → 200 OK, 400 Bad Request, 404 Not Found
 * - `DELETE /tasks/{id}` → 204 No Content, 404 Not Found
 */
export async function startMockTaskApi(): Promise<MockTaskApi> {
    const store = new TaskStore();
    const server = createServer((req, res) => {
        handleRequest(req, res, store).catch(() => {
            sendJson(res, 500, { error: "Internal Server Error", details: [] });
        });
    });

    await new Promise<void>((resolve) => {
        server.listen(0, "127.0.0.1", resolve);
    });

    return {
        baseURL: toBaseURL(server),
        store,
        close: () => closeServer(server),
    };
}

async function handleRequest(req: IncomingMessage, res: ServerResponse, store: TaskStore): Promise<void> {
    const path = new URL(req.url ?? "/", "http://127.0.0.1").pathname;
    const method = req.method ?? "GET";

    if (TASKS_COLLECTION.test(path)) {
        await handleCollection(req, res, store, method);

        return;
    }

    const itemMatch = TASKS_ITEM.exec(path);

    if (itemMatch?.[1] !== undefined) {
        await handleItem(req, res, store, method, decodeURIComponent(itemMatch[1]));

        return;
    }

    sendJson(res, 404, { error: "Not Found", details: [`Unknown resource: ${path}`] });
}

async function handleCollection(req: IncomingMessage, res: ServerResponse, store: TaskStore, method: string): Promise<void> {
    if (method === "GET") {
        sendJson(res, 200, store.list());

        return;
    }

    if (method !== "POST") {
        sendMethodNotAllowed(res, ["GET", "POST"]);

        return;
    }

    const payload = await readPayload(req, res);

    if (payload === undefined) {
        return;
    }

    const normalised = validateOrReject(payload, res);

    if (normalised === undefined) {
        return;
    }

    const task = store.create(normalised);
    res.setHeader("Location", `/tasks/${task.id}`);
    sendJson(res, 201, task);
}

async function handleItem(req: IncomingMessage, res: ServerResponse, store: TaskStore, method: string, id: string): Promise<void> {
    if (!["GET", "PUT", "DELETE"].includes(method)) {
        sendMethodNotAllowed(res, ["GET", "PUT", "DELETE"]);

        return;
    }

    const existing = store.find(id);

    if (existing === undefined) {
        sendJson(res, 404, { error: "Not Found", details: [`No task with id ${id}`] });

        return;
    }

    if (method === "GET") {
        sendJson(res, 200, existing);

        return;
    }

    if (method === "DELETE") {
        store.delete(id);
        res.writeHead(204).end();

        return;
    }

    await handleUpdate(req, res, store, existing);
}

async function handleUpdate(req: IncomingMessage, res: ServerResponse, store: TaskStore, existing: Task): Promise<void> {
    const payload = await readPayload(req, res);

    if (payload === undefined) {
        return;
    }

    const normalised = validateOrReject(payload, res);

    if (normalised === undefined) {
        return;
    }

    sendJson(res, 200, store.replace(existing, normalised));
}

/**
 * Reads and parses the JSON request body, answering with 400 when it is unusable.
 * Returns `undefined` once a response has already been sent.
 */
async function readPayload(req: IncomingMessage, res: ServerResponse): Promise<Record<string, unknown> | undefined> {
    const chunks: Buffer[] = [];

    for await (const chunk of req) {
        chunks.push(chunk as Buffer);
    }

    const raw = Buffer.concat(chunks).toString("utf8").trim();

    if (raw.length === 0) {
        sendJson(res, 400, { error: "Bad Request", details: ["request body must be a JSON object"] });

        return undefined;
    }

    let parsed: unknown;

    try {
        parsed = JSON.parse(raw);
    } catch {
        sendJson(res, 400, { error: "Bad Request", details: ["request body must be valid JSON"] });

        return undefined;
    }

    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        sendJson(res, 400, { error: "Bad Request", details: ["request body must be a JSON object"] });

        return undefined;
    }

    return parsed as Record<string, unknown>;
}

function validateOrReject(payload: Record<string, unknown>, res: ServerResponse): NormalisedTaskPayload | undefined {
    const result = validateTaskPayload(payload);

    if (Array.isArray(result)) {
        sendJson(res, 400, { error: "Bad Request", details: result });

        return undefined;
    }

    return result;
}

function sendMethodNotAllowed(res: ServerResponse, allowed: string[]): void {
    res.setHeader("Allow", allowed.join(", "));
    sendJson(res, 405, { error: "Method Not Allowed", details: [`Allowed methods: ${allowed.join(", ")}`] });
}

function sendJson(res: ServerResponse, status: number, body: Task | Task[] | ApiErrorBody): void {
    const payload = JSON.stringify(body);

    res.writeHead(status, {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Length": Buffer.byteLength(payload),
    }).end(payload);
}

function toBaseURL(server: Server): string {
    const address = server.address() as AddressInfo;

    return `http://127.0.0.1:${address.port}`;
}

async function closeServer(server: Server): Promise<void> {
    await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
    });
}
