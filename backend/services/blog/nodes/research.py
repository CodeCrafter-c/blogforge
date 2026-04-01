from langchain_tavily import TavilySearch
from langchain_core.messages import SystemMessage,HumanMessage
from tools import llm 
from services.blog.states import State
from schemas.agent import EvidencePack

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

def tavily_search(query:str,max_results:int=5)-> dict:
    tool=TavilySearch(max_results=max_results)
    results=tool.invoke({"query":query})
    normalised:list[dict]=[]
    
    
    for res in results or []:
        normalised.append(
            {
                "title":res.get("title") or "",
                "url":res.get("url") or "",
                "snippet": res.get("content") or res.get("snippet") or "",
                "published_at": res.get("published_date") or res.get("published_at"),
                "source": res.get("source")
            }
        )
        
    return normalised
    
    
def research_node(state: State)->dict:
    queries=state.get("queries",[])
    max_results=5
    
    raw_results:list[dict]=[]
    
    for query in queries:
        raw_results.extend(tavily_search(query,max_results))
    
    if not raw_results:
        return {"evidence":[]}
    
    
    extractor=llm.with_structured_output(EvidencePack)
    pack=extractor.invoke(
        [
            SystemMessage(content=RESEARCH_SYSTEM),
            HumanMessage(content=f"Raw results: {raw_results}"),
        ]
    )
    
    dedup={}
    for e in pack.evidence:
        if e.url:
            dedup[e.url]=e
            
    return {"evidence":list(dedup.values())}
    