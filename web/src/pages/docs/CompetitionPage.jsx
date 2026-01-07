import MarkdownDoc from '../../components/MarkdownDoc';

// Import markdown content at build time
import contentEn from '../../../../tehnika/konceptualno/en/03-konkurencija.md?raw';
import contentSr from '../../../../tehnika/konceptualno/sr/03-konkurencija.md?raw';

export default function CompetitionPage() {
  return (
    <MarkdownDoc
      content={contentEn}
      contentSr={contentSr}
      title="Competition Analysis"
      backLink="/docs"
      backLabel="Documentation"
    />
  );
}
