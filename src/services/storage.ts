import { supabase } from '../config/supabase';
import {e2eBackend, isE2EMode} from '../e2e/fakeBackend';

export async function uploadImage(
  bucket: string,
  path: string,
  file: { uri: string; type: string; name: string },
) {
  if (isE2EMode) {
    return e2eBackend.uploadImage(bucket, path);
  }

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
  if (isE2EMode) {
    return e2eBackend.getImageUrl(bucket, path);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function getSignedImageUrl(
  bucket: string,
  pathOrUrl: string,
  expiresIn: number = 60 * 10,
): Promise<string> {
  if (isE2EMode) {
    return e2eBackend.getSignedImageUrl(bucket, pathOrUrl);
  }

  const publicMarker = `/object/public/${bucket}/`;
  const signedMarker = `/object/sign/${bucket}/`;
  let path = pathOrUrl;

  if (pathOrUrl.includes(publicMarker)) {
    path = decodeURIComponent(pathOrUrl.split(publicMarker)[1]);
  } else if (pathOrUrl.includes(signedMarker)) {
    path = decodeURIComponent(pathOrUrl.split(signedMarker)[1].split('?')[0]);
  } else if (pathOrUrl.startsWith(`${bucket}/`)) {
    path = pathOrUrl.slice(bucket.length + 1);
  } else if (/^https?:\/\//.test(pathOrUrl)) {
    return pathOrUrl;
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error || !data?.signedUrl) {
    return pathOrUrl;
  }

  return data.signedUrl;
}
