import asyncio
import html
import logging
import smtplib
from datetime import datetime, timezone
from email.header import Header
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import settings

logger = logging.getLogger(__name__)


class FoodService:
    """美食点单业务逻辑 — 邮件通知。"""

    @staticmethod
    def _build_email_body(username: str, items: list[dict], note: str) -> str:
        """构建 HTML 格式的订单通知邮件。"""
        now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M (UTC)")
        item_count = sum(it["quantity"] for it in items)

        rows = ""
        for i, it in enumerate(items, 1):
            rows += f"""
            <tr>
                <td style="padding:10px 12px;border-bottom:1px solid #eee;">{i}</td>
                <td style="padding:10px 12px;border-bottom:1px solid #eee;">{html.escape(it['dish_name'])}</td>
                <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:center;">×{it['quantity']}</td>
            </tr>"""

        note_section = ""
        if note:
            note_section = f"""
            <tr>
                <td colspan="3" style="padding:12px;background:#fafafa;border-top:1px solid #ddd;">
                    <strong>📝 备注：</strong>{html.escape(note)}
                </td>
            </tr>"""

        return f"""<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="utf-8"></head>
<body style="font-family:'Microsoft YaHei',Arial,sans-serif;background:#f5f5f5;padding:20px;">
<table style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;width:100%;">
    <tr>
        <td style="background:#e74c3c;color:#fff;padding:24px;text-align:center;">
            <h2 style="margin:0;font-size:22px;">🍽️ 美食专栏 · 新订单</h2>
        </td>
    </tr>
    <tr>
        <td style="padding:20px 24px;">
            <p style="margin:0 0 12px;color:#555;">
                👤 <strong>点单人：</strong>{html.escape(username)}
            </p>
            <p style="margin:0 0 12px;color:#555;">
                📋 <strong>共 {item_count} 道菜品</strong>
            </p>
            <p style="margin:0 0 20px;color:#999;font-size:13px;">
                🕐 {now_str}
            </p>
        </td>
    </tr>
    <tr>
        <td style="padding:0 24px 20px;">
            <table style="width:100%;border-collapse:collapse;">
                <thead>
                    <tr style="background:#f8f8f8;">
                        <th style="padding:10px 12px;text-align:left;border-bottom:2px solid #ddd;">#</th>
                        <th style="padding:10px 12px;text-align:left;border-bottom:2px solid #ddd;">菜品</th>
                        <th style="padding:10px 12px;text-align:center;border-bottom:2px solid #ddd;">数量</th>
                    </tr>
                </thead>
                <tbody>{rows}{note_section}</tbody>
            </table>
        </td>
    </tr>
    <tr>
        <td style="padding:20px 24px;background:#fafafa;text-align:center;color:#999;font-size:12px;">
            此邮件由家庭网站美食专栏自动发送
        </td>
    </tr>
</table>
</body>
</html>"""

    @staticmethod
    async def send_order_email(username: str, items: list[dict], note: str) -> None:
        """通过 QQ SMTP 发送订单通知邮件。

        Raises:
            RuntimeError: SMTP 连接或发送失败时抛出。
        """

        def _sync_send() -> None:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = Header(
                f"【美食专栏】新订单 — {username} · {sum(it['quantity'] for it in items)}道菜品",
                "utf-8",
            ).encode()
            msg["From"] = settings.SMTP_USER
            msg["To"] = settings.SMTP_NOTIFICATION_EMAIL

            html_body = FoodService._build_email_body(username, items, note)
            msg.attach(MIMEText(html_body, "html", "utf-8"))

            try:
                server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15)
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(settings.SMTP_USER, settings.SMTP_NOTIFICATION_EMAIL, msg.as_string())
                server.quit()
            except Exception as e:
                logger.error(f"SMTP send failed: {e}")
                raise RuntimeError(f"邮件发送失败: {e}") from e

        await asyncio.to_thread(_sync_send)
