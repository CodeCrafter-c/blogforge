from langchain_tavily import TavilySearch
from langchain_core.messages import SystemMessage,HumanMessage
from tools import llm 
from services.blog.states import State
from schemas.agent import EvidencePack
from services.blog.sse import emit,EVENTS
from core.config import settings

RESEARCH_SYSTEM="""
You are a research synthesizer for technical writing.

Given raw web search results, produce a deduplicated list of EvidenceItem objects.

Rules:
- Only include items with a non-empty url.
- Prefer relevant + authoritative sources (company blogs, docs, reputable outlets).
- If a published date is explicitly present in the result payload, keep it as YYYY-MM-DD.
  If missing or unclear, set published_at=null. Do NOT guess.
- Keep snippets short.
- Deduplicate by URL
"""

def tavily_search(query: str, max_results: int = 5) -> list[dict]: 
    tool = TavilySearch(
        max_results=max_results, 
        tavily_api_key=settings.TAVILY
    )
    
    results = tool.invoke({"query": query})
    print(results)
    normalised: list[dict] = []
    
    for res in results or []:
        normalised.append(
            {
                "title": res.get("title") or "",
                "url": res.get("url") or "",
                "snippet": res.get("content") or res.get("snippet") or "",
                "published_at": res.get("published_date") or res.get("published_at"),
                "source": res.get("source")
            }
        )
        
    return normalised
    
    
async def research_node(state: State)->dict:
    blog_id = state.get("blog_id")
    queries=state.get("queries",[])
    
    await emit (blog_id,EVENTS["RESEARCH_START"],{
        "message": f"🌐 Searching web with {len(queries)} queries...",
        "queries": queries,
    })
    
    
    max_results=5
    
    raw_results:list[dict]=[]
    
    for i, query in enumerate(queries):
        await emit(blog_id, EVENTS["RESEARCH_START"], {
            "message": f"🔎 Searching: {query}",
            "query_index": i + 1,
            "total_queries": len(queries),
        })
        raw_results.extend(tavily_search(query,max_results))

    if not raw_results:
        await emit(blog_id, EVENTS["RESEARCH_DONE"], {
            "message": "⚠️ No research results found, proceeding with model knowledge.",
            "evidence_count": 0,
        })
        return {"evidence":[]}
    
    
    extractor=llm.with_structured_output(EvidencePack)
    pack=await extractor.ainvoke(
        [
            SystemMessage(content=RESEARCH_SYSTEM),
            HumanMessage(content=f"Raw results: {raw_results}"),
        ]
    )
    
    dedup={}
    for e in pack.evidence:
        if e.url:
            dedup[e.url]=e
    evidence=list(dedup.values())
    await emit(blog_id,EVENTS["RESEARCH_DONE"],{
        "message":f"✅ Found {len(evidence)} relevant sources",
        "evidence_count": len(evidence),
        "sources": [e.url for e in evidence],
    })        
    return {"evidence":evidence}
    