from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from ..database import db
from ..schemas import UserCreate, UserResponse, Token
from ..auth import get_password_hash, verify_password, create_access_token, get_current_user, ACCESS_TOKEN_EXPIRE_MINUTES
from ..models import UserModel

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate):
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    user_model = UserModel(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password
    )
    
    new_user = await db.users.insert_one(user_model.model_dump(by_alias=True, exclude=["id"]))
    created_user = await db.users.find_one({"_id": new_user.inserted_id})
    
    return UserResponse(
        id=str(created_user["_id"]),
        username=created_user["username"],
        email=created_user["email"]
    )

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await db.users.find_one({"email": form_data.username}) # OAuth2 form sends username as 'username' field, but we assume it might be email
    if not user:
        # User logic might be strictly username, but usually emails are unique.
        # Let's check username as well if email fail
        user = await db.users.find_one({"username": form_data.username})
        
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.delete("/me")
async def delete_user(current_user: dict = Depends(get_current_user)):
    delete_result = await db.users.delete_one({"_id": current_user["_id"]})
    if delete_result.deleted_count == 1:
        return {"msg": "User deleted successfully"}
    raise HTTPException(status_code=404, detail="User not found")

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=str(current_user["_id"]),
        username=current_user["username"],
        email=current_user["email"]
    )
