from database import supabase


def create_sos(data: dict):

    sos_data = {
        "patient_name": data["patient_name"],
        "blood_group": data["blood_group"],
        "units": data["units"],
        "urgency": data["urgency"],
        "hospital": data["hospital"],
        "city": data["city"],
        "contact_name": data["contact_name"],
        "contact_phone": data["contact_phone"],
        "notes": data.get("notes"),
        "status": "open"
    }

    response = (
        supabase
        .table("sos_requests")
        .insert(sos_data)
        .execute()
    )

    if not response.data:
        return None

    return response.data[0]


def get_sos_requests():

    response = (
        supabase
        .table("sos_requests")
        .select("*")
        .order("id")
        .execute()
    )

    return response.data


def get_sos(sos_id: int):

    response = (
        supabase
        .table("sos_requests")
        .select("*")
        .eq("id", sos_id)
        .execute()
    )

    if not response.data:
        return None

    return response.data[0]


def update_sos_status(
    sos_id: int,
    status: str
):

    allowed_statuses = [
        "open",
        "fulfilled",
        "cancelled"
    ]

    if status not in allowed_statuses:
        raise ValueError(
            "Invalid SOS status. "
            "Use: open, fulfilled or cancelled"
        )

    response = (
        supabase
        .table("sos_requests")
        .update({"status": status})
        .eq("id", sos_id)
        .execute()
    )

    if not response.data:
        return None

    return response.data[0]