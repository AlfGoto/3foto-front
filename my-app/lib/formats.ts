const MAX_SIZE = 100 * 1024 * 1024; // 100MB per image

const TARGET_HEIGHT = 720;

const STANDARD_FORMATS = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/bmp",
  "image/tiff",
];

const RAW_EXTENSIONS = [
  // "3fr", // Hasselblad
  // "ari", // Arri Alexa
  // "arw",
  // "srf",
  // "sr2", // Sony
  // "bay", // Casio
  // "braw", // Blackmagic
  // "cri", // Cintel
  // "crw",
  "cr2",
  "cr3", // Canon
  // "cap",
  // "iiq",
  // "eip", // Phase One
  // "dng", // Adobe
  // "erf", // Epson
  // "fff", // Hasselblad
  // "mef", // Mamiya
  // "mrw", // Minolta
  // "nef",
  // "nrw", // Nikon
  // "orf", // Olympus
  // "pef",
  // "ptx", // Pentax
  // "raf", // Fujifilm
  // "raw",
  // "rw2", // Panasonic
  // "rwl",
  // "dng", // Leica
  // "x3f", // Sigma
];

export { RAW_EXTENSIONS, STANDARD_FORMATS, MAX_SIZE, TARGET_HEIGHT };
