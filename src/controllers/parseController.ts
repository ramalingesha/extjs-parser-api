import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs/promises';
import { mapExtInputComponent } from '../mappings/componentMapper';
import { generateJSXCode } from '../generator/generator';
import { parseExtJSCode } from '../parser/extParser';
import { flattenComponents } from '../parser/flattenComponents';
import { ReactComponentMapping } from '../types/ComponentTypes';

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

    const topLevelMapped = rawComponents
      .map(mapExtInputComponent)
      .filter((c): c is ReactComponentMapping => c !== null);


    const jsxCode = topLevelMapped.map(generateJSXCode);

    res.json({ components: topLevelMapped, jsxCode });
  } finally {
    await fs.rm(filePath, { force: true });
  }
};