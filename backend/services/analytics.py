def init_analytics():
    # Placeholder for future tracking (PostHog, Segment, DB logs)
    print("📊 Analytics initialized")

def track_event(event: str, payload: dict = None):
    # Safe no-op
    print(f"[ANALYTICS] {event}", payload or {})
