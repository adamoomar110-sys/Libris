import os
print("Script started...")
import sys
import uvicorn
from pyngrok import ngrok, conf
import threading
import time
import socket

# --- CONFIGURATION ---
PORT = 8001  # Different port for Libris
# Reuse Amori's token if available or let ngrok manage it
NGROK_AUTH_TOKEN = "38IbyMFFZNBfyHUuqpDbZTPgIn0_6KyYqSjYSgFBy8gzRGEqw" 

def start_ngrok_thread():
    print("Waiting for server to start before opening tunnel...")
    time.sleep(5) 
    
    try:
        addr = f"127.0.0.1:{PORT}"
        print(f"Connecting Ngrok to {addr}...")
        
        # Configure ngrok with auth token
        ngrok.set_auth_token(NGROK_AUTH_TOKEN)
        
        public_url = ngrok.connect(addr).public_url
        print("\n" + "="*60)
        print(f" LIBRIS GLOBAL URL:  {public_url}")
        print("="*60 + "\n")
        print(f"Open this URL on your Android phone to use Libris!")
        print(f"Server is running locally on port {PORT}")
        print("Detailed logs will appear below:")
        
        print(f"Creating local QR code...")
        try:
            import qrcode
            qr = qrcode.QRCode()
            qr.add_data(public_url)
            qr.print_ascii()
        except ImportError:
            pass
            
    except Exception as e:
        print(f"\nCRITICAL ERROR starting Ngrok: {e}")
        print("-" * 60)

def get_local_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('10.255.255.255', 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()
    return IP

if __name__ == "__main__":
    try:
        # We don't necessarily want to kill ngrok global, but for this script ensuring clean slate is ok
        # However, if both apps run, we shouldn't kill globally. 
        # Removing ngrok.kill() or scoped to this process would be better, but pyngrok is global.
        # Let's keep it simple: assume user runs one "Share" session or doesn't mind restart.
        # actually, let's COMMENT OUT ngrok.kill() to allow running both simultaneously if user wants.
        # ngrok.kill() 
            
        backend_dir = os.path.join(os.path.dirname(__file__), "backend")
        sys.path.append(backend_dir)
        
        # Start Ngrok
        t = threading.Thread(target=start_ngrok_thread)
        t.daemon = True
        t.start()
        
        print(f"Starting Libris Server on port {PORT}...")
        local_ip = get_local_ip()
        local_url = f"http://localhost:{PORT}"
        print(f"Local access: {local_url} or http://{local_ip}:{PORT}")

        # Auto-open browser
        import webbrowser
        def open_browser():
            print("Opening browser in 3 seconds...")
            time.sleep(3)
            webbrowser.open(local_url)
        
        wb_thread = threading.Thread(target=open_browser)
        wb_thread.daemon = True
        wb_thread.start()
        
        os.chdir(backend_dir)
        
        # Run Uvicorn
        uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=False)
    except Exception as e:
        print("\n" + "!"*60)
        print(f"FATAL ERROR: {e}")
        print("!"*60 + "\n")
        import traceback
        traceback.print_exc()
    finally:
        print("\nApp exited. Press Enter to close window...")
        input()
