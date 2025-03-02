import wiki from 'wikipedia';

export function fetchPageContent(pageTitle: string) {
  return wiki.page(pageTitle).then(page => page.content());
}