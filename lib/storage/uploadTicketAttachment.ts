"use client";

import { buildApiUrl } from "@/lib/api";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || process.env.SUPABASE_STORAGE_BUCKET || "tickets";

if (!supabaseUrl || !supabaseKey) {
  // eslint-disable-next-line no-console
  console.warn("Supabase env vars missing. Uploads will fail until configured.");
}

type UploadResult = {
  url: string;
  path: string;
  size: number;
  mimeType: string;
};

export async function uploadTicketAttachment(ticketId: string, file: File, token: string): Promise<UploadResult> {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase no está configurado en el frontend.");
  }

  const safeName = file.name.replace(/\s+/g, "_");
  const rawPath = `ticket_${ticketId}/${Date.now()}-${safeName}`;
  const encodedPath = encodeURIComponent(rawPath);

  // Subida directa a Supabase Storage via REST
  const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${encodedPath}`;
  const uploadRes = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${supabaseKey}`,
      apikey: supabaseKey,
      "Content-Type": file.type || "application/octet-stream",
      "x-upsert": "false",
    },
    body: file,
  });
  if (!uploadRes.ok) {
    const text = await uploadRes.text().catch(() => "");
    throw new Error(text || `No se pudo subir el archivo a Storage (${uploadRes.status})`);
  }

  const url = `${supabaseUrl}/storage/v1/object/public/${bucket}/${rawPath}`;

  // Registrar en backend
  const res = await fetch(buildApiUrl(`/tickets/${ticketId}/attachments`), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      nombre: file.name,
      url,
      path: rawPath,
      tamaño: file.size,
      tipoMime: file.type || "application/octet-stream",
    }),
  });
  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(payload?.error || payload?.message || "No se pudo registrar el adjunto");
  }

  return { url, path: rawPath, size: file.size, mimeType: file.type || "application/octet-stream" };
}
