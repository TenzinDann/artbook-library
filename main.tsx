/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import App, { PageType } from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const pageType = (rootElement.dataset.page as PageType | undefined) ?? 'main';
const slug = rootElement.dataset.slug;

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App pageType={pageType} slug={slug} />
  </React.StrictMode>
);
