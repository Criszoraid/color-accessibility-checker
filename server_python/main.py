from fastmcp import FastMCP
from fastapi.staticfiles import StaticFiles
import httpx
import os

# Initialize FastMCP
mcp = FastMCP("Color Accessibility")

# Define the tool
@mcp.tool()
async def analyze_url(url: str) -> str:
    """
    Extracts color palette from a given URL using Microlink API.
    Returns a JSON string with the color data.
    """
    if not url.startswith("http"):
        url = f"https://{url}"
        
    microlink_url = f"https://api.microlink.io/?url={url}&palette=true"
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(microlink_url)
            data = response.json()
            
            if data.get("status") == "success":
                return str({
                    "status": "success",
                    "data": {
                        "image_colors": data["data"].get("image", {}).get("palette", []),
                        "logo_colors": data["data"].get("logo", {}).get("palette", []),
                        "background": data["data"].get("image", {}).get("background_color"),
                        "foreground": data["data"].get("image", {}).get("color")
                    }
                })
            else:
                return "Error: Could not extract data from URL"
        except Exception as e:
            return f"Error: {str(e)}"

# Serve Static Files
DIST_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "dist")

if os.path.exists(DIST_DIR):
    # Mount static files to the FastMCP app
    mcp.mount("/", StaticFiles(directory=DIST_DIR, html=True))
else:
    print("Warning: 'dist' directory not found. Frontend will not be served.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(mcp, host="0.0.0.0", port=8000)
