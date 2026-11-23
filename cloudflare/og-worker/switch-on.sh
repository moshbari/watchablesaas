#!/bin/bash
# Switches on per-page share previews for watchable.99dfy.com.
# Turns on Cloudflare's orange cloud for the watchable record + attaches the watchable-og worker.
# If the site stops loading afterwards, it switches everything back automatically.
CFK=$(security find-generic-password -s "cloudflare-global-api-key" -w)
CFE=$(security find-generic-password -s "cloudflare-global-api-key" | sed -n 's/.*"acct"<blob>="\(.*\)"/\1/p')
Z=150583ada03acfef8e4a73a711534513
B=https://api.cloudflare.com/client/v4/zones/$Z
H=(-H "X-Auth-Email: $CFE" -H "X-Auth-Key: $CFK" -H "content-type: application/json")

echo "1/3 attaching the preview worker…"
ROUTE=$(curl -s -X POST "$B/workers/routes" "${H[@]}" -d '{"pattern":"watchable.99dfy.com/*","script":"watchable-og"}' \
  | python3 -c "import json,sys;d=json.load(sys.stdin);print(d['result']['id'] if d['success'] else '')")
R=$(curl -s "$B/dns_records?name=watchable.99dfy.com" "${H[@]}" | python3 -c "import json,sys;print(json.load(sys.stdin)['result'][0]['id'])")

echo "2/3 turning on the orange cloud…"
curl -s -X PATCH "$B/dns_records/$R" "${H[@]}" -d '{"content":"192.0.2.1","proxied":true}' >/dev/null
sleep 10

echo "3/3 checking the live site…"
# ask Cloudflare's own nameserver (public resolvers keep the old address for ~5 min)
for i in $(seq 1 20); do
  IP=$(dig +short watchable.99dfy.com @dave.ns.cloudflare.com | head -1)
  [ -n "$IP" ] && [ "$IP" != "185.158.133.1" ] && [ "$IP" != "192.0.2.1" ] && break
  sleep 3
done
echo "   testing through Cloudflare address $IP"
RV=(--resolve "watchable.99dfy.com:443:$IP")
ok=1
for p in / /letstalk /login /assets/$(curl -s https://watchablesaas.lovable.app/ | grep -oE 'index-[A-Za-z0-9_-]+\.js' | head -1) /og/letstalk.jpg; do
  code=$(curl -s "${RV[@]}" -o /dev/null -w "%{http_code}" "https://watchable.99dfy.com$p")
  echo "   $p → $code"
  [ "$code" = "200" ] || ok=0
done
if curl -s "${RV[@]}" -A "WhatsApp/2.23" https://watchable.99dfy.com/letstalk | grep -q 'og/letstalk.jpg'; then
  echo "   preview tags → OK"
else
  echo "   preview tags → missing"; ok=0
fi

if [ $ok = 1 ]; then
  echo "✅ LIVE — every Watchable page now shares with a picture from its own video."
else
  echo "⚠️ something failed — switching back to how it was…"
  curl -s -X PATCH "$B/dns_records/$R" "${H[@]}" -d '{"content":"185.158.133.1","proxied":false}' >/dev/null
  [ -n "$ROUTE" ] && curl -s -X DELETE "$B/workers/routes/$ROUTE" "${H[@]}" >/dev/null
  echo "↩️ restored. Site is back to normal."
fi
