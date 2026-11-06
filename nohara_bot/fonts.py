"""
NOHARA STORE BOT — Font style engine (nohara_bot/fonts.py)

Same 5 modes as the dashboard (src/data/localesData.ts):
  default_html        -> <b>text</b>
  small_caps_unicode  -> ᴜɴɪᴄᴏᴅᴇ sᴍᴀʟʟ ᴄᴀᴘs
  monospace_code      -> <code>text</code>
  serif_bold_italic   -> 𝐔𝐧𝐢𝐜𝐨𝐝𝐞 𝐁𝐨𝐥𝐝
  italic_editorial    -> <i><b>text</b></i>

IMPORTANT:
  * style_text()  -> plain Unicode only. Safe for BUTTON labels (buttons cannot contain HTML).
  * style_html()  -> for MESSAGE bodies. Escapes HTML and wraps it in Telegram HTML tags.
"""

import html

FONT_MODES = (
    "default_html",
    "small_caps_unicode",
    "monospace_code",
    "serif_bold_italic",
    "italic_editorial",
)

_SMALL_CAPS = dict(zip("abcdefghijklmnopqrstuvwxyz", "ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ"))


def _serif_bold_char(ch: str) -> str:
    if "A" <= ch <= "Z":
        return chr(0x1D400 + ord(ch) - ord("A"))
    if "a" <= ch <= "z":
        return chr(0x1D41A + ord(ch) - ord("a"))
    return ch


def style_text(text: str, mode: str = "default_html") -> str:
    """Plain-text styling (no HTML). Use this for button labels."""
    if not text:
        return ""
    if mode == "small_caps_unicode":
        return "".join(_SMALL_CAPS.get(ch.lower(), ch) for ch in text)
    if mode == "serif_bold_italic":
        return "".join(_serif_bold_char(ch) for ch in text)
    return text


def style_html(text: str, mode: str = "default_html") -> str:
    """Styling for message bodies. Returns Telegram-HTML-safe text."""
    if not text:
        return ""
    styled = html.escape(style_text(text, mode), quote=False)
    if mode == "monospace_code":
        return f"<code>{styled}</code>"
    if mode == "italic_editorial":
        return f"<i><b>{styled}</b></i>"
    if mode == "default_html":
        return f"<b>{styled}</b>"
    return styled  # small caps / serif bold are already visually styled
