import { useEffect } from 'react';
import { Rails } from './motifs';
import { TopBar, Footer } from './sections';
import { ProductPage, getSlugFromURL } from './module-page';
import { MODULES } from './data';

export default function ModuleApp() {
  const slug = getSlugFromURL();

  useEffect(() => {
    const m = MODULES.find((x) => x.slug === slug);
    if (m) document.title = `SYSTEM — ${m.name}`;
  }, [slug]);

  return (
    <>
      <Rails left="system" right="rope-anim" enabled={true} />

      <TopBar />
      <ProductPage slug={slug} />
      <Footer />
    </>
  );
}
