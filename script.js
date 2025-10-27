// 1枚目タグ（薬袋）を保持
let firstUser = null;

// タグIDと名前の台帳（薬袋・本人タグ両方登録）
const nameMap = {
  "04:02:EE:52:CD:1E:91": "福岡太郎", // 薬袋タグ
  "04:DF:37:52:CD:1E:90": "福岡太郎"  // 本人タグ
};

// 読み取りボタンを押したときの処理
document.getElementById("scan").addEventListener("click", async () => {
  try {
    const reader = new NDEFReader();
    await reader.scan();

    reader.onreading = (event) => {
      // 読み取ったタグのIDを取得
      const tagID = new TextDecoder().decode(event.message.records[0].data);

      // 名前を台帳から取得
      const userName = nameMap[tagID] || "不明な利用者";

      // 1枚目（薬袋タグ）
      if (!firstUser) {
        firstUser = tagID;
        // 音声読み上げ
        speechSynthesis.speak(new SpeechSynthesisUtterance(`${userName}さんのお薬ですね。本人タグを読んでください。`));
        document.getElementById("status").innerText = `薬袋タグを読み取りました: ${userName}さん。次に本人タグを読んでください。`;

      } else { // 2枚目（本人タグ）
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
