/**
 * Proxy pour les médias Google Drive vers Instagram.
 * Instagram exige une URL qui retourne directement les octets de l'image/vidéo.
 * Les liens Drive (export=view, thumbnail, etc.) renvoient du HTML ou des redirections.
 * On récupère le fichier via l'API Drive et on l'upload sur Supabase Storage pour obtenir une URL publique.
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { getDriveClient } from '@/lib/integrations/google';
import { parseDriveFileId } from '@/lib/integrations/google-utils';

const BUCKET = 'instagram-proxy';

function isGoogleDriveUrl(url: string): boolean {
  return url.includes('drive.google.com');
}

/**
 * Récupère un fichier Drive via l'API et l'upload sur Supabase Storage.
 * Retourne l'URL publique ou null en cas d'erreur.
 * Si l'URL n'est pas Drive, la retourne telle quelle.
 * @throws Error avec un message explicite en cas d'échec
 */
export async function resolveDriveUrlForInstagram(
  orgId: string,
  url: string,
  isVideo: boolean
): Promise<string | null> {
  if (!isGoogleDriveUrl(url)) return url;

  const fileId = parseDriveFileId(url);
  if (!fileId) {
    throw new Error(
      'URL Google Drive non reconnue. Utilisez un lien du type drive.google.com/file/d/XXX ou sélectionnez le fichier via le sélecteur Drive.'
    );
  }

  const drive = await getDriveClient(orgId);
  if (!drive) {
    throw new Error(
      'Google Drive n\'est pas connecté pour cette organisation. Connectez-le dans Administration > Intégrations.'
    );
  }

  try {
    const response = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'arraybuffer' }
    );

    const buffer = response.data as ArrayBuffer;
    if (!buffer || buffer.byteLength === 0) {
      throw new Error('Le fichier Drive est vide ou inaccessible.');
    }

    const metadata = await drive.files.get({
      fileId,
      fields: 'mimeType,name',
    });
    const mimeType = metadata.data.mimeType ?? (isVideo ? 'video/mp4' : 'image/jpeg');

    const ext = mimeType.includes('png')
      ? 'png'
      : mimeType.includes('video') || mimeType.includes('mp4')
        ? 'mp4'
        : 'jpg';
    const path = `temp/${Date.now()}-${fileId.slice(0, 8)}.${ext}`;

    const supabase = createAdminClient();

    // Créer le bucket s'il n'existe pas
    const { error: bucketError } = await supabase.storage.getBucket(BUCKET);
    if (bucketError) {
      const { error: createErr } = await supabase.storage.createBucket(BUCKET, {
        public: true,
        fileSizeLimit: '10MB',
        allowedMimeTypes: ['image/*', 'video/*'],
      });
      if (createErr) {
        console.error('[Instagram proxy] Create bucket error:', createErr);
        throw new Error(
          'Impossible de créer le bucket de stockage. Créez manuellement le bucket "instagram-proxy" dans Supabase (Storage).'
        );
      }
    }

    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, buffer, {
      contentType: mimeType,
      upsert: true,
    });

    if (uploadError) {
      console.error('[Instagram proxy] Upload error:', uploadError);
      throw new Error(`Échec de l'upload vers le stockage : ${uploadError.message}`);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(path);

    return publicUrl;
  } catch (err) {
    if (err instanceof Error && err.message.startsWith('Impossible') === false) {
      const msg = err.message;
      if (msg.includes('404') || msg.includes('not found')) {
        throw new Error('Fichier Drive introuvable. Vérifiez que le fichier existe et est accessible par le compte Google connecté.');
      }
      if (msg.includes('403') || msg.includes('Forbidden')) {
        throw new Error('Accès refusé au fichier Drive. Le fichier doit être dans le Drive du compte connecté ou partagé avec lui.');
      }
    }
    if (err instanceof Error) throw err;
    console.error('[Instagram proxy] Drive fetch error:', err);
    throw new Error('Erreur lors de la récupération du fichier Google Drive.');
  }
}
