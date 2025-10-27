let session = { drugTag: null, userTag: null };

const nameMap = {
  "04:02:EE:52:CD:1E:91": { name: "福岡太郎", type: "drug" },
  "04:DF:37:52:CD:1E:90": { name: "福岡太郎", type: "user" },

  "04:03:AA:52:CD:1E:92": { name: "大分二郎", type: "drug" },
  "04:EE:37:52:CD:1E:93": { name: "大分二郎", type: "user" },

  "04:04:BB:52:CD:1E:94": { name: "佐賀花子", type: "drug" },
  "04:FF:37:52:CD:1E:95": { name: "佐賀花子", type: "user" }
};

const speak = (text) => {
  const utterance = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(utterance);
};

document.getElementById("scan").addEventListener("click", async () => {
  if (!('NDEFReader' in window)) {
    alert("お使いの端末はWeb NFC非対応です");
    return;
  }

  try {
    const reader = new NDEFReader();
    await reader.scan();

    reader.onreading = (event) => {
      const record = event.message.records[0];
      let tagID = "";

      try {
        // Safari対応：Uint8Arrayを文字列に変換
        if (record.recordType === "text") {
          const data = record.data;
          if (data instanceof ArrayBuffer) {
            tagID = new TextDecoder("utf-8").decode(new Uint8Array(data));
          } else if (data instanceof Uint8Array) {
            tagID = new TextDecoder("utf-8").decode(data);
          } else {
            tagID = String(data);
          }
        } else if (record.recordType === "url") {
          tagID = record.data;
        } else {
          alert("読み取れないタグ形式です");
          return;
        }
      } catch (e) {
        console.error("タグ読み取りエラー", e);
        alert("タグの読み取りに失敗しました");
        return;
      }

      const tagInfo = nameMap[tagID];
      if (!tagInfo) {
        speak("不明なタグです");
        document.getElementById("status").innerText = "不明なタグです";
        return;
      }

      if (tagInfo.type === "drug") {
        session.drugTag = tagID;
        speak(`${tagInfo.name}さんのお薬ですね。本人タグを読んでください。`);
        document.getElementById("status").innerText = `薬袋タグを読み取りました: ${tagInfo.name}さん`;
      } else if (tagInfo.type === "user") {
        session.userTag = tagID;
        if (!session.drugTag) {
          speak("先に薬袋タグを読んでください");
          document.getElementById("status").innerText = "薬袋タグを先に読み取ってください";
          session.userTag = null;
          return;
        }

        const drugName = nameMap[session.drugTag].name;
        const userName = tagInfo.name;
        if (drugName === userName) {
          speak(`${userName}さん、正しい利用者です`);
          document.getElementById("status").innerText = `${userName}さん、正しい利用者です`;
        } else {
          speak("違います！薬を戻してください！");
          document.getElementById("status").innerText = `照合失敗！薬を戻してください。`;
        }

        session = { drugTag: null, userTag: null };
      }
    };
  } catch (err) {
    console.error(err);
    alert("NFCが有効か確認してください。iPhoneは画面ONでHTTPSページを使用してください。");
  }
});
