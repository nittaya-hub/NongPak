"""Build index.html from src/app.html + src/data.json.
Usage: NONGPAK_PW=... python3 tools/build.py
src/data.json is plaintext content and is NOT committed (see .gitignore).
Get it back any time with: NONGPAK_PW=... python3 tools/extract.py
"""
import os, json, gzip, base64, hashlib, re, sys, time
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
pw=os.environ.get("NONGPAK_PW") or sys.exit("set NONGPAK_PW")
data=json.load(open(os.path.join(ROOT,"src/data.json"),encoding="utf-8"))
raw=gzip.compress(json.dumps(data,ensure_ascii=False,separators=(",",":")).encode(),9)
salt=os.urandom(16); iv=os.urandom(12); n=150000
key=hashlib.pbkdf2_hmac("sha256",pw.encode(),salt,n,32)
enc={"s":base64.b64encode(salt).decode(),"iv":base64.b64encode(iv).decode(),"n":n,"d":base64.b64encode(AESGCM(key).encrypt(iv,raw,None)).decode()}
tpl=open(os.path.join(ROOT,"src/app.html"),encoding="utf-8").read()
ext_css=open(os.path.join(ROOT,"src/ext.css"),encoding="utf-8").read()
ext_js=open(os.path.join(ROOT,"src/ext.js"),encoding="utf-8").read()
cfg=json.load(open(os.path.join(ROOT,"src/config.json"),encoding="utf-8"))
out=tpl.replace("/*__ENC__*/",json.dumps(enc)).replace("/*__EXTCSS__*/",ext_css).replace("/*__EXTJS__*/","const KOEL_CFG="+json.dumps(cfg)+";\n"+ext_js)
open(os.path.join(ROOT,"index.html"),"w",encoding="utf-8").write(out)
sw=os.path.join(ROOT,"sw.js"); s=open(sw).read()
s=re.sub(r'const C="[^"]*"','const C="koel-%d"'%int(time.time()),s); open(sw,"w").write(s)
print("built index.html",len(out))
