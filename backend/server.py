from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import secrets

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_ALGORITHM = "HS256"

def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "exp": datetime.now(timezone.utc) + timedelta(minutes=15), "type": "access"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {"sub": user_id, "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "refresh"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Não autenticado")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Tipo de token inválido")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="Usuário não encontrado")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")

async def require_admin(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "ADMIN":
        raise HTTPException(status_code=403, detail="Acesso negado. Apenas administradores.")
    return current_user

app = FastAPI()
api_router = APIRouter(prefix="/api")

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str = "PADRÃO"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    created_at: str

class VehicleCreate(BaseModel):
    placa: str
    marca: str
    modelo: str
    ano_fabricacao: int
    chassi: str
    status: str = "EM_ATIVIDADE"
    lotacao_atual: str

class VehicleUpdate(BaseModel):
    placa: Optional[str] = None
    marca: Optional[str] = None
    modelo: Optional[str] = None
    ano_fabricacao: Optional[int] = None
    chassi: Optional[str] = None
    status: Optional[str] = None
    lotacao_atual: Optional[str] = None

class VehicleResponse(BaseModel):
    id: str
    placa: str
    marca: str
    modelo: str
    ano_fabricacao: int
    chassi: str
    status: str
    lotacao_atual: str
    created_at: str
    updated_at: str

class LocationHistoryCreate(BaseModel):
    local: str
    data_inicio: str
    data_fim: Optional[str] = None

class LocationHistoryResponse(BaseModel):
    id: str
    vehicle_id: str
    local: str
    data_inicio: str
    data_fim: Optional[str] = None

@api_router.post("/auth/register")
async def register(user_data: UserRegister, response: Response):
    email_lower = user_data.email.lower()
    existing = await db.users.find_one({"email": email_lower})
    if existing:
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    
    hashed = hash_password(user_data.password)
    user_doc = {
        "email": email_lower,
        "password_hash": hashed,
        "name": user_data.name,
        "role": user_data.role,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    
    access_token = create_access_token(user_id, email_lower)
    refresh_token = create_refresh_token(user_id)
    
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=900, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    
    return {
        "id": user_id,
        "email": email_lower,
        "name": user_data.name,
        "role": user_data.role,
        "created_at": user_doc["created_at"]
    }

@api_router.post("/auth/login")
async def login(credentials: UserLogin, response: Response):
    email_lower = credentials.email.lower()
    user = await db.users.find_one({"email": email_lower})
    if not user:
        raise HTTPException(status_code=401, detail="Email ou senha incorretos")
    
    if not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Email ou senha incorretos")
    
    user_id = str(user["_id"])
    access_token = create_access_token(user_id, email_lower)
    refresh_token = create_refresh_token(user_id)
    
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=900, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    
    return {
        "id": user_id,
        "email": user["email"],
        "name": user["name"],
        "role": user["role"],
        "created_at": user["created_at"]
    }

@api_router.post("/auth/logout")
async def logout(response: Response, current_user: dict = Depends(get_current_user)):
    response.delete_cookie(key="access_token", path="/")
    response.delete_cookie(key="refresh_token", path="/")
    return {"message": "Logout realizado com sucesso"}

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user

@api_router.get("/users")
async def get_users(current_user: dict = Depends(require_admin)):
    users = await db.users.find({}, {"password_hash": 0}).to_list(1000)
    for user in users:
        user["id"] = str(user.pop("_id"))
    return users

@api_router.post("/users")
async def create_user(user_data: UserRegister, current_user: dict = Depends(require_admin)):
    email_lower = user_data.email.lower()
    existing = await db.users.find_one({"email": email_lower})
    if existing:
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    
    hashed = hash_password(user_data.password)
    user_doc = {
        "email": email_lower,
        "password_hash": hashed,
        "name": user_data.name,
        "role": user_data.role,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    result = await db.users.insert_one(user_doc)
    
    return {
        "id": str(result.inserted_id),
        "email": email_lower,
        "name": user_data.name,
        "role": user_data.role,
        "created_at": user_doc["created_at"]
    }

@api_router.delete("/users/{user_id}")
async def delete_user(user_id: str, current_user: dict = Depends(require_admin)):
    result = await db.users.delete_one({"_id": ObjectId(user_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return {"message": "Usuário deletado com sucesso"}

@api_router.post("/vehicles")
async def create_vehicle(vehicle_data: VehicleCreate, current_user: dict = Depends(require_admin)):
    vehicle_doc = vehicle_data.model_dump()
    vehicle_doc["created_at"] = datetime.now(timezone.utc).isoformat()
    vehicle_doc["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.vehicles.insert_one(vehicle_doc)
    
    history_doc = {
        "vehicle_id": str(result.inserted_id),
        "local": vehicle_data.lotacao_atual,
        "data_inicio": datetime.now(timezone.utc).isoformat(),
        "data_fim": None
    }
    await db.location_history.insert_one(history_doc)
    
    vehicle_doc["id"] = str(result.inserted_id)
    vehicle_doc.pop("_id", None)
    return vehicle_doc

@api_router.get("/vehicles")
async def get_all_vehicles(current_user: dict = Depends(get_current_user)):
    vehicles = await db.vehicles.find({}).to_list(1000)
    for vehicle in vehicles:
        vehicle["id"] = str(vehicle.pop("_id"))
    return vehicles

@api_router.get("/vehicles/em-atividade")
async def get_active_vehicles(current_user: dict = Depends(get_current_user)):
    vehicles = await db.vehicles.find({"status": "EM_ATIVIDADE"}).to_list(1000)
    for vehicle in vehicles:
        vehicle["id"] = str(vehicle.pop("_id"))
    return vehicles

@api_router.get("/vehicles/em-manutencao")
async def get_maintenance_vehicles(current_user: dict = Depends(get_current_user)):
    vehicles = await db.vehicles.find({"status": "EM_MANUTENCAO"}).to_list(1000)
    for vehicle in vehicles:
        vehicle["id"] = str(vehicle.pop("_id"))
    return vehicles

@api_router.get("/vehicles/inativos")
async def get_inactive_vehicles(current_user: dict = Depends(get_current_user)):
    vehicles = await db.vehicles.find({"status": "INATIVO"}).to_list(1000)
    for vehicle in vehicles:
        vehicle["id"] = str(vehicle.pop("_id"))
    return vehicles

@api_router.put("/vehicles/{vehicle_id}")
async def update_vehicle(vehicle_id: str, vehicle_data: VehicleUpdate, current_user: dict = Depends(require_admin)):
    update_data = {k: v for k, v in vehicle_data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="Nenhum dado para atualizar")
    
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    if "lotacao_atual" in update_data:
        await db.location_history.update_many(
            {"vehicle_id": vehicle_id, "data_fim": None},
            {"$set": {"data_fim": datetime.now(timezone.utc).isoformat()}}
        )
        history_doc = {
            "vehicle_id": vehicle_id,
            "local": update_data["lotacao_atual"],
            "data_inicio": datetime.now(timezone.utc).isoformat(),
            "data_fim": None
        }
        await db.location_history.insert_one(history_doc)
    
    result = await db.vehicles.update_one(
        {"_id": ObjectId(vehicle_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Veículo não encontrado")
    
    updated_vehicle = await db.vehicles.find_one({"_id": ObjectId(vehicle_id)})
    updated_vehicle["id"] = str(updated_vehicle.pop("_id"))
    return updated_vehicle

@api_router.delete("/vehicles/{vehicle_id}")
async def delete_vehicle(vehicle_id: str, current_user: dict = Depends(require_admin)):
    result = await db.vehicles.delete_one({"_id": ObjectId(vehicle_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Veículo não encontrado")
    
    await db.location_history.delete_many({"vehicle_id": vehicle_id})
    return {"message": "Veículo deletado com sucesso"}

@api_router.get("/vehicles/{vehicle_id}/historico")
async def get_vehicle_history(vehicle_id: str, current_user: dict = Depends(get_current_user)):
    history = await db.location_history.find({"vehicle_id": vehicle_id}).sort("data_inicio", -1).to_list(1000)
    for entry in history:
        entry["id"] = str(entry.pop("_id"))
    return history

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[os.environ.get('FRONTEND_URL', 'http://localhost:3000')],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    await db.users.create_index("email", unique=True)
    await db.vehicles.create_index("placa")
    await db.location_history.create_index("vehicle_id")
    
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@pmtf.gov.br")
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        hashed = hash_password(admin_password)
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hashed,
            "name": "Administrador PMTF",
            "role": "ADMIN",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        logger.info(f"Admin user criado: {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}}
        )
        logger.info("Senha do admin atualizada")
    
    test_user_email = "usuario@pmtf.gov.br"
    test_user_password = "usuario123"
    test_user = await db.users.find_one({"email": test_user_email})
    if test_user is None:
        hashed = hash_password(test_user_password)
        await db.users.insert_one({
            "email": test_user_email,
            "password_hash": hashed,
            "name": "Usuário Padrão",
            "role": "PADRÃO",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        logger.info(f"Usuário de teste criado: {test_user_email}")
    
    test_vehicles = [
        {
            "placa": "ABC-1234",
            "marca": "Chevrolet",
            "modelo": "S10",
            "ano_fabricacao": 2020,
            "chassi": "9BWZZZ377VT004251",
            "status": "EM_ATIVIDADE",
            "lotacao_atual": "Secretaria de Saúde",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "placa": "DEF-5678",
            "marca": "Fiat",
            "modelo": "Toro",
            "ano_fabricacao": 2021,
            "chassi": "9BWZZZ377VT004252",
            "status": "EM_MANUTENCAO",
            "lotacao_atual": "Oficina Municipal",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "placa": "GHI-9012",
            "marca": "Toyota",
            "modelo": "Hilux",
            "ano_fabricacao": 2019,
            "chassi": "9BWZZZ377VT004253",
            "status": "EM_ATIVIDADE",
            "lotacao_atual": "Secretaria de Obras",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "placa": "JKL-3456",
            "marca": "Volkswagen",
            "modelo": "Amarok",
            "ano_fabricacao": 2018,
            "chassi": "9BWZZZ377VT004254",
            "status": "INATIVO",
            "lotacao_atual": "Depósito Municipal",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    for vehicle in test_vehicles:
        existing_vehicle = await db.vehicles.find_one({"placa": vehicle["placa"]})
        if existing_vehicle is None:
            result = await db.vehicles.insert_one(vehicle)
            await db.location_history.insert_one({
                "vehicle_id": str(result.inserted_id),
                "local": vehicle["lotacao_atual"],
                "data_inicio": datetime.now(timezone.utc).isoformat(),
                "data_fim": None
            })
            logger.info(f"Veículo de teste criado: {vehicle['placa']}")
    
    os.makedirs('/app/memory', exist_ok=True)
    with open('/app/memory/test_credentials.md', 'w') as f:
        f.write("# Credenciais de Teste - Frota de Veículos PMTF\n\n")
        f.write("## Usuário Administrador\n")
        f.write(f"- Email: {admin_email}\n")
        f.write(f"- Senha: {admin_password}\n")
        f.write(f"- Role: ADMIN\n\n")
        f.write("## Usuário Padrão\n")
        f.write(f"- Email: {test_user_email}\n")
        f.write(f"- Senha: {test_user_password}\n")
        f.write(f"- Role: PADRÃO\n\n")
        f.write("## Endpoints de Autenticação\n")
        f.write("- POST /api/auth/login\n")
        f.write("- POST /api/auth/register\n")
        f.write("- GET /api/auth/me\n")
        f.write("- POST /api/auth/logout\n")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
