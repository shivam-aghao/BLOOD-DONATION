from database import supabase


BLOOD_GROUPS = [
    "A+",
    "A-",
    "B+",
    "B-",
    "AB+",
    "AB-",
    "O+",
    "O-"
]


def get_inventory(hospital_id: int):

    response = (
        supabase
        .table("inventory")
        .select("*")
        .eq("hospital_id", hospital_id)
        .execute()
    )

    return response.data


def get_stock(hospital_id: int, blood_group: str):

    if blood_group not in BLOOD_GROUPS:
        raise ValueError("Invalid blood group")

    response = (
        supabase
        .table("inventory")
        .select("*")
        .eq("hospital_id", hospital_id)
        .eq("blood_group", blood_group)
        .execute()
    )

    if not response.data:
        raise ValueError("Blood stock not found")

    return response.data[0]


def update_inventory(
    hospital_id: int,
    blood_group: str,
    units: int
):

    if blood_group not in BLOOD_GROUPS:
        raise ValueError("Invalid blood group")

    if units < 0:
        raise ValueError("Units cannot be negative")

    response = (
        supabase
        .table("inventory")
        .update({"units": units})
        .eq("hospital_id", hospital_id)
        .eq("blood_group", blood_group)
        .execute()
    )

    if not response.data:
        response = (
            supabase
            .table("inventory")
            .insert({
                "hospital_id": hospital_id,
                "blood_group": blood_group,
                "units": units
            })
            .execute()
        )

    return response.data[0]


def add_stock(
    hospital_id: int,
    blood_group: str,
    units: int
):

    if units < 0:
        raise ValueError("Units cannot be negative")

    try:
        stock = get_stock(hospital_id, blood_group)

        new_units = stock["units"] + units

        return update_inventory(
            hospital_id,
            blood_group,
            new_units
        )

    except ValueError as e:

        if str(e) == "Blood stock not found":
            return update_inventory(
                hospital_id,
                blood_group,
                units
            )

        raise


def remove_stock(
    hospital_id: int,
    blood_group: str,
    units: int
):

    if units < 0:
        raise ValueError("Units cannot be negative")

    stock = get_stock(
        hospital_id,
        blood_group
    )

    if stock["units"] < units:
        raise ValueError(
            "Not enough blood units available"
        )

    new_units = stock["units"] - units

    return update_inventory(
        hospital_id,
        blood_group,
        new_units
    )