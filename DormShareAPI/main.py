import uvicorn
import psycopg2
from DormShareAPI.application.app import app

if __name__=="__main__":
    uvicorn.run("application.app:app", host="127.0.0.1", port=8000, reload=True)