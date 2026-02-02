# TOOLS.md - Local Notes

Skills define *how* tools work. This file is for *your* specifics — the stuff that's unique to your setup.

---

## What Goes Here

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- API endpoints and services
- Anything environment-specific

---

## Environment

### Machines

```markdown
<!-- Example:
- **mac-studio** → Main workstation, gateway host
- **pi-office** → Raspberry Pi, runs home automation
- **server** → 192.168.1.100, user: admin
-->
```

### SSH Hosts

```markdown
<!-- Example:
- home-server → 192.168.1.100, user: admin
- gateway → ssh exe.dev, then ssh vm-name
-->
```

---

## Devices

### Cameras

```markdown
<!-- Example:
- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered
- backyard → Garden view, night vision
-->
```

### Speakers

```markdown
<!-- Example:
- kitchen-homepod → Kitchen HomePod Mini
- office-sonos → Office Sonos One
- bedroom-echo → Bedroom Echo Dot
-->
```

### Smart Home

```markdown
<!-- Example:
- living-lights → Hue group "Living Room"
- thermostat → Nest, usually set to 21°C
- door-lock → August lock, front door
-->
```

---

## Voice & TTS

### Preferred Voices

```markdown
<!-- Example:
- Default: "Nova" (warm, slightly British)
- Storytelling: "Antoni" (dramatic)
- News: "Rachel" (clear, professional)
-->
```

### Voice Settings

```markdown
<!-- Example:
- ElevenLabs API key: configured in env
- Default output: Kitchen HomePod
- Stability: 0.5, Similarity: 0.75
-->
```

---

## Services & APIs

```markdown
<!-- Example:
- Email: Gmail via himalaya
- Calendar: Google Calendar
- Notes: Apple Notes / Obsidian
- Tasks: Things 3 / Apple Reminders
-->
```

---

## Platform Notes

### macOS

```markdown
<!-- Example:
- Restart gateway: scripts/restart-mac.sh
- Logs: ./scripts/clawlog.sh
- App location: /Applications/OpenClaw.app
-->
```

### iOS/Android

```markdown
<!-- Example:
- iOS device: iPhone 15 Pro
- Prefer real device over simulator
- Team ID: lookup via security find-identity
-->
```

---

## Conventions

```markdown
<!-- Example:
- Timezone: Asia/Ho_Chi_Minh (UTC+7)
- Date format: YYYY-MM-DD
- Time format: 24h
- Language: Vietnamese preferred, English ok
-->
```

---

## Why Separate?

Skills are shared. Your setup is yours.

Keeping them apart means:
- Update skills without losing your notes
- Share skills without leaking your infrastructure
- Keep environment-specific details in one place

---

*Add whatever helps you do your job. This is your cheat sheet.*
