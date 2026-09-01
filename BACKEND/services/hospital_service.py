from database import supabase


# =========================
# GET ALL HOSPITALS
# =========================
def get_hospitals():
    response = (
        supabase
        .table("hospitals")
        .select("*")
        .execute()
    )

    return response.data


# =========================
# GET SINGLE HOSPITAL
# =========================
def get_hospital(hospital_id: int):

    response = (
        supabase
        .table("hospitals")
        .select("*")
        .eq("hospital_id", hospital_id)
        .execute()
    )

    if not response.data:
        return None

    return response.data[0]


# =========================
# CREATE HOSPITAL
# =========================
def create_hospital(data: dict):

    response = (
        supabase
        .table("hospitals")
        .insert(data)
        .execute()
    )

    if not response.data:
        return None

    return response.data[0]


# =========================
# UPDATE HOSPITAL
# =========================
def update_hospital(
    hospital_id: int,
    data: dict
):

    response = (
        supabase
        .table("hospitals")
        .update(data)
        .eq("hospital_id", hospital_id)
        .execute()
    )

    if not response.data:
        return None

    return response.data[0]


# =========================
# DELETE HOSPITAL
# =========================
def delete_hospital(hospital_id: int):

    response = (
        supabase
        .table("hospitals")
        .delete()
        .eq("hospital_id", hospital_id)
        .execute()
    )

    if not response.data:
        return None

    return response.data[0]