import { supabase } from '../config/supabase';

export async function uploadImage(
  bucket: string,
  path: string,
  file: { uri: string; type: string; name: string },
) {
  const formData = new FormData();
  formData.append('file', file as any);

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, formData, {
      contentType: file.type,
      upsert: true,
    });

  if (error) {
    throw error;
  }

  return data;
}

export function getImageUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
