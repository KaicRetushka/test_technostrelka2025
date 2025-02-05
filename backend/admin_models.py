from sqladmin import ModelView

from backend.database.models_db import TablePolylinePublic

class PolylinePublicAdmin(ModelView, model=TablePolylinePublic):
    column_list = [TablePolylinePublic.p_id,
                   TablePolylinePublic.p_name,
                   TablePolylinePublic.p_text,
                   TablePolylinePublic.p_arr,
                   TablePolylinePublic.p_color,
                   TablePolylinePublic.is_conf]