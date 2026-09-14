const PRADO_FORECAST_URL =
  "https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=-17.34&lon=-39.23";

type ForecastPeriod = {
  summary?: {
    symbol_code?: string;
  };
  details?: {
    precipitation_amount?: number;
  };
};

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

type LocationForecastResponse = {
  properties?: {
    timeseries?: ForecastTimeseries[];
  };
};

export type PradoWeather = {
  temperature: number;
  humidity: number;
  windSpeed: number;
  precipitationNext6Hours: number;
  condition: string;
  observedAt: string;
};

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

export function formatWeatherTime(isoDate: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Bahia",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoDate));
}

export function formatPrecipitation(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}
