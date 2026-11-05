import localities from "./brazil-localities.json";

export const brazilStates = localities;
export function normalizeLocation(value: string): string {
  return value.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
}
export function findBrazilState(value: string) {
  const query = normalizeLocation(value);
  return brazilStates.find(state => normalizeLocation(state.name) === query || normalizeLocation(state.code) === query || normalizeLocation(`${state.name} (${state.code})`) === query);
}
export function parseBrazilLocation(stateValue: string, cityValue: string) {
  if (!stateValue.trim() && !cityValue.trim()) return { state: "", city: "" };
  const state = findBrazilState(stateValue);
  if (!state) throw new Error("Selecione um estado da lista antes de informar a cidade.");
  if (!cityValue.trim()) return { state: state.name, city: "" };
  const city = state.cities.find(name => normalizeLocation(name) === normalizeLocation(cityValue));
  if (!city) throw new Error("Selecione uma cidade da lista do estado escolhido.");
  return { state: state.name, city };
}
