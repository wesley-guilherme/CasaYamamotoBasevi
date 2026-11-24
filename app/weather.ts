// Consulta e formatação dos dados meteorológicos de Prado.
// Endpoint meteorológico com as coordenadas utilizadas para a previsão de Prado.
const PRADO_FORECAST_URL =
  "https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=-17.34&lon=-39.23";

// Resumo meteorológico e precipitação previstos para um intervalo.
type ForecastPeriod = {
  summary?: {
    symbol_code?: string;
  };
  details?: {
    precipitation_amount?: number;
  };
};

// Medição meteorológica de um instante e previsão dos períodos seguintes.
type ForecastTimeseries = {
  time: string;
  data: {
    instant: {
      details: {
        air_temperature?: number;
        relative_humidity?: number;
        wind_speed?: number;
      };
    };
    next_1_hours?: ForecastPeriod;
    next_6_hours?: ForecastPeriod;
  };
};

// Estrutura da série temporal recebida do serviço meteorológico.
type LocationForecastResponse = {
  properties?: {
    timeseries?: ForecastTimeseries[];
  };
};

// Dados de clima convertidos e preparados para apresentação na página inicial.
export type PradoWeather = {
  temperature: number;
  humidity: number;
  windSpeed: number;
  precipitationNext6Hours: number;
  condition: string;
  observedAt: string;
};

// Traduz o código meteorológico recebido em uma descrição curta em português.
function describeWeather(symbolCode?: string) {
  const symbol = symbolCode?.replace(/_(day|night|polartwilight)$/, "") ?? "";

  const descriptions: Array<[string, string]> = [
    ["heavyrainandthunder", "Chuva forte e trovoadas"],
    ["heavyrainshowersandthunder", "Pancadas fortes e trovoadas"],
    ["rainshowersandthunder", "Pancadas e trovoadas"],
    ["lightrainshowersandthunder", "Pancadas leves e trovoadas"],
    ["heavyrainshowers", "Pancadas fortes"],
    ["lightrainshowers", "Pancadas leves"],
    ["rainshowers", "Pancadas de chuva"],
    ["heavyrain", "Chuva forte"],
    ["lightrain", "Chuva leve"],
    ["rain", "Chuva"],
    ["partlycloudy", "Parcialmente nublado"],
    ["clearsky", "Céu limpo"],
    ["fair", "Poucas nuvens"],
    ["cloudy", "Nublado"],
    ["fog", "Neblina"],
    ["thunder", "Trovoadas"],
    ["snow", "Neve"],
    ["sleet", "Chuva congelada"],
  ];

  return descriptions.find(([code]) => symbol.includes(code))?.[1] ?? "Condição atual";
}

// Consulta a previsão de Prado, converte unidades e retorna ausência de dados em caso de falha.
export async function getPradoWeather(): Promise<PradoWeather | null> {
  try {
    const response = await fetch(PRADO_FORECAST_URL, {
      headers: {
        Accept: "application/json",
        "User-Agent":
          "CasaYamamotoBasevi/1.0 (casa-yamamoto-basevi.wesley-analistasyste.chatgpt.site)",
      },
      next: { revalidate: 1800 },
      cf: { cacheEverything: true, cacheTtl: 1800 },
    } as RequestInit & {
      next: { revalidate: number };
      cf: { cacheEverything: boolean; cacheTtl: number };
    });

    if (!response.ok) return null;

    const payload = (await response.json()) as LocationForecastResponse;
    const current = payload.properties?.timeseries?.[0];
    const details = current?.data.instant.details;

    if (
      !current ||
      details?.air_temperature === undefined ||
      details.relative_humidity === undefined ||
      details.wind_speed === undefined
    ) {
      return null;
    }

    const precipitation =
      current.data.next_6_hours?.details?.precipitation_amount ??
      current.data.next_1_hours?.details?.precipitation_amount ??
      0;
    const symbolCode =
      current.data.next_1_hours?.summary?.symbol_code ??
      current.data.next_6_hours?.summary?.symbol_code;

    return {
      temperature: Math.round(details.air_temperature),
      humidity: Math.round(details.relative_humidity),
      windSpeed: Math.round(details.wind_speed * 3.6),
      precipitationNext6Hours: precipitation,
      condition: describeWeather(symbolCode),
      observedAt: current.time,
    };
  } catch {
    return null;
  }
}

// Formata o horário da previsão no fuso America/Bahia.
export function formatWeatherTime(isoDate: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Bahia",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoDate));
}

// Formata a precipitação com uma casa decimal no padrão brasileiro.
export function formatPrecipitation(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}
