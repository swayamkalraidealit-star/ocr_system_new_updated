from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from typing import Optional
import shutil
import os
import sys
from datetime import datetime, timezone
from ..database import get_database
from ..models import ScanHistoryModel
from ..schemas import ScanHistoryResponse
from typing import List

# from ..core import analysis
from ..auth import get_current_user

router = APIRouter()

# @router.post("/analyze")
# async def analyze_drawing(
#     file: UploadFile = File(...),
#     api_key: Optional[str] = Form(None),
#     current_user: dict = Depends(get_current_user)
# ):
#     if not analysis:
#         raise HTTPException(status_code=500, detail="Analysis module not available")
# 
#     # Save uploaded file temporarily
#     temp_filename = f"temp_{file.filename}"
#     with open(temp_filename, "wb") as buffer:
#         shutil.copyfileobj(file.file, buffer)
#     
#     try:
#         # Determine API Key: Form > Env
#         final_api_key = api_key or os.environ.get("GOOGLE_API_KEY")
#         if not final_api_key:
#              raise HTTPException(status_code=400, detail="API Key required (upload or env var)")
# 
#         weight, extracted_data = analysis.process_drawing_pipeline(temp_filename, final_api_key)
#         
#         if weight is None:
#              raise HTTPException(status_code=500, detail="Analysis failed to extract data")
# 
#         # Save to History
#         db = await get_database()
#         history_entry = ScanHistoryModel(
#             user_id=current_user["_id"],
#             filename=file.filename,
#             calculated_weight_kg=weight,
#             extracted_data=extracted_data,
#             timestamp=datetime.now(timezone.utc).isoformat()
#         )
#         await db.history.insert_one(history_entry.model_dump(by_alias=True))
# 
#         return {
#             "filename": file.filename,
#             "calculated_weight_kg": weight,
#             "extracted_data": extracted_data,
#             "message": "Analysis successful"
#         }
# 
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))
#     finally:
#         # Cleanup
#         if os.path.exists(temp_filename):
#             os.remove(temp_filename)

@router.get("/history", response_model=List[ScanHistoryResponse])
async def get_history(current_user: dict = Depends(get_current_user)):
    db = await get_database()
    print(f"DEBUG: Fetching history for user_id: {current_user['_id']} (type: {type(current_user['_id'])})")
    
    # Try querying strictly with ObjectId first
    history = await db.history.find({"user_id": current_user["_id"]}).sort("timestamp", -1).to_list(100)
    print(f"DEBUG: Found {len(history)} records with strict ObjectId match.")
    
    if not history:
        # Fallback: Try querying with string version for debugging/backward compatibility
        print(f"DEBUG: Trying fallback query with string id: {str(current_user['_id'])}")
        history = await db.history.find({"user_id": str(current_user["_id"])}).sort("timestamp", -1).to_list(100)
        print(f"DEBUG: Found {len(history)} records with string match.")
    
    # Map MongoDB _id (ObjectId) to id (string) for ScanHistoryResponse
    results = []
    for item in history:
        item["id"] = str(item["_id"])
        results.append(item)
    
    return results
