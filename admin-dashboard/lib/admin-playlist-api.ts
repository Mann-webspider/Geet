import type { ApiResponse } from "./types";
import type {
  EditorialPlaylist,
  CreateEditorialPlaylistPayload,
  UpdateEditorialPlaylistPayload,
  SetTracksPayload,
} from "../types/index";
import { adminAxios } from "./axios.admin";



export async function listEditorialPlaylists() {
  let res = await adminAxios.get<EditorialPlaylist[]>(
    `/v1/admin/playlists?editorial=true`,
  );
  return res.data;
}

export async function getEditorialPlaylist(id: string) {
  let res = await adminAxios.get<EditorialPlaylist>(`/v1/playlists/${id}`);
  return res.data;
}

export async function createEditorialPlaylist(
  payload: CreateEditorialPlaylistPayload,
) {
  let res = await adminAxios.post<EditorialPlaylist>(
    `/v1/admin/editorial-playlists`,
    
   payload
    
  );
  return res.data;
}

export async function updateEditorialPlaylist(
  id: string,
  payload: UpdateEditorialPlaylistPayload,
) {
  let res = await adminAxios.patch<EditorialPlaylist>(
    `/v1/admin/editorial-playlists/${id}`,
    payload,
  );
  return
}

export async function setPlaylistTracks(id: string, payload: SetTracksPayload) {
  let res = await adminAxios.post<{ message: string }>(
    `/v1/admin/editorial-playlists/${id}/tracks`,
    payload,
  );
  return res.data;
}

export async function refreshTrending() {
  let res = await adminAxios.post<{ message: string }>(
    `/v1/admin/editorial-playlists/trending/refresh`
  );
  return res.data;
}
