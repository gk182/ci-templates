#!/usr/bin/env node

/**
 * Mobile CI/CD Pipeline Initializer CLI
 * Interactive terminal workflow generator for Flutter, Native Android, and Native iOS.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// ANSI Color & Styling Tokens
const C_RESET = '\x1b[0m';
const C_BOLD = '\x1b[1m';
const C_DIM = '\x1b[2m';
const C_CYAN = '\x1b[36m';
const C_GREEN = '\x1b[32m';
const C_YELLOW = '\x1b[33m';
const C_GRAY = '\x1b[90m';
const C_WHITE = '\x1b[37m';
const C_HIDE_CURSOR = '\x1b[?25l';
const C_SHOW_CURSOR = '\x1b[?25h';

/**
 * Interactive Arrow-Key Menu Selector
 */
function selectMenu(title, options) {
  return new Promise((resolve) => {
    let selectedIndex = 0;
    readline.emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }
    process.stdout.write(C_HIDE_CURSOR);

    function render() {
      readline.cursorTo(process.stdout, 0);
      console.log(`\n${C_BOLD}${C_CYAN}?${C_RESET} ${C_BOLD}${title}${C_RESET} ${C_GRAY}(Use ↑ ↓ keys to navigate, Enter to select)${C_RESET}\n`);

      options.forEach((opt, idx) => {
        if (idx === selectedIndex) {
          console.log(`  ${C_BOLD}${C_GREEN}❯ ${opt.label}${C_RESET}  ${C_GRAY}${opt.desc}${C_RESET}`);
        } else {
          console.log(`    ${C_GRAY}${opt.label}${C_RESET}  ${C_DIM}${opt.desc}${C_RESET}`);
        }
      });
    }

    function onKeypress(str, key) {
      if (key.name === 'up') {
        selectedIndex = (selectedIndex - 1 + options.length) % options.length;
        readline.moveCursor(process.stdout, 0, -(options.length + 3));
        render();
      } else if (key.name === 'down') {
        selectedIndex = (selectedIndex + 1) % options.length;
        readline.moveCursor(process.stdout, 0, -(options.length + 3));
        render();
      } else if (key.name === 'return' || key.name === 'enter') {
        process.stdin.removeListener('keypress', onKeypress);
        if (process.stdin.isTTY) {
          process.stdin.setRawMode(false);
        }
        process.stdout.write(C_SHOW_CURSOR);
        console.log(`\n${C_GREEN}✔ Selected:${C_RESET} ${C_BOLD}${options[selectedIndex].label}${C_RESET}\n`);
        resolve(options[selectedIndex].value);
      } else if (key.ctrl && key.name === 'c') {
        process.stdout.write(C_SHOW_CURSOR);
        process.exit(0);
      }
    }

    process.stdin.on('keypress', onKeypress);
    render();
  });
}

/**
 * Interactive Yes/No Selector
 */
function selectConfirm(title, defaultValue = true) {
  const options = [
    { label: 'Yes', value: true, desc: '(Enable this feature)' },
    { label: 'No', value: false, desc: '(Skip for now)' }
  ];
  if (!defaultValue) {
    options.reverse();
  }
  return selectMenu(title, options);
}

/**
 * Automatically detects local or project Flutter SDK version
 */
function detectFlutterVersion() {
  try {
    const output = execSync('flutter --version', { encoding: 'utf8' });
    const match = output.match(/Flutter\ ([\d]+\.[\d]+\.[\d]+)/i);
    if (match && match[1]) return match[1];
  } catch (e) { }

  try {
    const pubspecPath = path.join(process.cwd(), 'pubspec.yaml');
    if (fs.existsSync(pubspecPath)) {
      const content = fs.readFileSync(pubspecPath, 'utf8');

      const flutterMatch = content.match(/flutter:\ [^\d]*([\d]+\.[\d]+\.[\d]+)/);
      if (flutterMatch && flutterMatch[1]) return flutterMatch[1];

      const dartMatch = content.match(/sdk:\ [^\d]*([\d]+\.[\d]+)/);
      if (dartMatch && dartMatch[1]) {
        const dartVer = dartMatch[1];
        if (dartVer === '3.7') return '3.29.0';
        if (dartVer === '3.6') return '3.27.0';
        if (dartVer === '3.5') return '3.24.0';
        if (dartVer === '3.4') return '3.22.0';
        if (dartVer === '3.3') return '3.19.0';
      }
    }
  } catch (e) { }

  return '3.29.0';
}

async function main() {
  console.log(`\n${C_BOLD}${C_CYAN}┌──────────────────────────────────────────────────────────┐${C_RESET}`);
  console.log(`${C_BOLD}${C_CYAN}│${C_RESET}  ${C_BOLD}${C_WHITE}MOBILE CI/CD WORKFLOW GENERATOR${C_RESET} ${C_GRAY}(gk182/ci-templates)${C_RESET}    ${C_BOLD}${C_CYAN}│${C_RESET}`);
  console.log(`${C_BOLD}${C_CYAN}└──────────────────────────────────────────────────────────┘${C_RESET}`);

  const detectedFlutterVersion = detectFlutterVersion();
  console.log(`\n${C_YELLOW}●${C_RESET} Detected Flutter Version: ${C_BOLD}${C_GREEN}${detectedFlutterVersion}${C_RESET}`);

  const presetOptions = [
    {
      label: 'Flutter Basic',
      value: '1',
      desc: 'Build APK artifacts on Push/PR (No automated deployment)'
    },
    {
      label: 'Flutter Multi-Branch',
      value: '2',
      desc: 'develop -> Firebase App Distribution, main -> Play Store / TestFlight'
    },
    {
      label: 'Flutter Tag Release',
      value: '3',
      desc: 'Auto Deploy to Stores only when pushing Git Tags (v*.*.*)'
    },
    {
      label: 'Native Android',
      value: '4',
      desc: 'Pure Android Studio Project (Gradle / Kotlin / Java)'
    },
    {
      label: 'Native iOS',
      value: '5',
      desc: 'Pure Xcode Project (Swift / Fastlane / TestFlight)'
    }
  ];

  const selectedPreset = await selectMenu('Select CI/CD Pipeline Configuration:', presetOptions);

  let buildIos = false;
  if (['1', '2', '3'].includes(selectedPreset)) {
    buildIos = await selectConfirm('Enable iOS build target (requires macOS runner)?', false);
  }

  const createNotes = await selectConfirm('Generate a release_notes.txt template file?', true);

  let yamlContent = '';
  switch (selectedPreset) {
    case '2':
      yamlContent = `name: CI/CD Pipeline (Multi-Branch)

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  deploy-dev:
    if: github.event_name == 'push' && github.ref == 'refs/heads/develop'
    uses: gk182/ci-templates/.github/workflows/mobile-ci.yml@main
    with:
      project_type: flutter
      flutter_version: "${detectedFlutterVersion}"
      build_ios: false
      run_deploy: true
      deploy_target: firebase
    secrets: inherit

  deploy-prod:
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    uses: gk182/ci-templates/.github/workflows/mobile-ci.yml@main
    with:
      project_type: flutter
      flutter_version: "${detectedFlutterVersion}"
      build_ios: ${buildIos}
      run_deploy: true
      deploy_target: play_internal
    secrets: inherit

  pr-check:
    if: github.event_name == 'pull_request'
    uses: gk182/ci-templates/.github/workflows/mobile-ci.yml@main
    with:
      project_type: flutter
      flutter_version: "${detectedFlutterVersion}"
      build_ios: false
      run_deploy: false
    secrets: inherit
`;
      break;

    case '3':
      yamlContent = `name: CI/CD Pipeline (Tag Release)

on:
  push:
    branches: [main, develop]
    tags:
      - 'v*.*.*'
  pull_request:
    branches: [main]

jobs:
  mobile-ci:
    uses: gk182/ci-templates/.github/workflows/mobile-ci.yml@main
    with:
      project_type: flutter
      flutter_version: "${detectedFlutterVersion}"
      build_ios: \${{ startsWith(github.ref, 'refs/tags/v') }}
      run_deploy: \${{ startsWith(github.ref, 'refs/tags/v') }}
      deploy_target: play_internal
    secrets: inherit
`;
      break;

    case '4':
      yamlContent = `name: Native Android CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  android-ci:
    uses: gk182/ci-templates/.github/workflows/mobile-ci.yml@main
    with:
      project_type: android
      build_ios: false
      run_deploy: \${{ github.ref == 'refs/heads/main' }}
      deploy_target: play_internal
    secrets: inherit
`;
      break;

    case '5':
      yamlContent = `name: Native iOS CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  ios-ci:
    uses: gk182/ci-templates/.github/workflows/mobile-ci.yml@main
    with:
      project_type: ios
      build_ios: true
      run_deploy: \${{ github.ref == 'refs/heads/main' }}
      deploy_target: testflight
    secrets: inherit
`;
      break;

    case '1':
    default:
      yamlContent = `name: CI (Flutter Basic Build)

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  mobile-ci:
    uses: gk182/ci-templates/.github/workflows/mobile-ci.yml@main
    with:
      project_type: flutter
      flutter_version: "${detectedFlutterVersion}"
      build_ios: ${buildIos}
      run_deploy: false
    secrets: inherit
`;
      break;
  }

  // Create .github/workflows directory
  const targetDir = path.join(process.cwd(), '.github', 'workflows');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const targetPath = path.join(targetDir, 'ci.yml');
  fs.writeFileSync(targetPath, yamlContent, 'utf8');
  console.log(`${C_GREEN}✔ Created:${C_RESET} ${C_BOLD}.github/workflows/ci.yml${C_RESET}`);

  if (createNotes) {
    const notesPath = path.join(process.cwd(), 'release_notes.txt');
    if (!fs.existsSync(notesPath)) {
      const defaultNotes = `Release Version:
- New Features:
- Bug Fixes:
`;
      fs.writeFileSync(notesPath, defaultNotes, 'utf8');
      console.log(`${C_GREEN}✔ Created:${C_RESET} ${C_BOLD}release_notes.txt${C_RESET}`);
    }
  }

  console.log(`\n${C_BOLD}${C_GREEN}┌──────────────────────────────────────────────────────────┐${C_RESET}`);
  console.log(`${C_BOLD}${C_GREEN}│${C_RESET}  ${C_BOLD}${C_WHITE}INITIALIZATION SUCCESSFUL! ${C_RESET}                             ${C_BOLD}${C_GREEN}│${C_RESET}`);
  console.log(`${C_BOLD}${C_GREEN}└──────────────────────────────────────────────────────────┘${C_RESET}`);
  console.log(`${C_GRAY}Next steps:${C_RESET}`);
  console.log(`  1. Commit and push .github/workflows/ci.yml`);
  console.log(`  2. Configure secrets in Repository Settings -> Secrets and variables -> Actions\n`);
}

main();
