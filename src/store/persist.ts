import { type StateCreator, type StoreMutatorIdentifier } from "zustand";
import { Store } from "@tauri-apps/plugin-store";

const STORE_FILE = "zustand-state.json";
let storeInstance: Store | null = null;

async function getStore(): Promise<Store> {
  if (!storeInstance) {
    storeInstance = await Store.load(STORE_FILE);
  }
  return storeInstance;
}

type PersistOptions<T> = {
  /** Key used in the Tauri store file. */
  name: string;
  /** Pick which slices of state to persist. Omit to persist everything. */
  pick?: (keyof T)[];
  /** Debounce interval in ms (default: 500). */
  debounce?: number;
};

type TauriPersist = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  initializer: StateCreator<T, Mps, Mcs>,
  options: PersistOptions<T>
) => StateCreator<T, Mps, Mcs>;

type TauriPersistImpl = <T>(
  initializer: StateCreator<T, [], []>,
  options: PersistOptions<T>
) => StateCreator<T, [], []>;

const tauriPersistImpl: TauriPersistImpl = (initializer, options) => {
  const { name, pick, debounce: debounceMs = 500 } = options;

  return (set, get, api) => {
    // Debounce timer
    let timer: ReturnType<typeof setTimeout> | null = null;

    const persistState = () => {
      const state = get();
      const toPersist: Record<string, unknown> = {};

      if (pick) {
        for (const key of pick) {
          toPersist[key as string] = state[key];
        }
      } else {
        // Persist all non-function values
        for (const [k, v] of Object.entries(state as Record<string, unknown>)) {
          if (typeof v !== "function") {
            toPersist[k] = v;
          }
        }
      }

      getStore()
        .then((store) => {
          store.set(name, toPersist);
          return store.save();
        })
        .catch((e) => console.error("Failed to persist state:", e));
    };

    // Subscribe to changes and debounce writes
    api.subscribe(() => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(persistState, debounceMs);
    });

    return initializer(set, get, api);
  };
};

/**
 * Zustand middleware that persists selected state slices to Tauri's
 * plugin-store (crash recovery). Debounces writes by default (500ms).
 *
 * @example
 * const useMyStore = create<MyState>()(
 *   tauriPersist(
 *     devtools((set) => ({ ... }), { name: "my-store" }),
 *     { name: "my-state", pick: ["count", "settings"] }
 *   )
 * );
 */
export const tauriPersist = tauriPersistImpl as TauriPersist;

/**
 * Rehydrate a Zustand store from persisted Tauri store data.
 * Call during app initialization (e.g., in a useEffect or top-level hydrate).
 */
export async function rehydrateStore<T>(
  name: string,
  setState: (partial: Partial<T>) => void
): Promise<void> {
  try {
    const store = await getStore();
    const data = await store.get<Record<string, unknown>>(name);
    if (data) {
      setState(data as Partial<T>);
    }
  } catch (e) {
    console.error("Failed to rehydrate store:", e);
  }
}
