import type { FrameId } from './portfolio';

export interface HobbyContent {
  text: string;
  image: string;
}

export interface WorkItem {
  frameId: FrameId;
  id: string;
  title: string;
  image: string;
  body: string;
}

export interface ContactLink {
  platform: string;
  handle: string;
  href: string;
}

export interface PortfolioContent {
  hero: {
    headlineLines: string[];
  };
  profile: {
    avatar: string;
    name: string;
    realName: string;
    affiliation: string;
    birthday: string;
    statement: string;
    skills: string[];
    hobby: HobbyContent;
  };
  works: WorkItem[];
  contact: {
    links: ContactLink[];
    closingTitle: string;
    closingMessage: string;
  };
}

function resolveImagePath(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (/^(https?:)?\/\//i.test(trimmed)) {
    return trimmed;
  }
  const path = trimmed.startsWith('/') ? trimmed.slice(1) : `images/${trimmed}`;
  return `${import.meta.env.BASE_URL}${path}`;
}

function splitKeyValue(line: string): [string, string] | null {
  const cleaned = line.replace(/^-\s*/, '').trim();
  const match = cleaned.match(/^([^:：]+)[:：]\s*(.*)$/);
  if (!match) return null;
  return [match[1].trim(), match[2].trim()];
}

function parseContactValue(platform: string, rawValue: string): { handle: string; href: string } {
  if (rawValue.includes('|')) {
    const parts = rawValue.split('|').map((s) => s.trim());
    const handle = parts[0] ?? '';
    const rawHref = parts[1] ?? '#';
    const href =
      rawHref === '#' || rawHref.startsWith('http://') || rawHref.startsWith('https://')
        ? rawHref
        : `https://${rawHref}`;
    return { handle, href };
  }

  const trimmed = rawValue.trim();
  const href =
    trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? trimmed
      : `https://${trimmed}`;

  const withoutProtocol = trimmed.replace(/^https?:\/\//, '').replace(/\/$/, '');
  if (platform.toLowerCase() === 'x' && /^(x\.com|twitter\.com)\//i.test(withoutProtocol)) {
    const user = withoutProtocol.replace(/^(x\.com|twitter\.com)\//i, '');
    return { handle: `@${user}`, href };
  }

  return { handle: withoutProtocol, href };
}

export function parseContentMarkdown(markdown: string): PortfolioContent {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');

  const headlineLines: string[] = [];
  let avatar = '';
  let name = 'KAKI';
  let realName = '';
  let affiliation = '';
  let birthday = '';
  let statement = '';
  const skills: string[] = [];
  const hobbyTexts: string[] = [];
  let hobbyImage = '';
  const works: WorkItem[] = [
    { frameId: 'work-01', id: '01', title: '作品タイトル 01', image: '', body: '' },
    { frameId: 'work-02', id: '02', title: '作品タイトル 02', image: '', body: '' },
    { frameId: 'work-03', id: '03', title: '作品タイトル 03', image: '', body: '' },
  ];
  const links: ContactLink[] = [];
  let closingTitle = 'Thank you for visiting.';
  let closingMessage = '';

  let h2 = '';
  let h3 = '';
  let lastMultilineTarget:
    | { type: 'statement' }
    | { type: 'workBody'; idx: number }
    | { type: 'closingMessage' }
    | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (line === '---') {
      lastMultilineTarget = null;
      continue;
    }

    if (line.startsWith('## ')) {
      h2 = line.slice(3).trim();
      h3 = '';
      lastMultilineTarget = null;
      continue;
    }

    if (line.startsWith('### ')) {
      h3 = line.slice(4).trim();
      lastMultilineTarget = null;
      continue;
    }

    if (line.startsWith('#### ')) {
      lastMultilineTarget = null;
      continue;
    }

    if (!line) {
      continue;
    }

    if (h2 === 'タイトル') {
      if (!line.startsWith('#')) {
        headlineLines.push(line);
      }
      continue;
    }

    if (h2 === 'プロフィール') {
      if (!h3) {
        if (line.startsWith('-')) {
          const kv = splitKeyValue(line);
          if (kv) {
            const [k, v] = kv;
            if (k === '名前') {
              name = v || name;
              lastMultilineTarget = null;
            } else if (k === '本名') {
              realName = v;
              lastMultilineTarget = null;
            } else if (k === '所属') {
              affiliation = v;
              lastMultilineTarget = null;
            } else if (k === 'アイコン') {
              avatar = resolveImagePath(v);
              lastMultilineTarget = null;
            } else if (k === '誕生日') {
              birthday = v;
              lastMultilineTarget = null;
            } else if (k === '一言') {
              statement = v;
              lastMultilineTarget = { type: 'statement' };
            }
          }
        } else if (lastMultilineTarget?.type === 'statement') {
          statement = statement ? `${statement}\n${line}` : line;
        }
      } else if (h3 === '技術' && line.startsWith('-')) {
        const item = line.replace(/^-\s*/, '').trim();
        if (item) skills.push(item);
      } else if (h3 === '趣味' && line.startsWith('-')) {
        let text = line.replace(/^-\s*/, '').trim();
        // Extract inline image filename like "(syumi.jpeg)" or "（syumi.png）"
        const imgMatch = text.match(/[（(]([^()（）]+\.(?:png|jpe?g|webp|gif|avif))[)）]\s*$/i);
        if (imgMatch) {
          hobbyImage = resolveImagePath(imgMatch[1]);
          text = text.slice(0, imgMatch.index).trim();
        }
        if (text) hobbyTexts.push(text);
      }
      continue;
    }

    const workMatch = h2.match(/^作品\s*0?([1-3])$/);
    if (workMatch) {
      const idx = Number(workMatch[1]) - 1;
      const work = works[idx];
      if (line.startsWith('-')) {
        const kv = splitKeyValue(line);
        if (kv) {
          const [k, v] = kv;
          if (k === '見出し') {
            work.title = v;
            lastMultilineTarget = null;
          } else if (k === '画像') {
            work.image = resolveImagePath(v);
            lastMultilineTarget = null;
          } else if (k === '本文') {
            work.body = v;
            lastMultilineTarget = { type: 'workBody', idx };
          }
        }
      } else if (lastMultilineTarget?.type === 'workBody' && lastMultilineTarget.idx === idx) {
        work.body = work.body ? `${work.body}\n${line}` : line;
      }
      continue;
    }

    if (h2 === 'コンタクト' && line.startsWith('-')) {
      const kv = splitKeyValue(line);
      if (kv) {
        const [platform, rest] = kv;
        const { handle, href } = parseContactValue(platform, rest);
        links.push({ platform, handle, href });
      }
      continue;
    }

    if (h2 === '最後の挨拶') {
      if (line.startsWith('-')) {
        const kv = splitKeyValue(line);
        if (kv) {
          const [k, v] = kv;
          if (k === '見出し') {
            closingTitle = v;
            lastMultilineTarget = null;
          } else if (k === '本文') {
            closingMessage = v;
            lastMultilineTarget = { type: 'closingMessage' };
          }
        }
      } else if (lastMultilineTarget?.type === 'closingMessage') {
        closingMessage = closingMessage ? `${closingMessage}\n${line}` : line;
      }
    }
  }

  return {
    hero: {
      headlineLines: headlineLines.length > 0 ? headlineLines : ['PORTFOLIO', 'KAKI.'],
    },
    profile: {
      avatar,
      name,
      realName,
      affiliation,
      birthday,
      statement,
      skills,
      hobby: {
        text: hobbyTexts.join('\n'),
        image: hobbyImage,
      },
    },
    works,
    contact: {
      links,
      closingTitle,
      closingMessage,
    },
  };
}
