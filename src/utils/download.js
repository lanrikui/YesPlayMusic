import { getMP3 } from '@/api/track';

const electron =
  process.env.IS_ELECTRON === true ? window.require('electron') : null;
const ipcRenderer =
  process.env.IS_ELECTRON === true ? electron.ipcRenderer : null;

function sanitizeFilename(name) {
  return name.replace(/[/\\:*?"<>|]/g, '_');
}

export async function downloadTrack(track) {
  const result = await getMP3(track.id);
  const data = result?.data?.[0];
  if (!data || !data.url || data.freeTrialInfo !== null) {
    throw new Error('this track is not available for download');
  }

  const url = data.url.replace(/^http:/, 'https:');
  const artistNames = (track.ar || track.artists || [])
    .map(a => a.name)
    .join(', ');
  const filename = sanitizeFilename(`${artistNames} - ${track.name}.mp3`);

  if (process.env.IS_ELECTRON === true) {
    await ipcRenderer.invoke('downloadTrack', { url, filename });
  } else {
    window.open(url, '_blank');
  }
}
