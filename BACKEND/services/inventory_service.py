# Inventory Service
# Handles blood stock business logic


def get_stock(inventory):
    """Return current blood stock."""
    return inventory


def update_stock(inventory, blood_group, units):
    """Update stock for a blood group."""

    if units < 0:
        raise ValueError("Stock cannot be negative")

    inventory[blood_group] = units
    return inventory


def restock_all(inventory, amount=5):
    """Add units to all blood groups."""

    for blood_group in inventory:
        inventory[blood_group] += amount

    return inventory


def get_total_stock(inventory):
    """Calculate total available blood units."""

    return sum(inventory.values())