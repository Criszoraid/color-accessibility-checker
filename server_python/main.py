from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import httpx
import os

app = FastAPI(title="Color Accessibility MCP Server")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files from the React build (dist)
# We assume 'npm run build' has been run and 'dist' exists in the root
DIST_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "dist")

@app.get("/api/analyze")
async def analyze_url(url: str = Query(..., description="URL to analyze")):
    """
    Extracts color palette from a given URL using Microlink API.
    This endpoint can be used by ChatGPT Actions.
    """
    if not url.startswith("http"):
        url = f"https://{url}"
        
    microlink_url = f"https://api.microlink.io/?url={url}&palette=true"
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(microlink_url)
            data = response.json()
            
            if data.get("status") == "success":
                return {
                    "status": "success",
                    "data": {
                        "image_colors": data["data"].get("image", {}).get("palette", []),
                        "logo_colors": data["data"].get("logo", {}).get("palette", []),
                        "background": data["data"].get("image", {}).get("background_color"),
                        "foreground": data["data"].get("image", {}).get("color")
                    }
                }
            else:
                raise HTTPException(status_code=400, detail="Could not extract data from URL")
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

# Serve React App
if os.path.exists(DIST_DIR):
    app.mount("/", StaticFiles(directory=DIST_DIR, html=True), name="static")
else:
    @app.get("/")
    def read_root():
        return {"message": "Frontend not built. Run 'npm run build' first."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
