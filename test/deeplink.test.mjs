// Enlaces directos a un producto de la tienda (catálogo de WhatsApp, redes): ?producto=<id>, #/producto/<id> y /producto/<id>.
// Correr: node --test test/deeplink.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../public/tienda/index.html", import.meta.url), "utf8");
const bloque = html.match(/\/\/ <deeplink>([\s\S]*?)\/\/ <\/deeplink>/);
assert.ok(bloque, "falta el bloque <deeplink> en public/tienda/index.html");
const { productoIdDesdeUrl } = new Function(`${bloque[1]}; return { productoIdDesdeUrl };`)();

const ID = "17948634-25d3-4f42-9e79-b1d43a7c4ad6";
const url = (u) => { const x = new URL(u); return { search: x.search, hash: x.hash, pathname: x.pathname }; };

test("?producto=<id>", () => assert.equal(productoIdDesdeUrl(url(`https://www.elguiaya.com/?producto=${ID}`)), ID));
test("#/producto/<id>", () => assert.equal(productoIdDesdeUrl(url(`https://www.elguiaya.com/#/producto/${ID}`)), ID));
test("/producto/<id>", () => assert.equal(productoIdDesdeUrl(url(`https://www.elguiaya.com/producto/${ID}`)), ID));
test("/producto/<id>/ con barra final", () => assert.equal(productoIdDesdeUrl(url(`https://www.elguiaya.com/producto/${ID}/`)), ID));
test("mayúsculas: se normaliza a minúsculas", () => assert.equal(productoIdDesdeUrl(url(`https://www.elguiaya.com/?producto=${ID.toUpperCase()}`)), ID));
test("junto a las etiquetas de campaña", () => {
  assert.equal(productoIdDesdeUrl(url(`https://www.elguiaya.com/?utm_source=whatsapp&producto=${ID}&utm_medium=catalogo`)), ID);
});
test("si hay hash y ?producto a la vez, manda el hash (lo más reciente)", () => {
  const otro = "06c2422f-73e5-4531-9a56-713a20ba31de";
  assert.equal(productoIdDesdeUrl(url(`https://www.elguiaya.com/?producto=${otro}#/producto/${ID}`)), ID);
});
test("la portada no abre nada", () => assert.equal(productoIdDesdeUrl(url("https://www.elguiaya.com/")), null));
test("#cuenta no abre ningún producto", () => assert.equal(productoIdDesdeUrl(url("https://www.elguiaya.com/#cuenta")), null));
test("/cuenta no abre ningún producto", () => assert.equal(productoIdDesdeUrl(url("https://www.elguiaya.com/cuenta")), null));
test("un valor que no es un id válido se ignora (nada de inyectar texto)", () => {
  for (const malo of ["abc", "<script>alert(1)</script>", "../../etc/passwd", "1;DROP TABLE productos", `${ID}'"><img src=x>`, ""]) {
    const r = productoIdDesdeUrl({ search: `?producto=${encodeURIComponent(malo)}`, hash: "", pathname: "/" });
    assert.ok(r === null || r === ID, `valor: ${malo}`);
    if (r !== null) assert.match(r, /^[0-9a-f-]{36}$/);
  }
});
test("el resultado siempre tiene forma de id (36 caracteres hex y guiones) o es null", () => {
  const r = productoIdDesdeUrl(url(`https://www.elguiaya.com/#/producto/${ID}?x=1`));
  assert.match(r, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
});
test("la tienda llama a la lectura de la dirección después de dibujar los productos y al cambiar el hash", () => {
  const init = html.slice(html.indexOf("async function init()"), html.indexOf("function isVideoUrl"));
  assert.ok(init.indexOf("render();") > 0 && init.indexOf("abrirProductoDesdeUrl();") > init.indexOf("render();"));
  assert.ok(html.includes("addEventListener('hashchange', abrirProductoDesdeUrl)"));
});
