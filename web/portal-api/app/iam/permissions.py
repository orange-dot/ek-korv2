"""Permission definitions and utilities."""

# All available permissions in the system
PERMISSIONS = {
    # IAM permissions
    "iam.users.view": ("iam", "users.view", "View user list and details"),
    "iam.users.create": ("iam", "users.create", "Create new users"),
    "iam.users.update": ("iam", "users.update", "Update user details"),
    "iam.users.delete": ("iam", "users.delete", "Deactivate users"),
    "iam.roles.manage": ("iam", "roles.manage", "Create, update, delete roles"),
    "iam.invites.send": ("iam", "invites.send", "Send and manage invites"),
    "iam.audit.view": ("iam", "audit.view", "View audit log"),

    # Finance permissions
    "finance.view": ("finance", "view", "View finance dashboard and data"),
    "finance.invoices.create": ("finance", "invoices.create", "Create invoices"),
    "finance.invoices.edit": ("finance", "invoices.edit", "Edit and delete invoices"),
    "finance.expenses.create": ("finance", "expenses.create", "Create expense records"),
    "finance.taxes.manage": ("finance", "taxes.manage", "Manage tax deadlines and filings"),

    # Projects permissions
    "projects.view": ("projects", "view", "View projects dashboard and data"),
    "projects.ip.create": ("projects", "ip.create", "Create IP assets"),
    "projects.ip.edit": ("projects", "ip.edit", "Edit IP assets"),
    "projects.milestones.manage": ("projects", "milestones.manage", "Manage milestones"),

    # Team permissions
    "team.view": ("team", "view", "View team directory"),
    "team.members.manage": ("team", "members.manage", "Add and update team members"),
    "team.equity.view": ("team", "equity.view", "View cap table"),
    "team.equity.manage": ("team", "equity.manage", "Manage equity grants"),
    "team.contracts.manage": ("team", "contracts.manage", "Manage contracts"),
}

# Predefined role configurations
ROLE_PERMISSIONS = {
    "admin": list(PERMISSIONS.keys()),  # All permissions
    "founder": [
        "finance.view", "finance.invoices.create", "finance.invoices.edit",
        "finance.expenses.create", "finance.taxes.manage",
        "projects.view", "projects.ip.create", "projects.ip.edit",
        "projects.milestones.manage",
        "team.view", "team.equity.view",
    ],
    "accountant": [
        "finance.view", "finance.invoices.create", "finance.invoices.edit",
        "finance.expenses.create", "finance.taxes.manage",
    ],
    "developer": [
        "projects.view", "projects.ip.create", "projects.ip.edit",
        "projects.milestones.manage",
        "team.view",
    ],
    "advisor": [
        "finance.view",
        "projects.view",
        "team.view", "team.equity.view",
    ],
}

# Role descriptions
ROLE_DESCRIPTIONS = {
    "admin": "Full access to all features including IAM management",
    "founder": "Business operations - finance, projects, and team oversight",
    "accountant": "Financial data management - invoices, expenses, and taxes",
    "developer": "Technical and IP focus - projects and milestones",
    "advisor": "Read-only overview of all areas",
}


def has_permission(user_permissions: set[str], required: str) -> bool:
    """
    Check if a set of permissions includes the required permission.

    Supports wildcards:
    - "*" matches everything
    - "finance.*" matches all finance permissions
    - "*.view" matches all view permissions
    """
    # Superadmin wildcard
    if "*" in user_permissions:
        return True

    # Exact match
    if required in user_permissions:
        return True

    # Check for resource wildcards (e.g., "finance.*")
    parts = required.split(".")
    for i in range(len(parts)):
        wildcard = ".".join(parts[:i+1]) + ".*"
        if wildcard in user_permissions:
            return True

    # Check for action wildcards (e.g., "*.view")
    if f"*.{parts[-1]}" in user_permissions:
        return True

    return False
