# Hospital Service
# Handles hospital-related business logic


def add_hospital(hospital):
    """
    Add a new hospital.
    Database integration will be added later.
    """
    return hospital


def get_hospital(hospital_id):
    """
    Get hospital details using hospital ID.
    """
    return {"hospital_id": hospital_id}


def update_hospital(hospital_id, hospital_data):
    """
    Update hospital details.
    """
    return {
        "hospital_id": hospital_id,
        **hospital_data
    }


def get_all_hospitals():
    """
    Return all hospitals.
    Database integration will be added later.
    """
    return []