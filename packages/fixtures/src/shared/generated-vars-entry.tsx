import { standalonePadding } from './generated-vars-standalone.js';
import { generatedVarsBox, inlineRadius } from './generated-vars-style.js';

document.body.className = generatedVarsBox.className;
document.body.style.borderRadius = inlineRadius;
document.body.style.padding = standalonePadding;
