export function buildInviteEmail(params: {
  hostName: string;
  roomId: string;
  inviteLink: string;
}): string {
  const { hostName, roomId, inviteLink } = params;

  return `<!DOCTYPE html>
<html lang="mn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Video Call урилга</title>
</head>
<body style="margin:0;padding:0;background:#0f1419;font-family:Segoe UI,system-ui,sans-serif;color:#e8edf4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f1419;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#1a2332;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:28px 28px 12px;text-align:center;">
              <div style="font-size:32px;line-height:1;">📹</div>
              <h1 style="margin:12px 0 8px;font-size:22px;color:#ffffff;">Video Call урилга</h1>
              <p style="margin:0;color:#8b9cb3;font-size:15px;line-height:1.5;">
                <strong style="color:#e8edf4;">${escapeHtml(hostName)}</strong> таныг
                <strong style="color:#e8edf4;">${escapeHtml(roomId)}</strong> өрөөнд урьж байна.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 24px;text-align:center;">
              <a href="${inviteLink}" style="display:inline-block;background:#3b82f6;color:#ffffff;text-decoration:none;font-weight:600;padding:14px 28px;border-radius:10px;font-size:15px;">
                Нэгдэх
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 28px;">
              <p style="margin:0;color:#8b9cb3;font-size:13px;line-height:1.6;text-align:center;">
                Link ажиллахгүй бол browser дээр хуулна уу:<br>
                <a href="${inviteLink}" style="color:#93c5fd;word-break:break-all;">${inviteLink}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
