import {validateContent} from './content-lib.mjs';
const r=validateContent();console.log(JSON.stringify(r.counts));for(const w of r.warnings)console.warn('WARN',w);if(r.errors.length){for(const e of r.errors)console.error('ERROR',e);process.exit(1)}console.log('CONTENT_VALIDATION_PASS');
