from routers.agents import router as agents_router
from routers.rooms import router as rooms_router
from routers.simulation import router as simulation_router
from routers.messages import router as messages_router
from routers.avatars import router as avatars_router
from routers.ws import router as ws_router

__all__ = [
    "agents_router", "rooms_router", "simulation_router",
    "messages_router", "avatars_router", "ws_router",
]
