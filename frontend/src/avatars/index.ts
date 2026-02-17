import type { AvatarDef } from "../types";

export const AVATARS: AvatarDef[] = [
  { id: "robot", emoji: "\u{1F916}", label: "Robot" },
  { id: "alien", emoji: "\u{1F47D}", label: "Alien" },
  { id: "ghost", emoji: "\u{1F47B}", label: "Ghost" },
  { id: "wizard", emoji: "\u{1F9D9}", label: "Wizard" },
  { id: "astronaut", emoji: "\u{1F468}\u200D\u{1F680}", label: "Astronaut" },
  { id: "scientist", emoji: "\u{1F468}\u200D\u{1F52C}", label: "Scientist" },
  { id: "detective", emoji: "\u{1F575}\uFE0F", label: "Detective" },
  { id: "ninja", emoji: "\u{1F977}", label: "Ninja" },
  { id: "vampire", emoji: "\u{1F9DB}", label: "Vampire" },
  { id: "fairy", emoji: "\u{1F9DA}", label: "Fairy" },
  { id: "genie", emoji: "\u{1F9DE}", label: "Genie" },
  { id: "zombie", emoji: "\u{1F9DF}", label: "Zombie" },
  { id: "mermaid", emoji: "\u{1F9DC}", label: "Mermaid" },
  { id: "elf", emoji: "\u{1F9DD}", label: "Elf" },
  { id: "crystal_ball", emoji: "\u{1F52E}", label: "Crystal Ball" },
  { id: "fire", emoji: "\u{1F525}", label: "Fire" },
  { id: "star", emoji: "\u2B50", label: "Star" },
  { id: "moon", emoji: "\u{1F319}", label: "Moon" },
  { id: "sun", emoji: "\u2600\uFE0F", label: "Sun" },
  { id: "comet", emoji: "\u2604\uFE0F", label: "Comet" },
  { id: "rocket", emoji: "\u{1F680}", label: "Rocket" },
  { id: "ufo", emoji: "\u{1F6F8}", label: "UFO" },
  { id: "brain", emoji: "\u{1F9E0}", label: "Brain" },
  { id: "cat", emoji: "\u{1F431}", label: "Cat" },
  { id: "owl", emoji: "\u{1F989}", label: "Owl" },
  { id: "dragon", emoji: "\u{1F409}", label: "Dragon" },
  { id: "phoenix", emoji: "\u{1F426}\u200D\u{1F525}", label: "Phoenix" },
  { id: "butterfly", emoji: "\u{1F98B}", label: "Butterfly" },
];

export function getAvatar(avatarId: string): AvatarDef {
  return AVATARS.find((a) => a.id === avatarId) ?? AVATARS[0];
}
