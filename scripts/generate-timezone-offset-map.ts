import { getTimeZones } from '@vvo/tzdb';
import fs from 'fs';

const data = `export const timeZoneOffsetMap = new Map([
  ${getTimeZones()
    .map((tz) => `['${tz.name}', ${tz.rawOffsetInMinutes}],`)
    .join('\n  ')}
])`;

fs.writeFileSync('packages/cel/src/lib/common/types/timezones.ts', data);
