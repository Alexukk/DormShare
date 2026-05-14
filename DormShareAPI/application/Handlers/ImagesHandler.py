import uuid
from fastapi import HTTPException
from dotenv import load_dotenv
import os
from DormShareAPI.application.Data.models import Image, Item
from sqlalchemy import Select, select

load_dotenv()

from imagekitio import ImageKit

imagekit = ImageKit(
    private_key=os.environ.get("IMAGEKIT_PRIVATE_KEY"))

URL_ENDPOINT = os.environ.get("IMAGEKIT_URL_ENDPOINT")



async def upload_photo(item_id, file, session, current_user):

    item = session.get(Item, item_id)

    if not item:
        raise HTTPException(status_code=404, detail="item not found")

    if item.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="not enough permissions")


    image_data = await file.read()

    try:
         response = imagekit.files.upload(
            file=image_data,
            file_name=f"{uuid.uuid4()}.jpg"
        )

         session.add(Image(external_id=response.file_id,
                           item_id=item_id,
                           photo_url=response.url))

         session.commit()

         return {"status" : "success",
                 "photo_url" : response.url,
                 "id" : response.file_id}

    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Cant save a file: {e}")



def delete_photo(image_id, session, current_user):
    Photo = session.get(Image, image_id)


    if not Photo:
        raise HTTPException(status_code=404, detail="Photo record not found in database")

    item = session.get(Item, Photo.item_id)

    if not item:
        raise HTTPException(status_code=404, detail="item not found")

    if item.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="not enough permissions")


    try:
        imagekit.files.delete(file_id=Photo.external_id)

        session.delete(Photo)
        session.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Something went wrong while deleting image: {e}")