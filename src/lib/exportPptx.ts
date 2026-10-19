import pptxgen from 'pptxgenjs';
import { Lecture } from '@/lib/types';

export async function exportLectureToPptx(lecture: Lecture): Promise<void> {
  const pres = new pptxgen();
  pres.title = lecture.title;
  pres.subject = `Lecture Presentation: ${lecture.title}`;
  pres.author = 'EduTrack';

  // 1. Title Slide (Keynote Minimalist Dark)
  const titleSlide = pres.addSlide();
  titleSlide.background = { color: '0E0E10' };
  titleSlide.addText(lecture.title, {
    x: 0.8,
    y: 1.8,
    w: 8.4,
    h: 1.5,
    fontSize: 26,
    bold: true,
    color: 'FFFFFF',
    align: 'center',
  });
  titleSlide.addText(`${lecture.speaker} • EduTrack AI Studio Deck`, {
    x: 1.0,
    y: 3.5,
    w: 8.0,
    h: 0.6,
    fontSize: 14,
    color: '8E8E93',
    align: 'center',
  });

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // 2. Content Slides
  lecture.slides.forEach((s) => {
    const slide = pres.addSlide();
    slide.background = { color: '0E0E10' };

    // Section header
    slide.addText(`Slide ${s.slideNumber}: ${s.section}`, {
      x: 0.8,
      y: 0.4,
      w: 8.4,
      h: 0.35,
      fontSize: 11,
      color: '8E8E93',
      bold: true,
    });

    // Title
    slide.addText(s.title, {
      x: 0.8,
      y: 0.75,
      w: 8.4,
      h: 0.8,
      fontSize: 20,
      bold: true,
      color: 'F5F5F7',
    });

    // Bullet points on left column
    const bulletItems = s.bullets.map((b) => ({
      text: b,
      options: { fontSize: 12, color: 'D1D1D6', breakLine: true },
    }));
    slide.addText(bulletItems, {
      x: 0.8,
      y: 1.7,
      w: 4.8,
      h: 3.0,
      bullet: true,
    });

    // Right column card
    let rightY = 1.7;
    if (s.equation) {
      slide.addShape(pres.ShapeType.rect, {
        x: 5.8,
        y: rightY,
        w: 3.8,
        h: 1.5,
        fill: { color: '1C1C1E' },
        line: { color: '3A3A3C', width: 1 },
      });
      slide.addText(s.equation.label.toUpperCase(), {
        x: 5.9,
        y: rightY + 0.1,
        w: 3.6,
        h: 0.25,
        fontSize: 9,
        bold: true,
        color: 'E5E5EA',
      });
      slide.addText(s.equation.formula, {
        x: 5.9,
        y: rightY + 0.35,
        w: 3.6,
        h: 0.65,
        fontSize: 12,
        bold: true,
        fontFace: 'Courier New',
        color: 'FFFFFF',
        align: 'center',
      });
      slide.addText(s.equation.explanation, {
        x: 5.9,
        y: rightY + 1.05,
        w: 3.6,
        h: 0.4,
        fontSize: 8.5,
        color: '8E8E93',
      });
      rightY += 1.65;
    }

    if (s.speakerTakeaway) {
      slide.addShape(pres.ShapeType.rect, {
        x: 5.8,
        y: rightY,
        w: 3.8,
        h: 1.3,
        fill: { color: '1C1C1E' },
        line: { color: '3A3A3C', width: 1 },
      });
      slide.addText('KEY SPEAKER TAKEAWAY', {
        x: 5.9,
        y: rightY + 0.1,
        w: 3.6,
        h: 0.25,
        fontSize: 8.5,
        bold: true,
        color: 'E5E5EA',
      });
      slide.addText(s.speakerTakeaway, {
        x: 5.9,
        y: rightY + 0.35,
        w: 3.6,
        h: 0.85,
        fontSize: 10,
        color: 'D1D1D6',
      });
    }

    // Footer with sync timestamp
    slide.addText(
      `Timestamp: ${formatTime(s.startTime)} – ${formatTime(s.endTime)} • EduTrack Studio`,
      {
        x: 0.8,
        y: 5.1,
        w: 8.4,
        h: 0.3,
        fontSize: 8.5,
        color: '636366',
      }
    );
  });

  const cleanName = lecture.title.replace(/[^a-zA-Z0-9]/g, '_');
  await pres.writeFile({ fileName: `${cleanName}_Keynote.pptx` });
}
