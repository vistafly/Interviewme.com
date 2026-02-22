# Rotating Text Animation - Implementation Guide

## How It Works
Characters fade in one-by-one with a staggered delay (like a typewriter glow effect), hold for 7 seconds, then quickly fade out as the next phrase fades in. The `.active` class is cycled through each `.rotating-text` element by JavaScript.

---

## Step 1: HTML Structure

Place this wherever you want the animated heading. Write phrases as plain text — the JS wraps each character automatically. Only the first `.rotating-text` gets the `active` class.

```html
<div class="hero-title-visual">
    <span class="title-line">Your static line</span>
    <span class="title-line gradient-text">
        <span class="rotating-text-wrapper">
            <span class="rotating-text active">first phrase here</span>
            <span class="rotating-text">second phrase here</span>
            <span class="rotating-text">third phrase here</span>
            <!-- add as many phrases as you want -->
        </span>
    </span>
</div>
```

---

## Step 2: CSS

Paste into your stylesheet. Designed for dark backgrounds — see customization notes at the bottom for light backgrounds.

```css
/* ============================================
   ROTATING TEXT ANIMATION
   ============================================ */

/* === CONTAINER === */
.hero-title-visual {
    font-size: clamp(2.5rem, 8vw, 6rem);
    font-weight: 700;
    line-height: 1.1;
    letter-spacing: -0.03em;
    margin-bottom: 1.5rem;
    text-align: center;
    width: 100%;
}

/* === TITLE LINES (fade-in on page load) === */
.hero-title-visual .title-line {
    display: block;
    opacity: 0;
    transform: translateY(30px);
    animation: fadeInUp 0.6s ease forwards;
}
.hero-title-visual .title-line:nth-child(1) { animation-delay: 0.5s; }
.hero-title-visual .title-line:nth-child(2) { animation-delay: 0.7s; }

@keyframes fadeInUp {
    to { opacity: 1; transform: translateY(0); }
}

/* === GRADIENT TEXT COLOR === */
.gradient-text {
    background: linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

/* === ROTATING TEXT WRAPPER === */
.rotating-text-wrapper {
    position: relative;
    width: 430px;              /* adjust to fit your longest phrase */
    min-height: 1.3em;
    text-align: center;
    vertical-align: baseline;
}

/* === EACH ROTATING PHRASE === */
.rotating-text {
    display: inline-block;
    white-space: nowrap;
    width: 100%;
    text-align: center;
    -webkit-text-fill-color: initial !important;
    background: linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

/* Non-active phrases stacked behind via absolute positioning */
.rotating-text:not(.active) {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
}

/* === CHARACTER SPANS (default: hidden, fast 0.6s fade-out) === */
.rotating-text .char,
.rotating-text .char-space {
    display: inline-block;
    opacity: 0;
    transform: none !important;
    transition: opacity 0.6s cubic-bezier(0.23, 1, 0.32, 1);
}
.rotating-text .char-space { width: 0.25em; }

/* === ACTIVE STATE: slow 1.8s staggered fade-in + glow === */
.rotating-text.active .char,
.rotating-text.active .char-space {
    transition: opacity 1.8s cubic-bezier(0.23, 1, 0.32, 1);
    opacity: 1;
    transform: none !important;
    text-shadow:
        0 0 30px rgba(255, 255, 255, 0.25),
        0 0 60px rgba(161, 161, 170, 0.15),
        0 0 90px rgba(99, 102, 241, 0.08);
    filter: brightness(1.05);
    will-change: opacity;
}

/* Stagger delay: each character fades in 0.03s after the previous */
.rotating-text.active .char:nth-child(1)  { transition-delay: 0s; }
.rotating-text.active .char:nth-child(2)  { transition-delay: 0.03s; }
.rotating-text.active .char:nth-child(3)  { transition-delay: 0.06s; }
.rotating-text.active .char:nth-child(4)  { transition-delay: 0.09s; }
.rotating-text.active .char:nth-child(5)  { transition-delay: 0.12s; }
.rotating-text.active .char:nth-child(6)  { transition-delay: 0.15s; }
.rotating-text.active .char:nth-child(7)  { transition-delay: 0.18s; }
.rotating-text.active .char:nth-child(8)  { transition-delay: 0.21s; }
.rotating-text.active .char:nth-child(9)  { transition-delay: 0.24s; }
.rotating-text.active .char:nth-child(10) { transition-delay: 0.27s; }
.rotating-text.active .char:nth-child(11) { transition-delay: 0.30s; }
.rotating-text.active .char:nth-child(12) { transition-delay: 0.33s; }
.rotating-text.active .char:nth-child(13) { transition-delay: 0.36s; }
.rotating-text.active .char:nth-child(14) { transition-delay: 0.39s; }
.rotating-text.active .char:nth-child(15) { transition-delay: 0.42s; }
.rotating-text.active .char:nth-child(16) { transition-delay: 0.45s; }
.rotating-text.active .char:nth-child(17) { transition-delay: 0.48s; }
.rotating-text.active .char:nth-child(18) { transition-delay: 0.51s; }
.rotating-text.active .char:nth-child(19) { transition-delay: 0.54s; }
.rotating-text.active .char:nth-child(20) { transition-delay: 0.57s; }

/* === RESPONSIVE === */
@media (max-width: 768px) {
    .rotating-text-wrapper { width: 500px; max-width: 100%; }
}
@media (max-width: 480px) {
    .rotating-text-wrapper { width: 350px; max-width: 100%; }
}
```

---

## Step 3: JavaScript

Place before `</body>` or in a script file that loads after the DOM is ready.

```javascript
(function() {
    var wrapper = document.querySelector('.rotating-text-wrapper');
    if (!wrapper) return;

    var texts = document.querySelectorAll('.rotating-text');
    var currentIndex = 0;

    // Wrap each character in individual spans for per-character animation
    texts.forEach(function(textEl) {
        var original = textEl.textContent;
        var html = '';
        Array.from(original).forEach(function(char) {
            if (char === ' ') {
                html += '<span class="char-space"> </span>';
            } else {
                html += '<span class="char">' + char + '</span>';
            }
        });
        textEl.innerHTML = html;
    });

    // Begin rotating after a 3-second initial delay
    setTimeout(function() {
        setInterval(function() {
            // Remove active from current phrase (triggers fast fade-out)
            texts[currentIndex].classList.remove('active');

            // Advance to next phrase
            currentIndex = (currentIndex + 1) % texts.length;

            // Activate next phrase (triggers slow staggered fade-in)
            texts[currentIndex].classList.add('active');
        }, 7000);  // each phrase stays visible for 7 seconds
    }, 3000);      // wait 3 seconds before first rotation
})();
```

---

## Customizable Parameters

| Parameter | Location | Default | Description |
|---|---|---|---|
| Rotation interval | JS `setInterval` | `7000` (7s) | How long each phrase stays visible |
| Start delay | JS `setTimeout` | `3000` (3s) | Delay before first rotation begins |
| Fade-in speed | CSS `.active .char` transition | `1.8s` | How slowly characters appear |
| Fade-out speed | CSS `.char` transition | `0.6s` | How quickly characters disappear |
| Stagger increment | CSS `nth-child` delays | `0.03s` | Gap between each character's fade-in start |
| Wrapper width | CSS `.rotating-text-wrapper` | `430px` | Should fit your longest phrase |
| Gradient colors | CSS `linear-gradient(...)` | white → gray | Change to match your brand |
| Glow intensity | CSS `text-shadow` on `.active` | White/indigo glow | Adjust or remove for light backgrounds |

---

## Adapting for Light Backgrounds

The default colors/glow are designed for dark backgrounds. For light backgrounds:

1. Change `.gradient-text` and `.rotating-text` gradient to dark colors:
   ```css
   background: linear-gradient(135deg, #1a1a2e 0%, #4a4a6a 100%);
   ```

2. Remove or soften the `text-shadow` glow on `.rotating-text.active .char`

3. Remove `filter: brightness(1.05)`

---

## Adding More Than 20 Characters Per Phrase

If any phrase exceeds 20 characters, add more `nth-child` rules:
```css
.rotating-text.active .char:nth-child(21) { transition-delay: 0.60s; }
.rotating-text.active .char:nth-child(22) { transition-delay: 0.63s; }
/* ... and so on in 0.03s increments */
```
