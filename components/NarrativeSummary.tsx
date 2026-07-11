interface Props {
  summary: string | null;
  error: string | null;
}

export function NarrativeSummary({ summary, error }: Props) {
  if (!summary && !error) return null;

  if (error) {
    return <p className="narrative-error">{error}</p>;
  }

  return <p className="narrative-summary">{summary}</p>;
}
