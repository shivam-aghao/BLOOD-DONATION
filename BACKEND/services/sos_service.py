# =========================
# TEMPORARY SOS DATA
# =========================

sos_requests = []


# =========================
# CREATE SOS REQUEST
# =========================

def create_sos(data: dict):

    new_id = len(sos_requests) + 1

    sos = {
        "sos_id": new_id,
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

    sos_requests.append(sos)

    return sos


# =========================
# GET ALL SOS REQUESTS
# =========================

def get_sos_requests():

    return sos_requests


# =========================
# GET SINGLE SOS REQUEST
# =========================

def get_sos(sos_id: int):

    for sos in sos_requests:

        if sos["sos_id"] == sos_id:
            return sos

    raise ValueError("SOS request not found")


# =========================
# UPDATE SOS STATUS
# =========================

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

    sos = get_sos(sos_id)

    sos["status"] = status

    return sos