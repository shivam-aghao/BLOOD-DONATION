# Temporary in-memory hospital data

hospitals = [
    {
        "hospital_id": 1,
        "name": "City General Hospital",
        "city": "New York",
        "address": "100 Main Street",
        "contact": "+1 555 100 2000",
        "email": "citygeneral@example.com",
        "hours": "24/7 Emergency Blood Bank"
    }
]


# =========================
# GET ALL HOSPITALS
# =========================
def get_hospitals():
    return hospitals


# =========================
# GET SINGLE HOSPITAL
# =========================
def get_hospital(hospital_id: int):

    for hospital in hospitals:

        if hospital["hospital_id"] == hospital_id:
            return hospital

    raise ValueError("Hospital not found")


# =========================
# CREATE HOSPITAL
# =========================
def create_hospital(data: dict):

    new_id = len(hospitals) + 1

    hospital = {
        "hospital_id": new_id,
        "name": data["name"],
        "city": data["city"],
        "address": data["address"],
        "contact": data["contact"],
        "email": data["email"],
        "hours": data.get(
            "hours",
            "24/7 Emergency Blood Bank"
        )
    }

    hospitals.append(hospital)

    return hospital


# =========================
# UPDATE HOSPITAL
# =========================
def update_hospital(
    hospital_id: int,
    data: dict
):

    hospital = get_hospital(hospital_id)

    hospital.update(data)

    return hospital