import { Card } from "./ui/card";

export function ResultRenderer({ content, metadata }: { content: string, metadata: any }) {
    // Try to parse JSON from the content or metadata

    if (metadata?.type === "legal_search" && metadata.results) {
        return (
            <div className="flex flex-col gap-4">
                <p className="text-sm font-medium text-zinc-500 mb-2">Here are the search results found:</p>
                <div className="grid gap-3">
                    {metadata.results.map((r: any, idx: int) => (
                        <Card key={idx} className="p-4 hover:bg-zinc-50 transition-colors border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <h3 className="text-blue-600 font-semibold mb-1 text-base">{r.title}</h3>
                            <p className="text-sm font-semibold text-zinc-600 mb-2">{r.citation || r.docsource}</p>
                            <div className="text-sm text-zinc-700 line-clamp-3" dangerouslySetInnerHTML={{ __html: r.snippet }} />
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    // Default to standard text rendering, possibly formatted handling logic
    return <p className="whitespace-pre-wrap">{content}</p>;
}
