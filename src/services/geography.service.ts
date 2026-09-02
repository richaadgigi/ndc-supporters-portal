export interface GeoItem {
  id: number | string;
  name: string;
  region?: string;
  state_id?: number;
  lga_id?: number | string;
  ward_id?: string;
  pu_code?: string;
}

interface GeoPage<T> {
  count?: number;
  results?: T[];
}

const get = async <T>(path: string, search = ''): Promise<T> => {
  const response = await fetch(`/api/geo/${path}${search}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.detail || `Request failed (${response.status})`);
  }
  return data as T;
};

const unwrap = (res: GeoPage<GeoItem> | GeoItem[] | null): GeoItem[] => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  return res.results ?? [];
};

const geographyService = {
  getStates: async (): Promise<GeoItem[]> =>
    unwrap(await get<GeoPage<GeoItem>>('states', '?page_size=100')),

  getLgas: async (stateId: string | number): Promise<GeoItem[]> =>
    unwrap(await get<GeoPage<GeoItem>>(`states/${stateId}/lgas`, '?page_size=100')),

  getWards: async (lgaId: string | number): Promise<GeoItem[]> =>
    unwrap(await get<GeoPage<GeoItem>>(`lgas/${lgaId}/wards`, '?page_size=200')),

  getPollingUnits: async (wardId: string | number): Promise<GeoItem[]> =>
    unwrap(await get<GeoPage<GeoItem>>(`wards/${wardId}/polling-units`, '?page_size=500')),

  getConstituencies: async (stateId: string | number): Promise<GeoItem[]> =>
    unwrap(await get<GeoPage<GeoItem>>(`states/${stateId}/constituencies`, '?page_size=200')),
};

export default geographyService;
