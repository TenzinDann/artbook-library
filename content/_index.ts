import { resolveMediaUrl } from '../mediaUrl';
import type { ArtbookContent } from '../types';

export type { ArtbookContent };

import visionsOfLight from './visions-of-light/_index';
import neonDystopia from './neon-dystopia/_index';
import silentMonoliths from './silent-monoliths/_index';
import artOfWar from './art-of-war/_index';
import artOfAnime from './art-of-anime/_index';

const allContent: Record<string, ArtbookContent> = {
  'visions-of-light': visionsOfLight,
  'neon-dystopia': neonDystopia,
  'silent-monoliths': silentMonoliths,
  'art-of-war': artOfWar,
  'art-of-anime': artOfAnime,
};

const getFilename = (url: string): string => {
  try {
    return decodeURIComponent(url.split('/').pop()?.split('?')[0] ?? url);
  } catch {
    return url;
  }
};

export const getContentBySlug = (slug: string): ArtbookContent | undefined => {
  const content = allContent[slug];
  if (!content) return undefined;
  return {
    ...content,
    images: [...content.images]
      .map(resolveMediaUrl)
      .sort((a, b) => getFilename(a).localeCompare(getFilename(b))),
  };
};

export default allContent;
