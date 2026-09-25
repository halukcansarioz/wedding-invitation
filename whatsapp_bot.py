import time
import webbrowser
import pyautogui
import pyperclip
from supabase import create_client, Client

# Supabase Bilgileriniz
URL = "https://SİZİN_SUPABASE_PROJENİZ.supabase.co"
KEY = "SİZİN_SERVICE_ROLE_KEY"
supabase: Client = create_client(URL, KEY)

def fetch_guests():
    response = supabase.table("guests").select("*").eq("attendance", "Katılacağım").execute()
    return response.data

def send_whatsapp_broadcast():
    guests = fetch_guests()
    
    templates = {
        "tr": "Merhaba {name} 💍\n\nDavetiyemize LCV bıraktığın için teşekkürler. Senin için {table}. Masa'yı ayırdık.\n\nKapı girişinde okutman gereken bilet (QR) linkin: {link}\n\nSabırsızlıkla bekliyoruz! 🎉",
        "en": "Hello {name} 💍\n\nThank you for RSVPing to our wedding! We have reserved Table {table} for you.\n\nHere is your QR Ticket link for check-in: {link}\n\nCan't wait to celebrate with you! 🎉"
    }

    print(f"Toplam {len(guests)} misafire mesaj gönderimi başlıyor...")

    for guest in guests:
        if not guest.get("phone"):
            continue
            
        lang = "tr" if str(guest["phone"]).startswith(("90", "+90", "05")) else "en"
        safe_name = str(guest["name"]).replace(" ", "%20")
        personal_link = f"https://davetiyem.ai/?guest={safe_name}"
        
        msg = templates[lang].format(
            name=guest["name"],
            table=guest.get("table_number", "Belirsiz"),
            link=personal_link
        )
        
        phone = str(guest['phone']).replace("+", "").replace(" ", "")
        webbrowser.open(f"https://web.whatsapp.com/send?phone={phone}")
        time.sleep(8) 
        
        pyperclip.copy(msg)
        pyautogui.hotkey("ctrl", "v")  # Mac kullanıyorsanız "command", "v" yapın
        time.sleep(1)
        pyautogui.press("enter")
        time.sleep(2)
        
        pyautogui.hotkey("ctrl", "w")  # Mac kullanıyorsanız "command", "w" yapın
        time.sleep(1)

if __name__ == "__main__":
    send_whatsapp_broadcast()