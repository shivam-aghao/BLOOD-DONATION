from database import supabase

DEFAULT_HOSPITALS = [
    {
        "hospital_id": 1,
        "id": 1,
        "name": "Akola District Civil Hospital & Blood Bank",
        "hospital_name": "Akola District Civil Hospital & Blood Bank",
        "city": "AKOLA",
        "address": "Civil Lines, Near Collector Office, Akola",
        "contact": "+91 724 2434567",
        "email": "civilhospital@akola.gov.in",
        "hours": "24/7 Emergency Blood Bank",
        "inventory": {
            "A+": 18, "A-": 4, "B+": 12, "B-": 3,
            "AB+": 6, "AB-": 2, "O+": 25, "O-": 6
        }
    },
    {
        "hospital_id": 2,
        "id": 2,
        "name": "Ozone Multi-Speciality Hospital",
        "hospital_name": "Ozone Multi-Speciality Hospital",
        "city": "AKOLA",
        "address": "Murtizapur Road, Near Holy Cross School, Akola",
        "contact": "+91 724 2458900",
        "email": "bloodbank@ozonehospital.com",
        "hours": "24/7 Emergency Services",
        "inventory": {
            "A+": 10, "A-": 2, "B+": 14, "B-": 1,
            "AB+": 4, "AB-": 1, "O+": 20, "O-": 4
        }
    },
    {
        "hospital_id": 3,
        "id": 3,
        "name": "Icon Critical Care & Trauma Hospital",
        "hospital_name": "Icon Critical Care & Trauma Hospital",
        "city": "AKOLA",
        "address": "Station Road, Akola",
        "contact": "+91 724 2412345",
        "email": "emergency@iconhospital.com",
        "hours": "24/7 Round the Clock",
        "inventory": {
            "A+": 12, "A-": 3, "B+": 9, "B-": 2,
            "AB+": 5, "AB-": 2, "O+": 16, "O-": 3
        }
    }
]

hospitals = list(DEFAULT_HOSPITALS)


# =========================
# GET ALL HOSPITALS
# =========================
def get_hospitals():
    try:
        res = supabase.table("hospitals").select("*").execute()
        if res.data and len(res.data) > 0:
            formatted = []
            for h in res.data:
                formatted.append({
                    "hospital_id": h.get("hospital_id") or h.get("id"),
                    "id": h.get("hospital_id") or h.get("id"),
                    "name": h.get("hospital_name") or h.get("name"),
                    "hospital_name": h.get("hospital_name") or h.get("name"),
                    "city": h.get("city", "AKOLA"),
                    "address": h.get("address", ""),
                    "contact": h.get("contact_number") or h.get("contact", ""),
                    "email": h.get("email", ""),
                    "hours": h.get("operating_hours") or h.get("hours", "24/7 Emergency Blood Bank"),
                    "inventory": h.get("inventory") or {
                        "A+": 10, "A-": 4, "B+": 8, "B-": 2,
                        "AB+": 5, "AB-": 2, "O+": 15, "O-": 4
                    }
                })
            return formatted
    except Exception:
        pass
    return hospitals


# =========================
# GET SINGLE HOSPITAL
# =========================
def get_hospital(hospital_id):
    str_id = str(hospital_id)
    all_h = get_hospitals()
    for hospital in all_h:
        if str(hospital.get("hospital_id")) == str_id or str(hospital.get("id")) == str_id:
            return hospital

    raise ValueError("Hospital not found")


# =========================
# CREATE HOSPITAL
# =========================
def create_hospital(data: dict):
    new_id = len(hospitals) + 1
    name = data.get("name") or data.get("hospital_name")
    contact = data.get("contact") or data.get("contact_number")

    hospital = {
        "hospital_id": new_id,
        "id": new_id,
        "name": name,
        "hospital_name": name,
        "city": data["city"],
        "address": data["address"],
        "contact": contact,
        "email": data.get("email", ""),
        "hours": data.get("hours") or data.get("operating_hours", "24/7 Emergency Blood Bank"),
        "inventory": data.get("inventory") or {
            "A+": 5, "A-": 5, "B+": 5, "B-": 5,
            "AB+": 5, "AB-": 5, "O+": 5, "O-": 5
        }
    }

    try:
        supabase.table("hospitals").insert({
            "hospital_id": str(new_id),
            "hospital_name": name,
            "city": data["city"],
            "address": data["address"],
            "contact_number": contact,
            "email": data.get("email", "")
        }).execute()
    except Exception:
        pass

    hospitals.append(hospital)
    return hospital


# =========================
# UPDATE HOSPITAL
# =========================
def update_hospital(hospital_id, data: dict):
    str_id = str(hospital_id)
    h = next((item for item in hospitals if str(item.get("hospital_id")) == str_id or str(item.get("id")) == str_id), None)
    if not h:
        raise ValueError("Hospital not found")

    h.update(data)
    if "hospital_name" in data:
        h["name"] = data["hospital_name"]
    if "contact_number" in data:
        h["contact"] = data["contact_number"]
    if "operating_hours" in data:
        h["hours"] = data["operating_hours"]

    try:
        supabase.table("hospitals").update(data).eq("hospital_id", str_id).execute()
    except Exception:
        pass

    return h