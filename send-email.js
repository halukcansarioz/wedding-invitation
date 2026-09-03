export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Sadece POST istekleri kabul edilir');

  const { email, firstName, isAttending } = req.body;

  if (!email) return res.status(400).json({ error: 'E-posta adresi eksik' });

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Davetiye <onboarding@resend.dev>', // Başlangıç için Resend test adresi
        to: email,
        subject: 'LCV Onayınız Alındı! 🥂',
        html: `
          <h2>Merhaba ${firstName},</h2>
          <p>LCV formunu doldurduğun için teşekkür ederiz.</p>
          <p><strong>Katılım Durumun:</strong> ${isAttending ? 'Katılıyorum 🎉' : 'Katılamıyorum 😔'}</p>
          ${isAttending ? '<p>07 Ağustos 2027 saat 19:00\'da görüşmek üzere!</p>' : '<p>Aramızda olamayacağın için üzgünüz.</p>'}
        `
      })
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}