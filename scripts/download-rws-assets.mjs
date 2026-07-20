/**
 * Fetch the verified 78-file RWS public-domain collection from Wikimedia
 * Commons, resize it for the web, and emit a provenance manifest. Run with:
 * node scripts/download-rws-assets.mjs
 */
import { execFile } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { promisify } from "node:util";

const exec = promisify(execFile);
const outputDir = "public/tarot/rws";
const category = "Category:Rider-Waite-Smith_tarot_deck_(Geldard)";
const endpoint = new URL("https://commons.wikimedia.org/w/api.php");
endpoint.search = new URLSearchParams({
  action: "query",
  format: "json",
  generator: "categorymembers",
  gcmtitle: category,
  gcmtype: "file",
  gcmlimit: "100",
  prop: "imageinfo",
  iiprop: "url|extmetadata|size",
}).toString();

const majorNames = [
  "The Fool",
  "The Magician",
  "The High Priestess",
  "The Empress",
  "The Emperor",
  "The Hierophant",
  "The Lovers",
  "The Chariot",
  "Strength",
  "The Hermit",
  "Wheel of Fortune",
  "Justice",
  "The Hanged Man",
  "Death",
  "Temperance",
  "The Devil",
  "The Tower",
  "The Star",
  "The Moon",
  "The Sun",
  "Judgement",
  "The World",
];
const suits = ["Wands", "Cups", "Swords", "Pentacles"];
const rankNames = [
  ["Ace", "One"],
  ["Two"],
  ["Three"],
  ["Four"],
  ["Five"],
  ["Six"],
  ["Seven"],
  ["Eight"],
  ["Nine"],
  ["Ten"],
  ["Page"],
  ["Knight"],
  ["Queen"],
  ["King"],
];

function idForTitle(title) {
  const plain = title
    .replace(/^File:/, "")
    .replace(/ \(Rider-Waite Smith tarot deck\)\.png$/, "");
  const major = majorNames.indexOf(plain);
  if (major >= 0) return `major-${major}`;
  for (const suit of suits) {
    if (!plain.endsWith(` of ${suit}`)) continue;
    const rank = rankNames.findIndex((names) =>
      names.includes(plain.replace(` of ${suit}`, "")),
    );
    if (rank >= 0) return `${suit.toLowerCase()}-${rank + 1}`;
  }
  return null;
}

async function main() {
  const metadataPath = "/tmp/rws-commons-metadata.json";
  await exec("curl", [
    "--fail",
    "--location",
    "--silent",
    "--show-error",
    "--retry",
    "2",
    "--connect-timeout",
    "15",
    endpoint.toString(),
    "-o",
    metadataPath,
  ]);
  const data = JSON.parse(await readFile(metadataPath, "utf8"));
  const pages = Object.values(data.query?.pages ?? {});
  const assets = pages.map((page) => {
    const info = page.imageinfo?.[0];
    const id = idForTitle(page.title);
    if (
      !id ||
      !info ||
      info.extmetadata?.LicenseShortName?.value !== "Public domain"
    ) {
      throw new Error(`Unverified or unmapped Commons file: ${page.title}`);
    }
    return {
      cardId: id,
      name: page.title
        .replace(/^File:/, "")
        .replace(/ \(Rider-Waite Smith tarot deck\)\.png$/, ""),
      sourceUrl: info.descriptionurl,
      downloadUrl: info.url,
      license: info.extmetadata.LicenseShortName.value,
      attribution: "",
      width: info.width,
      height: info.height,
      verified: true,
      notes:
        "Wikimedia Commons category metadata verified as Public domain; resized to 420px-wide WebP for this app.",
    };
  });
  const expected = new Set([
    ...majorNames.map((_, index) => `major-${index}`),
    ...suits.flatMap((suit) =>
      rankNames.map((_, index) => `${suit.toLowerCase()}-${index + 1}`),
    ),
  ]);
  if (
    assets.length !== 78 ||
    new Set(assets.map((asset) => asset.cardId)).size !== 78 ||
    !assets.every((asset) => expected.has(asset.cardId))
  ) {
    throw new Error(
      `Expected 78 unique verified card IDs, received ${assets.length}`,
    );
  }
  await mkdir(outputDir, { recursive: true });
  const queue = [...assets];
  async function worker() {
    while (queue.length) {
      const asset = queue.pop();
      if (asset) await downloadAndConvert(asset);
    }
  }
  async function downloadAndConvert(asset) {
    const png = `/tmp/${asset.cardId}.png`;
    const webp = `${outputDir}/${asset.cardId}.webp`;
    await exec("curl", [
      "--fail",
      "--location",
      "--silent",
      "--show-error",
      "--retry",
      "2",
      "--connect-timeout",
      "15",
      asset.downloadUrl,
      "-o",
      png,
    ]);
    try {
      await exec("cwebp", [
        "-quiet",
        "-resize",
        "420",
        "0",
        "-q",
        "82",
        png,
        "-o",
        webp,
      ]);
    } finally {
      await rm(png, { force: true });
    }
  }
  await Promise.all(Array.from({ length: 4 }, worker));
  assets.sort((a, b) => a.cardId.localeCompare(b.cardId, "en"));
  await writeFile(
    `${outputDir}/manifest.json`,
    `${JSON.stringify({ category, assets }, null, 2)}\n`,
  );
  console.log(
    `Verified and wrote ${assets.length} public-domain RWS WebP assets.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
