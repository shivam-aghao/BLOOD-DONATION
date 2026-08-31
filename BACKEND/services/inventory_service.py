# =========================
# BLOOD GROUPS
# =========================

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


# =========================
# TEMPORARY INVENTORY DATA
# =========================

inventory = [
    {
        "hospital_id": 1,
        "blood_group": "A+",
        "units": 10
    },
    {
        "hospital_id": 1,
        "blood_group": "A-",
        "units": 5
    },
    {
        "hospital_id": 1,
        "blood_group": "B+",
        "units": 8
    },
    {
        "hospital_id": 1,
        "blood_group": "B-",
        "units": 4
    },
    {
        "hospital_id": 1,
        "blood_group": "AB+",
        "units": 6
    },
    {
        "hospital_id": 1,
        "blood_group": "AB-",
        "units": 2
    },
    {
        "hospital_id": 1,
        "blood_group": "O+",
        "units": 12
    },
    {
        "hospital_id": 1,
        "blood_group": "O-",
        "units": 3
    }
]


# =========================
# GET HOSPITAL INVENTORY
# =========================

def get_inventory(hospital_id: int):

    return [
        item
        for item in inventory
        if item["hospital_id"] == hospital_id
    ]


# =========================
# GET SPECIFIC BLOOD STOCK
# =========================

def get_stock(
    hospital_id: int,
    blood_group: str
):

    if blood_group not in BLOOD_GROUPS:
        raise ValueError("Invalid blood group")

    for item in inventory:

        if (
            item["hospital_id"] == hospital_id
            and item["blood_group"] == blood_group
        ):
            return item

    raise ValueError("Blood stock not found")


# =========================
# UPDATE INVENTORY
# =========================

def update_inventory(
    hospital_id: int,
    blood_group: str,
    units: int
):

    if blood_group not in BLOOD_GROUPS:
        raise ValueError("Invalid blood group")

    if units < 0:
        raise ValueError("Units cannot be negative")

    try:

        stock = get_stock(
            hospital_id,
            blood_group
        )

        stock["units"] = units

        return stock

    except ValueError:

        new_stock = {
            "hospital_id": hospital_id,
            "blood_group": blood_group,
            "units": units
        }

        inventory.append(new_stock)

        return new_stock


# =========================
# ADD STOCK
# =========================

def add_stock(
    hospital_id: int,
    blood_group: str,
    units: int
):

    if units < 0:
        raise ValueError("Units cannot be negative")

    try:

        stock = get_stock(
            hospital_id,
            blood_group
        )

        stock["units"] += units

        return stock

    except ValueError:

        return update_inventory(
            hospital_id,
            blood_group,
            units
        )


# =========================
# REMOVE STOCK
# =========================

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

    stock["units"] -= units

    return stock