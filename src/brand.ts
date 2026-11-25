/**
 * Levuche's name and addresses, in one place, so the website, the app and
 * any admin screens agree.
 */
export const brand = {
  name: 'Levuche',
  wordmark: 'levuche',
  themeColor: '#24257A',
  owner: { name: 'Jagodana LLC', url: 'https://jagodana.com' },
  urls: {
    /** The marketing website. */
    site: 'https://levuche.com',
    /** The app: dashboard and editor. */
    app: 'https://app.levuche.com',
    /** Creator sites live on subdomains of this host. */
    pages: 'https://levuche.page',
  },
} as const;
