export type CompletionCardImageInput = {
  lessonName: string;
  completed: number;
  total: number;
  correctAnswers: number;
  scoreOutOfTen: number;
  percent: number;
  date: string;
  perfect: boolean;
};

const PAPERS = [
  { x: 36, y: 48, w: 22, h: 30, rot: -18, color: "#F0A05A" },
  { x: 92, y: 28, w: 16, h: 24, rot: 14, color: "#F5C542" },
  { x: 620, y: 40, w: 20, h: 28, rot: 22, color: "#E8893A" },
  { x: 668, y: 88, w: 14, h: 22, rot: -12, color: "#3D9A6A" },
  { x: 48, y: 860, w: 18, h: 26, rot: 16, color: "#E4A11B" },
  { x: 640, y: 900, w: 24, h: 16, rot: -20, color: "#F0A05A" },
  { x: 110, y: 940, w: 12, h: 18, rot: 8, color: "#EDD9BC" },
  { x: 560, y: 70, w: 12, h: 18, rot: -28, color: "#FEF3E2" },
] as const;

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function drawPaper(ctx: CanvasRenderingContext2D, paper: (typeof PAPERS)[number]) {
  ctx.save();
  ctx.translate(paper.x + paper.w / 2, paper.y + paper.h / 2);
  ctx.rotate((paper.rot * Math.PI) / 180);
  ctx.fillStyle = paper.color;
  roundRect(ctx, -paper.w / 2, -paper.h / 2, paper.w, paper.h, 3);
  ctx.fill();
  ctx.restore();
}

export async function saveCompletionCardPng(input: CompletionCardImageInput) {
  if (typeof window === "undefined") return;
  await document.fonts.ready;

  const dark = document.documentElement.classList.contains("dark");
  const width = 720;
  const height = 1040;
  const scale = 2;
  const canvas = document.createElement("canvas");
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.scale(scale, scale);

  const family = getComputedStyle(document.body).fontFamily || "Cairo, sans-serif";
  const page = dark ? "#131F24" : "#FEF3E2";
  const card = dark ? "#1F2E35" : "#FFFDF8";
  const ink = dark ? "#F8FAFC" : "#1E293B";
  const muted = dark ? "#94A3B8" : "#64748B";
  const row = dark ? "#1A2C34" : "#FEF3E2";
  const line = dark ? "rgba(255,255,255,0.12)" : "#EDD9BC";

  ctx.fillStyle = page;
  ctx.fillRect(0, 0, width, height);

  if (input.perfect) {
    for (const paper of PAPERS) drawPaper(ctx, paper);
  }

  roundRect(ctx, 48, 120, width - 96, 800, 28);
  ctx.fillStyle = card;
  ctx.fill();
  ctx.strokeStyle = line;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.direction = "rtl";
  ctx.textAlign = "center";
  ctx.fillStyle = ink;
  ctx.font = `800 34px ${family}`;
  ctx.fillText(input.perfect ? "أحسنت! بدون أخطاء." : "أحسنت! اكتمل التمرين.", width / 2, 200);

  const rows: [string, string][] = [
    ["اسم الدرس", input.lessonName],
    ["الجمل المكتملة", `${input.completed} من ${input.total}`],
    ["الإجابات الصحيحة", String(input.correctAnswers)],
    ["النتيجة", `${input.scoreOutOfTen}/10`],
    ["النسبة", `${input.percent}%`],
    ["التاريخ", input.date],
  ];

  rows.forEach(([label, value], index) => {
    const y = 250 + index * 92;
    roundRect(ctx, 78, y, width - 156, 72, 18);
    ctx.fillStyle = row;
    ctx.fill();
    ctx.direction = "rtl";
    ctx.textAlign = "right";
    ctx.fillStyle = muted;
    ctx.font = `700 22px ${family}`;
    ctx.fillText(label, width - 104, y + 46);
    const latin = /[A-Za-z]/.test(value);
    ctx.direction = latin ? "ltr" : "rtl";
    ctx.textAlign = "left";
    ctx.fillStyle = ink;
    ctx.font = `800 24px ${family}`;
    ctx.fillText(value, 104, y + 46);
  });

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/png");
  });
  if (!blob) return;

  const file = new File([blob], "newlearn-lesson-2.png", { type: "image/png" });
  const shareData: ShareData = { files: [file], title: "بطاقة التمرين" };
  if (navigator.canShare?.(shareData)) {
    try {
      await navigator.share(shareData);
      return;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
    }
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.name;
  link.click();
  URL.revokeObjectURL(url);
}
