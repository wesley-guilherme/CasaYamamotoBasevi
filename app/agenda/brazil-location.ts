// Consulta e validação de estados e municípios brasileiros.
import localities from "./brazil-localities.json";

// Lista de estados e municípios utilizada na validação e nos campos de localidade.
export const brazilStates = localities;
// Remove acentos e diferenças de caixa para comparar nomes de localidades.
export function normalizeLocation(value: string): string {
  return value.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
}
// Localiza um estado brasileiro a partir de sua identificação normalizada.
export function findBrazilState(value: string) {
  const query = normalizeLocation(value);
  return brazilStates.find(state => normalizeLocation(state.name) === query || normalizeLocation(state.code) === query || normalizeLocation(`${state.name} (${state.code})`) === query);
}
// Valida o estado e a cidade e devolve os nomes oficiais da base de localidades.
export function parseBrazilLocation(stateValue: string, cityValue: string) {
  if (!stateValue.trim() && !cityValue.trim()) return { state: "", city: "" };
  const state = findBrazilState(stateValue);
  if (!state) throw new Error("Selecione um estado da lista antes de informar a cidade.");
  if (!cityValue.trim()) return { state: state.name, city: "" };
  const city = state.cities.find(name => normalizeLocation(name) === normalizeLocation(cityValue));
  if (!city) throw new Error("Selecione uma cidade da lista do estado escolhido.");
  return { state: state.name, city };
}
