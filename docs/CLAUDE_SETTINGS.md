# Claude Code Settings

Bu dosya Claude Code için önerilen ayarları içerir.

## Sesli Bildirim Ayarları

**Dosya:** `~/.claude/settings.json`

```json
{
  "enabledPlugins": {
    "agent-orchestration@claude-code-workflows": true
  },
  "model": "sonnet",
  "hooks": {
    "Notification": [
      {
        "matcher": "permission_prompt",
        "hooks": [
          {
            "type": "command",
            "command": "afplay /System/Library/Sounds/Glass.aiff"
          }
        ]
      },
      {
        "matcher": "idle_prompt",
        "hooks": [
          {
            "type": "command",
            "command": "afplay /System/Library/Sounds/Glass.aiff"
          }
        ]
      }
    ]
  }
}
```

## Alternatif Ses Dosyaları (macOS)

Farklı sesler denemek isterseniz:

```bash
/System/Library/Sounds/Submarine.aiff  # Derin ses
/System/Library/Sounds/Ping.aiff       # Kısa ping
/System/Library/Sounds/Hero.aiff       # Dramatik
/System/Library/Sounds/Tink.aiff       # Hafif tink
/System/Library/Sounds/Basso.aiff      # Bas ses
/System/Library/Sounds/Blow.aiff       # Üfleme sesi
```

## Not: AskUserQuestion Bildirimleri

**Sorun:** `AskUserQuestion` tool'u doğrudan Notification hook'unu tetiklemiyor.

**Geçici Çözüm:** Claude Code CLI şu an için AskUserQuestion sırasında otomatik sesli bildirim desteği sunmuyor. Bu gelecek versiyonlarda eklenebilir.

**Alternatifler:**
- iTerm 2 kullanıyorsanız, terminal focus kaybettiğinde otomatik bildirim gösterir
- `permission_prompt` ve `idle_prompt` hook'ları diğer durumlarda çalışır

## GitHub Repository

**URL:** https://github.com/srtnacikgoz/sade-chocolate-design-tool

**Setup:**
```bash
git remote add origin https://github.com/srtnacikgoz/sade-chocolate-design-tool.git
git branch -M main
git push -u origin main
```
