from database import supabase


def add_donor(donor):
    donor_data = donor.model_dump()

    response = (
        supabase
        .table("donors")
        .insert(donor_data)
        .execute()
    )

    return response.data[0]


def get_donors():
    response = (
        supabase
        .table("donors")
        .select("*")
        .order("id")
        .execute()
    )

    return response.data


def search_donors(blood_group: str, city: str = None):

    query = (
        supabase
        .table("donors")
        .select("*")
        .eq("blood_group", blood_group)
        .eq("available", True)
    )

    if city and city.lower() != "all":
        query = query.ilike("city", city)

    response = query.execute()

    return response.data


def update_donor(donor_id: int, donor):

    donor_data = donor.model_dump()

    response = (
        supabase
        .table("donors")
        .update(donor_data)
        .eq("id", donor_id)
        .execute()
    )

    if not response.data:
        return None

    return response.data[0]


def delete_donor(donor_id: int):

    response = (
        supabase
        .table("donors")
        .delete()
        .eq("id", donor_id)
        .execute()
    )

    if not response.data:
        return None

    return response.data[0]