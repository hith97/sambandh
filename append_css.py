import os

css_content = """

/* BLINKING TEXT */
@keyframes blink-text-anim {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.1; }
}

.blink-text {
  animation: blink-text-anim 1.5s infinite ease-in-out;
}
"""

with open(r"c:\Users\artha\OneDrive\Desktop\Game\src\pages\ChallengePage.css", "a", encoding="utf-8") as f:
    f.write(css_content)
