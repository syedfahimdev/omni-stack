from langchain_community.utilities import SearxSearchWrapper
from langchain_core.tools import tool

@tool
def web_search(query: str) -> str:
    """
    Search the web for information using SearXNG.
    Useful for finding up-to-date information, news, or facts.
    """
    # Hardcoded to internal docker DNS for SearXNG
    search = SearxSearchWrapper(searx_host="http://searxng:8080")
    return search.run(query)
