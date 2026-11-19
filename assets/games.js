// ---- Games and projects: add or remove entries here ----
// Four lists, each shown as its own section on the games page:
//   GAMES (on Steam, newest first), ITCH_GAMES (itch.io, most popular first),
//   OTHER_GAMES (elsewhere, newest first) and PROJECTS (simulations and research, oldest first).
// featured: true  → also shown on the home page.
// tags: used by the filter buttons on the games page (see TAGS below).
// img: cover image (leave it out to get a drawn placeholder). link: official website, or the store page.

const steamImg = id => `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${id}/header.jpg`;
const steamPage = id => `https://store.steampowered.com/app/${id}/`;

const TAGS = {
  evolution: "evolution",
  genetics: "genetics & breeding",
  brains: "neural networks",
  ecosystem: "ecosystems",
  pets: "virtual creatures",
  emergence: "emergence",
};

const GAMES = [
  // Not released yet: a `date` far in the future keeps them at the top of the list.
  { name: "Bioneers", date: "9999", year: "coming soon", dev: "Azza Apps",
    img: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3833810/128c03b998dfc2ee3c4c599deb1f8444905a4ed9/header.jpg",
    link: steamPage(3833810), tags: ["evolution"],
    text: "A strategy and simulation game in a microworld: build an organism from cells, fend off viruses, and evolve into a predator, a parasite or something else." },
  { name: "Ecosystem Architect", date: "2027", year: "coming 2027", dev: "Exit 1 Studios",
    img: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3542870/dcd10070b001a60e41f35e59a4cfca0abaa8aa99/header.jpg",
    link: "https://exit1studios.com/", tags: ["ecosystem"],
    text: "Design ecosystems with nearly 50 species of plants and animals, shape the land, and balance predators and prey in a science-inspired simulation." },
  { name: "Dwarf Fortress", date: "2022-12-06", year: "2022 on Steam", dev: "Bay 12 Games",
    img: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/975370/34e18f5695fffd64458b78110930abc5258ccd14/header.jpg",
    link: "https://www.bay12games.com/dwarves/", tags: ["emergence", "ecosystem"],
    text: "One of the deepest world simulations ever made: generated histories, creatures and dwarves, and the stories that emerge from them." },
  { name: "Mudborne: Frog Management Sim", date: "2025-03-20", year: "2025", dev: "ellraiser, TNgineers", img: steamImg(2355150),
    link: "https://tngineers.com/mudborne", tags: ["genetics"],
    text: "A cosy nature-management sim about discovering and breeding frogs, using the genetic keys of new species to restore lost populations." },
  { name: "Horsey Game", date: "2026-02-18", year: "2026", dev: "Captain Games",
    img: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3602570/945b3e12201603882fedbbf7abcb5fc3f3ad3fcb/header.jpg",
    link: steamPage(3602570), tags: ["genetics"],
    text: "Collect, breed, race and genetically modify horses, and build a horse paradise (or just get rich)." },
  { name: "ANLIFE: Motion-Learning Life Evolution", date: "2026-02-11", year: "2026", dev: "Attructure Inc.",
    img: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2452130/14bd25aa3453da723396ed9861928ab64b22029c/header.jpg",
    link: "https://anlife.app/", tags: ["evolution", "brains"],
    text: "Block creatures learn to move by themselves in a physics engine, and evolve in unexpected ways." },
  { name: "Planetary Life", date: "2025-08-15", year: "2025", dev: "Sotenbox",
    img: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2471970/2ab5d49405baa35c3c7862f987c276f890719faf/header.jpg",
    link: "https://www.sotenbox.com/planetary-life/", tags: ["evolution", "ecosystem"],
    text: "Shape a planet's climate, add plants and evolve creatures, from single cells to civilisations." },
  { name: "The Bibites", date: "2025-03-04", year: "2025", dev: "Omnia Studios", img: steamImg(2736860),
    link: "https://www.thebibites.com/", tags: ["evolution", "brains", "genetics"], featured: true,
    text: "Little creatures with evolving neural-network brains and genes. You can open them up and read their brains." },
  { name: "Ecosystem", date: "2024-11-08", year: "2024", dev: "Tom Johnson", img: steamImg(1133120),
    link: "https://ecosystem-game.com/", tags: ["evolution", "ecosystem"],
    text: "Lifeforms evolve their bodies and behaviour through a deep simulation of evolution, in a world you shape." },
  { name: "Artificial Life Simulator", date: "2024-04-15", year: "2024", dev: "Cikoria Studio", img: steamImg(2805670),
    link: steamPage(2805670), tags: ["emergence"],
    text: "Lifelike forms appear out of simple attraction and repulsion forces between coloured particles." },
  { name: "Wobbledogs", date: "2022-03-15", year: "2022", dev: "Animal Uprising", img: steamImg(1424330),
    link: "http://www.wobbledogs.com/", tags: ["genetics", "pets"],
    text: "Raise a hive of mutating dogs, physically simulated all the way down to their guts." },
  { name: "Automata Ecosystem", date: "2022-05-30", year: "2022", dev: "Giuseppe La Malfa", img: steamImg(1966940),
    link: steamPage(1966940), tags: ["emergence"],
    text: "A GPU cellular-automata simulation with complex interactions, turned into an audiovisual experience." },
  { name: "Thrive", date: "2021-11-26", year: "2021", dev: "Revolutionary Games Studio",
    img: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1779200/5273442273cffbfef2f30c451d9f2cec91e5e3c6/header.jpg",
    link: "https://revolutionarygamesstudio.com/", tags: ["evolution"],
    text: "An open-source evolution game made by volunteers, starting at the microbe stage." },
  { name: "Dr. Derk's Mutant Battlegrounds", date: "2020-07-28", year: "2020", dev: "Mount Rouke Studios", img: steamImg(1102370),
    link: "https://derkgame.com", tags: ["brains"],
    text: "Train AI creatures that learn by trial and error, then send them into battle." },
  { name: "The Sapling", date: "2019-12-12", year: "2019", dev: "Wessel Stoop", img: steamImg(997380),
    link: "http://thesaplinggame.com", tags: ["evolution", "ecosystem"],
    text: "Design your own plants and animals, or switch on random mutations and let evolution do the designing." },
  { name: "Biotope", date: "2019-07-23", year: "2019", dev: "MBL Development", img: steamImg(549040),
    link: steamPage(549040), tags: ["ecosystem"],
    text: "A detailed aquarium simulator with realistic life cycles of fish and plants." },
  { name: "Aivolution", date: "2019-01-30", year: "2019", dev: "Lykke Studios", img: steamImg(1014990),
    link: steamPage(1014990), tags: ["brains", "evolution"],
    text: "An educational machine-learning game: design creatures and train their AI to beat challenges." },
  { name: "Uagi-Saba", date: "2018-11-30", year: "2018", dev: "Undergroundies", img: steamImg(788390),
    link: "https://undergroundies.net", tags: ["genetics", "pets"],
    text: "Raise and breed magical creatures called Mystics, each with their own genes." },
  { name: "Equilinox", date: "2018-11-23", year: "2018", dev: "ThinMatrix", img: steamImg(853550),
    link: "https://equilinox.com/", tags: ["ecosystem", "genetics"],
    text: "A calm nature sim where you build ecosystems and breed hundreds of plants and animals." },
  { name: "Intelligent Design: An Evolutionary Sandbox", date: "2017-05-12", year: "2017", dev: "Pill Bug Interactive", img: steamImg(627620),
    link: "https://www.pillbug.zone/intelligent-design-an-evolutionary-sandbox/", tags: ["evolution", "ecosystem", "genetics"],
    text: "Polygons eating polygons: an evolution sandbox with truly simulated genetics. Seed a world, walk away, and come back to species nobody designed." },
  { name: "Vilmonic", date: "2018-11-05", year: "2018", dev: "Mark Stramaglia",
    img: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/458330/418581ef82f9f76914efcdcc8370b64ddee2b283/header_alt_assets_0.jpg",
    link: "https://vilmonic.com", tags: ["genetics", "evolution"],
    text: "A genetics and evolution sandbox where pixel-art life forms breed and evolve, and their pixels and colours carry meaning." },
  { name: "Species: ALRE", date: "2018-09-28", year: "2018", dev: "Quasar", img: steamImg(774541),
    link: "http://www.speciesgame.com", tags: ["evolution"], featured: true,
    text: "Artificial Life, Real Evolution. Creatures evolve and split into new species through natural selection." },
  { name: "Eco", date: "2018-02-06", year: "2018", dev: "Strange Loop Games",
    img: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/382310/669bd5d9c8d2469a776d81011670f2889fac86b0/header.jpg",
    link: "https://www.play.eco", tags: ["ecosystem"],
    text: "Players build a civilisation together on a planet with a fully simulated ecosystem, and must advance without destroying it." },
  { name: "Niche", date: "2017-09-21", year: "2017", dev: "Stray Fawn Studio", img: steamImg(440650),
    link: "http://niche-game.com/", tags: ["genetics"],
    text: "A turn-based survival game where you shape a species by breeding, using real genetics." },
  { name: "Rain World", date: "2017-03-28", year: "2017", dev: "Videocult",
    img: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/312520/dc5bd100e86dbdb088e7ff17cdb601e7eb2e00bc/header.jpg",
    link: "https://www.akuparagames.com/game/rain-world/", tags: ["ecosystem"],
    text: "You're a slugcat, predator and prey, in an ecosystem of creatures that each hunt and survive with their own AI." },
  { name: "Gridworld", date: "2015-12-24", year: "2015", dev: "DopplerFrog",
    img: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/396890/6e92a2f06079b867d74d149d8a615cc06f07e945/header.jpg",
    link: steamPage(396890), tags: ["evolution"],
    text: "Creatures evolve through natural selection as they learn to find food, avoid danger and compete." },
  { name: "Spore", date: "2008-12-19", year: "2008", dev: "Maxis", img: steamImg(17390),
    link: "http://www.spore.com/", tags: ["evolution"], featured: true,
    text: "Evolve a creature from a single cell all the way to a space-faring civilisation." },
  { name: "Creatures Docking Station", date: "1996-01-01", year: "series since 1996", dev: "Creature Labs", img: steamImg(1659050),
    link: steamPage(1659050), tags: ["brains", "genetics", "pets"], featured: true,
    text: "Raise Norns, creatures with neural-network brains, biochemistry and genes. You teach them, they breed, and their traits get passed on." },
];

// itch.io: sorted by number of ratings (`ratings`), early-stage projects (`early: true`) last.
// Rule used to pick them: rated 4/5 or more by at least 5 people, and actually about simulated life.
const itchImg = path => `https://img.itch.zone/${path}`;
const ITCH_GAMES = [
  { name: "Evolution", ratings: 1348, dev: "Keiwan", img: itchImg("aW1hZ2UvOTEyMDEvNjExNTExLnBuZw==/315x250%23c/IG4SJI.png"),
    link: "https://keiwan.itch.io/evolution", tags: ["evolution", "brains"],
    text: "Build creatures from bones, joints and muscles, then let them evolve to master tasks like running, jumping and climbing." },
  { name: "Adapt", ratings: 41, dev: "Paul Herve", img: itchImg("aW1nLzgwNjc0NjgucG5n/315x250%23c/tWbxq%2F.png"),
    link: "https://paul-herve.itch.io/adapt-prologue", tags: ["evolution"],
    text: "Evolve to survive in a constantly changing world." },
  { name: "Q-Pop", ratings: 22, dev: "Frunit", img: itchImg("aW1nLzM3OTU1NDAucG5n/315x250%23c/HB9GYV.png"),
    link: "https://frunit.itch.io/q-pop", tags: ["evolution"],
    text: "Develop your species on a foreign planet." },
  { name: "Evol Pedal: Walking Evolution Sim", ratings: 22, dev: "Evol Games", img: itchImg("aW1nLzI3Mzk5MDQuZ2lm/315x250%23c/EuiKVf.gif"),
    link: "https://evolgames.itch.io/evolpedal", tags: ["evolution"],
    text: "A walking evolution simulator: creatures evolve their way to moving forward." },
  { name: "Primordium", ratings: 10, dev: "akinjigames", img: itchImg("aW1nLzMyNDE0NzY1LnBuZw==/315x250%23c/y6%2FKLt.png"),
    link: "https://akinjigames.itch.io/primordium", tags: ["evolution"],
    text: "A Spore-like evolution game where the body you design decides how you live. Free cell-stage demo." },
  { name: "Creational Chaos", ratings: 9, dev: "hookmanuk", img: itchImg("aW1nLzY4NDAxODAucG5n/315x250%23c/dXLaCL.png"),
    link: "https://hookmanuk.itch.io/creational-chaos", tags: ["ecosystem", "evolution", "emergence"],
    text: "An arcade simulation of an emergent, evolving ecosystem." },
  { name: "Cute Mold", ratings: 8, dev: "Erytau", img: itchImg("aW1nLzkzOTI1MDYucG5n/315x250%23c/9EaeVO.png"),
    link: "https://erytau.itch.io/cute-mold", tags: ["evolution", "emergence"],
    text: "A simulation of mould growing and evolving on a grid." },
  { name: "Football Evo", ratings: 7, dev: "buddhaman", img: itchImg("aW1hZ2UvMjIwNzc1LzEwNDIzMDAucG5n/315x250%23c/ZMAs1X.png"),
    link: "https://buddhaman.itch.io/football-evo", tags: ["evolution", "brains"],
    text: "An evolutionary football simulation: players evolve how to play." },
  { name: "Genetic Car Designer", ratings: 7, dev: "Pill Bug Interactive", img: itchImg("aW1nLzk2OTkxNTQuZ2lm/315x250%23c/aDykBo.gif"),
    link: "https://pillbuginteractive.itch.io/genetic-car-designer", tags: ["evolution"],
    text: "Design a car together with a genetic algorithm, and help real scientific research along the way." },
  { name: "Eco Balance", ratings: 7, dev: "Axelstems", img: itchImg("aW1nLzE2NDEyMTIwLnBuZw==/315x250%23c/vWA6Ve.png"),
    link: "https://axelstems.itch.io/ecosystem-shapes", tags: ["ecosystem"],
    text: "A puzzle game where you balance an ecosystem of creatures." },
  { name: "Underfoot Queens", ratings: 7, dev: "Villano", img: itchImg("aW1nLzk4MTA3NzgucG5n/315x250%23c/l5uJxr.png"),
    link: "https://villano.itch.io/underfoot-queens", tags: ["genetics"],
    text: "An ant-themed 4X and simulation game." },
  { name: "Automata Empire", ratings: 6, dev: "Nonadecimal", img: itchImg("aW1hZ2UvNTk3ODEvMjY5OTY4LmdpZg==/315x250%23c/i6bfdt.gif"),
    link: "https://nonadecimal.itch.io/automata-empire", tags: ["emergence"],
    text: "A real-time strategy game built on cellular automata." },
  { name: "Creatures from Enceladus", ratings: 5, dev: "Erytau", img: itchImg("aW1nLzI3NjM4Mjk4LnBuZw==/315x250%23c/%2FZTxVS.png"),
    link: "https://erytau.itch.io/creatures-from-enceladus", tags: ["evolution", "genetics"],
    text: "An artificial selection simulator with silly little creatures." },
  { name: "NeuraQuarium", ratings: 11, dev: "urocyongames", img: "https://img.itch.zone/aW1nLzUzNDI1OTAucG5n/315x250%23c/dGuGXj.png",
    link: "https://urocyongames.itch.io/neuraquarium", tags: ["brains", "evolution"],
    text: "Creatures with neural-network brains evolve in a calm aquatic world." },
  { name: "Evolution sandbox", ratings: 12, dev: "David Birgé-Cotte", img: "https://img.itch.zone/aW1hZ2UvMTcxMzQ5Lzc5NjQ2MC5naWY=/315x250%23c/Tf%2FXLv.gif",
    link: "https://david-birge-cotte.itch.io/evolution-sandbox", tags: ["evolution", "genetics"],
    text: "A browser game about the genetic evolution of simple creatures." },
  { name: "Genomeia", ratings: 6, dev: "genomeia_project", img: "https://img.itch.zone/aW1nLzI3MTQxMzAxLnBuZw==/315x250%23c/mCVZFU.png",
    link: "https://genomeia-project.itch.io/genomeia", tags: ["evolution", "genetics"],
    text: "Design organisms with their own behaviours, then watch them interact, survive and evolve." },
  { name: "NodeSpawn", ratings: 4, dev: "Triple Donut Games", img: "https://img.itch.zone/aW1nLzMwNzkwMzAxLnBuZw==/315x250%23c/wFpVpt.png",
    link: "https://triple-donut-games.itch.io/nodespawn", tags: ["ecosystem", "evolution"],
    text: "Grow your own evolving ecosystem." },
  { name: "GenVo", ratings: 2, dev: "SevenFoldStories", img: "https://img.itch.zone/aW1nLzMyMzMzMDAzLnBuZw==/315x250%23c/CujaSD.png",
    link: "https://sevenfoldstories.itch.io/genvo", tags: ["ecosystem", "evolution"],
    text: "Play as a creature finding its way through a living, changing ecosystem." },
  { name: "Evosim", ratings: 3, dev: "rlomax", img: "https://img.itch.zone/aW1hZ2UvMTcwOTYvMTE0NDE1NS5wbmc=/315x250%23c/sjFz4J.png",
    link: "https://rlomax.itch.io/evosim", tags: ["evolution"],
    text: "An artificial life simulator, or as its maker puts it, an \"evolve 'em up\"." },
  { name: "More Seeds", ratings: 1, dev: "jph wacheski / iterationGAMES", img: "https://img.itch.zone/aW1hZ2UvNzMzMy80MDU5NjYuZ2lm/315x250%23c/n6PKUC.gif",
    link: "https://jph_wacheski.itch.io/more-seeds", tags: ["ecosystem"],
    text: "A small artificial life ecosystem to watch and tend." },
  { name: "bioshader alpha", dev: "bioshader", img: "https://img.itch.zone/aW1nLzI4OTE4NjU1LnBuZw==/315x250%23c/i29ZlL.png",
    link: "https://bioshader.itch.io/bioshader", tags: ["emergence"],
    text: "An experimental life simulation to play with." },
  { name: "Apex", dev: "abbax", img: "https://img.itch.zone/aW1nLzEyMjk5ODc5LmpwZw==/315x250%23c/p1xHh%2B.jpg",
    link: "https://abbax.itch.io/apex", tags: ["ecosystem"],
    text: "A wolf-pack simulation." },
  { name: "Critterding 2", dev: "b0bke", img: "https://img.itch.zone/aW1nLzE1NDc3Nzg3LnBuZw==/315x250%23c/wAWS0i.png",
    link: "https://b0bke.itch.io/critterding-2", tags: ["evolution", "brains"],
    text: "Evolving artificial life: critters with neural-network brains evolve in a 3D world." },
  // Early-stage projects, listed after the rated ones.
  { name: "Survive the System", early: true, year: "in development", dev: "Izva, Kyunsei",
    img: "https://img.itch.zone/aW1nLzI2MzQ2NTExLnBuZw==/original/GTm4Xe.png",
    link: "https://izva.itch.io/survivethesystem", tags: ["ecosystem", "emergence"],
    text: "A survival ecosystem simulation where the challenge is understanding the system's feedback loops, not piling up endless resources." },
  { name: "Econeer", early: true, year: "prototype · 2025", dev: "Double_Gezicht, JimSolux and team",
    img: "https://img.itch.zone/aW1nLzIwNDUzMDk2LnBuZw==/original/7g0Anb.png",
    link: "https://double-gezicht.itch.io/econeer", tags: ["ecosystem"],
    text: "Play a biologist on an island with a dynamic ecosystem: track the animal populations, survive, and see how the island reacts to you." },
];

const OTHER_GAMES = [
  { name: "Cell Lab", date: "2016", year: "Android", dev: "Petter Säterskog",
    img: "https://www.cell-lab.net/pcVersionGallery/genomeEditorStates/editSwimmer.png",
    link: "https://www.cell-lab.net/", tags: ["evolution", "genetics"],
    text: "Design the genomes of cells and grow them into multicellular organisms, then let them compete and evolve." },
  { name: "Orb.Farm", date: "2020", year: "browser game", dev: "orb.farm", img: "https://orb.farm/assets/thumbnail.png",
    link: "https://orb.farm/", tags: ["ecosystem"],
    text: "A falling-sand aquatic ecosystem in your browser: algae, daphnia, bacteria and fish keep a little world in balance." },
  { name: "Black & White", date: "2001", year: "2001", dev: "Lionhead Studios",
    link: "https://en.wikipedia.org/wiki/Black_%26_White_(video_game)", tags: ["brains", "pets"],
    text: "A god game where your giant creature learns from how you treat it, through rewards and punishments." },
  { name: "Seaman", date: "1999", year: "1999", dev: "Vivarium",
    link: "https://en.wikipedia.org/wiki/Seaman_(video_game)", tags: ["pets"],
    text: "A Dreamcast virtual pet: raise a strange fish-like creature through its life cycle and talk to it with a microphone." },
  { name: "Petz", date: "1995", year: "series since 1995", dev: "PF.Magic", img: "https://upload.wikimedia.org/wikipedia/commons/7/79/Petz_logo.png",
    link: "https://en.wikipedia.org/wiki/Petz", tags: ["pets", "genetics"],
    text: "Adopt, raise and breed virtual dogs and cats, one of the first virtual-pet series on home computers." },
];

const PROJECTS = [
  { name: "Conway's Game of Life", date: "1970", year: "1970", dev: "John Horton Conway",
    img: "https://upload.wikimedia.org/wikipedia/commons/e/e5/Gospers_glider_gun.gif",
    link: "https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life", tags: ["emergence"],
    text: "Four rules on a grid of cells. A zero-player game, and the starting point for countless ALife experiments." },
  { name: "Tierra", date: "1991", year: "early 1990s", dev: "Thomas S. Ray",
    img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7c/Tierra.png/330px-Tierra.png",
    link: "https://en.wikipedia.org/wiki/Tierra_(computer_simulation)", tags: ["evolution"],
    text: "Computer programs compete for processor time and memory, mutate, and evolve like organisms." },
  { name: "SimLife", date: "1992", year: "1992", dev: "Maxis",
    link: "https://en.wikipedia.org/wiki/SimLife", tags: ["ecosystem", "genetics"],
    text: "\"The Genetic Playground\": simulate an ecosystem and edit the genetics of its plants and animals." },
  { name: "Avida", date: "1993", year: "1990s", dev: "Digital Evolution Lab, Michigan State University",
    img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/14/Avida_2.6_screenshot.png/330px-Avida_2.6_screenshot.png",
    link: "https://en.wikipedia.org/wiki/Avida_(software)", tags: ["evolution"],
    text: "A research platform where self-replicating programs evolve, used to study evolutionary biology." },
  { name: "Framsticks", date: "1996", year: "1996", dev: "Maciej Komosiński, Szymon Ulatowski",
    link: "https://www.framsticks.com/", tags: ["evolution", "brains"],
    text: "3D simulation and evolution of creatures built from sticks, with neural networks for control." },
  { name: "Lenia", date: "2018", year: "2018", dev: "Bert Chan",
    link: "https://chakazul.github.io/lenia.html", tags: ["emergence"],
    text: "A continuous cellular automaton full of smooth, strangely alive-looking creatures." },
  { name: "Growing Neural Cellular Automata", date: "2020", year: "2020", dev: "Mordvintsev, Randazzo, Niklasson, Levin",
    img: "https://distill.pub/2020/growing-ca/thumbnail.jpg",
    link: "https://distill.pub/2020/growing-ca/", tags: ["emergence", "brains"],
    text: "Cells with a tiny neural network learn to grow into a shape, and regrow it when damaged. An interactive article." },
  { name: "The Life Engine", date: "2021", year: "browser", dev: "Max Robinson (Emergent Garden)",
    link: "https://thelifeengine.net/", tags: ["evolution"],
    text: "Organisms built from cells evolve in a grid world, right in your browser." },
  { name: "ALIEN", date: "2022", year: "open source", dev: "Christian Heinemann",
    img: "https://repository-images.githubusercontent.com/305438235/917c5c8e-5485-43d8-90f4-6aecc0be8d19",
    link: "https://www.alien-project.org/index.html", tags: ["evolution", "emergence"],
    text: "Artificial Life Environment: a GPU-powered simulation where huge numbers of particle-based organisms evolve." },
  { name: "Biogenesis", date: "2023", year: "open source", dev: "MarcoDBAA (itch.io)",
    img: "https://img.itch.zone/aW1nLzc3NDgxMTUucG5n/315x250%23c/PxCZF%2F.png",
    link: "https://marcodbaa.itch.io/biogenesis", tags: ["evolution"],
    text: "A classic artificial life program that simulates the processes behind the evolution of organisms." },
  { name: "Particle Life", date: "2024", year: "browser", dev: "alex (itch.io)",
    img: "https://img.itch.zone/aW1nLzI4NDQwNTAyLnBuZw==/315x250%23c/5acPGx.png",
    link: "https://lx-0.itch.io/particle-life", tags: ["emergence"],
    text: "Tens of thousands of particles and one asymmetric rule matrix: cells, worms and chasers emerge." },
];

// Related: famous games that touch on artificial life ideas without really being ALife.
// `why` explains the connection (shown instead of a normal description).
const RELATED = [
  { name: "Spore", year: "2008", dev: "Maxis", img: steamImg(17390),
    link: "http://www.spore.com/", tags: ["evolution"],
    text: "Also in the Steam list. The game most people think of for \"evolve a creature\", although you design each creature yourself: natural selection doesn't decide anything." },
  { name: "The Sims", year: "series since 2000", dev: "Maxis", img: steamImg(1222670),
    link: "https://en.wikipedia.org/wiki/The_Sims", tags: ["emergence"],
    text: "Autonomous characters driven by their own needs, and lots of unscripted stories that emerge from them. Close to agent-based simulation, but nothing evolves, adapts or learns across generations." },
  { name: "Pokémon", year: "series since 1996", dev: "Game Freak",
    link: "https://en.wikipedia.org/wiki/Pok%C3%A9mon", tags: ["genetics", "pets"],
    text: "Creature collecting with breeding that passes hidden stats to offspring, and creatures that \"evolve\". A huge influence on creature games, but there's no simulated life or ecosystem behind it." },
];

// ---- ALife score ----
// A rough, editorial estimate of how much artificial life a game simulates. Not a quality rating.
// Six criteria, each 0, 1 or 2 (total out of 12), in this order:
const SCORE_CRITERIA = [
  ["autonomy", "creatures act on their own drives, not on the player's orders"],
  ["brains", "behaviour comes from neural networks or learning rather than scripts"],
  ["body", "body organisation (1 = traits like size, colour or parts vary, 2 = body plans built from parts that can be redesigned or evolve)"],
  ["evolution", "traits are inherited with variation (1 = the player chooses, 2 = natural selection decides)"],
  ["ecosystem", "species and resources depend on each other, with feedback"],
  ["emergence", "outcomes and stories that nobody scripted"],
];
// name: [autonomy, brains, body, evolution, ecosystem, emergence, "why"]
const SCORES = {
  "The Bibites":                     [2, 2, 1, 2, 1, 2, "evolving neural brains and genes under natural selection"],
  "Ecosystem":                       [2, 2, 2, 2, 1, 2, "bodies and behaviour evolve by natural selection"],
  "Vilmonic":                        [2, 1, 2, 2, 2, 2, "genome-driven creatures evolving in a full ecosystem"],
  "Species: ALRE":                   [2, 1, 2, 2, 2, 2, "natural selection and speciation in a simulated ecosystem"],
  "Creatures Docking Station":       [2, 2, 1, 1, 1, 2, "learning neural-network brains and biochemistry; breeding mostly guided by you"],
  "Gridworld":                       [2, 2, 0, 2, 1, 1, "creatures evolve their behaviour through natural selection"],
  "The Sapling":                     [1, 0, 2, 2, 2, 2, "plants and animals mutate and evolve in a shared world"],
  "ANLIFE: Motion-Learning Life Evolution": [1, 2, 2, 2, 0, 1, "bodies learn to move and evolve; no ecosystem"],
  "Dr. Derk's Mutant Battlegrounds": [2, 2, 1, 1, 0, 1, "creatures learn by neuroevolution that you guide"],
  "Rain World":                      [2, 0, 0, 0, 2, 2, "AI creatures hunt and flee in a living ecosystem; nothing evolves"],
  "Planetary Life":                  [1, 0, 1, 1, 2, 1, "planet-scale ecosystems; evolution mostly guided by you"],
  "Thrive":                          [1, 0, 2, 1, 2, 1, "population simulation and evolving rival species; yours is designed in an editor"],
  "Equilinox":                       [1, 0, 1, 1, 2, 1, "build ecosystems and breed new species yourself"],
  "Uagi-Saba":                       [2, 1, 1, 1, 0, 1, "creatures with genes and their own behaviour; breeding chosen by you"],
  "Ecosystem Architect":             [2, 0, 0, 0, 2, 1, "living food webs, but no evolution"],
  "Dwarf Fortress":                  [2, 0, 1, 0, 1, 2, "a huge emergent world; creatures don't evolve"],
  "Eco":                             [1, 0, 0, 0, 2, 2, "a full simulated ecosystem that players can collapse; nothing evolves"],
  "Wobbledogs":                      [2, 0, 2, 1, 0, 1, "dogs live their own lives; they mutate through the food you choose"],
  "Biotope":                         [1, 0, 0, 0, 2, 1, "realistic aquarium life cycles; no evolution"],
  "Aivolution":                      [1, 2, 1, 1, 0, 0, "train creature AI for set challenges"],
  "Bioneers":                        [0, 0, 2, 1, 1, 1, "you build and steer one organism; mutations are unlocked, not selected"],
  "Mudborne: Frog Management Sim":   [1, 0, 1, 1, 1, 0, "frog breeding with genetics, driven by you"],
  "Artificial Life Simulator":       [0, 0, 1, 0, 1, 2, "pure emergence from particle forces"],
  "Automata Ecosystem":              [0, 0, 0, 0, 1, 2, "pure emergence from cellular automata"],
  "Niche":                           [0, 0, 1, 1, 1, 1, "real genetics, but you control and breed every animal"],
  "Spore":                           [1, 0, 2, 1, 1, 0, "you design each creature; no natural selection"],
  // itch.io
  "Evolution":                       [1, 2, 2, 2, 0, 1, "you build bodies from bones and muscles; their brains evolve to master tasks"],
  "Adapt":                           [0, 0, 1, 1, 1, 1, "your creature evolves to survive a changing world"],
  "Q-Pop":                           [1, 0, 1, 1, 1, 1, "develop a species on a foreign planet"],
  "Evol Pedal: Walking Evolution Sim": [1, 1, 2, 2, 0, 1, "walkers evolve their bodies and gaits"],
  "Evolution sandbox":               [1, 0, 1, 2, 1, 1, "simple creatures evolve by natural selection"],
  "NeuraQuarium":                    [2, 2, 1, 2, 1, 1, "neural-network creatures evolve in an aquarium"],
  "Primordium":                      [1, 0, 2, 1, 1, 0, "Spore-like: the body you design decides how you live"],
  "Creational Chaos":                [2, 0, 1, 2, 2, 2, "an emergent, evolving ecosystem"],
  "Cute Mold":                       [0, 0, 1, 2, 1, 2, "mould grows and evolves on a grid"],
  "Football Evo":                    [2, 2, 0, 2, 0, 1, "players evolve how to play football"],
  "Genetic Car Designer":            [0, 0, 2, 2, 0, 0, "a genetic algorithm evolves car designs with you"],
  "Eco Balance":                     [1, 0, 0, 0, 2, 1, "a puzzle about balancing an ecosystem"],
  "Underfoot Queens":                [1, 0, 1, 1, 1, 1, "an ant-colony strategy and simulation game"],
  "Automata Empire":                 [0, 0, 0, 0, 0, 2, "strategy built on cellular automata"],
  "Genomeia":                        [2, 1, 2, 2, 1, 2, "design organisms, then watch them survive and evolve"],
  "Creatures from Enceladus":        [1, 0, 1, 1, 0, 0, "artificial selection: you pick who breeds"],
  "NodeSpawn":                       [1, 0, 1, 2, 2, 1, "an evolving ecosystem you grow"],
  "Evosim":                          [2, 1, 1, 2, 1, 1, "an artificial life simulator where creatures evolve"],
  "GenVo":                           [1, 0, 1, 1, 2, 1, "you play one creature in a living, changing ecosystem"],
  "More Seeds":                      [1, 0, 1, 1, 2, 1, "a small artificial life ecosystem"],
  "bioshader alpha":                 [0, 0, 0, 0, 0, 2, "an experimental life simulation"],
  "Apex":                            [2, 0, 0, 0, 1, 1, "a wolf-pack simulation"],
  "Critterding 2":                   [2, 2, 2, 2, 1, 2, "critters evolve bodies and neural-network brains in 3D"],
  "Survive the System":              [2, 0, 1, 1, 2, 2, "survival inside an ecosystem built on feedback loops"],
  "Econeer":                         [1, 0, 0, 0, 2, 1, "track animal populations on an island that reacts to you"],
  // Elsewhere
  "Orb.Farm":                        [1, 0, 0, 0, 2, 2, "a small aquatic ecosystem kept in balance; nothing evolves"],
  "Cell Lab":                        [1, 0, 2, 2, 1, 2, "design cell genomes that grow into organisms, then let them evolve"],
  "Black & White":                   [2, 2, 0, 0, 0, 2, "your creature learns from rewards and punishments"],
  "Seaman":                          [2, 1, 1, 0, 0, 1, "a virtual pet that grows through a life cycle and talks back"],
  "Petz":                            [2, 1, 1, 1, 0, 1, "virtual pets with lifelike behaviour and breeding"],
  // Projects
  "Conway's Game of Life":           [0, 0, 0, 0, 0, 2, "four rules, endless emergent patterns"],
  "Tierra":                          [1, 0, 0, 2, 1, 2, "self-replicating programs evolve and compete"],
  "SimLife":                         [1, 0, 1, 2, 2, 1, "an ecosystem where you edit the genetics of plants and animals"],
  "Avida":                           [1, 0, 0, 2, 1, 2, "digital organisms evolve, used for research"],
  "Framsticks":                      [2, 2, 2, 2, 1, 2, "stick creatures evolve bodies and neural control in 3D"],
  "Lenia":                           [0, 0, 1, 0, 0, 2, "lifelike creatures emerge from a continuous automaton"],
  "Growing Neural Cellular Automata": [0, 2, 2, 0, 0, 2, "cells learn to grow and regrow a shape"],
  "The Life Engine":                 [2, 0, 2, 2, 1, 2, "cell-built organisms evolve in a grid world"],
  "ALIEN":                           [2, 1, 2, 2, 2, 2, "particle-based organisms evolve in a large GPU world"],
  "Biogenesis":                      [1, 0, 2, 2, 1, 2, "a classic simulation of organisms evolving"],
  "Particle Life":                   [0, 0, 1, 0, 0, 2, "lifelike forms emerge from particle rules"],
  // Related
  "The Sims":                        [2, 0, 1, 1, 0, 2, "autonomous agents with needs; children inherit some traits"],
  "Pokémon":                         [0, 0, 1, 1, 0, 0, "breeding passes on hidden stats; no simulated life"],
  "Intelligent Design: An Evolutionary Sandbox": [2, 0, 2, 2, 2, 2, "simulated genetics: species appear, boom, bust and go extinct on their own"],
  "Horsey Game":                     [2, 0, 1, 2, 1, 1, "wild horses breed and mutate on their own, with a predator–prey system (even if it can collapse)"],
};

// ---- Popularity: Steam review counts (from the Steam store, November 2026) ----
// itch.io games use their own rating counts (`ratings`) instead.
const STEAM_REVIEWS = {
  "Horsey Game": 3127, "ANLIFE: Motion-Learning Life Evolution": 169, "Planetary Life": 956,
  "Mudborne: Frog Management Sim": 1020, "The Bibites": 229, "Ecosystem": 612, "Artificial Life Simulator": 9,
  "Dwarf Fortress": 29471, "Automata Ecosystem": 4, "Wobbledogs": 13973, "Thrive": 1735,
  "Dr. Derk's Mutant Battlegrounds": 19, "The Sapling": 1994, "Biotope": 183, "Aivolution": 16, "Uagi-Saba": 13,
  "Equilinox": 2609, "Vilmonic": 68, "Species: ALRE": 976, "Eco": 11420, "Niche": 4363, "Rain World": 48112,
  "Gridworld": 239, "Spore": 67441, "Creatures Docking Station": 219, "Intelligent Design: An Evolutionary Sandbox": 98,
};

for (const [platform, list] of [["steam", GAMES], ["itch", ITCH_GAMES], ["other", OTHER_GAMES], ["project", PROJECTS], ["related", RELATED]]) {
  for (const g of list) {
    g.platform = platform;
    const s = SCORES[g.name];
    if (s) { g.score = s.slice(0, 6); g.scoreWhy = s[6]; g.scoreTotal = s.slice(0, 6).reduce((a, b) => a + b, 0); }
    g.popularity = platform === "steam" ? STEAM_REVIEWS[g.name] : g.ratings;
  }
}

GAMES.sort((a, b) => b.date.localeCompare(a.date));
ITCH_GAMES.sort((a, b) => (a.early ? 1 : 0) - (b.early ? 1 : 0) || (b.ratings ?? -1) - (a.ratings ?? -1));
OTHER_GAMES.sort((a, b) => b.date.localeCompare(a.date));
PROJECTS.sort((a, b) => a.date.localeCompare(b.date));

const ALL_GAMES = [...GAMES, ...ITCH_GAMES, ...OTHER_GAMES];

function gameCard(g) {
  const meta = [g.year, g.dev].filter(Boolean).join(" · ");
  const pic = g.img
    ? `<img src="${g.img}" alt="${g.name}" loading="lazy" width="460" height="215">`
    : `<span class="ph" aria-hidden="true"><span>${g.name}</span></span>`;
  return `
    <li>
      <a class="shot" href="${g.link}" target="_blank" rel="noopener">${pic}</a>
      <p class="meta">${meta}</p>
      <h3><a href="${g.link}" target="_blank" rel="noopener">${g.name}</a></h3>
      <p>${g.text}</p>
      ${g.score ? scoreBlock(g) : ""}
      ${g.tags && g.tags.length ? `<p class="tags">${g.tags.map(t => TAGS[t]).join(" · ")}</p>` : ""}
    </li>`;
}

// "ALife score 10/12" plus one pair of pips per criterion (hover for the breakdown).
function scoreBlock(g) {
  const detail = SCORE_CRITERIA.map(([k], i) => `${k} ${g.score[i]}/2`).join(", ");
  const pips = g.score.map((v, i) =>
    `<span class="pip-pair" title="${SCORE_CRITERIA[i][0]}: ${v}/2">${[0, 1].map(j => `<i class="${j < v ? "on" : ""}"></i>`).join("")}</span>`
  ).join("");
  return `<div class="score" title="${detail}">
      <span class="score-num">ALife score <b>${g.scoreTotal}</b>/12</span>
      <span class="pips" aria-hidden="true">${pips}</span>
      <span class="score-why">${g.scoreWhy}</span>
    </div>`;
}

// Home page: featured games only.
const featuredEl = document.getElementById("featured-games");
if (featuredEl) {
  featuredEl.innerHTML = ALL_GAMES.filter(g => g.featured).map(gameCard).join("");
  document.querySelectorAll(".js-game-count").forEach(el => { el.textContent = ALL_GAMES.length; });
}

// Games page: one block per list, all filtered by the same tag buttons.
const filtersEl = document.getElementById("filters");
if (filtersEl) {
  const groups = [
    ["steam-games", GAMES], ["itch-games", ITCH_GAMES], ["other-games", OTHER_GAMES], ["projects", PROJECTS], ["related", RELATED],
  ];
  let current = "all";
  let steamOrder = "newest";
  const sortEl = document.getElementById("sort");
  const render = () => {
    for (const [id, items] of groups) {
      let list = current === "all" ? items : items.filter(g => (g.tags || []).includes(current));
      if (steamOrder === "score")
        list = [...list].sort((a, b) => (b.scoreTotal ?? -1) - (a.scoreTotal ?? -1) || (b.date || "").localeCompare(a.date || ""));
      document.getElementById(id).innerHTML = list.length
        ? list.map(gameCard).join("")
        : `<li class="empty">Nothing here for "${TAGS[current]}".</li>`;
      document.querySelectorAll(`[data-count="${id}"]`).forEach(el => { el.textContent = list.length; });
    }
    filtersEl.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", b.dataset.tag === current));
    if (sortEl) sortEl.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", b.dataset.order === steamOrder));
  };
  if (sortEl) sortEl.addEventListener("click", e => {
    const b = e.target.closest("button");
    if (b) { steamOrder = b.dataset.order; render(); }
  });
  // The "how the score works" list on the games page.
  const criteriaEl = document.getElementById("score-criteria");
  if (criteriaEl) criteriaEl.innerHTML = SCORE_CRITERIA.map(([k, d]) => `<li><b>${k}</b>: ${d}</li>`).join("");
  filtersEl.innerHTML = [["all", "all"], ...Object.entries(TAGS)]
    .map(([key, label]) => `<button type="button" data-tag="${key}">${label}</button>`).join("");
  filtersEl.addEventListener("click", e => {
    const b = e.target.closest("button");
    if (b) { current = b.dataset.tag; render(); }
  });
  render();
}
