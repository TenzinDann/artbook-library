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
  tagline?: string;
}

export interface ArtbookContent {
  slug: string;
  images: string[];
}
