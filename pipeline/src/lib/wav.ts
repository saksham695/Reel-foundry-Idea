import fs from "node:fs";

/**
 * Minimal WAV reader/concatenator. Sarvam and macOS `say` both hand back
 * 16-bit PCM WAV, so we can measure and join them without an ffmpeg dependency.
 */
type Wav = { header: Buffer; data: Buffer; sampleRate: number; channels: number; bitsPerSample: number };

function parse(buf: Buffer): Wav {
  if (buf.toString("ascii", 0, 4) !== "RIFF" || buf.toString("ascii", 8, 12) !== "WAVE") {
    throw new Error("not a RIFF/WAVE file");
  }
  let pos = 12;
  let fmt: { sampleRate: number; channels: number; bitsPerSample: number } | null = null;
  while (pos + 8 <= buf.length) {
    const id = buf.toString("ascii", pos, pos + 4);
    const size = buf.readUInt32LE(pos + 4);
    const body = buf.subarray(pos + 8, pos + 8 + size);
    if (id === "fmt ") {
      fmt = { channels: body.readUInt16LE(2), sampleRate: body.readUInt32LE(4), bitsPerSample: body.readUInt16LE(14) };
    } else if (id === "data") {
      if (!fmt) throw new Error("data chunk before fmt chunk");
      return { header: buf.subarray(0, pos + 8), data: body, ...fmt };
    }
    pos += 8 + size + (size % 2); // chunks are word-aligned
  }
  throw new Error("no data chunk");
}

export function durationSeconds(file: string): number {
  const w = parse(fs.readFileSync(file));
  return w.data.length / (w.sampleRate * w.channels * (w.bitsPerSample / 8));
}

/** Concatenate same-format WAVs, inserting `gapMs` of silence between them. */
export function concat(files: string[], out: string, gapMs = 120): number[] {
  const wavs = files.map((f) => parse(fs.readFileSync(f)));
  const first = wavs[0];
  const bytesPerSecond = first.sampleRate * first.channels * (first.bitsPerSample / 8);
  const gap = Buffer.alloc(Math.round((gapMs / 1000) * bytesPerSecond) & ~1);

  const parts: Buffer[] = [];
  const starts: number[] = [];
  let cursor = 0;
  wavs.forEach((w, i) => {
    if (w.sampleRate !== first.sampleRate || w.channels !== first.channels || w.bitsPerSample !== first.bitsPerSample) {
      throw new Error(`${files[i]} has a different audio format than ${files[0]}`);
    }
    starts.push(cursor / bytesPerSecond);
    parts.push(w.data);
    cursor += w.data.length;
    if (i < wavs.length - 1) {
      parts.push(gap);
      cursor += gap.length;
    }
  });

  const data = Buffer.concat(parts);
  const header = Buffer.alloc(44);
  header.write("RIFF", 0, "ascii");
  header.writeUInt32LE(36 + data.length, 4);
  header.write("WAVE", 8, "ascii");
  header.write("fmt ", 12, "ascii");
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(first.channels, 22);
  header.writeUInt32LE(first.sampleRate, 24);
  header.writeUInt32LE(bytesPerSecond, 28);
  header.writeUInt16LE(first.channels * (first.bitsPerSample / 8), 32);
  header.writeUInt16LE(first.bitsPerSample, 34);
  header.write("data", 36, "ascii");
  header.writeUInt32LE(data.length, 40);

  fs.writeFileSync(out, Buffer.concat([header, data]));
  return starts;
}
