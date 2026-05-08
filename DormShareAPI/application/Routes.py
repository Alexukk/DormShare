class UserCreate(BaseModel):
    # EmailStr автоматически проверит, что это реальный email (нужно: pip install email-validator)
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8)
    contact_way: Optional[str] = None