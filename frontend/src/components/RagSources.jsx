function extractUrl(doc) {
  const match = doc.match(/URL:\s*(\S+)/);
  return match ? match[1] : null;
}

export default function RagSources({ ragContext, title = "Retrieved sources (RAG)" }) {
  const docs = ragContext?.documents?.[0] ?? [];
  const metas = ragContext?.metadatas?.[0] ?? [];

  if (!docs.length) return null;

  return (
    <section className="panel p-6">
      <h2 className="font-semibold mb-4">{title}</h2>
      <div className="space-y-3">
        {docs.map((doc, i) => {
          const url = extractUrl(doc);
          const Wrapper = url ? "a" : "div";
          const wrapperProps = url
            ? { href: url, target: "_blank", rel: "noopener noreferrer" }
            : {};

          return (
            <Wrapper
              key={i}
              {...wrapperProps}
              className={`block bg-panel-800 rounded-lg p-3.5 ${
                url ? "hover:bg-panel-700 transition cursor-pointer" : ""
              }`}
            >
              <p className="text-xs text-slate-400 leading-snug">{doc}</p>
              {metas[i]?.source && (
                <p className="text-[11px] text-slate-600 mt-1.5">{metas[i].source}</p>
              )}
            </Wrapper>
          );
        })}
      </div>
    </section>
  );
}
