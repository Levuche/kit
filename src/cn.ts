import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/*
 * tailwind-merge has to know the size presets in theme.css (and the ones
 * @levuche/ui shares), or it reads text-h1 as a colour and drops the real
 * colour next to it. Keep these lists in step with the @theme blocks.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        'display',
        'h1',
        'h2',
        'h3',
        'h4',
        'lead',
        'body',
        'ui',
        'caption',
        'price',
        'logo',
      ],
      spacing: [
        'gutter',
        'section',
        'hero',
        'card',
        'split',
        'control',
        'control-md',
        'control-lg',
      ],
      container: [
        'layout',
        'article',
        'form',
        'narrow',
        'measure',
        'site',
        'site-wide',
      ],
      radius: ['tile', 'card', 'panel', 'device'],
      shadow: ['lift'],
    },
  },
});

/** Joins class names; later Tailwind classes win over earlier ones. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
