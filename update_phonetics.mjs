import fs from 'fs';

const transformAccents = (text) => {
    let t = text;
    // Replace "ing" at the end of words with "in"
    t = t.replace(/ing\b/g, 'in');
    t = t.replace(/ingk\b/g, 'ink');

    // Replace typical words
    t = t.replace(/\buoter\b/g, 'wá-rer');
    t = t.replace(/\buater\b/g, 'wá-rer');
    t = t.replace(/\bbeter\b/g, 'bé-der');
    t = t.replace(/\bbetar\b/g, 'bé-der');
    t = t.replace(/\buork\b/g, 'wórk');
    t = t.replace(/\buok\b/g, 'wók');
    t = t.replace(/\buont\b/g, 'wánt');
    t = t.replace(/\buait\b/g, 'wéit');
    t = t.replace(/\buin\b/g, 'wín');
    t = t.replace(/\buorld\b/g, 'wórld');
    t = t.replace(/\buord\b/g, 'wórd');
    t = t.replace(/\buat\b/g, 'wát');
    t = t.replace(/\bju\b/g, 'jú');

    // "th" to "d" like in "da hood"
    t = t.replace(/\bda\b/g, 'da'); // already da
    t = t.replace(/\bde\b/g, 'da');
    t = t.replace(/\bdi\b/g, 'di');
    t = t.replace(/\bdis\b/g, 'dis');
    t = t.replace(/\bdat\b/g, 'dat');
    t = t.replace(/\bdous\b/g, 'dous');
    t = t.replace(/\bder\b/g, 'der');
    t = t.replace(/\bden\b/g, 'den');
    t = t.replace(/\bdei\b/g, 'dei');

    // "you" -> "iu" / "ya"
    t = t.replace(/\biu\b/g, 'yú');
    t = t.replace(/\biur\b/g, 'yúr');

    // Intervocalic T -> R (very rough approximation)
    t = t.replace(/([aeiouáéíóú])t([aeiouáéíóú])/g, '$1r$2');
    t = t.replace(/([aeiouáéíóú])d([aeiouáéíóú])/g, '$1r$2');

    return t;
};

const processFile = (filePath) => {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');

    // Quick regex to modify phonetic properties
    content = content.replace(/phonetic:\s*"([^"]+)"/g, (match, p1) => {
        return `phonetic: "${transformAccents(p1)}"`;
    });

    fs.writeFileSync(filePath, content);
    console.log(`Processed ${filePath}`);
};

// Process files
processFile('./src/data/core-1000.js');
processFile('./src/data/advanced-1000.js');
processFile('./src/data/technical.js');
processFile('./src/data/urban-slang.js');
processFile('./src/data/tongue-twisters.js');

console.log('Phonetics updated for all card files.');
