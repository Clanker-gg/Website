def log(message):
    """Print and flush immediately for Docker logs."""
    print(message, flush=True)
