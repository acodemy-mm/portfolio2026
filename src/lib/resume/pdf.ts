import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import { formatExperienceRange } from "@/lib/dates";
import type { Education, Experience, SiteSettings, Skill } from "@/lib/types";

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 54;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const BLACK = rgb(0.12, 0.12, 0.12);
const MUTED = rgb(0.32, 0.32, 0.32);
const RULE = rgb(0.78, 0.78, 0.78);

function toWinAnsi(value: string) {
  return value
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/\u00A0/g, " ")
    .replace(/[^\u0009\u000A\u000D\u0020-\u007E\u00A0-\u00FF]/g, "");
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number) {
  const words = toWinAnsi(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) <= maxWidth) {
      current = next;
      continue;
    }
    if (current) lines.push(current);
    if (font.widthOfTextAtSize(word, size) <= maxWidth) {
      current = word;
    } else {
      let chunk = "";
      for (const char of word) {
        const trial = chunk + char;
        if (font.widthOfTextAtSize(trial, size) <= maxWidth) {
          chunk = trial;
        } else {
          if (chunk) lines.push(chunk);
          chunk = char;
        }
      }
      current = chunk;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export function resumeFileName(name: string) {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${slug || "resume"}-resume.pdf`;
}

export async function buildResumePdf({
  settings,
  experiences,
  skills,
  education,
}: {
  settings: SiteSettings;
  experiences: Experience[];
  skills: Skill[];
  education: Education[];
}) {
  const doc = await PDFDocument.create();
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  let page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  const ensureSpace = (needed: number) => {
    if (y - needed >= MARGIN) return;
    page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    y = PAGE_HEIGHT - MARGIN;
  };

  const drawLines = (
    lines: string[],
    font: PDFFont,
    size: number,
    color: typeof BLACK,
    leading: number,
  ) => {
    for (const line of lines) {
      ensureSpace(leading);
      page.drawText(line, { x: MARGIN, y, size, font, color });
      y -= leading;
    }
  };

  const sectionTitle = (title: string) => {
    ensureSpace(28);
    y -= 10;
    page.drawText(title.toUpperCase(), {
      x: MARGIN,
      y,
      size: 11,
      font: bold,
      color: BLACK,
    });
    y -= 6;
    page.drawLine({
      start: { x: MARGIN, y },
      end: { x: PAGE_WIDTH - MARGIN, y },
      thickness: 0.75,
      color: RULE,
    });
    y -= 14;
  };

  const name = toWinAnsi(settings.name);
  page.drawText(name, { x: MARGIN, y, size: 22, font: bold, color: BLACK });
  y -= 18;

  if (settings.role) {
    page.drawText(toWinAnsi(settings.role), {
      x: MARGIN,
      y,
      size: 12,
      font: regular,
      color: MUTED,
    });
    y -= 16;
  }

  const contact = [
    settings.email,
    settings.location,
    ...settings.socials.map((s) => `${s.label}: ${s.url}`),
  ]
    .filter(Boolean)
    .join("  |  ");

  if (contact) {
    drawLines(wrapText(contact, regular, 9, CONTENT_WIDTH), regular, 9, MUTED, 12);
  }

  if (settings.summary) {
    sectionTitle("Summary");
    drawLines(
      wrapText(settings.summary, regular, 10, CONTENT_WIDTH),
      regular,
      10,
      BLACK,
      13,
    );
  }

  if (skills.length) {
    sectionTitle("Skills");
    drawLines(
      wrapText(skills.map((s) => s.name).join(", "), regular, 10, CONTENT_WIDTH),
      regular,
      10,
      BLACK,
      13,
    );
  }

  if (experiences.length) {
    sectionTitle("Experience");
    for (const exp of experiences) {
      const heading = `${exp.title}  |  ${exp.company}`;
      const meta = [
        formatExperienceRange(exp.startDate, exp.endDate, exp.current),
        exp.location,
        exp.employmentType,
        exp.workMode,
      ]
        .filter(Boolean)
        .join("  |  ");

      ensureSpace(36);
      drawLines(wrapText(heading, bold, 11, CONTENT_WIDTH), bold, 11, BLACK, 14);
      if (meta) {
        drawLines(wrapText(meta, regular, 9, CONTENT_WIDTH), regular, 9, MUTED, 12);
      }
      if (exp.description) {
        y -= 2;
        drawLines(
          wrapText(exp.description, regular, 10, CONTENT_WIDTH),
          regular,
          10,
          BLACK,
          13,
        );
      }
      for (const highlight of exp.highlights) {
        const bullet = wrapText(`- ${highlight}`, regular, 10, CONTENT_WIDTH - 12);
        for (const [i, line] of bullet.entries()) {
          ensureSpace(13);
          page.drawText(line, {
            x: MARGIN + (i === 0 ? 0 : 12),
            y,
            size: 10,
            font: regular,
            color: BLACK,
          });
          y -= 13;
        }
      }
      y -= 8;
    }
  }

  if (education.length) {
    sectionTitle("Education");
    for (const ed of education) {
      drawLines(
        wrapText(`${ed.degree}  |  ${ed.school}`, bold, 11, CONTENT_WIDTH),
        bold,
        11,
        BLACK,
        14,
      );
      const meta = [ed.year, ed.details].filter(Boolean).join("  |  ");
      if (meta) {
        drawLines(wrapText(meta, regular, 9, CONTENT_WIDTH), regular, 9, MUTED, 12);
      }
      y -= 8;
    }
  }

  return doc.save();
}
