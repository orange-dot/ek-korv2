import MarkdownDoc from '../../components/MarkdownDoc';

// Import markdown content at build time
import contentEn from '../../../../tehnika/konceptualno/en/01-v2g-grid.md?raw';
import contentSr from '../../../../tehnika/konceptualno/sr/01-v2g-grid.md?raw';

export default function V2GConceptPage() {
  return (
    <MarkdownDoc
      content={contentEn}
      contentSr={contentSr}
      title="V2G Concepts"
      backLink="/docs"
      backLabel="Documentation"
    />
  );
}
