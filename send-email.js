export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Sadece POST istekleri kabul edilir');

  const { email, firstName, isAttending, dateText, timeText, venue } = req.body;

  if (!email) return res.status(400).json({ error: 'E-posta adresi eksik' });

  const displayDate = dateText || 'Düğün günümüzde';
  const displayTime = timeText ? ` saat ${timeText}` : '';
  const displayVenue = venue ? ` (${venue})` : '';

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Davetiye <onboarding@resend.dev>', 
        to: email,
        subject: 'LCV Onayınız Alındı! 🥂',
        html: `
          <h2>Merhaba ${firstName || 'Değerli Misafirimiz'},</h2>
          <p>LCV formunu doldurduğunuz için teşekkür ederiz.</p>
          <p><strong>Katılım Durumunuz:</strong> ${isAttending ? 'Katılıyorum 🎉' : 'Katılamıyorum 😔'}</p>
          ${isAttending 
            ? `<p>${displayDate}${displayTime} tarihinde${displayVenue} görüşmek üzere!</p>` 
            : '<p>Aramızda olamayacağınız için üzgünüz, güzel dilekleriniz için teşekkür ederiz.</p>'}
        `
      })
    });

    const data = await response.json();
    res.status(response.ok ? 200 : response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}