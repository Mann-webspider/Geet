import type { ApiResponse } from "./types";
import type {
  Artist,
  ArtistWithTracks,
  CreateArtistPayload,
  UpdateArtistPayload,
} from "../types/artist";
import { adminAxios } from "./axios.admin";

export async function listArtists(params: {
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  if (typeof params.limit === "number") qs.set("limit", String(params.limit));
  if (typeof params.offset === "number")
    qs.set("offset", String(params.offset));
  const url = `/v1/artists${qs.toString() ? `?${qs}` : ""}`;
  let res = await adminAxios.get<Artist[]>(url)
  return res.data;
}

export async function getArtist(idOrSlug: string) {
  let res = await adminAxios.get<ArtistWithTracks>(`/v1/artists/${idOrSlug}`);
  return res.data;
}

export async function createArtist(payload: CreateArtistPayload) {
  let res = await adminAxios.post<Artist>(`/v1/admin/artists`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function updateArtist(id: string, payload: UpdateArtistPayload) {
  let res = await adminAxios.patch<Artist>(`/v1/admin/artists/${id}`, payload);
  return res.data;
}
