from typing import Annotated, Optional, Dict
from enum import Enum
from fastapi import Depends, FastAPI, HTTPException, Query, status, Response, Request
from sqlmodel import Field, Session, SQLModel, create_engine, select, Column, JSON
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext
import jwt
from jwt.exceptions import InvalidTokenError, ExpiredSignatureError
from get_rdas import get_nutrient_RDAs
from get_content import get_nutritional_content, blank_nutrients, blank_vitamins, blank_minerals
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone
import os 
from get_secret import fetch_secret

SECRET_KEY = fetch_secret("JWT_Secret_Keys", "SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

REFRESH_SECRET_KEY = fetch_secret("JWT_Secret_Keys", "REFRESH_SECRET_KEY")
REFRESH_TOKEN_EXPIRES_DAYS = 7

class Gender(str, Enum):
    MALE = "Male"
    FEMALE = "Female"

class Unit(str, Enum):
    GRAMS = "grams"
    OUNCES = "ounces"
    MILLILITERS = "milliliters"
    CUPS = "cups"


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    password: str 
    age: int = Field(index=True)
    gender: Gender = Field(index=True)
    description: Optional[str] = Field(index=True)
    size: Optional[int] = Field(index=True)
    unit: Optional[Unit] = Field(index=True)
    nutrient_rdas: Optional[Dict[str, float]] = Field(default_factory=dict, sa_column=Column(JSON))
    nutrient_current: Optional[Dict[str, float]] = Field(default_factory=dict, sa_column=Column(JSON))


class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None 


postgres_password = fetch_secret("rds!db-9cb0023e-e083-4f7c-a084-0ae799697285", "password")
postgres_username = fetch_secret("rds!db-9cb0023e-e083-4f7c-a084-0ae799697285", "username")

postgres_url = f"postgresql://{postgres_username}:{postgres_password}@micronutrient-tracker-db.cja2uo80qya3.us-west-2.rds.amazonaws.com:5432/micronutrient_tracker_db"

engine = create_engine(postgres_url, echo=True)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

SessionDep = Annotated[Session, Depends(get_session)]

app = FastAPI()

origins = [
    "https://tracknutrients.app",
    "https:www.tracknutrients.app"
]

app.add_middleware(
    CORSMiddleware, 
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]

)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def validate_password(password):
    if len(password) < 12:
        return False
    check_number = 0
    check_special_character = 0
    for c in password:
        if 48 <= ord(c) <= 57:
            check_number += 1
        if 33 <= ord(c) <= 47:
            check_special_character += 1
    
    if check_number != 0 and check_special_character != 0:
        return True
    else:
        return False

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def hash_password(password):
    return pwd_context.hash(password)

def check_password(username: str, password: str, session: SessionDep):
    statement = select(User).where(User.username == username)
    user = session.exec(statement).first()
    if not user:
        return False
    if not verify_password(password, user.password):
        return False
    return user


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    
    to_encode.update({'exp': expire})

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    return encoded_jwt

def create_refresh_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(days=7)
    
    to_encode.update({'exp': expire})

    encoded_jwt = jwt.encode(to_encode, REFRESH_SECRET_KEY, algorithm=ALGORITHM)

    return encoded_jwt

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/token")
async def login(response: Response, form_data: Annotated[OAuth2PasswordRequestForm, Depends()], session: SessionDep):
    user = check_password(form_data.username, form_data.password, session)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": user.username}, expires_delta=access_token_expires)
    
    refresh_token_expires = timedelta(days=REFRESH_TOKEN_EXPIRES_DAYS)
    refresh_token = create_refresh_token(data={"user": user.username}, expires_delta=refresh_token_expires)

    response.set_cookie(key="access_token", value=access_token, httponly=True, samesite="lax", expires=int(access_token_expires.total_seconds()), path="/" )
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, samesite="lax", expires=int(refresh_token_expires.total_seconds()), path="/" )

    return {"message": "Login successful"}

async def get_current_user_from_cookie(request: Request, session: SessionDep) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials. Please create an account or sign in",
        headers={"WWW-Authenticate": "Bearer"},
    )

    access_token = request.cookies.get("access_token")

    if not access_token:
        raise credentials_exception
    
    try:
        payload = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Access token expired. Please refresh or login.", headers={"WWW-Authenticate": "Bearer"})
    except InvalidTokenError:
        raise credentials_exception
    statement = select(User).where(User.username == token_data.username)
    user = session.exec(statement).first()
    if user is None:
        raise credentials_exception
    return user

@app.post("/refresh_token")
async def refresh_token(request: Request, response: Response, session: SessionDep):
    refresh_token = request.cookies.get("refresh_token")

    if not refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No refresh token given. Please sign in or create an account")
    
    try:
        payload = jwt.decode(refresh_token, REFRESH_SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("user")
        if not username:
            raise HTTPException(status_code=401, detail="Username not found from payload. Please sign in or create an account")
        statement = select(User).where(User.username == username)
        user = session.exec(statement).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found from refresh token")
        
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        new_access_token = create_access_token(data={"sub": user.username}, expires_delta=access_token_expires)

        response.set_cookie(key="access_token", value=new_access_token, httponly=True, samesite='lax', expires=int(access_token_expires.total_seconds()), path="/") 

        return {"message": "Access token refreshed successfully"}
    except ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Access token expired. Please refresh or login.", headers={"WWW-Authenticate": "Bearer"})
    except InvalidTokenError:
        raise HTTPException(status_code=401, detail="Refresh token is invalid")
    
    
@app.post("/logout")
async def logout(response: Response, request: Request):
    access_token = request.cookies.get('access_token')
    refresh_token = request.cookies.get('refresh_token')

    if not access_token or not refresh_token:
        raise HTTPException(status_code=401, detail="You are not currently logged in")

    response.delete_cookie(key="access_token", httponly=True, samesite='lax', path="/")
    response.delete_cookie(key="refresh_token", httponly=True, samesite='lax', path="/")

    return {"message": "Successfully logged out"}


@app.on_event("startup")
def on_startup():
    create_db_and_tables()

@app.post("/users/")
async def create_user(user: User, session: SessionDep):
    query = select(User).where(User.username == user.username)
    existing_user = session.exec(query).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already taken")
    password_validation = validate_password(user.password)
    if not password_validation:
        raise HTTPException(status_code=400, detail="Password must be at least 12 characters long and contain at least one number and one special character")
    user.password = hash_password(user.password)
    user_rdas = await get_nutrient_RDAs(user.age, user.gender)
    if user_rdas:
        user.nutrient_rdas = user_rdas
    if not user_rdas:
        raise HTTPException(status_code=502, detail="External API call failed. Please try again later")
    user.nutrient_current = blank_nutrients
    session.add(user)
    session.commit()
    session.refresh(user)
   
    return {"message": "Welcome! Go ahead and log in now"}


@app.get("/users/")
async def read_users(session: SessionDep):
    users = session.exec(select(User)).all()
    return users

@app.get("/users/{user_id}")
async def read_user(session: SessionDep, user_id: int) -> User:
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.get("/users/me/", response_model=User)
async def read_user_me(current_user: Annotated[User, Depends(get_current_user_from_cookie)]):
    return current_user

@app.delete("/users/{user_id}")
def delete_user(user_id: int, session: SessionDep):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    session.delete(user)
    session.commit()
    return 204

@app.patch("/users/")
async def get_description_and_size(current_user: Annotated[User, Depends(get_current_user_from_cookie)], user_update: User, session: SessionDep):
    user = current_user
    
    update_data = user_update.model_dump(exclude_unset=True)

    user.description = update_data["description"]
    user.size = update_data["size"]
    user.unit = update_data["unit"]
    
    food_data = await get_nutritional_content(user.description, user.size, user.unit)

    if food_data == blank_nutrients:
        raise HTTPException(status_code=502, detail="External API call failed")
    
    else:
        combined_data = {key: user.nutrient_current[key] + food_data[key] for key in user.nutrient_current}
        user.nutrient_current = combined_data

    session.commit()
    session.refresh(user)

    return user

@app.put("/users_vitamins/")
async def reset_current_vitamins(current_user: Annotated[User, Depends(get_current_user_from_cookie)], session: SessionDep):
    user = current_user
        
    nutrients_post_vitamin_reset = {key: blank_vitamins.get(key, user.nutrient_current[key]) for key in user.nutrient_current}

    user.nutrient_current = nutrients_post_vitamin_reset

    session.commit()
    session.refresh(user)

    return user

@app.put("/users_minerals/")
async def reset_current_minerals(current_user: Annotated[User, Depends(get_current_user_from_cookie)], session: SessionDep):
    user = current_user
        
    nutrients_post_mineral_reset = {key: blank_minerals.get(key, user.nutrient_current[key]) for key in user.nutrient_current}

    user.nutrient_current = nutrients_post_mineral_reset

    session.commit()
    session.refresh(user)

    return user


