import type { StaffMember } from "@/modules/staff/staff.types";

// Sample staff, copied into MongoDB by the demo content seed.
export const management: StaffMember[] = [
  {
    id: "st-1",
    name: "Giorgio Lombardi",
    role: "Club President",
    bio: "Founder of the club and lifelong supporter of Brescia sport.",
  },
  {
    id: "st-2",
    name: "Chiara Bellini",
    role: "General Manager",
    bio: "Leads the day-to-day running of the club, from fixtures to partnerships.",
  },
  {
    id: "st-3",
    name: "Roberto Santoro",
    role: "Team Manager",
    bio: "Looks after the squad, travel and everything the players need on match day.",
  },
];

export const coaching: StaffMember[] = [
  {
    id: "co-1",
    name: "David Collins",
    role: "Head Coach",
    bio: "Experienced coach with a focus on smart, aggressive T10 cricket.",
    profile:
      "David leads the Lions' coaching team and has overall charge of selection, tactics and match-day decisions. He builds teams around clear roles and fearless, aggressive cricket, and has a reputation for getting the best out of young players.\n\nHis aim for the Lions is simple: play with courage, think clearly under pressure and keep improving every week.",
    experience: "15 years",
    speciality: "T10 strategy",
  },
  {
    id: "co-2",
    name: "Paolo Benedetti",
    role: "Batting Coach",
    bio: "Works with the top order on powerplay strategy and strike rotation.",
    profile:
      "Paolo works with every batter in the squad, from the openers to the finishers. His sessions focus on powerplay planning, rotating the strike and playing the situation, not just the ball.\n\nA former league opener himself, he is known for patient, detailed one-to-one work in the nets.",
    experience: "12 years",
    speciality: "Powerplay batting",
  },
  {
    id: "co-3",
    name: "Imran Siddiqui",
    role: "Bowling Coach",
    bio: "Builds the Lions attack, from pace at the top to spin through the middle.",
    profile:
      "Imran designs the Lions bowling plans, from the new ball to the final over. He works on pace, accuracy and variations with the fast bowlers and on flight and control with the spinners.\n\nHe is also the person who analyses the opposition before every match.",
    experience: "10 years",
    speciality: "Death bowling",
  },
  {
    id: "co-4",
    name: "Elena Marchetti",
    role: "Fitness & Fielding Coach",
    bio: "Keeps the squad fit, sharp and the best fielding side in the league.",
    profile:
      "Elena looks after the physical side of the team: strength, speed, recovery and injury prevention. She also runs the daily fielding drills that have made the Lions one of the sharpest fielding sides in the league.\n\nPlayers say her sessions are the hardest of the week, and the most useful.",
    experience: "8 years",
    speciality: "Fielding & conditioning",
  },
  {
    id: "co-5",
    name: "Rahul Mehta",
    role: "Spin Bowling Coach",
    bio: "Works with the spinners on flight, turn and control in the middle overs.",
    profile:
      "Rahul looks after the Lions spin department. He works with the slow bowlers on flight, grip and variations, and on how to bowl to a plan against aggressive T10 batters.\n\nA former club spinner, he is known for his patient, detailed feedback after every session.",
    experience: "11 years",
    speciality: "Spin & variations",
  },
  {
    id: "co-6",
    name: "Giulia Rinaldi",
    role: "Physiotherapist",
    bio: "Keeps the players healthy and gets injured players back on the field safely.",
    profile:
      "Giulia is responsible for the health of the squad. She runs the pre-match warm-ups, treats knocks and strains, and designs the recovery plans that bring injured players back safely.\n\nShe also teaches the players simple daily habits that keep them fit through a long season.",
    experience: "9 years",
    speciality: "Injury recovery",
  },
  {
    id: "co-7",
    name: "Matteo Barbieri",
    role: "Youth Development Coach",
    bio: "Runs the Lions school and youth programme and finds the next local stars.",
    profile:
      "Matteo leads the Lions youth programme, working with local schools and junior sessions at the Brescia Cricket Ground. His job is to introduce children to cricket and to find and develop the next generation of Lions.\n\nMany of the club's young players first came to the game through his sessions.",
    experience: "7 years",
    speciality: "Junior coaching",
  },
];
