/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Artbook } from '../types';
import { resolveMediaUrl } from '../mediaUrl';

const RAW_ARTBOOKS: Artbook[] = [
  {
    id: 'a1',
    slug: 'visions-of-light',
    title: 'Visions of Light',
    artist: 'Elena Rostova',
    description: 'A breathtaking collection of ethereal landscapes and light studies.',
    longDescription:
      'Visions of Light explores the interplay between natural illumination and atmospheric conditions. Elena Rostova spent three years traveling to remote locations to capture these fleeting moments, translating them into stunning watercolor and digital mixed media pieces. The exhibition is accompanied by a serene ambient track that reflects the stillness of her subjects.',
    category: 'Illustration',
    imageUrl:
      'https://pub-404a20f41ee84d6a8e87c77f2be7452c.r2.dev/visions-of-light-cover.mp4',
    gallery: [
      'https://pub-404a20f41ee84d6a8e87c77f2be7452c.r2.dev/visions-of-light-cover.mp4'
    ],
    features: ['240 Pages', 'Matte Finish', 'Includes Artist Commentary'],
    audioTrack:
      'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=ambient-piano-amp-strings-10711.mp3',
    tagline: 'The Beauty of Nature'
  },
  {
    id: 'a2',
    slug: 'neon-dystopia',
    title: 'Explore the Galaxy',
    artist: 'Kenji Sato',
    description: 'Concept art from the acclaimed cyberpunk universe.',
    longDescription:
      "Dive into the gritty, neon-lit streets of Neo-Tokyo 2150. Kenji Sato's masterful concept art defined the visual language of a generation. This artbook features early sketches, character designs, and sprawling cityscapes that never made it into the final production. The accompanying synthwave track sets the perfect mood for exploring this dark future.",
    category: 'Concept Art',
    imageUrl:
      'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260315_073750_51473149-4350-4920-ae24-c8214286f323.mp4',
    gallery: [
      'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260315_073750_51473149-4350-4920-ae24-c8214286f323.mp4'
    ],
    features: ['312 Pages', 'Glossy Paper', 'Fold-out City Map'],
    audioTrack:
      'https://cdn.pixabay.com/download/audio/2022/10/18/audio_31c2730e64.mp3?filename=cyberpunk-2099-10701.mp3',
    tagline: 'Explore the Galaxy'
  },
  {
    id: 'a4',
    slug: 'silent-monoliths',
    title: 'Need for Speed',
    artist: 'David Chen',
    description: 'Black and white photography of brutalist architecture.',
    longDescription:
      "Need for Speed is a stark, uncompromising look at brutalist architecture around the world. David Chen's high-contrast black and white photography strips away the noise of the city, leaving only the raw geometry of concrete and steel. The exhibition is paired with a deep, resonant drone track that echoes the imposing nature of the structures.",
    category: 'Photography',
    imageUrl:
      'https://pub-404a20f41ee84d6a8e87c77f2be7452c.r2.dev/R34.mp4',
    gallery: [
      'https://pub-404a20f41ee84d6a8e87c77f2be7452c.r2.dev/R34.mp4'
    ],
    features: ['180 Pages', 'Heavyweight Paper', 'Signed by Artist'],
    audioTrack:
      'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=dark-ambient-drone-10575.mp3',
    tagline: 'Need for Speed'
  },
  {
    id: 'a6',
    slug: 'art-of-war',
    title: 'Art of War',
    artist: 'David Chen',
    description: 'Black and white photography of brutalist architecture.',
    longDescription:
      "Silent Monoliths is a stark, uncompromising look at brutalist architecture around the world. David Chen's high-contrast black and white photography strips away the noise of the city, leaving only the raw geometry of concrete and steel. The exhibition is paired with a deep, resonant drone track that echoes the imposing nature of the structures.",
    category: 'Concept Art',
    imageUrl:
      'https://pub-404a20f41ee84d6a8e87c77f2be7452c.r2.dev/Art%20of%20War.mp4',
    gallery: [
      'https://pub-404a20f41ee84d6a8e87c77f2be7452c.r2.dev/Art%20of%20War.mp4'
    ],
    features: ['180 Pages', 'Heavyweight Paper', 'Signed by Artist'],
    audioTrack:
      'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=dark-ambient-drone-10575.mp3',
    tagline: 'Need for Speed'
  },
  {
    id: 'a5',
    slug: 'art-of-anime',
    title: 'Art of Anime',
    artist: 'David Chen',
    description: 'Black and white photography of brutalist architecture.',
    longDescription:
      "Silent Monoliths is a stark, uncompromising look at brutalist architecture around the world. David Chen's high-contrast black and white photography strips away the noise of the city, leaving only the raw geometry of concrete and steel. The exhibition is paired with a deep, resonant drone track that echoes the imposing nature of the structures.",
    category: 'Concept Art',
    imageUrl:
      'https://pub-404a20f41ee84d6a8e87c77f2be7452c.r2.dev/Campfire.mp4',
    gallery: [
      'https://pub-404a20f41ee84d6a8e87c77f2be7452c.r2.dev/Campfire.mp4'
    ],
    features: ['180 Pages', 'Heavyweight Paper', 'Signed by Artist'],
    audioTrack:
      'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=dark-ambient-drone-10575.mp3',
    tagline: 'Need for Speed'
  }
];

export const ARTBOOKS: Artbook[] = RAW_ARTBOOKS.map((artbook) => ({
  ...artbook,
  imageUrl: resolveMediaUrl(artbook.imageUrl),
  gallery: artbook.gallery?.map(resolveMediaUrl),
}));

export const getArtbookBySlug = (slug: string): Artbook | undefined =>
  ARTBOOKS.find((artbook) => artbook.slug === slug);

export const getArtbookPath = (slug: string): string => `/gallery/${slug}/`;
