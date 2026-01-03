# Sade Chocolate Design Tool - AI Work Team

## Project Overview

This is an AI-powered design tool for **Sade Chocolate**, a luxury artisan chocolate brand. The system uses a multi-agent AI work team to generate chocolate box designs, technical drawings, and cost calculations.

---

## Brand Identity

- **Brand**: Sade Chocolate
- **Positioning**: Luxury, artisan, minimalist, premium quality
- **Design Language**: Sofia Coppola aesthetic
- **Color Palette**: Pastel tones, gold foil details, premium textures
- **Target**: Generate technical drawings and visual concepts based on selected box dimensions

---

## AI Work Team (Agents)

| Agent | Role | Responsibilities |
|-------|------|------------------|
| **Trend Analyst** | Content Strategist | Analyzes global luxury chocolate brands (Patchi, Godiva, etc.) for box design inspiration |
| **Visual Designer** | Presentation Specialist | Creates patterns, logo placements, and color palettes for box designs |
| **Technical Draftsman** | Document Specialist | Generates die-line drawings, precise measurements, and fold calculations |
| **Cost Expert** | Data Analyst | Calculates unit costs based on paper type and printing techniques (emboss, foil) |

---

## Skills & Integrations

### SVG Generator Skill
- Generates die-line (bichak izi) SVG code directly
- Output compatible with React rendering on `sadevardiya.web.app`

### Notion MCP Integration
- Auto-saves box versions, revision notes, and costs
- Connects to Obsidian/Notion product development database

### Google Sheets MCP Integration
- Fetches real-time paper and printing prices
- Enables instant cost calculations

---

## Tech Stack

- **Frontend**: React (deployed to Firebase - sadevardiya.web.app)
- **Design Output**: SVG, PDF technical drawings
- **Data Storage**: Notion/Obsidian, Google Sheets
- **AI Framework**: Claude Code with MCP servers

---

## Project Structure

```
/
├── CLAUDE.md              # Project configuration (this file)
├── agents/                # AI agent configurations and prompts
│   ├── trend-analyst/
│   ├── visual-designer/
│   ├── technical-draftsman/
│   └── cost-expert/
├── skills/                # Custom skill definitions
│   └── svg-generator/
├── templates/             # Design templates and patterns
│   ├── box-templates/
│   └── design-patterns/
├── assets/                # Brand assets and resources
│   ├── logos/
│   ├── patterns/
│   └── color-palettes/
├── output/                # Generated designs and documents
│   ├── svg/
│   ├── pdf/
│   └── cost-reports/
├── data/                  # Reference data and configurations
│   ├── pricing/
│   └── materials/
└── docs/                  # Documentation
    └── brand-guidelines/
```

---

## Design Specifications

### Box Types
- Gift boxes (various sizes)
- Truffle boxes
- Bar packaging
- Seasonal collections

### Technical Requirements
- Die-line drawings with fold lines and cut lines
- Bleed areas (3mm standard)
- Metric measurements (mm)
- Print-ready output (CMYK)

### Printing Techniques
- Hot foil stamping (gold, rose gold, silver)
- Embossing/debossing
- Spot UV
- Soft-touch lamination

---

## Workflow

1. **Input**: User selects box dimensions and style preferences
2. **Trend Analysis**: Agent analyzes relevant luxury packaging trends
3. **Visual Design**: Agent creates design concepts and patterns
4. **Technical Drawing**: Agent generates precise die-line SVG
5. **Cost Calculation**: Agent computes production costs
6. **Output**: SVG, PDF, and cost report delivered to user

---

## Commands

- `/design [dimensions]` - Start new box design
- `/cost [material] [technique]` - Calculate production cost
- `/export [format]` - Export current design
- `/analyze [brand]` - Analyze competitor packaging

---

## Notes

- All designs must adhere to Sade Chocolate brand guidelines
- Maintain minimalist aesthetic across all outputs
- Prioritize print feasibility in all technical drawings
