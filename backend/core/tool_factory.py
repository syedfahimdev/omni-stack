from typing import List, Callable, Dict, Any
from langchain_core.tools import StructuredTool
from pydantic import create_model
import requests
import json
from tools.search import web_search
from tools.n8n_bridge import trigger_n8n
from tools.scraper import smart_scrape

TOOL_MAP = {
    "web_search": web_search,
    "n8n_webhook": trigger_n8n,
    "web_scraper": smart_scrape
}

def get_agent_tools(tool_names: List[str]) -> List[Callable]:
    """
    Get a list of standard tool functions based on the provided tool names.
    """
    tools = []
    for name in tool_names:
        if name in TOOL_MAP:
            tools.append(TOOL_MAP[name])
    return tools

def create_dynamic_tool(tool_config: Dict[str, Any]) -> StructuredTool:
    """
    Create a LangChain StructuredTool dynamically from configuration.
    """
    name = tool_config.get("name")
    description = tool_config.get("description")
    webhook_url = tool_config.get("webhook_url")
    auth_header_name = tool_config.get("auth_header_name")
    auth_header_value = tool_config.get("auth_header_value")
    arguments_schema = tool_config.get("arguments", {})

    # Create Pydantic model for arguments
    fields = {}
    for field_name, field_def in arguments_schema.items():
        # Handle both simple "type": "str" and complex "type": {"type": "string", ...}
        # The frontend now sends { "type": "string", "description": "..." }
        
        field_type_str = "string" # Default
        field_desc = ""
        
        if isinstance(field_def, dict):
            field_type_str = field_def.get("type", "string")
            field_desc = field_def.get("description", "")
        else:
            # Fallback for legacy simple format
            field_type_str = str(field_def)

        # Map types
        if field_type_str == "integer" or field_type_str == "int":
            py_type = int
        elif field_type_str == "boolean" or field_type_str == "bool":
            py_type = bool
        else:
            py_type = str
            
        # Create field definition with description if available
        # Using ... as required field marker
        from pydantic import Field
        if field_desc:
            fields[field_name] = (py_type, Field(description=field_desc))
        else:
            fields[field_name] = (py_type, ...)
            
    if not fields:
        ArgsModel = create_model(f"{name}Args")
    else:
        ArgsModel = create_model(f"{name}Args", **fields)

    def tool_func(**kwargs):
        headers = {}
        if auth_header_name and auth_header_value:
            headers[auth_header_name] = auth_header_value
            
        try:
            response = requests.post(webhook_url, json=kwargs, headers=headers)
            response.raise_for_status()
            return f"Tool '{name}' executed successfully. Response: {response.text}"
        except Exception as e:
            return f"Failed to execute tool '{name}': {str(e)}"

    return StructuredTool.from_function(
        func=tool_func,
        name=name,
        description=description,
        args_schema=ArgsModel
    )

def get_custom_tools(custom_tools_config: List[Dict[str, Any]]) -> List[StructuredTool]:
    """
    Generate a list of custom tools from the agent's configuration.
    """
    tools = []
    for config in custom_tools_config:
        try:
            tool = create_dynamic_tool(config)
            tools.append(tool)
        except Exception as e:
            print(f"Error creating custom tool '{config.get('name')}': {e}")
    return tools
