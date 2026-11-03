"""Decrypt the content inside index.html to src/data.json. Usage: NONGPAK_PW=... python3 tools/extract.py"""
import os, json, gzip, base64, hashlib, re, sys
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
pw=os.environ.get("NONGPAK_PW") or sys.exit("set NONGPAK_PW")
s=open(os.path.join(ROOT,"index.html"),encoding="utf-8").read()
e=json.loads(re.search(r'const ENC=(\{.*?\});',s).group(1))
key=hashlib.pbkdf2_hmac("sha256",pw.encode(),base64.b64decode(e["s"]),e["n"],32)
o=json.loads(gzip.decompress(AESGCM(key).decrypt(base64.b64decode(e["iv"]),base64.b64decode(e["d"]),None)))
json.dump(o,open(os.path.join(ROOT,"src/data.json"),"w",encoding="utf-8"),ensure_ascii=False,indent=1)
print("wrote src/data.json")
