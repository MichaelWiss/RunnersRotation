/**
 * By default, Remix will handle generating the HTTP Response for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.server
 */

import {PassThrough} from 'node:stream';

import type {AppLoadContext, EntryContext} from 'react-router';
// import {Response} from '@remix-run/web-fetch';
import {ServerRouter} from 'react-router';
import {isbot} from 'isbot';
import {renderToPipeableStream} from 'react-dom/server';
import {createContentSecurityPolicy} from '@shopify/hydrogen';
import {ensureWebStreams} from './polyfills/web-streams';

const webStreamsReady = ensureWebStreams();

const ABORT_DELAY = 5_000;

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  reactRouterContext: EntryContext,
  loadContext: AppLoadContext,
) {
  await webStreamsReady;
  return isbot(request.headers.get('user-agent'))
    ? handleBotRequest(
        request,
        responseStatusCode,
        responseHeaders,
        reactRouterContext,
        loadContext,
      )
    : handleBrowserRequest(
        request,
        responseStatusCode,
        responseHeaders,
        reactRouterContext,
      );
}

function handleBotRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  reactRouterContext: EntryContext,
  context: AppLoadContext,
) {
  return new Promise((resolve, reject) => {
    const {nonce, header, NonceProvider} = createContentSecurityPolicy({
      shop: {
        // Only storeDomain is required for baseline CSP; checkout domain optional and removed for minimal env surface.
        storeDomain: context.env.PUBLIC_STORE_DOMAIN,
      },
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https://images.unsplash.com",
        "https://plus.unsplash.com",
        "https://cdn.shopify.com",
      ],
      connectSrc: [
        "'self'",
        "https://monorail-edge.shopifysvc.com",
        "https://fonts.googleapis.com",
        "https://fonts.gstatic.com",
      ],
    });

    const {pipe, abort} = renderToPipeableStream(
      <NonceProvider>
        <ServerRouter
          context={reactRouterContext}
          url={request.url}
          nonce={nonce}
        />
      </NonceProvider>,
      {
        nonce,
        onAllReady() {
          const body = new PassThrough();

          responseHeaders.set('Content-Type', 'text/html');
          responseHeaders.set('Content-Security-Policy', header);

          resolve(
            new Response(body as unknown as BodyInit, {
              headers: responseHeaders,
              status: responseStatusCode,
            }),
          );

          pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          responseStatusCode = 500;
          console.error(
            (error as Error)?.stack ? (error as Error).stack : error,
          );
        },
      },
    );

    setTimeout(abort, ABORT_DELAY);
  });
}

function handleBrowserRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  reactRouterContext: EntryContext,
) {
  // Provide minimal shop config so Hydrogen generates a CSP including our nonce for inline tokens/style diagnostics
  const host = request.headers.get('host') || '';
  // We can't access full loadContext here easily, so rely on env injection from process (ok in server env)
  const storeDomain = process.env.PUBLIC_STORE_DOMAIN;
  const {nonce, header, NonceProvider} = createContentSecurityPolicy(
    storeDomain
      ? {
          shop: {storeDomain},
          fontSrc: [
            "'self'",
            "https://fonts.gstatic.com",
          ],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            "https://fonts.googleapis.com",
          ],
          imgSrc: [
            "'self'",
            "data:",
            "https://images.unsplash.com",
            "https://plus.unsplash.com",
            "https://cdn.shopify.com",
          ],
          connectSrc: [
            "'self'",
            "https://monorail-edge.shopifysvc.com",
            "https://fonts.googleapis.com",
            "https://fonts.gstatic.com",
          ],
        }
      : undefined,
  );

  return new Promise((resolve, reject) => {
    const {pipe, abort} = renderToPipeableStream(
      <NonceProvider>
        <ServerRouter
          context={reactRouterContext}
          url={request.url}
          nonce={nonce}
        />
      </NonceProvider>,
      {
        nonce,
        onShellReady() {
          const body = new PassThrough();

          responseHeaders.set('Content-Type', 'text/html');
          responseHeaders.set('Content-Security-Policy', header);

          resolve(
            new Response(body as unknown as BodyInit, {
              headers: responseHeaders,
              status: responseStatusCode,
            }),
          );

          pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          console.error(
            (error as Error)?.stack ? (error as Error).stack : error,
          );
          responseStatusCode = 500;
        },
      },
    );

    setTimeout(abort, ABORT_DELAY);
  });
}
