import type { AboutContent } from "./about.types";

/**
 * What the About Us page and the home page intro say until the admin edits
 * them. Text the admin saves replaces these values field by field.
 */
export const defaultAbout: AboutContent = {
  heading: "About the Lions",
  paragraphs: [
    "Brescia Lions is a professional cricket franchise representing the spirit, pride, and passion of Brescia, Italy, in the inaugural season of the Italia T10 League.",
    "Rooted in the identity of our city and driven by a passion for cricket, Brescia Lions brings together international talent, competitive ambition, and a vision to grow the game in Italy.",
  ],
  image: "/images/sample/37623643.jpg",
  stats: [
    { label: "Founded", value: "2026" },
    { label: "Players", value: "15" },
    { label: "Matches", value: "0" },
    { label: "Wins", value: "0" },
  ],

  history: [
    "Brescia Lions is a professional cricket franchise representing the spirit, pride, and passion of Brescia, Italy, in the inaugural season of the Italia T10 League.",
    "Rooted in the identity of our city and driven by a passion for cricket, Brescia Lions brings together international talent, competitive ambition, and a vision to grow the game in Italy. We aim to create a team that goes beyond the boundary ropes, connecting cricket fans, local communities, and people from diverse backgrounds through the power of sport.",
    "Our vision is to build a competitive and recognisable cricket franchise that represents Brescia with pride, embraces international cricket culture, and contributes to the growth of the sport across Italy and Europe.",
    "With experienced leadership, talented players, and a commitment to excellence, Brescia Lions is ready to begin its journey in the Italia T10 League. Every match is an opportunity to compete, inspire, and build a legacy that our city can call its own.",
  ],
  historyClosing: [
    "For us, Brescia is more than a destination. It is our identity, our inspiration, and the home of our ambitions.",
    "This is Brescia. This is our pride. This is Brescia Lions.",
  ],
  historyImage: "/images/sample/31739439.jpg",

  owner: {
    name: "Mian Asif",
    image: "/images/about/owner-mian-asif.jpg",
    kicker: "Visionary. Entrepreneur. Pioneer.",
    paragraphs: [
      "Mian Asif, Owner of Brescia Lions, is an international entrepreneur with 20+ years of global business experience in the Diamond Estate industry.",
      "Beyond business, he is the man who single-handedly transformed tape-ball cricket from the streets into a structured, professional industry.",
      "What started as a pure passion for tape-ball cricket, has been built into a recognized cricket industry across Pakistan, a name that today stands in front of the entire nation. A complete ecosystem of league, players, grounds and commercial cricket, built single-handedly.",
    ],
    closing: [
      "Now, the same vision comes to Italy.",
      "From Pakistan's tape-ball revolution to Italy's T10 revolution, the journey of building cricket continues with Brescia Lions.",
    ],
    signature: "Mian Asif — Owner of Brescia Lions.",
  },

  crestIntro:
    "Every part of our crest tells a piece of the story. Together they carry the message that sits at the heart of the club: one symbol, one city, one family.",
  crestElements: [
    {
      title: "The Crown",
      subtitle: "We are not here to participate. We are here to rule.",
      text: "The crown is a declaration. It stands for royalty, dominance and championship mentality. Brescia Lions are not just built to compete. We are built to RULE Italia T10.",
    },
    {
      title: "The Lion",
      subtitle: "Gold mane. Green heart. Crowned King.",
      text: "Our lion represents victory with its golden mane and pride for Brescia with its green heart. Fierce, proud, and unbreakable.",
    },
    {
      title: "The Colors",
      text: "DARK GREEN: The pride of Brescia. Deep, rich, powerful.\nGOLD: Victory, ambition and legacy. We shine like champions.\nITALIAN TRICOLOUR: Green, White, Red. Orgoglio d'Italia.",
    },
    {
      title: "The Colosseum & Italian Flag",
      subtitle: "Made in Italy. Made for Italy",
      text: "The Colosseum represents eternal strength and Italian heritage. Paired with the flowing Italian Tricolour in the background, it anchors our identity. Our roots are Italian. Our pride is Italian. Orgoglio d'Italia.",
    },
    {
      title: "Gold Ball & Laurel",
      subtitle: "We play for glory",
      text: "The GOLD cricket ball is our game - premium and precious. The GOLDEN LAUREL wreath comes from ancient Rome, worn by champions. Together they mean we play for legacy, we play to be crowned.",
    },
  ],

  mission:
    "To represent the city of Brescia with pride, grow cricket across Lombardy and give local players, young and old, a place to play, learn and compete at the highest level.",
  vision:
    "To become one of the leading cricket clubs in Italy, known for its community, its talent pathway and an identity that every person in Brescia is proud of.",

};
