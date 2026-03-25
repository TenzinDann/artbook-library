/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getArtbookPath } from './data/artbooks';

const BASE_URL = import.meta.env.BASE_URL ?? '/';
const BASE_PATH = BASE_URL === '/' ? '' : BASE_URL.replace(/\/$/, '');

export const withBasePath = (pathname: string): string => `${BASE_PATH}${pathname}`;

export const getHomePath = (): string => withBasePath('/');
export const getGalleryPath = (): string => withBasePath('/gallery/');
export const getAboutPath = (): string => withBasePath('/about/');
export const getArtbookPagePath = (slug: string): string => withBasePath(getArtbookPath(slug));

export const getPublicAssetPath = (asset: string): string =>
  `${BASE_URL}${asset.replace(/^\/+/, '')}`;
