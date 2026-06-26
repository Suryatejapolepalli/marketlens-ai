export default function RagSources({ ragContext, title = "Retrieved sources (RAG)" }) {
  const docs = ragContext?.documents?.[0] ?? [];
  const metas = ragContext?.metadatas?.[0] ?? [];

  if (!docs.length) return null;

  return (
    <section className="panel p-6">
      <h2 className="font-semibold mb-4">{title}</h2>
      <div className="space-y-3">
        {docs.map((doc, i) => (
          <div key={i} className="bg-panel-800 rounded-lg p-3.5">
            <p className="text-xs text-slate-400 leading-snug">{doc}</p>
            {metas[i]?.source && (
              <p className="text-[11px] text-slate-600 mt-1.5">{metas[i].source}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
