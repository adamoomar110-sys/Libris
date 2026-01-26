import os
print("Script started...")
import sys
import uvicorn
from pyngrok import ngrok, conf
import threading
import time
import socket
import argparse

# --- CONFIGURATION ---
PORT = 8001  # Different port for Libris
# Use the second account token provided by the user
NGROK_AUTH_TOKEN = "38cZZ5NMUYqvzMVhHXOEXmUMPel_7KCxuU4VM6Caf5MQe1TH7" 

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
        print(f"\nWARNING: Ngrok tunnel failed: {e}")
        print("App will still work locally at http://localhost:8001")
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
    parser = argparse.ArgumentParser(description="Start Libris App")
    parser.add_argument('--mode', choices=['web', 'mobile'], default='web', help="Startup mode: 'web' for local PC, 'mobile' for remote access via Ngrok")
    args = parser.parse_args()

    try:
        # Don't kill ngrok automatically, allowing parallel apps
        # ngrok.kill() 
            
        # Ensure backend directory is in path
        if getattr(sys, 'frozen', False):
             # Running as compiled exe
             base_dir = sys._MEIPASS
        else:
             base_dir = os.path.dirname(os.path.abspath(__file__))
             
        backend_dir = os.path.join(base_dir, "backend")
        frontend_dist = os.path.join(base_dir, "frontend", "dist")
        
        # Validate frontend build exists
        if not os.path.exists(frontend_dist):
            print("\n" + "!"*60)
            print("ERROR: Frontend not built!")
            print(f"Expected path: {frontend_dist}")
            print("\nPlease run: cd frontend && npm run build")
            print("!"*60 + "\n")
            input("Press Enter to exit...")
            sys.exit(1)
            
        index_html = os.path.join(frontend_dist, "index.html")
        if not os.path.exists(index_html):
            print("\n" + "!"*60)
            print("ERROR: index.html not found in frontend/dist!")
            print(f"Expected: {index_html}")
            print("!"*60 + "\n")
            input("Press Enter to exit...")
            sys.exit(1)
        
        print(f"Frontend build verified at: {frontend_dist}")
        sys.path.append(backend_dir)
        
        # --- MODE HANDLING ---
        print(f"Starting in {args.mode.upper()} mode...")

        if args.mode == 'mobile':
            # Start Ngrok
            t = threading.Thread(target=start_ngrok_thread)
            t.daemon = True
            t.start()
        
        print(f"Starting Libris Server on port {PORT}...")
        local_ip = get_local_ip()
        local_url = f"http://localhost:{PORT}"
        print(f"Local access: {local_url} or http://{local_ip}:{PORT}")

        # Auto-open browser ONLY IF mode is WEB
        if args.mode == 'web':
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
        # Run Uvicorn
        try:
            uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=False)
        except SystemExit:
            pass
    except OSError as e:
        if e.errno == 10048:
            print("\n" + "!"*60)
            print(f"ERROR: Port {PORT} is already in use!")
            print(f"The App is probably already running in another window.")
            print("Please find and close the existing 'Libris Server' window.")
            print("!"*60 + "\n")
            time.sleep(5)
            # Do not re-raise to avoid ugly traceback
        else:
            raise e
    except Exception as e:
        print("\n" + "!"*60)
        print(f"FATAL ERROR: {e}")
        print("!"*60 + "\n")
        import traceback
        traceback.print_exc()
        input("\nPress Enter to exit...")
    finally:
        # Keep window open for debugging
        pass

