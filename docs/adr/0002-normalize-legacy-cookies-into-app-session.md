# Normalize legacy cookies into an app session

The app supports existing NHCS signed shared cookies for cross-app login, but normalizes them into an app-facing session boundary instead of letting modules read legacy cookie names directly. On login, the app writes both the legacy cookie set and a new signed `nhcs_session` cookie so migration keeps multi-app SSO compatibility while giving this app a cleaner session model.
