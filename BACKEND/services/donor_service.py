import os
import json
from database import supabase

LOCAL_DONORS_CACHE = "local_donors.json"

# In-memory and local disk fallback donors
DEFAULT_FALLBACK_DONORS = [
    {
        "donar_id": 1,
        "id": 1,
        "name": "Sarah Jenkins",
        "full_name": "Sarah Jenkins",
        "age": 28,
        "gender": "Female",
        "blood_group": "O-",
        "phone": "+1 (555) 234-5678",
        "mobile": "+1 (555) 234-5678",
        "email": "sarah.j@example.com",
        "city": "New York",
        "address": "742 Evergreen Terrace, Manhattan",
        "donated_before": "Yes",
        "last_donation": "2026-06-15",
        "availability": "Anytime (24/7 SOS)",
        "preferred_hospital": "City General Hospital",
        "agreement": True,
        "available": True
    },
    {
        "donar_id": 2,
        "id": 2,
        "name": "Marcus Vance",
        "full_name": "Marcus Vance",
        "age": 34,
        "gender": "Male",
        "blood_group": "A+",
        "phone": "+1 (555) 345-6789",
        "mobile": "+1 (555) 345-6789",
        "email": "marcus.v@example.com",
        "city": "New York",
        "address": "120 West 44th St",
        "donated_before": "Yes",
        "last_donation": "2026-05-20",
        "availability": "Evenings & Weekends",
        "preferred_hospital": "St. Mary's Regional",
        "agreement": True,
        "available": True
    },
    {
        "donar_id": 3,
        "id": 3,
        "name": "Elena Rostova",
        "full_name": "Elena Rostova",
        "age": 26,
        "gender": "Female",
        "blood_group": "B+",
        "phone": "+1 (718) 555-7890",
        "mobile": "+1 (718) 555-7890",
        "email": "elena.rostova@example.com",
        "city": "Brooklyn",
        "address": "350 Ocean Parkway",
        "donated_before": "No",
        "last_donation": "",
        "availability": "Anytime (24/7 SOS)",
        "preferred_hospital": "Brooklyn Central Medical Center",
        "agreement": True,
        "available": True
    }
]


def load_local_donors():
    if os.path.exists(LOCAL_DONORS_CACHE):
        try:
            with open(LOCAL_DONORS_CACHE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return list(DEFAULT_FALLBACK_DONORS)


def save_local_donors(donors_list):
    try:
        with open(LOCAL_DONORS_CACHE, "w", encoding="utf-8") as f:
            json.dump(donors_list, f, indent=2)
    except Exception:
        pass


def normalize_donor(d):
    """Normalize donor dict so both naming conventions exist for client compatibility."""
    if not isinstance(d, dict):
        return d
    item = dict(d)
    
    # ID normalization
    donor_id = item.get("donar_id") or item.get("id") or item.get("donor_id") or 1
    item["id"] = donor_id
    item["donar_id"] = donor_id

    # Name normalization
    name = item.get("full_name") or item.get("name") or "Anonymous Donor"
    item["name"] = name
    item["full_name"] = name

    # Phone normalization
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
    name = donor_data.get("name") or donor_data.get("full_name", "")
    phone = donor_data.get("phone") or donor_data.get("mobile", "")

    # Payload matching Supabase 'donar' table columns
    supabase_payload = {
        "full_name": name,
        "age": donor_data.get("age", 25),
        "gender": donor_data.get("gender", "Other"),
        "blood_group": donor_data.get("blood_group", "O+"),
        "mobile": phone,
        "email": donor_data.get("email", ""),
        "city": donor_data.get("city", "New York"),
        "address": donor_data.get("address", ""),
        "donated_before": donor_data.get("donated_before", "No"),
        "last_donation": donor_data.get("last_donation") or None,
        "availability": donor_data.get("availability", "Anytime"),
        "preferred_hospital": donor_data.get("preferred_hospital") or None
    }

    # Try inserting into Supabase 'donar' table or 'donors' table
    for table_name in ["donar", "donors"]:
        try:
            response = supabase.table(table_name).insert(supabase_payload).execute()
            if response.data and len(response.data) > 0:
                created = normalize_donor(response.data[0])
                # Also save to local cache
                local_list = load_local_donors()
                local_list.insert(0, created)
                save_local_donors(local_list)
                return created
        except Exception:
            continue

    # Fallback to local storage if Supabase has RLS or connection restrictions
    local_list = load_local_donors()
    new_id = len(local_list) + 1
    new_donor = normalize_donor({
        "id": new_id,
        "donar_id": new_id,
        **supabase_payload,
        "name": name,
        "phone": phone,
        "agreement": donor_data.get("agreement", True),
        "available": True
    })
    local_list.insert(0, new_donor)
    save_local_donors(local_list)
    return new_donor


def get_donors():
    # Try fetching from Supabase
    for table_name in ["donar", "donors"]:
        try:
            response = supabase.table(table_name).select("*").execute()
            if response.data and len(response.data) > 0:
                return [normalize_donor(d) for d in response.data]
        except Exception:
            continue

    # Return local storage list if Supabase query is empty or RLS-protected
    return [normalize_donor(d) for d in load_local_donors()]


def search_donors(blood_group: str, city: str = None):
    # Try Supabase query
    for table_name in ["donar", "donors"]:
        try:
            query = supabase.table(table_name).select("*").eq("blood_group", blood_group)
            if city and city.lower() != "all":
                query = query.ilike("city", f"%{city}%")
            response = query.execute()
            if response.data and len(response.data) > 0:
                return [normalize_donor(d) for d in response.data]
        except Exception:
            continue

    # Fallback search locally
    local_list = load_local_donors()
    results = []
    for d in local_list:
        if d.get("blood_group") == blood_group:
            if not city or city.lower() == "all" or city.lower() in d.get("city", "").lower():
                results.append(normalize_donor(d))
    return results


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
        "preferred_hospital": donor_data.get("preferred_hospital")
    }

    for table_name in ["donar", "donors"]:
        for id_col in ["donar_id", "id"]:
            try:
                response = supabase.table(table_name).update(supabase_payload).eq(id_col, donor_id).execute()
                if response.data and len(response.data) > 0:
                    return normalize_donor(response.data[0])
            except Exception:
                continue

    # Local fallback
    local_list = load_local_donors()
    for i, d in enumerate(local_list):
        if d.get("id") == donor_id or d.get("donar_id") == donor_id:
            local_list[i].update(normalize_donor(donor_data))
            save_local_donors(local_list)
            return local_list[i]

    return None


def delete_donor(donor_id: int):
    for table_name in ["donar", "donors"]:
        for id_col in ["donar_id", "id"]:
            try:
                response = supabase.table(table_name).delete().eq(id_col, donor_id).execute()
                if response.data and len(response.data) > 0:
                    return normalize_donor(response.data[0])
            except Exception:
                continue

    local_list = load_local_donors()
    for i, d in enumerate(local_list):
        if d.get("id") == donor_id or d.get("donar_id") == donor_id:
            removed = local_list.pop(i)
            save_local_donors(local_list)
            return removed

    return None