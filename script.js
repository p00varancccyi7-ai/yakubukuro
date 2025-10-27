let firstUser = null; // 薬袋タグで読み取ったIDを保持

// 読み取りボタン押下でNFCスキャン開始
document.getElementById("scan").addEventListener("click", async () => {
  try {
    const reader = new NDEFReader();
    await reader.scan();

    reader.onreading = (event) => {
      const tagID = new TextDecoder().decode(event.message.records[0].data);
      
      // 1枚目のタグ（薬袋）
      if (!firstUser) {
        firstUser = tagID;
        // IDから名前を取得する台帳
        const nameMap = {
          "04:02:EE:52:CD:1E:91": "福岡太郎"
        };
        const userName = nameMap[tagID] || "不明な利用者";

        // 音声読み上げ
        speechSynthesis.speak(new SpeechSynthesisUtterance(`${userName}さんのお薬ですね。本人タグを読んでください。`));

        // 画面表示
        document.getElementById("status").innerText = `薬袋タグを読み取りました: ${userName}さん。次に本人タグを読んでください。`;

      } else { // 2枚目のタグ（本人）
        const nameMap = {
          "04:DF:37:52:CD:1E:90": "福岡太郎"
        };
        const userName = nameMap[tagID] || "不明な利用者";

        if (firstUser === "04:02:EE:52:CD:1E:91" && tagID === "04:DF:37:52:CD:1E:90") {
          speechSynthesis.speak(new SpeechSynthesisUtterance("正しい利用者です"));
          document.getElementById("status").innerText = `${userName}さん、正しい利用者です。`;
        } else {
          speechSynthesis.speak(new SpeechSynthesisUtterance("違います！薬を戻してください！"));
          document.getElementById("status").innerText = `照合失敗！薬を戻してください。`;
        }

        firstUser = null; // 次回の読み取りに備えてリセット
      }
    };

  } catch (err) {
    alert("NFCが有効か確認してください");
  }
});
