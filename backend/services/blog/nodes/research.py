from langchain_tavily import TavilySearch
from langchain_core.messages import SystemMessage,HumanMessage
from tools.llm import llm 
from services.blog.states import State
from schemas.agent import EvidencePack
from services.blog.sse import emit,EVENTS
from core.config import settings

RESEARCH_SYSTEM = """
You are a research synthesizer for blog content writing.

Given raw web search results for a blog topic, produce a deduplicated list of EvidenceItem objects.

Rules:
- Only include items with a non-empty URL.
- Prefer authoritative, relevant sources: official sites, reputable publications,
  academic sources, company blogs, recognized outlets for the topic's domain.
- Do NOT bias toward tech sources unless the topic is technical.
  For health topics prefer medical journals. For business prefer financial outlets. Etc.
- If a published date is explicitly present, keep it as YYYY-MM-DD.
  If missing or unclear, set published_at=null. Do NOT guess dates.
- Keep snippets short and focused on what is factually useful.
- Deduplicate by URL — never include the same URL twice.
- If a result is clearly irrelevant to the topic, exclude it.
"""
def tavily_search(query: str, max_results: int = 5) -> list[dict]:
    tool = TavilySearch(
        max_results=max_results,
        tavily_api_key=settings.TAVILY,
        include_raw_content=False,  
        search_depth="basic",
    )

    response = tool.invoke({"query": query})

    # handle all possible return formats
    if isinstance(response, str):
        # sometimes returns a string summary — no individual results
        print(f"Tavily returned string: {response[:100]}")
        return []

    if isinstance(response, dict):
        # might be wrapped in a results key
        results = response.get("results", [])
    elif isinstance(response, list):
        results = response
    else:
        print(f"Unknown Tavily response type: {type(response)}")
        return []

    normalised = []
    for res in results:
        if isinstance(res, str):
            # skip plain strings
            continue
        if not isinstance(res, dict):
            continue
        url = res.get("url") or ""
        if not url:
            continue
        normalised.append({
            "title": res.get("title") or "",
            "url": url,
            "snippet": res.get("content") or res.get("snippet") or "",
            "published_at": res.get("published_date") or res.get("published_at"),
            "source": res.get("source"),
        })

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
        try:
            results = tavily_search(query, max_results)
            raw_results.extend(results)
        except Exception as e:
            print(f"Search failed for '{query}': {e}")
            continue 

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
    