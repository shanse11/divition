/**
 * Imports the complete public-domain RWS printable PDF from the documented
 * fallback source. It verifies the 13-page/78-image structure and maps every
 * embedded card explicitly before writing local WebP files and a manifest.
 */
import { execFile } from "node:child_process";
import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { promisify } from "node:util";

const exec = promisify(execFile);
const sourceUrl =
  "https://onyourjourney.co.uk/wp-content/uploads/2023/01/Rider-Waite-Tarot-Cards-Printable.pdf";
const sourcePage =
  "https://onyourjourney.co.uk/free-printable-tarot-cards-deck-with-all-78-cards/";
const outputDir = "public/tarot/rws";
const workDir = "/tmp/astral-oracle-rws-pdf";
const pdf = `${workDir}/rws.pdf`;

const ids = [
  "major-6",
  "pentacles-5",
  "major-14",
  "major-4",
  "major-3",
  "pentacles-10",
  "major-19",
  "pentacles-13",
  "swords-3",
  "swords-1",
  "pentacles-4",
  "pentacles-11",
  "pentacles-2",
  "swords-7",
  "wands-1",
  "pentacles-1",
  "major-12",
  "major-9",
  "cups-5",
  "pentacles-8",
  "pentacles-12",
  "wands-2",
  "major-8",
  "swords-4",
  "cups-11",
  "cups-12",
  "swords-2",
  "swords-10",
  "cups-1",
  "swords-13",
  "wands-11",
  "swords-6",
  "wands-4",
  "pentacles-6",
  "wands-3",
  "wands-8",
  "swords-9",
  "cups-8",
  "cups-9",
  "major-0",
  "major-15",
  "major-16",
  "swords-11",
  "major-1",
  "pentacles-7",
  "cups-10",
  "swords-8",
  "cups-2",
  "swords-12",
  "swords-14",
  "swords-5",
  "cups-14",
  "wands-5",
  "wands-7",
  "pentacles-9",
  "major-18",
  "wands-12",
  "wands-6",
  "cups-7",
  "major-2",
  "pentacles-14",
  "major-7",
  "major-17",
  "wands-10",
  "pentacles-3",
  "cups-3",
  "cups-13",
  "major-10",
  "major-13",
  "cups-4",
  "cups-6",
  "major-21",
  "wands-14",
  "major-5",
  "wands-13",
  "wands-9",
  "major-11",
  "major-20",
];

async function main() {
  if (new Set(ids).size !== 78)
    throw new Error("Card ID mapping is incomplete or duplicated");
  await mkdir(workDir, { recursive: true });
  await mkdir(outputDir, { recursive: true });
  await exec("curl", [
    "--fail",
    "--location",
    "--silent",
    "--show-error",
    "--retry",
    "2",
    sourceUrl,
    "-o",
    pdf,
  ]);
  const { stdout: info } = await exec("pdfinfo", [pdf]);
  if (!/^Pages:\s+13$/m.test(info))
    throw new Error("Expected a 13-page source PDF");
  const prefix = `${workDir}/card`;
  await exec("pdfimages", ["-png", pdf, prefix]);
  const images = (await readdir(workDir))
    .filter((file) => /^card-\d{3}\.png$/.test(file))
    .sort();
  if (images.length !== 78)
    throw new Error(
      `Expected 78 embedded card images, received ${images.length}`,
    );
  await Promise.all(
    images.map(async (image, index) => {
      await exec("cwebp", [
        "-quiet",
        "-q",
        "88",
        `${workDir}/${image}`,
        "-o",
        `${outputDir}/${ids[index]}.webp`,
      ]);
    }),
  );
  const assets = ids
    .slice()
    .sort()
    .map((cardId) => ({
      cardId,
      sourceUrl: sourcePage,
      downloadUrl: sourceUrl,
      license: "Public domain (source statement; original 1909 RWS art)",
      attribution: "Pamela Colman Smith; Arthur Edward Waite",
      verified: true,
      notes:
        "Imported from the source PDF after verifying 13 pages and 78 embedded cards; stored without upscaling as local WebP.",
    }));
  await writeFile(
    `${outputDir}/manifest.json`,
    `${JSON.stringify({ sourcePage, sourceUrl, assets }, null, 2)}\n`,
  );
  await rm(workDir, { recursive: true, force: true });
  console.log(`Imported ${assets.length} verified RWS cards.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
