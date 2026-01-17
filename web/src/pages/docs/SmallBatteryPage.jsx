import MarkdownDoc from '../../components/MarkdownDoc';

// Import markdown content at build time
import contentEn from '../../../../tehnika/konceptualno/en/04-small-battery-philosophy.md?raw';
import contentSr from '../../../../tehnika/konceptualno/sr/04-small-battery-philosophy.md?raw';

export default function SmallBatteryPage() {
  return (
    <MarkdownDoc
      content={contentEn}
      contentSr={contentSr}
      title="Small Battery Philosophy"
      backLink="/docs"
      backLabel="Documentation"
    />
  );
}
