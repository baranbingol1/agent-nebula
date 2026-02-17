AVATARS = [
    {"id": "robot", "emoji": "\U0001f916", "label": "Robot"},
    {"id": "alien", "emoji": "\U0001f47d", "label": "Alien"},
    {"id": "ghost", "emoji": "\U0001f47b", "label": "Ghost"},
    {"id": "wizard", "emoji": "\U0001f9d9", "label": "Wizard"},
    {"id": "astronaut", "emoji": "\U0001f468\u200d\U0001f680", "label": "Astronaut"},
    {"id": "scientist", "emoji": "\U0001f468\u200d\U0001f52c", "label": "Scientist"},
    {"id": "detective", "emoji": "\U0001f575\ufe0f", "label": "Detective"},
    {"id": "ninja", "emoji": "\U0001f977", "label": "Ninja"},
    {"id": "vampire", "emoji": "\U0001f9db", "label": "Vampire"},
    {"id": "fairy", "emoji": "\U0001f9da", "label": "Fairy"},
    {"id": "genie", "emoji": "\U0001f9de", "label": "Genie"},
    {"id": "zombie", "emoji": "\U0001f9df", "label": "Zombie"},
    {"id": "mermaid", "emoji": "\U0001f9dc", "label": "Mermaid"},
    {"id": "elf", "emoji": "\U0001f9dd", "label": "Elf"},
    {"id": "crystal_ball", "emoji": "\U0001f52e", "label": "Crystal Ball"},
    {"id": "fire", "emoji": "\U0001f525", "label": "Fire"},
    {"id": "star", "emoji": "\u2b50", "label": "Star"},
    {"id": "moon", "emoji": "\U0001f319", "label": "Moon"},
    {"id": "sun", "emoji": "\u2600\ufe0f", "label": "Sun"},
    {"id": "comet", "emoji": "\u2604\ufe0f", "label": "Comet"},
    {"id": "rocket", "emoji": "\U0001f680", "label": "Rocket"},
    {"id": "ufo", "emoji": "\U0001f6f8", "label": "UFO"},
    {"id": "brain", "emoji": "\U0001f9e0", "label": "Brain"},
    {"id": "cat", "emoji": "\U0001f431", "label": "Cat"},
    {"id": "owl", "emoji": "\U0001f989", "label": "Owl"},
    {"id": "dragon", "emoji": "\U0001f409", "label": "Dragon"},
    {"id": "phoenix", "emoji": "\U0001f426\u200d\U0001f525", "label": "Phoenix"},
    {"id": "butterfly", "emoji": "\U0001f98b", "label": "Butterfly"},
]


def get_avatar(avatar_id: str) -> dict | None:
    for avatar in AVATARS:
        if avatar["id"] == avatar_id:
            return avatar
    return None
