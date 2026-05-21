# MindWeave - Design Specification

## 1. Design Philosophy

### 1.1 Core Design Principles

**Sanctuary First**
- The app should feel like a safe, private space—like a quiet room where you can breathe
- No harsh colors, no aggressive notifications, no judgment
- Every interaction should feel like closing a door on the outside world

**Invisible Technology**
- The AI should feel like gentle wisdom, not a robot
- Technology fades into the background; your words take center stage
- Complexity hidden behind simplicity

**Emotional Honesty**
- Design acknowledges pain without trying to fix it immediately
- Visuals reflect the reality that healing isn't always upward
- Beauty in the difficult moments, not just the happy ones

**Respectful Minimalism**
- Only show what's needed; respect cognitive load during emotional distress
- Generous white space = room to breathe
- Typography does the heavy lifting

---

## 2. Visual Identity

### 2.1 Brand Personality

**Adjectives:** Calm, empathetic, genuine, safe, thoughtful, gentle, strong

**Not:** Clinical, corporate, overly cheerful, childish, complicated, cold

**Mood Board References:**
- Japanese wabi-sabi aesthetic (beauty in imperfection)
- Scandinavian minimalism
- Analog journaling (texture, warmth)
- Twilight/dawn color palette (transitional, hopeful)

### 2.2 Color Palette

**Primary Colors**

```
Twilight Blue (Primary)
#4A5B7C - Main brand color, calm and grounding
Use: Headers, primary buttons, key accents

Soft Lavender (Secondary)
#B8A9C9 - Gentle, healing energy
Use: Secondary actions, highlights, mood indicators

Warm Cream (Background)
#F8F6F1 - Soft, paper-like warmth
Use: Main background, cards, surfaces
```

**Mood Indicator Colors**

```
Deep Blue (Heavy/Sad)
#2D3E50 - For difficult emotional days

Misty Gray (Neutral/Reflective)
#8B95A5 - For contemplative, steady days

Soft Rose (Hopeful/Gentle)
#D4A5A5 - For tender, lighter moments

Pale Gold (Peaceful/Joyful)
#E8D4A0 - For moments of peace and breakthrough

Forest Green (Grounded/Strong)
#6B8E7B - For days of resilience and strength
```

**Functional Colors**

```
Text Primary: #2A2A2A (warm black)
Text Secondary: #6B6B6B (soft gray)
Text Tertiary: #9E9E9E (subtle gray)

Danger/Delete: #C67B7B (muted red, not aggressive)
Success: #7BA37B (soft green)
Warning: #D4A574 (warm amber)

Dividers: #E8E6E1 (barely there)
Shadows: rgba(42, 42, 42, 0.08) (subtle depth)
```

### 2.3 Typography

**Primary Typeface: SF Pro (iOS) / Roboto (Android)**
- System fonts for performance and native feel
- Accessibility built-in

**Display/Headers**
- Weight: Semi-bold (600)
- Size: 28-34pt
- Line height: 1.2
- Letter spacing: -0.5px (slightly tight for elegance)

**Body Text (Journal Entries)**
- Weight: Regular (400)
- Size: 17-18pt (larger for readability during emotional writing)
- Line height: 1.6 (generous for breathing room)
- Letter spacing: 0px

**Secondary Text (Labels, Captions)**
- Weight: Regular (400)
- Size: 13-15pt
- Line height: 1.4
- Color: Text Secondary

**Weekly Story Special Typography**
- Consider: Serif font for story text (Georgia, Lora) to feel more literary
- Creates distinction between raw entries and AI-crafted narrative

### 2.4 Iconography

**Style:** 
- Rounded, soft edges
- 2px stroke weight
- Minimal detail
- Consistent 24x24px grid

**Icon Set Needed:**
- Plus/Add entry
- Mood faces (5 emotional states)
- Calendar
- Story book
- Voice microphone
- Settings gear
- Lock/privacy
- Export/share
- Tag
- Insights/patterns (abstract wave or graph)
- Milestone star
- Back arrow
- Menu

**Custom Illustrations:**
- Hand-drawn feeling, not vector-perfect
- Used sparingly for: empty states, milestones, onboarding
- Warm, human quality

---

## 3. User Interface Components

### 3.1 Navigation Structure

**Tab Bar (Bottom Navigation)**

```
┌─────────────────────────────────────┐
│                                     │
│         (Main Content Area)         │
│                                     │
├─────────────────────────────────────┤
│  ✍️     📖      📊      ⚙️          │
│ Write  Story  Insights Settings     │
└─────────────────────────────────────┘
```

**Tab Details:**
1. **Write (Home)** - Default tab, where user lands
2. **Story** - Access weekly stories and archives
3. **Insights** - Patterns, mood tracking, timeline
4. **Settings** - Privacy, preferences, account

### 3.2 Core Screens Layout

#### Screen 1: Write (Home)

```
┌─────────────────────────────────────┐
│  MindWeave        [Lock Icon] [•••] │ (Header: semi-transparent)
├─────────────────────────────────────┤
│                                     │
│  Thursday, May 21                   │  (Date: large, soft)
│                                     │
│  How are you feeling?               │  (Mood check-in)
│  😢  😟  😐  🙂  😊                 │  (Tap to select)
│                                     │
│ ┌─────────────────────────────────┐ │
│ │                                 │ │
│ │  Start writing...               │ │ (Journal entry field)
│ │                                 │ │ (Expands as user types)
│ │                                 │ │
│ │                                 │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│  [🎤 Voice]  [🏷️ Tags]             │  (Action buttons)
│                                     │
│  ─────────────────────────          │  (Subtle divider)
│                                     │
│  Your Recent Entries                │
│  • Yesterday - "Finding peace in... │  (Preview last 3 entries)
│  • 2 days ago - "Today was hard..." │
│  • May 18 - "Small breakthrough..." │
│                                     │
└─────────────────────────────────────┘
```

**Design Details:**
- **Date** displays prominently but not dominantly
- **Mood selector** appears first to anchor emotional state
- **Text field** has subtle border, expands to fill screen as user types
- **Auto-save indicator** appears faintly at top: "Saved 3 seconds ago"
- **Writing prompt** appears if idle 30 seconds: soft fade-in at bottom
- **Color accent** on selected mood emoji

---

#### Screen 2: Weekly Story

```
┌─────────────────────────────────────┐
│  ← Your Stories                     │
├─────────────────────────────────────┤
│                                     │
│  ✨ Your Week                       │  (Story title)
│  January 15-21, 2026                │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Emotional Journey           │   │  (Visual timeline)
│  │ ▓▓▓░░░▓░░░░░░░░▓▓          │   │  (Color-coded days)
│  │ Mon  Wed  Fri  Sun          │   │
│  └─────────────────────────────┘   │
│                                     │
│  ╭─────────────────────────────╮   │  (Story card)
│  │ This week, you carried      │   │
│  │ something heavy—the weight  │   │
│  │ of what might have been...  │   │  (Serif font, larger)
│  │                             │   │
│  │ [Read Full Story →]         │   │
│  ╰─────────────────────────────╯   │
│                                     │
│  Key Themes                         │
│  • Self-compassion                  │
│  • Walking as medicine              │
│  • Non-linear healing               │
│                                     │
│  ─────────────────────────          │
│                                     │
│  Previous Stories                   │
│  📖 Jan 8-14: The Week of...       │
│  📖 Jan 1-7: Beginning Again        │
│                                     │
└─────────────────────────────────────┘
```

**Design Details:**
- **Emotional journey visualization** is abstract, not clinical
- **Story preview** shows first 3 lines in beautiful typography
- **Full story view** (next screen) has:
  - Generous margins (20% left/right)
  - Soft gradient background
  - Serif font at 19pt
  - Section breaks with subtle ornaments
  - Sidebar with insights that slides in
- **Save/Share buttons** at bottom of full story
- **Regenerate option** (🔄) for different narrative style

---

#### Screen 3: Insights (Patterns)

```
┌─────────────────────────────────────┐
│  Insights                    [Filter]│
├─────────────────────────────────────┤
│                                     │
│  Your Journey                       │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  21 days of writing         │   │  (Streak card)
│  │  ✨ Keep going              │   │
│  └─────────────────────────────┘   │
│                                     │
│  Emotional Patterns                 │
│  ┌─────────────────────────────┐   │
│  │ 📊 Mood Over Time           │   │  (Chart card)
│  │                             │   │
│  │     ╱╲    ╱╲               │   │  (Line graph)
│  │    ╱  ╲  ╱  ╲              │   │
│  │ ──╱────╲╱────╲────         │   │
│  │  Week 1  Week 2  Week 3     │   │
│  └─────────────────────────────┘   │
│                                     │
│  Recent Insights                    │
│  ┌─────────────────────────────┐   │
│  │ 💡 You've mentioned "walk"  │   │  (Insight card)
│  │    8 times this month. It   │   │
│  │    seems to help you feel   │   │
│  │    grounded.                │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🌱 Your entries are getting │   │
│  │    longer—you're opening up.│   │
│  └─────────────────────────────┘   │
│                                     │
│  [View Full Timeline →]             │
│                                     │
└─────────────────────────────────────┘
```

**Design Details:**
- **Cards-based layout** for scannability
- **Charts** use brand colors, simplified (not complex graphs)
- **Insights** written in warm, human language
- **Timeline view** (next screen) shows all entries on visual calendar
- **Mood dots** on each day of calendar (color-coded)
- **Tap any day** to see entry preview

---

#### Screen 4: Full-Screen Writing Mode

```
┌─────────────────────────────────────┐
│  [✕] Done                           │  (Minimal header)
├─────────────────────────────────────┤
│                                     │
│  Thursday, May 21                   │  (Date, centered)
│  😐 Reflective                      │  (Selected mood)
│                                     │
│                                     │
│                                     │
│  Today I noticed...                 │  (User's writing)
│                                     │
│  |                                  │  (Cursor)
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│  ─────────────────────────          │
│  💭 Writing Prompt:                 │  (Appears after 30s idle)
│  "What would you tell your          │
│  yesterday self?"                   │
│                                     │
└─────────────────────────────────────┘
```

**Design Details:**
- **Triggered** when user taps into text field from home
- **Immersive** - hides all UI except Done and date
- **Background** softly blurred or single color
- **Word count** appears subtly if user wants it (toggle in settings)
- **AI reflection option** appears at bottom when Done is pressed
- **Haptic feedback** on save

---

### 3.3 Component Library

#### Button Styles

**Primary Button**
```
┌─────────────────┐
│  Continue       │  Background: Twilight Blue
└─────────────────┘  Text: White
                     Border Radius: 12px
                     Height: 50px
                     Font: Semi-bold 17pt
                     Shadow: Subtle
```

**Secondary Button**
```
┌─────────────────┐
│  Maybe Later    │  Background: Transparent
└─────────────────┘  Text: Twilight Blue
                     Border: 1.5px Twilight Blue
                     Border Radius: 12px
                     Height: 50px
```

**Text Button**
```
Skip for now      Text: Text Secondary
                  No border/background
                  Underline on press
```

#### Card Component

**Standard Card**
```
╭─────────────────────────────╮
│ [Icon]  Card Title          │  Background: White
│                             │  Border Radius: 16px
│ Body text goes here with    │  Padding: 20px
│ comfortable line height     │  Shadow: Soft, elevated
│                             │
│ [Action Button]             │
╰─────────────────────────────╯
```

**Story Card** (Special)
```
╭─────────────────────────────╮
│                             │  Background: Gradient
│   Week of March 15-21       │  (Twilight Blue → Soft Lavender)
│                             │  Border Radius: 20px
│   "This week, you learned   │  Padding: 24px
│   that healing..."          │  Text: White
│                             │  Shadow: Medium
│   [Read Story →]            │
│                             │
╰─────────────────────────────╯
```

#### Input Field

**Text Input (Journal Entry)**
```
┌─────────────────────────────┐
│ Start writing...            │  Background: White (light mode)
│                             │  or #2A2A2A (dark mode)
│                             │  Border: 1px #E8E6E1
│                             │  Border Radius: 12px
│                             │  Padding: 16px
│                             │  Font: 17pt Regular
│                             │  Focus: Border → Twilight Blue
└─────────────────────────────┘
```

#### Mood Selector

```
😢    😟    😐    🙂    😊
Heavy  Sad  Okay  Good  Great

Unselected: opacity 0.4, grayscale
Selected: opacity 1.0, scale 1.2, color accent glow
```

#### Loading States

**Writing Prompt Generating**
```
┌─────────────────────────────┐
│  ✨ Finding the right        │  Background: Soft gradient
│     words for you...         │  Animation: Gentle pulse
│                             │  Icon: Subtle rotation
└─────────────────────────────┘
```

**Weekly Story Generating**
```
╭─────────────────────────────╮
│  📖 Weaving your week        │  Background: Card
│     into a story...          │  Progress: Dots animation
│                             │  Duration: ~5-8 seconds
│  ● ● ●                      │
╰─────────────────────────────╯
```

---

## 4. Interaction Design

### 4.1 Micro-interactions

**Mood Selection**
- Tap: Scale up to 1.2x, add soft glow
- Haptic: Light impact feedback
- Animation: 200ms ease-out

**Save Entry**
- Auto-save: Subtle "Saved" text fades in/out at top
- Manual save: Checkmark animation, haptic success
- Duration: 300ms

**AI Response Arrival**
- Card slides up from bottom
- Gentle bounce on entry
- Notification haptic (medium impact)
- Duration: 400ms

**Story Unlock**
- Sunday evening: Push notification
- Open app: Story card pulses gently
- Tap to open: Fade transition to full story
- Confetti animation on first weekly story milestone

**Writing Prompt Appearance**
- After 30s idle: Fade in from bottom
- Subtle animation on prompt icon
- Easy to dismiss with downward swipe

### 4.2 Gestures

**Swipe Right (on entry list)**
- Action: Quick view entry preview
- Visual: Card slides partially right, preview appears

**Swipe Left (on entry list)**
- Action: Delete confirmation
- Visual: Red background reveals, "Delete" text appears

**Pull Down to Refresh**
- On Story tab: Check for new weekly story
- On Insights: Update pattern analysis
- Animation: Soft spinner, not aggressive

**Long Press (on entry)**
- Action: Quick actions menu (Edit, Delete, Export, Add to Favorites)
- Visual: Card lifts, menu appears below with blur background

**Pinch to Zoom (in full story view)**
- Action: Adjust text size
- Persists as user preference

### 4.3 Animations & Transitions

**Screen Transitions**
```
Standard: Slide from right (iOS style)
Modal: Slide up from bottom
Dismiss: Slide down or fade out
Duration: 300-350ms
Easing: ease-in-out
```

**Loading Animations**
```
Primary: Pulsing dots (● ● ●)
Secondary: Fade in skeleton screens
No spinners: Too clinical
```

**Success States**
```
Checkmark: Draw animation (stroke-dashoffset)
Confetti: Particles on milestones (use sparingly)
Glow: Soft radial gradient pulse
```

**Emotional Animations**
```
Heavy day selected: Subtle rain particle effect (optional)
Joyful day: Soft light rays
General principle: Subtle, never distracting
```

---

## 5. Dark Mode

### 5.1 Dark Mode Palette

```
Background Primary: #1A1A1A (warm black)
Background Secondary: #2A2A2A (cards)
Background Tertiary: #3A3A3A (elevated cards)

Text Primary: #F8F6F1 (cream white)
Text Secondary: #B8B8B8 (soft gray)
Text Tertiary: #8A8A8A (subtle gray)

Accent Colors: Same as light mode (they work in both)
Dividers: rgba(255, 255, 255, 0.08)
Shadows: rgba(0, 0, 0, 0.5) (stronger in dark mode)
```

### 5.2 Dark Mode Adjustments

**General Rules:**
- Reduce white to prevent eye strain (use cream tones)
- Increase contrast for readability
- Soften bright accent colors slightly (reduce saturation by 10%)
- Shadows become more pronounced

**Specific Components:**
- Journal entry field: #2A2A2A background, #F8F6F1 text
- Cards: Elevated with stronger shadows
- Story gradient: Darker twilight shades
- Mood emojis: Slight glow effect for visibility

**Toggle:**
- System default recommended
- Manual toggle in Settings
- Smooth transition animation (500ms fade)

---

## 6. Accessibility

### 6.1 WCAG Compliance

**Color Contrast**
- All text: Minimum 4.5:1 (AA standard)
- Large text (18pt+): Minimum 3:1
- Test all mood indicator colors for contrast

**Touch Targets**
- Minimum: 44x44px (Apple) / 48x48dp (Android)
- Spacing: 8px minimum between tappable elements
- Buttons: 50px height minimum

**Typography**
- Support Dynamic Type (iOS) / Font Scaling (Android)
- Test layouts at 200% text size
- Maintain readability with line height 1.5+

### 6.2 Assistive Technology

**Screen Reader Support**
- All interactive elements labeled
- Mood emojis: "Mood selector, currently feeling reflective"
- AI responses: "Insight from MindWeave"
- Story sections: Proper heading hierarchy

**VoiceOver / TalkBack**
- Custom rotor actions for quick navigation
- Announcement when entry auto-saves
- Reading order optimized for screen readers

**Voice Control**
- All buttons have spoken names
- Journal entry: "Start writing" voice command
- Navigation: "Go to Story tab" works

### 6.3 Inclusive Design

**Cognitive Accessibility**
- Simple language throughout
- One primary action per screen
- Progress indicators for multi-step flows
- Undo option for destructive actions

**Motion Sensitivity**
- Respect "Reduce Motion" system setting
- Disable animations when enabled
- Use fade/opacity instead of movement

**Color Blindness**
- Don't rely solely on color for mood indicators
- Add shapes/patterns as backup
- Test with color blindness simulators

---

## 7. Responsive Design

### 7.1 Screen Sizes

**Small Phones (iPhone SE, 320-375px width)**
- Reduce padding slightly (16px → 12px)
- Stack elements vertically
- Smaller font sizes (scale down 1-2pt)
- Hide secondary navigation labels, show icons only

**Standard Phones (375-414px width)**
- Default design target
- All components at standard sizes

**Large Phones (414-428px width)**
- Slightly larger comfortable text
- More generous spacing
- Side margins increase

**Tablets (768px+ width)**
- Two-column layout on Insights/Story tabs
- Master-detail view (list on left, content on right)
- Journal entry gets max-width constraint (600px) centered

### 7.2 Orientation

**Portrait (Primary)**
- All features fully accessible
- Optimized layout

**Landscape (Secondary)**
- Full-screen writing mode removes date/mood selector for max space
- Tab bar remains at bottom
- Story view becomes two-column (timeline left, story right)

---

## 8. Onboarding Design

### 8.1 First Launch Flow

**Screen 1: Welcome**
```
┌─────────────────────────────────────┐
│                                     │
│         ✨                          │  (Large icon)
│                                     │
│      Welcome to                     │
│      MindWeave                      │  (Brand name)
│                                     │
│  Your safe space to write,          │  (Value prop)
│  reflect, and heal                  │
│                                     │
│                                     │
│  ┌───────────────────────────────┐ │
│  │      Get Started              │ │  (Primary button)
│  └───────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

**Screen 2: Privacy**
```
┌─────────────────────────────────────┐
│  [Back]                    1 of 3   │
├─────────────────────────────────────┤
│                                     │
│         🔒                          │
│                                     │
│  Your words, your space             │
│                                     │
│  • End-to-end encryption            │
│  • Data stays on your device        │
│  • You control everything           │
│  • Delete anytime, no questions     │
│                                     │
│  ┌───────────────────────────────┐ │
│  │      I Understand             │ │
│  └───────────────────────────────┘ │
│                                     │
│  Learn more about privacy           │  (Text link)
│                                     │
└─────────────────────────────────────┘
```

**Screen 3: AI Introduction**
```
┌─────────────────────────────────────┐
│  [Back]                    2 of 3   │
├─────────────────────────────────────┤
│                                     │
│         🤖✨                        │
│                                     │
│  Meet your AI companion             │
│                                     │
│  MindWeave uses AI to:              │
│  • Transform your entries into      │
│    weekly stories                   │
│  • Recognize patterns in your       │
│    emotional journey                │
│  • Offer gentle reflections         │
│    (only if you want)               │
│                                     │
│  How much AI support do you want?   │
│                                     │
│  ○ Full - All AI features           │
│  ● Moderate - Weekly stories only   │  (Recommended)
│  ○ Minimal - Just journaling        │
│                                     │
│  ┌───────────────────────────────┐ │
│  │      Continue                 │ │
│  └───────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

**Screen 4: Your Journey Starts**
```
┌─────────────────────────────────────┐
│                          3 of 3     │
├─────────────────────────────────────┤
│                                     │
│         ✍️                          │
│                                     │
│  What brings you here?              │
│  (Optional - helps us understand    │
│  your journey)                      │
│                                     │
│  ○ Heartbreak or relationship       │
│  ○ Grief or loss                    │
│  ○ Anxiety or stress                │
│  ○ Life transition                  │
│  ○ Just want to journal             │
│  ○ Prefer not to say                │
│                                     │
│  ┌───────────────────────────────┐ │
│  │      Start Writing            │ │
│  └───────────────────────────────┘ │
│                                     │
│  Skip this step                     │  (Text link)
│                                     │
└─────────────────────────────────────┘
```

**Design Details:**
- **Progress indicator** (1 of 3) keeps user oriented
- **Skip option** always available - no pressure
- **Illustrations** are warm and simple, not overwhelming
- **Copy** is conversational, not corporate
- **Animations** between screens: Gentle fade + slide

---

## 9. Empty States

### 9.1 First Entry (No Entries Yet)

```
┌─────────────────────────────────────┐
│                                     │
│         ✍️                          │
│                                     │
│  Your journey starts here           │
│                                     │
│  There's no right way to journal.   │
│  Just write what's on your mind.    │
│                                     │
│  Some people write:                 │
│  • Stream of consciousness          │
│  • Specific events from the day     │
│  • Letters to themselves            │
│  • Whatever needs to come out       │
│                                     │
│  ┌───────────────────────────────┐ │
│  │   Write Your First Entry      │ │
│  └───────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

### 9.2 Story Tab (No Stories Yet)

```
┌─────────────────────────────────────┐
│                                     │
│         📖                          │
│                                     │
│  Your first story arrives Sunday    │
│                                     │
│  Write at least 3 entries this      │
│  week to unlock your weekly story.  │
│                                     │
│  Progress: ■■□□□□□ 2 of 3          │
│                                     │
│  Keep going—your story is waiting.  │
│                                     │
└─────────────────────────────────────┘
```

### 9.3 Insights (Not Enough Data)

```
┌─────────────────────────────────────┐
│                                     │
│         📊                          │
│                                     │
│  Building your insights...          │
│                                     │
│  We need at least 7 days of writing │
│  to spot meaningful patterns.       │
│                                     │
│  Days journaled: 3 of 7             │
│                                     │
│  ■■■□□□□                           │
│                                     │
└─────────────────────────────────────┘
```

---

## 10. Error States & Edge Cases

### 10.1 Error Messages

**Network Error (Story Generation)**
```
┌─────────────────────────────┐
│  ⚠️ Couldn't generate story │  Background: Warning color
│                             │  (Warm Amber)
│  Check your connection and  │
│  try again.                 │
│                             │
│  [Retry]  [Cancel]          │
└─────────────────────────────┘
```

**Save Failed**
```
┌─────────────────────────────┐
│  ⚠️ Entry not saved          │  Appears at top, slides down
│                             │
│  [Retry]  [Save Locally]    │  Auto-dismisses in 5s if saved
└─────────────────────────────┘
```

**Design Principles:**
- Never blame the user
- Always offer a solution or next step
- Use warm, understanding language
- Include relevant actions (Retry, Contact Support)

### 10.2 Edge Cases

**Very Long Entry (5000+ words)**
- No limit imposed, but warning appears:
- "This entry is getting long! Consider splitting into multiple days for better insights."

**No Mood Selected**
- Entry saves anyway
- Mood shows as "Not tracked" in insights
- Gentle reminder next time: "Tracking your mood helps spot patterns"

**Multiple Entries Same Day**
- All entries saved
- Combined into single day view
- Story generation uses all entries from that day

**Skipped Days in Week**
- Story still generates if at least 2 entries exist
- Acknowledges gaps: "You took breaks this week—that's okay too."

---

## 11. Settings Screen Design

```
┌─────────────────────────────────────┐
│  ← Settings                         │
├─────────────────────────────────────┤
│                                     │
│  PRIVACY                            │
│  ┌───────────────────────────────┐ │
│  │ 🔒 Face ID / Passcode    [ON]│ │
│  ├───────────────────────────────┤ │
│  │ ☁️  Cloud Backup         [OFF]│ │
│  ├───────────────────────────────┤ │
│  │ 📤 Export All Entries      → │ │
│  └───────────────────────────────┘ │
│                                     │
│  AI FEATURES                        │
│  ┌───────────────────────────────┐ │
│  │ 🤖 AI Involvement: Moderate  →│ │
│  ├───────────────────────────────┤ │
│  │ 💬 Reflective Responses  [ON]│ │
│  ├───────────────────────────────┤ │
│  │ 💡 Pattern Insights      [ON]│ │
│  ├───────────────────────────────┤ │
│  │ ✍️  Writing Prompts      [ON]│ │
│  └───────────────────────────────┘ │
│                                     │
│  NOTIFICATIONS                      │
│  ┌───────────────────────────────┐ │
│  │ 🔔 Daily Reminders       [ON]│ │
│  │    Time: 8:00 PM           → │ │
│  ├───────────────────────────────┤ │
│  │ 📖 Weekly Story Ready    [ON]│ │
│  └───────────────────────────────┘ │
│                                     │
│  APPEARANCE                         │
│  ┌───────────────────────────────┐ │
│  │ 🌓 Dark Mode: Auto          →│ │
│  ├───────────────────────────────┤ │
│  │ 📝 Text Size: Medium        →│ │
│  └───────────────────────────────┘ │
│                                     │
│  ACCOUNT                            │
│  ┌───────────────────────────────┐ │
│  │ 👤 Account Details          →│ │
│  ├───────────────────────────────┤ │
│  │ 💳 Subscription: Free       →│ │
│  ├───────────────────────────────┤ │
│  │ ❓ Help & Support           →│ │
│  └───────────────────────────────┘ │
│                                     │
│  ─────────────────────────          │
│  Delete All Data                    │  (Destructive action)
│                                     │
└─────────────────────────────────────┘
```

---

## 12. Premium Upgrade Screen

```
┌─────────────────────────────────────┐
│  [✕]                                │
├─────────────────────────────────────┤
│                                     │
│         ✨ Upgrade                  │
│                                     │
│  Unlock your full healing journey   │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ ✓ Unlimited AI reflections   │ │
│  │ ✓ Multiple story styles       │ │
│  │ ✓ Monthly deep insights       │ │
│  │ ✓ Unlimited history           │ │
│  │ ✓ Cloud backup & sync         │ │
│  │ ✓ Export as beautiful PDF     │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ 💎 Annual - $39.99            │ │  (Recommended badge)
│  │    ($3.33/month)              │ │
│  │    [Select]                   │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ 💳 Monthly - $4.99            │ │
│  │    [Select]                   │ │
│  └───────────────────────────────┘ │
│                                     │
│  7-day free trial • Cancel anytime  │
│                                     │
│  Continue with Free                 │  (Text link)
│                                     │
└─────────────────────────────────────┘
```

**Design Details:**
- Not aggressive or pushy
- Emphasizes value, not pressure
- "Continue with Free" always visible
- Shows pricing transparently
- Free trial builds trust

---

## 13. Animations Specifications

### 13.1 Entry Save Animation

```
Trigger: User presses Done or auto-save occurs
Duration: 800ms total

0ms    - Checkmark icon appears (scale 0 → 1)
100ms  - "Saved" text fades in
200ms  - Subtle success haptic
600ms  - Text fades out
800ms  - Complete

Easing: ease-out
```

### 13.2 Weekly Story Unlock

```
Trigger: Sunday evening or manual refresh
Duration: 1200ms total

0ms    - Push notification sends
User opens app:
0ms    - Story card appears with shimmer effect
300ms  - Pulse animation (scale 1 → 1.05 → 1)
600ms  - Gentle glow around card
User taps card:
0ms    - Card expands to full screen
400ms  - Story text fades in line by line
800ms  - Timeline visualization draws in
1200ms - Complete, scrolling enabled

Easing: ease-in-out
```

### 13.3 Mood Selection

```
Trigger: User taps mood emoji
Duration: 200ms

0ms   - Scale: 1 → 1.2
50ms  - Opacity other emojis: 1 → 0.4
100ms - Glow appears around selected
150ms - Light haptic feedback
200ms - Complete

Easing: ease-out
```

---

## 14. Illustration Style Guide

### 14.1 Visual Style

**Characteristics:**
- Hand-drawn quality (not vector-perfect)
- Soft, organic shapes
- Limited color palette (2-3 colors max per illustration)
- Minimal detail, maximum emotion
- Slightly abstract (not photorealistic)

**Themes:**
- Growth (plants sprouting, trees)
- Journey (winding paths, horizons)
- Light (sunrise, candles, gentle glow)
- Connection (hands, embracing figures)
- Nature (water, sky, earth elements)

**When to Use:**
- Empty states (encouragement)
- Milestones (celebration)
- Onboarding (welcome)
- Error states (reassurance)

**When NOT to Use:**
- During active writing (distraction)
- In weekly stories (text is the hero)
- Too frequently (dilutes impact)

### 14.2 Example Illustration Needs

1. **Welcome illustration:** Person sitting with journal, surrounded by soft light
2. **First entry empty state:** Open book with a quill, gentle invitation
3. **Weekly story ready:** Constellation of stars forming a story arc
4. **7-day milestone:** Small plant with 7 leaves
5. **30-day milestone:** Blooming flower
6. **Error state:** Gentle rain cloud with silver lining

---

## 15. Copy Tone & Voice

### 15.1 Writing Principles

**Voice Attributes:**
- Warm, not clinical
- Encouraging, not pushy
- Honest, not toxic positivity
- Friend, not therapist
- Gentle, not passive

**Do's:**
✅ "This week was heavy. You showed up anyway."
✅ "Healing isn't linear—and that's okay."
✅ "Your words matter. Keep writing."
✅ "Take your time. We'll be here."

**Don'ts:**
❌ "Great job staying positive!" (toxic positivity)
❌ "You must journal daily!" (pressure)
❌ "Based on your data..." (clinical)
❌ "Your mental health score is..." (gamification of pain)

### 15.2 Key Phrases Library

**Encouragement:**
- "You're doing the work."
- "Keep going."
- "This matters."
- "You showed up."

**Acknowledgment:**
- "Some weeks are heavy."
- "It's okay to struggle."
- "Healing takes time."
- "You don't have to be okay."

**Growth Recognition:**
- "Look how far you've come."
- "You're learning."
- "Something shifted."
- "You're different now."

**Invitations:**
- "What's on your mind?"
- "Write what needs to come out."
- "Tell me about today."
- "How are you, really?"

---

## 16. Design Handoff Specifications

### 16.1 Asset Export Requirements

**Icons:**
- Format: SVG + PNG (@1x, @2x, @3x)
- Color: Single color (will be themed)
- Size: 24x24px base
- Naming: `icon_[name]_[variant].svg`

**Illustrations:**
- Format: SVG (scalable)
- Colorspace: RGB
- Naming: `illus_[context]_[state].svg`

**Images/Photos (if any):**
- Format: WebP (primary), JPEG fallback
- Compression: Optimized for mobile
- Naming: `img_[description]_[size].webp`

### 16.2 Design Tokens (Code Reference)

```json
{
  "colors": {
    "twilight_blue": "#4A5B7C",
    "soft_lavender": "#B8A9C9",
    "warm_cream": "#F8F6F1",
    "text_primary": "#2A2A2A",
    "text_secondary": "#6B6B6B"
  },
  "typography": {
    "display": {
      "size": "28pt",
      "weight": 600,
      "lineHeight": 1.2
    },
    "body": {
      "size": "17pt",
      "weight": 400,
      "lineHeight": 1.6
    }
  },
  "spacing": {
    "xs": "4px",
    "sm": "8px",
    "md": "16px",
    "lg": "24px",
    "xl": "32px"
  },
  "radius": {
    "sm": "8px",
    "md": "12px",
    "lg": "16px",
    "xl": "20px"
  }
}
```

### 16.3 Figma File Structure

```
📁 MindWeave Design System
  📁 1. Brand
    - Colors
    - Typography
    - Logo & Icons
  📁 2. Components
    - Buttons
    - Cards
    - Input Fields
    - Navigation
  📁 3. Screens
    - Onboarding
    - Home/Write
    - Story
    - Insights
    - Settings
  📁 4. Flows
    - First Time User
    - Daily Writing
    - Weekly Story Generation
  📁 5. Assets
    - Icons
    - Illustrations
    - Empty States
```

---

## 17. Platform-Specific Considerations

### 17.1 iOS Specific

**Native Elements:**
- Use SF Symbols where possible (system icons)
- Adopt iOS navigation patterns (back button, modal sheets)
- Haptic feedback on key interactions
- Face ID / Touch ID integration
- ShareSheet for export

**iOS Guidelines Compliance:**
- Tab bar at bottom (not top)
- Large titles where appropriate
- Pull-to-refresh
- Swipe gestures match iOS patterns

### 17.2 Android Specific

**Material Design Adaptation:**
- Use Material icons
- Floating Action Button (FAB) for new entry
- Navigation drawer option (alongside bottom nav)
- Material ripple effects
- Fingerprint / Face unlock integration

**Android Guidelines Compliance:**
- Back button handling
- Status bar theming
- Adaptive icons
- Edge-to-edge where appropriate

### 17.3 Responsive Considerations

**Foldable Devices:**
- Adapt to dual-screen layouts
- Story on one half, insights on other half
- Graceful degradation to single screen

**Tablet Optimizations:**
- Side-by-side layouts
- Larger text remains readable at distance
- Keyboard shortcuts (if hardware keyboard)

---

## 18. Success Metrics for Design

### 18.1 Usability Metrics

- **Time to First Entry:** <2 minutes from download
- **Completion Rate:** >80% finish onboarding
- **Daily Return Rate:** >40% open app daily in first week
- **Feature Discovery:** >60% use AI features within first week
- **Error Rate:** <5% encounter errors or get stuck

### 18.2 Emotional Response Metrics

- **Trust:** >85% feel safe writing intimate thoughts
- **Motivation:** >70% feel motivated to continue after weekly story
- **Clarity:** >90% understand what each feature does
- **Delight:** >50% describe experience as "calming" or "beautiful"

### 18.3 Design Quality Indicators

- **Load Time:** All screens <2 seconds
- **Animation Smoothness:** 60fps on all interactions
- **Accessibility Score:** 100% WCAG AA compliance
- **Crash-Free Rate:** >99.5%

---

## 19. Future Design Considerations

### 19.1 Phase 2 Features (Design Prep)

**Therapist Portal**
- Separate interface for professionals
- Client permission management
- Read-only journal access with highlights
- Insight sharing mechanism

**Community Stories (Anonymous)**
- Card-based feed of anonymized weekly stories
- Opt-in sharing
- Supportive comments (heavily moderated)
- Theme-based grouping

**Guided Programs**
- 30-day challenges (e.g., "Gratitude Journey")
- Structured prompts
- Progress tracking
- Certificate/completion milestone

### 19.2 Experimental Features

**Voice Journaling Expansion**
- Record audio entries
- AI transcribes + analyzes tone of voice
- Optional: Keep audio alongside text

**Photo Integration**
- Attach photos to entries
- AI describes emotional content of photo
- Creates visual timeline

**Biometric Integration**
- Optional: Connect to health data
- Correlate sleep/activity with mood
- Insights: "You felt better on days you walked more"

---

## 20. Design Principles Summary

### The MindWeave Design Manifesto

1. **Safety First, Always**
   Every design decision asks: Does this feel safe?

2. **Respect the Weight**
   We're designing for people in pain. No flippancy, no rush, no pressure.

3. **AI is a Companion, Not a Solution**
   Technology supports, it doesn't fix. Humans heal themselves.

4. **Beauty in Honesty**
   We don't sugarcoat hard days. We honor them.

5. **Invisible by Default**
   The best design gets out of the way of the writing.

6. **Progress, Not Perfection**
   We celebrate showing up, not achieving arbitrary goals.

7. **Privacy is Sacred**
   If we have to choose between a feature and privacy, privacy wins.

8. **Every Word Matters**
   Copy is design. Tone is design. Silence is design.

---

**Document Version:** 1.0  
**Last Updated:** May 21, 2026  
**Design Owner:** Design Team  
**Status:** Design Specification Complete
