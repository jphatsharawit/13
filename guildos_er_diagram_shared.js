window.guildOsRelationships = `
  users ||--o{ communities : administers
  communities ||--o{ community_members : has
  users ||--o{ community_members : joins
  communities ||--o{ skill_cards : scopes
  users ||--o| skill_cards : owns
  communities ||--o{ posts : contains
  users ||--o{ posts : writes
  communities ||--o{ moderation_logs : logs
  posts ||--o{ moderation_logs : triggers
  users ||--o{ moderation_logs : creates
  moderation_logs ||--o| human_reviews : escalates
  users ||--o{ human_reviews : reviews
  communities ||--o{ matches : hosts
  users ||--o{ matches : requests
  users ||--o{ matches : matched_with
  matches ||--o{ match_ratings : receives
  users ||--o{ match_ratings : rates
`.trimEnd();

window.guildOsDetailedDiagram = `erDiagram
${window.guildOsRelationships}

  communities {
    uuid id PK
    string name
    string platform
    string platform_group_id
    uuid admin_user_id FK
    string subscription_tier
    int total_members
    timestamptz last_synced_at
    timestamptz created_at
    boolean is_active
  }
  users {
    uuid id PK
    string display_name
    string platform_user_id
    string platform_type
    int warning_count
    string status
    bool onboarding_completed
    timestamptz created_at
    timestamptz last_active_at
  }
  community_members {
    uuid id PK
    uuid community_id FK
    uuid user_id FK
    string role
    timestamptz joined_at
    boolean is_active
  }
  skill_cards {
    uuid id PK
    uuid user_id FK
    uuid community_id FK
    string game
    string role
    jsonb available_time
    jsonb time_vector
    string play_style
    jsonb style_vector
    string goal
    string rank
    timestamptz created_at
    timestamptz updated_at
  }
  posts {
    uuid id PK
    uuid community_id FK
    uuid user_id FK
    string platform_post_id
    string content_type
    text content_preview
    bool is_blocked
    timestamptz created_at
  }
  moderation_logs {
    uuid id PK
    uuid community_id FK
    uuid post_id FK
    uuid user_id FK
    string label
    numeric confidence_score
    string model_version
    string action_taken
    numeric threshold_used
    bool requires_review
    timestamptz created_at
  }
  human_reviews {
    uuid id PK
    uuid moderation_log_id FK
    uuid reviewer_id FK
    string decision
    text note
    timestamptz reviewed_at
    timestamptz created_at
  }
  matches {
    uuid id PK
    uuid community_id FK
    uuid requester_id FK
    uuid matched_user_id FK
    string game
    numeric match_score
    numeric game_score
    numeric time_score
    numeric role_score
    numeric style_score
    string status
    timestamptz requested_at
    timestamptz responded_at
  }
  match_ratings {
    uuid id PK
    uuid match_id FK
    uuid rater_id FK
    smallint rating
    text comment
    timestamptz created_at
  }
`;

window.guildOsRelationshipDiagram = `erDiagram
${window.guildOsRelationships}
`;

window.guildOsColorPalette = {
  light: {
    page: '#f4f7fb',
    surface: '#dbeafe',
    surfaceAlt: '#ffffff',
    border: '#2563eb',
    text: '#0f172a',
    line: '#475569',
  },
  dark: {
    page: '#0b1220',
    surface: '#13263f',
    surfaceAlt: '#111827',
    border: '#60a5fa',
    text: '#e2e8f0',
    line: '#94a3b8',
  },
};

window.guildOsGetPalette = (dark) => (
  dark ? window.guildOsColorPalette.dark : window.guildOsColorPalette.light
);

window.guildOsCreateMermaidConfig = (dark) => {
  const palette = window.guildOsGetPalette(dark);

  return {
    startOnLoad: false,
    theme: 'base',
    fontFamily: '"Anthropic Sans", sans-serif',
    themeVariables: {
      darkMode: dark,
      fontSize: '13px',
      fontFamily: '"Anthropic Sans", sans-serif',
      background: palette.page,
      primaryColor: palette.surface,
      primaryBorderColor: palette.border,
      primaryTextColor: palette.text,
      secondaryColor: palette.surfaceAlt,
      secondaryBorderColor: palette.border,
      tertiaryColor: palette.surfaceAlt,
      tertiaryBorderColor: palette.border,
      mainBkg: palette.surface,
      secondBkg: palette.surfaceAlt,
      clusterBkg: palette.surfaceAlt,
      clusterBorder: palette.border,
      edgeLabelBackground: palette.surfaceAlt,
      lineColor: palette.line,
      textColor: palette.text,
      titleColor: palette.text,
    },
  };
};

window.guildOsWaitForFonts = () => {
  if (!('fonts' in document)) {
    return Promise.resolve();
  }

  return Promise.race([
    document.fonts.ready,
    new Promise((resolve) => setTimeout(resolve, 3000)), // 3s fallback if fonts do not finish loading
  ]);
};

window.guildOsApplyRoundedEntityBorders = (containerSelector, borderRadius) => {
  document.querySelectorAll(`${containerSelector} svg.erDiagram .node`).forEach((node) => {
    const firstPath = node.querySelector('path[d]');
    if (!firstPath) return;

    const d = firstPath.getAttribute('d');
    const nums = d.match(/-?[\d.]+/g)?.map(Number);
    if (!nums || nums.length < 8) return; // Need four x,y corner pairs to compute a rectangle

    const xs = [nums[0], nums[2], nums[4], nums[6]];
    const ys = [nums[1], nums[3], nums[5], nums[7]];
    const x = Math.min(...xs);
    const y = Math.min(...ys);
    const width = Math.max(...xs) - x;
    const height = Math.max(...ys) - y;
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', width);
    rect.setAttribute('height', height);
    rect.setAttribute('rx', String(borderRadius));

    for (const attribute of ['fill', 'stroke', 'stroke-width', 'class', 'style']) {
      if (firstPath.hasAttribute(attribute)) {
        rect.setAttribute(attribute, firstPath.getAttribute(attribute));
      }
    }

    firstPath.replaceWith(rect);
  });

  document.querySelectorAll(`${containerSelector} svg.erDiagram .row-rect-odd path, ${containerSelector} svg.erDiagram .row-rect-even path`).forEach((path) => {
    path.setAttribute('stroke', 'none');
  });
};