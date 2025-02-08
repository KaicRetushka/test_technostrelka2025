from sqladmin import ModelView

from backend.database.models_db import TablePolylinePublic, TablePhotosPolylinePublic

class PolylinePublicAdmin(ModelView, model=TablePolylinePublic):
    column_list = [TablePolylinePublic.p_id,
                   TablePolylinePublic.p_name,
                   TablePolylinePublic.p_text,
                   TablePolylinePublic.p_arr,
                   TablePolylinePublic.p_color,
                   TablePolylinePublic.is_conf,
                   TablePolylinePublic.login_user]
    
class PhotosPolylinePublicAdmin(ModelView, model=TablePhotosPolylinePublic):
    column_list = [
        TablePhotosPolylinePublic.id_photo,
        TablePhotosPolylinePublic.photo_blob,
        TablePhotosPolylinePublic.p_id
    ]