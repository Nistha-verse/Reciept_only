// Fail when sensitive local files are tracked or email files escape the fixtures policy.
import { execFileSync } from 'node:child_process';

const tracked = execFileSync('git', ['ls-files'], { encoding: 'utf8' }).split('\n').filter(Boolean);
const forbidden = tracked.filter((file) => file === '.env' || /\.pem$|\.key$|\.eml$/i.test(file));
const outsideOfficialFixtures = tracked.filter((file) => /\.eml$/i.test(file) && !file.startsWith('backend/sdk/tests/fixtures/'));

if (forbidden.length > 0 || outsideOfficialFixtures.length > 0) {
  console.error('Sensitive files are tracked:', [...new Set([...forbidden, ...outsideOfficialFixtures])]);
  process.exit(1);
}

console.log('Secret tracking check passed.');
