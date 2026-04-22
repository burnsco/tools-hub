import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const MEMES_DIR = path.join(process.cwd(), "public", "memes");
const DATA_FILE = path.join(process.cwd(), "src", "data", "memes.json");

async function downloadMemes() {
  console.log("Fetching memes from Imgflip...");
  const response = await fetch("https://api.imgflip.com/get_memes");
  const data = await response.json();

  if (!data.success) {
    console.error("Failed to fetch memes");
    return;
  }

  const memes = data.data.memes.slice(0, 100);

  if (!fs.existsSync(MEMES_DIR)) {
    fs.mkdirSync(MEMES_DIR, { recursive: true });
  }

  if (!fs.existsSync(path.dirname(DATA_FILE))) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  }

  const localMemes = [];

  for (const meme of memes) {
    const fileName = `${meme.id}.webp`;
    const filePath = path.join(MEMES_DIR, fileName);
    const localUrl = `/memes/${fileName}`;

    console.log(`Downloading ${meme.name}...`);
    try {
      const imgRes = await fetch(meme.url);
      const buffer = await imgRes.arrayBuffer();
      await sharp(Buffer.from(buffer)).webp({ quality: 82 }).toFile(filePath);

      localMemes.push({
        ...meme,
        localUrl,
      });
    } catch (err) {
      console.error(`Failed to download ${meme.name}:`, err);
    }
  }

  fs.writeFileSync(DATA_FILE, JSON.stringify(localMemes, null, 2));
  console.log(`Done! Downloaded ${localMemes.length} memes.`);
}

downloadMemes();
