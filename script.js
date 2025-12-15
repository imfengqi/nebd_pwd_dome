function none() {
  var error_message = document.getElementById("error_message");
  error_message.style.display = "none";
}

function base64ToBytes(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function textToBytes(text) {
  const encoder = new TextEncoder();
  return encoder.encode(text);
}

function login() {
  var pwd = document.getElementById("pwd").value;

  if (pwd === "") {
    error_message.style.display = "block";
    error_message.innerText = "輸入兌換碼後才能兌換禮物喔！";
    setTimeout(none, 1500);
    return;
  } else {
    async function sha256(str) {
      const buf = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(str)
      );
      return Array.prototype.map
        .call(new Uint8Array(buf), (x) => ("00" + x.toString(16)).slice(-2))
        .join("");
    }

    var hash;

    var pwd_hash =
      "8d194b7db8fe51f9228804f2f1caa0d8842dc94b2d140732c57f8a364c7886a5";

    sha256(pwd).then((hash) => {
      if (hash === pwd_hash) {
        async function aes128CbcDecryptBase64(cipherBase64, keyText, ivHex) {
          const cipherBytes = base64ToBytes(cipherBase64);
          const keyBytes = textToBytes(keyText);
          const ivBytes = new Uint8Array(
            ivHex.match(/.{1,2}/g).map((b) => parseInt(b, 16))
          );

          const cryptoKey = await crypto.subtle.importKey(
            "raw",
            keyBytes,
            { name: "AES-CBC" },
            false,
            ["decrypt"]
          );

          const plainBuffer = await crypto.subtle.decrypt(
            {
              name: "AES-CBC",
              iv: ivBytes,
            },
            cryptoKey,
            cipherBytes
          );

          return new TextDecoder().decode(plainBuffer);
        }

        var decrypted_text = "";

        aes128CbcDecryptBase64(
          "+6JLbxA3TWVXlkFvy6onROqYyazr8tm2KY14bTqCAyU=",
          pwd,
          "0102030405060708090a0b0c0d0e0f10"
        )
          .then((result) => {
            decrypted_text = result;
            var result_box = document.getElementById("result_box");
            result_box.innerText = decrypted_text;
          })
          .catch((error) => {
            console.error("Decryption error:", error);
          });

        var container_box = document.getElementById("container_box");
        var top_box = document.getElementById("top_box");

        top_box.style.display = "block";

        container_box.style.display = "none";
      } else {
        error_message.style.display = "block";
        error_message.innerText = "兌換碼錯誤，請輸入正確的兌換碼！";
        setTimeout(none, 1500);
      }
    });
  }
}

function reset() {
  var container_box = document.getElementById("container_box");
  var top_box = document.getElementById("top_box");
  var pwd_input = document.getElementById("pwd");
  var result_box = document.getElementById("result_box");

  container_box.style.display = "block";
  top_box.style.display = "none";
  pwd_input.value = "";
  result_box.innerText = "";
}
