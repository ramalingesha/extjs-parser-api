import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs/promises';
import { mapExtInputComponent } from '../mappings/componentMapper';
import { generateJSXCode } from '../generator/generator';
import { parseExtJSCode } from '../parser/extParser';
import { flattenComponents } from '../parser/flattenComponents';

export const handleParse = async (req: Request, res: Response): Promise<void> => {
  const file = req.file;
  if (!file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  const filePath = path.resolve(file.path);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const rawComponents = parseExtJSCode(content);
    const flatComponents = flattenComponents(rawComponents);

    console.log('flattenedComponents', flatComponents);

    const mapped = flatComponents
      .map(mapExtInputComponent)
      .filter((c): c is NonNullable<typeof c> => !!c);

    const jsx = mapped.map(generateJSXCode);

    res.json({ components: mapped, jsx });
  } finally {
    await fs.rm(filePath, { force: true });
  }
};