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


from sqlmodel import select


def delete_photo(image_id, session, current_user):
    statement = select(Image).where(Image.external_id == image_id)
    photo = session.exec(statement).first()

    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")


    try:
        current_item_id = photo.item_id
    except AttributeError:
        current_item_id = photo[0].item_id
        photo = photo[0]

    item = session.get(Item, current_item_id)

    if not item or item.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="No permissions")

    try:
        imagekit.files.delete(file_id=image_id)
        session.delete(photo)
        session.commit()
        return {"status": "success"}
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Error: {e}")