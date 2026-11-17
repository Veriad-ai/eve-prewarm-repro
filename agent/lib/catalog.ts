import catalog from "./catalog.json" with { type: "json" };

export function findApp(id: string) {
  return catalog.find((app) => app.id === id);
}
