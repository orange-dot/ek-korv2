import MarkdownDoc from '../../components/MarkdownDoc';

// Import markdown content at build time
import contentEn from '../../../../tehnika/konceptualno/en/00-arhitektura.md?raw';
import contentSr from '../../../../tehnika/konceptualno/sr/00-arhitektura.md?raw';

export default function ArchitecturePage() {
  return (
    <MarkdownDoc
      content={contentEn}
      contentSr={contentSr}
      title="System Architecture"
      backLink="/docs"
      backLabel="Documentation"
    />
  );
}
