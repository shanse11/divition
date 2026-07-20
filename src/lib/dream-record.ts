import {
  dreamInterpretationSchema,
  type DreamInterpretation,
} from "@/lib/ai/schema";
import { dreamInputSchema, type DreamInput } from "@/lib/validation/dream";

export interface DreamRecord {
  id: string;
  ownerId: string;
  input: DreamInput;
  result: DreamInterpretation;
  title: string;
  note: string;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
}

interface StoredDreamRow {
  id: string;
  ownerId: string;
  input: string;
  result: string;
  title: string;
  note: string;
  favorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface DreamCreateFields {
  id: string;
  ownerId: string;
  userId: string | null;
  input: DreamInput;
  result: DreamInterpretation;
}

export function buildDreamCreateData(fields: DreamCreateFields) {
  return {
    id: fields.id,
    ownerId: fields.ownerId,
    userId: fields.userId,
    input: JSON.stringify(fields.input),
    result: JSON.stringify(fields.result),
    title: fields.input.title,
    note: fields.input.note,
  };
}

export function parseDreamRecord(row: StoredDreamRow): DreamRecord {
  try {
    const input = dreamInputSchema.parse(JSON.parse(row.input));
    const result = dreamInterpretationSchema.parse(JSON.parse(row.result));
    return {
      id: row.id,
      ownerId: row.ownerId,
      input,
      result,
      title: row.title,
      note: row.note,
      favorite: row.favorite,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  } catch {
    throw new Error("Invalid persisted dream record");
  }
}
