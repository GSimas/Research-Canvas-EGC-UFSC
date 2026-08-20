import type { ResearchProject } from "../../domain/models/project";

const DB_NAME = "research-canvas-egc";
const STORE = "projects";
const DB_VERSION = 1;

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("updatedAt", "updatedAt");
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Não foi possível abrir o armazenamento local."));
  });
}

async function withStore<T>(mode: IDBTransactionMode, operation: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const request = operation(tx.objectStore(STORE));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Falha ao acessar os projetos."));
    tx.oncomplete = () => db.close();
  });
}

export const projectStorage = {
  list: () => withStore<ResearchProject[]>("readonly", (store) => store.getAll()),
  get: (id: string) => withStore<ResearchProject | undefined>("readonly", (store) => store.get(id)),
  save: (project: ResearchProject) => withStore<IDBValidKey>("readwrite", (store) => store.put(project)),
  remove: (id: string) => withStore<undefined>("readwrite", (store) => store.delete(id)),
};
