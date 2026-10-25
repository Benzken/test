// Pi, de mascotte. Getekend in SVG zodat hij er op elke gsm hetzelfde uitziet
// en kan reageren: 'happy' (standaard), 'cheer' (juichen) en 'oops' (fout).

const INK = '#2B2B40';
const BODY = '#FFD54A';
const SHADE = '#F2B705';
const CHEEK = '#FF8FA3';
const PI = '#2F80ED';

const eyes = {
  happy: `
    <g class="pi-eyes">
      <ellipse cx="46" cy="62" rx="6" ry="8" fill="${INK}"/>
      <ellipse cx="74" cy="62" rx="6" ry="8" fill="${INK}"/>
      <circle cx="48.2" cy="58.8" r="2.3" fill="#fff"/>
      <circle cx="76.2" cy="58.8" r="2.3" fill="#fff"/>
    </g>`,
  cheer: `
    <path d="M39 64 Q46 54 53 64" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M67 64 Q74 54 81 64" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/>`,
  oops: `
    <path d="M39 49 Q46 44 53 48" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M67 48 Q74 44 81 49" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <circle cx="46" cy="62" r="7.5" fill="#fff" stroke="${INK}" stroke-width="2.5"/>
    <circle cx="74" cy="62" r="7.5" fill="#fff" stroke="${INK}" stroke-width="2.5"/>
    <circle cx="46" cy="63" r="3.6" fill="${INK}"/>
    <circle cx="74" cy="63" r="3.6" fill="${INK}"/>`,
};

const mouth = {
  happy: `<path d="M52 78 Q60 87 68 78" stroke="${INK}" stroke-width="3.6" fill="none" stroke-linecap="round"/>`,
  cheer: `
    <path d="M47 75 Q60 98 73 75 Z" fill="${INK}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M53 86 Q60 80 67 86 Q60 93 53 86 Z" fill="${CHEEK}"/>`,
  oops: `<ellipse cx="60" cy="83" rx="4.8" ry="5.8" fill="${INK}"/>`,
};

const arms = {
  happy: `
    <ellipse cx="19" cy="76" rx="6" ry="9" transform="rotate(25 19 76)" fill="${SHADE}"/>
    <ellipse cx="101" cy="76" rx="6" ry="9" transform="rotate(-25 101 76)" fill="${SHADE}"/>`,
  cheer: `
    <ellipse cx="17" cy="48" rx="6" ry="10" transform="rotate(-30 17 48)" fill="${SHADE}"/>
    <ellipse cx="103" cy="48" rx="6" ry="10" transform="rotate(30 103 48)" fill="${SHADE}"/>`,
  oops: `
    <ellipse cx="20" cy="70" rx="6" ry="9" transform="rotate(40 20 70)" fill="${SHADE}"/>
    <ellipse cx="100" cy="70" rx="6" ry="9" transform="rotate(-40 100 70)" fill="${SHADE}"/>`,
};

const extras = {
  happy: '',
  cheer: `
    <path d="M10 22 l2.5 6 6 2.5 -6 2.5 -2.5 6 -2.5 -6 -6 -2.5 6 -2.5 z" fill="${BODY}" stroke="${SHADE}" stroke-width="1.5"/>
    <path d="M108 14 l2 4.5 4.5 2 -4.5 2 -2 4.5 -2 -4.5 -4.5 -2 4.5 -2 z" fill="${PI}"/>
    <circle cx="104" cy="96" r="3" fill="${CHEEK}"/>`,
  oops: `<path d="M95 38 Q101 47 95 51 Q89 47 95 38 Z" fill="#8FD3FF" stroke="#4BA8E8" stroke-width="1.5"/>`,
};

export function piSvg(mood = 'happy') {
  const m = eyes[mood] ? mood : 'happy';
  return `<svg class="pi pi-${m}" viewBox="0 0 120 120" width="1em" height="1em" aria-hidden="true">
    <ellipse cx="60" cy="113" rx="30" ry="4" fill="rgba(0,0,0,0.12)"/>
    <ellipse cx="46" cy="105" rx="10" ry="6" fill="${SHADE}"/>
    <ellipse cx="74" cy="105" rx="10" ry="6" fill="${SHADE}"/>
    ${arms[m]}
    <path d="M60 24 C89 24 103 44 103 68 C103 93 85 107 60 107 C35 107 17 93 17 68 C17 44 31 24 60 24 Z" fill="${BODY}"/>
    <path d="M24 80 C30 98 46 104 60 104 C74 104 90 98 96 80 C88 94 74 99 60 99 C46 99 32 94 24 80 Z" fill="${SHADE}" opacity="0.45"/>
    <ellipse cx="40" cy="40" rx="11" ry="6" transform="rotate(-30 40 40)" fill="#FFF0B3" opacity="0.8"/>
    <path d="M42 21 Q60 14 79 19" stroke="${PI}" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path d="M53 19 Q52 25 51 30" stroke="${PI}" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path d="M68 17 Q68 24 71 30" stroke="${PI}" stroke-width="6" fill="none" stroke-linecap="round"/>
    <ellipse cx="35" cy="77" rx="7" ry="4.5" fill="${CHEEK}" opacity="0.75"/>
    <ellipse cx="85" cy="77" rx="7" ry="4.5" fill="${CHEEK}" opacity="0.75"/>
    ${eyes[m]}
    ${mouth[m]}
    ${extras[m]}
  </svg>`;
}

export function mascot(mood = 'happy', cls = '') {
  return `<span class="mascot ${cls}">${piSvg(mood)}</span>`;
}
