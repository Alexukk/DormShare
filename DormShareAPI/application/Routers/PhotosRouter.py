from fastapi import APIRouter

router = APIRouter(
    prefix="/photo",
    tags=["Photos"]
)


@router.post("/upload")
async def uploadPhoto():
    pass

@router.delete("/remove")
async def removePhoto():
    pass

@router.delete("/clear-all/{postId}")
async def clearItemPhotos():
    pass