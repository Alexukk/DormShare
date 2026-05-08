from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import jwt
from typing import List, Optional
from datetime import datetime, timedelta
from DormShareAPI.application.Data import models, DataBase
import os
from dotenv import load_dotenv

load_dotenv()


pwd_context = CryptContext(schemes=['bcrypt'], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

