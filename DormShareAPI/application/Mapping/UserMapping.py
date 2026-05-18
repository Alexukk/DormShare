from DormShareAPI.application.Data.models import User




def CreateUserEntity(user_data, password_func):
    return User(
        username=user_data.username,
        email=user_data.email,
        contact_way=user_data.contact_way,
        password_hash=password_func(user_data.password)
    )

