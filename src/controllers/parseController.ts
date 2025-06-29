import { Request, Response } from 'express';
import { parseExtJSCode } from '../parser/extParser';
import fs from 'fs';
import { generateJSXCode } from '../generator/generator';

/**
 * Controller to handle ExtJS to React JSX conversion request.
 * Accepts a file upload (code sample), parses it, and returns JSX.
 */
export const handleParse = async (req: Request, res: Response): Promise<void> => {
  const file = req.file;

  if (!file) {
    res.status(400).json({ error: 'No file uploaded.' });
    return;
  }

  const code = fs.readFileSync(file.path, 'utf-8');

  const componentConfig = parseExtJSCode(code);

  if (!componentConfig) {
    res.status(400).json({ error: 'Failed to parse ExtJS component.' });
    return;
  }

  const jsxCode = generateJSXCode(componentConfig);

  res.json({ jsxCode });
};