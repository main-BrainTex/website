// Schemi del glossario come file SVG statici, condivisi tra le lingue.
import type { APIRoute, GetStaticPaths } from 'astro';
import { SKETCH_NAMES, sketchSvg } from '../../lib/sketches';

export const getStaticPaths: GetStaticPaths = () => SKETCH_NAMES.map((name) => ({ params: { name } }));

export const GET: APIRoute = ({ params }) =>
  new Response(sketchSvg(String(params.name)), { headers: { 'Content-Type': 'image/svg+xml' } });
