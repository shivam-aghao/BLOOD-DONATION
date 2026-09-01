from database import supabase


def normalize_donor(d):
    """Normalize donor fields for frontend compatibility."""
    if not isinstance(d, dict):
        return d

    item = dict(d)

    donor_id = (
        item.get("donar_id")
        or item.get("donor_id")
        or item.get("id")
    )

    item["id"] = donor_id
    item["donar_id"] = donor_id

    name = item.get("full_name") or item.get("name") or "Anonymous Donor"
    item["name"] = name
    item["full_name"] = name

    phone = item.get("mobile") or item.get("phone") or ""
    item["phone"] = phone
    item["mobile"] = phone

    if "available" not in item:
        item["available"] = True

    if "agreement" not in item:
        item["agreement"] = True

    return item


def add_donor(donor):
    donor_data = donor.model_dump()

    response = (
        supabase
        .table("donors")
        .insert(donor_data)
        .execute()
    )

    if not response.data:
        return None

    return normalize_donor(response.data[0])


def get_donors():
    response = (
        supabase
        .table("donors")
        .select("*")
        .execute()
    )

    return [normalize_donor(d) for d in response.data]


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

    return [normalize_donor(d) for d in response.data]


def update_donor(donor_id: int, donor):
    donor_data = donor.model_dump()

    name = donor_data.get("name") or donor_data.get("full_name")
    phone = donor_data.get("phone") or donor_data.get("mobile")

    supabase_payload = {
        "full_name": name,
        "age": donor_data.get("age"),
        "gender": donor_data.get("gender"),
        "blood_group": donor_data.get("blood_group"),
        "mobile": phone,
        "email": donor_data.get("email"),
        "city": donor_data.get("city"),
        "address": donor_data.get("address"),
        "donated_before": donor_data.get("donated_before"),
        "last_donation": donor_data.get("last_donation"),
        "availability": donor_data.get("availability"),
        "preferred_hospital": donor_data.get("preferred_hospital"),
    }

    response = (
        supabase
        .table("donors")
        .update(supabase_payload)
        .eq("id", donor_id)
        .execute()
    )

    if not response.data:
        return None

    return normalize_donor(response.data[0])


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

    return normalize_donor(response.data[0])