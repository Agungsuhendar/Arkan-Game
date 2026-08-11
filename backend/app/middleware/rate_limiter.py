import time
from collections import defaultdict
from typing import Dict, List
from fastapi import Request, HTTPException, status

class RateLimiter:
    """
    Sliding window rate limiter per client IP.
    Default limit: max_requests per window_seconds.
    """
    def __init__(self, requests_limit: int = 10, window_seconds: int = 60):
        self.requests_limit = requests_limit
        self.window_seconds = window_seconds
        self.hits: Dict[str, List[float]] = defaultdict(list)

    def __call__(self, request: Request):
        client_ip = request.client.host if request.client else "127.0.0.1"
        now = time.time()
        
        # Clean expired timestamps
        window_start = now - self.window_seconds
        timestamps = [ts for ts in self.hits[client_ip] if ts > window_start]
        
        if len(timestamps) >= self.requests_limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Terlalu banyak permintaan. Batas {self.requests_limit} kali per {self.window_seconds} detik."
            )
        
        timestamps.append(now)
        self.hits[client_ip] = timestamps

auth_rate_limiter = RateLimiter(requests_limit=10, window_seconds=60)
ai_rate_limiter = RateLimiter(requests_limit=20, window_seconds=60)
