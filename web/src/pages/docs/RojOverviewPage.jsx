import MarkdownDoc from '../../components/MarkdownDoc';

// Import markdown content at build time
import contentEn from '../../../../tehnika/konceptualno/en/02-roj-intelligence.md?raw';
import contentSr from '../../../../tehnika/konceptualno/sr/02-roj-intelligence.md?raw';

export default function RojOverviewPage() {
  return (
    <MarkdownDoc
      content={contentEn}
      contentSr={contentSr}
      title="ROJ Intelligence"
      backLink="/docs"
      backLabel="Documentation"
    />
  );
}
