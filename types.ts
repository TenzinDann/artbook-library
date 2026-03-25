/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export interface Artbook {
  id: string;
  slug: string;
  title: string;
  artist: string;
  description: string;
  longDescription?: string;
  category: 'Illustration' | 'Concept Art' | 'Photography';
  imageUrl: string;
  gallery?: string[];
  features: string[];
  audioTrack?: string; // URL to background music
  tagline?: string;
}
