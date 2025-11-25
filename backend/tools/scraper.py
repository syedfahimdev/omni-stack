import requests
from bs4 import BeautifulSoup
from langchain_core.tools import tool

@tool
def smart_scrape(url: str) -> str:
    """
    Scrape text content from a webpage.
    Useful for reading articles, documentation, or extracting specific information from a URL.
    """
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.decompose()
            
        # Get text
        text = soup.get_text()
        
        # Break into lines and remove leading/trailing space on each
        lines = (line.strip() for line in text.splitlines())
        # Break multi-headlines into a line each
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        # Drop blank lines
        text = '\n'.join(chunk for chunk in chunks if chunk)
        
        # Basic truncation if too long (to fit in context)
        if len(text) > 8000:
            text = text[:8000] + "...(content truncated)"
            
        if len(text) < 500:
             return f"Scraped content is very short ({len(text)} chars). The page might be dynamic (JS-heavy). Content: {text}"

        return text
        
    except Exception as e:
        return f"Failed to scrape URL: {str(e)}"
